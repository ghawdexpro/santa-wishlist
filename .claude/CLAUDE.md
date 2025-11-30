# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Santa Experience** - A premium personalized Santa video service ($59+) where parents/grandparents gift children magical, AI-generated video messages from Santa.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run lint     # Run ESLint
npm run start    # Start production server
```

**Deployment:**
```bash
git push origin main           # Push to GitHub
railway up --detach            # Deploy to Railway (manual push required)
```

**Supabase CLI:**
```bash
supabase login                 # Login (use ghawdexpro account ONLY)
supabase link --project-ref epxeimwsheyttevwtjku
supabase db push               # Apply migrations
```

## Architecture

### Tech Stack
- **Frontend:** Next.js 15 + React 19 + Tailwind CSS 4
- **Backend:** Next.js API Routes
- **Database:** Supabase PostgreSQL (ghawdexpro org)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Payments:** Stripe
- **AI Services:** Vertex AI (Gemini, NanoBanana, Veo)
- **Deployment:** Railway

### AI Services (all via Vertex AI REST API)

| Service | Model ID | Purpose |
|---------|----------|---------|
| Gemini | `gemini-2.0-flash-001` | Script generation |
| NanoBanana | `gemini-2.5-flash-image` | Image generation |
| Veo | `veo-3.1-generate-001` | Video generation |

**Service Account:** `vertex-express@primal-turbine-478412-k9.iam.gserviceaccount.com`

### Core Libraries (`src/lib/`)

- `gemini.ts` - Script generation with Gemini
- `nanobanana.ts` - Image generation (DO NOT use Imagen)
- `veo.ts` - Video generation with async polling
- `premade-scenes.ts` - 8-scene VFX definitions
- `stripe.ts` - Payment processing
- `supabase/` - Database client setup

### Key Flows

**Order Flow:**
1. User fills wizard (`/create`) → CreateWizard components
2. Script generation (`/api/generate-script`) → Gemini
3. Payment (`/api/checkout`) → Stripe
4. Video generation (`/api/generate-video`) → Veo
5. Completion → final video URL stored in order

**8-Scene Video Structure:**
- PRE-MADE (1, 2, 3, 7): Generated once, reused for all orders
- PERSONALIZED (4, 5, 6, 8): Generated per order with child's data

### Database Tables

- `profiles` - User profiles from Supabase Auth
- `orders` - Order data with status flow: draft → paid → generating → complete
- `premade_scenes` - Pre-generated video scenes

## Environment Variables

Required in `.env.local` and Railway:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
GOOGLE_CLOUD_PROJECT
GOOGLE_CLOUD_LOCATION
GOOGLE_APPLICATION_CREDENTIALS_JSON
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_APP_URL
```

## Critical Rules

1. **Database:** Use ONLY ghawdexpro Supabase organization
2. **Image Generation:** Use NanoBanana (`src/lib/nanobanana.ts`), NOT Imagen
3. **Deployment:** Must manually push to Railway via CLI
4. **NanoBanana Pro model** (`gemini-3-pro-image-preview`) requires `location=global`

## Documentation

- `docs/NANOBANANA-BIBLE.md` - Comprehensive NanoBanana guide
- `docs/NANOBANANA-QUICK.md` - Quick reference

## Admin

- **Admin Panel:** `/admin/scenes` (password: `santa-admin-2024`)
- **Generate pre-made scenes:** POST `/api/admin/generate-premade`
