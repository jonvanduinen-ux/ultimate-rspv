# 🥏 Pickup — Weekly Ultimate RSVP

A simple, beautiful PWA for tracking who's playing your weekly ultimate frisbee pickup game.

## Features
- Weekly RSVP sign-up / drop-out
- 20-player cap with automatic waitlist
- Real-time updates (see signups live)
- Works on mobile as a PWA (add to home screen)
- Remembers your name between visits

---

## Setup Guide

### 1. Set Up Supabase (Database)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project**, give it a name (e.g. "ultimate-rsvp")
3. Once created, go to **SQL Editor** in the left sidebar
4. Paste the contents of `supabase_setup.sql` and click **Run**
5. Go to **Project Settings → API** and copy:
   - **Project URL** (looks like `https://xxxx.supabase.co`)
   - **anon / public** key

6. Enable real-time: Go to **Database → Replication** and toggle on the `rsvps` table

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase credentials:
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Customize Your Game

Open `src/App.js` and change these constants near the top:

```js
const MAX_PLAYERS = 20   // Max players before waitlist kicks in
const GAME_DAY = 3       // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
```

### 4. Run Locally

```bash
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Deploy to Vercel

1. Push your code to a GitHub repo
2. Go to [vercel.com](https://vercel.com) and import the repo
3. In the **Environment Variables** section, add:
   - `REACT_APP_SUPABASE_URL`
   - `REACT_APP_SUPABASE_ANON_KEY`
4. Click **Deploy** — you're live!

Share the Vercel URL with your crew. They can add it to their phone's home screen for an app-like experience.

---

## Project Structure

```
src/
  App.js          — Main app logic & UI
  App.css         — All styles
  supabaseClient.js — Supabase connection
  index.js        — React entry point
supabase_setup.sql — Database setup script
```

## Future Ideas
- Player profiles / avatars
- Team balancing (split into even teams)
- Game history / attendance stats
- Admin mode to manage the list
- SMS/email reminders
