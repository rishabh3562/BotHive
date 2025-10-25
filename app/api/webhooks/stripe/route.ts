import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import Stripe from 'stripe';

const relevantEvents = new Set([
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

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
    console.log(`❌ Error message: ${error.message}`);
    return NextResponse.json({ message: error.message }, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
      try {
      const supabase = createClient();
      if (!supabase) {
        console.warn('Supabase not configured for webhook handling');
        return NextResponse.json({ message: 'Supabase not configured' }, { status: 503 });
      }
      
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          
          await supabase
            .from('subscriptions')
            .upsert({
              stripe_subscription_id: subscription.id,
              status: subscription.status,
              tier: subscription.metadata.tier,
              current_period_end: new Date(subscription.current_period_end * 1000),
              cancel_at_period_end: subscription.cancel_at_period_end,
              stripe_customer_id: subscription.customer as string,
              trial_end: subscription.trial_end
                ? new Date(subscription.trial_end * 1000)
                : null,
            });
          
          break;
        }
        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      console.log(error);
      return NextResponse.json(
        { message: 'Webhook handler failed' },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}