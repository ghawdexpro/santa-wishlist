# Deployment & Testing Checklist

## ✅ Code Pushed to GitHub
- Main branch: `c095406` (Complete implementation summary)
- 4 major commits deployed:
  1. Phase 6: Orchestration pipeline rewrite
  2. Phase 8: Testing plan
  3. Phase 9: Deployment guide
  4. Implementation summary

## 🚀 Next Steps for Railway Deployment

### Step 1: Set Environment Variables in Railway
```bash
# Go to Railway Dashboard → Project Settings → Variables

# Google Cloud (Vertex AI)
GOOGLE_CLOUD_PROJECT=primal-turbine-478412-k9
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS_JSON={paste the full service account JSON}

# Supabase (ghawdexpro)
NEXT_PUBLIC_SUPABASE_URL=https://ghawdexpro.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
SUPABASE_SERVICE_ROLE_KEY=<your-key>

# Stripe
STRIPE_SECRET_KEY=sk_live_<your-key>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_<your-key>
STRIPE_WEBHOOK_SECRET=whsec_<your-secret>

# App
NEXT_PUBLIC_APP_URL=https://santa-experience.up.railway.app
NODE_ENV=production
```

### Step 2: Apply Database Migration
```sql
-- Login to Supabase PostgreSQL for ghawdexpro project
-- Run migration from: supabase/migrations/20241201_multi_child_support.sql

-- Verify schema
SELECT COUNT(*) FROM children;
SELECT COUNT(*) FROM premade_scenes;
SELECT column_name FROM information_schema.columns
WHERE table_name = 'orders' AND column_name IN ('child_count', 'generation_progress');
```

### Step 3: Configure Stripe Webhook
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://santa-experience.up.railway.app/api/stripe-webhook`
3. Select events: `payment_intent.succeeded`
4. Copy webhook secret to Railway: `STRIPE_WEBHOOK_SECRET`

### Step 4: Monitor Deployment
```bash
# Watch Railway logs
railway logs --follow

# Expect to see:
# - "Deployment successful"
# - "Next.js server started"
# - No build errors
```

### Step 5: Test Health Endpoint
```bash
curl -I https://santa-experience.up.railway.app

# Expected: HTTP/1.1 200 OK
```

---

## 🧪 Testing Scenarios

### Test 1: Single Child Order
**Setup:**
```json
{
  "orderId": "test-single-child",
  "children": [
    {
      "id": "child-1",
      "name": "Emma",
      "age": 7,
      "sequence_number": 1,
      "photo_url": "https://example.com/emma.jpg",
      "good_behavior": "being kind to others",
      "thing_to_improve": "sharing toys",
      "thing_to_learn": "playing the piano"
    }
  ]
}
```

**Expected Results:**
- ✅ Order status: pending → generating → complete
- ✅ Video duration: ~110-130 seconds
- ✅ All 8 scenes present
- ✅ Emma's name in scenes 4, 5, 6, 8
- ✅ Video URL returned and accessible
- ✅ Execution time: 4-6 minutes (first run, pre-made generation included)

---

### Test 2: Two Children Order
**Setup:**
```json
{
  "orderId": "test-two-children",
  "children": [
    {
      "id": "child-2a",
      "name": "Liam",
      "age": 5,
      "sequence_number": 1,
      "photo_url": "https://example.com/liam.jpg",
      "good_behavior": "listening well",
      "thing_to_improve": "being patient",
      "thing_to_learn": "swimming"
    },
    {
      "id": "child-2b",
      "name": "Sophie",
      "age": 8,
      "sequence_number": 2,
      "photo_url": "https://example.com/sophie.jpg",
      "good_behavior": "helping mom",
      "thing_to_improve": "trying new things",
      "thing_to_learn": "drawing"
    }
  ]
}
```

**Expected Results:**
- ✅ Order status: complete
- ✅ Video duration: ~155-175 seconds (2:35-2:55)
- ✅ Scene order: [1][2][3][4-Liam][4-Sophie][5-Liam][5-Sophie][6-Liam][6-Sophie][7][8-Liam][8-Sophie]
- ✅ Both children featured prominently
- ✅ Execution time: 6-9 minutes (faster with cached pre-made scenes)

---

### Test 3: Three Children Order
**Setup:**
```json
{
  "orderId": "test-three-children",
  "children": [
    {
      "id": "child-3a",
      "name": "Noah",
      "age": 6,
      "sequence_number": 1,
      "photo_url": "https://example.com/noah.jpg",
      "good_behavior": "being brave",
      "thing_to_improve": "speaking up",
      "thing_to_learn": "soccer"
    },
    {
      "id": "child-3b",
      "name": "Ava",
      "age": 9,
      "sequence_number": 2,
      "photo_url": "https://example.com/ava.jpg",
      "good_behavior": "being creative",
      "thing_to_improve": "managing time",
      "thing_to_learn": "coding"
    },
    {
      "id": "child-3c",
      "name": "Oliver",
      "age": 4,
      "sequence_number": 3,
      "photo_url": "https://example.com/oliver.jpg",
      "good_behavior": "sharing",
      "thing_to_improve": "eating vegetables",
      "thing_to_learn": "colors"
    }
  ]
}
```

**Expected Results:**
- ✅ Order status: complete
- ✅ Video duration: ~215-235 seconds (3:35-3:55)
- ✅ All 3 children in correct order (Noah → Ava → Oliver)
- ✅ 9 Veo operations running in parallel
- ✅ Execution time: 8-12 minutes

---

## 🔍 Validation Checklist

### API Response Format
```json
{
  "success": true,
  "videoUrl": "https://ghawdexpro.supabase.co/storage/v1/object/public/videos/{orderId}/final.mp4",
  "orderId": "test-order-id",
  "childCount": 2
}
```

### Database Verification
```sql
-- Check order status
SELECT id, status, child_count, final_video_url, generation_progress
FROM orders WHERE id = 'test-order-id';

-- Check children
SELECT name, age, sequence_number FROM children
WHERE order_id = 'test-order-id'
ORDER BY sequence_number;

-- Check cached scenes
SELECT scene_number, video_url, created_at
FROM premade_scenes ORDER BY scene_number;
```

### Video Quality Checklist
- [ ] Video plays without errors
- [ ] No artifacts or distortions
- [ ] Audio clear and in sync
- [ ] Aspect ratio 16:9 throughout
- [ ] All 8 scenes present and in correct order
- [ ] No gaps between scenes
- [ ] Colors vibrant and consistent

### Log Monitoring
Monitor Railway logs for these prefixes:
```
[Orchestration] - Main pipeline progress
[PhotoAlive] - Scene 4 generation
[Scene5] - Name reveal generation
[Scene6] - Message generation
[Scene8] - Launch generation
[PremadeCache] - Cache operations
[NanoBanana] - Image generation
[Veo] - Video generation
[VideoStitcher] - Stitching operations
```

---

## 🐛 Troubleshooting

### Issue: "GOOGLE_CLOUD_PROJECT not set"
**Solution:** Add to Railway environment variables

### Issue: Veo polling timeout
**Solution:** Check Google Cloud quota, increase timeout in veo.ts

### Issue: HeyGen fails with 401
**Solution:** Verify HeyGen API key, check character ID

### Issue: Photo compositing looks bad
**Solution:** Try different prompt in photo-alive-generation.ts, regenerate scene 4

### Issue: Database migration fails
**Solution:**
1. Check Supabase connection
2. Verify service role key
3. Run migration manually in SQL editor

---

## 📊 Performance Baseline

### First Deployment (Pre-made scenes generated)
- Script generation: 20-30s
- Pre-made scene generation: 60-120s
- Personalized scene generation (2 children): 120-180s
- Veo polling: 60-90s
- Stitching: 15-30s
- Upload: 30-60s
- **Total: 6-10 minutes**

### Subsequent Orders (Pre-made cached)
- Script generation: 15-20s
- Personalized scene generation (2 children): 120-180s
- Veo polling: 60-90s
- Stitching: 15-30s
- Upload: 30-60s
- **Total: 4-7 minutes**

---

## ✅ Sign-Off

- [ ] Environment variables set
- [ ] Database migration applied
- [ ] Stripe webhook configured
- [ ] Deployment successful (check logs)
- [ ] Health endpoint working
- [ ] Test 1 (single child) passed
- [ ] Test 2 (two children) passed
- [ ] Test 3 (three children) passed
- [ ] Video quality verified
- [ ] Database integrity confirmed
- [ ] Monitoring configured
- [ ] Ready for production

**Deployed by:** ________________
**Date:** ________________
**Status:** 🟢 READY / 🟡 TESTING / 🔴 BLOCKED

---

## Quick Command Reference

```bash
# Push to Railway (if CLI available)
railway link
git push origin main
# Railway auto-deploys on push

# Monitor logs
railway logs --follow

# Check environment
railway env list

# Connect to Supabase
psql "postgresql://user:pass@host:5432/postgres"

# Test API
curl -X POST https://santa-experience.up.railway.app/api/generate-full-video \
  -H "Content-Type: application/json" \
  -d '{"orderId":"test-123"}'
```
