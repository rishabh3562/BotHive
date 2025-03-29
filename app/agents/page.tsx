'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { dummyAgents } from '@/lib/data';
import { Award, MessageSquare, Search, Star, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const categories = [
  'All Categories',
  'Content Creation',
  'Data Analysis',
  'Customer Service',
  'Development',
  'Research',
];

const sortOptions = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'sales', label: 'Best Selling' },
  { value: 'newest', label: 'Latest' },
];

export default function MarketplacePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [sortBy, setSortBy] = useState('popular');

  // Filter and sort agents
  const filteredAgents = dummyAgents
    .filter((agent) => {
      const matchesSearch = agent.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'All Categories' || agent.category === selectedCategory;
      
      const matchesPrice = agent.price >= priceRange[0] && agent.price <= priceRange[1];
      
      return matchesSearch && matchesCategory && matchesPrice;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'sales':
          return b.reviews - a.reviews;
        case 'newest':
          return new Date(b.created).getTime() - new Date(a.created).getTime();
        default: // popular
          return (b.rating * b.reviews) - (a.rating * a.reviews);
      }
    });

  // Featured agents (top 3 by rating and sales)
  const featuredAgents = [...dummyAgents]
    .sort((a, b) => (b.rating * b.reviews) - (a.rating * a.reviews))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Featured Agents */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Featured Agents</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredAgents.map((agent) => (
              <Card key={agent.id} className="relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-primary/10">
                    <Award className="h-4 w-4 mr-1 text-primary" />
                    Featured
                  </Badge>
                </div>
                <CardHeader>
                  <CardTitle>{agent.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{agent.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">{agent.rating}</span>
                      <span className="text-muted-foreground">({agent.reviews} reviews)</span>
                    </div>
                    <span className="text-lg font-bold">${agent.price}</span>
                  </div>
                  <Button 
                    className="w-full"
                    onClick={() => router.push(`/agents/${agent.id}`)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search agents..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="space-y-2">
            <label className="text-sm font-medium">Price Range: ${priceRange[0]} - ${priceRange[1]}</label>
            <Slider
              min={0}
              max={1000}
              step={50}
              value={priceRange}
              onValueChange={setPriceRange}
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger>
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <Card key={agent.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={agent.builder.avatar}
                    alt={agent.builder.name}
                    className="h-8 w-8 rounded-full"
                  />
                  <div>
                    <div className="font-semibold">{agent.builder.name}</div>
                    <div className="text-sm text-muted-foreground">AI Builder</div>
                  </div>
                </div>
                <CardTitle>{agent.title}</CardTitle>
                <CardDescription>{agent.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>{agent.rating}</span>
                      <span className="text-muted-foreground">
                        ({agent.reviews} reviews)
                      </span>
                    </div>
                    <span className="text-lg font-bold">${agent.price}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {agent.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => router.push(`/agents/${agent.id}`)}
                    >
                      View Details
                    </Button>
                    <Button variant="outline" size="icon">
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}