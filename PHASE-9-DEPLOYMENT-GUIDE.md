# Phase 9: Production Deployment Guide
## Multi-Child Santa Experience Video Service

---

## Pre-Deployment Checklist

### 1. Code Quality & Testing
- [ ] All TypeScript compiles without errors (`npm run build`)
- [ ] ESLint passes (`npm run lint`)
- [ ] Phase 8 testing plan completed and all scenarios passed
- [ ] No console.error logs in critical paths (only warnings/info)
- [ ] All async/await patterns correct (no dangling promises)
- [ ] Error messages are user-friendly (not exposing stack traces)

### 2. Environment Variables

**Set in Railway Dashboard → Environment:**

```
# Google Cloud (Vertex AI)
GOOGLE_CLOUD_PROJECT=primal-turbine-478412-k9
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}

# Supabase (ghawdexpro org)
NEXT_PUBLIC_SUPABASE_URL=https://ghawdexpro.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Stripe
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# App Config
NEXT_PUBLIC_APP_URL=https://santa-experience.up.railway.app
NODE_ENV=production
```

### 3. Supabase Production Setup

#### Apply Database Migration
```bash
# From project root (using Supabase CLI)
supabase db push --project-id ghawdexpro

# Or manually via Supabase web console:
# 1. Go to SQL Editor
# 2. Copy content from supabase/migrations/20241201_multi_child_support.sql
# 3. Execute in production database
```

#### Verify Schema
```sql
-- Verify children table
SELECT COUNT(*) FROM children;

-- Verify orders columns
SELECT column_name, data_type FROM information_schema.columns
WHERE table_name = 'orders'
ORDER BY column_name;

-- Verify premade_scenes table
SELECT COUNT(*) FROM premade_scenes;
```

#### Set RLS Policies (if not already set)
```sql
-- Enable RLS on children table
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Allow service role to read/write (for orchestration)
CREATE POLICY "Service role can manage children"
ON children
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Allow authenticated users to read their own order's children
CREATE POLICY "Users can read their order children"
ON children
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = children.order_id
    AND orders.user_id = auth.uid()
  )
);
```

#### Storage Bucket Setup
```sql
-- Verify videos bucket exists
SELECT id, name, public FROM storage.buckets
WHERE name = 'videos';

-- Set public access
UPDATE storage.buckets
SET public = true
WHERE name = 'videos';
```

### 4. Google Cloud Configuration

#### Service Account Permissions
Verify `vertex-express@primal-turbine-478412-k9.iam.gserviceaccount.com` has:
- [ ] Vertex AI User (aiplatform.user)
- [ ] Service Account Token Creator (iam.serviceAccountTokenCreator)

```bash
# List roles (using gcloud CLI)
gcloud projects get-iam-policy primal-turbine-478412-k9 \
  --flatten="bindings[].members" \
  --filter="bindings.members:serviceAccount:vertex-express@*" \
  --format="table(bindings.role)"
```

#### API Enablement
Verify these APIs are enabled in Google Cloud Console:
- [ ] Vertex AI API (aiplatform.googleapis.com)
- [ ] Generative Language API (generativelanguage.googleapis.com)

```bash
gcloud services list --enabled | grep -E "aiplatform|generativelanguage"
```

### 5. HeyGen Integration
- [ ] HeyGen account created and funded
- [ ] API key configured in environment (if needed)
- [ ] Santa character created and tested
- [ ] Webhook for completion events configured (if using async)

### 6. Stripe Webhook

#### Create Webhook Endpoint
1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://santa-experience.up.railway.app/api/stripe-webhook`
3. Select events: `payment_intent.succeeded`
4. Copy signing secret to environment: `STRIPE_WEBHOOK_SECRET`

#### Webhook Handler Verification
- [ ] `/api/stripe-webhook` endpoint exists
- [ ] Verifies webhook signature (STRIPE_WEBHOOK_SECRET)
- [ ] Triggers `/api/generate-full-video` POST request
- [ ] Returns 200 OK immediately (async processing)
- [ ] Has error logging/monitoring

### 7. Railway Deployment

#### Initial Setup
```bash
# Link to Railway project
railway link

# Set production environment
railway env set NODE_ENV production

# Verify environment variables are set
railway env list
```

#### Build & Deploy
```bash
# Push code to main branch
git push origin main

# Railway auto-deploys on push
# Monitor deployment: railway logs --follow

# After successful deployment, verify endpoint
curl https://santa-experience.up.railway.app/api/health

# Should return: 200 OK (or your health check response)
```

#### Database URL
- [ ] Railway auto-sets DATABASE_URL (Supabase connection)
- [ ] Connection pooling enabled (PgBouncer)
- [ ] SSL mode enabled (sslmode=require)

### 8. Monitoring & Logging

#### Railway Monitoring
```bash
# View logs
railway logs --follow

# View metrics
railway metrics

# Set log level
railway env set LOG_LEVEL=info
```

#### Supabase Monitoring
1. Go to Supabase Dashboard → Logs
2. Monitor for errors in:
   - Query errors
   - Function execution
   - Storage uploads

#### Error Tracking (Optional)
- [ ] Sentry configured (if using)
- [ ] Error emails configured (if critical errors)
- [ ] Slack notifications for failures (if enabled)

### 9. Performance & Optimization

#### CDN & Caching
- [ ] Supabase Storage has cache-control headers (`cacheControl: '31536000'` = 1 year)
- [ ] Next.js build optimized (`next build`)
- [ ] Image optimization enabled (Next.js built-in)

#### Database Optimization
```sql
-- Monitor slow queries
SELECT * FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Verify indexes exist
SELECT * FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename;
```

### 10. Security Hardening

#### CORS Configuration
```javascript
// Verify in your middleware/next.config.js
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://santa-experience.up.railway.app',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
```

#### Rate Limiting
- [ ] Implement rate limiting on `/api/generate-full-video`
- [ ] Limit: 1 request per order (check order status first)
- [ ] Reject if status is 'generating' or 'complete'

#### API Key Security
- [ ] All secrets stored in Railway environment (not .env.local)
- [ ] Stripe webhook secret verified
- [ ] Google service account JSON never committed to git
- [ ] Supabase anon key public (expected) but service role key secret

### 11. Backup & Recovery

#### Database Backups
```bash
# Supabase daily automated backups enabled
# Go to Database → Backups in Supabase Dashboard
# Verify: daily backups enabled, 30-day retention
```

#### Video Storage Backup
- [ ] Configure Supabase Storage backup (if available)
- [ ] Or manually backup videos bucket periodically

#### Disaster Recovery Plan
- [ ] Document how to restore from backup
- [ ] Test restore process (dry run)
- [ ] Estimated recovery time: < 1 hour

---

## Deployment Steps

### Step 1: Code Push
```bash
git push origin main
```

### Step 2: Verify Build
```bash
railway logs --follow
# Wait for "Deployment successful" message
# Check for build errors
```

### Step 3: Run Database Migration
```bash
# Use Supabase web console to run migration
# Or use supabase CLI:
supabase db push --project-id ghawdexpro
```

### Step 4: Test Health Endpoint
```bash
curl -I https://santa-experience.up.railway.app
# Should return 200
```

### Step 5: Test API Endpoint
```bash
# Create test order first (manually in Supabase)
# Then call generate endpoint:
curl -X POST https://santa-experience.up.railway.app/api/generate-full-video \
  -H "Content-Type: application/json" \
  -d '{"orderId":"test-order-id"}'

# Should return 200 with video generation started
```

### Step 6: Verify Webhook
1. Go to Stripe Dashboard → Test mode
2. Create test payment (should trigger webhook)
3. Check Railway logs for webhook processing
4. Verify order status changed to 'generating'

### Step 7: Monitor First Generation
```bash
# Watch logs during first video generation
railway logs --follow

# Should see logs like:
# [Orchestration] Starting 8-scene multi-child video generation...
# [Orchestration] Order loaded with 2 child(ren)...
# [PremadeCache] Generating Scene 1...
# etc.
```

---

## Post-Deployment Validation

### Functional Testing
- [ ] Single child video generates (test order created)
- [ ] Two child video generates
- [ ] Three child video generates
- [ ] Videos are accessible via public URL
- [ ] All 8 scenes present in final video
- [ ] Scene durations correct (~112s for 1 child, etc.)

### Performance Testing
- [ ] Single child: completes in < 5 minutes
- [ ] Two children: completes in < 8 minutes
- [ ] Three children: completes in < 10 minutes
- [ ] Response times acceptable (< 100ms for API calls)

### Database Testing
```sql
-- Verify data integrity
SELECT COUNT(*) FROM orders WHERE status = 'complete';
SELECT COUNT(*) FROM children WHERE id IS NOT NULL;
SELECT COUNT(*) FROM premade_scenes WHERE video_url IS NOT NULL;
```

### User Acceptance Testing
- [ ] Production link shared with stakeholders
- [ ] Generate 2-3 sample videos
- [ ] Gather feedback on video quality
- [ ] Verify customer emails working
- [ ] Test refund/cancellation flow

---

## Rollback Plan

If critical issues found, rollback using:

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Railway auto-deploys previous version
railway logs --follow

# If database migration caused issues:
# 1. Create rollback migration
# 2. Or restore from Supabase backup
```

### Rollback Decisions
| Issue | Decision |
|-------|----------|
| TypeScript error | Revert immediately |
| 404 on API | Check environment variables |
| Database error | Restore from backup |
| Video quality issue | Keep deployed, minor update |
| Performance issue | Keep deployed, optimize later |

---

## Production Maintenance

### Weekly Tasks
- [ ] Check error logs in Railway
- [ ] Monitor database performance
- [ ] Verify backups are running
- [ ] Check Stripe webhook health

### Monthly Tasks
- [ ] Review video generation times
- [ ] Analyze customer feedback
- [ ] Update pre-made scenes if needed
- [ ] Optimize database queries

### Quarterly Tasks
- [ ] Review security settings
- [ ] Update dependencies
- [ ] Performance profiling & optimization
- [ ] Cost analysis (Google Cloud, Stripe, Supabase)

---

## Support & Troubleshooting

### Common Issues

**Issue: Video generation timeout**
- Check Google Cloud API quota
- Check Veo API status
- Verify access token generation

**Issue: HeyGen fails**
- Verify HeyGen API key in environment
- Check character ID configuration
- Verify HeyGen account has sufficient credits

**Issue: Storage upload fails**
- Verify Supabase Storage bucket is public
- Check bucket permissions
- Verify file size < 5GB

**Issue: Database migration failed**
- Verify Supabase service role key
- Check migration syntax
- Review Supabase logs

### Escalation Path
1. Check logs: `railway logs --follow`
2. Check Supabase: Dashboard → Logs
3. Check Google Cloud: Console → Logs
4. Check Stripe: Dashboard → Logs
5. Contact support if unresolved

---

## Success Criteria

Deployment is considered successful when:
- ✅ All environment variables set correctly
- ✅ Database migration applied without errors
- ✅ Health endpoint returns 200 OK
- ✅ Stripe webhook successfully triggered
- ✅ Video generation completes for 1, 2, and 3 children
- ✅ Videos accessible via public URL
- ✅ Video quality acceptable
- ✅ Performance meets targets (< 10 min for 3 children)
- ✅ Error handling working (meaningful error messages)
- ✅ Monitoring & logging configured
- ✅ Backup strategy verified
- ✅ Customer feedback positive

---

## Sign-Off

- [ ] Deployed by: _________________ Date: _______
- [ ] Tested by: _________________ Date: _______
- [ ] Approved for production: _________________ Date: _______

---

## Appendix: Quick Commands

```bash
# View logs
railway logs --follow

# Set environment variable
railway env set KEY=value

# View all environment variables
railway env list

# Connect to production database
psql "postgresql://user:password@host/database"

# Run SQL query on production
supabase db execute --project-id ghawdexpro "SELECT * FROM orders LIMIT 5"

# Deploy specific commit
git push origin commit-hash:main

# Check Railway status
railway status
```

---

## Documentation Links
- [Railway Docs](https://docs.railway.app)
- [Supabase Docs](https://supabase.com/docs)
- [Vertex AI Docs](https://cloud.google.com/vertex-ai/docs)
- [Stripe Docs](https://stripe.com/docs)
- [Next.js Docs](https://nextjs.org/docs)
