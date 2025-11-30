# Santa_PL Documentation

## Nano Banana Pro Image Generation

This project uses **Nano Banana Pro** (formerly known as Imagen 3) for generating high-quality keyframe images for video generation.

### Quick Start
See **[NANOBANANA-QUICK.md](./NANOBANANA-QUICK.md)** for quick reference on:
- How to use the API
- Basic prompting examples
- Common parameters

### Comprehensive Guide
See **[NANOBANANA-BIBLE.md](./NANOBANANA-BIBLE.md)** for:
- Detailed API documentation
- Advanced prompting techniques
- Best practices for image generation
- Troubleshooting

## Implementation in Santa_PL

The Nano Banana Pro API is used in `src/lib/imagen.ts`:

```typescript
import { generateAllKeyframes } from '@/lib/imagen'

// Generate keyframes for video scenes
const keyframes = await generateAllKeyframes([
  { prompt: "Your scene description", sceneNumber: 1 }
])
```

Key configuration:
- Model: `gemini-3-pro-image` (Nano Banana Pro)
- Location: `us-central1`
- Authentication: Google Cloud Service Account (environment variable: `GOOGLE_APPLICATION_CREDENTIALS_JSON`)
