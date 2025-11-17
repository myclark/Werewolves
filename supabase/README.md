# Supabase Setup Instructions

## Prerequisites

1. Create a Supabase account at https://app.supabase.com
2. Install Supabase CLI: `npm install -g supabase`

## Setup Steps

### 1. Create a New Supabase Project

1. Go to https://app.supabase.com
2. Click "New Project"
3. Choose a name for your project
4. Set a strong database password (save this!)
5. Choose a region closest to your users
6. Wait for the project to be created (~2 minutes)

### 2. Get Your Project Credentials

1. Go to Project Settings > API
2. Copy the following values:
   - Project URL
   - Anon (public) key
   - Service role key (keep this secret!)

3. Update `.env.local` in the root directory:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### 3. Link Your Local Project

```bash
# Login to Supabase CLI
supabase login

# Link to your project
supabase link --project-ref your-project-ref
```

The project ref can be found in your project URL:
`https://[project-ref].supabase.co`

### 4. Run Migrations

```bash
# Apply all migrations to your Supabase project
supabase db push

# Or run them individually in the Supabase SQL Editor:
# 1. migrations/001_initial_schema.sql
# 2. migrations/002_rls_policies.sql
# 3. migrations/003_seed_roles.sql
# 4. migrations/004_game_functions.sql
```

### 5. Enable Realtime

In the Supabase Dashboard:
1. Go to Database > Replication
2. Enable replication for the following tables:
   - games
   - players
   - events

### 6. Configure Authentication

#### Email/Password Auth (enabled by default)
- Already configured, no action needed

#### OAuth Providers (optional)

**Google OAuth:**
1. Go to Authentication > Providers > Google
2. Enable Google provider
3. Add your Google Client ID and Secret
4. Add authorized redirect URL: `https://your-project.supabase.co/auth/v1/callback`

**Facebook OAuth:**
1. Go to Authentication > Providers > Facebook
2. Enable Facebook provider
3. Add your Facebook App ID and Secret
4. Add authorized redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 7. Generate TypeScript Types

After running migrations, generate TypeScript types:

```bash
npx supabase gen types typescript --linked > types/database.types.ts
```

This will create type-safe database types for your application.

### 8. Test Your Connection

Run the Next.js development server and check if it connects:

```bash
npm run dev
```

Visit http://localhost:3000 and check the browser console for any connection errors.

## Database Schema Overview

### Tables

- **roles**: Game roles (Werewolf, Villager, Doctor, etc.)
- **games**: Active and completed games
- **players**: Players in each game with their state
- **role_votes**: Votes for which roles to include (lobby phase)
- **events**: Game events (deaths, lynches, etc.)
- **game_history**: Snapshots of game state per cycle

### Row Level Security (RLS)

All tables have RLS enabled with policies that:
- Allow users to read games and players they're part of
- Prevent users from seeing other players' roles (until game end)
- Allow users to update only their own player state
- Prevent direct database manipulation

## Troubleshooting

### Connection Issues

If you see "Invalid Supabase URL" or similar errors:
1. Check that your `.env.local` has the correct values
2. Restart the Next.js dev server
3. Check that your Supabase project is active

### Migration Errors

If migrations fail:
1. Check the SQL syntax in the migration files
2. Run migrations one at a time to identify the issue
3. Check Supabase logs in the Dashboard > Logs

### Type Generation Errors

If type generation fails:
1. Make sure you're linked to the correct project
2. Check that migrations have been applied
3. Try running `supabase db pull` first

## Next Steps

After setup is complete:
1. Test user registration and login
2. Create a test game
3. Verify real-time updates are working
4. Test game logic functions

## Support

- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Project Issues: Create an issue in the repository
