-- Add category column to habits table
ALTER TABLE habits ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Personal';

-- Update existing habits to have 'Personal' category if NULL
UPDATE habits SET category = 'Personal' WHERE category IS NULL;

