# 🔧 Login Fix - Setup Instructions

## The Problem
Your login isn't working because **Supabase environment variables are not configured**.

The Supabase client in `lib/supabase.ts` is correctly configured, but it needs your project credentials to connect to your Supabase database.

## The Solution

### Step 1: Get Your Supabase Credentials

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Select your `habit-tracker` project (or create one if you haven't)
3. Click on **Project Settings** (gear icon in sidebar)
4. Click on **API** in the settings menu
5. Copy these two values:
   - **Project URL** (looks like: `https://abcdefgh.supabase.co`)
   - **anon/public key** (long JWT token starting with `eyJ...`)

### Step 2: Create .env.local File

1. In your project root (`C:\Users\andre\cursor-projects\habit-tracker`), create a new file named `.env.local`
2. Add your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual credentials from Step 1.

### Step 3: Restart Development Server

**IMPORTANT**: Next.js only loads environment variables on startup.

1. Stop the current dev server (Ctrl + C in terminal)
2. Start it again: `npm run dev`
3. Refresh your browser

### Step 4: Test Login

1. Go to `http://localhost:3000/signup`
2. Create an account with your email
3. Go to `http://localhost:3000/login`
4. Login with your credentials
5. You should be redirected to `/dashboard`

## What Was Fixed

✅ **lib/supabase.ts** - Already correctly configured with `createBrowserClient` from `@supabase/ssr`
✅ **Login page** - Added better error handling and environment variable check
✅ **Auth flow** - Proper redirect to dashboard after successful login

## Files Modified

1. `lib/supabase.ts` - ✅ Already correct
2. `app/(auth)/login/page.tsx` - Added debug logging and environment check

## Troubleshooting

### Still seeing "missing email or phone" error?
- Make sure you created `.env.local` (NOT `.env.local.txt`)
- Verify your credentials are correct (no extra spaces)
- Restart the dev server

### Can't create account?
- Make sure you ran the database schema from `CURSOR_PROMPTS.md` Step 3
- Check Supabase dashboard > Authentication > Settings > Auth Providers > Email is enabled

### Redirect not working?
- Check browser console for errors (F12)
- Verify `/dashboard` route exists
- Clear browser cookies and try again

## Next Steps

Once login works:
1. Continue with `CURSOR_PROMPTS.md` Step 6 (Add Habit Dialog)
2. Build out the habit tracking features
3. Deploy to Vercel

---

**Need help?** Check the console (F12) for detailed error messages with the new debug logging.

