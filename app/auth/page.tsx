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
import { dummyUsers } from '@/lib/data';
import { Bot, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const handleLogin = (role: 'builder' | 'recruiter') => {
    const user = dummyUsers.find((u) => u.role === role);
    if (user) {
      setUser(user);
      router.push(`/dashboard/${role}`);
    }
  };

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
            onClick={() => handleLogin('builder')}>
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
              <Button className="w-full">Continue as Builder</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => handleLogin('recruiter')}>
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
              <Button className="w-full">Continue as Recruiter</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}