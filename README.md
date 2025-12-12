# Turing - The Ranked Dating App

A dating app that gamifies the initial interaction through a "Turing Test" mechanic. Users chat with matches and must identify whether they're talking to a real human or an AI.

## Tech Stack

- **Framework**: Expo 54 + expo-router (file-based routing)
- **Backend**: Supabase (Auth, Postgres, Edge Functions)
- **AI**: Provider-agnostic client (default: Mistral Chat Completions)
- **State**: Zustand
- **Styling**: NativeWind (Tailwind CSS for React Native)

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI: `npm install -g expo-cli`
- Supabase account (free tier works)
- Mistral API key (from [Mistral dashboard](https://console.mistral.ai/api-keys))

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the migration in `supabase/migrations/001_initial.sql` in the SQL Editor
3. Copy your project URL and anon key from Settings > API

### 3. Environment Variables

Copy the example env file and fill in your values:

```bash
cp env.example .env
```

Then edit `.env` with your credentials:
- `EXPO_PUBLIC_SUPABASE_URL` - From Supabase Dashboard > Settings > API
- `EXPO_PUBLIC_SUPABASE_ANON_KEY` - From Supabase Dashboard > Settings > API  
- `EXPO_PUBLIC_MISTRAL_API_KEY` - From [Mistral dashboard](https://console.mistral.ai/api-keys)
- `EXPO_PUBLIC_MISTRAL_MODEL` - Optional, defaults to `mistral-small-latest`
- `EXPO_PUBLIC_AI_PROVIDER` - Optional, defaults to `mistral` (set to `mock` to disable API calls)
- `EXPO_PUBLIC_MISTRAL_BASE_URL` - Optional, defaults to `https://api.mistral.ai`

### 4. Deploy Edge Function (Optional)

For production, deploy the chat edge function:

```bash
supabase functions deploy chat --project-ref your-project-ref
```

Set `EXPO_PUBLIC_MISTRAL_API_KEY` in Supabase Dashboard > Edge Functions > Secrets if you deploy edge functions that need it.

### 5. Run the App

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web
npm run web

# Or start Expo Go
npm start
```

## Project Structure

```
app/
├── (auth)/           # Unauthenticated routes
│   ├── login.tsx     # Email/password login
│   └── register.tsx  # Registration with gender selection
├── (main)/           # Authenticated routes
│   ├── _layout.tsx   # Tab navigator
│   ├── index.tsx     # Home/Queue screen
│   ├── chat/[id].tsx # Chat session
│   └── profile.tsx   # User profile + ELO
├── _layout.tsx       # Root layout with auth guard

lib/
├── supabase.ts       # Supabase client with secure storage
├── database.types.ts # TypeScript types for database
├── store.ts          # Zustand stores (auth + chat)
├── ai.ts             # AI chat service

components/
├── chat/             # Chat UI components
│   ├── ChatBubble.tsx
│   └── ChatTimer.tsx
├── DecisionModal.tsx # Guess modal with ELO calculation
├── ui/               # Reusable UI primitives
    ├── Button.tsx
    └── Card.tsx

supabase/
├── migrations/       # Database schema
└── functions/chat/   # Edge function for AI responses
```

## Features

### MVP (Implemented)

- [x] Email/password authentication
- [x] Gender selection at registration
- [x] AI chat with artificial typing delays
- [x] 5-minute countdown timer
- [x] 20-message limit
- [x] Decision phase modal (Real vs AI)
- [x] ELO rating system (+25 correct, -20 wrong)
- [x] Dark cyberpunk theme
- [x] Haptic feedback

### Future Features

- [ ] Real human matching (Female users)
- [ ] Liveness verification for female users
- [ ] Premium subscription (100% human matches)
- [ ] Match history
- [ ] Leaderboard
- [ ] Push notifications
- [ ] Profile photos
- [ ] Audio clips from AI personas

## Game Mechanics

1. **Queue**: User presses "Play" to enter matchmaking
2. **Chat**: 5-minute timer or 20 messages (whichever comes first)
3. **Decision**: Modal appears - guess "REAL" or "AI"
4. **Result**: ELO updated based on correct/incorrect guess
5. **Upsell**: Wrong guesses show premium upgrade prompt

## ELO System

- Starting ELO: 1000
- Correct guess: +25 points
- Incorrect guess: -20 points
- Rank tiers: Bronze → Silver → Gold → Diamond → Master → Grandmaster

## AI Persona System

AI personas have:
- Name, age, bio
- Personality traits (sarcastic, nerdy, etc.)
- Unique conversation styles
- System prompt to act human (typos, casual speech, etc.)

## License

MIT
