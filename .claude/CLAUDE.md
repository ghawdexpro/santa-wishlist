# The Santa Experience - Project Rules

## CRITICAL: Progress Tracking
- UPDATE TodoWrite after EVERY completed step
- COMMIT to git after each major milestone
- **VFX Plan file**: ~/.claude/plans/synthetic-kindling-gem.md

## Resume Instructions
Say: **"Resume from Stage 9.1"** to continue implementation

## Project: The Santa Experience
A premium personalized Santa video service ($59+) for parents/grandparents to gift children magical, one-of-a-kind video messages from Santa.

## Current Stage: 9.1 - VFX Banger Implementation

### What's Done:
- Stages 1-8 complete (landing, wizard, Gemini, Imagen, Stripe, Veo)
- VFX plan created with 8-scene "Brightest Star" story
- Photo compositing feature planned (Scene 4)

### What's Next (in order):
1. Rewrite `src/lib/premade-scenes.ts` with new 8-scene VFX prompts
2. Add photo compositing function to `src/lib/imagen.ts`
3. Generate Scene 1 (Sky Dive) as quality test - one at a time to save credits!
4. Generate remaining pre-made scenes (2, 3, 7)
5. Implement personalized scene generation with photo
6. Build video stitching pipeline

## 8-Scene Structure (from plan)
| # | Name | Duration | Type |
|---|------|----------|------|
| 1 | Sky Dive | 12s | PRE-MADE |
| 2 | Workshop | 12s | PRE-MADE |
| 3 | Book Magic | 10s | PRE-MADE |
| 4 | Photo Alive | 12s | PERSONALIZED (child's photo comes alive!) |
| 5 | Name Reveal | 10s | PERSONALIZED |
| 6 | Santa's Message | 25s | PERSONALIZED |
| 7 | Sleigh Ready | 10s | PRE-MADE |
| 8 | Epic Launch | 10s | PERSONALIZED |

## Tech Stack
- Frontend: Next.js 15 + Tailwind CSS
- Backend: Next.js API routes + Supabase
- Database: Supabase PostgreSQL
- Auth: Supabase Auth
- Storage: Supabase Storage
- Payments: Stripe
- AI: Google Gemini, Imagen 3, Veo 2/3.1
- Deployment: Railway (manual CLI push)

## AI Services Setup
- **Gemini**: Vertex AI REST API (gemini-2.0-flash-001) ✅
- **Imagen**: Vertex AI REST API (imagen-3.0-generate-001) ✅
- **Veo**: Vertex AI REST API (veo-2.0-generate-001) ✅
- **Service Account**: vertex-express@primal-turbine-478412-k9.iam.gserviceaccount.com

## Key Files
- `src/lib/gemini.ts` - Gemini script generation
- `src/lib/imagen.ts` - Imagen keyframe generation + photo compositing (UPDATED)
- `src/lib/veo.ts` - Veo video generation
- `src/lib/premade-scenes.ts` - 8-scene VFX prompts (UPDATED)
- `src/app/api/admin/generate-premade/route.ts` - Admin tool

## Progress Log
- 2024-11-29: Stages 1-8 completed
- 2024-11-29: Stage 9.0 - VFX plan created (8 scenes, photo comes alive feature)
- 2024-11-29: Stage 9.1 - Rewrote premade-scenes.ts with new 8-scene VFX prompts
- 2024-11-29: Stage 9.2 - Added photo compositing functions to imagen.ts
- 2024-11-29: Stage 9.3 - Ready to generate Scene 1 (Sky Dive) test
