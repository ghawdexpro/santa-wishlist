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

**Video Generation & Orchestration:**
- `gemini.ts` - Script generation with Gemini (includes `generateMultiChildScript()` for 1-3 children)
- `nanobanana.ts` - Image generation with reference image support (photo compositing)
- `veo.ts` - Video generation with async polling (`startVideoGeneration`, `waitForVideoGeneration`)
- `heygen.ts` - Talking head video generation (Scene 6)
- `ffmpeg.ts` - Video stitching (`stitchFinalVideo`)
- `premade-scenes.ts` - 8-scene VFX definitions

**Multi-Child Video Pipeline (NEW):**
- `photo-alive-generation.ts` - Scene 4: Photo compositing with NanoBanana Pro reference images
- `scene-generators.ts` - Scenes 5, 6, 8: Personalized scene generation per child
- `premade-cache.ts` - Pre-made scene caching system (Scenes 1, 2, 3, 7)
- `video-stitcher.ts` - Scene interleaving by type and FFmpeg coordination

**Utility:**
- `stripe.ts` - Payment processing
- `supabase/` - Database client setup

### Key Flows

**Order Flow (Updated for Multi-Child):**
1. User fills wizard with 1-3 children
2. Create order with children records in database
3. Stripe payment triggers webhook
4. `/api/generate-full-video` orchestrates entire pipeline:
   - Generate multi-child script (Gemini)
   - Load pre-made scenes (cache or generate)
   - Generate personalized scenes per child (parallel):
     - Scene 4: Photo compositing (NanoBanana + Veo)
     - Scene 5: Name reveal (NanoBanana + Veo)
     - Scene 6: Santa's message (HeyGen)
     - Scene 8: Epic launch (NanoBanana + Veo)
   - Poll Veo operations until complete
   - Stitch scenes in interleaved order
   - Upload final video
   - Mark order complete

**8-Scene Video Structure:**
```
PRE-MADE (Cached):
  Scene 1: Sky Dive (12s)
  Scene 2: Workshop (12s)
  Scene 3: Book Magic (10s)
  Scene 7: Sleigh Ready (10s)
  = 44 seconds (reused for all orders)

PERSONALIZED (Per Child):
  Scene 4: Photo Comes Alive (12s) - photo reference + Veo
  Scene 5: Name Reveal (10s) - golden 3D text + Veo
  Scene 6: Santa's Message (25s) - HeyGen talking head
  Scene 8: Epic Launch (10s) - sleigh + Veo
  = 57 seconds per child

INTERLEAVING ORDER (for 2 children):
[1] [2] [3] [4-Child1] [4-Child2] [5-Child1] [5-Child2] [6-Child1] [6-Child2] [7] [8-Child1] [8-Child2]
Total: ~158 seconds (2:38) for 2 children
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
3. **Image Generation:** Use NanoBanana Pro (`gemini-3-pro-image-preview`), NOT Imagen
4. **Photo Compositing:** NanoBanana reference images must be placed FIRST in API request, text prompt AFTER
5. **NanoBanana Pro Model:** Requires `location=global` (set in photo-alive-generation.ts)
6. **Deployment:** Push to Railway via CLI: `git push origin main` (auto-deploys if configured)
7. **Multi-Child Orders:** Support 1-3 children, each with separate `children` table records
8. **Scene Interleaving:** Scenes grouped by type (all Scene 4s, then all Scene 5s), not by child
9. **Pre-made Scene Caching:** Scenes 1,2,3,7 cached in `premade_scenes` table for reuse

## Current Implementation Status

**✅ COMPLETE (Phase 9):**
- Multi-child video generation (1-3 children per order)
- 8-scene orchestration pipeline
- Photo compositing with NanoBanana Pro reference images
- Pre-made scene caching system
- All AI service integrations (Gemini, NanoBanana, Veo, HeyGen)
- Database schema with children table
- Comprehensive testing plan
- Production deployment guide

**📍 Currently Deployed:**
- GitHub: `main` branch (commit `5d025de`)
- Railway: Ready for deployment (needs environment variables + webhook setup)
- Supabase: Migration file created, needs application

**Next Steps:**
1. Set environment variables in Railway dashboard
2. Apply database migration to Supabase
3. Configure Stripe webhook
4. Run test scenarios (1, 2, 3 children)
5. Monitor logs during video generation

## Current Implementation Status

### ✅ Completed Features
- **Dual-Keyframe Video Generation** - Veo 3.1 supports start + end keyframes for guided generation
- **Admin Panel** - Full UI for managing pre-made scenes with granular controls
- **Script Page UX** - All scenes expand by default to show Santa's dialogue immediately
- **Customer Flow** - Create → Script generation → Payment → Video generation → Download
- **Database Schema** - `premade_scenes` table with all necessary fields for dual-keyframe pipeline

### ⏳ Pending Tasks
- Generate pre-made scene keyframes for scenes 1, 2, 3, 7 (cost: ~$0.32 total)
- Test pre-made scene video generation end-to-end
- Monitor production stability on Railway

## Frontend Pages & UX

### Script Preview Page (`/create/script`)
- **Behavior:** All scenes expanded by default when script loads
- **Reason:** Users see full personalized content (Santa dialogue, visual descriptions, settings)
- **Interaction:** Users can click "−" to collapse individual scenes, "+" to re-expand
- **State:** Uses `Set<number>` to track multiple expanded scenes (not single selection)

## Documentation

- `IMPLEMENTATION-SUMMARY.md` - Complete technical overview of multi-child system
- `PHASE-8-TESTING-PLAN.md` - Test scenarios and validation criteria
- `PHASE-9-DEPLOYMENT-GUIDE.md` - Full deployment procedures
- `DEPLOYMENT-CHECKLIST.md` - Pre-deployment setup and validation
- `DEPLOYMENT-STATUS.md` - Current status and next actions
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
   - Scene 4: Download photo → NanoBanana (reference image) → Veo (animate) → operation name
   - Scene 5: NanoBanana (keyframe) → Veo (animate) → operation name
   - Scene 6: HeyGen (returns URL immediately)
   - Scene 8: NanoBanana (keyframe) → Veo (animate) → operation name
5. Poll all Veo operations until complete (9 parallel operations for 3 children)
6. Generate interleaved stitch order: [1][2][3][4-all][5-all][6-all][7][8-all]
7. FFmpeg stitch all scenes in correct order
8. Upload final video to Supabase Storage
9. Mark order complete with final_video_url

**Key Implementation Files:**
- `generateStitchOrder()` in video-stitcher.ts - Creates interleaved segment order
- `stitchVideoSegments()` in video-stitcher.ts - Coordinates FFmpeg concatenation
- `getAllPremadeScenes()` in premade-cache.ts - Loads/caches scenes 1,2,3,7
- `generateScene4ForChild()` in photo-alive-generation.ts - Photo compositing pipeline
- `generateScene5/6/8ForChild()` in scene-generators.ts - Personalized scene generation

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
