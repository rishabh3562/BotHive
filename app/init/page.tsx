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
import { supabase } from '@/lib/supabase/client';
import { Loader2, CheckCircle2, XCircle, Code, Bot, Building2, MessageSquare, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function InitPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{[key: string]: 'pending' | 'success' | 'error'}>({});
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

  const sqlScripts = {
    schema: `-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('builder', 'recruiter', 'admin')),
  email text NOT NULL,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  tier text NOT NULL,
  status text NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  trial_end timestamptz,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL,
  builder_id uuid REFERENCES auth.users NOT NULL,
  category text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  rating numeric DEFAULT 0,
  reviews_count integer DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id uuid REFERENCES agents ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  helpful_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  budget numeric NOT NULL,
  duration text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  recruiter_id uuid REFERENCES auth.users NOT NULL,
  category text NOT NULL,
  requirements text[] NOT NULL DEFAULT '{}',
  skills text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  deadline timestamptz NOT NULL
);

-- Create proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects ON DELETE CASCADE,
  builder_id uuid REFERENCES auth.users NOT NULL,
  amount numeric NOT NULL,
  duration text NOT NULL,
  cover_letter text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES auth.users NOT NULL,
  receiver_id uuid REFERENCES auth.users NOT NULL,
  content text NOT NULL,
  read boolean DEFAULT false,
  project_id uuid REFERENCES projects,
  created_at timestamptz DEFAULT now()
);`,
    policies: `-- Profiles policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can create their profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Subscriptions policies
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Agents policies
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read approved agents"
  ON agents FOR SELECT
  TO authenticated
  USING (status = 'approved');

CREATE POLICY "Builders can CRUD own agents"
  ON agents FOR ALL
  TO authenticated
  USING (builder_id = auth.uid());

-- Reviews policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Projects policies
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Recruiters can CRUD own projects"
  ON projects FOR ALL
  TO authenticated
  USING (recruiter_id = auth.uid());

-- Proposals policies
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Builders can read and create proposals"
  ON proposals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Builders can create proposals"
  ON proposals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = builder_id);

-- Messages policies
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);`,
    dummyData: `-- Insert dummy agents
INSERT INTO agents (title, description, price, builder_id, category, tags, status)
VALUES 
  ('SmartWrite Pro', 'Advanced AI writing assistant with context-aware suggestions', 299, (SELECT id FROM profiles WHERE email = 'builder@bothive.com'), 'Content Creation', ARRAY['Writing', 'AI Assistant', 'Multilingual'], 'approved'),
  ('DataMind Analytics', 'Enterprise-grade AI analytics platform', 499, (SELECT id FROM profiles WHERE email = 'builder@bothive.com'), 'Data Analysis', ARRAY['Analytics', 'Business Intelligence', 'Machine Learning'], 'approved');

-- Insert dummy projects
INSERT INTO projects (title, description, budget, duration, recruiter_id, category, requirements, skills, deadline)
VALUES 
  ('Custom NLP Model for Healthcare', 'Looking for an AI expert to develop a specialized NLP model', 15000, '3 months', (SELECT id FROM profiles WHERE email = 'recruiter@bothive.com'), 'Natural Language Processing', ARRAY['Experience with medical terminology', 'HIPAA compliance knowledge'], ARRAY['Python', 'TensorFlow', 'NLP'], now() + interval '30 days'),
  ('AI-Powered Financial Forecasting', 'Need to develop an AI system for financial forecasting', 25000, '4 months', (SELECT id FROM profiles WHERE email = 'recruiter@bothive.com'), 'Machine Learning', ARRAY['Financial domain expertise', 'API integration skills'], ARRAY['Python', 'Machine Learning', 'Finance'], now() + interval '60 days');

-- Insert dummy reviews
INSERT INTO reviews (agent_id, user_id, rating, comment)
VALUES 
  ((SELECT id FROM agents WHERE title = 'SmartWrite Pro'), (SELECT id FROM profiles WHERE email = 'recruiter@bothive.com'), 5, 'Excellent writing assistant, highly recommended!'),
  ((SELECT id FROM agents WHERE title = 'DataMind Analytics'), (SELECT id FROM profiles WHERE email = 'recruiter@bothive.com'), 4, 'Great analytics platform with powerful features');`
  };

  const initializeDatabase = async () => {
    setIsLoading(true);
    setStatus({});

    try {
      // Create users and their profiles
      for (const user of dummyUsers) {
        setStatus(prev => ({ ...prev, [user.email]: 'pending' }));
        
        try {
          // Create user in Auth
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: user.email,
            password: user.password,
            options: {
              data: {
                full_name: user.full_name,
              },
            },
          });

          if (authError) throw authError;

          if (authData.user) {
            // Create profile
            const { error: profileError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: authData.user.id,
                  full_name: user.full_name,
                  role: user.role,
                  email: user.email,
                  avatar_url: `https://api.dicebear.com/7.x/avatars/svg?seed=${user.email}`,
                },
              ]);

            if (profileError) throw profileError;

            setStatus(prev => ({ ...prev, [user.email]: 'success' }));
          }
        } catch (error: any) {
          console.error(`Error creating ${user.email}:`, error);
          setStatus(prev => ({ ...prev, [user.email]: 'error' }));
        }
      }

      toast({
        title: "Database Initialized",
        description: "Dummy data has been created successfully.",
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
      const { data: builder } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'builder@bothive.com')
        .single();

      if (!builder) throw new Error('Builder not found');

      const agents = [
        {
          title: 'SmartWrite Pro',
          description: 'Advanced AI writing assistant with context-aware suggestions and multi-language support.',
          price: 299,
          builder_id: builder.id,
          category: 'Content Creation',
          tags: ['Writing', 'AI Assistant', 'Multilingual'],
          status: 'approved',
        },
        {
          title: 'DataMind Analytics',
          description: 'Enterprise-grade AI analytics platform for real-time business intelligence.',
          price: 499,
          builder_id: builder.id,
          category: 'Data Analysis',
          tags: ['Analytics', 'Business Intelligence', 'Machine Learning'],
          status: 'approved',
        },
      ];

      const { error } = await supabase.from('agents').insert(agents);
      if (error) throw error;

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
      const { data: recruiter } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'recruiter@bothive.com')
        .single();

      if (!recruiter) throw new Error('Recruiter not found');

      const projects = [
        {
          title: 'Custom NLP Model for Healthcare',
          description: 'Looking for an AI expert to develop a specialized NLP model for processing medical records.',
          budget: 15000,
          duration: '3 months',
          recruiter_id: recruiter.id,
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
          recruiter_id: recruiter.id,
          category: 'Machine Learning',
          requirements: ['Financial domain expertise', 'API integration skills'],
          skills: ['Python', 'Machine Learning', 'Finance'],
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      const { error } = await supabase.from('projects').insert(projects);
      if (error) throw error;

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
      const { data: agents } = await supabase
        .from('agents')
        .select('id')
        .limit(2);

      const { data: recruiter } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'recruiter@bothive.com')
        .single();

      if (!agents?.length || !recruiter) throw new Error('Agents or recruiter not found');

      const reviews = agents.map((agent) => ({
        agent_id: agent.id,
        user_id: recruiter.id,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
        comment: 'Great AI agent with impressive capabilities!',
        helpful_count: Math.floor(Math.random() * 50),
      }));

      const { error } = await supabase.from('reviews').insert(reviews);
      if (error) throw error;

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
      const { data: users } = await supabase
        .from('profiles')
        .select('id')
        .in('email', ['builder@bothive.com', 'recruiter@bothive.com']);

      if (!users?.length) throw new Error('Users not found');

      const messages = [
        {
          sender_id: users[0].id,
          receiver_id: users[1].id,
          content: 'Hi, I saw your project posting and I\'m interested in discussing it further.',
          read: true,
        },
        {
          sender_id: users[1].id,
          receiver_id: users[0].id,
          content: 'Thanks for reaching out! I\'d love to hear more about your experience.',
          read: false,
        },
      ];

      const { error } = await supabase.from('messages').insert(messages);
      if (error) throw error;

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
              Create dummy users and data for development
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
              SQL Initialization Scripts
            </CardTitle>
            <CardDescription>
              Run these SQL scripts in your Supabase SQL editor to set up the database schema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="schema">
              <TabsList className="mb-4">
                <TabsTrigger value="schema">Schema</TabsTrigger>
                <TabsTrigger value="policies">Policies</TabsTrigger>
                <TabsTrigger value="dummy">Dummy Data</TabsTrigger>
              </TabsList>
              <TabsContent value="schema">
                <pre className="p-4 rounded-lg bg-secondary overflow-auto">
                  <code>{sqlScripts.schema}</code>
                </pre>
              </TabsContent>
              <TabsContent value="policies">
                <pre className="p-4 rounded-lg bg-secondary overflow-auto">
                  <code>{sqlScripts.policies}</code>
                </pre>
              </TabsContent>
              <TabsContent value="dummy">
                <pre className="p-4 rounded-lg bg-secondary overflow-auto">
                  <code>{sqlScripts.dummyData}</code>
                </pre>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}