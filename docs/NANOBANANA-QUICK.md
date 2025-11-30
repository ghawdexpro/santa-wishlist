# NanoBanana Quick Reference

## Models
| Model | ID | Location | Price | Max Res |
|-------|----|----|-------|---------|
| Flash | `gemini-2.5-flash-image` | us-central1 | $0.039 | 1024px |
| Pro | `gemini-3-pro-image-preview` | **global** | $0.14-0.24 | 4K |

## Vertex AI Endpoint
```
https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/{LOCATION}/publishers/google/models/{MODEL}:generateContent
```

## Minimal Request (Text-to-Image)
```json
{
  "contents": [{
    "role": "user",
    "parts": [{ "text": "Your prompt here" }]
  }],
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"]
  }
}
```

## With Aspect Ratio
```json
{
  "generationConfig": {
    "responseModalities": ["TEXT", "IMAGE"],
    "imageConfig": { "aspectRatio": "16:9" }
  }
}
```

## Aspect Ratios
`1:1` `16:9` `9:16` `3:2` `2:3` `3:4` `4:3` `4:5` `5:4` `21:9`

## Image Editing (Add image before text)
```json
{
  "contents": [{
    "role": "user",
    "parts": [
      { "inlineData": { "mimeType": "image/jpeg", "data": "BASE64" }},
      { "text": "Add a Santa hat" }
    ]
  }]
}
```

## Response Format
```json
{
  "candidates": [{
    "content": {
      "parts": [
        { "text": "Description..." },
        { "inlineData": { "mimeType": "image/png", "data": "BASE64" }}
      ]
    }
  }]
}
```

## TypeScript Quick Start
```typescript
const result = await fetch(endpoint, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] }
  })
})

const data = await result.json()
const imageBase64 = data.candidates[0].content.parts
  .find(p => p.inlineData)?.inlineData.data
```

## Limits
| | Flash | Pro |
|-|-------|-----|
| Input images | 3 | 14 |
| Output images | 10 | ~32K tokens |
| Image size | 7 MB | 7 MB |

## Common Errors
- **404**: Wrong location (Pro needs `global`)
- **403**: Missing IAM roles
- **400**: Invalid aspect ratio or params
