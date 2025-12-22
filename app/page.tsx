'use client'

import Link from 'next/link'
import Script from 'next/script'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Calendar, Smartphone, Shield, Sparkles, Star } from 'lucide-react'

export default function HomePage() {
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
      <div className="flex min-h-screen flex-col">
      {/* Header with backdrop blur on scroll */}
      <header className="sticky top-0 z-50 border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
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
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg shadow-blue-500/30 transition-all hover:shadow-xl hover:shadow-blue-500/40">
                Get started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section with gradient background */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-indigo-50/30 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900" />
        
        <div className="max-w-4xl space-y-12 py-20">
          {/* Hero text with animations */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300 px-4 py-1.5 text-sm font-medium"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Sparkles className="h-4 w-4" />
              The modern way to build habits
            </motion.div>
            
            <motion.h2 
              className="text-5xl font-bold tracking-tight sm:text-7xl bg-gradient-to-r from-gray-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Build better habits,
              <br />
              one day at a time
            </motion.h2>
            
            <motion.p 
              className="mx-auto max-w-2xl text-xl text-gray-600 dark:text-gray-400 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              The simplest habit tracker that actually works. No gamification gimmicks. 
              No analytics overwhelm. Just track your habits and build meaningful streaks.
            </motion.p>

            <motion.div 
              className="flex flex-col sm:flex-row gap-4 items-center justify-center pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Link href="/signup">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    className="h-14 px-8 text-lg font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/40"
                  >
                    Start tracking for free
                  </Button>
                </motion.div>
              </Link>
              <Link href="/login">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="lg" 
                    variant="outline"
                    className="h-14 px-8 text-lg font-semibold border-2 hover:bg-gray-50"
                  >
                    Sign in
                  </Button>
                </motion.div>
              </Link>
            </motion.div>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pt-8"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  delayChildren: 0.6,
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {[
              {
                icon: CheckCircle2,
                title: 'Track unlimited habits',
                description: 'Add as many habits as you want with no limits',
                gradient: 'from-green-500 to-emerald-600',
              },
              {
                icon: Flame,
                title: 'Build lasting streaks',
                description: 'Stay motivated watching your streak grow day by day',
                gradient: 'from-orange-500 to-red-600',
              },
              {
                icon: Calendar,
                title: 'Visual progress calendar',
                description: 'See your entire history at a glance with calendar view',
                gradient: 'from-blue-500 to-cyan-600',
              },
              {
                icon: Smartphone,
                title: 'Works everywhere',
                description: 'Fully responsive on desktop, tablet, and mobile',
                gradient: 'from-purple-500 to-pink-600',
              },
              {
                icon: Shield,
                title: 'Your data is secure',
                description: 'Enterprise-grade authentication and encrypted storage',
                gradient: 'from-indigo-500 to-blue-600',
              },
              {
                icon: Sparkles,
                title: '100% free forever',
                description: 'No premium tiers, paywalls, or hidden charges',
                gradient: 'from-yellow-500 to-orange-600',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="group relative rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-8 text-left shadow-sm transition-all hover:shadow-xl hover:shadow-gray-200/50"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${feature.gradient} shadow-lg`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>

          {/* Social proof section */}
          <motion.div 
            className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 dark:border-blue-800 dark:from-blue-900/20 dark:to-indigo-900/20 p-8 mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Join thousands building better habits
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              Simple, effective, and completely free
            </p>
          </motion.div>
        </div>
      </main>

      {/* Testimonials Section */}
      <section className="border-t bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 py-20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
              Loved by habit builders
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              See what people are saying about HabitFlow
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            {[
              {
                name: 'Sarah K.',
                role: 'Product Designer',
                avatar: '👩‍💼',
                quote: 'Finally, a habit tracker that doesn\'t overwhelm me with features. HabitFlow keeps it simple and that\'s exactly what I needed.',
                rating: 5,
              },
              {
                name: 'Mike R.',
                role: 'Software Engineer',
                avatar: '👨‍💻',
                quote: 'The streak feature is incredibly motivating. I\'ve been consistent with my morning routine for 47 days straight!',
                rating: 5,
              },
              {
                name: 'Emma L.',
                role: 'Entrepreneur',
                avatar: '👩‍🚀',
                quote: 'Clean interface, reliable tracking, and it just works. This is my go-to app for staying accountable to my goals.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="group rounded-2xl border-2 border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-8 shadow-lg hover:shadow-2xl hover:shadow-blue-100/50 transition-all"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-base">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50 dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
                <path strokeLinecap="round" d="M21 12a9 9 0 11-6.22-8.56" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900 dark:text-white">HabitFlow</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Built with ❤️ by Andrew El-Sayegh
          </p>
        </div>
      </footer>
    </div>
    </>
  )
}
