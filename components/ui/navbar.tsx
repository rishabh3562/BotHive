'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Bot } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function Navbar() {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  // Don't show navbar on auth pages
  if (pathname === '/sign-in' || pathname === '/sign-up' || pathname === '/auth') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Bot className="h-6 w-6" />
          <span>BotHive</span>
        </Link>

        <nav className="flex items-center gap-6 ml-6">
          <Link href="/agents" className="text-sm font-medium hover:text-primary">
            Browse Agents
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:text-primary">
            Pricing
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary">
            About
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {!isLoading && !user ? (
            <>
              <Link href="/sign-in">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Get Started</Button>
              </Link>
            </>
          ) : user ? (
            <Link href={`/dashboard/${user.role}`}>
              <Button variant="ghost">Dashboard</Button>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}