'use client';

import { motion } from 'framer-motion';
import { Bot, Users, Star, Shield, Code2, Globe } from 'lucide-react';

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

export default function AboutPage() {
  const stats = [
    { icon: Users, label: 'Active Users', value: '10,000+' },
    { icon: Bot, label: 'AI Agents', value: '500+' },
    { icon: Star, label: 'Average Rating', value: '4.9/5' },
    { icon: Globe, label: 'Countries', value: '50+' },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust & Security',
      description: 'We prioritize the security of our users and their data with enterprise-grade protection.',
    },
    {
      icon: Code2,
      title: 'Innovation',
      description: "Constantly pushing the boundaries of what's possible with AI technology.",
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building a vibrant ecosystem of AI builders and businesses.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <motion.section
        className="py-24 px-6"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div
          className="max-w-3xl mx-auto text-center"
          variants={fadeIn}
        >
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6">
            About BotHive
          </h1>
          <p className="text-xl text-muted-foreground">
            We're building the future of AI-powered solutions by connecting innovative builders
            with forward-thinking businesses.
          </p>
        </motion.div>
      </motion.section>

      {/* Stats Section */}
      <motion.section
        className="py-16 bg-secondary/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                variants={fadeIn}
              >
                <stat.icon className="h-8 w-8 mx-auto mb-4 text-primary" />
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Values Section */}
      <motion.section
        className="py-24 px-6"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeIn}
          >
            <h2 className="text-3xl font-bold mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground">
              The principles that guide everything we do
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                className="text-center p-6 rounded-lg bg-card"
                variants={fadeIn}
              >
                <value.icon className="h-12 w-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Mission Section */}
      <motion.section
        className="py-24 px-6 bg-secondary/30"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <motion.div
          className="max-w-3xl mx-auto text-center"
          variants={fadeIn}
        >
          <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
          <p className="text-xl text-muted-foreground">
            To democratize access to AI technology by creating a thriving marketplace
            where innovative solutions meet real-world needs, empowering both builders
            and businesses to shape the future of automation.
          </p>
        </motion.div>
      </motion.section>
    </div>
  );
}