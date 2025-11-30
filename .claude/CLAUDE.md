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
- `premade_scenes` - Pre-generated video scenes (fields: `scene_number`, `name`, `description`, `duration_seconds`, `keyframe_url`, `keyframe_end_url`, `video_url`, `prompt_used`)

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

1. **Database:** Use ONLY ghawdexpro Supabase organization (project: `epxeimwsheyttevwtjku`)
2. **Supabase Linking:** Always link before migrations: `supabase link --project-ref epxeimwsheyttevwtjku`
3. **Image Generation:** Use NanoBanana (`src/lib/nanobanana.ts`), NOT Imagen
4. **Deployment:** Must manually push to Railway via CLI: `railway up --detach`
5. **NanoBanana Pro model** (`gemini-2.5-flash-image`) requires `location=us-central1` (default)
6. **Dual-Keyframe Videos:** Veo 3.1 accepts both start and end keyframes (`imageBase64` + `endImageBase64`) for guided generation

## Documentation

- `docs/NANOBANANA-BIBLE.md` - Comprehensive NanoBanana guide
- `docs/NANOBANANA-QUICK.md` - Quick reference

## Admin Interface

### Admin Panel
- **URL:** `/admin/scenes` (password: `santa-admin-2024`)
- **Purpose:** Generate and manage pre-made scene keyframes and videos

### Admin API: POST `/api/admin/generate-premade`
Generate pre-made scenes with granular control over keyframes and videos.

**Request Body:**
```json
{
  "adminKey": "santa-admin-2024",
  "sceneNumbers": [1, 2, 3, 7],  // Optional: specific scenes (defaults to all)
  "action": "all",                 // Required: "keyframe_start" | "keyframe_end" | "video" | "all"
  "useKeyframes": true             // Optional: pass keyframes to Veo (default: true)
}
```

**Actions:**
- `keyframe_start` - Generate start keyframe (NanoBanana)
- `keyframe_end` - Generate end keyframe with "final moment" prompt
- `video` - Generate video without keyframes
- `all` - Generate both keyframes + video with keyframe guidance

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "sceneNumber": 1,
      "name": "Scene Name",
      "startKeyframeGenerated": true,
      "endKeyframeGenerated": true,
      "videoOperationStarted": true,
      "operationName": "projects/*/locations/*/operations/xxxxx"
    }
  ]
}
```

## Video Generation Pipeline

**Pre-made Scenes (1, 2, 3, 7):**
1. Admin generates start keyframe (NanoBanana) → stored in `premade_scenes.keyframe_url`
2. Admin generates end keyframe (NanoBanana) → stored in `premade_scenes.keyframe_end_url`
3. Admin generates video (Veo 3.1 with both keyframes) → stored in `premade_scenes.video_url`
4. Reused for all orders via `/api/generate-video`

**Personalized Scenes (4, 5, 6, 8):**
1. Script generated per child (Gemini)
2. Start keyframe generated (NanoBanana) - Scene 4 uses photo enhancement
3. End keyframe generated for longer scenes (≥15s)
4. Video generated (Veo 3.1 with keyframes) → stored in `orders.video_operations`
5. Polling via `/api/generate-video/status` until complete
6. Final video finalized via `/api/finalize-video`

## Supabase Migrations

**Important:** Migration files must be properly linked and timestamped to be recognized.

**Process:**
```bash
# 1. Create new migration file with timestamp
supabase/migrations/YYYYMMDD_description.sql

# 2. Link to project (required first time)
supabase link --project-ref epxeimwsheyttevwtjku

# 3. Apply migrations
supabase db push
```

**Common Issues:**
- Migration not applying? Check if linked to correct project
- "Remote database is up to date"? Verify migration file timestamp is newer than previously applied
- Multiple migrations on same day? Use `_01`, `_02` suffixes: `20241130_01_create_table.sql`, `20241130_02_add_column.sql`
