'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { dummyAgents, dummyReviews } from '@/lib/data';
import { Check, MessageSquare, Star, TrendingUp, Award, Clock, Shield } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function AgentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const agent = dummyAgents.find((a) => a.id === params.id);

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Agent not found</h1>
          <Button className="mt-4" onClick={() => router.push('/agents')}>
            Back to Agents
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        <Button
          variant="ghost"
          className="mb-8"
          onClick={() => router.back()}
        >
          ← Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                {agent.performance.userSatisfaction > 90 && (
                  <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">
                    <Award className="h-4 w-4 mr-1" />
                    Top Rated
                  </Badge>
                )}
                {agent.reviews > 100 && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Popular
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold mb-4">{agent.title}</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <img
                    src={agent.builder.avatar}
                    alt={agent.builder.name}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <div className="font-semibold">{agent.builder.name}</div>
                    <div className="text-sm text-muted-foreground">AI Builder</div>
                  </div>
                </div>
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Builder
                </Button>
              </div>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="tech">Tech Stack</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview">
                <Card>
                  <CardHeader>
                    <CardTitle>About this AI Agent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{agent.description}</p>
                    {agent.videoUrl && (
                      <div className="mt-6">
                        <h3 className="font-semibold mb-2">Demo Video</h3>
                        <div className="aspect-video rounded-lg bg-secondary">
                          <iframe
                            width="100%"
                            height="100%"
                            src={agent.videoUrl.replace('watch?v=', 'embed/')}
                            title="Agent Demo"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="features">
                <Card>
                  <CardHeader>
                    <CardTitle>Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      {agent.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <Check className="h-5 w-5 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tech">
                <Card>
                  <CardHeader>
                    <CardTitle>Technical Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <h3 className="font-semibold mb-2">Tech Stack</h3>
                        <div className="flex flex-wrap gap-2">
                          {agent.techStack.map((tech) => (
                            <Badge key={tech} variant="secondary">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">System Requirements</h3>
                        <ul className="space-y-2 text-sm">
                          <li>CPU: {agent.requirements.cpu}</li>
                          <li>Memory: {agent.requirements.memory}</li>
                          <li>Storage: {agent.requirements.storage}</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Customer Reviews</CardTitle>
                    <CardDescription>
                      {agent.reviews} reviews · {agent.rating} average rating
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {dummyReviews.map((review) => (
                        <div key={review.id} className="border-b pb-6 last:border-0">
                          <div className="flex items-center gap-4 mb-4">
                            <img
                              src={review.userAvatar}
                              alt={review.userName}
                              className="h-10 w-10 rounded-full"
                            />
                            <div>
                              <div className="font-semibold">{review.userName}</div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < review.rating
                                          ? 'text-yellow-500 fill-yellow-500'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span>·</span>
                                <span>{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground">{review.comment}</p>
                          {review.response && (
                            <div className="mt-4 ml-12 p-4 bg-secondary rounded-lg">
                              <div className="font-semibold mb-1">Response from {review.response.from}</div>
                              <p className="text-sm text-muted-foreground">{review.response.message}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div>
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">${agent.price}</CardTitle>
                <CardDescription>One-time purchase</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="font-semibold">{agent.rating}</span>
                  <span className="text-muted-foreground">
                    ({agent.reviews} reviews)
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    <span>Instant delivery</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4" />
                    <span>Lifetime updates</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="h-4 w-4" />
                    <span>Premium support</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Button className="w-full">Purchase Now</Button>
                  <Button variant="outline" className="w-full">
                    Add to Cart
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}