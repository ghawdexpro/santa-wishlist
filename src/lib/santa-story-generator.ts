/**
 * Santa Story Generator
 *
 * Generates personalized magical stories and conversation context
 * for each child based on parent-provided information.
 */

import { GoogleAuth } from 'google-auth-library'
import { Child, SantaConversationContext } from '@/types/database'

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

/**
 * Generate a personalized magical story for Santa to tell
 */
export async function generateSantaStory(child: Child): Promise<string> {
  const accessToken = await getAccessToken()
  const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`

  const childContext = buildChildContext(child)

  const prompt = `Jesteś mistrzem opowiadania magicznych bajek dla dzieci. Napisz KRÓTKĄ (3-4 minuty czytania) bajkę dla Świętego Mikołaja do opowiedzenia dziecku podczas wideorozmowy.

INFORMACJE O DZIECKU:
${childContext}

WYMAGANIA BAJKI:
1. Główny bohater to magiczny elf lub zwierzątko z Bieguna Północnego
2. Akcja dzieje się w warsztatach Mikołaja, magicznym lesie lub wśród reniferów
3. Historia MUSI zawierać morał związany z: ${child.story_moral || child.thing_to_improve || 'bycie dobrym i pomocnym'}
4. Wspomnieć naturalnie o rzeczach które dziecko lubi (jeśli podane)
5. Zakończenie optymistyczne i magiczne
6. Napisana prostym językiem dla dziecka ${child.age || 6}-letniego
7. Podzielona na 3-4 krótkie części (żeby Mikołaj mógł robić przerwy)

FORMAT:
Napisz bajkę po polsku, podzieloną na części oznaczone [CZĘŚĆ 1], [CZĘŚĆ 2], itd.
Każda część to 2-3 zdania maksymalnie.

WAŻNE:
- Bajka ma być KRÓTKA i WCIĄGAJĄCA
- Używaj prostych słów
- Dużo magii i cudów!
- Niech dziecko poczuje się wyjątkowo`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 1500,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to generate story: ${await response.text()}`)
  }

  const result = await response.json()
  return result.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

/**
 * Generate conversation context for Santa
 */
export async function generateConversationContext(child: Child): Promise<SantaConversationContext> {
  const accessToken = await getAccessToken()
  const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:generateContent`

  const childContext = buildChildContext(child)

  const prompt = `Przygotuj kontekst rozmowy dla Świętego Mikołaja z dzieckiem. Zwróć JSON.

INFORMACJE O DZIECKU:
${childContext}

Wygeneruj JSON z następującymi polami (po polsku):

{
  "personalizedGreeting": "Spersonalizowane powitanie z imieniem dziecka i czymś co je ucieszy",
  "thingsToMention": ["lista 3-5 rzeczy do naturalnego wspomnienia w rozmowie"],
  "praisePoints": ["lista 2-3 konkretnych pochwał bazujących na dobrym zachowaniu"],
  "gentleReminders": ["lista 1-2 DELIKATNYCH wskazówek (nie krytyka!) o tym nad czym pracować"],
  "storyTheme": "temat bajki do opowiedzenia",
  "magicalElements": ["lista magicznych elementów do wplecenia: elfy, renifery, warsztaty, itp."],
  "conversationStarters": ["lista 3-4 pytań które Mikołaj może zadać dziecku"]
}

ZASADY:
- Wszystko pozytywne i magiczne
- "gentleReminders" to NIGDY krytyka - to zachęta w stylu "Wiem że starasz się..."
- Jeśli brak danych, wymyśl coś uniwersalnie dobrego
- Imię dziecka: ${child.name}

Zwróć TYLKO JSON, bez dodatkowego tekstu.`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1000,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to generate context: ${await response.text()}`)
  }

  const result = await response.json()
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '{}'

  // Extract JSON from response (might be wrapped in ```json ... ```)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new Error('Failed to parse context JSON')
  }

  const context = JSON.parse(jsonMatch[0]) as Omit<SantaConversationContext, 'generatedAt'>

  return {
    ...context,
    generatedAt: new Date().toISOString(),
  }
}

/**
 * Build child context string from available data
 */
function buildChildContext(child: Child): string {
  const lines: string[] = []

  lines.push(`- Imię: ${child.name}`)
  if (child.age) lines.push(`- Wiek: ${child.age} lat`)
  if (child.good_behavior) lines.push(`- Dobre zachowanie: ${child.good_behavior}`)
  if (child.special_achievement) lines.push(`- Szczególne osiągnięcie: ${child.special_achievement}`)
  if (child.thing_to_improve) lines.push(`- Nad czym pracować: ${child.thing_to_improve}`)
  if (child.thing_to_learn) lines.push(`- Czego się uczyć: ${child.thing_to_learn}`)
  if (child.favorite_toy) lines.push(`- Ulubiona zabawka: ${child.favorite_toy}`)
  if (child.favorite_animal) lines.push(`- Ulubione zwierzę: ${child.favorite_animal}`)
  if (child.favorite_color) lines.push(`- Ulubiony kolor: ${child.favorite_color}`)
  if (child.hobbies) lines.push(`- Hobby/zainteresowania: ${child.hobbies}`)
  if (child.siblings_info) lines.push(`- Rodzeństwo: ${child.siblings_info}`)
  if (child.pet_name) lines.push(`- Zwierzak domowy: ${child.pet_name}`)
  if (child.story_moral) lines.push(`- Morał bajki (od rodziców): ${child.story_moral}`)
  if (child.custom_message) lines.push(`- Dodatkowa wiadomość od rodziców: ${child.custom_message}`)

  return lines.join('\n')
}

/**
 * Generate both story and context for a child
 */
export async function prepareChildForSantaCall(child: Child): Promise<{
  story: string
  context: SantaConversationContext
}> {
  const [story, context] = await Promise.all([
    generateSantaStory(child),
    generateConversationContext(child),
  ])

  return { story, context }
}

/**
 * Build the full Santa system prompt with personalization
 */
export function buildPersonalizedSantaPrompt(
  child: Child,
  context: SantaConversationContext,
  story: string
): string {
  return `Jesteś Świętym Mikołajem rozmawiającym z dzieckiem ${child.name} (${child.age || '?'} lat) przez wideorozmowę.
To jest MAGICZNY moment - dziecko naprawdę wierzy, że rozmawia z prawdziwym Mikołajem!

═══════════════════════════════════════
TWOJA OSOBOWOŚĆ:
═══════════════════════════════════════
- Ciepły, wesoły, pełen "Ho ho ho!" i radosnego śmiechu
- Cierpliwy i troskliwy, kochasz dzieci
- Mieszkasz na Biegunie Północnym z elfami, Panią Mikołajową i reniferami
- Znasz ${child.name} bo masz ją/jego w swojej Księdze Grzecznych Dzieci!

═══════════════════════════════════════
CO WIESZ O ${child.name.toUpperCase()}:
═══════════════════════════════════════
${context.thingsToMention.map(t => `• ${t}`).join('\n')}

RZECZY DO POCHWALENIA:
${context.praisePoints.map(p => `⭐ ${p}`).join('\n')}

DELIKATNE ZACHĘTY (nie krytyka!):
${context.gentleReminders.map(r => `💫 ${r}`).join('\n')}

═══════════════════════════════════════
BAJKA DO OPOWIEDZENIA:
═══════════════════════════════════════
${story}

INSTRUKCJA: Opowiedz tę bajkę w częściach podczas rozmowy!
Po każdej części zapytaj dziecko co myśli lub zadaj pytanie.

═══════════════════════════════════════
PYTANIA DO DZIECKA:
═══════════════════════════════════════
${context.conversationStarters.map(q => `❓ ${q}`).join('\n')}

═══════════════════════════════════════
ZASADY ROZMOWY:
═══════════════════════════════════════
1. Odpowiadaj KRÓTKO (2-3 zdania maksymalnie)
2. Używaj imienia ${child.name} naturalnie
3. Zadawaj pytania żeby podtrzymać rozmowę
4. Wplataj bajkę stopniowo - nie całą naraz!
5. Chwal konkretne rzeczy które wiesz o dziecku
6. Bądź ZAWSZE pozytywny i magiczny
7. Jeśli dziecko pyta o prezenty - "Sprawdzam w mojej Księdze!"

NIGDY NIE:
- Nie obiecuj konkretnych prezentów
- Nie krytykuj dziecka
- Nie wychodź z roli Mikołaja
- Nie mów za dużo naraz

═══════════════════════════════════════
POWITANIE NA START:
═══════════════════════════════════════
${context.personalizedGreeting}

Użyj tego powitania gdy dziecko się połączy!

JĘZYK: Odpowiadaj po polsku. Jeśli dziecko mówi po angielsku, możesz przejść na angielski.`
}
