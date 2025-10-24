import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger';
import Stripe from 'stripe';
import { setTimeout } from 'timers/promises';

const relevantEvents = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000; // 1 second

interface SubscriptionData {
  stripe_subscription_id: string;
  user_id: string;
  status: string;
  tier?: string;
  current_period_end: Date;
  cancel_at_period_end: boolean;
  stripe_customer_id: string;
  trial_end: Date | null;
}

class ValidationError extends Error {
  statusCode = 422;
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  statusCode = 404;
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  if (maxRetries < 1) {
    throw new Error(`maxRetries must be >= 1, got ${maxRetries}`);
  }
  
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      logger.warn(`Retry attempt ${attempt} failed`, { 
        error: error instanceof Error ? error.message : String(error),
        attempt,
        maxRetries 
      });
      
      if (attempt < maxRetries) {
        await setTimeout(RETRY_DELAY_MS * Math.pow(2, attempt - 1));
      }
    }
  }
  
  throw lastError || new Error('Unknown error in withRetry');
}

async function getUserByStripeCustomerId(
  supabase: ReturnType<typeof createClient>,
  stripeCustomerId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('stripe_customer_id', stripeCustomerId)
    .single();

  if (error || !data) {
    logger.error('Failed to find user for customer ID', {
      stripeCustomerId,
      error: error?.message || 'No data returned',
      code: error?.code
    });
    return null;
  }
  
  return data.id;
}

function validateSubscriptionData(data: Partial<SubscriptionData>): data is SubscriptionData {
  if (!data.stripe_subscription_id) throw new ValidationError('Missing stripe_subscription_id');
  if (!data.user_id) throw new ValidationError('Missing user_id');
  if (!data.status) throw new ValidationError('Missing status');
  if (!data.stripe_customer_id) throw new ValidationError('Missing stripe_customer_id');
  if (!data.current_period_end) throw new ValidationError('Missing current_period_end');
  
  return true;
}

export async function POST(req: Request) {
  // Return early if Stripe is not configured
  if (!stripe) {
    return NextResponse.json({ message: 'Stripe not configured' }, { status: 503 });
  }

  const body = await req.text();
  const signature = headers().get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const error = err as Error;
    logger.error('Stripe webhook signature verification failed', {
      error: error.message,
      hasSignature: !!signature
    });
    return NextResponse.json({ message: 'Invalid signature' }, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      const supabase = createClient();
      if (!supabase) {
        logger.error('Supabase not configured');
        return NextResponse.json({ message: 'Supabase not configured' }, { status: 503 });
      }
      
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          
          const stripeCustomerId = typeof subscription.customer === 'string'
            ? subscription.customer
            : (subscription.customer as Stripe.Customer | Stripe.DeletedCustomer).id;
          
          // Look up user ID from Stripe customer ID
          const userId = await getUserByStripeCustomerId(supabase, stripeCustomerId);
          
          if (!userId) {
            logger.error('No user found for Stripe customer', {
              stripeCustomerId,
              subscriptionId: subscription.id,
              eventType: event.type
            });
            return NextResponse.json(
              { message: 'User not found for subscription' },
              { status: 404 }
            );
          }
          
          // Prepare subscription data
          const subscriptionData: Partial<SubscriptionData> = {
            stripe_subscription_id: subscription.id,
            user_id: userId,
            status: subscription.status,
            tier: subscription.metadata?.tier,
            current_period_end: new Date(subscription.current_period_end * 1000),
            cancel_at_period_end: subscription.cancel_at_period_end,
            stripe_customer_id: stripeCustomerId,
            trial_end: subscription.trial_end
              ? new Date(subscription.trial_end * 1000)
              : null,
          };
          
          // Validate required fields
          try {
            validateSubscriptionData(subscriptionData);
          } catch (validationError) {
            const errMsg = validationError instanceof Error ? validationError.message : String(validationError);
            throw new ValidationError(`Validation failed for subscription ${subscription.id}: ${errMsg}`);
          }
          
          // Upsert with retry logic
          await withRetry(async () => {
            const { error: dbError } = await supabase
              .from('subscriptions')
              .upsert(subscriptionData as SubscriptionData, {
                onConflict: 'stripe_subscription_id'
              });
              
            if (dbError) {
              logger.error('Failed to upsert subscription', {
                error: dbError.message,
                code: dbError.code,
                details: dbError.details,
                hint: dbError.hint,
                subscriptionId: subscription.id,
                userId,
                customerId: stripeCustomerId,
                eventType: event.type
              });
              throw dbError;
            }
            
            logger.info('Successfully processed subscription', {
              subscriptionId: subscription.id,
              userId,
              status: subscription.status,
              eventType: event.type
            });
          });
          
          break;
        }
        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      const errorMessage = typeof error === 'object' && error && 'message' in (error as any)
        ? String((error as any).message)
        : String(error);
      logger.error('Webhook handler failed', {
        error: errorMessage,
        eventType: event.type,
        subscriptionId: event.data?.object && typeof event.data.object === 'object' && 'id' in event.data.object 
          ? (event.data.object as any).id 
          : undefined,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      // Return appropriate status code based on error type
      const statusCode = error instanceof Error && 'statusCode' in error 
        ? (error as any).statusCode 
        : 500;
      
      return NextResponse.json(
        { 
          message: 'Webhook handler failed',
          error: process.env.NODE_ENV === 'development' ? errorMessage : undefined 
        },
        { status: statusCode }
      );
    }
  }

  return NextResponse.json({ received: true });
}