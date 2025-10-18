# 🧠 BotHive: AI Agent & Automation Marketplace

[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## 🎯 Vision

BotHive is an open-source marketplace platform where automation builders can showcase and list their AI agents, workflows, and automation tools. Whether you're a builder creating agents for Make, Zapier, n8n, or custom platforms, or a business looking to discover and connect with automation experts—BotHive brings you together.

## 🌟 What Makes BotHive Different

- **Multi-Platform Support**: List agents from Make, Zapier, n8n, Voiceflow, and more
- **Builder-Focused**: Portfolio showcase, analytics, and monetization tools for creators
- **Open Source**: Community-driven development, transparent, and self-hostable
- **Flexible Listing**: Free tier for newcomers, premium features for power users

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL) / MongoDB (flexible provider system)
- **Authentication**: JWT + Supabase Auth
- **Payments**: Stripe
- **UI**: Radix UI + Tailwind CSS
- **State**: Zustand
- **Validation**: Zod

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or 20.x
- npm or yarn
- Supabase account OR MongoDB instance
- Stripe account (for payment features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rishabh3562/BotHive.git
   cd BotHive
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` with your credentials:
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
   - `JWT_SECRET` - Generate with `openssl rand -base64 32`
   - `JWT_REFRESH_SECRET` - Generate with `openssl rand -base64 32`
   - `STRIPE_SECRET_KEY` - Your Stripe secret key
   - See `.env.example` for all variables

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

### Contributing

We welcome contributions! Please read our [Contributing Guide](CONTRIBUTING.md) to get started.

**Important Notes**:
- Read [SAFETY.md](SAFETY.md) for information about AI-generated content in this repository
- By contributing, you agree to our [Contributor License Agreement (CLA)](CLA.md)

---

## 👥 User Roles & Features

### **1. Builders**

**Creators and sellers of AI agents.**

#### **Key Features:**

- **Profile Management:** Bio, profile picture, social links (LinkedIn, GitHub, etc.), portfolio links.
- **Multi-Platform Agent Listing:**
  - Support for Make, Zapier, n8n, Voiceflow, Dialogflow, and custom platforms.
  - Upload agent files, templates, or workflow exports (`.json`, `.yaml`, `.zip`, etc.).
  - Add demonstration video explaining functionality and use cases.
  - Provide structured description, setup guide, and usage instructions.
  - Tag agents by platform, category, and use case for better discovery.
  - Set pricing options (free, one-time, or subscription-based).
- **Subscription Model:**
  - Free 7-day trial (list up to 2 agents).
  - Tiered monthly plans for extended listings and premium features.
- **Analytics Dashboard:** Insights on views, downloads, revenue, and conversion rates.
- **Version Control:** Ability to update agent files with versioning support.
- **Reviews & Engagement:** Receive and respond to recruiter feedback.
- **Gamification & Recognition:**
  - **Leaderboards** tracking top builders based on sales, revenue, and ratings.
  - **Achievements & Badges** for milestones (e.g., "Top 10% Seller").

---

### **2. Businesses & Recruiters**

**Companies and individuals seeking automation solutions or looking to hire builders for custom development.**

#### **Key Features:**

- **Free Discovery:** Browse and search the marketplace without account required.
- **Advanced Search & Filtering:**
  - Filter by platform (Make, Zapier, n8n, etc.), category, use case, rating, and pricing.
- **Detailed Agent Profiles:**
  - Overview, demo video, technical specifications, and setup guides.
  - User reviews, version history, and builder contact details.
- **Direct Builder Connection:**
  - Contact builders for custom projects.
  - View builder portfolios and past work.
- **Premium Features (Optional):**
  - Early access to new listings.
  - Priority support.
  - Saved searches and watchlists.

---

## 🔐 Trust, Safety & Compliance

- **Builder Verification:** Optional or required identity verification.
- **File Security:** Automated scanning for malware and security threats.
- **Dispute Resolution:** Mediation support for hiring-related disputes.
- **Legal Compliance:** Clear Terms of Service and licensing guidelines for agent usage rights.

---

## 🌐 Community & Engagement

- **Discussion Forum:** Builders and recruiters can exchange feedback, collaborate, and suggest features.
- **Educational Resources:** Tutorials for builders on agent creation and best practices.
- **Monthly Spotlights:** Featuring top-performing builders and high-quality AI agents.

---

## 🚀 MVP Priorities

### **Core Platform Features:**

✅ User authentication (Builders & Recruiters).\
✅ AI Agent listing system (file upload, video, descriptions, pricing).\
✅ Marketplace browsing with search and filters.\
✅ Secure purchase and file download system.\
✅ Subscription-based payments for builders.\
✅ Leaderboard and review system.\
✅ Admin dashboard for content moderation and verification.

---

## 📌 Future Roadmap

### **Short-Term Enhancements:**

- **AI Agent Hosting & Deployment:** Enable one-click cloud deployment instead of manual downloads.
- **Advanced Security Measures:** Enhanced verification, malware detection, and fraud prevention.
- **Competitive Differentiation:** Focus on plug-and-play AI solutions and exclusive premium listings.

### **Long-Term Vision:**

✅ Expand AI automation capabilities.\
✅ Introduce API integrations for businesses.\
✅ Foster an AI innovation hub through community-driven development.

---

## 📢 Project Status

BotHive is an open-source project under active development. We're building this in public and welcome contributions from the community!

### Important Notes

- **AI-Generated Content**: Many issues and some documentation were AI-assisted. Please read [SAFETY.md](SAFETY.md) for details.
- **Active Development**: Features may change as we iterate based on community feedback.
- **Community-Driven**: Your input shapes the project direction.

### Get Involved

- Star the repository to show support
- Fork and contribute features
- Report bugs and suggest improvements
- Join discussions and help other contributors
- Spread the word about BotHive

---

## 📄 License

**IMPORTANT**: This project is **NO LONGER** under the MIT License as of October 2025.

This project is now licensed under a **Proprietary License** - see the [LICENSE](LICENSE) file for full details.

### What This Means:

- ✅ You **CAN**: View code, fork for contributions, learn from the code
- ❌ You **CANNOT**: Use commercially, redistribute, create competing products
- 📝 **To Contribute**: You must agree to our [Contributor License Agreement (CLA)](CLA.md)
- 💼 **Commercial Use**: Contact [@rishabh3562](https://github.com/rishabh3562) for licensing

This ensures the project can be sustainably developed while protecting the owner's ability to commercialize the platform.

## 🙏 Acknowledgments

- Built with Next.js, Supabase, and other amazing open-source tools
- Thanks to all contributors who help make BotHive better
- Special thanks to the automation and AI community

---

**BotHive**: Empowering automation builders and connecting them with businesses worldwide. 🚀

