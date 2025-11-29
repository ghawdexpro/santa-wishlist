import { GoogleGenerativeAI } from '@google/generative-ai'

if (!process.env.GOOGLE_AI_API_KEY) {
  console.warn('GOOGLE_AI_API_KEY is not set - script generation will not work')
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '')

export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-2.0-flash',
})

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

  const result = await geminiModel.generateContent(prompt)
  const response = result.response.text()

  // Extract JSON from response (handle markdown code blocks)
  let jsonStr = response
  if (response.includes('```json')) {
    jsonStr = response.split('```json')[1].split('```')[0].trim()
  } else if (response.includes('```')) {
    jsonStr = response.split('```')[1].split('```')[0].trim()
  }

  const script = JSON.parse(jsonStr) as GeneratedScript
  script.generatedAt = new Date().toISOString()

  return script
}
