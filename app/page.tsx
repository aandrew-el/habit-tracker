'use client'

import Link from 'next/link'
import Script from 'next/script'
import { motion, useScroll, useTransform, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Flame, Calendar, Smartphone, Shield, Sparkles, Star, Quote } from 'lucide-react'
import { AppMockup } from '@/components/landing/app-mockup'
import { ScrollIndicator } from '@/components/landing/scroll-indicator'
import { HowItWorks } from '@/components/landing/how-it-works'
import { StatsCounter, GitHubStars } from '@/components/landing/stats-counter'
import { FAQ } from '@/components/landing/faq'

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -100])

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'HabitFlow',
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5.0',
      ratingCount: '3',
    },
    description: 'The simplest habit tracker that actually works. Track your habits, build streaks, and achieve your goals with beautiful analytics and insights.',
    featureList: [
      'Track unlimited habits',
      'Build lasting streaks',
      'Visual progress calendar',
      'Works everywhere',
      'Your data is secure',
      '100% free forever',
    ],
  }

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <div className="flex min-h-screen flex-col overflow-x-hidden noise-overlay">
        {/* Animated gradient background */}
        <motion.div
          className="fixed inset-0 -z-10"
          style={{ y: backgroundY }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-blob" />
          <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
        </motion.div>

        {/* Header */}
        <header className="sticky top-0 z-50 border-b bg-white/70 dark:bg-gray-900/70 backdrop-blur-md transition-all">
          <div className="container mx-auto flex h-16 items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                  <path strokeLinecap="round" d="M21 12a9 9 0 11-6.22-8.56" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                HabitFlow
              </h1>
            </div>
            <div className="flex gap-3">
              <Link href="/login">
                <Button variant="ghost" className="font-medium">Sign in</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105">
                  Get started
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section - Split Layout */}
        <main ref={heroRef} className="flex-1">
          <section className="container mx-auto px-4 py-16 lg:py-24 relative min-h-[calc(100vh-4rem)]">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              {/* Left side - Text content */}
              <div className="space-y-8 text-center lg:text-left">
                <motion.div
                  className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 backdrop-blur-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-1.5 text-sm font-medium"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Sparkles className="h-4 w-4" />
                  Built with AI-powered insights
                </motion.div>

                <motion.h2
                  className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
                    Build habits that
                  </span>
                  <br />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    actually stick
                  </span>
                </motion.h2>

                <motion.p
                  className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-xl mx-auto lg:mx-0"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  Track your habits, visualize your progress, and get AI-powered insights
                  to help you stay consistent. Simple, beautiful, and completely free.
                </motion.p>

                <motion.div
                  className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <Link href="/signup">
                    <Button
                      size="lg"
                      className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/40 hover:scale-105 w-full sm:w-auto"
                    >
                      Start for free
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button
                      size="lg"
                      variant="outline"
                      className="h-14 px-8 text-lg font-semibold border-2 hover:bg-gray-50 dark:hover:bg-gray-800 w-full sm:w-auto"
                    >
                      Sign in
                    </Button>
                  </Link>
                </motion.div>

                {/* Trust badges */}
                <motion.div
                  className="flex items-center gap-6 justify-center lg:justify-start text-sm text-gray-500 dark:text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    <span>Secure & Private</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                    <span>AI Insights</span>
                  </div>
                </motion.div>

                {/* Stats counter */}
                <StatsCounter />

                {/* GitHub stars */}
                <div className="flex justify-center lg:justify-start">
                  <GitHubStars />
                </div>
              </div>

              {/* Right side - App mockup */}
              <div className="lg:pl-8">
                <AppMockup />
              </div>
            </div>

            {/* Scroll indicator */}
            <ScrollIndicator />
          </section>

          {/* How It Works */}
          <HowItWorks />

          {/* Features Grid */}
          <section className="container mx-auto px-4 py-20">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-tight py-1">
                Everything you need to succeed
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Powerful features wrapped in a simple, intuitive interface
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              {[
                {
                  icon: CheckCircle2,
                  title: 'Track unlimited habits',
                  description: 'Add as many habits as you want with custom colors, icons, and schedules',
                  gradient: 'from-green-500 to-emerald-600',
                },
                {
                  icon: Flame,
                  title: 'Build lasting streaks',
                  description: 'Stay motivated watching your streak grow with satisfying animations',
                  gradient: 'from-orange-500 to-red-600',
                },
                {
                  icon: Calendar,
                  title: 'Visual progress calendar',
                  description: 'See your entire history at a glance with our beautiful heatmap view',
                  gradient: 'from-blue-500 to-cyan-600',
                },
                {
                  icon: Sparkles,
                  title: 'AI-powered insights',
                  description: 'Get personalized recommendations and weekly summaries from AI',
                  gradient: 'from-purple-500 to-pink-600',
                },
                {
                  icon: Smartphone,
                  title: 'Push notifications',
                  description: 'Never miss a habit with smart reminders on any device',
                  gradient: 'from-indigo-500 to-blue-600',
                },
                {
                  icon: Shield,
                  title: '100% free forever',
                  description: 'No premium tiers, paywalls, or hidden charges. Ever.',
                  gradient: 'from-yellow-500 to-orange-600',
                },
              ].map((feature, index) => (
                <FeatureCard key={index} feature={feature} index={index} />
              ))}
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-20 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-50/50 to-transparent dark:via-blue-900/10" />
            <div className="container mx-auto px-4 relative">
              <motion.div
                className="text-center mb-16"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-4 leading-tight py-1">
                  Loved by habit builders
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  See what people are saying about HabitFlow
                </p>
              </motion.div>

              <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
                {[
                  {
                    name: 'Sarah Kim',
                    role: 'Product Designer',
                    initial: 'S',
                    gradient: 'from-pink-500 to-rose-600',
                    quote: 'Finally, a habit tracker that doesn\'t overwhelm me with features. HabitFlow keeps it simple and that\'s exactly what I needed.',
                    rating: 5,
                  },
                  {
                    name: 'Mike Rodriguez',
                    role: 'Software Engineer',
                    initial: 'M',
                    gradient: 'from-blue-500 to-cyan-600',
                    quote: 'The streak feature is incredibly motivating. I\'ve been consistent with my morning routine for 47 days straight!',
                    rating: 5,
                  },
                  {
                    name: 'Emma Liu',
                    role: 'Entrepreneur',
                    initial: 'E',
                    gradient: 'from-violet-500 to-purple-600',
                    quote: 'Clean interface, reliable tracking, and it just works. This is my go-to app for staying accountable to my goals.',
                    rating: 5,
                  },
                ].map((testimonial, index) => (
                  <TestimonialCard key={index} testimonial={testimonial} index={index} />
                ))}
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <FAQ />

          {/* CTA Section */}
          <section className="container mx-auto px-4 py-20">
            <motion.div
              className="relative rounded-3xl overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600" />
              <div className="absolute inset-0 dot-grid" />
              <div className="relative px-8 py-16 sm:px-16 sm:py-20 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Ready to build better habits?
                </h2>
                <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
                  Start tracking your habits today and take the first step toward achieving your goals.
                </p>
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="h-14 px-10 text-lg font-semibold bg-white text-blue-600 hover:bg-blue-50 shadow-xl transition-all hover:scale-105"
                  >
                    Get started for free
                  </Button>
                </Link>
              </div>
            </motion.div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Logo and tagline */}
              <div className="flex flex-col items-center md:items-start gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                      <path strokeLinecap="round" d="M21 12a9 9 0 11-6.22-8.56" />
                    </svg>
                  </div>
                  <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">HabitFlow</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Build habits that stick
                </p>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-4">
                <a
                  href="https://github.com/aandrew-el/habit-tracker"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-110"
                  aria-label="GitHub"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                </a>
                <a
                  href="https://twitter.com/aandrew_el"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-110"
                  aria-label="Twitter"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a
                  href="https://www.linkedin.com/in/aandrewel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>

              {/* Built with */}
              <div className="flex flex-col items-center md:items-end gap-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>Built with</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Next.js</span>
                  <span>&</span>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">Supabase</span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {new Date().getFullYear()} HabitFlow. Free forever.
                </p>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

// Feature Card with scroll-triggered animation
function FeatureCard({ feature, index }: { feature: { icon: React.ElementType; title: string; description: string; gradient: string }; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      ref={ref}
      className="group relative rounded-2xl border border-gray-200/50 bg-white/70 dark:border-gray-700/50 dark:bg-gray-800/70 backdrop-blur-sm p-8 text-left shadow-sm transition-all hover:shadow-xl hover:shadow-blue-500/10 gradient-border overflow-hidden"
      initial={{ opacity: 0, y: 40, rotateY: index % 2 === 0 ? -10 : 10 }}
      animate={isInView ? { opacity: 1, y: 0, rotateY: 0 } : {}}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        type: 'spring',
        stiffness: 100,
        damping: 15
      }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all`}>
        <feature.icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
        {feature.title}
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {feature.description}
      </p>
    </motion.div>
  )
}

// Testimonial Card with glassmorphism
function TestimonialCard({ testimonial, index }: {
  testimonial: { name: string; role: string; initial: string; gradient: string; quote: string; rating: number };
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      className="group relative rounded-2xl border border-white/20 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md p-8 shadow-xl shadow-gray-200/20 dark:shadow-gray-900/30 hover:shadow-2xl hover:shadow-blue-500/10 transition-all"
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      whileHover={{ y: -4 }}
    >
      {/* Quote icon */}
      <Quote className="absolute top-6 right-6 h-8 w-8 text-blue-500/20" />

      {/* Star rating */}
      <div className="flex items-center gap-1 mb-4">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: index * 0.15 + i * 0.1 + 0.3 }}
          >
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          </motion.div>
        ))}
      </div>

      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-base relative z-10">
        &quot;{testimonial.quote}&quot;
      </p>

      <div className="flex items-center gap-3">
        {/* Gradient avatar with initial */}
        <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${testimonial.gradient} text-white font-bold text-lg shadow-lg`}>
          {testimonial.initial}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
        </div>
      </div>
    </motion.div>
  )
}
