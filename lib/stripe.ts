import Stripe from 'stripe';

// Make Stripe initialization optional for build-time
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      typescript: true,
    })
  : null;

export const subscriptionPlans = {
  basic: {
    id: 'basic-monthly',
    name: 'Basic Plan',
    description: 'Perfect for getting started',
    price: 29,
    interval: 'month',
    features: [
      'List & buy AI agents',
      'Basic analytics',
      'Email support',
      '2 active projects',
      'Standard API access'
    ],
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || '',
    tier: 'basic'
  },
  pro: {
    id: 'pro-monthly',
    name: 'Pro Plan',
    description: 'For growing businesses',
    price: 99,
    interval: 'month',
    features: [
      'Everything in Basic',
      'Advanced analytics',
      'Priority support',
      'Unlimited projects',
      'Advanced API access',
      'Custom integrations'
    ],
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
    tier: 'pro'
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise Plan',
    description: 'For large organizations',
    price: 499,
    interval: 'month',
    features: [
      'Everything in Pro',
      'Dedicated support',
      'Custom AI solutions',
      'SLA guarantees',
      'Advanced security',
      'Team management'
    ],
    stripePriceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || '',
    tier: 'enterprise'
  }
} as const;