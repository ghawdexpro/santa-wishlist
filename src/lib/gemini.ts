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
  const prompt = `Jesteś scenarzystą magicznych, spersonalizowanych filmów od Świętego Mikołaja dla polskich dzieci.
Stwórz ciepły, odpowiedni dla wieku scenariusz, w którym Mikołaj przemawia bezpośrednio do dziecka.

INFORMACJE O DZIECKU:
- Imię: ${data.childName}
- Wiek: ${data.childAge} lat
- Dobre zachowanie do pochwały: ${data.goodBehavior}
- Obszar do delikatnej poprawy: ${data.thingToImprove}
- Cel do zachęty: ${data.thingToLearn}
${data.customMessage ? `- Wiadomość od rodziców: ${data.customMessage}` : ''}

WYMAGANIA SCENARIUSZA:
1. Całkowita długość: około 90 sekund
2. Mikołaj powinien być ciepły, wesoły i zachęcający - NIGDY nie karci
3. Użyj imienia dziecka naturalnie (3-4 razy)
4. Język odpowiedni dla ${data.childAge}-latka
5. Buduj emocjonalną więź - to ma być magiczne dla dziecka
6. Zakończ podekscytowaniem Świętami i ciepłym pożegnaniem

STRUKTURA SCEN (dokładnie w tej kolejności):
- Scena 1: Mikołaj w domu, powitanie (premade, ~8 sec)
- Scena 2: Mikołaj otwiera Listę Grzecznych, znajduje imię dziecka (spersonalizowana, ~10 sec)
- Scena 3: Mikołaj chciał dobre zachowanie konkretnie (spersonalizowana, ~12 sec)
- Scena 4: Mikołaj delikatnie zachęca do poprawy (spersonalizowana, ~10 sec)
- Scena 5: Mikołaj zachęca cel/naukę (spersonalizowana, ~10 sec)
- Scena 6: Mikołaj wspomina o przygotowaniu czegoś specjalnego (przejście, ~8 sec)
- Scena 7: Szybka scena domu z pomocnikami (premade, ~5 sec)
- Scena 8: Mikołaj obiecuje odwiedzić na Wigilię (spersonalizowana, ~10 sec)
- Scena 9: Ciepłe pożegnanie Mikołaja z imieniem dziecka (spersonalizowana, ~10 sec)
- Scena 10: Ostateczne świąteczne "Ho Ho Ho!" (premade, ~7 sec)

Zwróć TYLKO valid JSON w tym dokładnie formacie:
{
  "childName": "${data.childName}",
  "totalDuration": "~90 sekund",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Powitanie w Domu",
      "duration": "8 sec",
      "setting": "Przytulny dom Świętego Mikołaja z zabawkami i ciepłym oświetleniem",
      "santaDialogue": "Ho ho ho! Cze ść, ${data.childName}! Witaj w moim domu na Biegunie Północnym!",
      "visualDescription": "Mikołaj siedzący na wielkim fotelu, kominek w tle, zabawki widoczne",
      "emotionalTone": "Ciepły, przyjazny, wesoły",
      "isPremade": true
    }
  ]
}

Wygeneruj wszystkie 10 scen z spersonalizowanym dialogiem. Niech to będzie magiczne!`

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
