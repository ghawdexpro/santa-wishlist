# Phase 8: End-to-End Testing Plan
## Multi-Child Video Generation (8-Scene Architecture)

### Overview
This document outlines the testing strategy for validating the complete 8-scene multi-child video generation system.

---

## Test Scenarios

### Scenario 1: Single Child Video Generation
**Setup:**
- Create order with 1 child: "Emma" (age 7)
  - Good behavior: "being kind to others"
  - Thing to improve: "sharing toys"
  - Thing to learn: "playing the piano"
  - Photo: sample_child_photo.jpg

**Expected Flow:**
1. POST `/api/generate-full-video` with orderId
2. Script generation for 1 child (Polish language)
3. Load pre-made scenes (1, 2, 3, 7) - should hit cache on 2nd run
4. Generate scenes 4, 5, 6, 8 for Emma in parallel
5. Poll Veo operations for scenes 4, 5, 8
6. Scene 6 (HeyGen) completes synchronously
7. Stitch order: [1] [2] [3] [4-Emma] [5-Emma] [6-Emma] [7] [8-Emma]
8. Final video: ~112 seconds (44s premade + 57s personalized + transitions)
9. Upload to Supabase Storage
10. Return success with videoUrl

**Validation:**
- [ ] Order status changes: pending → generating → complete
- [ ] generation_progress JSONB updates correctly
- [ ] All 8 scenes present in final video
- [ ] Video duration approximately 112 seconds
- [ ] Child's name appears in scenes 4, 5, 8
- [ ] Scene 6 contains personalized dialogue mentioning good behavior, improvement area, learning goal

---

### Scenario 2: Two Children Video Generation
**Setup:**
- Create order with 2 children:
  - Child 1: "Liam" (age 5)
    - Good behavior: "listening well"
    - Thing to improve: "being patient"
    - Thing to learn: "swimming"
  - Child 2: "Sophie" (age 8)
    - Good behavior: "helping mom"
    - Thing to improve: "trying new things"
    - Thing to learn: "drawing"

**Expected Flow:**
1. POST `/api/generate-full-video` with orderId
2. Fetch order with children array (both sorted by sequence_number)
3. Generate multi-child script with personalized scenes for each
4. Load pre-made scenes (should hit cache)
5. Generate all scenes for both children in parallel:
   - Scene 4-Liam, Scene 4-Sophie (parallel NanoBanana + Veo)
   - Scene 5-Liam, Scene 5-Sophie (parallel Veo)
   - Scene 6-Liam, Scene 6-Sophie (parallel HeyGen)
   - Scene 8-Liam, Scene 8-Sophie (parallel Veo)
6. Poll 6 Veo operations in parallel (4, 5, 8 for each child)
7. Stitch order: [1] [2] [3] [4-Liam] [4-Sophie] [5-Liam] [5-Sophie] [6-Liam] [6-Sophie] [7] [8-Liam] [8-Sophie]
8. Final video: ~202 seconds (44s + 57s*2)
9. Upload and complete

**Validation:**
- [ ] Both children's names appear in respective scenes
- [ ] Scene 5 (Name Reveal) shows both names in correct order
- [ ] Scene 6 (Message) has separate HeyGen videos for each child with personalized dialogue
- [ ] Video duration approximately 202 seconds
- [ ] generation_progress shows all stages completed
- [ ] Child order preserved in final video

---

### Scenario 3: Three Children Video Generation
**Setup:**
- Create order with 3 children:
  - Child 1: "Noah" (age 6)
  - Child 2: "Ava" (age 9)
  - Child 3: "Oliver" (age 4)

**Expected Flow:**
1. Similar to Scenario 2 but with 3 children
2. 9 Veo operations running in parallel (4, 5, 8 for each child)
3. Stitch order interleaves scenes by type
4. Final video: ~292 seconds (44s + 57s*3)

**Validation:**
- [ ] All 3 children visible in final video in correct sequence
- [ ] Video duration approximately 292 seconds
- [ ] No missing scenes or dropped video segments

---

## Pre-Made Scene Caching Validation

### Test: Cache Efficiency
**Steps:**
1. Generate first order (single child) → Scenes 1, 2, 3, 7 generated and cached
2. Check `premade_scenes` table → should have 4 records
3. Generate second order (two children) → should reuse cached scenes
4. Measure time difference: 2nd order should be ~90 seconds faster (no scene 1-3, 7 generation)

**Validation:**
- [ ] First order: ~200+ seconds total (includes pre-made scene generation)
- [ ] Second order: ~100+ seconds total (reuses cached scenes)
- [ ] Cache timestamps show scenes were generated once
- [ ] All video URLs are valid and accessible

---

## Database Validation

### Pre-generation Check
```sql
-- Verify children table exists and has correct schema
SELECT * FROM information_schema.columns
WHERE table_name = 'children'
ORDER BY ordinal_position;

-- Verify orders table has new columns
SELECT * FROM information_schema.columns
WHERE table_name = 'orders'
AND column_name IN ('child_count', 'generation_progress', 'error_message')
ORDER BY ordinal_position;
```

**Validation:**
- [ ] `children` table exists with all required columns
- [ ] `orders.child_count` (integer 1-3)
- [ ] `orders.generation_progress` (JSONB)
- [ ] `orders.error_message` (text, nullable)
- [ ] Indexes on `children.order_id` and `children.sequence_number`

### Post-generation Check
```sql
-- Check order with children
SELECT id, child_count, status, generation_progress
FROM orders WHERE id = 'test-order-id';

-- Check children
SELECT id, name, age, sequence_number, good_behavior, thing_to_improve, thing_to_learn
FROM children WHERE order_id = 'test-order-id'
ORDER BY sequence_number;

-- Check cached scenes
SELECT scene_number, name, video_url, created_at, updated_at
FROM premade_scenes
ORDER BY scene_number;
```

**Validation:**
- [ ] Orders have correct child_count
- [ ] generation_progress shows all stages: loading → script → premade → personalized → polling → stitching → uploading
- [ ] Children sorted by sequence_number (1, 2, 3)
- [ ] Premade scenes cached with timestamps

---

## API Response Validation

### Success Response Format
```json
{
  "success": true,
  "videoUrl": "https://supabase.../videos/{orderId}/final.mp4",
  "orderId": "test-order-id",
  "childCount": 2
}
```

### Error Handling
**Test Case: Missing Photo URL**
- [ ] API returns 500 error
- [ ] Order marked as "failed"
- [ ] error_message contains meaningful error details

**Test Case: Veo Generation Timeout**
- [ ] Polling retries with exponential backoff
- [ ] Timeout after X minutes logged
- [ ] Order marked as "failed" with error_message

---

## Video Quality Validation

### Visual Inspection Checklist
- [ ] Pre-made scenes (1, 2, 3, 7) have consistent quality
- [ ] Scene 1 (Sky Dive): 12s, smooth animation
- [ ] Scene 2 (Workshop): 12s, magical atmosphere
- [ ] Scene 3 (Book Magic): 10s, book opens animation
- [ ] Scene 4 (Photo Comes Alive): 12s, child's photo integrated with golden border
- [ ] Scene 5 (Name Reveal): 10s, golden 3D letters appear and rotate
- [ ] Scene 6 (Message): 25s, HeyGen talking head, personalized dialogue
- [ ] Scene 7 (Sleigh Ready): 10s, sleigh preparation scene
- [ ] Scene 8 (Epic Launch): 10s, sleigh launches into starry sky

### Audio Quality
- [ ] Scene 6 (Message) has clear audio from HeyGen
- [ ] No audio dropouts between scenes
- [ ] Consistent volume levels

### Aspect Ratio & Resolution
- [ ] All scenes are 16:9 aspect ratio
- [ ] Resolution at least 1080p (1920x1080 minimum)
- [ ] No distortion or stretching

---

## Performance Metrics

### Execution Time Targets
- **Script Generation**: 15-30 seconds
- **Pre-made Scene Generation** (first time): 60-120 seconds
- **Pre-made Scene Loading** (cached): <5 seconds
- **Scene 4 Generation** (per child): 60-90 seconds
- **Scene 5 Generation** (per child): 40-60 seconds
- **Scene 6 Generation** (per child): 20-40 seconds (HeyGen)
- **Scene 8 Generation** (per child): 40-60 seconds
- **Veo Polling** (all scenes): 30-60 seconds
- **Video Stitching**: 10-30 seconds
- **Upload**: 10-60 seconds (depends on file size & connection)

### Total Time Estimates
- **Single Child**: 180-300 seconds (~5 minutes)
- **Two Children**: 240-400 seconds (~8 minutes)
- **Three Children**: 300-500 seconds (~10 minutes)

---

## Integration Test Checklist

- [ ] **Database Migration**
  - Run migration successfully
  - Verify schema matches specifications
  - No data loss from existing orders

- [ ] **Supabase Storage**
  - Videos uploaded to `videos/{orderId}/final.mp4`
  - Public URL accessible
  - Cache control headers set correctly

- [ ] **Google Cloud Integration**
  - Service account credentials loaded
  - Gemini 2.0 Flash API responding
  - NanoBanana (Gemini 3 Pro Image) API responding
  - Veo 3.1 API responding with operation names

- [ ] **HeyGen Integration**
  - HeyGen talking head generation working
  - Character ID "santa" configured
  - Video URLs returned and accessible

- [ ] **Error Recovery**
  - Network timeout on Veo call → retries successfully
  - Photo download failure → returns meaningful error
  - Missing child data → returns meaningful error
  - Supabase connection loss → handled gracefully

---

## Deployment Validation (Phase 9)

- [ ] Environment variables set in Railway
- [ ] Database migrations applied to production
- [ ] API endpoint accessible from internet
- [ ] CORS headers correct for webhook calls
- [ ] Rate limiting configured
- [ ] Monitoring/logging configured
- [ ] Backup strategy verified

---

## Test Execution Log Template

```markdown
### Test Run: [Date & Time]
- Tester: [Name]
- Environment: [dev/staging/prod]
- Single Child: [PASS/FAIL] - [Notes]
- Two Children: [PASS/FAIL] - [Notes]
- Three Children: [PASS/FAIL] - [Notes]
- Cache Reuse: [PASS/FAIL] - [Notes]
- Error Handling: [PASS/FAIL] - [Notes]
- Performance: [PASS/FAIL] - [Notes]
- Video Quality: [PASS/FAIL] - [Notes]

Issues Found:
1. [Issue description] → [Resolution]

Approved for Production: [YES/NO]
Sign-off: [Name & Date]
```

---

## Notes
- All tests should be run with realistic data (real names, ages, behaviors)
- Test with different image formats (JPEG, PNG, WebP) for Scene 4
- Test with Polish, English, and other language preferences
- Monitor logs for "[PhotoAlive]", "[Scene5]", "[Scene6]", "[Scene8]" prefixes
- Verify Stripe webhook triggers generation (not manual API calls)
