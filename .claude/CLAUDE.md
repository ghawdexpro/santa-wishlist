# The Santa Experience - Project Rules

## CRITICAL: Progress Tracking
- UPDATE TodoWrite after EVERY completed step
- COMMIT to git after each major milestone
- **VFX Plan file**: ~/.claude/plans/synthetic-kindling-gem.md

## Resume Instructions
Say: **"Resume from Stage 9.4"** to continue implementation

## Project: The Santa Experience
A premium personalized Santa video service ($59+) for parents/grandparents to gift children magical, one-of-a-kind video messages from Santa.

## Current Stage: 9.4 - NanoBanana Integration

### What's Done:
- Stages 1-8 complete (landing, wizard, Gemini, Stripe, Veo)
- VFX plan created with 8-scene "Brightest Star" story
- Imagen REMOVED from project
- NanoBanana documentation created

### What's Next (in order):
1. Implement `src/lib/nanobanana.ts` for image generation
2. Generate Scene 1 (Sky Dive) video test
3. Generate remaining pre-made scenes (2, 3, 7)
4. Implement personalized scene generation with photo compositing
5. Build video stitching pipeline

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
- Database: Supabase PostgreSQL (ghawdexpro org ONLY!)
- Auth: Supabase Auth
- Storage: Supabase Storage
- Payments: Stripe
- AI: Google Gemini, NanoBanana Pro, Veo 3.1
- Deployment: Railway (manual CLI push)

## AI Services Setup
- **Gemini**: Vertex AI REST API (gemini-2.0-flash-001) ✅
- **NanoBanana**: Vertex AI REST API (gemini-2.5-flash-image / gemini-3-pro-image-preview) ✅
- **Veo**: Vertex AI REST API (veo-3.1-generate-001) ✅
- **Service Account**: vertex-express@primal-turbine-478412-k9.iam.gserviceaccount.com

## IMPORTANT: Image Generation
**DO NOT USE IMAGEN** - Use NanoBanana Pro instead!
- Documentation: `docs/NANOBANANA-BIBLE.md` (comprehensive)
- Quick Reference: `docs/NANOBANANA-QUICK.md` (condensed)
- Implementation: `src/lib/nanobanana.ts` (to be created)

### NanoBanana Quick Info
- **Flash Model**: `gemini-2.5-flash-image` ($0.039/image)
- **Pro Model**: `gemini-3-pro-image-preview` (needs location=global)
- **Endpoint**: Same Vertex AI pattern as Veo
- **Key Difference**: Uses `generateContent` not `predict`

## Key Files
- `src/lib/gemini.ts` - Gemini script generation
- `src/lib/nanobanana.ts` - NanoBanana image generation (TO CREATE)
- `src/lib/veo.ts` - Veo video generation
- `src/lib/premade-scenes.ts` - 8-scene VFX prompts
- `src/app/api/admin/generate-premade/route.ts` - Admin tool
- `src/app/admin/scenes/page.tsx` - Admin UI for scene generation

## Progress Log
- 2024-11-29: Stages 1-8 completed
- 2024-11-29: Stage 9.0 - VFX plan created (8 scenes, photo comes alive feature)
- 2024-11-29: Stage 9.1 - Rewrote premade-scenes.ts with new 8-scene VFX prompts
- 2024-11-30: Stage 9.3 - REMOVED Imagen, now Veo-only for video generation
- 2024-11-30: Stage 9.4 - Created NanoBanana documentation (bible + quick reference)
