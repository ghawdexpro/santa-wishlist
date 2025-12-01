# Implementation Plan: Santa Experience Improvements

## Overview
Fix all critical issues identified in system analysis (no graphics generation).

---

## Stage 1: Email Notification System (Resend)
**Priority: HIGH** - Customers need to know when video is ready

### Tasks:
- [ ] Install Resend SDK (`npm install resend`)
- [ ] Create email templates:
  - `order-confirmed.tsx` - Payment received, processing started
  - `video-ready.tsx` - Video complete with watch link
  - `video-failed.tsx` - Generation failed, support contact
- [ ] Create `/lib/email.ts` - Email sending utility
- [ ] Add `RESEND_API_KEY` to Railway env vars
- [ ] Integrate into webhook and video generation flow

### Files to create/modify:
- `src/lib/email.ts` (NEW)
- `src/emails/order-confirmed.tsx` (NEW)
- `src/emails/video-ready.tsx` (NEW)
- `src/emails/video-failed.tsx` (NEW)
- `src/app/api/webhooks/stripe/route.ts` (MODIFY)
- `src/app/api/generate-full-video/route.ts` (MODIFY)

---

## Stage 2: Auto-Approve Flow
**Priority: HIGH** - Remove admin bottleneck

### Tasks:
- [ ] Add `AUTO_APPROVE_VIDEOS` env var (default: true)
- [ ] Modify webhook to skip keyframe review when auto-approve enabled
- [ ] Direct path: Payment → generate-full-video (no keyframe-only step)
- [ ] Keep manual review as optional fallback

### Flow change:
```
OLD: Webhook → generate-keyframes-only → Admin review → approve-and-generate
NEW: Webhook → generate-full-video (direct, auto-approve)
     OR
     Webhook → generate-keyframes-only → Admin review (if AUTO_APPROVE=false)
```

### Files to modify:
- `src/app/api/webhooks/stripe/route.ts`
- Add env var to Railway

---

## Stage 3: Retry Logic for AI Services
**Priority: HIGH** - Prevent single failures from killing orders

### Tasks:
- [ ] Create `src/lib/retry.ts` - Generic retry utility with exponential backoff
- [ ] Wrap Veo calls in retry logic (3 attempts)
- [ ] Wrap HeyGen calls in retry logic (3 attempts)
- [ ] Wrap NanoBanana calls in retry logic (3 attempts)
- [ ] Log retry attempts

### Retry config:
- Max attempts: 3
- Initial delay: 2 seconds
- Backoff multiplier: 2 (2s, 4s, 8s)
- Max delay: 30 seconds

### Files to create/modify:
- `src/lib/retry.ts` (NEW)
- `src/lib/veo.ts` (MODIFY)
- `src/lib/heygen.ts` (MODIFY)
- `src/lib/nanobanana.ts` (MODIFY)

---

## Stage 4: Customer Progress Tracking
**Priority: MEDIUM** - Better UX

### Tasks:
- [ ] Enhance `generation_progress` JSONB structure
- [ ] Create `/api/orders/[orderId]/status` endpoint
- [ ] Create progress component for success page
- [ ] Real-time polling or SSE for updates

### Progress structure:
```json
{
  "stage": "generating",
  "currentScene": 4,
  "totalScenes": 8,
  "scenesComplete": ["1", "2", "3"],
  "estimatedTimeRemaining": 180,
  "startedAt": "2024-12-01T10:00:00Z"
}
```

### Files to create/modify:
- `src/app/api/orders/[orderId]/status/route.ts` (NEW)
- `src/components/VideoProgress.tsx` (NEW)
- `src/app/order/[orderId]/success/page.tsx` (MODIFY)

---

## Stage 5: Error Handling & Recovery
**Priority: MEDIUM** - Better debugging and recovery

### Tasks:
- [ ] Add detailed error logging with context
- [ ] Store error details in order record
- [ ] Add ability to retry failed orders from admin
- [ ] Add `/api/admin/retry-order` endpoint

### Files to create/modify:
- `src/app/api/admin/retry-order/route.ts` (NEW)
- `src/app/api/generate-full-video/route.ts` (MODIFY)

---

## Stage 6: Theme Consistency
**Priority: MEDIUM** - Malta theme everywhere

### Tasks:
- [ ] Update landing page copy
- [ ] Update metadata/SEO
- [ ] Update any remaining North Pole references
- [ ] Update email templates with Malta theme

### Files to modify:
- `src/app/page.tsx`
- `src/app/layout.tsx`
- Various components

---

## Stage 7: Cost Tracking
**Priority: LOW** - Business intelligence

### Tasks:
- [ ] Add `cost_breakdown` JSONB column to orders table
- [ ] Track cost per AI service call
- [ ] Store estimated cost on order completion

### Cost tracking structure:
```json
{
  "veo": 2.40,
  "heygen": 0.75,
  "nanobanana": 0.30,
  "total": 3.45
}
```

---

## Stage 8: Deploy & Test
### Tasks:
- [ ] Run build locally
- [ ] Push to GitHub
- [ ] Deploy to Railway
- [ ] Test full flow with test order

---

## Environment Variables to Add
```
RESEND_API_KEY=re_xxxxx
AUTO_APPROVE_VIDEOS=true
NOTIFICATION_EMAIL_FROM=santa@yourdomain.com
```

---

## Estimated Timeline
- Stage 1 (Email): 30 min
- Stage 2 (Auto-approve): 15 min
- Stage 3 (Retry): 20 min
- Stage 4 (Progress): 30 min
- Stage 5 (Errors): 20 min
- Stage 6 (Theme): 15 min
- Stage 7 (Costs): 15 min
- Stage 8 (Deploy): 15 min

**Total: ~2.5 hours**
