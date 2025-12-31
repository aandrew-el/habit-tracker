# HabitFlow - Portfolio Writeup

## Live Demo
https://habit-tracker-andrew.vercel.app

## GitHub
https://github.com/aandrew-el/habit-tracker

---

## Short Pitch (For DMs / Quick Intros)

> I built HabitFlow - a full-stack habit tracking app with AI-powered insights, push notifications, and Google auth. It's live, it works, and I built it in under 2 weeks using Next.js and Supabase.

---

## Medium Description (For Reddit / LinkedIn)

**HabitFlow** - A modern habit tracking app that actually helps you build better habits.

**What it does:**
- Track unlimited habits with streaks and completion history
- AI-powered weekly insights that analyze your patterns and give personalized recommendations
- Push notifications to remind you daily
- Visual calendar to see your progress at a glance
- Achievements system that celebrates your milestones
- Personal journal tied to your habits

**Tech stack:**
- Next.js 14 (App Router)
- TypeScript
- Supabase (Auth + Database)
- OpenAI API for AI insights
- Web Push API for notifications
- Tailwind CSS + shadcn/ui
- Framer Motion for animations
- Deployed on Vercel

**Why it matters:**
This isn't a tutorial clone. It's a complete, production-ready app with real users, real authentication, and real AI integration. I built it in under 2 weeks.

---

## Technical Breakdown (For Technical Founders)

### Architecture
- **Frontend:** Next.js 14 with App Router, React Server Components where appropriate, client components for interactivity
- **Backend:** Supabase for PostgreSQL database + Row Level Security for multi-tenant data isolation
- **Auth:** Supabase Auth with Google OAuth + email/password, session handling via middleware
- **AI:** OpenAI GPT-4 integration for weekly summaries, habit correlations, and personalized recommendations
- **Notifications:** Web Push API with service workers, Vercel cron jobs for daily reminder scheduling

### Key Technical Achievements
1. **AI Integration** - Built prompts that analyze user habit data and generate actionable insights, not generic advice
2. **Push Notifications** - Full Web Push implementation with subscription management, VAPID keys, service worker lifecycle
3. **Real-time Streak Calculation** - Algorithm that handles timezone edge cases and maintains accurate streaks
4. **Optimistic UI** - Instant feedback on habit completion with background sync
5. **Dark Mode** - System-aware theme switching with consistent styling across all components

### Database Schema
- Users, Habits, Habit Completions, Journal Entries, Push Subscriptions, Achievements
- RLS policies ensuring users only access their own data
- Cascade deletes for data integrity

---

## Feature List (For Portfolio Page)

**Core Features:**
- Create and track unlimited habits (daily/weekly)
- One-tap habit completion with streak tracking
- Visual calendar showing completion history
- Analytics dashboard with completion rates and trends

**AI Features:**
- Weekly AI-generated insights based on your data
- Pattern detection (which habits you do together)
- Personalized recommendations to improve consistency
- At-risk habit identification

**Engagement Features:**
- Push notifications with daily reminders
- Achievement badges (7-day streak, 30-day streak, 100-day streak, etc.)
- Confetti celebrations for milestones
- Personal journal for reflection

**Technical Features:**
- Google OAuth + email authentication
- Dark mode (system-aware)
- Fully responsive (mobile, tablet, desktop)
- Keyboard shortcuts for power users
- PWA-ready with service worker

---

## One-Liner Variations

**For speed:**
> "Built a full habit tracker with AI insights in 2 weeks"

**For technical depth:**
> "Next.js + Supabase + OpenAI - habit tracking with AI-powered recommendations"

**For results:**
> "Production-ready app: auth, push notifications, AI integration, deployed on Vercel"

**~~For the age hook~~ (DEPRECATED - Don't use, see CLAUDE.md "Leading with Age" lesson):**
> ~~"I'm 16 and I built a habit tracking app with AI insights. Here's the demo."~~
> **NEVER lead with age. Let the work speak first.**

---

## Objection Handlers

**"It's just a habit tracker"**
> It's not just CRUD. It has AI that analyzes your patterns, push notifications with service workers, and a full achievement system. Try the demo - it's more polished than most apps people pay for.

**"How fast can you build?"**
> I built HabitFlow in under 2 weeks. I use AI-assisted development (Cursor) which lets me ship 5-10x faster than traditional coding.

**"Do you have client work?"**
> I'm building my client portfolio now. HabitFlow shows I can build complete, production-ready apps. I'm offering discounted rates for my first few clients in exchange for testimonials.

---

## Call to Action Templates

**Reddit r/forhire:**
> Want something like this built for your startup? I'm taking on 2-3 projects this month. DM me your idea and I'll tell you if I can help.

**LinkedIn:**
> Building MVPs for startups. If you need a web app shipped fast, let's talk.

**Cold DM:**
> Hey [Name], saw you're working on [Project]. I build MVPs fast - just shipped a habit tracker with AI in 2 weeks. Would love to help if you need dev work.
