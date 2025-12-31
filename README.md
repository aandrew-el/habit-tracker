# HabitFlow

A modern habit tracking app with AI-powered insights, streak tracking, and beautiful analytics.

**[Live Demo](https://habittracker-livid-three.vercel.app)** | **[Try it Free](https://habittracker-livid-three.vercel.app/signup)**

## Features

- **Unlimited Habit Tracking** - Create habits with custom colors, icons, and schedules
- **Streak System** - Build momentum with visual streak counters and animations
- **Calendar Heatmap** - See your entire history at a glance
- **AI-Powered Insights** - Get personalized recommendations and weekly summaries via OpenAI
- **Push Notifications** - Never miss a habit with browser notifications
- **Journal** - Reflect on your progress with daily notes
- **Achievements** - Unlock badges as you build consistency
- **Dark Mode** - Easy on the eyes, day or night
- **PWA Support** - Install on any device for a native app experience

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth (Google OAuth + Email) |
| AI | OpenAI GPT-4 |
| Animations | Framer Motion |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account
- An OpenAI API key (for AI features)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/aandrew-el/habit-tracker.git
cd habit-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_key
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Login/signup pages
│   ├── api/               # API routes (AI, push notifications)
│   └── dashboard/         # Main app pages
├── components/            # React components
│   ├── landing/          # Landing page components
│   └── ui/               # shadcn/ui components
├── hooks/                 # Custom React hooks
├── lib/                   # Utilities and configurations
└── public/               # Static assets
```

## Key Features Explained

### AI Insights
The app uses OpenAI's GPT-4 to analyze your habit patterns and provide:
- Weekly performance summaries
- Personalized recommendations
- Correlation analysis between habits

### Push Notifications
Implemented using the Web Push API with VAPID authentication. Users can enable browser notifications to get reminders for their habits.

### Streak Tracking
Streaks are calculated based on consecutive completions. The system handles:
- Daily habits
- Weekly habits (specific days)
- Timezone-aware calculations

## License

MIT

---

Built with Next.js, Supabase, and OpenAI.
