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
  childName?: string
  childrenNames?: string[]
  totalDuration: string
  scenes: ScriptScene[]
  personalized?: Record<string, ScriptScene[]> // Per-child personalized scenes
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
  const prompt = `You are a scriptwriter for magical, personalized Santa videos for children in Malta.
Create a warm, age-appropriate script where Santa speaks directly to the child.

STORY CONTEXT:
This is "Il-Milied Magic" - Santa's Maltese Adventure. Santa has a secret workshop hidden in the ancient
city of Mdina, the Silent City of Malta. His magic compass led him to this special child on the beautiful
islands of Malta, Gozo, and Comino.

CHILD INFORMATION:
- Name: ${data.childName}
- Age: ${data.childAge} years old
- Good behavior to praise: ${data.goodBehavior}
- Area for gentle encouragement: ${data.thingToImprove}
- Goal to support: ${data.thingToLearn}
${data.customMessage ? `- Parent's message: ${data.customMessage}` : ''}

SCRIPT REQUIREMENTS:
1. Total length: approximately 90 seconds
2. Santa should be warm, jolly, and encouraging - NEVER scolds
3. Use the child's name naturally (3-4 times)
4. Language appropriate for a ${data.childAge}-year-old
5. Build emotional connection - this should feel magical
6. Reference Malta/Mediterranean setting naturally
7. End with excitement for Christmas and a warm farewell

SCENE STRUCTURE (in this exact order):
- Scene 1: Aerial over Malta islands (premade, ~8 sec)
- Scene 2: Through Mdina's ancient streets (premade, ~8 sec)
- Scene 3: Santa finds child in Magic Book (premade, ~8 sec)
- Scene 4: Child's photo appears in book (personalized, ~8 sec)
- Scene 5: Child's name reveals over Valletta (personalized, ~8 sec)
- Scene 6: Santa's personal message (personalized, ~45 sec - HeyGen)
- Scene 7: Santa prepares on Mdina ramparts (premade, ~8 sec)
- Scene 8: Epic sleigh launch over Malta (personalized, ~8 sec)

Return ONLY valid JSON in this exact format:
{
  "childName": "${data.childName}",
  "totalDuration": "~93 seconds",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Three Islands Reveal",
      "duration": "8 sec",
      "setting": "Aerial view over Malta, Gozo, and Comino at sunset",
      "santaDialogue": "",
      "visualDescription": "Epic aerial sweep over the three Maltese islands at golden hour",
      "emotionalTone": "Awe-inspiring, beautiful, local pride",
      "isPremade": true
    }
  ]
}

Generate all 8 scenes with personalized dialogue for scenes 4-6 and 8. Make it magical!`

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

/**
 * Generate a unified script for multiple children in one video
 * Scenes 1-3, 7 are pre-made (no script needed)
 * Scenes 4-6, 8 are personalized (one per child)
 */
export async function generateMultiChildScript(data: {
  children: Array<{
    name: string
    age: number
    goodBehavior: string
    thingToImprove: string
    thingToLearn: string
  }>
  customMessage?: string
}): Promise<GeneratedScript> {
  const childrenList = data.children.map(c => `${c.name} (${c.age} years old)`).join(', ')
  const childrenCount = data.children.length

  const prompt = `You are a scriptwriter for magical Santa videos for children in Malta.
Create a script for MULTIPLE CHILDREN in one video. The entire video should be warm, magical, and personalized for each child.

STORY CONTEXT:
This is "Il-Milied Magic" - Santa's Maltese Adventure. Santa has a secret workshop hidden in Mdina,
the ancient Silent City of Malta. His magic compass led him to discover these special children on the
beautiful islands of Malta, Gozo, and Comino.

CHILDREN IN VIDEO:
${data.children.map((c, i) => `${i + 1}. ${c.name} (${c.age} years old)
   - Good behavior: ${c.goodBehavior}
   - To improve: ${c.thingToImprove}
   - To learn: ${c.thingToLearn}`).join('\n')}

VIDEO STRUCTURE (8 scenes):
- Scene 1: Three Islands Reveal - Premade (no dialogue, aerial over Malta)
- Scene 2: Mdina Silent City - Premade (no dialogue, magical ancient streets)
- Scene 3: Book of Maltese Children - Premade (no dialogue, magic book opens)
- Scene 4: Photo Discovery - One version per child (short Santa dialogue)
- Scene 5: Name Over Malta - One version per child (Santa announces name over Valletta)
- Scene 6: Santa's Message - One version per child (personalized HeyGen message, ~45 seconds)
- Scene 7: Sleigh on Mdina Ramparts - Premade (no dialogue)
- Scene 8: Epic Launch Over Malta - One version per child (personalized farewell)

REQUIREMENTS:
1. Each child should feel special
2. Santa should be warm, jolly, and encouraging - NEVER scolds
3. Use names naturally
4. Age-appropriate language for each child
5. Build emotional connection
6. Personalized scenes should be independent (each child can see their part separately if needed)
7. Reference Malta/Mediterranean setting naturally

Return ONLY valid JSON containing:
- General video information
- Dialogue for each child in scenes 4, 5, 6, 8
- Format: short, natural, magical dialogues

JSON Format:
{
  "childrenNames": [${data.children.map(c => `"${c.name}"`).join(', ')}],
  "totalDuration": "~${93 + (childrenCount - 1) * 69} seconds",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Three Islands Reveal",
      "duration": "8 sec",
      "setting": "Aerial view over Malta, Gozo, and Comino at sunset",
      "santaDialogue": "",
      "visualDescription": "Epic aerial sweep over the three Maltese islands at golden hour",
      "emotionalTone": "Awe-inspiring, beautiful, local pride",
      "isPremade": true
    },
    {
      "sceneNumber": 2,
      "title": "Mdina Silent City",
      "duration": "8 sec",
      "setting": "Ancient streets of Mdina at Christmas",
      "santaDialogue": "",
      "visualDescription": "Camera glides through magical Mdina Gate and medieval streets",
      "emotionalTone": "Enchanting, mysterious",
      "isPremade": true
    },
    {
      "sceneNumber": 3,
      "title": "Book of Maltese Children",
      "duration": "8 sec",
      "setting": "Santa's Mdina study with magic book",
      "santaDialogue": "",
      "visualDescription": "Ancient book 'Children of Malta' flies to Santa, golden light explodes",
      "emotionalTone": "Magical, anticipation",
      "isPremade": true
    }
  ],
  "personalized": {
    ${data.children.map(child => `"${child.name}": [
      {
        "sceneNumber": 4,
        "title": "Photo Discovery",
        "duration": "8 sec",
        "santaDialogue": "Ah! There you are, ${child.name}! I found you in my magic book!",
        "visualDescription": "${child.name}'s photo appears in Maltese cross frame, comes alive with sparkles"
      },
      {
        "sceneNumber": 5,
        "title": "Name Over Malta",
        "duration": "8 sec",
        "santaDialogue": "${child.name.toUpperCase()}! What a wonderful child from Malta!",
        "visualDescription": "${child.name}'s name rises as golden letters over Valletta skyline"
      },
      {
        "sceneNumber": 6,
        "title": "Santa's Personal Message",
        "duration": "45 sec",
        "santaDialogue": "Ho ho ho! Hello there, ${child.name}! I've been watching over the children of Malta, and you are truly special. I was so proud when I saw you ${child.goodBehavior}. That was wonderful! I also know that ${child.thingToImprove}. I believe in you completely! And I heard you want to learn ${child.thingToLearn}. What a brilliant idea! Maybe check under the tree... Remember, dear ${child.name}, be kind and never stop believing in Christmas magic! See you soon! Ho ho ho!",
        "visualDescription": "Santa speaks directly to camera in his Mdina study, warm and personal"
      },
      {
        "sceneNumber": 8,
        "title": "Epic Launch Over Malta",
        "duration": "8 sec",
        "santaDialogue": "See you soon, ${child.name}! Merry Christmas from Malta! Ho ho ho!",
        "visualDescription": "Sleigh launches from Mdina ramparts, ${child.name}'s name appears in stars over the three islands"
      }
    ]`).join(',\n    ')}
  }
}`

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
        temperature: 0.8,
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

  // Extract JSON from response
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
