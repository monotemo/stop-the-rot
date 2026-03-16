# Stop The Rot - Design Document

## Overview

A free "earn your screen time" app where kids complete chores to earn coins, then spend coins on screen time. Uses iOS Shortcuts for Screen Time integration.

## Coin System

**Chore Values (fixed):**
- Easy: 5 coins
- Medium: 10 coins
- Hard: 20 coins

**Screen Time Exchange Rate:**
- 15 min = 5 coins
- 30 min = 10 coins
- 1 hour = 15 coins
- 2 hours = 25 coins

## Data Model

```sql
-- Kids using the app
CREATE TABLE kids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  coin_balance INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Chores parent creates
CREATE TABLE chores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK(difficulty IN ('easy', 'medium', 'hard')),
  coin_value INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Chores kid completes (trust-based, auto-approve)
CREATE TABLE completed_chores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kid_id INTEGER NOT NULL,
  chore_id INTEGER NOT NULL,
  completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  coins_earned INTEGER NOT NULL,
  FOREIGN KEY (kid_id) REFERENCES kids(id),
  FOREIGN KEY (chore_id) REFERENCES chores(id)
);

-- Screen time purchases
CREATE TABLE screen_time_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kid_id INTEGER NOT NULL,
  minutes_purchased INTEGER NOT NULL,
  coins_spent INTEGER NOT NULL,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  is_active BOOLEAN DEFAULT 1,
  FOREIGN KEY (kid_id) REFERENCES kids(id)
);
```

## REST API

```
GET  /api/kids/:id           - Get kid's balance
POST /api/chores             - Create chore (parent)
GET  /api/chores             - List available chores
POST /api/chores/:id/complete - Complete chore (kid)
POST /api/screen-time/purchase - Buy screen time package
GET  /api/screen-time/active  - Check current session status
POST /api/screen-time/enable  - iOS Shortcut calls this
POST /api/screen-time/disable - iOS Shortcut calls this (timer expiry)
```

## UI Views

### Parent Dashboard
- Add chore form (name + difficulty dropdown)
- List all chores
- Kid's coin balance
- Recent activity log

### Kid View
- Big coin balance display
- Grid of available chores (tap to complete)
- "Buy Screen Time" section with 4 packages
- Celebration animations

## iOS Shortcuts Integration

Two shortcuts created on iPad:

**Unrot-Enable:**
1. GET `YOUR_SERVER/api/screen-time/enable?kid_id=1&minutes=15`
2. "Set Screen Time Limit" action for whitelisted apps
3. Wait for duration
4. Run Unrot-Disable

**Unrot-Disable:**
1. GET `YOUR_SERVER/api/screen-time/disable?kid_id=1`
2. "Clear Screen Time Limit" action

## Hosting

- Development: Local server with ngrok
- Production: Deploy alongside NanoClaw or separate hosting
- Frontend: Static files served by Express

## Tech Stack

- Backend: Node.js + Express + TypeScript
- Database: SQLite (better-sqlite3)
- Frontend: Vanilla HTML/CSS/JS (keep it simple)
- Integration: iOS Shortcuts + Screen Time
