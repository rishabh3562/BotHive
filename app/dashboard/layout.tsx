'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import {
  LayoutDashboard,
  Bot,
  Users,
  Settings,
  FileText,
  MessageSquare,
  BarChart3,
  Shield,
  LogOut,
  Menu,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface SidebarItem {
  icon: any;
  label: string;
  href: string;
  role: 'builder' | 'recruiter' | 'admin' | 'all';
}

const sidebarItems: SidebarItem[] = [
  {
    icon: LayoutDashboard,
    label: 'Overview',
    href: '/dashboard/builder',
    role: 'builder',
  },
  {
    icon: Bot,
    label: 'My Agents',
    href: '/dashboard/builder/agents',
    role: 'builder',
  },
  {
    icon: BarChart3,
    label: 'Analytics',
    href: '/dashboard/builder/analytics',
    role: 'builder',
  },
  {
    icon: FileText,
    label: 'Contracts',
    href: '/dashboard/builder/contracts',
    role: 'builder',
  },
  {
    icon: MessageSquare,
    label: 'Messages',
    href: '/dashboard/builder/messages',
    role: 'builder',
  },
  {
    icon: LayoutDashboard,
    label: 'Browse Agents',
    href: '/dashboard/recruiter',
    role: 'recruiter',
  },
  {
    icon: Users,
    label: 'My Projects',
    href: '/dashboard/recruiter/projects',
    role: 'recruiter',
  },
  {
    icon: MessageSquare,
    label: 'Messages',
    href: '/dashboard/recruiter/messages',
    role: 'recruiter',
  },
  {
    icon: Shield,
    label: 'Moderation',
    href: '/dashboard/admin',
    role: 'admin',
  },
  {
    icon: Settings,
    label: 'Settings',
    href: '/settings',
    role: 'all',
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, signOut, initialize, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/sign-in');
    }
  }, [user, router, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const filteredItems = sidebarItems.filter(
    (item) => item.role === user.role || item.role === 'all'
  );

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          'fixed top-0 left-0 z-40 w-64 h-screen transition-transform bg-card border-r',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}
      >
        <div className="h-full px-3 py-4 flex flex-col">
          <div className="mb-8 px-4">
            <h2 className="text-lg font-semibold">AI Marketplace</h2>
            <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
          </div>

          <nav className="space-y-1 flex-1">
            {filteredItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-2 text-sm rounded-lg',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-secondary'
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t pt-4 mt-4">
            <div className="px-4 mb-4 flex items-center gap-3">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full"
              />
              <div>
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={cn(
          'transition-all duration-300',
          isSidebarOpen ? 'lg:ml-64' : 'lg:ml-0'
        )}
      >
        {children}
      </div>
    </div>
  );
}