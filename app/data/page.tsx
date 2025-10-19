'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/database';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, Users, Bot, MessageSquare, FileText } from 'lucide-react';

export default function DataPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{
    profiles: any[];
    agents: any[];
    projects: any[];
    messages: any[];
  }>({
    profiles: [],
    agents: [],
    projects: [],
    messages: [],
  });

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        // TODO: Implement proper database operations for fetching all data
        // This is a placeholder for admin/debug purposes
        setData({
          profiles: [],
          agents: [],
          projects: [],
          messages: [],
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Database Overview</h1>
          <p className="text-muted-foreground">
            Current state of the Supabase database
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.profiles.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Agents</CardTitle>
              <Bot className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.agents.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projects</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.projects.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.messages.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Data Tables</CardTitle>
            <CardDescription>
              View and manage database records
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profiles">
              <TabsList>
                <TabsTrigger value="profiles">Profiles</TabsTrigger>
                <TabsTrigger value="agents">Agents</TabsTrigger>
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
              </TabsList>

              <TabsContent value="profiles">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.profiles.map((profile) => (
                      <TableRow key={profile.id}>
                        <TableCell className="font-mono text-xs">{profile.id}</TableCell>
                        <TableCell>{profile.full_name}</TableCell>
                        <TableCell>{profile.email}</TableCell>
                        <TableCell className="capitalize">{profile.role}</TableCell>
                        <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="agents">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.agents.map((agent) => (
                      <TableRow key={agent.id}>
                        <TableCell>{agent.title}</TableCell>
                        <TableCell>${agent.price}</TableCell>
                        <TableCell>{agent.category}</TableCell>
                        <TableCell className="capitalize">{agent.status}</TableCell>
                        <TableCell>{new Date(agent.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="projects">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Deadline</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell>{project.title}</TableCell>
                        <TableCell>${project.budget}</TableCell>
                        <TableCell>{project.duration}</TableCell>
                        <TableCell className="capitalize">{project.status}</TableCell>
                        <TableCell>{new Date(project.deadline).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>

              <TabsContent value="messages">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Sender ID</TableHead>
                      <TableHead>Receiver ID</TableHead>
                      <TableHead>Content</TableHead>
                      <TableHead>Read</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.messages.map((message) => (
                      <TableRow key={message.id}>
                        <TableCell className="font-mono text-xs">{message.sender_id}</TableCell>
                        <TableCell className="font-mono text-xs">{message.receiver_id}</TableCell>
                        <TableCell className="max-w-xs truncate">{message.content}</TableCell>
                        <TableCell>{message.read ? 'Yes' : 'No'}</TableCell>
                        <TableCell>{new Date(message.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}