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
  const prompt = `Jesteś scenarzystą magicznych, spersonalizowanych filmów od Świętego Mikołaja dla dzieci w Polsce.
Napisz ciepły, dostosowany do wieku scenariusz, w którym Mikołaj mówi bezpośrednio do dziecka PO POLSKU.

KONTEKST HISTORII:
To jest "Magia Świąt" - epicka przygoda Mikołaja. Mikołaj leci przez burzę śnieżną na Biegunie Północnym,
jego sanie zostają trafione piorunem, ale używa magii żeby się uratować. Po tej przygodzie znajduje
to wyjątkowe dziecko w swojej magicznej księdze.

INFORMACJE O DZIECKU:
- Imię: ${data.childName}
- Wiek: ${data.childAge} lat
- Dobre zachowanie do pochwalenia: ${data.goodBehavior}
- Obszar do delikatnej zachęty: ${data.thingToImprove}
- Cel do wsparcia: ${data.thingToLearn}
${data.customMessage ? `- Wiadomość od rodzica: ${data.customMessage}` : ''}

WYMAGANIA SCENARIUSZA:
1. Całkowita długość: około 90 sekund
2. Mikołaj powinien być ciepły, radosny i zachęcający - NIGDY nie krytykuje
3. Używaj imienia dziecka naturalnie (3-4 razy)
4. Język odpowiedni dla ${data.childAge}-latka
5. Buduj emocjonalne połączenie - to powinno być magiczne
6. Wszystkie dialogi PO POLSKU
7. Zakończ ekscytacją na Święta i ciepłym pożegnaniem

STRUKTURA SCEN (dokładnie w tej kolejności):
- Scena 1: Burza nad Arktyką - Mikołaj walczy z burzą (premade, ~8 sek)
- Scena 2: Uderzenie pioruna - sanie zostają trafione! (premade, ~8 sek)
- Scena 3: Magiczny ratunek - Mikołaj używa magii żeby się uratować (premade, ~8 sek)
- Scena 4: Zdjęcie dziecka pojawia się w księdze (personalizowane, ~8 sek)
- Scena 5: Imię dziecka pojawia się w zorzy polarnej (personalizowane, ~8 sek)
- Scena 6: Osobista wiadomość Mikołaja PO POLSKU (personalizowane, ~45 sek - HeyGen)
- Scena 7: Sanie gotowe do lotu (premade, ~8 sek)
- Scena 8: Epicki start w kierunku dziecka (personalizowane, ~8 sek)

Zwróć TYLKO poprawny JSON w tym dokładnym formacie:
{
  "childName": "${data.childName}",
  "totalDuration": "~93 sekundy",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Burza nad Arktyką",
      "duration": "8 sek",
      "setting": "Mikołaj leci przez epicką burzę śnieżną",
      "santaDialogue": "",
      "visualDescription": "Sanie Mikołaja walczą z potężną burzą śnieżną, błyskawice, wiatr",
      "emotionalTone": "Napięcie, ekscytacja, niebezpieczeństwo",
      "isPremade": true
    }
  ]
}

Wygeneruj wszystkie 8 scen z dialogami PO POLSKU dla scen 4-6 i 8. Zrób to magicznie!`

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
  const childrenCount = data.children.length

  const prompt = `Jesteś scenarzystą magicznych filmów od Świętego Mikołaja dla dzieci w Polsce.
Napisz scenariusz dla WIELU DZIECI w jednym filmie. Cały film powinien być ciepły, magiczny i spersonalizowany dla każdego dziecka.
WSZYSTKIE DIALOGI MUSZĄ BYĆ PO POLSKU.

KONTEKST HISTORII:
To jest "Magia Świąt" - epicka przygoda Mikołaja. Mikołaj leci przez burzę śnieżną,
jego sanie zostają trafione piorunem (dramatyczne!), ale używa magicznego artefaktu żeby naprawić sanie
i bezpiecznie wylądować. Po tej przygodzie znajduje te wyjątkowe dzieci w swojej magicznej księdze.

DZIECI W FILMIE:
${data.children.map((c, i) => `${i + 1}. ${c.name} (${c.age} lat)
   - Dobre zachowanie: ${c.goodBehavior}
   - Do poprawy: ${c.thingToImprove}
   - Do nauczenia: ${c.thingToLearn}`).join('\n')}

STRUKTURA FILMU (8 scen):
- Scena 1: Burza nad Arktyką - Premade (bez dialogu, Mikołaj walczy z burzą)
- Scena 2: Uderzenie pioruna - Premade (bez dialogu, sanie trafione!)
- Scena 3: Magiczny ratunek - Premade (bez dialogu, Mikołaj używa magii)
- Scena 4: Odkrycie zdjęcia - Jedna wersja na dziecko (krótki dialog Mikołaja PO POLSKU)
- Scena 5: Imię w zorzy - Jedna wersja na dziecko (Mikołaj ogłasza imię PO POLSKU)
- Scena 6: Wiadomość Mikołaja - Jedna wersja na dziecko (personalizowana wiadomość HeyGen, ~45 sek, PO POLSKU)
- Scena 7: Sanie gotowe - Premade (bez dialogu)
- Scena 8: Epicki start - Jedna wersja na dziecko (spersonalizowane pożegnanie PO POLSKU)

WYMAGANIA:
1. Każde dziecko powinno czuć się wyjątkowe
2. Mikołaj powinien być ciepły, radosny i zachęcający - NIGDY nie krytykuje
3. Używaj imion naturalnie
4. Język odpowiedni do wieku każdego dziecka
5. Buduj emocjonalne połączenie
6. WSZYSTKIE DIALOGI PO POLSKU

Zwróć TYLKO poprawny JSON zawierający:
- Ogólne informacje o filmie
- Dialogi dla każdego dziecka w scenach 4, 5, 6, 8
- Format: krótkie, naturalne, magiczne dialogi PO POLSKU

Format JSON:
{
  "childrenNames": [${data.children.map(c => `"${c.name}"`).join(', ')}],
  "totalDuration": "~${93 + (childrenCount - 1) * 69} sekund",
  "scenes": [
    {
      "sceneNumber": 1,
      "title": "Burza nad Arktyką",
      "duration": "8 sek",
      "setting": "Mikołaj leci przez epicką burzę śnieżną nad Arktyką",
      "santaDialogue": "",
      "visualDescription": "Sanie Mikołaja walczą z potężną burzą, błyskawice, wiatr szarpie saniami",
      "emotionalTone": "Napięcie, ekscytacja, niebezpieczeństwo",
      "isPremade": true
    },
    {
      "sceneNumber": 2,
      "title": "Uderzenie pioruna",
      "duration": "8 sek",
      "setting": "Piorun uderza w sanie Mikołaja!",
      "santaDialogue": "",
      "visualDescription": "Potężny piorun trafia sanie, iskry, dym, sanie zaczynają spadać",
      "emotionalTone": "Szczytowe napięcie, strach, 'O nie!'",
      "isPremade": true
    },
    {
      "sceneNumber": 3,
      "title": "Magiczny ratunek",
      "duration": "8 sek",
      "setting": "Mikołaj używa magii żeby uratować sytuację",
      "santaDialogue": "",
      "visualDescription": "Mikołaj wyciąga złoty artefakt, eksplozja złotego światła, sanie się naprawiają",
      "emotionalTone": "Ulga i zachwyt, 'Udało się!'",
      "isPremade": true
    }
  ],
  "personalized": {
    ${data.children.map(child => `"${child.name}": [
      {
        "sceneNumber": 4,
        "title": "Odkrycie zdjęcia",
        "duration": "8 sek",
        "santaDialogue": "Ach! Tu jesteś, ${child.name}! Znalazłem cię w mojej magicznej księdze!",
        "visualDescription": "Zdjęcie ${child.name} pojawia się w złotej ramce, ożywa z iskierkami"
      },
      {
        "sceneNumber": 5,
        "title": "Imię w zorzy polarnej",
        "duration": "8 sek",
        "santaDialogue": "${child.name.toUpperCase()}! Co za wspaniałe dziecko!",
        "visualDescription": "Imię ${child.name} pojawia się jako złote litery w zorzy polarnej"
      },
      {
        "sceneNumber": 6,
        "title": "Wiadomość od Mikołaja",
        "duration": "45 sek",
        "santaDialogue": "Ho ho ho! Witaj ${child.name}! Obserwowałem dzieci na całym świecie i ty jesteś naprawdę wyjątkowy. Byłem taki dumny, gdy zobaczyłem jak ${child.goodBehavior}. To było wspaniałe! Wiem też, że ${child.thingToImprove}. Wierzę w ciebie całkowicie! Słyszałem też, że chcesz się nauczyć ${child.thingToLearn}. Co za świetny pomysł! Może sprawdź pod choinką... Pamiętaj, drogi ${child.name}, bądź grzeczny i nigdy nie przestawaj wierzyć w magię Świąt! Do zobaczenia wkrótce! Ho ho ho!",
        "visualDescription": "Mikołaj mówi bezpośrednio do kamery w swoim przytulnym pokoju, ciepło i osobiście"
      },
      {
        "sceneNumber": 8,
        "title": "Epicki start",
        "duration": "8 sek",
        "santaDialogue": "Do zobaczenia wkrótce, ${child.name}! Wesołych Świąt! Ho ho ho!",
        "visualDescription": "Sanie startują w niebo, imię ${child.name} pojawia się w gwiazdach nad zorzą polarną"
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
