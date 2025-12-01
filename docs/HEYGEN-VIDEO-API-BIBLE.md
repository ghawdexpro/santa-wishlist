# HeyGen Video Generation API Bible

> Comprehensive documentation for HeyGen's Video Generation API (V2) - for generating pre-rendered avatar videos.

**Last Updated:** 2024-11-30
**API Version:** V2
**Use Case:** Scene 6 - Santa speaking personalized script

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Pricing & Credits](#pricing--credits)
4. [API Endpoints](#api-endpoints)
5. [Video Generation](#video-generation)
6. [Avatar Types](#avatar-types)
7. [Voice Configuration](#voice-configuration)
8. [Background Options](#background-options)
9. [Video Status & Retrieval](#video-status--retrieval)
10. [Photo Avatars](#photo-avatars)
11. [Best Practices](#best-practices)
12. [Error Handling](#error-handling)
13. [Code Examples](#code-examples)
14. [Santa Project Integration](#santa-project-integration)

---

## Overview

HeyGen's Video Generation API creates **pre-rendered avatar videos** from text scripts. Unlike the Streaming Avatar API (for real-time interaction), this API generates videos asynchronously - you submit a request, receive a video ID, then poll for completion.

### Key Characteristics

| Feature | Description |
|---------|-------------|
| **Type** | Asynchronous REST API |
| **Output** | MP4 video file (downloadable URL) |
| **Latency** | 30 seconds to several minutes |
| **Max Length** | 3 min (Free), 5 min (Pro), 30 min (Scale) |
| **Max Resolution** | 720p (Free), 1080p (Pro), 4K (Scale) |
| **Text Limit** | 5,000 characters per video |
| **URL Expiration** | Video URLs expire after 7 days |

### When to Use

- Pre-recorded personalized messages (Santa's message to children)
- Marketing videos
- Training content
- Any video that doesn't require real-time interaction

---

## Authentication

All HeyGen API requests require an API key in the header.

### Getting Your API Key

1. Go to [HeyGen Settings](https://app.heygen.com/settings)
2. Navigate to **Subscriptions & API**
3. Copy your API key

### Header Format

```
X-Api-Key: your-api-key-here
```

### Example Request

```bash
curl -X GET "https://api.heygen.com/v2/avatars" \
  -H "X-Api-Key: YOUR_API_KEY"
```

---

## Pricing & Credits

### API Plans (Standalone from App Plans)

| Plan | Price | Credits/Month | Max Video Length | Max Resolution | Concurrent Jobs |
|------|-------|---------------|------------------|----------------|-----------------|
| **Free Trial** | $0 | 10 | 3 min | 720p | 1 |
| **Pro** | $99/mo | 100 | 5 min | 1080p | 3 |
| **Scale** | $330/mo | 660 | 30 min | 4K | 6 |
| **Enterprise** | Custom | Custom | Custom | 4K | Custom |

### Credit Consumption

| Avatar Type | Cost |
|-------------|------|
| **Photo Avatar** | 1 credit/minute (30-sec increments) |
| **Video Avatar** | 2 credits/minute (30-sec increments) |
| **Avatar IV** | 6 credits/minute |
| **Photo Generation** | 1 credit/call |
| **Look Generation** | 1 credit/call |
| **Training** | 4 credits/call |
| **Upscaling** | 0.5 credits/call |

### Cost Calculation Examples

| Video Length | Photo Avatar Cost | Video Avatar Cost |
|--------------|-------------------|-------------------|
| 30 seconds | 0.5 credits | 1 credit |
| 1 minute | 1 credit | 2 credits |
| 2 minutes | 2 credits | 4 credits |
| 5 minutes | 5 credits | 10 credits |

**For Santa Project (Scene 6 ~25 seconds):**
- Photo Avatar: ~0.5 credits per video
- Video Avatar: ~1 credit per video

---

## API Endpoints

### Core Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v2/avatars` | GET | List all available avatars |
| `/v2/voices` | GET | List all available voices |
| `/v2/video/generate` | POST | Create a new video |
| `/v1/video_status.get` | GET | Check video generation status |

### Avatar Management

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v2/avatar_group.list` | GET | List avatar groups |
| `/v2/avatar_group/{id}/avatars` | GET | List avatars in a group |

### Photo Avatar Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v2/photo_avatar/photo/generate` | POST | Generate AI photo avatar |
| `/v2/photo_avatar/avatar_group` | POST | Create avatar group |
| `/v2/photo_avatar/train` | POST | Train avatar model |
| `/v2/photo_avatar/look/generate` | POST | Generate avatar look |
| `/v2/photo_avatar/motion` | POST | Add motion to photo avatar |

---

## Video Generation

### Endpoint

```
POST https://api.heygen.com/v2/video/generate
```

### Request Structure

```json
{
  "video_inputs": [
    {
      "character": {
        "type": "avatar",
        "avatar_id": "Angela-inTshirt-20220820",
        "avatar_style": "normal"
      },
      "voice": {
        "type": "text",
        "input_text": "Your script here...",
        "voice_id": "1bd001e7e50f421d891986aad5158bc8",
        "speed": 1.0,
        "pitch": 0
      },
      "background": {
        "type": "color",
        "value": "#FFFFFF"
      }
    }
  ],
  "dimension": {
    "width": 1280,
    "height": 720
  },
  "test": false
}
```

### Request Parameters

#### Top-Level Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `video_inputs` | array | Yes | Array of scene configurations |
| `dimension` | object | No | Video resolution (default: 1280x720) |
| `test` | boolean | No | If true, generates watermarked test video |

#### Character Object

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | `"avatar"`, `"talking_photo"`, or `"photo_avatar"` |
| `avatar_id` | string | Yes* | ID from List Avatars API (*for avatar type) |
| `talking_photo_id` | string | Yes* | ID for photo avatars (*for talking_photo type) |
| `avatar_style` | string | No | `"normal"` or `"casual"` (default: normal) |

#### Voice Object

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | `"text"` or `"audio"` |
| `input_text` | string | Yes* | Script text (*for text type, max 5000 chars) |
| `input_audio` | string | Yes* | Audio URL (*for audio type) |
| `voice_id` | string | Yes | Voice ID from List Voices API |
| `speed` | float | No | Speech rate: 0.5-1.5 (default: 1.0) |
| `pitch` | integer | No | Pitch adjustment: -10 to 10 (default: 0) |

#### Background Object

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | Yes | `"color"`, `"image"`, `"video"`, or `"transparent"` |
| `value` | string | Varies | Hex color for "color" type |
| `url` | string | Varies | URL for "image" or "video" type |

#### Dimension Object

| Parameter | Type | Description |
|-----------|------|-------------|
| `width` | integer | Video width in pixels |
| `height` | integer | Video height in pixels |

**Common Dimensions:**
- 1280x720 (720p - Free plan max)
- 1920x1080 (1080p - Pro plan)
- 3840x2160 (4K - Scale/Enterprise)

### Response

```json
{
  "error": null,
  "data": {
    "video_id": "abcdef123456789"
  }
}
```

---

## Avatar Types

### 1. Standard Avatars (`type: "avatar"`)

Pre-built HeyGen avatars with various styles and appearances.

```json
{
  "character": {
    "type": "avatar",
    "avatar_id": "Angela-inTshirt-20220820",
    "avatar_style": "normal"
  }
}
```

**Getting Avatar IDs:**
```bash
curl -X GET "https://api.heygen.com/v2/avatars" \
  -H "X-Api-Key: YOUR_API_KEY"
```

### 2. Photo Avatars (`type: "talking_photo"`)

Custom avatars created from uploaded photos.

```json
{
  "character": {
    "type": "talking_photo",
    "talking_photo_id": "phav_abcdef123456"
  }
}
```

### 3. Avatar IV (Advanced Photo)

Highest quality photo-to-video with gestures and expressions.

```json
{
  "character": {
    "type": "avatar_iv",
    "avatar_iv_id": "aviv_abcdef123456"
  }
}
```

**Cost:** 6 credits/minute (vs 1 credit for standard photo avatar)

---

## Voice Configuration

### Listing Available Voices

```bash
curl -X GET "https://api.heygen.com/v2/voices" \
  -H "X-Api-Key: YOUR_API_KEY"
```

### Voice Response Structure

```json
{
  "data": {
    "voices": [
      {
        "voice_id": "1bd001e7e50f421d891986aad5158bc8",
        "name": "Sara",
        "language": "English",
        "gender": "Female",
        "preview_audio": "https://..."
      }
    ]
  }
}
```

### Voice Types

#### Text-to-Speech
```json
{
  "voice": {
    "type": "text",
    "input_text": "Your script here",
    "voice_id": "voice_id_here",
    "speed": 1.0,
    "pitch": 0
  }
}
```

#### Custom Audio
```json
{
  "voice": {
    "type": "audio",
    "input_audio": "https://example.com/audio.mp3"
  }
}
```

### Voice Parameters

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| `speed` | 0.5 - 1.5 | 1.0 | Speech rate multiplier |
| `pitch` | -10 to 10 | 0 | Voice pitch adjustment |

---

## Background Options

### Solid Color

```json
{
  "background": {
    "type": "color",
    "value": "#FFFFFF"
  }
}
```

### Custom Image

```json
{
  "background": {
    "type": "image",
    "url": "https://example.com/background.jpg"
  }
}
```

**Requirements:**
- Format: JPG or PNG
- Max size: 50MB
- Max resolution: 2K

### Custom Video

```json
{
  "background": {
    "type": "video",
    "url": "https://example.com/background.mp4"
  }
}
```

**Requirements:**
- Format: MP4
- Max size: 100MB
- Max resolution: 2K

### Transparent (WebM Output)

```json
{
  "background": {
    "type": "transparent"
  }
}
```

**Note:** Outputs WebM format instead of MP4 for compositing.

---

## Video Status & Retrieval

### Check Video Status

```
GET https://api.heygen.com/v1/video_status.get?video_id={video_id}
```

### Status Values

| Status | Description |
|--------|-------------|
| `pending` | Request received, queued for processing |
| `waiting` | Waiting for resources |
| `processing` | Video is being generated |
| `completed` | Video ready for download |
| `failed` | Generation failed |

### Response Structure

```json
{
  "data": {
    "status": "completed",
    "video_id": "abcdef123456",
    "video_url": "https://resource.heygen.com/...",
    "thumbnail_url": "https://resource.heygen.com/...",
    "video_url_caption": "https://resource.heygen.com/...",
    "duration": 45.5,
    "gif_url": "https://resource.heygen.com/..."
  }
}
```

### Important: URL Expiration

**All URLs expire after 7 days!**

Options:
1. Download video within 7 days
2. Call status endpoint again to get fresh URLs

---

## Photo Avatars

### Complete Workflow

1. **Upload Photo** → 2. **Create Avatar Group** → 3. **Train Model** → 4. **Generate Looks** → 5. **Use in Video**

### Step 1: Upload Asset

```bash
curl -X POST "https://api.heygen.com/v2/asset" \
  -H "X-Api-Key: YOUR_API_KEY" \
  -F "file=@photo.jpg"
```

### Step 2: Create Avatar Group

```bash
curl -X POST "https://api.heygen.com/v2/photo_avatar/avatar_group" \
  -H "X-Api-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Santa Claus",
    "image_urls": ["https://...uploaded_photo_url..."]
  }'
```

### Step 3: Train Model

```bash
curl -X POST "https://api.heygen.com/v2/photo_avatar/train" \
  -H "X-Api-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "avatar_group_id": "avg_123456"
  }'
```

**Cost:** 4 credits per training

### Step 4: Generate Looks

```bash
curl -X POST "https://api.heygen.com/v2/photo_avatar/look/generate" \
  -H "X-Api-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "avatar_group_id": "avg_123456",
    "prompt": "Santa Claus in a cozy workshop, warm lighting"
  }'
```

**Cost:** 1 credit per look

### Step 5: Use in Video

```json
{
  "video_inputs": [{
    "character": {
      "type": "talking_photo",
      "talking_photo_id": "look_id_from_step_4"
    },
    "voice": {
      "type": "text",
      "input_text": "Ho ho ho! Merry Christmas!",
      "voice_id": "santa_voice_id"
    }
  }]
}
```

---

## Best Practices

### 1. Text Optimization

- Keep scripts under **1,500 characters** for optimal performance
- Break long scripts into multiple scenes
- Avoid special characters that may not be spoken correctly

### 2. Performance

- Use **lower resolutions** for faster processing
- Implement **exponential backoff** when polling status
- Cache avatar and voice IDs to avoid repeated API calls

### 3. Cost Management

- Use **test mode** (`"test": true`) during development
- Photo avatars (1 credit/min) are cheaper than video avatars (2 credits/min)
- Monitor credit usage via dashboard

### 4. Reliability

- Download videos within **7 days** before URL expiration
- Implement retry logic for transient failures
- Store video_id for status recovery

### 5. Polling Strategy

```typescript
async function pollVideoStatus(videoId: string, maxAttempts = 60): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await checkStatus(videoId);

    if (status.data.status === 'completed') {
      return status.data.video_url;
    }

    if (status.data.status === 'failed') {
      throw new Error('Video generation failed');
    }

    // Exponential backoff: 5s, 10s, 15s... up to 30s
    const delay = Math.min(5000 * (i + 1), 30000);
    await sleep(delay);
  }

  throw new Error('Video generation timed out');
}
```

---

## Error Handling

### Common Error Responses

```json
{
  "error": {
    "code": "invalid_api_key",
    "message": "The API key provided is invalid"
  }
}
```

### Error Codes

| Code | Description | Solution |
|------|-------------|----------|
| `invalid_api_key` | API key is invalid or missing | Check X-Api-Key header |
| `insufficient_credits` | Not enough credits | Purchase more credits |
| `invalid_avatar_id` | Avatar ID not found | Verify avatar exists |
| `invalid_voice_id` | Voice ID not found | Verify voice exists |
| `text_too_long` | Script exceeds 5000 chars | Shorten script |
| `rate_limit_exceeded` | Too many requests | Implement backoff |
| `video_generation_failed` | Internal error | Retry request |

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (invalid parameters) |
| 401 | Unauthorized (invalid API key) |
| 402 | Payment required (insufficient credits) |
| 429 | Rate limited |
| 500 | Server error |

---

## Code Examples

### TypeScript: Complete Video Generation

```typescript
import axios from 'axios';

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const BASE_URL = 'https://api.heygen.com';

interface VideoGenerationRequest {
  avatarId: string;
  voiceId: string;
  script: string;
  backgroundUrl?: string;
}

interface VideoStatus {
  status: 'pending' | 'waiting' | 'processing' | 'completed' | 'failed';
  video_url?: string;
  duration?: number;
}

async function generateVideo(request: VideoGenerationRequest): Promise<string> {
  // Step 1: Create video
  const createResponse = await axios.post(
    `${BASE_URL}/v2/video/generate`,
    {
      video_inputs: [{
        character: {
          type: 'avatar',
          avatar_id: request.avatarId,
          avatar_style: 'normal'
        },
        voice: {
          type: 'text',
          input_text: request.script,
          voice_id: request.voiceId,
          speed: 1.0
        },
        background: request.backgroundUrl
          ? { type: 'image', url: request.backgroundUrl }
          : { type: 'color', value: '#1a1a2e' }
      }],
      dimension: { width: 1920, height: 1080 }
    },
    {
      headers: { 'X-Api-Key': HEYGEN_API_KEY }
    }
  );

  const videoId = createResponse.data.data.video_id;
  console.log(`Video creation started: ${videoId}`);

  // Step 2: Poll for completion
  const videoUrl = await pollVideoStatus(videoId);
  return videoUrl;
}

async function pollVideoStatus(videoId: string): Promise<string> {
  const maxAttempts = 60;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await axios.get(
      `${BASE_URL}/v1/video_status.get`,
      {
        params: { video_id: videoId },
        headers: { 'X-Api-Key': HEYGEN_API_KEY }
      }
    );

    const status: VideoStatus = response.data.data;
    console.log(`Status: ${status.status}`);

    if (status.status === 'completed') {
      return status.video_url!;
    }

    if (status.status === 'failed') {
      throw new Error('Video generation failed');
    }

    // Wait with exponential backoff (5s to 30s)
    const delay = Math.min(5000 * (attempt + 1), 30000);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  throw new Error('Video generation timed out');
}

async function listAvatars(): Promise<any[]> {
  const response = await axios.get(`${BASE_URL}/v2/avatars`, {
    headers: { 'X-Api-Key': HEYGEN_API_KEY }
  });
  return response.data.data.avatars;
}

async function listVoices(): Promise<any[]> {
  const response = await axios.get(`${BASE_URL}/v2/voices`, {
    headers: { 'X-Api-Key': HEYGEN_API_KEY }
  });
  return response.data.data.voices;
}

// Usage
async function main() {
  const avatars = await listAvatars();
  const voices = await listVoices();

  console.log('Available avatars:', avatars.map(a => a.avatar_id));
  console.log('Available voices:', voices.map(v => `${v.name} (${v.language})`));

  const videoUrl = await generateVideo({
    avatarId: avatars[0].avatar_id,
    voiceId: voices[0].voice_id,
    script: 'Ho ho ho! Merry Christmas, dear child!'
  });

  console.log('Video ready:', videoUrl);
}
```

### cURL: Quick Test

```bash
# 1. List avatars
curl -X GET "https://api.heygen.com/v2/avatars" \
  -H "X-Api-Key: YOUR_API_KEY"

# 2. List voices
curl -X GET "https://api.heygen.com/v2/voices" \
  -H "X-Api-Key: YOUR_API_KEY"

# 3. Generate video
curl -X POST "https://api.heygen.com/v2/video/generate" \
  -H "X-Api-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "video_inputs": [{
      "character": {
        "type": "avatar",
        "avatar_id": "YOUR_AVATAR_ID",
        "avatar_style": "normal"
      },
      "voice": {
        "type": "text",
        "input_text": "Hello! This is a test video.",
        "voice_id": "YOUR_VOICE_ID"
      },
      "background": {
        "type": "color",
        "value": "#1a1a2e"
      }
    }],
    "dimension": {"width": 1280, "height": 720}
  }'

# 4. Check status
curl -X GET "https://api.heygen.com/v1/video_status.get?video_id=YOUR_VIDEO_ID" \
  -H "X-Api-Key: YOUR_API_KEY"
```

---

## Santa Project Integration

### Recommended Setup for Scene 6

1. **Find a Santa Avatar** or create a Photo Avatar from Santa image
2. **Select a warm, friendly voice** (ideally supporting Polish)
3. **Use transparent background** for compositing, or Christmas-themed background

### Implementation in `src/lib/heygen.ts`

```typescript
const HEYGEN_CONFIG = {
  apiKey: process.env.HEYGEN_API_KEY,
  santaAvatarId: 'YOUR_SANTA_AVATAR_ID',  // Find via /v2/avatars
  santaVoiceId: 'YOUR_SANTA_VOICE_ID',    // Find via /v2/voices
  defaultBackground: {
    type: 'color',
    value: '#1a1a2e'  // Dark Christmas blue
  }
};

export async function generateSantaMessage(
  script: string,
  childName: string
): Promise<string> {
  // Generate video with Santa speaking the personalized script
  const videoUrl = await generateVideo({
    avatarId: HEYGEN_CONFIG.santaAvatarId,
    voiceId: HEYGEN_CONFIG.santaVoiceId,
    script: script, // Already personalized with child's name
    backgroundUrl: undefined // Use default
  });

  return videoUrl;
}
```

### Cost Estimate per Order

| Children | Scene 6 Duration | Credits (Photo Avatar) |
|----------|------------------|------------------------|
| 1 child | ~25 seconds | 0.5 credits |
| 2 children | ~50 seconds | 1.0 credits |
| 3 children | ~75 seconds | 1.5 credits |

**Monthly estimate (100 orders, avg 2 children):** ~100 credits = Pro plan ($99/mo)

---

## Resources

- [HeyGen API Documentation](https://docs.heygen.com/)
- [API Pricing](https://www.heygen.com/api-pricing)
- [API Limits Reference](https://docs.heygen.com/reference/limits)
- [Create Avatar Video Endpoint](https://docs.heygen.com/reference/create-an-avatar-video-v2)
- [Video Status Endpoint](https://docs.heygen.com/reference/video-status)
- [HeyGen Labs (Create Avatars)](https://labs.heygen.com)

---

## Changelog

| Date | Changes |
|------|---------|
| 2024-11-30 | Initial comprehensive documentation |
