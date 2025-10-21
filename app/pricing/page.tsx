'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

/**
 * Renders the pricing page containing plan cards with features and CTAs, highlights the most popular plan, and includes a contact-sales section.
 *
 * @returns The pricing page as a JSX element.
 */
export default function PricingPage() {
  const plans = [
    {
      name: 'Basic',
      price: 'Free',
      description: 'Perfect for exploring AI agents',
      features: [
        'Access to marketplace',
        'Basic analytics',
        'Community support',
        '2 active projects',
        'Standard response time',
      ],
      cta: 'Get Started',
      popular: false,
    },
    {
      name: 'Pro',
      price: '$49',
      period: 'per month',
      description: 'For growing businesses',
      features: [
        'Everything in Basic',
        'Advanced analytics',
        'Priority support',
        'Unlimited projects',
        'API access',
        'Custom integrations',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: [
        'Everything in Pro',
        'Dedicated support',
        'Custom AI models',
        'SLA guarantees',
        'Advanced security',
        'Team management',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        className="py-24 px-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div
          className="text-center max-w-3xl mx-auto mb-16"
          variants={fadeIn}
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-muted-foreground">
            Choose the perfect plan for your needs. All plans include a 14-day free trial.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto"
          variants={staggerContainer}
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeIn}
              className="relative"
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="bg-primary text-primary-foreground text-sm font-medium px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <Card className={`${plan.popular ? 'border-primary shadow-lg' : ''}`}>
                <CardHeader>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    {plan.period && (
                      <span className="text-muted-foreground ml-2">{plan.period}</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-3" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/sign-up" className="w-full">
                    <Button
                      className="w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mt-24 text-center max-w-3xl mx-auto"
          variants={fadeIn}
        >
          <h2 className="text-2xl font-bold mb-4">
            Need something different?
          </h2>
          <p className="text-muted-foreground mb-8">
            {'Contact us for custom pricing options and enterprise solutions. We\'re here to help you find the perfect fit for your organization.'}
          </p>
          <Button variant="outline" size="lg">
            Contact Sales
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}