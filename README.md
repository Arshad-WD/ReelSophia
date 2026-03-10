# ⚡ ReelSophia: The Knowledge Extraction Ledger

ReelSophia is a high-performance knowledge extraction platform designed to transform ephemeral social media reels into a structured, permanent ledger of insights. Built for creators and researchers who want to archive wisdom without the noise.

![ReelSophia Banner](https://img.shields.io/badge/Status-Active-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-15+-black)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-blue)
![Auth](https://img.shields.io/badge/Auth-Clerk-purple)

## 🎯 Core Concept

In an era of rapid-fire content, ReelSophia acts as your **Extraction Ledger**. It takes URLs from social platforms and uses AI-driven workers to deconstruct them into:
- **Summaries**: Concise overviews of the content.
- **Main Ideas**: The core thesis or takeaway.
- **Tags**: Automated categorization for easy retrieval.
- **Folders**: Story-based organization for thematic collections.

## 🛠️ Technical Stack

- **Frontend**: [Next.js](https://nextjs.org/) (App Router), [React 19](https://reactjs.org/), [Tailwind CSS v4](https://tailwindcss.com/)
- **Authentication**: [Clerk](https://clerk.com/)
- **Database**: [Prisma](https://www.prisma.io/) ORM
- **Background Processing**: [BullMQ](https://docs.bullmq.io/) & [Redis](https://redis.io/) (for asynchronous extraction workers)
- **UI Components**: [Shadcn/UI](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/), [Sonner](https://sonner.emilkowal.ski/)
- **PWA**: Ready for mobile installation via `next-pwa`

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Redis instance (local or hosted)
- Database (PostgreSQL/MySQL/SQLite as configured in Prisma)
- Clerk API keys

### Installation

1. **Clone the repository**:
   ```bash
   git clone [repository-url]
   cd ReelSophia
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. **Initialize Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

## 🏗️ Project Structure

- `src/app`: Next.js App Router (Pages & API routes)
- `src/components`: Highly optimized React components
- `src/workers`: Background job processors for reel extraction
- `src/lib`: Shared utilities (Database, Redis, Rate Limiting)
- `prisma`: Database schema definitions

## 📱 PWA Features

ReelSophia is fully Progressive Web App (PWA) compatible. You can install it on your mobile device for a native-like "Knowledge Journal" experience, complete with offline support and standalone display modes.

---

*Built with precision for the extraction of truth.*
