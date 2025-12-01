import { NextRequest, NextResponse } from 'next/server'
import { GoogleAuth } from 'google-auth-library'
import { buildPersonalizedSantaPrompt } from '@/lib/santa-story-generator'
import { Child, SantaConversationContext } from '@/types/database'

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'primal-turbine-478412-k9'
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
const MODEL = 'gemini-2.0-flash-001'

/**
 * Santa Chat LLM Endpoint
 *
 * Generates Santa's responses for live video call conversations.
 * Uses Gemini with deep personalization based on parent-provided info.
 *
 * POST /api/santa-chat
 * Body: {
 *   message: string,           // What the child said
 *   childName: string,         // Child's name
 *   childAge?: number,         // Child's age
 *   conversationHistory?: [],  // Previous messages
 *   // Rich personalization (optional but recommended):
 *   child?: Child,             // Full child object
 *   context?: SantaConversationContext,  // Pre-generated context
 *   story?: string,            // Pre-generated story
 * }
 */

// Fallback prompt for when no personalization is available
const DEFAULT_SANTA_PROMPT = `You are Santa Claus having a video call with a child.
This is a magical moment - the child truly believes they are talking to the real Santa!

YOUR PERSONALITY:
- Warm, jolly, and magical
- Full of "Ho ho ho!" and joyful laughter
- Patient and caring towards children
- You love hearing about their wishes and good deeds
- You live at the North Pole with elves, Mrs. Claus, and reindeer

CONVERSATION RULES:
- Keep responses SHORT (2-3 sentences maximum)
- Ask questions to keep the conversation going
- If they ask about gifts, say you're checking the Nice List
- Naturally mention the North Pole, elves, Rudolph
- If the child says something inappropriate, gently change the topic
- Always be encouraging and positive
- End each response with something magical or exciting

NEVER:
- Promise specific gifts
- Discuss anything inappropriate
- Break character as Santa
- Talk too long (kids lose attention!)

LANGUAGE:
- Respond in the same language as the child (English/Polish)`

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      message,
      childName,
      childAge,
      conversationHistory,
      // Rich personalization
      child,
      context,
      story,
    } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const accessToken = await getAccessToken()
    const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`

    // Build system prompt - use personalized if available
    let systemPrompt: string

    if (child && context && story) {
      // Full personalization available!
      console.log(`Using personalized prompt for ${child.name}`)
      systemPrompt = buildPersonalizedSantaPrompt(
        child as Child,
        context as SantaConversationContext,
        story as string
      )
    } else {
      // Fallback to default with basic personalization
      console.log(`Using default prompt for ${childName || 'unknown child'}`)
      systemPrompt = DEFAULT_SANTA_PROMPT
      if (childName) {
        systemPrompt += `\n\nThe child's name is: ${childName}. Use their name naturally!`
      }
      if (childAge) {
        systemPrompt += `\nThe child is ${childAge} years old - adjust your language accordingly.`
      }
    }

    // Build conversation
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }],
      },
      {
        role: 'model',
        parts: [{ text: 'Ho ho ho! I understand everything! I am ready to talk as the real Santa Claus!' }],
      },
    ]

    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })
      }
    }

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: `Child says: "${message}"` }],
    })

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 250, // Keep responses short for TTS
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_LOW_AND_ABOVE',
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE',
          },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Gemini error:', error)
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      )
    }

    const result = await response.json()
    const santaResponse = result.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Clean up response
    let cleanResponse = santaResponse
      .replace(/^(Santa|Santa Claus):\s*/i, '')
      .trim()

    // Ensure response isn't too long (for TTS)
    if (cleanResponse.length > 500) {
      cleanResponse = cleanResponse.substring(0, 500) + '...'
    }

    return NextResponse.json({
      response: cleanResponse,
      personalized: !!(child && context && story),
    })
  } catch (error) {
    console.error('Santa chat error:', error)
    return NextResponse.json(
      { error: 'Failed to generate Santa response' },
      { status: 500 }
    )
  }
}
