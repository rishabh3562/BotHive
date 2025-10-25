import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { subscriptionPlans } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    // Return early if Stripe is not configured
    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
    }

    const supabase = createClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 503 });
    }
    const { searchParams } = new URL(req.url);
    const priceId = searchParams.get('priceId');
    const planId = searchParams.get('planId') as keyof typeof subscriptionPlans;

    if (!priceId || !planId) {
      return NextResponse.json(
        { error: 'Price ID and Plan ID are required' },
        { status: 400 }
      );
    }

    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const plan = subscriptionPlans[planId];

    // Create or retrieve Stripe customer
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', session.user.id)
      .single();

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        metadata: {
          supabase_user_id: session.user.id,
        },
      });
      customerId = customer.id;

      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', session.user.id);
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${headers().get('origin')}/dashboard?success=true`,
      cancel_url: `${headers().get('origin')}/pricing?canceled=true`,
      subscription_data: {
        metadata: {
          tier: plan.tier,
        },
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.log('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}