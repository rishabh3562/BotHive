import { AIAgent, Project, Review, User, Proposal, Message, ChatThread } from './types';

export const dummyAgents: AIAgent[] = [
  {
    id: '1',
    title: 'SmartWrite Pro',
    description: 'Advanced AI writing assistant with context-aware suggestions and multi-language support.',
    price: 299,
    builder: {
      id: 'b1',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200',
    },
    category: 'Content Creation',
    tags: ['Writing', 'AI Assistant', 'Multilingual'],
    rating: 4.8,
    reviews: 127,
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000',
    features: [
      'Real-time suggestions',
      'Style adaptation',
      'SEO optimization',
      'Plagiarism detection',
      'Multi-language support',
      'Custom templates',
      'Analytics dashboard',
      'API integration'
    ],
    created: '2024-03-15',
    status: 'approved',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    files: [
      {
        name: 'smartwrite-pro.zip',
        url: '#',
        size: 2500000,
        type: 'application/zip'
      }
    ],
    performance: {
      revenueGrowth: 25.5,
      userSatisfaction: 94,
      responseTime: 0.8,
      uptime: 99.9
    },
    metrics: {
      dailyUsers: [120, 145, 160, 180, 165, 190, 210],
      monthlyRevenue: [8500, 9200, 11000, 12500, 14000, 15500],
      taskCompletion: 98.5
    },
    techStack: [
      'GPT-4',
      'BERT',
      'TensorFlow',
      'Python',
      'Node.js'
    ],
    requirements: {
      cpu: '2 vCPUs',
      memory: '4 GB RAM',
      storage: '10 GB SSD'
    },
    updates: [
      {
        date: '2024-03-15',
        version: '2.1.0',
        changes: [
          'Added support for 10 new languages',
          'Improved response time by 40%',
          'New template system'
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'DataMind Analytics',
    description: 'Enterprise-grade AI analytics platform for real-time business intelligence and predictive modeling.',
    price: 499,
    builder: {
      id: 'b2',
      name: 'Alex Thompson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200',
    },
    category: 'Data Analysis',
    tags: ['Analytics', 'Business Intelligence', 'Machine Learning'],
    rating: 4.9,
    reviews: 84,
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000',
    features: [
      'Real-time analytics',
      'Predictive modeling',
      'Custom dashboards',
      'Data visualization',
      'Automated reporting',
      'API integration',
      'Team collaboration',
      'Export capabilities'
    ],
    created: '2024-03-10',
    status: 'approved',
    videoUrl: 'https://www.youtube.com/watch?v=example2',
    files: [
      {
        name: 'datamind-analytics.zip',
        url: '#',
        size: 3200000,
        type: 'application/zip'
      }
    ],
    performance: {
      revenueGrowth: 32.1,
      userSatisfaction: 96,
      responseTime: 0.6,
      uptime: 99.95
    },
    metrics: {
      dailyUsers: [90, 110, 130, 150, 140, 160, 180],
      monthlyRevenue: [12000, 14500, 16000, 18500, 21000, 24000],
      taskCompletion: 99.2
    },
    techStack: [
      'PyTorch',
      'TensorFlow',
      'scikit-learn',
      'Python',
      'React'
    ],
    requirements: {
      cpu: '4 vCPUs',
      memory: '8 GB RAM',
      storage: '20 GB SSD'
    },
    updates: [
      {
        date: '2024-03-12',
        version: '1.5.0',
        changes: [
          'New predictive modeling features',
          'Enhanced data visualization',
          'Performance improvements'
        ]
      }
    ]
  }
];

export const dummyUsers: User[] = [
  {
    id: 'b1',
    name: 'Sarah Chen',
    role: 'builder',
    email: 'sarah@example.com',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200',
  },
  {
    id: 'r1',
    name: 'John Smith',
    role: 'recruiter',
    email: 'john@example.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200',
  },
  {
    id: 'a1',
    name: 'Admin User',
    role: 'admin',
    email: 'admin@example.com',
    avatar: 'https://images.unsplash.com/photo-1519648023493-d82b5f8d7b8a?q=80&w=200&h=200',
  }
];

export const dummyReviews: Review[] = [
  {
    id: 'rev1',
    agentId: '1',
    userId: 'u1',
    userName: 'Alex Thompson',
    userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200',
    rating: 5,
    comment: 'Absolutely transformed our content creation process. The multi-language support is exceptional.',
    date: '2024-03-18',
    helpful: 24,
    response: {
      from: 'Sarah Chen',
      message: "Thank you for the wonderful review! We're constantly working on improving the language models.",
      date: '2024-03-19'
    }
  },
  {
    id: 'rev2',
    agentId: '2',
    userId: 'u2',
    userName: 'Maria Garcia',
    userAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200',
    rating: 4,
    comment: 'Great tool with impressive capabilities. Would love to see more template options.',
    date: '2024-03-15',
    helpful: 18
  }
];

export const dummyProposals: Proposal[] = [
  {
    id: 'prop1',
    projectId: 'p1',
    builder: {
      id: 'b1',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200',
      rating: 4.9,
      completedProjects: 15,
    },
    amount: 12000,
    duration: '2.5 months',
    coverLetter: 'I have extensive experience in healthcare NLP and HIPAA compliance...',
    status: 'pending',
    created: '2024-03-16',
  },
  {
    id: 'prop2',
    projectId: 'p1',
    builder: {
      id: 'b2',
      name: 'Alex Thompson',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=200&h=200',
      rating: 4.8,
      completedProjects: 12,
    },
    amount: 14000,
    duration: '3 months',
    coverLetter: 'Having worked on similar medical NLP projects...',
    status: 'pending',
    created: '2024-03-17',
  },
];

export const dummyProjects: Project[] = [
  {
    id: 'p1',
    title: 'Custom NLP Model for Healthcare',
    description: 'Looking for an AI expert to develop a specialized NLP model for processing medical records and extracting key insights.',
    budget: 15000,
    duration: '3 months',
    status: 'open',
    recruiter: {
      id: 'r1',
      name: 'John Smith',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200',
    },
    requirements: [
      'Experience with medical terminology',
      'Proven NLP expertise',
      'HIPAA compliance knowledge',
      'Python/TensorFlow proficiency'
    ],
    proposals: [],
    created: '2024-03-15',
    deadline: '2024-04-15',
    category: 'Natural Language Processing',
    skills: ['Python', 'TensorFlow', 'NLP', 'Healthcare'],
  },
  {
    id: 'p2',
    title: 'AI-Powered Financial Forecasting Tool',
    description: 'Need to develop an AI system for accurate financial forecasting and market trend analysis.',
    budget: 25000,
    duration: '4 months',
    status: 'in_progress',
    recruiter: {
      id: 'r2',
      name: 'Emily Johnson',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200',
    },
    requirements: [
      'Financial domain expertise',
      'Machine learning experience',
      'API integration skills',
      'Real-time data processing'
    ],
    proposals: [],
    created: '2024-03-10',
    deadline: '2024-07-10',
    category: 'Machine Learning',
    skills: ['Python', 'Machine Learning', 'Finance', 'API Development'],
  }
];

export const dummyMessages: Message[] = [
  {
    id: 'm1',
    senderId: 'r1',
    receiverId: 'b1',
    content: "Hi Sarah, I'm interested in your proposal for the healthcare NLP project.",
    timestamp: '2024-03-16T10:30:00Z',
    read: true,
    projectId: 'p1',
  },
  {
    id: 'm2',
    senderId: 'b1',
    receiverId: 'r1',
    content: "Thank you for considering my proposal. I'd be happy to discuss the details further.",
    timestamp: '2024-03-16T10:35:00Z',
    read: false,
    projectId: 'p1',
  },
];

export const dummyChatThreads: ChatThread[] = [
  {
    id: 'chat1',
    participants: [
      {
        id: 'r1',
        name: 'John Smith',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&h=200',
      },
      {
        id: 'b1',
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200',
      },
    ],
    lastMessage: {
      content: "Thank you for considering my proposal. I'd be happy to discuss the details further.",
      timestamp: '2024-03-16T10:35:00Z',
      senderId: 'b1',
    },
    unreadCount: 1,
    projectId: 'p1',
  },
];