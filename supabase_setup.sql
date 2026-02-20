-- Run this in your Supabase SQL Editor to set up the database

-- Create the RSVPs table
CREATE TABLE rsvps (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  game_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Prevent duplicate names per game date
CREATE UNIQUE INDEX rsvps_name_game_date_unique 
ON rsvps (lower(name), game_date);

-- Enable Row Level Security
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read RSVPs (public RSVP list)
CREATE POLICY "Anyone can view RSVPs"
ON rsvps FOR SELECT
USING (true);

-- Allow anyone to insert an RSVP
CREATE POLICY "Anyone can RSVP"
ON rsvps FOR INSERT
WITH CHECK (true);

-- Allow anyone to delete their own RSVP
-- (In a real app you'd tie this to auth, but for simplicity we allow it)
CREATE POLICY "Anyone can delete RSVPs"
ON rsvps FOR DELETE
USING (true);

-- Enable real-time updates for this table
-- (Do this in the Supabase Dashboard → Database → Replication → rsvps table)
