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
  const childrenList = data.children.map(c => `${c.name} (${c.age} lat)`).join(', ')
  const childrenCount = data.children.length

  const prompt = `Jesteś scenarzystą magicznych filmów od Świętego Mikołaja dla polskich dzieci.
Stwórz scenariusz dla GRUPY DZIECI w jednym wideo. Całość będzie ciepła, magiczna i spersonalizowana dla każdego dziecka.

DZIECI W WIDEO:
${data.children.map((c, i) => `${i + 1}. ${c.name} (${c.age} lat)
   - Dobre zachowanie: ${c.goodBehavior}
   - Do poprawy: ${c.thingToImprove}
   - Do nauki: ${c.thingToLearn}`).join('\n')}

STRUKTURA FILMU (8 scen):
- Scena 1: Sky Dive - Premade (brak dialogu, tylko animacja)
- Scena 2: Workshop - Premade (brak dialogu)
- Scena 3: Book Magic - Premade (brak dialogu)
- Scena 4: Photo Comes Alive - Dla każdego dziecka osobna wersja (krótki dialog Mikołaja)
- Scena 5: Name Reveal - Dla każdego dziecka osobna wersja (Mikołaj obwieszcza imię)
- Scena 6: Santa's Message - Dla każdego dziecka osobna wersja (personalizowana wiadomość Mikołaja, ~25 sekund)
- Scena 7: Sleigh Ready - Premade (brak dialogu)
- Scena 8: Epic Launch - Dla każdego dziecka osobna wersja (personalizowane pożegnanie)

WYMAGANIA:
1. Każde dziecko powinno czuć się specjalne
2. Mikołaj powinien być ciepły, wesoły i zachęcający - NIGDY nie karci
3. Używaj imion naturalnie
4. Język odpowiedni dla każdego wieku
5. Buduj emocjonalną więź
6. Sceny personalizowane powinny być niezależne (każde dziecko może zobaczyć swoją część osobno jeśli trzeba)

Zwróć TYLKO valid JSON zawierający:
- Ogólne informacje o wideo
- Dialogi dla każdego dziecka w scenach 4, 5, 6, 8
- Format dla każdego dziecka: krótkie, naturalne, magiczne dialogi

Format JSON:
{
  "childrenNames": [${data.children.map(c => `"${c.name}"`).join(', ')}],
  "totalDuration": "~${90 + (childrenCount - 1) * 90} sekund",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Sky Dive",
      "duration": "12 sec",
      "setting": "Świąteczne niebo z efektami animacji",
      "santaDialogue": "",
      "visualDescription": "Magiczny skok paralotnią przez chmury zaśnieżone",
      "emotionalTone": "Epicka, pełna przygody",
      "isPremade": true
    },
    {
      "sceneNumber": 2,
      "title": "Workshop",
      "duration": "12 sec",
      "setting": "Warsztat Mikołaja na Biegunie Północnym",
      "santaDialogue": "",
      "visualDescription": "Magiczny warsztat z pomocnikami i zabawkami",
      "emotionalTone": "Ciepły, magiczny",
      "isPremade": true
    },
    {
      "sceneNumber": 3,
      "title": "Book Magic",
      "duration": "10 sec",
      "setting": "Magiczna księga z imionami grzecznych dzieci",
      "santaDialogue": "",
      "visualDescription": "Antyczna księga otwiera się, strony latają w powietrzu",
      "emotionalTone": "Misteryjny, magiczny",
      "isPremade": true
    }
  ],
  "personalized": {
    ${data.children.map(child => `"${child.name}": [
      {
        "sceneNumber": 4,
        "title": "Photo Comes Alive",
        "duration": "12 sec",
        "santaDialogue": "Ah! Tam jesteś, ${child.name}! Twoje zdjęcie się ożywa!",
        "visualDescription": "Zdjęcie ${child.name} pojawia się w magicznej księdze, zaczyna się animować"
      },
      {
        "sceneNumber": 5,
        "title": "Name Reveal",
        "duration": "10 sec",
        "santaDialogue": "${child.name.toUpperCase()}!",
        "visualDescription": "Imię ${child.name} pojawia się jako złote litery unoszące się w powietrzu"
      },
      {
        "sceneNumber": 6,
        "title": "Santa's Message",
        "duration": "25 sec",
        "santaDialogue": "Drogi ${child.name}, byłem bardzo dumny z Twojego dobrego zachowania: ${child.goodBehavior}. Chciałbym, żebyś popracował nad: ${child.thingToImprove}. A może nauczysz się: ${child.thingToLearn}? Mam dla Ciebie coś specjalnego na Wigilię!",
        "visualDescription": "Mikołaj mówi bezpośrednio do kamery, ciepły, osobisty moment"
      },
      {
        "sceneNumber": 8,
        "title": "Epic Launch",
        "duration": "10 sec",
        "santaDialogue": "Do zobaczenia soon, ${child.name}! Wesołych Świąt!",
        "visualDescription": "Sanie Mikołaja wzlatują w nocne niebo, imię ${child.name} pojawia się w gwiazdach"
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
