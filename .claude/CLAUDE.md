# The Santa Experience - Project Rules

## CRITICAL: Progress Tracking
- UPDATE TodoWrite after EVERY completed step
- COMMIT to git after each major milestone
- Reference plan file: ~/.claude/plans/staged-dancing-pinwheel.md

## Project: The Santa Experience
A premium personalized Santa video service ($59+) for parents/grandparents to gift children magical, one-of-a-kind video messages from Santa.

## Product Flow
1. Customer inputs child info (name, photo, behaviors)
2. Gemini generates personalized script
3. Nano Banana Pro generates keyframes (with child's photo)
4. Customer approves script + keyframes
5. Payment via Stripe ($59)
6. Veo 3.1 generates ~90 second video
7. Delivery via email + dashboard

## Tech Stack
- Frontend: Next.js 15 + Tailwind CSS
- Backend: Next.js API routes + Supabase
- Database: Supabase PostgreSQL
- Auth: Supabase Auth
- Storage: Supabase Storage
- Payments: Stripe
- AI: Google Gemini, Nano Banana Pro, Veo 3.1
- Deployment: Railway (manual CLI push)

## Current Stage
Stage 9 (Pre-made Scenes) ready to generate. Resume with "Resume from Stage 9"

## AI Services Setup
- **Gemini**: Vertex AI REST API (gemini-2.0-flash-001) ✅
- **Imagen**: Vertex AI REST API (imagen-3.0-generate-001) ✅
- **Veo**: Vertex AI REST API (veo-2.0-generate-001) ✅
- **Service Account**: vertex-express@primal-turbine-478412-k9.iam.gserviceaccount.com

## Progress Log
- 2024-11-29: Project started
- 2024-11-29: Stage 1 completed - Cleanup & Foundation
- 2024-11-29: Stage 2 completed - Premium landing page
- 2024-11-29: Stage 3 completed - Order wizard (6 steps)
- 2024-11-29: Stage 5 completed - Gemini script generation
- 2024-11-29: Stage 6 completed - Imagen keyframe generation
- 2024-11-29: Stage 7 completed - Stripe payment integration
- 2024-11-29: Stage 8 completed - Veo video generation
- 2024-11-29: Stage 9 in progress - Pre-made scenes (prompts ready)

## Key Files
- `src/lib/gemini.ts` - Gemini script generation
- `src/lib/imagen.ts` - Imagen keyframe generation
- `src/lib/veo.ts` - Veo video generation
- `src/lib/premade-scenes.ts` - Pre-made scene prompts
- `src/app/api/admin/generate-premade/route.ts` - Admin tool

## Git Commits (recent)
- 9138436 Add admin API for generating pre-made scenes
- 58f08e8 Add spectacular pre-made scene prompts for Veo 3.1
- 7ab6b3a Stage 8: Add video generation with Veo 2
- 2049b15 Stage 6: Add keyframe generation with Imagen 3
