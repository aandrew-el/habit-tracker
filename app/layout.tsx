import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "HabitFlow - Build Better Habits",
    template: "%s | HabitFlow"
  },
  description: "The simplest habit tracker that actually works. Track your habits, build streaks, and achieve your goals with beautiful analytics and insights.",
  keywords: ["habit tracker", "habits", "productivity", "goal setting", "streaks", "daily habits", "habit building", "personal development"],
  authors: [{ name: "Andrew El-Sayegh", url: "https://github.com/aandrew-el" }],
  creator: "Andrew El-Sayegh",
  metadataBase: new URL('https://habitflow.vercel.app'),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://habitflow.vercel.app",
    title: "HabitFlow - Build Better Habits",
    description: "The simplest habit tracker that actually works. Track your habits, build streaks, and achieve your goals with beautiful analytics and insights.",
    siteName: "HabitFlow",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HabitFlow - Build Better Habits",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HabitFlow - Build Better Habits",
    description: "The simplest habit tracker that actually works. Track your habits, build streaks, and achieve your goals.",
    creator: "@andrewelsayegh",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster position="top-center" richColors expand={false} theme="system" />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
