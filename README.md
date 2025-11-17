# Werewolves Game

A multiplayer social deduction game built with Next.js 15 and Supabase.

## 🎮 About

Werewolves (also known as Mafia) is a party game where players are secretly assigned roles as either Werewolves or Villagers. During the day, players discuss and vote to eliminate suspected Werewolves. At night, Werewolves choose their victims while special roles use their abilities.

## 🚀 Tech Stack

- **Frontend:** Next.js 15 (App Router) + React 19
- **Backend:** Supabase (PostgreSQL + Real-time + Auth)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Testing:** Vitest + Playwright
- **Deployment:** Vercel

## ✨ Features

- 🔐 Secure authentication (Email/Password + OAuth)
- 👥 Real-time multiplayer gameplay
- 🎭 7 unique roles (Villager, Werewolf, Doctor, Seer, Witch, Knight, Saint)
- 🌙 Day/Night cycle gameplay
- 💬 Event feed and game history
- 📱 Responsive design
- 🔒 Row-level security (RLS)
- ⚡ Real-time presence tracking

## 📋 Prerequisites

- Node.js 18+ and npm
- A Supabase account (free tier works)

## 🛠️ Setup

### 1. Clone and Install

```bash
cd Werewolves
npm install
```

### 2. Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Create a new project
3. Wait for setup to complete (~2 minutes)

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials from Settings > API:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Run Database Migrations

In the Supabase SQL Editor, run these files in order:

1. `supabase/migrations/001_initial_schema.sql`
2. `supabase/migrations/002_rls_policies.sql`
3. `supabase/migrations/003_seed_roles.sql`
4. `supabase/migrations/004_game_functions.sql`

### 5. Enable Realtime

In Supabase Dashboard:
- Go to Database > Replication
- Enable realtime for: `games`, `players`, `events`

### 6. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🎯 How to Play

1. **Sign Up/Login** - Create an account or use OAuth
2. **Join Lobby** - Automatically join or create a game
3. **Ready Up** - Mark yourself as ready (need 5+ players)
4. **Day Phase** - Discuss and vote to lynch suspects
5. **Night Phase** - Werewolves kill, special roles act
6. **Win** - Villagers eliminate all Werewolves, or Werewolves outnumber Villagers

## 🎭 Roles

- **Villager** - No special abilities, vote wisely
- **Werewolf** - Kill villagers at night (1/3 of players)
- **Doctor** - Save one person from werewolf attacks each night
- **Seer** - Check if a player is a werewolf each night
- **Witch** - Silence a player for the next day
- **Knight** - Immune to werewolf attacks (can still be lynched)
- **Saint** - If lynched, kills their nominator

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Type checking
npm run type-check
```

## 📦 Building

```bash
npm run build
npm start
```

## 🚢 Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard.

## 📚 Documentation

- [Migration Guide](docs/NEXTJS_SUPABASE_MIGRATION.md) - Complete migration documentation
- [Migration Progress](MIGRATION_PROGRESS.md) - Current implementation status
- [Supabase Setup](supabase/README.md) - Database setup instructions

## 🤝 Contributing

This is a personal project migration, but feedback and suggestions are welcome!

## 📜 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Original Meteor version (2015)
- Supabase for the amazing backend platform
- Next.js team for the fantastic framework

## 📞 Support

For issues or questions:
1. Check the migration progress document
2. Review Supabase setup instructions
3. Check browser console for errors
4. Verify environment variables are set

---

**Note:** This is a migrated version of the original Meteor 1.2.1 application. The core game infrastructure is complete, with additional features being added progressively.

**Current Status:** ✅ Authentication, Lobby, Database, Real-time working
**Next:** Game screens (day/night phases), voting logic, endgame
