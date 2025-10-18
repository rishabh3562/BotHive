'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, Code, Bot, Building2, MessageSquare, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function InitPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ [key: string]: 'pending' | 'success' | 'error' }>({});
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const dummyUsers = [
    {
      email: 'admin@bothive.com',
      password: 'admin123',
      full_name: 'Admin User',
      role: 'admin',
    },
    {
      email: 'builder@bothive.com',
      password: 'builder123',
      full_name: 'Sarah Chen',
      role: 'builder',
    },
    {
      email: 'recruiter@bothive.com',
      password: 'recruiter123',
      full_name: 'John Smith',
      role: 'recruiter',
    },
  ];

  const initializeDatabase = async () => {
    setIsLoading(true);
    setStatus({});

    try {
      // Create users and their profiles
      for (const user of dummyUsers) {
        setStatus(prev => ({ ...prev, [user.email]: 'pending' }));

        try {
          // Create user via API
          const response = await fetch('/api/auth/signup', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              password: user.password,
              full_name: user.full_name,
              role: user.role,
              strategy: 'bearer',
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create user');
          }

          setStatus(prev => ({ ...prev, [user.email]: 'success' }));
        } catch (error: any) {
          console.error(`Error creating ${user.email}:`, error);
          setStatus(prev => ({ ...prev, [user.email]: 'error' }));
        }
      }

      toast({
        title: "Database Initialized",
        description: "Dummy users have been created successfully.",
      });
    } catch (error) {
      console.error('Initialization error:', error);
      toast({
        title: "Error",
        description: "Failed to initialize database. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status?: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      default:
        return null;
    }
  };

  const createDummyAgents = async () => {
    setActionLoading('agents');
    try {
      // First, sign in as builder to get token
      const signInResponse = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'builder@bothive.com',
          password: 'builder123',
          strategy: 'bearer',
        }),
      });

      if (!signInResponse.ok) {
        throw new Error('Failed to sign in as builder');
      }

      const { token } = await signInResponse.json();

      const agents = [
        {
          title: 'SmartWrite Pro',
          description: 'Advanced AI writing assistant with context-aware suggestions and multi-language support.',
          price: 299,
          category: 'Content Creation',
          tags: ['Writing', 'AI Assistant', 'Multilingual'],
        },
        {
          title: 'DataMind Analytics',
          description: 'Enterprise-grade AI analytics platform for real-time business intelligence.',
          price: 499,
          category: 'Data Analysis',
          tags: ['Analytics', 'Business Intelligence', 'Machine Learning'],
        },
      ];

      // Create agents
      for (const agent of agents) {
        const response = await fetch('/api/agents', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(agent),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create agent');
        }
      }

      toast({
        title: "Success",
        description: "Dummy agents created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const createDummyProjects = async () => {
    setActionLoading('projects');
    try {
      // First, sign in as recruiter to get token
      const signInResponse = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'recruiter@bothive.com',
          password: 'recruiter123',
          strategy: 'bearer',
        }),
      });

      if (!signInResponse.ok) {
        throw new Error('Failed to sign in as recruiter');
      }

      const { token } = await signInResponse.json();

      const projects = [
        {
          title: 'Custom NLP Model for Healthcare',
          description: 'Looking for an AI expert to develop a specialized NLP model for processing medical records.',
          budget: 15000,
          duration: '3 months',
          category: 'Natural Language Processing',
          requirements: ['Experience with medical terminology', 'HIPAA compliance knowledge'],
          skills: ['Python', 'TensorFlow', 'NLP'],
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          title: 'AI-Powered Financial Forecasting',
          description: 'Need to develop an AI system for accurate financial forecasting and market analysis.',
          budget: 25000,
          duration: '4 months',
          category: 'Machine Learning',
          requirements: ['Financial domain expertise', 'API integration skills'],
          skills: ['Python', 'Machine Learning', 'Finance'],
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      // Create projects
      for (const project of projects) {
        const response = await fetch('/api/projects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(project),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create project');
        }
      }

      toast({
        title: "Success",
        description: "Dummy projects created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const createDummyReviews = async () => {
    setActionLoading('reviews');
    try {
      // First, sign in as recruiter to get token
      const signInResponse = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'recruiter@bothive.com',
          password: 'recruiter123',
          strategy: 'bearer',
        }),
      });

      if (!signInResponse.ok) {
        throw new Error('Failed to sign in as recruiter');
      }

      const { token } = await signInResponse.json();

      // Get agents first
      const agentsResponse = await fetch('/api/agents', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!agentsResponse.ok) {
        throw new Error('Failed to fetch agents');
      }

      const agents = await agentsResponse.json();

      if (!agents.length) {
        throw new Error('No agents found. Create agents first.');
      }

      const reviews = agents.slice(0, 2).map((agent: any) => ({
        agent_id: agent._id,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        comment: 'Great AI agent with impressive capabilities!',
        helpful_count: Math.floor(Math.random() * 50),
      }));

      // Create reviews
      for (const review of reviews) {
        const response = await fetch('/api/reviews', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(review),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create review');
        }
      }

      toast({
        title: "Success",
        description: "Dummy reviews created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  const createDummyMessages = async () => {
    setActionLoading('messages');
    try {
      // First, sign in as builder to get token
      const signInResponse = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'builder@bothive.com',
          password: 'builder123',
          strategy: 'bearer',
        }),
      });

      if (!signInResponse.ok) {
        throw new Error('Failed to sign in as builder');
      }

      const { token } = await signInResponse.json();

      const messages = [
        {
          receiver_id: 'recruiter@bothive.com', // Will be resolved to user ID
          content: 'Hi, I saw your project posting and I\'m interested in discussing it further.',
          read: true,
        },
        {
          receiver_id: 'recruiter@bothive.com',
          content: 'Thanks for reaching out! I\'d love to hear more about your experience.',
          read: false,
        },
      ];

      // Get recruiter user ID
      const usersResponse = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!usersResponse.ok) {
        throw new Error('Failed to fetch users');
      }

      const users = await usersResponse.json();
      const recruiter = users.find((user: any) => user.email === 'recruiter@bothive.com');

      if (!recruiter) {
        throw new Error('Recruiter user not found');
      }

      // Create messages
      for (const message of messages) {
        const response = await fetch('/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...message,
            receiver_id: recruiter._id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to create message');
        }
      }

      toast({
        title: "Success",
        description: "Dummy messages created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Initialize Database</CardTitle>
            <CardDescription>
              Create dummy users and data for development using Mongoose
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {dummyUsers.map((user) => (
                <div key={user.email} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user.email} / {user.password}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">Role: {user.role}</p>
                  </div>
                  {getStatusIcon(status[user.email])}
                </div>
              ))}
            </div>

            <Button
              className="w-full"
              onClick={initializeDatabase}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing Users...
                </>
              ) : (
                'Initialize Users'
              )}
            </Button>

            <Separator />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={createDummyAgents}
                disabled={actionLoading === 'agents'}
                className="w-full"
              >
                {actionLoading === 'agents' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bot className="mr-2 h-4 w-4" />
                )}
                Create Agents
              </Button>

              <Button
                onClick={createDummyProjects}
                disabled={actionLoading === 'projects'}
                className="w-full"
              >
                {actionLoading === 'projects' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Building2 className="mr-2 h-4 w-4" />
                )}
                Create Projects
              </Button>

              <Button
                onClick={createDummyReviews}
                disabled={actionLoading === 'reviews'}
                className="w-full"
              >
                {actionLoading === 'reviews' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Star className="mr-2 h-4 w-4" />
                )}
                Create Reviews
              </Button>

              <Button
                onClick={createDummyMessages}
                disabled={actionLoading === 'messages'}
                className="w-full"
              >
                {actionLoading === 'messages' ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MessageSquare className="mr-2 h-4 w-4" />
                )}
                Create Messages
              </Button>
            </div>

            <p className="text-sm text-muted-foreground text-center">
              Note: This is for development purposes only. Do not use in production.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Database Schema Information
            </CardTitle>
            <CardDescription>
              The database now uses Mongoose with the following collections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="collections">
              <TabsList className="mb-4">
                <TabsTrigger value="collections">Collections</TabsTrigger>
                <TabsTrigger value="auth">Authentication</TabsTrigger>
                <TabsTrigger value="api">API Endpoints</TabsTrigger>
              </TabsList>
              <TabsContent value="collections">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Users</h4>
                    <p className="text-sm text-muted-foreground">User accounts with roles (builder, recruiter, admin)</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Agents</h4>
                    <p className="text-sm text-muted-foreground">AI agents created by builders</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Projects</h4>
                    <p className="text-sm text-muted-foreground">Projects posted by recruiters</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Reviews</h4>
                    <p className="text-sm text-muted-foreground">Reviews for agents</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Messages</h4>
                    <p className="text-sm text-muted-foreground">Messages between users</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Subscriptions</h4>
                    <p className="text-sm text-muted-foreground">User subscription data</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Proposals</h4>
                    <p className="text-sm text-muted-foreground">Proposals from builders to projects</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="auth">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">JWT Authentication</h4>
                    <p className="text-sm text-muted-foreground">Uses JWT tokens with refresh token support</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Two Strategies</h4>
                    <p className="text-sm text-muted-foreground">Bearer tokens and HTTP-only cookies</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Role-Based Access Control</h4>
                    <p className="text-sm text-muted-foreground">builder, recruiter, admin roles with specific permissions</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="api">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold">Authentication</h4>
                    <p className="text-sm text-muted-foreground">/api/auth/signup, /api/auth/signin, /api/auth/refresh, /api/auth/signout</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Agents</h4>
                    <p className="text-sm text-muted-foreground">/api/agents (GET, POST), /api/agents/[id] (GET, PUT, DELETE)</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Projects</h4>
                    <p className="text-sm text-muted-foreground">/api/projects (GET, POST), /api/projects/[id] (GET, PUT, DELETE)</p>
                  </div>
                  <div>
                    <h4 className="font-semibold">Users</h4>
                    <p className="text-sm text-muted-foreground">/api/users (GET), /api/users/[id] (GET, PUT, DELETE)</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}