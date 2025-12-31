# Cursor Prompts for Habit Tracker

Use these prompts in Cursor Chat (Ctrl + L) in order. After each prompt, test that everything works before moving to the next one.

---

## STEP 1: Set up shadcn/ui Components

**Prompt:**
```
Install and configure shadcn/ui components for this Next.js project.

Run these commands:
1. npx shadcn@latest init (use defaults: Neutral color, CSS variables)
2. npx shadcn@latest add button input card dialog label textarea select calendar

Make sure components are installed to components/ui/ folder.
```

**Expected Result:** components/ui/ folder with Button, Input, Card, Dialog, etc.

---

## STEP 2: Set Up Environment Variables

**Before running next prompt:**
1. Go to https://supabase.com
2. Create new project (name: habit-tracker)
3. Go to Project Settings > API
4. Copy your Project URL and anon/public key
5. Create `.env.local` file in root with:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

---

## STEP 3: Create Database Schema

**Go to Supabase Dashboard > SQL Editor and run this:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Habits table
CREATE TABLE habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'daily',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE
);

-- Habit completions table
CREATE TABLE habit_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(habit_id, completed_at)
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_completions ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policies for habits
CREATE POLICY "Users can view own habits" ON habits
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own habits" ON habits
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own habits" ON habits
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own habits" ON habits
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for completions
CREATE POLICY "Users can view own completions" ON habit_completions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON habit_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own completions" ON habit_completions
  FOR DELETE USING (auth.uid() = user_id);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**Expected Result:** Tables created in Supabase, policies enabled

---

## STEP 4: Build Auth Pages

**Prompt for Cursor:**
```
Create authentication pages for this habit tracker app using Supabase Auth.

Requirements:
1. Create app/(auth)/login/page.tsx with:
   - Email/password login form
   - Link to signup page
   - Use shadcn/ui Input, Button, Card components
   - Handle auth with Supabase client

2. Create app/(auth)/signup/page.tsx with:
   - Email/password signup form
   - Link to login page
   - Use shadcn/ui components
   - Create user with Supabase auth

3. Create app/(auth)/layout.tsx with:
   - Centered layout for auth pages
   - Simple, clean design

4. Update app/page.tsx (landing page) with:
   - Headline: "The simplest habit tracker that actually works"
   - Button to get started (links to /signup)
   - Clean, modern design

5. Add sign out functionality

Use the Supabase client from lib/supabase.ts.
Handle errors and show them to users.
Make it mobile-responsive with Tailwind.
```

**Test:**
- npm run dev
- Visit http://localhost:3000
- Sign up with email/password
- Sign in
- Sign out

---

## STEP 5: Build Dashboard Layout

**Prompt for Cursor:**
```
Create the main dashboard layout for authenticated users.

Requirements:
1. Create app/(dashboard)/layout.tsx with:
   - Top navigation bar with app name and sign out button
   - Protected route (redirect to /login if not authenticated)
   - Use Supabase auth to check user session

2. Create app/(dashboard)/page.tsx with:
   - "My Habits" heading
   - Empty state: "No habits yet. Add your first habit!"
   - Button to add habit (disabled for now)

3. Add middleware.ts in root to protect dashboard routes:
   - Check if user is authenticated
   - Redirect to /login if not

Use shadcn/ui Button component for navigation.
Mobile-responsive design.
```

**Test:**
- Visit /dashboard while logged out (should redirect to /login)
- Log in, visit /dashboard (should see empty state)

---

## STEP 6: Build Add Habit Dialog

**Prompt for Cursor:**
```
Create the "Add Habit" functionality with a dialog modal.

Requirements:
1. Create components/add-habit-dialog.tsx with:
   - shadcn/ui Dialog component
   - Form with fields:
     * Habit name (required, Input)
     * Description (optional, Textarea)
     * Frequency (Select: "daily" or "weekly")
   - Submit button
   - Cancel button

2. On submit:
   - Insert new habit into Supabase habits table
   - Include user_id from auth session
   - Close dialog
   - Show success message

3. Update app/(dashboard)/page.tsx:
   - Add "Add Habit" button that opens the dialog
   - Fetch user's habits from Supabase
   - Display habits in a list (for now just show names)

Handle errors (show error message if insert fails).
Use TypeScript with proper types.
Make form validation simple (just check name is not empty).
```

**Test:**
- Click "Add Habit"
- Fill in form (name: "Exercise", frequency: "daily")
- Submit
- Habit should appear in list

---

## STEP 7: Build Habit Card Component

**Prompt for Cursor:**
```
Create a habit card component to display each habit with streak info.

Requirements:
1. Create components/habit-card.tsx with:
   - Display habit name, description
   - Show current streak (consecutive days completed)
   - Show longest streak (all-time best)
   - "Check off today" button
   - Edit and Delete buttons

2. Create lib/streak-calculator.ts with functions:
   - calculateCurrentStreak(completions: Date[]): number
     * Count consecutive days from today backwards
     * If today not completed, streak is 0
   - calculateLongestStreak(completions: Date[]): number
     * Find longest run of consecutive days ever

3. Update app/(dashboard)/page.tsx:
   - Use HabitCard component for each habit
   - Fetch completions for each habit from Supabase
   - Calculate and display streaks

For "Check off today":
- Insert into habit_completions table
- Update UI to show new streak

For Edit:
- Open dialog with pre-filled form
- Update habit in Supabase

For Delete:
- Confirm with user
- Delete from Supabase

Use shadcn/ui Card, Button components.
Make calculations efficient.
```

**Test:**
- Click "Check off today" on a habit
- Streak should show 1
- Click again tomorrow (or change your computer date to test)
- Streak should increment

---

## STEP 8: Build Calendar View

**Prompt for Cursor:**
```
Create a calendar view page to visualize habit completion history.

Requirements:
1. Create app/(dashboard)/calendar/page.tsx with:
   - Month-by-month calendar grid
   - Each day shows colored indicator:
     * Green = all habits completed that day
     * Yellow = some habits completed
     * Gray = no habits completed
   - Click on a day to see which habits were completed
   - Buttons to navigate prev/next month

2. Use shadcn/ui Calendar component as base

3. Fetch all completions for selected month from Supabase

4. Add navigation link in dashboard layout to access calendar

Visual design:
- Clean, minimal calendar grid
- Hover states on days
- Mobile-responsive (stack on small screens)
```

**Test:**
- Click "Calendar" in nav
- See current month
- Days with completed habits show green
- Navigate to previous/next month

---

## STEP 9: Polish & Deploy

**Prompt for Cursor:**
```
Polish the app and prepare for deployment:

1. Improve UI/UX:
   - Add loading states for all async operations
   - Add success/error toast notifications (use sonner library)
   - Improve empty states
   - Add subtle animations (hover effects, transitions)

2. Fix any TypeScript errors

3. Update landing page (app/page.tsx) with:
   - Better copy
   - Feature list (track habits, see streaks, calendar view, free)
   - Call to action button
   - Simple, clean design

4. Create README.md with:
   - Project description
   - Setup instructions
   - Tech stack

5. Test on mobile (use Chrome DevTools responsive mode)

Install sonner: npm install sonner
```

**Test:**
- Everything works smoothly
- No console errors
- Looks good on mobile

---

## STEP 10: Deploy to Vercel

**Manual steps:**
1. Push to GitHub:
   ```
   git add .
   git commit -m "feat: initial habit tracker build"
   git push origin main
   ```

2. Go to vercel.com
3. Import GitHub repository
4. Add environment variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
5. Deploy

6. Test production site

**Expected Result:** Live app at your-app.vercel.app

---

## BONUS: Add Dark Mode (Optional)

**Prompt for Cursor:**
```
Add dark mode toggle using next-themes:

1. Install: npm install next-themes
2. Wrap app in ThemeProvider
3. Add theme toggle button in navbar
4. Update Tailwind config for dark mode
5. Test light/dark themes
```

---

**Start with Step 1 and work through in order. Test after each step!**
