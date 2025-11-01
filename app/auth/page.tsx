'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { Bot, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function AuthPage() {
  const router = useRouter();
  const { user, initialize, isLoading } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Redirect users who already have a role
  useEffect(() => {
    if (!isLoading && user) {
      if (user.role) {
        // User already has role, redirect to dashboard
        router.push(`/dashboard/${user.role}`);
      }
    } else if (!isLoading && !user) {
      // No user at all, redirect to signin
      router.push('/sign-in');
    }
  }, [user, isLoading, router]);

  const handleRoleSelect = async (role: 'builder' | 'recruiter') => {
    if (isUpdating) return;
    setIsUpdating(true);

    try {
      // Get current session via API
      const sessionResponse = await fetch('/api/auth/session', {
        credentials: 'include',
      });
      const sessionData = await sessionResponse.json();

      if (!sessionResponse.ok || !sessionData.user) {
        router.push('/sign-in');
        return;
      }

      const userId = sessionData.user.id;

      // Update user's role via API
      const updateResponse = await fetch(`/api/database/profiles/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });

      if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        throw new Error(errorData.error || 'Failed to update role');
      }

      // Re-initialize auth to get updated user data
      await initialize();

      // Redirect to appropriate dashboard
      router.push(`/dashboard/${role}`);
    } catch (error: any) {
      console.error('Error setting role:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to set role. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show role selection if user already has a role or isn't logged in
  if (!user || user.role) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold tracking-tight">
            Choose your role
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Select how you want to use the platform
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <Card className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleRoleSelect('builder')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Builder
              </CardTitle>
              <CardDescription>
                Create and sell AI agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled={isUpdating}>
                Continue as Builder
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleRoleSelect('recruiter')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Recruiter
              </CardTitle>
              <CardDescription>
                Find and purchase AI agents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled={isUpdating}>
                Continue as Recruiter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}