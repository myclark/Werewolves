# Werewolves Game - Next.js + Supabase Migration Guide

**Created:** November 17, 2025
**Migration Type:** Complete Platform Rebuild
**From:** Meteor 1.2.1 (2015)
**To:** Next.js 15 + Supabase + TypeScript

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Why Next.js + Supabase?](#why-nextjs--supabase)
3. [Architecture Comparison](#architecture-comparison)
4. [Migration Strategy](#migration-strategy)
5. [Phase 1: Project Setup](#phase-1-project-setup)
6. [Phase 2: Database Design](#phase-2-database-design)
7. [Phase 3: Authentication](#phase-3-authentication)
8. [Phase 4: Real-time Infrastructure](#phase-4-real-time-infrastructure)
9. [Phase 5: Game Logic Migration](#phase-5-game-logic-migration)
10. [Phase 6: UI Components](#phase-6-ui-components)
11. [Phase 7: Testing](#phase-7-testing)
12. [Phase 8: Deployment](#phase-8-deployment)
13. [Feature Parity Checklist](#feature-parity-checklist)
14. [Post-Migration](#post-migration)

---

## Executive Summary

This guide provides a complete roadmap for migrating the Werewolves game from Meteor 1.2.1 to a modern Next.js + Supabase stack. Rather than incrementally upgrading Meteor, we're rebuilding the application on modern infrastructure while preserving all game logic and user experience.

### Current State

- **Framework:** Meteor 1.2.1 (10 years old)
- **UI:** Blaze templates
- **Database:** MongoDB
- **Real-time:** Meteor DDP
- **Auth:** Meteor Accounts
- **Security:** ⚠️ Critical vulnerabilities (autopublish/insecure)
- **Tests:** None
- **Type Safety:** None

### Target State

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19 + TypeScript + Tailwind CSS
- **Database:** PostgreSQL (Supabase)
- **Real-time:** Supabase Realtime + Presence
- **Auth:** Supabase Auth (with OAuth)
- **Security:** ✅ Row Level Security (RLS)
- **Tests:** Vitest + Playwright
- **Type Safety:** Full TypeScript coverage
- **Deployment:** Vercel (frontend) + Supabase (backend)

### Migration Philosophy

1. **Rebuild, Don't Rewrite:** Extract and preserve game logic while modernizing infrastructure
2. **Test-Driven:** Write tests first, then implement
3. **Incremental:** Build feature-by-feature, validate continuously
4. **Type-Safe:** Use TypeScript throughout for reliability
5. **Real-time First:** Leverage Supabase Realtime for seamless multiplayer

---

## Why Next.js + Supabase?

### Next.js 15 Advantages

✅ **Modern React Framework**
- Server Components for better performance
- App Router with layouts and streaming
- Built-in API routes
- Excellent TypeScript support
- Zero config needed

✅ **Performance**
- Automatic code splitting
- Image optimization
- Route prefetching
- Edge runtime support

✅ **Developer Experience**
- Fast Refresh
- Great error messages
- Rich ecosystem
- Active community

✅ **Deployment**
- Optimized for Vercel
- Edge network distribution
- Automatic HTTPS
- Preview deployments

### Supabase Advantages

✅ **PostgreSQL Database**
- ACID compliance
- Powerful queries
- Better for relational data
- Built-in full-text search

✅ **Built-in Real-time**
- WebSocket subscriptions
- Broadcast channels
- Presence tracking
- Similar to Meteor DDP

✅ **Authentication**
- Email/password
- OAuth providers (Google, Facebook, GitHub)
- Magic links
- JWT tokens

✅ **Security**
- Row Level Security (RLS)
- Automatic API generation
- Type-safe queries
- No client-side DB access

✅ **Developer Tools**
- Database GUI
- SQL editor
- API documentation
- Real-time inspector

### Why NOT Stay with Meteor?

❌ **Outdated:** Meteor 1.2.1 is 10 years old
❌ **Security:** Critical vulnerabilities in current code
❌ **Ecosystem:** Smaller community, fewer packages
❌ **Deployment:** Limited hosting options
❌ **Talent:** Harder to find Meteor developers
❌ **TypeScript:** Limited/awkward support
❌ **Migration Effort:** Upgrading to Meteor 3.x is almost as much work as switching platforms

---

## Architecture Comparison

### Old Architecture (Meteor)

```
┌─────────────────────────────────────────────────┐
│                   CLIENT                        │
│  ┌──────────────────────────────────────────┐  │
│  │  Blaze Templates                         │  │
│  │  - splashScreen.html                     │  │
│  │  - gameScreen.html                       │  │
│  │  - Session state (global)                │  │
│  └──────────────────────────────────────────┘  │
│                      ↕                          │
│  ┌──────────────────────────────────────────┐  │
│  │  Minimongo (Client-side MongoDB)         │  │
│  │  - Reactive collections                  │  │
│  │  - Autopublish (insecure!)               │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      ↕
              DDP over WebSocket
                      ↕
┌─────────────────────────────────────────────────┐
│                   SERVER                        │
│  ┌──────────────────────────────────────────┐  │
│  │  Meteor Methods                          │  │
│  │  - methods.js (939 lines)                │  │
│  │  - No validation                         │  │
│  │  - No type safety                        │  │
│  └──────────────────────────────────────────┘  │
│                      ↕                          │
│  ┌──────────────────────────────────────────┐  │
│  │  MongoDB                                 │  │
│  │  - 7 collections                         │  │
│  │  - No security rules                     │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### New Architecture (Next.js + Supabase)

```
┌─────────────────────────────────────────────────┐
│                CLIENT (Browser)                 │
│  ┌──────────────────────────────────────────┐  │
│  │  Next.js App (React)                     │  │
│  │  ├─ app/                                 │  │
│  │  │  ├─ (auth)/                           │  │
│  │  │  │  └─ login/page.tsx                 │  │
│  │  │  ├─ game/                             │  │
│  │  │  │  └─ [gameId]/page.tsx              │  │
│  │  │  └─ layout.tsx                        │  │
│  │  ├─ components/                          │  │
│  │  │  ├─ PlayerList.tsx                    │  │
│  │  │  ├─ VotePanel.tsx                     │  │
│  │  │  └─ EventFeed.tsx                     │  │
│  │  └─ lib/                                 │  │
│  │     ├─ supabase/client.ts                │  │
│  │     └─ hooks/useGameState.ts             │  │
│  └──────────────────────────────────────────┘  │
│                      ↕                          │
│         Supabase-JS Client Library              │
│         (Type-safe API + Realtime)              │
└─────────────────────────────────────────────────┘
                      ↕
           HTTPS + WebSocket (secure)
                      ↕
┌─────────────────────────────────────────────────┐
│              SUPABASE (Backend)                 │
│  ┌──────────────────────────────────────────┐  │
│  │  API Layer (Auto-generated)              │  │
│  │  - REST API (PostgREST)                  │  │
│  │  - GraphQL (optional)                    │  │
│  │  - Real-time subscriptions               │  │
│  └──────────────────────────────────────────┘  │
│                      ↕                          │
│  ┌──────────────────────────────────────────┐  │
│  │  Row Level Security (RLS)                │  │
│  │  - User-based access control             │  │
│  │  - Policies enforce security             │  │
│  └──────────────────────────────────────────┘  │
│                      ↕                          │
│  ┌──────────────────────────────────────────┐  │
│  │  PostgreSQL Database                     │  │
│  │  - Type-safe schema                      │  │
│  │  - Database functions (game logic)       │  │
│  │  - Triggers for automation               │  │
│  └──────────────────────────────────────────┘  │
│                      ↕                          │
│  ┌──────────────────────────────────────────┐  │
│  │  Edge Functions (Deno)                   │  │
│  │  - Complex game logic                    │  │
│  │  - Background jobs                       │  │
│  │  - Webhooks                              │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### Key Differences

| Aspect | Meteor | Next.js + Supabase |
|--------|--------|-------------------|
| **Data Flow** | DDP (proprietary) | REST + GraphQL (standard) |
| **Real-time** | Meteor Pub/Sub | Supabase Realtime |
| **Security** | Client-side allow/deny | Server-side RLS policies |
| **Type Safety** | Runtime validation | Compile-time TypeScript |
| **State Management** | Session + Collections | React hooks + Context |
| **Deployment** | Single server | Distributed (CDN + database) |
| **Scaling** | Vertical | Horizontal |

---

## Migration Strategy

### Approach: Parallel Development

We'll build the new application alongside the old one, not attempt an in-place upgrade.

```
Old Repo (Meteor)          New Repo (Next.js + Supabase)
     │                              │
     │                              │
     ├─ Keep running        ┌───────▼────────┐
     │  for reference       │ 1. Setup       │
     │                      │ 2. Database    │
     │                      │ 3. Auth        │
     ├─ Extract game        │ 4. Real-time   │
     │  logic patterns ────▶│ 5. Game Logic  │
     │                      │ 6. UI          │
     │                      │ 7. Testing     │
     └─ Archive after       │ 8. Deploy      │
        migration           └────────────────┘
```

### Development Workflow

1. **Feature-by-Feature Migration**
   - Don't try to build everything at once
   - Complete one feature end-to-end before moving to next
   - Test each feature thoroughly

2. **Test-Driven Development**
   - Write tests based on existing behavior
   - Implement feature to pass tests
   - Ensures functional parity

3. **Incremental Deployment**
   - Deploy to preview environments frequently
   - Get user feedback early
   - Iterate based on testing

---

## Phase 1: Project Setup

**Goal:** Create Next.js project with TypeScript and Supabase integration

### 1.1 Create Next.js Project

```bash
# Create new Next.js 15 app with TypeScript
npx create-next-app@latest werewolves-next --typescript --tailwind --app --eslint

cd werewolves-next

# Install additional dependencies
npm install @supabase/supabase-js @supabase/ssr
npm install zustand  # State management
npm install zod  # Runtime validation
npm install class-variance-authority clsx tailwind-merge  # UI utilities
npm install lucide-react  # Icons
npm install sonner  # Toast notifications

# Install dev dependencies
npm install -D @types/node @types/react @types/react-dom
npm install -D vitest @vitejs/plugin-react jsdom
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test
npm install -D prettier prettier-plugin-tailwindcss
```

### 1.2 Project Structure

```
werewolves-next/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (game)/
│   │   ├── lobby/
│   │   │   └── page.tsx
│   │   ├── game/
│   │   │   └── [gameId]/
│   │   │       ├── page.tsx
│   │   │       └── layout.tsx
│   │   └── history/
│   │       └── page.tsx
│   ├── api/
│   │   └── game/
│   │       └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── modal.tsx
│   │   └── avatar.tsx
│   ├── game/                  # Game-specific components
│   │   ├── PlayerList.tsx
│   │   ├── EventFeed.tsx
│   │   ├── VotePanel.tsx
│   │   ├── NightActionPanel.tsx
│   │   ├── RoleCard.tsx
│   │   └── ColorMinigame.tsx
│   └── layout/
│       ├── Header.tsx
│       └── Footer.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Client-side Supabase
│   │   ├── server.ts          # Server-side Supabase
│   │   └── middleware.ts      # Auth middleware
│   ├── game/
│   │   ├── types.ts           # Game type definitions
│   │   ├── logic.ts           # Core game logic
│   │   ├── roles.ts           # Role definitions
│   │   └── validation.ts      # Input validation
│   ├── hooks/
│   │   ├── useGameState.ts
│   │   ├── usePlayer.ts
│   │   ├── useRealtime.ts
│   │   └── usePresence.ts
│   └── utils/
│       ├── cn.ts              # Class name utility
│       └── helpers.ts
├── types/
│   ├── database.types.ts      # Auto-generated from Supabase
│   └── game.types.ts
├── supabase/
│   ├── migrations/            # Database migrations
│   ├── functions/             # Edge functions
│   └── seed.sql               # Initial data
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── public/
│   └── avatars/
├── .env.local
├── .env.example
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── vitest.config.ts
└── playwright.config.ts
```

### 1.3 Configure TypeScript

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 1.4 Environment Configuration

**.env.local:**
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional: OAuth providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
FACEBOOK_APP_ID=
FACEBOOK_APP_SECRET=
```

**.env.example:**
```bash
# Copy this file to .env.local and fill in your values

# Supabase (get from https://app.supabase.com)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 1.5 Initialize Supabase Client

**lib/supabase/client.ts:**
```typescript
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**lib/supabase/server.ts:**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Server Component cookie setting can fail
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Server Component cookie removal can fail
          }
        },
      },
    }
  )
}
```

### 1.6 Setup Testing

**vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

**playwright.config.ts:**
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

### Phase 1 Checklist

- [ ] Next.js project created with TypeScript
- [ ] All dependencies installed
- [ ] Project structure created
- [ ] TypeScript configured
- [ ] Environment variables set up
- [ ] Supabase clients initialized
- [ ] Testing frameworks configured
- [ ] Git initialized and first commit made
- [ ] README.md updated with setup instructions

---

## Phase 2: Database Design

**Goal:** Design and implement PostgreSQL schema with RLS policies

### 2.1 Setup Supabase Project

1. **Create Supabase Project**
   - Go to https://app.supabase.com
   - Create new project
   - Choose region closest to users
   - Save database password

2. **Install Supabase CLI**
   ```bash
   npm install -g supabase

   # Login
   supabase login

   # Link project
   supabase link --project-ref your-project-ref

   # Pull remote schema
   supabase db pull
   ```

### 2.2 Database Schema

The Meteor app uses 7 MongoDB collections. We'll map these to PostgreSQL tables with proper relationships and constraints.

#### Schema Diagram

```
┌─────────────┐
│    users    │ (Supabase Auth)
│  id (uuid)  │
│  email      │
│  name       │
│  avatar_url │
└──────┬──────┘
       │
       │ 1:N
       │
┌──────▼──────────────┐         ┌─────────────────┐
│     players         │  N:1    │      games      │
│  id (uuid)          ├────────▶│   id (uuid)     │
│  user_id (fk)       │         │   status        │
│  game_id (fk)       │         │   mode          │
│  role_id (fk)       │         │   cycle_number  │
│  alive              │         │   started_at    │
│  joined             │         │   ended_at      │
│  ready              │         │   winner        │
│  vote_choice        │         └─────────────────┘
│  target_player_id   │
│  ...                │         ┌─────────────────┐
└─────────┬───────────┘    ┌───▶│      roles      │
          │                │    │   id (uuid)     │
          │                │    │   name          │
          │ N:N            │    │   team          │
          │                │    │   description   │
┌─────────▼───────────┐    │    │   has_action    │
│    role_votes       │    │    │   order         │
│  id (uuid)          │    │    └─────────────────┘
│  game_id (fk)       │    │
│  player_id (fk)     │    │
│  role_id (fk) ──────┼────┘
│  vote               │
└─────────────────────┘

┌──────────────────────┐
│       events         │
│  id (uuid)           │
│  game_id (fk)        │
│  type                │
│  message             │
│  cycle_number        │
│  created_at          │
└──────────────────────┘

┌──────────────────────┐
│    game_history      │
│  id (uuid)           │
│  game_id (fk)        │
│  cycle_number        │
│  player_states       │ (JSONB)
│  events              │ (JSONB)
│  created_at          │
└──────────────────────┘

┌──────────────────────┐
│    game_settings     │
│  id (uuid)           │
│  double_jeopardy     │
│  reveal_role         │
│  time_delays         │ (JSONB)
│  created_at          │
└──────────────────────┘
```

### 2.3 Create Migration

**supabase/migrations/001_initial_schema.sql:**

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE games;
ALTER PUBLICATION supabase_realtime ADD TABLE players;
ALTER PUBLICATION supabase_realtime ADD TABLE events;

-- Game status enum
CREATE TYPE game_status AS ENUM ('waiting', 'active', 'ended');
CREATE TYPE game_mode AS ENUM ('lobby', 'day', 'night', 'endgame');
CREATE TYPE player_team AS ENUM ('villagers', 'werewolves');
CREATE TYPE event_type AS ENUM ('death', 'lynch', 'werewolf_kill', 'info', 'warning');

-- Roles table (static data)
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  team player_team NOT NULL,
  description TEXT NOT NULL,
  short_description TEXT,
  has_night_action BOOLEAN DEFAULT false,
  is_passive BOOLEAN DEFAULT false,
  order_priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status game_status DEFAULT 'waiting',
  mode game_mode DEFAULT 'lobby',
  cycle_number INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  winner player_team,
  host_user_id UUID REFERENCES auth.users(id),
  settings JSONB DEFAULT '{
    "doubleJeopardy": true,
    "revealRole": true,
    "timeDelays": {
      "voteTimeout": 60,
      "executionDelay": 10,
      "nightDuration": 120
    }
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id),

  -- Player state
  alive BOOLEAN DEFAULT true,
  joined BOOLEAN DEFAULT false,
  ready BOOLEAN DEFAULT false,

  -- Voting
  vote_choice INTEGER DEFAULT 0, -- 0=abstain, 1=for, 2=against
  do_nothing_vote INTEGER DEFAULT 0,

  -- Actions
  target_player_id UUID REFERENCES players(id),
  night_action_done BOOLEAN DEFAULT false,
  doing_night_action BOOLEAN DEFAULT false,

  -- Effects
  effect TEXT, -- 'save', 'hex', etc.
  previous_nominations UUID[], -- Array of player IDs nominated today

  -- UI state
  seen_role BOOLEAN DEFAULT false,
  seen_death BOOLEAN DEFAULT false,
  seen_new_events BOOLEAN DEFAULT false,
  seen_night_results BOOLEAN DEFAULT false,
  seen_endgame BOOLEAN DEFAULT false,

  -- Death details
  death_cycle INTEGER,
  death_type TEXT, -- 'lynch', 'werewolf', 'saint'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Constraints
  UNIQUE(game_id, user_id)
);

-- Role votes table
CREATE TABLE role_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  vote INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(game_id, player_id, role_id)
);

-- Events table
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  type event_type NOT NULL,
  message TEXT NOT NULL,
  cycle_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Game history table
CREATE TABLE game_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  cycle_number INTEGER NOT NULL,
  player_states JSONB NOT NULL, -- Snapshot of all player states
  events JSONB, -- Events that happened this cycle
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(game_id, cycle_number)
);

-- Game settings table
CREATE TABLE game_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  double_jeopardy BOOLEAN DEFAULT true,
  reveal_role BOOLEAN DEFAULT true,
  time_delays JSONB DEFAULT '{
    "voteTimeout": 60,
    "executionDelay": 10,
    "nightDuration": 120,
    "gameStartDelay": 5
  }'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_players_game_id ON players(game_id);
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_alive ON players(alive);
CREATE INDEX idx_events_game_id ON events(game_id);
CREATE INDEX idx_events_cycle ON events(cycle_number);
CREATE INDEX idx_game_history_game_id ON game_history(game_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add update triggers
CREATE TRIGGER update_games_updated_at BEFORE UPDATE ON games
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON players
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2.4 Row Level Security (RLS) Policies

**supabase/migrations/002_rls_policies.sql:**

```sql
-- Enable RLS on all tables
ALTER TABLE games ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- Roles: Everyone can read
CREATE POLICY "Roles are publicly readable"
  ON roles FOR SELECT
  TO authenticated
  USING (true);

-- Games: Anyone can read active games
CREATE POLICY "Games are publicly readable"
  ON games FOR SELECT
  TO authenticated
  USING (true);

-- Games: Only host can create
CREATE POLICY "Users can create games"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = host_user_id);

-- Games: Only host can update
CREATE POLICY "Host can update their game"
  ON games FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_user_id);

-- Players: Can read players in games they're in
CREATE POLICY "Players can read other players in their game"
  ON players FOR SELECT
  TO authenticated
  USING (
    game_id IN (
      SELECT game_id FROM players WHERE user_id = auth.uid()
    )
  );

-- Players: Can insert themselves into a game
CREATE POLICY "Users can join games"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Players: Can only update their own player record
CREATE POLICY "Players can update themselves"
  ON players FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Role Votes: Can read votes in their game
CREATE POLICY "Can read role votes in their game"
  ON role_votes FOR SELECT
  TO authenticated
  USING (
    game_id IN (
      SELECT game_id FROM players WHERE user_id = auth.uid()
    )
  );

-- Role Votes: Can create/update their own votes
CREATE POLICY "Can manage their own role votes"
  ON role_votes FOR ALL
  TO authenticated
  USING (
    player_id IN (
      SELECT id FROM players WHERE user_id = auth.uid()
    )
  );

-- Events: Can read events from their game
CREATE POLICY "Can read events from their game"
  ON events FOR SELECT
  TO authenticated
  USING (
    game_id IN (
      SELECT game_id FROM players WHERE user_id = auth.uid()
    )
  );

-- Game History: Can read history from games they participated in
CREATE POLICY "Can read game history"
  ON game_history FOR SELECT
  TO authenticated
  USING (
    game_id IN (
      SELECT game_id FROM players WHERE user_id = auth.uid()
    )
  );
```

### 2.5 Seed Initial Data

**supabase/migrations/003_seed_roles.sql:**

```sql
-- Insert all game roles
INSERT INTO roles (name, team, description, short_description, has_night_action, is_passive, order_priority) VALUES
  (
    'Villager',
    'villagers',
    'A regular villager with no special abilities. Your goal is to identify and eliminate all werewolves.',
    'No special abilities',
    false,
    true,
    1
  ),
  (
    'Werewolf',
    'werewolves',
    'A werewolf who kills villagers at night. You must work with other werewolves to choose a victim.',
    'Kills at night',
    true,
    false,
    2
  ),
  (
    'Doctor',
    'villagers',
    'Can save one person from werewolf attacks each night. You can save yourself.',
    'Saves one person per night',
    true,
    false,
    3
  ),
  (
    'Seer',
    'villagers',
    'Can check if one player is a werewolf each night. Use this information wisely.',
    'Checks one player per night',
    true,
    false,
    4
  ),
  (
    'Witch',
    'villagers',
    'Can silence one player for the next day cycle, preventing them from nominating or voting.',
    'Silences one player',
    true,
    false,
    5
  ),
  (
    'Knight',
    'villagers',
    'Cannot be killed by werewolves at night, but can still be lynched during the day.',
    'Immune to werewolf attacks',
    false,
    true,
    6
  ),
  (
    'Saint',
    'villagers',
    'If lynched during the day, the player who nominated you dies with you.',
    'Kills their nominator if lynched',
    false,
    true,
    7
  );
```

### 2.6 Generate TypeScript Types

```bash
# Generate types from database schema
npx supabase gen types typescript --linked > types/database.types.ts
```

This creates a fully typed interface to your database!

### 2.7 Database Functions (Game Logic)

**supabase/migrations/004_game_functions.sql:**

```sql
-- Function: Assign roles to players
CREATE OR REPLACE FUNCTION assign_roles(game_uuid UUID)
RETURNS void AS $$
DECLARE
  player_count INTEGER;
  werewolf_count INTEGER;
  player_record RECORD;
  role_record RECORD;
  roles_pool UUID[];
  assigned_roles UUID[];
BEGIN
  -- Count players
  SELECT COUNT(*) INTO player_count
  FROM players
  WHERE game_id = game_uuid AND joined = true;

  -- Calculate werewolves (1/3 of players)
  werewolf_count := GREATEST(1, CEIL(player_count::NUMERIC / 3));

  -- Get werewolf role ID
  FOR player_record IN
    SELECT id FROM players
    WHERE game_id = game_uuid AND joined = true
    ORDER BY RANDOM()
    LIMIT werewolf_count
  LOOP
    UPDATE players
    SET role_id = (SELECT id FROM roles WHERE name = 'Werewolf')
    WHERE id = player_record.id;
  END LOOP;

  -- Get enabled roles (exclude werewolf)
  SELECT ARRAY_AGG(id) INTO roles_pool
  FROM roles
  WHERE name != 'Werewolf';

  -- Assign remaining roles
  FOR player_record IN
    SELECT id FROM players
    WHERE game_id = game_uuid AND role_id IS NULL
  LOOP
    UPDATE players
    SET role_id = roles_pool[1 + (random() * (array_length(roles_pool, 1) - 1))::INTEGER]
    WHERE id = player_record.id;
  END LOOP;

  -- Mark roles as assigned
  UPDATE games
  SET mode = 'day', cycle_number = 1, started_at = NOW()
  WHERE id = game_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function: Check win conditions
CREATE OR REPLACE FUNCTION check_win_condition(game_uuid UUID)
RETURNS TEXT AS $$
DECLARE
  werewolf_count INTEGER;
  villager_count INTEGER;
  has_doctor BOOLEAN;
  has_knight BOOLEAN;
BEGIN
  -- Count living werewolves
  SELECT COUNT(*) INTO werewolf_count
  FROM players p
  JOIN roles r ON p.role_id = r.id
  WHERE p.game_id = game_uuid
    AND p.alive = true
    AND r.team = 'werewolves';

  -- Count living villagers
  SELECT COUNT(*) INTO villager_count
  FROM players p
  JOIN roles r ON p.role_id = r.id
  WHERE p.game_id = game_uuid
    AND p.alive = true
    AND r.team = 'villagers';

  -- Check for special roles
  SELECT EXISTS(
    SELECT 1 FROM players p
    JOIN roles r ON p.role_id = r.id
    WHERE p.game_id = game_uuid
      AND p.alive = true
      AND r.name = 'Doctor'
  ) INTO has_doctor;

  SELECT EXISTS(
    SELECT 1 FROM players p
    JOIN roles r ON p.role_id = r.id
    WHERE p.game_id = game_uuid
      AND p.alive = true
      AND r.name = 'Knight'
  ) INTO has_knight;

  -- Check win conditions
  IF werewolf_count = 0 THEN
    RETURN 'villagers';
  ELSIF werewolf_count >= villager_count AND NOT (has_doctor OR has_knight) THEN
    RETURN 'werewolves';
  ELSE
    RETURN 'continue';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Phase 2 Checklist

- [ ] Supabase project created
- [ ] Database schema designed
- [ ] Initial migration created
- [ ] RLS policies implemented
- [ ] Seed data added (roles)
- [ ] TypeScript types generated
- [ ] Database functions created
- [ ] Indexes added for performance
- [ ] Real-time enabled on necessary tables
- [ ] Schema documented

---

## Phase 3: Authentication

**Goal:** Implement user authentication with Supabase Auth

### 3.1 Auth Middleware

**middleware.ts:**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes
  const protectedPaths = ['/lobby', '/game']
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isProtectedPath && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect logged-in users away from auth pages
  const authPaths = ['/login', '/signup']
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  )

  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/lobby', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 3.2 Auth Hooks

**lib/hooks/useAuth.ts:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  return { user, loading }
}
```

### 3.3 Login Page

**app/(auth)/login/page.tsx:**
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Logged in successfully!')
      router.push('/lobby')
    }

    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
    }
  }

  const handleFacebookLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-bold">Werewolves Game</h2>
          <p className="mt-2 text-center text-gray-600">
            Sign in to join a game
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
          >
            Google
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleFacebookLogin}
          >
            Facebook
          </Button>
        </div>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <a href="/signup" className="font-medium text-blue-600 hover:text-blue-500">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
```

### 3.4 OAuth Callback Handler

**app/auth/callback/route.ts:**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete(name)
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to lobby after successful login
  return NextResponse.redirect(new URL('/lobby', request.url))
}
```

### 3.5 User Profile Management

**lib/hooks/useUserProfile.ts:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'

interface UserProfile {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
}

export function useUserProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    // Get user metadata
    const userProfile: UserProfile = {
      id: user.id,
      email: user.email!,
      name: user.user_metadata.full_name || user.user_metadata.name || null,
      avatar_url: user.user_metadata.avatar_url || null,
    }

    setProfile(userProfile)
    setLoading(false)
  }, [user])

  return { profile, loading }
}
```

### Phase 3 Checklist

- [ ] Auth middleware implemented
- [ ] Login page created
- [ ] Signup page created
- [ ] OAuth callback handler implemented
- [ ] Google OAuth configured
- [ ] Facebook OAuth configured
- [ ] Auth hooks created
- [ ] Protected routes configured
- [ ] User profile management implemented
- [ ] Logout functionality added

---

## Phase 4: Real-time Infrastructure

**Goal:** Set up real-time subscriptions and presence tracking

### 4.1 Real-time Game State Hook

**lib/hooks/useGameState.ts:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'
import type { RealtimeChannel } from '@supabase/supabase-js'

type Game = Database['public']['Tables']['games']['Row']

export function useGameState(gameId: string | null) {
  const [game, setGame] = useState<Game | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!gameId) {
      setGame(null)
      setLoading(false)
      return
    }

    let channel: RealtimeChannel

    // Initial fetch
    supabase
      .from('games')
      .select('*')
      .eq('id', gameId)
      .single()
      .then(({ data, error }) => {
        if (!error && data) {
          setGame(data)
        }
        setLoading(false)
      })

    // Subscribe to changes
    channel = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          setGame(payload.new as Game)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId, supabase])

  return { game, loading }
}
```

### 4.2 Players Subscription Hook

**lib/hooks/usePlayers.ts:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Player = Database['public']['Tables']['players']['Row'] & {
  users: {
    email: string
    user_metadata: {
      name?: string
      avatar_url?: string
    }
  }
  roles: {
    name: string
    team: string
  } | null
}

export function usePlayers(gameId: string | null) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!gameId) {
      setPlayers([])
      setLoading(false)
      return
    }

    // Initial fetch
    supabase
      .from('players')
      .select(`
        *,
        users:user_id (email, user_metadata),
        roles:role_id (name, team)
      `)
      .eq('game_id', gameId)
      .eq('joined', true)
      .then(({ data, error }) => {
        if (!error && data) {
          setPlayers(data as Player[])
        }
        setLoading(false)
      })

    // Subscribe to changes
    const channel = supabase
      .channel(`players:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'players',
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          // Refetch when changes occur
          supabase
            .from('players')
            .select(`
              *,
              users:user_id (email, user_metadata),
              roles:role_id (name, team)
            `)
            .eq('game_id', gameId)
            .eq('joined', true)
            .then(({ data, error }) => {
              if (!error && data) {
                setPlayers(data as Player[])
              }
            })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId, supabase])

  return { players, loading }
}
```

### 4.3 Events Feed Hook

**lib/hooks/useEvents.ts:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type Event = Database['public']['Tables']['events']['Row']

export function useEvents(gameId: string | null, cycleNumber?: number) {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    if (!gameId) {
      setEvents([])
      setLoading(false)
      return
    }

    let query = supabase
      .from('events')
      .select('*')
      .eq('game_id', gameId)
      .order('created_at', { ascending: false })

    if (cycleNumber !== undefined) {
      query = query.eq('cycle_number', cycleNumber)
    }

    // Initial fetch
    query.then(({ data, error }) => {
      if (!error && data) {
        setEvents(data)
      }
      setLoading(false)
    })

    // Subscribe to new events
    const channel = supabase
      .channel(`events:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
          filter: `game_id=eq.${gameId}`,
        },
        (payload) => {
          const newEvent = payload.new as Event
          if (cycleNumber === undefined || newEvent.cycle_number === cycleNumber) {
            setEvents((prev) => [newEvent, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId, cycleNumber, supabase])

  return { events, loading }
}
```

### 4.4 Presence Tracking

**lib/hooks/usePresence.ts:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './useAuth'

interface PresenceState {
  user_id: string
  name: string
  online_at: string
}

export function usePresence(gameId: string | null) {
  const [presences, setPresences] = useState<Record<string, PresenceState>>({})
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    if (!gameId || !user) return

    const channel = supabase.channel(`game-presence:${gameId}`)

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceState>()
        setPresences(state)
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('New users joined:', newPresences)
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('Users left:', leftPresences)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            user_id: user.id,
            name: user.user_metadata.name || user.email,
            online_at: new Date().toISOString(),
          })
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [gameId, user, supabase])

  return { presences }
}
```

### 4.5 Broadcast for Real-time Actions

**lib/hooks/useBroadcast.ts:**
```typescript
'use client'

import { useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface BroadcastMessage {
  type: string
  payload: any
}

export function useBroadcast(
  gameId: string | null,
  onMessage?: (message: BroadcastMessage) => void
) {
  const supabase = createClient()
  let channel: RealtimeChannel | null = null

  useEffect(() => {
    if (!gameId) return

    channel = supabase.channel(`game-broadcast:${gameId}`)

    if (onMessage) {
      channel.on('broadcast', { event: 'game-action' }, ({ payload }) => {
        onMessage(payload as BroadcastMessage)
      })
    }

    channel.subscribe()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [gameId, onMessage, supabase])

  const broadcast = useCallback(
    (type: string, payload: any) => {
      if (!channel) return

      channel.send({
        type: 'broadcast',
        event: 'game-action',
        payload: { type, payload },
      })
    },
    [channel]
  )

  return { broadcast }
}
```

### Phase 4 Checklist

- [ ] Real-time game state hook implemented
- [ ] Players subscription hook created
- [ ] Events feed hook created
- [ ] Presence tracking implemented
- [ ] Broadcast functionality added
- [ ] Real-time enabled on Supabase tables
- [ ] Connection handling implemented
- [ ] Reconnection logic added
- [ ] Performance optimized (debouncing, etc.)

---

## Phase 5: Game Logic Migration

**Goal:** Port all game logic from Meteor methods to Edge Functions and database functions

### 5.1 Type Definitions

**lib/game/types.ts:**
```typescript
import type { Database } from '@/types/database.types'

export type GameStatus = Database['public']['Enums']['game_status']
export type GameMode = Database['public']['Enums']['game_mode']
export type PlayerTeam = Database['public']['Enums']['player_team']
export type EventType = Database['public']['Enums']['event_type']

export interface GameState {
  id: string
  status: GameStatus
  mode: GameMode
  cycle_number: number
  started_at: string | null
  ended_at: string | null
  winner: PlayerTeam | null
}

export interface Player {
  id: string
  game_id: string
  user_id: string
  role_id: string | null
  alive: boolean
  joined: boolean
  ready: boolean
  vote_choice: number
  target_player_id: string | null
  night_action_done: boolean
  effect: string | null
  previous_nominations: string[]
  seen_role: boolean
  death_cycle: number | null
  death_type: string | null
}

export interface Role {
  id: string
  name: string
  team: PlayerTeam
  description: string
  has_night_action: boolean
  is_passive: boolean
}

export interface VoteResult {
  for_count: number
  against_count: number
  abstain_count: number
  total_voters: number
  majority_needed: number
  passes: boolean
}
```

### 5.2 Role Assignment Logic

**supabase/functions/assign-roles/index.ts:**
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../_shared/database.types.ts'

Deno.serve(async (req) => {
  try {
    const { gameId } = await req.json()

    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all joined players
    const { data: players, error: playersError } = await supabaseClient
      .from('players')
      .select('id')
      .eq('game_id', gameId)
      .eq('joined', true)

    if (playersError || !players) {
      throw new Error('Failed to fetch players')
    }

    const playerCount = players.length
    const werewolfCount = Math.max(1, Math.ceil(playerCount / 3))

    // Get role IDs
    const { data: roles } = await supabaseClient
      .from('roles')
      .select('id, name')

    const werewolfRoleId = roles?.find((r) => r.name === 'Werewolf')?.id
    const villagerRoleId = roles?.find((r) => r.name === 'Villager')?.id

    if (!werewolfRoleId || !villagerRoleId) {
      throw new Error('Required roles not found')
    }

    // Shuffle players
    const shuffled = [...players].sort(() => Math.random() - 0.5)

    // Assign werewolves
    for (let i = 0; i < werewolfCount; i++) {
      await supabaseClient
        .from('players')
        .update({ role_id: werewolfRoleId })
        .eq('id', shuffled[i].id)
    }

    // Assign villagers to remaining
    for (let i = werewolfCount; i < shuffled.length; i++) {
      await supabaseClient
        .from('players')
        .update({ role_id: villagerRoleId })
        .eq('id', shuffled[i].id)
    }

    // Update game state
    await supabaseClient
      .from('games')
      .update({
        mode: 'day',
        cycle_number: 1,
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .eq('id', gameId)

    // Create game start event
    await supabaseClient.from('events').insert({
      game_id: gameId,
      type: 'info',
      message: 'Game started! Roles have been assigned.',
      cycle_number: 1,
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

### 5.3 Vote Counting Logic

**lib/game/voting.ts:**
```typescript
import type { VoteResult } from './types'
import type { Database } from '@/types/database.types'
import { createClient } from '@/lib/supabase/client'

export async function countLynchVotes(
  gameId: string
): Promise<VoteResult> {
  const supabase = createClient()

  const { data: players } = await supabase
    .from('players')
    .select('vote_choice')
    .eq('game_id', gameId)
    .eq('alive', true)

  if (!players) {
    throw new Error('Failed to fetch players')
  }

  const forCount = players.filter((p) => p.vote_choice === 1).length
  const againstCount = players.filter((p) => p.vote_choice === 2).length
  const abstainCount = players.filter((p) => p.vote_choice === 0).length
  const totalVoters = players.length
  const majorityNeeded = Math.floor(totalVoters / 2) + 1

  return {
    for_count: forCount,
    against_count: againstCount,
    abstain_count: abstainCount,
    total_voters: totalVoters,
    majority_needed: majorityNeeded,
    passes: forCount >= majorityNeeded,
  }
}
```

### 5.4 Win Condition Check

**lib/game/winCondition.ts:**
```typescript
import { createClient } from '@/lib/supabase/client'
import type { PlayerTeam } from './types'

export async function checkWinCondition(
  gameId: string
): Promise<PlayerTeam | 'continue'> {
  const supabase = createClient()

  // Get all living players with their roles
  const { data: players } = await supabase
    .from('players')
    .select(`
      id,
      alive,
      roles:role_id (
        name,
        team
      )
    `)
    .eq('game_id', gameId)
    .eq('alive', true)

  if (!players) {
    throw new Error('Failed to fetch players')
  }

  const werewolves = players.filter(
    (p) => p.roles?.team === 'werewolves'
  )
  const villagers = players.filter(
    (p) => p.roles?.team === 'villagers'
  )

  const hasDoctor = villagers.some((p) => p.roles?.name === 'Doctor')
  const hasKnight = villagers.some((p) => p.roles?.name === 'Knight')

  // Villagers win if no werewolves left
  if (werewolves.length === 0) {
    return 'villagers'
  }

  // Werewolves win if they equal or outnumber villagers
  // (unless Doctor or Knight is still alive)
  if (
    werewolves.length >= villagers.length &&
    !hasDoctor &&
    !hasKnight
  ) {
    return 'werewolves'
  }

  return 'continue'
}
```

### 5.5 Night Action Resolution

**supabase/functions/resolve-night/index.ts:**
```typescript
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../_shared/database.types.ts'

Deno.serve(async (req) => {
  try {
    const { gameId } = await req.json()

    const supabaseClient = createClient<Database>(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all players with actions
    const { data: players } = await supabaseClient
      .from('players')
      .select(`
        id,
        target_player_id,
        roles:role_id (
          name,
          team
        )
      `)
      .eq('game_id', gameId)
      .eq('alive', true)

    if (!players) {
      throw new Error('Failed to fetch players')
    }

    // Find werewolf targets
    const werewolves = players.filter((p) => p.roles?.name === 'Werewolf')
    const werewolfTargets = werewolves.map((w) => w.target_player_id)

    // Werewolves must agree on target
    const werewolfTarget =
      werewolfTargets.length > 0 &&
      werewolfTargets.every((t) => t === werewolfTargets[0])
        ? werewolfTargets[0]
        : null

    // Find doctor save
    const doctor = players.find((p) => p.roles?.name === 'Doctor')
    const doctorSave = doctor?.target_player_id || null

    // Find knight
    const knight = players.find((p) => p.roles?.name === 'Knight')
    const knightId = knight?.id || null

    // Resolve kill
    let killedPlayerId: string | null = null
    if (werewolfTarget) {
      const isProtected =
        werewolfTarget === doctorSave || werewolfTarget === knightId

      if (!isProtected) {
        killedPlayerId = werewolfTarget

        // Mark player as dead
        await supabaseClient
          .from('players')
          .update({
            alive: false,
            death_cycle: await getCurrentCycle(supabaseClient, gameId),
            death_type: 'werewolf',
          })
          .eq('id', killedPlayerId)

        // Create death event
        const { data: victim } = await supabaseClient
          .from('players')
          .select('users:user_id(user_metadata)')
          .eq('id', killedPlayerId)
          .single()

        const victimName = victim?.users?.user_metadata?.name || 'A player'

        await supabaseClient.from('events').insert({
          game_id: gameId,
          type: 'werewolf_kill',
          message: `${victimName} was killed by werewolves during the night.`,
          cycle_number: await getCurrentCycle(supabaseClient, gameId),
        })
      }
    }

    // Apply witch hex
    const witch = players.find((p) => p.roles?.name === 'Witch')
    if (witch?.target_player_id) {
      await supabaseClient
        .from('players')
        .update({ effect: 'hex' })
        .eq('id', witch.target_player_id)
    }

    // Advance to day
    const currentCycle = await getCurrentCycle(supabaseClient, gameId)
    await supabaseClient
      .from('games')
      .update({
        mode: 'day',
        cycle_number: currentCycle + 1,
      })
      .eq('id', gameId)

    // Reset player states
    await supabaseClient
      .from('players')
      .update({
        night_action_done: false,
        target_player_id: null,
        seen_night_results: false,
      })
      .eq('game_id', gameId)

    return new Response(JSON.stringify({ success: true, killedPlayerId }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})

async function getCurrentCycle(client: any, gameId: string): Promise<number> {
  const { data } = await client
    .from('games')
    .select('cycle_number')
    .eq('id', gameId)
    .single()

  return data?.cycle_number || 0
}
```

### 5.6 Client-side Game Actions

**lib/game/actions.ts:**
```typescript
import { createClient } from '@/lib/supabase/client'

export async function nominate(gameId: string, targetId: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  // Get current player
  const { data: player } = await supabase
    .from('players')
    .select('id, alive, previous_nominations')
    .eq('game_id', gameId)
    .eq('user_id', user.id)
    .single()

  if (!player || !player.alive) {
    throw new Error('Cannot nominate while dead')
  }

  // Check double jeopardy
  if (player.previous_nominations?.includes(targetId)) {
    throw new Error('Cannot nominate the same player twice')
  }

  // Update nomination list
  const { error } = await supabase
    .from('players')
    .update({
      previous_nominations: [...(player.previous_nominations || []), targetId],
    })
    .eq('id', player.id)

  if (error) throw error

  // Create nomination event
  await supabase.from('events').insert({
    game_id: gameId,
    type: 'info',
    message: `A player has been nominated for lynch.`,
    cycle_number: await getCurrentCycle(gameId),
  })
}

export async function vote(
  gameId: string,
  choice: 0 | 1 | 2 // 0=abstain, 1=for, 2=against
) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('players')
    .update({ vote_choice: choice })
    .eq('game_id', gameId)
    .eq('user_id', user.id)

  if (error) throw error
}

export async function setNightAction(
  gameId: string,
  targetId: string | null
) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('players')
    .update({
      target_player_id: targetId,
      night_action_done: targetId !== null,
    })
    .eq('game_id', gameId)
    .eq('user_id', user.id)

  if (error) throw error
}

async function getCurrentCycle(gameId: string): Promise<number> {
  const supabase = createClient()
  const { data } = await supabase
    .from('games')
    .select('cycle_number')
    .eq('id', gameId)
    .single()

  return data?.cycle_number || 0
}
```

### Phase 5 Checklist

- [ ] Type definitions created
- [ ] Role assignment logic implemented
- [ ] Vote counting logic implemented
- [ ] Win condition check implemented
- [ ] Night action resolution implemented
- [ ] Lynch execution implemented
- [ ] Saint mechanic implemented
- [ ] Double jeopardy validation implemented
- [ ] Client-side actions created
- [ ] Edge Functions deployed
- [ ] All game logic tested

---

*Due to length constraints, I'll continue with the remaining phases in the document...*

## Phase 6: UI Components

**Goal:** Build React components matching original UI/UX

### 6.1 Component Architecture

We'll recreate the Blaze templates as React components while maintaining the same visual design (Semantic UI → Tailwind CSS).

### 6.2 Lobby Screen

**app/(game)/lobby/page.tsx:**
```typescript
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useGameState } from '@/lib/hooks/useGameState'
import { usePlayers } from '@/lib/hooks/usePlayers'
import { PlayerList } from '@/components/game/PlayerList'
import { RoleVoting } from '@/components/game/RoleVoting'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function LobbyPage() {
  const { user } = useAuth()
  const [gameId, setGameId] = useState<string | null>(null)
  const { game } = useGameState(gameId)
  const { players } = usePlayers(gameId)
  const supabase = createClient()

  useEffect(() => {
    if (!user) return

    // Find or create game for this user
    supabase
      .from('players')
      .select('game_id')
      .eq('user_id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setGameId(data.game_id)
        } else {
          // Create new game and join
          createAndJoinGame()
        }
      })
  }, [user])

  const createAndJoinGame = async () => {
    const { data: newGame } = await supabase
      .from('games')
      .insert({
        host_user_id: user!.id,
      })
      .select()
      .single()

    if (newGame) {
      await supabase.from('players').insert({
        game_id: newGame.id,
        user_id: user!.id,
        joined: true,
      })

      setGameId(newGame.id)
    }
  }

  const handleReady = async () => {
    await supabase
      .from('players')
      .update({ ready: !currentPlayer?.ready })
      .eq('user_id', user!.id)
      .eq('game_id', gameId!)
  }

  const handleStart = async () => {
    // Call Edge Function to assign roles and start game
    const response = await fetch('/api/game/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId }),
    })

    if (response.ok) {
      // Game will start and redirect via real-time subscription
    }
  }

  const currentPlayer = players.find((p) => p.user_id === user?.id)
  const allReady = players.every((p) => p.ready)
  const isHost = game?.host_user_id === user?.id

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold mb-8">Game Lobby</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-2xl font-semibold mb-4">Players</h2>
          <PlayerList players={players} />

          <div className="mt-4 space-x-4">
            <Button onClick={handleReady}>
              {currentPlayer?.ready ? 'Not Ready' : 'Ready'}
            </Button>

            {isHost && allReady && players.length >= 5 && (
              <Button onClick={handleStart} variant="primary">
                Start Game
              </Button>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold mb-4">Vote for Roles</h2>
          <RoleVoting gameId={gameId} />
        </div>
      </div>
    </div>
  )
}
```

### 6.3 Game Screen

**app/(game)/game/[gameId]/page.tsx:**
```typescript
'use client'

import { useGameState } from '@/lib/hooks/useGameState'
import { usePlayers } from '@/lib/hooks/usePlayers'
import { useEvents } from '@/lib/hooks/useEvents'
import { PlayerList } from '@/components/game/PlayerList'
import { EventFeed } from '@/components/game/EventFeed'
import { DayPanel } from '@/components/game/DayPanel'
import { NightPanel } from '@/components/game/NightPanel'
import { EndgameScreen } from '@/components/game/EndgameScreen'

export default function GamePage({
  params,
}: {
  params: { gameId: string }
}) {
  const { game } = useGameState(params.gameId)
  const { players } = usePlayers(params.gameId)
  const { events } = useEvents(params.gameId, game?.cycle_number)

  if (!game) {
    return <div>Loading...</div>
  }

  if (game.mode === 'endgame') {
    return <EndgameScreen game={game} players={players} />
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">
          Cycle {game.cycle_number} - {game.mode.toUpperCase()}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Players */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-2">Players</h2>
          <PlayerList players={players} showStatus />
        </div>

        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          {/* Events */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Events</h2>
            <EventFeed events={events} />
          </div>

          {/* Action panel */}
          <div>
            {game.mode === 'day' ? (
              <DayPanel gameId={params.gameId} players={players} />
            ) : (
              <NightPanel gameId={params.gameId} players={players} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

### 6.4 Key Components

**components/game/PlayerList.tsx**
**components/game/EventFeed.tsx**
**components/game/VotePanel.tsx**
**components/game/NightActionPanel.tsx**
**components/game/RoleCard.tsx**
**components/game/ColorMinigame.tsx**

(Full implementation details for each component...)

### Phase 6 Checklist

- [ ] Lobby screen created
- [ ] Game screen created
- [ ] Player list component
- [ ] Event feed component
- [ ] Vote panel component
- [ ] Night action panel
- [ ] Role card component
- [ ] Color minigame component
- [ ] Endgame screen created
- [ ] History browser created
- [ ] Responsive design implemented
- [ ] Accessibility features added

---

## Phase 7: Testing

**Goal:** Comprehensive test coverage

### 7.1 Unit Tests

```bash
npm run test
```

### 7.2 Integration Tests

### 7.3 E2E Tests

```bash
npm run test:e2e
```

### Phase 7 Checklist

- [ ] Unit tests for game logic (>80% coverage)
- [ ] Integration tests for database functions
- [ ] E2E tests for full game flow
- [ ] Performance tests
- [ ] Security tests
- [ ] Cross-browser tests
- [ ] Mobile tests

---

## Phase 8: Deployment

**Goal:** Deploy to production

### 8.1 Deploy to Vercel

```bash
vercel --prod
```

### 8.2 Configure Production Environment

### 8.3 Monitor and Debug

### Phase 8 Checklist

- [ ] Deployed to Vercel
- [ ] Environment variables configured
- [ ] Custom domain set up
- [ ] SSL certificates configured
- [ ] Analytics integrated
- [ ] Error tracking configured (Sentry)
- [ ] Performance monitoring enabled
- [ ] Backups configured

---

## Feature Parity Checklist

### Core Gameplay
- [ ] Lobby system with role voting
- [ ] Game start with countdown
- [ ] Role assignment (1/3 werewolves)
- [ ] Day/night cycles
- [ ] Lynch nomination and voting
- [ ] Night actions (all roles)
- [ ] Win condition detection
- [ ] Game history tracking

### Roles
- [ ] Villager (passive)
- [ ] Werewolf (kill at night)
- [ ] Doctor (save at night)
- [ ] Seer (check werewolf)
- [ ] Witch (silence player)
- [ ] Knight (immune to werewolves)
- [ ] Saint (revenge on lynch)

### Features
- [ ] Facebook/Google OAuth
- [ ] Avatar display
- [ ] Real-time updates
- [ ] Spectator mode
- [ ] Game history browser
- [ ] Double jeopardy rule
- [ ] Role reveal setting
- [ ] Color minigame
- [ ] Event feed
- [ ] Death screens
- [ ] Endgame screen

---

## Post-Migration

### Monitoring

1. **Performance Metrics**
   - Vercel Analytics
   - Core Web Vitals
   - Database query performance

2. **Error Tracking**
   - Sentry integration
   - Real-time error alerts
   - User feedback system

3. **User Analytics**
   - Game completion rates
   - Average game duration
   - Player retention

### Maintenance

1. **Regular Updates**
   - Next.js version updates
   - Dependency updates
   - Security patches

2. **Database Management**
   - Regular backups
   - Index optimization
   - Query performance monitoring

3. **User Feedback**
   - Bug reports
   - Feature requests
   - Balance changes

### Future Enhancements

1. **New Features**
   - Additional roles
   - Game modes (e.g., rapid fire)
   - Ranked matchmaking
   - Tournaments

2. **Mobile App**
   - React Native version
   - Push notifications
   - Offline mode

3. **Social Features**
   - Friend lists
   - Private games
   - Chat system
   - Player profiles

---

## Conclusion

This migration guide provides a complete roadmap from Meteor 1.2.1 to Next.js 15 + Supabase. The new stack offers:

✅ **Modern Infrastructure** - Latest frameworks and tools
✅ **Better Security** - Row Level Security, no client-side database access
✅ **Type Safety** - Full TypeScript coverage
✅ **Real-time** - Supabase Realtime for multiplayer
✅ **Scalability** - Edge deployment, CDN distribution
✅ **Developer Experience** - Great tooling, fast iteration
✅ **Deployment** - Simple, automated, preview environments

The migration is substantial but results in a modern, maintainable, secure application ready for production deployment and future growth.

Good luck with the migration! 🎉
