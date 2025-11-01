'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth';
import { dummyChatThreads, dummyMessages } from '@/lib/data';
import { Search, Circle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RecruiterMessagesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [selectedThread, setSelectedThread] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/sign-in');
      } else if (user.role !== 'recruiter') {
        router.push(`/dashboard/${user.role}`);
      }
    }
  }, [user, isLoading, router]);

  // Filter chat threads for the current user
  const myThreads = dummyChatThreads.filter(thread =>
    thread.participants.some(p => p.id === user?.id)
  );

  // Get messages for the selected thread
  const threadMessages = dummyMessages.filter(msg =>
    msg.senderId === user?.id || msg.receiverId === user?.id
  );

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    // TODO: Implement backend message sending
    setMessageInput('');
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with AI builders and manage your conversations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chat List */}
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>
                Your active message threads
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {myThreads.map((thread) => {
                  const otherParticipant = thread.participants.find(
                    p => p.id !== user?.id
                  );
                  
                  return (
                    <div
                      key={thread.id}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedThread === thread.id
                          ? 'bg-secondary'
                          : 'hover:bg-secondary/50'
                      }`}
                      onClick={() => setSelectedThread(thread.id)}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={otherParticipant?.avatar}
                          alt={otherParticipant?.name}
                          className="h-10 w-10 rounded-full"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium truncate">
                              {otherParticipant?.name}
                            </p>
                            {thread.unreadCount > 0 && (
                              <Circle className="h-2 w-2 fill-primary text-primary" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {thread.lastMessage.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Chat Messages */}
          <Card className="md:col-span-2">
            <CardHeader>
              {selectedThread ? (
                <div className="flex items-center gap-3">
                  <img
                    src={myThreads.find(t => t.id === selectedThread)?.participants.find(p => p.id !== user?.id)?.avatar}
                    alt="User avatar"
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <CardTitle>
                      {myThreads.find(t => t.id === selectedThread)?.participants.find(p => p.id !== user?.id)?.name}
                    </CardTitle>
                    <CardDescription>
                      Project: Healthcare NLP Model
                    </CardDescription>
                  </div>
                </div>
              ) : (
                <CardTitle>Select a conversation</CardTitle>
              )}
            </CardHeader>
            <CardContent>
              {selectedThread ? (
                <div className="space-y-8">
                  <div className="space-y-4">
                    {threadMessages.map((message) => {
                      const isMyMessage = message.senderId === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isMyMessage
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary'
                            }`}
                          >
                            <p>{message.content}</p>
                            <p className="text-xs mt-1 opacity-70">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type your message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleSendMessage();
                        }
                      }}
                    />
                    <Button onClick={handleSendMessage}>Send</Button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  Select a conversation to start messaging
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}