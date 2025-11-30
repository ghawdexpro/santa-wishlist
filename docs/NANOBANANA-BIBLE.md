# NanoBanana Pro - Complete Developer Bible

> Google's state-of-the-art image generation models accessible via Vertex AI

## Quick Reference

| Feature | Nano Banana (Flash) | Nano Banana Pro |
|---------|---------------------|-----------------|
| Model ID | `gemini-2.5-flash-image` | `gemini-3-pro-image-preview` |
| Max Resolution | 1024px | 4096px (4K) |
| Max Input Images | 3 | 14 |
| Price per Image | $0.039 | $0.139 (2K) / $0.24 (4K) |
| Location | us-central1 | **global** (required!) |

---

## 1. Model Overview

### What is NanoBanana?
"NanoBanana" was the internal codename used while the model was being tested on LMArena. It refers to Google's Gemini image generation models:

- **Nano Banana** = Gemini 2.5 Flash Image (fast, affordable)
- **Nano Banana Pro** = Gemini 3 Pro Image (advanced features, higher quality)

### Key Capabilities
1. **Text-to-Image** - Generate images from text descriptions
2. **Image Editing** - Modify existing images with text prompts
3. **Multi-Image Fusion** - Combine up to 14 reference images
4. **Character Consistency** - Maintain appearance across multiple generations
5. **Text Rendering** - Accurate text in generated images
6. **World Knowledge** - Context-aware generation using Gemini's knowledge
7. **Google Search Grounding** (Pro only) - Real-time data for current imagery

---

## 2. API Configuration

### Environment Variables
```bash
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1  # or "global" for Pro
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account",...}
```

### Model IDs
```typescript
// Fast & affordable
const NANOBANANA_FLASH = 'gemini-2.5-flash-image'

// Advanced features & quality (REQUIRES location="global")
const NANOBANANA_PRO = 'gemini-3-pro-image-preview'
```

### IMPORTANT: Location Requirements
- **gemini-2.5-flash-image**: Works with `us-central1` and other regions
- **gemini-3-pro-image-preview**: MUST use `location: "global"`

---

## 3. REST API Usage

### Endpoint Structure (Vertex AI)
```
https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/{LOCATION}/publishers/google/models/{MODEL}:generateContent
```

For Pro model with global location:
```
https://aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/global/publishers/google/models/gemini-3-pro-image-preview:generateContent
```

### Basic Text-to-Image Request
```bash
curl -X POST \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  "https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/us-central1/publishers/google/models/gemini-2.5-flash-image:generateContent" \
  -d '{
    "contents": [{
      "role": "user",
      "parts": [{
        "text": "A magical Christmas workshop with elves making toys, warm golden lighting, cinematic quality"
      }]
    }],
    "generationConfig": {
      "responseModalities": ["TEXT", "IMAGE"]
    }
  }'
```

### With Aspect Ratio
```json
{
  "contents": [{
    "role": "user",
    "parts": [{
      "text": "Santa's sleigh flying over snowy mountains at night"
    }]
  }],
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"],
    "imageConfig": {
      "aspectRatio": "16:9"
    }
  }
}
```

### Image Editing (Image + Text Input)
```json
{
  "contents": [{
    "role": "user",
    "parts": [
      {
        "inlineData": {
          "mimeType": "image/jpeg",
          "data": "BASE64_ENCODED_IMAGE_HERE"
        }
      },
      {
        "text": "Add a Santa hat to this person and make the background a snowy winter scene"
      }
    ]
  }],
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"]
  }
}
```

---

## 4. TypeScript/Node.js Implementation

### Full Implementation for Vertex AI
```typescript
import { GoogleAuth } from 'google-auth-library'

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT!
const LOCATION = 'us-central1' // Use 'global' for Pro model

interface ImageGenerationConfig {
  prompt: string
  model?: 'flash' | 'pro'
  aspectRatio?: '1:1' | '16:9' | '9:16' | '3:2' | '2:3' | '3:4' | '4:3' | '4:5' | '5:4' | '21:9'
  inputImages?: Array<{
    base64: string
    mimeType: string
  }>
}

interface ImageGenerationResult {
  text?: string
  images: Array<{
    base64: string
    mimeType: string
  }>
}

async function getAccessToken(): Promise<string> {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
    const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
    const auth = new GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    })
    const client = await auth.getClient()
    const token = await client.getAccessToken()
    return token.token || ''
  }

  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  })
  const client = await auth.getClient()
  const token = await client.getAccessToken()
  return token.token || ''
}

export async function generateImage(config: ImageGenerationConfig): Promise<ImageGenerationResult> {
  const accessToken = await getAccessToken()

  // Model selection
  const model = config.model === 'pro'
    ? 'gemini-3-pro-image-preview'
    : 'gemini-2.5-flash-image'

  // Location - Pro requires global
  const location = config.model === 'pro' ? 'global' : LOCATION

  // Build endpoint
  const baseUrl = location === 'global'
    ? 'https://aiplatform.googleapis.com/v1'
    : `https://${location}-aiplatform.googleapis.com/v1`

  const endpoint = `${baseUrl}/projects/${PROJECT_ID}/locations/${location}/publishers/google/models/${model}:generateContent`

  // Build parts array
  const parts: Array<Record<string, unknown>> = []

  // Add input images first (if any)
  if (config.inputImages) {
    for (const img of config.inputImages) {
      parts.push({
        inlineData: {
          mimeType: img.mimeType,
          data: img.base64,
        }
      })
    }
  }

  // Add text prompt
  parts.push({ text: config.prompt })

  const body = {
    contents: [{
      role: 'user',
      parts,
    }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      ...(config.aspectRatio && {
        imageConfig: {
          aspectRatio: config.aspectRatio,
        }
      }),
    },
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('NanoBanana API error:', error)
    throw new Error(`NanoBanana API error: ${response.status} - ${error}`)
  }

  const result = await response.json()

  // Parse response
  const output: ImageGenerationResult = { images: [] }

  const candidate = result.candidates?.[0]
  if (candidate?.content?.parts) {
    for (const part of candidate.content.parts) {
      if (part.text) {
        output.text = part.text
      } else if (part.inlineData) {
        output.images.push({
          base64: part.inlineData.data,
          mimeType: part.inlineData.mimeType || 'image/png',
        })
      }
    }
  }

  return output
}

// Convenience functions
export async function textToImage(
  prompt: string,
  aspectRatio: ImageGenerationConfig['aspectRatio'] = '16:9'
): Promise<ImageGenerationResult> {
  return generateImage({ prompt, aspectRatio })
}

export async function editImage(
  imageBase64: string,
  imageMimeType: string,
  editPrompt: string
): Promise<ImageGenerationResult> {
  return generateImage({
    prompt: editPrompt,
    inputImages: [{ base64: imageBase64, mimeType: imageMimeType }],
  })
}

export async function compositeImages(
  images: Array<{ base64: string; mimeType: string }>,
  prompt: string
): Promise<ImageGenerationResult> {
  return generateImage({
    prompt,
    inputImages: images,
    model: 'pro', // Pro supports up to 14 images
  })
}
```

---

## 5. Supported Aspect Ratios

| Ratio | Dimensions | Use Case |
|-------|------------|----------|
| 1:1 | 1024x1024 | Social media, avatars |
| 16:9 | 1024x576 | Video thumbnails, widescreen |
| 9:16 | 576x1024 | Stories, mobile content |
| 3:2 | 1024x683 | Photography style |
| 2:3 | 683x1024 | Portrait photography |
| 3:4 | 768x1024 | Portrait, posters |
| 4:3 | 1024x768 | Traditional photo |
| 4:5 | 819x1024 | Instagram portrait |
| 5:4 | 1024x819 | Print formats |
| 21:9 | 1024x439 | Ultra-wide cinematic |

---

## 6. Input Limitations

### Gemini 2.5 Flash Image (Nano Banana)
- **Max input tokens:** 32,768
- **Max output tokens:** 32,768
- **Max input images:** 3
- **Max output images:** 10
- **Max image size:** 7 MB
- **Supported formats:** PNG, JPEG, WebP, HEIC, HEIF
- **Max resolution:** 1024px

### Gemini 3 Pro Image (Nano Banana Pro)
- **Max input tokens:** 65,536
- **Max output tokens:** 32,768
- **Max input images:** 14 (6 objects + 5 humans for consistency)
- **Max image size:** 7 MB
- **Supported formats:** PNG, JPEG, WebP, HEIC, HEIF
- **Output resolutions:** 1K, 2K, 4K

---

## 7. Pricing

### Gemini 2.5 Flash Image
- **$30.00** per 1 million output tokens
- **$0.039** per image (each image = 1,290 tokens)

### Gemini 3 Pro Image
- **$0.139** per 1080p/2K image
- **$0.24** per 4K image

---

## 8. Safety & Watermarking

### SynthID Watermarking
All generated images include an invisible SynthID digital watermark for identification of AI-generated content.

### Safety Settings
```json
{
  "safetySettings": [{
    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
    "threshold": "BLOCK_MEDIUM_AND_ABOVE"
  }]
}
```

### Content Restrictions
- No child exploitation content
- No violent extremism
- No non-consensual imagery
- No self-harm content
- No hate speech
- No explicit sexual content
- No harassment

---

## 9. Best Practices

### Prompt Engineering
1. **Be specific** - Include details about style, lighting, composition
2. **Use cinematic terms** - "shallow depth of field", "golden hour lighting"
3. **Specify quality** - "4K", "photorealistic", "professional photography"
4. **Describe composition** - "close-up", "wide shot", "bird's eye view"

### Example Prompts
```
// Good prompt
"A cozy Christmas living room with a decorated tree, warm fireplace,
soft golden lighting, photorealistic, shallow depth of field,
cinematic composition, 4K quality"

// Better prompt (more specific)
"Interior photography of a luxurious Christmas living room:
12-foot noble fir tree with warm white lights and red velvet ribbons,
roaring stone fireplace with stockings, soft cream sofa with plaid blankets,
honey-toned hardwood floors, golden hour sunlight through frosted windows,
shallow depth of field, shot on Sony A7R IV, f/1.8, warm color grading"
```

### Performance Tips
1. Use Flash model for quick iterations, Pro for final quality
2. Maximum 3 input images for Flash, 14 for Pro
3. Include negative prompts to avoid unwanted elements
4. For character consistency, provide reference images

---

## 10. Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 400 Bad Request | Invalid parameters | Check aspect ratio, model ID |
| 401 Unauthorized | Invalid/expired token | Refresh access token |
| 403 Forbidden | Permission denied | Check service account roles |
| 404 Not Found | Wrong endpoint | Verify location matches model |
| 429 Rate Limited | Too many requests | Implement exponential backoff |
| 500 Server Error | API issues | Retry with backoff |

### Error Handling Code
```typescript
async function generateWithRetry(
  config: ImageGenerationConfig,
  maxRetries = 3
): Promise<ImageGenerationResult> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await generateImage(config)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'

      // Don't retry client errors (4xx)
      if (message.includes('400') || message.includes('403')) {
        throw error
      }

      // Retry server errors with exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000
        console.log(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms`)
        await new Promise(r => setTimeout(r, delay))
      } else {
        throw error
      }
    }
  }
  throw new Error('Max retries exceeded')
}
```

---

## 11. Multi-Turn Editing

NanoBanana supports conversational image editing:

```typescript
// First generation
const result1 = await generateImage({
  prompt: "A red sports car in a showroom",
  aspectRatio: "16:9"
})

// Edit the result
const result2 = await generateImage({
  prompt: "Change the car color to blue and add motion blur",
  inputImages: [{
    base64: result1.images[0].base64,
    mimeType: result1.images[0].mimeType
  }]
})

// Further refinement
const result3 = await generateImage({
  prompt: "Add a sunset background with mountains",
  inputImages: [{
    base64: result2.images[0].base64,
    mimeType: result2.images[0].mimeType
  }]
})
```

---

## 12. Comparison: Nano Banana vs Imagen

| Feature | Nano Banana | Imagen 3 |
|---------|-------------|----------|
| Image Editing | YES | No |
| Multi-turn | YES | No |
| Character Consistency | YES | Limited |
| Text Rendering | Excellent | Good |
| Price | $0.039/image | $0.03/image |
| Speed | Fast | Medium |
| Max Input Images | 3-14 | 0 |

**Recommendation:** Use NanoBanana for most use cases due to superior editing and consistency features.

---

## 13. Migration from Imagen

If migrating from Imagen to NanoBanana:

```typescript
// OLD (Imagen)
const response = await fetch(imagenEndpoint, {
  method: 'POST',
  body: JSON.stringify({
    instances: [{ prompt: "..." }],
    parameters: { sampleCount: 1 }
  })
})

// NEW (NanoBanana)
const response = await fetch(nanobananaEndpoint, {
  method: 'POST',
  body: JSON.stringify({
    contents: [{
      role: 'user',
      parts: [{ text: "..." }]
    }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE']
    }
  })
})
```

---

## Sources

- [Image generation with Gemini - Google AI](https://ai.google.dev/gemini-api/docs/image-generation)
- [Generate and edit images - Vertex AI](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/multimodal/image-generation)
- [Gemini 2.5 Flash Image - Vertex AI](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/2-5-flash-image)
- [Gemini 3 Pro Image - Vertex AI](https://docs.cloud.google.com/vertex-ai/generative-ai/docs/models/gemini/3-pro-image)
- [Nano Banana Pro Announcement - Google Blog](https://blog.google/technology/ai/nano-banana-pro/)
