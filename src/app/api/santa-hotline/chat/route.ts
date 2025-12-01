import { NextRequest, NextResponse } from 'next/server'
import { GoogleAuth } from 'google-auth-library'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'primal-turbine-478412-k9'
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
const MODEL = 'gemini-2.0-flash-001'

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
    const { orderId, message, history = [] } = body

    if (!orderId || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get child data for personalization
    const { data: child } = await supabase
      .from('children')
      .select('name, age, good_behavior, favorite_toy, favorite_animal, hobbies, special_achievement')
      .eq('order_id', orderId)
      .limit(1)
      .single()

    const childContext = child
      ? `
INFORMACJE O DZIECKU:
- Imię: ${child.name}
- Wiek: ${child.age || '?'} lat
- Dobre zachowanie: ${child.good_behavior || 'nie podano'}
- Ulubiona zabawka: ${child.favorite_toy || 'nie podano'}
- Ulubione zwierzę: ${child.favorite_animal || 'nie podano'}
- Hobby: ${child.hobbies || 'nie podano'}
- Szczególne osiągnięcie: ${child.special_achievement || 'nie podano'}
`
      : ''

    const systemPrompt = `Jesteś Świętym Mikołajem rozmawiającym z dzieckiem przez magiczny telefon z Bieguna Północnego.

TWOJA OSOBOWOŚĆ:
- Ciepły, wesoły, pełen "Ho ho ho!" i radosnego śmiechu
- Kochasz dzieci i zawsze masz dla nich czas
- Mieszkasz na Biegunie Północnym z elfami i reniferami
- Jesteś mądry, cierpliwy i pełen magii

${childContext}

ZASADY ROZMOWY:
1. Odpowiadaj KRÓTKO (1-3 zdania) - to chat, nie esej
2. Używaj imienia dziecka naturalnie (jeśli znasz)
3. Bądź ZAWSZE pozytywny i wspierający
4. Dodawaj magiczne elementy (elfy, renifery, warsztaty)
5. Używaj emotek świątecznych: 🎅🎄🎁❄️🦌🧝✨
6. Jeśli dziecko pyta o prezenty - "Sprawdzam w mojej Księdze!"
7. Chwal dziecko za dobre zachowanie
8. Czasem wspomnij o przygotowaniach do Wigilii

NIGDY NIE:
- Nie obiecuj konkretnych prezentów
- Nie mów nic strasznego czy smutnego
- Nie wychodź z roli Mikołaja
- Nie pisz za długich odpowiedzi

JĘZYK: Polski. Pisz prostym językiem zrozumiałym dla dziecka.`

    // Build conversation history for Gemini
    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }],
      },
      {
        role: 'model',
        parts: [{ text: 'Ho ho ho! Rozumiem! Jestem gotowy rozmawiać z dziećmi jako Święty Mikołaj! 🎅🎄' }],
      },
    ]

    // Add conversation history
    for (const msg of history.slice(-10)) {
      contents.push({
        role: msg.role === 'santa' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })
    }

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    })

    const accessToken = await getAccessToken()
    const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 200,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('[SantaHotline] Gemini error:', error)
      return NextResponse.json(
        { response: 'Ho ho ho! Coś mi przerwało... Spróbuj jeszcze raz! 🎅' },
        { status: 200 }
      )
    }

    const result = await response.json()
    const santaResponse =
      result.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Ho ho ho! Słucham Cię uważnie! 🎅'

    return NextResponse.json({ response: santaResponse })
  } catch (error: any) {
    console.error('[SantaHotline] Chat error:', error)
    return NextResponse.json(
      { response: 'Ho ho ho! Mój magiczny telefon się zacina... Spróbuj za chwilę! 🎅❄️' },
      { status: 200 }
    )
  }
}
