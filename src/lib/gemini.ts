import { GoogleAuth } from 'google-auth-library'

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'primal-turbine-478412-k9'
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
const MODEL = 'gemini-2.0-flash-001'

export interface ScriptScene {
  sceneNumber: number
  title: string
  duration: string
  setting: string
  santaDialogue: string
  visualDescription: string
  emotionalTone: string
  isPremade: boolean
}

export interface GeneratedScript {
  childName: string
  totalDuration: string
  scenes: ScriptScene[]
  generatedAt: string
}

async function getAccessToken(): Promise<string> {
  // Check for service account JSON (for Railway deployment)
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

  // Use Application Default Credentials (local dev with gcloud auth)
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  })
  const client = await auth.getClient()
  const token = await client.getAccessToken()
  return token.token || ''
}

export async function generateSantaScript(data: {
  childName: string
  childAge: number
  goodBehavior: string
  thingToImprove: string
  thingToLearn: string
  customMessage?: string
}): Promise<GeneratedScript> {
  const prompt = `You are a scriptwriter for magical personalized Santa Claus videos for children.
Create a heartwarming, age-appropriate script for Santa to speak directly to a child.

CHILD INFORMATION:
- Name: ${data.childName}
- Age: ${data.childAge} years old
- Good behavior to praise: ${data.goodBehavior}
- Area for gentle improvement: ${data.thingToImprove}
- Goal to encourage: ${data.thingToLearn}
${data.customMessage ? `- Special message from parents: ${data.customMessage}` : ''}

SCRIPT REQUIREMENTS:
1. Total video length: approximately 90 seconds
2. Santa should be warm, jolly, and encouraging - never scolding
3. Use the child's name naturally throughout (3-4 times)
4. Age-appropriate language for a ${data.childAge}-year-old
5. Build emotional connection - this is magical for the child
6. End with excitement about Christmas and a warm goodbye

SCENE STRUCTURE (follow this exactly):
- Scene 1: Santa in workshop, greeting (pre-made footage, ~8 sec)
- Scene 2: Santa opens Nice List book, finds child's name (personalized, ~10 sec)
- Scene 3: Santa praises the good behavior specifically (personalized, ~12 sec)
- Scene 4: Santa gently encourages improvement area (personalized, ~10 sec)
- Scene 5: Santa encourages the goal/learning (personalized, ~10 sec)
- Scene 6: Santa mentions he's preparing something special (transition, ~8 sec)
- Scene 7: Quick workshop scene with elves working (pre-made, ~5 sec)
- Scene 8: Santa promises to visit on Christmas Eve (personalized, ~10 sec)
- Scene 9: Santa's warm goodbye with child's name (personalized, ~10 sec)
- Scene 10: Final festive outro with "Ho Ho Ho!" (pre-made, ~7 sec)

Return ONLY valid JSON in this exact format:
{
  "childName": "${data.childName}",
  "totalDuration": "~90 seconds",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Workshop Greeting",
      "duration": "8 sec",
      "setting": "Santa's cozy workshop with toys and warm lighting",
      "santaDialogue": "Ho ho ho! Well, hello there! Welcome to my workshop at the North Pole!",
      "visualDescription": "Santa seated in big chair, fireplace in background, toys visible",
      "emotionalTone": "Warm, welcoming, jolly",
      "isPremade": true
    }
  ]
}

Generate all 10 scenes with personalized dialogue. Make it magical!`

  const accessToken = await getAccessToken()

  const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 4096,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Vertex AI error:', error)
    throw new Error(`Vertex AI error: ${response.status}`)
  }

  const result = await response.json()
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text || ''

  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = text
  if (text.includes('```json')) {
    jsonStr = text.split('```json')[1].split('```')[0].trim()
  } else if (text.includes('```')) {
    jsonStr = text.split('```')[1].split('```')[0].trim()
  }

  const script = JSON.parse(jsonStr) as GeneratedScript
  script.generatedAt = new Date().toISOString()

  return script
}
