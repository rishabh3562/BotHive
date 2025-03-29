/*
  # Create database schema for AI marketplace

  1. New Tables
    - `agents`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `price` (numeric)
      - `builder_id` (uuid, references auth.users)
      - `category` (text)
      - `tags` (text[])
      - `rating` (numeric)
      - `reviews_count` (integer)
      - `status` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `reviews`
      - `id` (uuid, primary key)
      - `agent_id` (uuid, references agents)
      - `user_id` (uuid, references auth.users)
      - `rating` (integer)
      - `comment` (text)
      - `helpful_count` (integer)
      - `created_at` (timestamptz)

    - `projects`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `budget` (numeric)
      - `duration` (text)
      - `status` (text)
      - `recruiter_id` (uuid, references auth.users)
      - `category` (text)
      - `requirements` (text[])
      - `skills` (text[])
      - `created_at` (timestamptz)
      - `deadline` (timestamptz)

    - `proposals`
      - `id` (uuid, primary key)
      - `project_id` (uuid, references projects)
      - `builder_id` (uuid, references auth.users)
      - `amount` (numeric)
      - `duration` (text)
      - `cover_letter` (text)
      - `status` (text)
      - `created_at` (timestamptz)

    - `messages`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references auth.users)
      - `receiver_id` (uuid, references auth.users)
      - `content` (text)
      - `read` (boolean)
      - `project_id` (uuid, references projects)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

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
);

-- Enable RLS and create policies
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Agents policies
CREATE POLICY "Anyone can read approved agents"
  ON agents FOR SELECT
  TO authenticated
  USING (status = 'approved');

CREATE POLICY "Builders can CRUD own agents"
  ON agents FOR ALL
  TO authenticated
  USING (builder_id = auth.uid());

-- Reviews policies
CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create reviews"
  ON reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Projects policies
CREATE POLICY "Anyone can read projects"
  ON projects FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Recruiters can CRUD own projects"
  ON projects FOR ALL
  TO authenticated
  USING (recruiter_id = auth.uid());

-- Proposals policies
CREATE POLICY "Builders can read and create proposals"
  ON proposals FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Builders can create proposals"
  ON proposals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = builder_id);

-- Messages policies
CREATE POLICY "Users can read their messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() IN (sender_id, receiver_id));

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_agents_builder_id ON agents(builder_id);
CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
CREATE INDEX IF NOT EXISTS idx_reviews_agent_id ON reviews(agent_id);
CREATE INDEX IF NOT EXISTS idx_projects_recruiter_id ON projects(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_proposals_project_id ON proposals(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver ON messages(sender_id, receiver_id);