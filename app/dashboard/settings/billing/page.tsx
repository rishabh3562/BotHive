'use client';

import { useSubscription } from '@/lib/hooks/use-subscription';
import { ManageSubscriptionButton } from '@/components/manage-subscription-button';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { CreditCard, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function BillingPage() {
  const { subscription, loading, error } = useSubscription();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <p className="text-muted-foreground">Failed to load subscription details.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Billing & Subscription</h1>

      <div className="space-y-8">
        {/* Current Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>
              Manage your subscription and billing details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium capitalize">{subscription.tier} Plan</p>
                    <p className="text-sm text-muted-foreground">
                      {subscription.status === 'active' ? (
                        <>
                          Renews on{' '}
                          {format(new Date(subscription.currentPeriodEnd), 'MMMM do, yyyy')}
                        </>
                      ) : (
                        'Subscription inactive'
                      )}
                    </p>
                  </div>
                  <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
                    {subscription.status}
                  </Badge>
                </div>

                <div className="flex items-center space-x-4">
                  <ManageSubscriptionButton />
                  <Button variant="ghost">View Invoice History</Button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <CreditCard className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium">No active subscription</p>
                  <p className="text-sm text-muted-foreground">
                    Choose a plan to get started with our premium features
                  </p>
                </div>
                <Link href="/pricing">
                  <Button>View Plans</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
            <CardDescription>
              Manage your payment methods and billing information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ManageSubscriptionButton />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}