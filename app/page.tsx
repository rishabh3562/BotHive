'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowRight, Bot, Building2, Code2, Star, Users, Zap, CheckCircle, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const testimonials = [
  {
    name: "Sarah Chen",
    role: "AI Developer",
    company: "TechCorp",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200",
    quote: "BotHive has transformed how I monetize my AI solutions. The platform's reach and tools are exceptional.",
  },
  {
    name: "Michael Rodriguez",
    role: "CTO",
    company: "InnovateAI",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200",
    quote: "Finding the right AI solutions for our needs has never been easier. BotHive is our go-to marketplace.",
  },
];

const partners = [
  "TechCorp",
  "InnovateAI",
  "DataSphere",
  "AIVentures",
  "FutureScale",
  "NeuraTech",
];

export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero Section */}
      <div className="relative isolate">
        {/* Background gradient */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:py-40">
          <motion.div
            className="text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.h1
              className="text-4xl font-bold tracking-tight sm:text-6xl mb-8 bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500"
              variants={fadeIn}
            >
              The Future of AI is Here
            </motion.h1>
            <motion.p
              className="text-lg leading-8 text-muted-foreground mb-8 max-w-2xl mx-auto"
              variants={fadeIn}
            >
              Connect with top AI builders or find the perfect AI agent for your needs.
              Join the revolution in AI-powered solutions.
            </motion.p>
            <motion.div
              className="flex justify-center gap-4"
              variants={fadeIn}
            >
              <Link href="/auth">
                <Button size="lg" className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/agents">
                <Button variant="outline" size="lg" className="gap-2">
                  Browse Agents
                  <Bot className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3 text-center"
              variants={staggerContainer}
            >
              <motion.div variants={fadeIn}>
                <div className="flex justify-center items-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="ml-2 text-2xl font-bold">10,000+</span>
                </div>
                <p className="text-muted-foreground">Active Users</p>
              </motion.div>
              <motion.div variants={fadeIn}>
                <div className="flex justify-center items-center mb-4">
                  <Bot className="h-6 w-6 text-primary" />
                  <span className="ml-2 text-2xl font-bold">500+</span>
                </div>
                <p className="text-muted-foreground">AI Agents</p>
              </motion.div>
              <motion.div variants={fadeIn}>
                <div className="flex justify-center items-center mb-4">
                  <Star className="h-6 w-6 text-primary" />
                  <span className="ml-2 text-2xl font-bold">4.9/5</span>
                </div>
                <p className="text-muted-foreground">Average Rating</p>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Partners Section */}
      <motion.div
        className="py-12 bg-secondary/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-center text-sm font-semibold text-muted-foreground mb-8">
            Trusted by leading companies worldwide
          </p>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-6">
            {partners.map((partner) => (
              <div
                key={partner}
                className="flex justify-center items-center text-lg font-semibold text-muted-foreground/70 hover:text-primary transition-colors"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div
        className="py-24 sm:py-32"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need to succeed
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Whether you're building or recruiting, we've got you covered with a comprehensive platform.
            </p>
          </motion.div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <motion.dl
              className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3"
              variants={staggerContainer}
            >
              <motion.div variants={fadeIn}>
                <Card>
                  <CardHeader>
                    <div className="rounded-lg bg-primary/10 w-fit p-2 mb-4">
                      <Code2 className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>For Builders</CardTitle>
                    <CardDescription>
                      Showcase your AI agents to a global audience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Powerful analytics dashboard
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Secure payment processing
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Marketing tools included
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full group">
                      Learn More
                      <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Card>
                  <CardHeader>
                    <div className="rounded-lg bg-primary/10 w-fit p-2 mb-4">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>For Recruiters</CardTitle>
                    <CardDescription>
                      Find and hire the perfect AI agents
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Advanced search filters
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Verified AI builders
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Secure escrow system
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full group">
                      Learn More
                      <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={fadeIn}>
                <Card>
                  <CardHeader>
                    <div className="rounded-lg bg-primary/10 w-fit p-2 mb-4">
                      <Bot className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle>AI Agents</CardTitle>
                    <CardDescription>
                      Access quality AI solutions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Curated marketplace
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Quality assurance
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Easy integration
                      </li>
                    </ul>
                    <Button variant="outline" className="w-full group">
                      Browse Agents
                      <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.dl>
          </div>
        </div>
      </motion.div>

      {/* Testimonials Section */}
      <motion.div
        className="py-24 sm:py-32 bg-secondary/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center mb-16"
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Loved by builders and recruiters alike
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              See what our community has to say about BotHive
            </p>
          </motion.div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                variants={fadeIn}
                className="relative"
              >
                <Card>
                  <CardContent className="pt-8">
                    <div className="absolute -top-4 left-8">
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        className="h-12 w-12 rounded-full border-4 border-background"
                      />
                    </div>
                    <blockquote className="mt-4">
                      <p className="text-lg text-muted-foreground">"{testimonial.quote}"</p>
                    </blockquote>
                    <div className="mt-4">
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {testimonial.role} at {testimonial.company}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* CTA Section */}
      <motion.div
        className="py-24 sm:py-32"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            className="mx-auto max-w-2xl text-center"
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to get started?
            </h2>
            <p className="mt-6 text-lg leading-8 text-muted-foreground">
              Join thousands of users already transforming their workflows with AI.
            </p>
            <div className="mt-10 flex items-center justify-center gap-6">
              <Button size="lg" className="group">
                Sign Up Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button variant="outline" size="lg" className="group">
                Contact Sales
                <ArrowUpRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}