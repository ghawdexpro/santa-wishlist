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
git pull origin main --rebase   # Always pull before pushing (avoid divergent branches)
git push origin main            # Push to GitHub
railway up --detach             # Deploy to Railway (MUST be run manually, not automatic)
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
- **AI Services:** Vertex AI (Gemini, NanoBanana, Veo), HeyGen (Avatar Videos & Streaming)
- **Deployment:** Railway

### AI Services

#### Vertex AI (Google Cloud)

| Service | Model ID | Purpose |
|---------|----------|---------|
| Gemini | `gemini-2.0-flash-001` | Script generation |
| NanoBanana | `gemini-2.5-flash-image` | Image generation |
| Veo | `veo-3.1-generate-001` | Video generation |

**Service Account:** `vertex-express@primal-turbine-478412-k9.iam.gserviceaccount.com`

#### HeyGen (Scene 6 Talking Avatar + Future Live Calls)

| Product | Type | Purpose | Documentation |
|---------|------|---------|---------------|
| **Video Generation API** | Async REST API | Scene 6: Santa's Message (30-60s talking head) | `docs/HEYGEN-VIDEO-API-BIBLE.md` |
| **Streaming Avatar (LiveAvatar)** | Real-time WebRTC | Future: Live video calls with Santa | `docs/HEYGEN-STREAMING-AVATAR-BIBLE.md` |

**Scene 6 Integration:**
- HeyGen generates 30-60 second talking Santa videos (vs 8s Veo)
- Premium tier uses HeyGen, Basic tier falls back to Veo
- Toggle: `USE_HEYGEN_FOR_SCENE_6=true/false`

**Key Differences:**
- **Video API:** Generate videos async (30s-5min), costs 1-2 credits/min, max 5000 chars
- **Streaming:** Real-time conversation (<1s latency), costs 0.2 credits/min, max 1000 chars/message

### Core Libraries (`src/lib/`)

**Video Generation & Orchestration:**
- `gemini.ts` - Script generation with Gemini (includes `generateMultiChildScript()` for 1-3 children)
- `nanobanana.ts` - Image generation with reference image support (photo compositing, "Magical Mirror" concept)
- `veo.ts` - Video generation + video extension for continuous clips
- `heygen.ts` - Scene 6: HeyGen talking avatar video generation (30-60s Santa messages)
- `hollywood-scene-generator.ts` - Dual-keyframe Hollywood-quality scene generation
- `ffmpeg.ts` - Video stitching (`stitchFinalVideo`)
- `premade-scenes.ts` - 8-scene VFX definitions

**Multi-Child Video Pipeline:**
- `photo-alive-generation.ts` - Scene 4: Photo compositing with NanoBanana Pro reference images
- `scene-generators.ts` - Scene 6: HeyGen talking avatar (or Veo fallback)
- `hollywood-scene-generator.ts` - Scenes 4, 5, 8: Hollywood-quality dual-keyframe generation
- `premade-cache.ts` - Pre-made scene caching system (Scenes 1, 2, 3, 7)
- `video-stitcher.ts` - Scene interleaving by type and FFmpeg coordination
- `extension-chain-orchestrator.ts` - BLOK A/B/C architecture for continuous video chains

**Utility:**
- `stripe.ts` - Payment processing
- `supabase/` - Database client setup

### Key Flows

**Order Flow (Updated for Multi-Child + HeyGen):**
1. User fills wizard with 1-3 children
2. Create order with children records in database
3. Stripe payment triggers webhook
4. `/api/generate-full-video` orchestrates entire pipeline:
   - Generate multi-child script (Gemini)
   - Load pre-made scenes (cache or generate)
   - Generate personalized scenes per child (parallel):
     - Scene 4: Photo compositing (Hollywood dual-keyframe) - 8s
     - Scene 5: Name reveal (Hollywood dual-keyframe) - 8s
     - Scene 6: Santa's message (HeyGen talking avatar) - 30-60s
     - Scene 8: Epic launch (Hollywood dual-keyframe) - 8s
   - Poll Veo operations (HeyGen already complete)
   - Stitch scenes in interleaved order
   - Upload final video
   - Mark order complete

**Alternative: BLOK Architecture (Video Extension Chains):**
Uses Veo 3.1 video extension for continuous clips with only 2 cuts:
- BLOK A: Scenes 1-3 as continuous ~30s video
- BLOK B: Scenes 4-6 per child as continuous ~45s video
- BLOK C: Scenes 7-8 as continuous ~20s video
See `extension-chain-orchestrator.ts` for implementation.

**8-Scene Video Structure:**
```
Veo 3.1 Duration Limits:
- Image-to-video (with keyframe): 8 seconds ONLY
- Extension: 6 seconds per extension (no images allowed)
- Text-to-video: 4, 6, or 8 seconds

HeyGen Video API:
- Talking avatar videos: 30-60 seconds (Scene 6)
- Cost: ~0.5-1 credit per video (~$0.50-1.00)

PRE-MADE (Cached - Veo) - 8 seconds each:
  Scene 1: Sky Dive (8s)
  Scene 2: Workshop (8s)
  Scene 3: Book Magic (8s)
  Scene 7: Sleigh Ready (8s)
  = 32 seconds (reused for all orders)

PERSONALIZED (Per Child):
  Scene 4: Photo Comes Alive (8s) - photo reference + Veo
  Scene 5: Name Reveal (8s) - keyframe + Veo
  Scene 6: Santa's Message (45s avg) - HeyGen talking avatar
  Scene 8: Epic Launch (8s) - keyframe + Veo
  = ~69 seconds per child (premium with HeyGen)
  = ~32 seconds per child (basic with Veo fallback)

INTERLEAVING ORDER (for 2 children):
[1] [2] [3] [4-Child1] [4-Child2] [5-Child1] [5-Child2] [6-Child1] [6-Child2] [7] [8-Child1] [8-Child2]

Total Duration (Premium with HeyGen):
- 1 child: 32 + 69 = ~101s (1:41)
- 2 children: 32 + 138 = ~170s (2:50)
- 3 children: 32 + 207 = ~239s (3:59)
```

### Database Tables

- `profiles` - User profiles from Supabase Auth
- `orders` - Order data with fields:
  - `status`: draft → paid → generating → complete
  - `child_count`: 1-3
  - `generation_progress`: JSONB tracking stage/scenes
  - `error_message`: Error details if failed
- `children` - Child data per order (NEW):
  - `name`, `age`, `sequence_number` (1-3)
  - `photo_url` for Scene 4 compositing
  - `good_behavior`, `thing_to_improve`, `thing_to_learn` for personalization
- `premade_scenes` - Pre-generated scenes:
  - `scene_number` (1, 2, 3, 7)
  - `video_url`: Final stitched video
  - `prompt_used`: VFX prompt for regeneration

## Environment Variables

Required in `.env.local` and Railway:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Google Cloud (Vertex AI)
GOOGLE_CLOUD_PROJECT
GOOGLE_CLOUD_LOCATION
GOOGLE_APPLICATION_CREDENTIALS_JSON

# HeyGen (Required for Premium Tier Scene 6)
HEYGEN_API_KEY                         # API key from HeyGen dashboard
NEXT_PUBLIC_SANTA_AVATAR_ID            # Avatar ID for Santa (from /v2/avatars)
NEXT_PUBLIC_SANTA_VOICE_ID             # Voice ID for Santa (from /v2/voices)
USE_HEYGEN_FOR_SCENE_6=true            # Set to 'false' for basic tier (Veo fallback)

# Stripe
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET

# App
NEXT_PUBLIC_APP_URL

# OpenAI (optional - for future Live Santa Chat LLM)
OPENAI_API_KEY                         # Only needed if implementing Streaming Avatar
```

## Critical Rules

1. **Database:** Use ONLY ghawdexpro Supabase organization (project: `epxeimwsheyttevwtjku`)
2. **Supabase Linking:** Always link before migrations: `supabase link --project-ref epxeimwsheyttevwtjku`
3. **Image Generation:** Use NanoBanana Pro (`gemini-3-pro-image-preview`), NOT Imagen
4. **Photo Compositing:** NanoBanana reference images must be placed FIRST in API request, text prompt AFTER
5. **NanoBanana Pro Model:** Requires `location=global` (set in photo-alive-generation.ts)
6. **Deployment:** Push to Railway via CLI: `git push origin main` (auto-deploys if configured)
7. **Multi-Child Orders:** Support 1-3 children, each with separate `children` table records
8. **Scene Interleaving:** Scenes grouped by type (all Scene 4s, then all Scene 5s), not by child
9. **Pre-made Scene Caching:** Scenes 1,2,3,7 cached in `premade_scenes` table for reuse

## Current Implementation Status

### ✅ Completed Features
- Multi-child video generation (1-3 children per order)
- 8-scene orchestration pipeline with Veo 3.1 for ALL scenes
- Photo compositing with NanoBanana Pro reference images
- Dual-keyframe video generation (start + end keyframes)
- Pre-made scene caching system
- Admin Panel for managing pre-made scenes
- Customer flow: Create → Script generation → Payment → Video generation → Download

### ⏳ Pending Tasks
- Generate pre-made scene keyframes for scenes 1, 2, 3, 7
- Configure Stripe webhook in production
- End-to-end testing with real orders

## Frontend Pages & UX

### Script Preview Page (`/create/script`)
- **Behavior:** All scenes expanded by default when script loads
- **Reason:** Users see full personalized content (Santa dialogue, visual descriptions, settings)
- **Interaction:** Users can click "−" to collapse individual scenes, "+" to re-expand
- **State:** Uses `Set<number>` to track multiple expanded scenes (not single selection)

## Documentation

### Project Docs
- `IMPLEMENTATION-SUMMARY.md` - Complete technical overview of multi-child system
- `PHASE-8-TESTING-PLAN.md` - Test scenarios and validation criteria
- `PHASE-9-DEPLOYMENT-GUIDE.md` - Full deployment procedures
- `DEPLOYMENT-CHECKLIST.md` - Pre-deployment setup and validation
- `DEPLOYMENT-STATUS.md` - Current status and next actions

### AI Service Bibles (in `docs/`)
- `docs/HEYGEN-VIDEO-API-BIBLE.md` - **HeyGen Video Generation API** - Pre-rendered avatar videos
- `docs/HEYGEN-STREAMING-AVATAR-BIBLE.md` - **HeyGen Streaming Avatar (LiveAvatar)** - Real-time video calls
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

**Multi-Child Orchestration (`/api/generate-full-video`):**
1. Load order with all children from database
2. Generate unified multi-child script (Gemini 2.0 Flash in Polish)
3. Load pre-made scenes (check cache in `premade_scenes`, generate if missing)
4. **For each child (in parallel):**
   - Scene 4: Download photo → NanoBanana (reference image) → Veo (animate) - 8s
   - Scene 5: NanoBanana (keyframe) → Veo (animate) - 8s
   - Scene 6: HeyGen talking avatar (30-60s) - returns URL immediately
   - Scene 8: NanoBanana (keyframe) → Veo (animate) - 8s
5. Poll Veo operations until complete (Scene 6 HeyGen already done)
6. Generate interleaved stitch order: [1][2][3][4-all][5-all][6-all][7][8-all]
7. FFmpeg stitch all scenes in correct order
8. Upload final video to Supabase Storage
9. Mark order complete with final_video_url

**Key Implementation Files:**
- `generateStitchOrder()` in video-stitcher.ts - Creates interleaved segment order
- `stitchVideoSegments()` in video-stitcher.ts - Coordinates FFmpeg concatenation
- `getAllPremadeScenes()` in premade-cache.ts - Loads/caches scenes 1,2,3,7
- `generateScene4ForChild()` in photo-alive-generation.ts - Photo compositing pipeline
- `generateScene5/8ForChild()` in scene-generators.ts - Veo-based scene generation
- `generateScene6SantasMessage()` in scene-generators.ts - HeyGen or Veo (configurable)

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

## Troubleshooting

### Git & Deployment
- **"Updates were rejected" when pushing?** Remote has changes you don't have locally. Use: `git pull origin main --rebase` before pushing
- **Railway deploy not working?** CLI must be run manually. `railway up --detach` does NOT run automatically
- **npm command not found in bash?** Node.js may not be in PATH. Use system terminal instead of Claude Code bash environment

### Database & Migrations
- **New migration column not visible in production?** Check that:
  1. Migration file timestamp is correctly formatted (YYYYMMDD_description.sql)
  2. You ran `supabase link --project-ref epxeimwsheyttevwtjku` if it's first time
  3. Migration was actually committed and pushed to GitHub
  4. Railway deployment completed successfully
- **Production database out of sync with local?** Verify via Supabase dashboard that column exists in `premade_scenes` table

### Vertex AI & Image Generation
- **NanoBanana failing silently?** Check that location is `us-central1` (default) for gemini-2.5-flash-image model
- **Veo video generation stuck?** Check `/api/generate-video/status` endpoint for actual operation status
- **Service account auth failing?** Verify `GOOGLE_APPLICATION_CREDENTIALS_JSON` is valid and not truncated in environment

## Development Workflow

1. **Before making changes:** Always pull latest: `git pull origin main --rebase`
2. **When adding features:** Test locally with `npm run dev` first
3. **When deploying:** Always push to GitHub before Railway: `git push origin main && railway up --detach`
4. **For database changes:** Create separate migration files with timestamps, never modify applied migrations
5. **Testing the full flow:** Use `/create` wizard to test: script generation → payment → video generation
