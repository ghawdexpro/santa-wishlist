# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**The Santa Experience** - A premium personalized Santa video service ($59+) where parents/grandparents gift children magical, AI-generated video messages from Santa + optional live video calls with Santa.

## Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Build for production
npm run lint     # Run ESLint
npm run start    # Start production server
```

**Deployment:**
```bash
git pull origin main --rebase   # Always pull before pushing
git push origin main            # Push to GitHub
railway up --detach             # Deploy to Railway (manual)
```

## Architecture

### Tech Stack
- **Frontend:** Next.js 15 + React 19 + Tailwind CSS 4
- **Backend:** Next.js API Routes
- **Database:** Supabase PostgreSQL (ghawdexpro org, project: `epxeimwsheyttevwtjku`)
- **Auth:** Supabase Auth
- **Storage:** Supabase Storage
- **Payments:** Stripe
- **AI Services:** Vertex AI (Gemini, NanoBanana, Veo) + HeyGen
- **Deployment:** Railway

### AI Services

**Vertex AI (REST API):**
| Service | Model ID | Purpose |
|---------|----------|---------|
| Gemini | `gemini-2.0-flash-001` | Script generation |
| NanoBanana | `gemini-2.0-flash-preview-image-generation` | Keyframe image generation |
| Veo | `veo-3.1-generate-001` | Video generation |

**Service Account:** `vertex-express@primal-turbine-478412-k9.iam.gserviceaccount.com`

**HeyGen (REST API):**
| Service | Purpose | Cost |
|---------|---------|------|
| Talking Avatar | Scene 6: Santa speaks personalized script | ~0.5 credits/video |
| Streaming Avatar | Live Santa video calls with children | 0.2 credits/min |

### Database Tables

- `profiles` - User profiles from Supabase Auth
- `orders` - Order data (status, child_count, generated_script, final_video_url, etc.)
- `children` - Child data per order (name, age, photo_url, personalization fields)
- `premade_scenes` - Pre-generated scenes 1, 2, 3, 7

**Note:** Database schema is complete. No migrations needed.

### Key Flows

**Video Order Flow:**
1. User fills wizard (`/create`) with 1-3 children
2. Script generation (Gemini) → Script preview
3. Stripe payment → status: `paid`
4. Keyframe generation → Admin review (`/admin/review/[orderId]`)
5. Video generation (Veo) → Final stitching → `complete`

**Live Call Flow (`/call/[orderId]`):**
1. User selects child (if multi-child order)
2. Clicks "Call Santa" → HeyGen Streaming Avatar connects
3. Santa greets child with personalized greeting
4. Real-time conversation: Child speaks → Gemini LLM → Santa responds

### 8-Scene Video Structure

```
PRE-MADE (Scenes 1, 2, 3, 7): 32 seconds total
PERSONALIZED PER CHILD (Scenes 4, 5, 6, 8): ~49 seconds each

Total: ~80s (1 child) | ~130s (2 children) | ~180s (3 children)
```

## Environment Variables

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

# Google Cloud / Vertex AI
GOOGLE_CLOUD_PROJECT
GOOGLE_CLOUD_LOCATION
GOOGLE_APPLICATION_CREDENTIALS_JSON

# Stripe
STRIPE_SECRET_KEY
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET

# HeyGen
HEYGEN_API_KEY
NEXT_PUBLIC_SANTA_AVATAR_ID
NEXT_PUBLIC_SANTA_VOICE_ID

# App
NEXT_PUBLIC_APP_URL
```

## Critical Rules

1. **Database:** Use ONLY ghawdexpro Supabase org (project: `epxeimwsheyttevwtjku`)
2. **No migrations needed** - Schema is complete, don't create migration files
3. **Image Generation:** Use NanoBanana Pro, NOT Imagen
4. **Deployment:** `git push origin main && railway up --detach`
5. **Multi-Child:** Support 1-3 children per order

## Admin Interface

- **URL:** `/admin/scenes` (password: `santa-admin-2024`)
- **Purpose:** Generate and manage pre-made scene keyframes and videos

## Documentation

- `docs/HEYGEN-VIDEO-API-BIBLE.md` - HeyGen Video API for Scene 6
- `docs/HEYGEN-STREAMING-AVATAR-BIBLE.md` - HeyGen Streaming Avatar for live calls
- `docs/NANOBANANA-BIBLE.md` - NanoBanana image generation guide
