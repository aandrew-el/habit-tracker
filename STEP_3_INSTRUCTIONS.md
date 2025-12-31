# STEP 3: Run Database Schema in Supabase

## What I Just Did for You (Step 2):

✅ Created `.env.local` with your Supabase credentials
✅ Created `supabase_schema.sql` with all the database code

---

## What You Need to Do Now (Step 3):

### 1. Go to Supabase Dashboard
- Open browser: https://supabase.com/dashboard/project/sgyhvdjwrnpqavtwwqoz

### 2. Open SQL Editor
- In left sidebar, click **SQL Editor**
- Click **New query** button

### 3. Copy the Entire Schema
- In Cursor, open `supabase_schema.sql`
- Select all (Ctrl + A)
- Copy (Ctrl + C)

### 4. Paste and Run
- Paste into Supabase SQL Editor
- Click **Run** button (bottom right)
- Wait for "Success. No rows returned"

### 5. Verify Tables Created
- In left sidebar, click **Table Editor**
- You should see 3 tables:
  - ✅ profiles
  - ✅ habits
  - ✅ habit_completions

---

## If You Get Errors:

**Error: "extension uuid-ossp already exists"**
- This is OK! Just means extension was already installed
- Other SQL should still run fine

**Error: "relation already exists"**
- Tables already created (maybe you ran it twice)
- This is OK, you can move to Step 4

**Any other error:**
- Come back to me with the exact error message
- I'll fix it

---

## After Step 3 is Done:

✅ Environment variables are set (`.env.local`)
✅ Database tables are created in Supabase
✅ Row Level Security is enabled

**Next:** Move to Step 4 in `CURSOR_PROMPTS.md` (Build Auth Pages)

---

**Go to Supabase now and run the SQL!**
