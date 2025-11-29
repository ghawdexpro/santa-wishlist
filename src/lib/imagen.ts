import { GoogleAuth } from 'google-auth-library'

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT || 'primal-turbine-478412-k9'
const LOCATION = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
const MODEL = 'imagen-3.0-generate-001'

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

export interface KeyframeGenerationResult {
  sceneNumber: number
  imageBase64: string
  mimeType: string
}

export interface ScenePrompt {
  sceneNumber: number
  prompt: string
  isPremade: boolean
}

// Santa character consistency prompt
const SANTA_STYLE = `Photorealistic, cinematic lighting, warm cozy atmosphere.
Santa Claus: elderly man in his 60s, natural white full beard, rosy cheeks, kind twinkling blue eyes,
wearing classic red velvet suit with white fur trim, black leather belt with gold buckle,
seated in a cozy wooden workshop with warm firelight, antique furniture, toys on shelves in background.
Style: Coca-Cola classic Santa, warm and grandfatherly, NOT cartoonish.`

const WORKSHOP_SETTING = `Santa's cozy North Pole workshop study, warm wood paneling,
stone fireplace with crackling fire, antique leather armchair, snow visible through frosted window,
soft warm lighting, Christmas decorations, magical atmosphere.`

export function generateScenePrompts(
  scenes: Array<{
    sceneNumber: number
    title: string
    setting: string
    visualDescription: string
    isPremade: boolean
  }>,
  childName: string
): ScenePrompt[] {
  return scenes.map((scene) => {
    let basePrompt = ''

    // Build scene-specific prompts
    switch (scene.sceneNumber) {
      case 1: // Workshop greeting - pre-made
        basePrompt = `${SANTA_STYLE} ${WORKSHOP_SETTING}
          Santa sitting in his leather armchair, looking warmly at camera with welcoming smile,
          hands on armrests, fireplace glowing behind him. Wide shot showing cozy workshop.`
        break

      case 2: // Opens Nice List book - personalized
        basePrompt = `${SANTA_STYLE} ${WORKSHOP_SETTING}
          Santa holding a large ornate leather-bound book with golden edges (the Nice List),
          book is open and glowing with soft golden light, Santa looking down at the book with curious smile.
          Close-up shot of Santa with the magical book.`
        break

      case 3: // Praises good behavior - personalized
        basePrompt = `${SANTA_STYLE} ${WORKSHOP_SETTING}
          Santa looking directly at camera with proud, warm expression, slight nod of approval,
          one hand gesturing gently as if speaking to a child. Medium shot, warm intimate framing.`
        break

      case 4: // Gentle encouragement - personalized
        basePrompt = `${SANTA_STYLE} ${WORKSHOP_SETTING}
          Santa with gentle, understanding expression, leaning slightly forward as if sharing wisdom,
          kind encouraging eyes, soft smile. Medium close-up, intimate and caring.`
        break

      case 5: // Encourages goal - personalized
        basePrompt = `${SANTA_STYLE} ${WORKSHOP_SETTING}
          Santa with excited, enthusiastic expression, eyes twinkling with encouragement,
          animated hand gesture as if cheering on a child. Medium shot, energetic but warm.`
        break

      case 6: // Preparing something special - transition
        basePrompt = `${SANTA_STYLE} ${WORKSHOP_SETTING}
          Santa with secretive, playful smile, finger touching side of nose knowingly,
          mischievous twinkle in eye as if keeping a wonderful secret. Close-up shot.`
        break

      case 7: // Workshop with elves - pre-made
        basePrompt = `North Pole toy workshop, busy scene with elves working on toys,
          conveyor belts with wrapped presents, Christmas lights, wooden toy soldiers being painted,
          magical snowy atmosphere, warm lighting. Wide establishing shot, no Santa in frame.`
        break

      case 8: // Promises to visit - personalized
        basePrompt = `${SANTA_STYLE} ${WORKSHOP_SETTING}
          Santa pointing upward as if indicating the sky/Christmas Eve, excited expression,
          magical sparkles in the air, window showing snowy night sky behind him. Medium shot.`
        break

      case 9: // Warm goodbye - personalized
        basePrompt = `${SANTA_STYLE} ${WORKSHOP_SETTING}
          Santa waving warmly at camera, big genuine smile, eyes crinkled with joy,
          one hand raised in friendly wave. Medium shot, warm and emotional.`
        break

      case 10: // Ho Ho Ho outro - pre-made
        basePrompt = `${SANTA_STYLE} ${WORKSHOP_SETTING}
          Santa laughing heartily, head tilted back slightly, mouth open in joyful "Ho Ho Ho",
          belly shaking with laughter, pure joy and merriment. Close-up shot.`
        break

      default:
        basePrompt = `${SANTA_STYLE} ${WORKSHOP_SETTING} ${scene.visualDescription}`
    }

    return {
      sceneNumber: scene.sceneNumber,
      prompt: basePrompt,
      isPremade: scene.isPremade,
    }
  })
}

export async function generateKeyframe(prompt: string): Promise<{ imageBase64: string; mimeType: string }> {
  const accessToken = await getAccessToken()

  const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL}:predict`

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: '16:9',
        personGeneration: 'allow_adult',
        safetySetting: 'block_few',
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Imagen API error:', error)
    throw new Error(`Imagen API error: ${response.status}`)
  }

  const result = await response.json()

  if (!result.predictions || result.predictions.length === 0) {
    throw new Error('No image generated')
  }

  return {
    imageBase64: result.predictions[0].bytesBase64Encoded,
    mimeType: result.predictions[0].mimeType || 'image/png',
  }
}

export async function generateAllKeyframes(
  scenePrompts: ScenePrompt[]
): Promise<KeyframeGenerationResult[]> {
  const results: KeyframeGenerationResult[] = []

  // Generate keyframes sequentially to avoid rate limits
  for (const scene of scenePrompts) {
    console.log(`Generating keyframe for scene ${scene.sceneNumber}...`)

    try {
      const { imageBase64, mimeType } = await generateKeyframe(scene.prompt)
      results.push({
        sceneNumber: scene.sceneNumber,
        imageBase64,
        mimeType,
      })
    } catch (error) {
      console.error(`Failed to generate keyframe for scene ${scene.sceneNumber}:`, error)
      throw error
    }

    // Small delay between requests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return results
}

// ============================================================================
// PHOTO COMPOSITING FOR "PHOTO COMES ALIVE" SCENE
// ============================================================================

const PHOTO_COMPOSITE_SANTA = `Santa Claus: distinguished elderly man in his 60s,
full natural white beard perfectly groomed, rosy cheeks glowing with warmth,
kind twinkling blue eyes, genuine warm smile of recognition and joy,
classic red velvet suit with pristine white fur trim, polished black leather belt with ornate gold buckle.`

const PHOTO_COMPOSITE_SETTING = `Santa's cozy study in the North Pole workshop:
Warm honey-colored wood paneling, magnificent stone fireplace with crackling orange flames,
antique leather wingback chair, ornate wooden desk, shelves with toys and snow globes,
warm golden ambient lighting from oil lamps and candles, magical dust particles in air.`

/**
 * Generate a keyframe for the "Photo Comes Alive" scene (Scene 4)
 * This creates a keyframe showing Santa looking at a glowing book with a photo frame
 *
 * Note: The actual child's photo will be composited in a later step or
 * animated using Veo's image-to-video capabilities
 */
export async function generatePhotoCompositeKeyframe(
  childDescription?: string
): Promise<{ imageBase64: string; mimeType: string }> {
  const description = childDescription || 'a happy smiling child'

  const prompt = `Cinematic quality, 4K resolution, professional Hollywood film lighting, photorealistic.

${PHOTO_COMPOSITE_SETTING}

${PHOTO_COMPOSITE_SANTA}

Santa is seated, holding an ancient magical leather-bound book (The Nice List).
The book is open and glowing with warm golden light.
On the illuminated page is an ORNATE GOLDEN FRAME with magical sparkles around it.
Inside the frame is a softly glowing rectangular space - like a magical photograph holder.
Golden sparkles and magical particles swirl around the book and frame.
Santa is looking down at the page with an expression of pure joy and recognition.
His face is illuminated from below by the golden glow of the book.

The magical frame on the page should be prominent and clearly visible.
The frame has intricate golden filigree designs, glowing edges, and magical runes.
Inside the frame area: a soft golden glow suggesting where a photo would appear.

Camera: Close-up to medium shot, showing Santa and the book clearly.
Lighting: Warm golden glow from book, firelight from side, magical atmosphere.
Mood: Magical recognition, wonder, joy, personal connection.`

  return await generateKeyframe(prompt)
}

/**
 * Generate a keyframe for the "Name Reveal" scene (Scene 5)
 * Shows Santa with giant 3D golden letters floating around him
 */
export async function generateNameRevealKeyframe(
  childName: string
): Promise<{ imageBase64: string; mimeType: string }> {
  const prompt = `Cinematic quality, 4K resolution, professional Hollywood film lighting, photorealistic.

${PHOTO_COMPOSITE_SETTING}

${PHOTO_COMPOSITE_SANTA}

SPECTACULAR MOMENT: Giant 3D golden letters spelling "${childName}" floating in the air!

Santa stands in his cozy study, looking up with pure delight and joy.
Above and around him, the letters of the name "${childName}" float majestically:
- Each letter is 3D, luminous, made of pure golden light
- Letters are large (about the size of Santa's head)
- They hover and glow, casting golden light across the room
- Golden sparkles and magical particles trail from each letter
- The letters are arranged beautifully in the air

Santa's face is bathed in the warm golden light from the floating letters.
His expression shows genuine joy and excitement - "What a wonderful child!"
Magical golden dust particles fill the air.

Camera: Wide shot showing Santa and the floating letters together.
Lighting: Dramatic golden glow from letters, warm firelight, magical atmosphere.
Mood: Spectacular, personalized magic, memorable, joyful.`

  return await generateKeyframe(prompt)
}

/**
 * Generate a keyframe for "Santa's Message" scene (Scene 6)
 * Shows Santa speaking directly to camera with warm expression
 */
export async function generateSantaMessageKeyframe(): Promise<{ imageBase64: string; mimeType: string }> {
  const prompt = `Cinematic quality, 4K resolution, professional Hollywood film lighting, photorealistic.

${PHOTO_COMPOSITE_SETTING}

${PHOTO_COMPOSITE_SANTA}

Santa is speaking directly to camera with warm, grandfatherly love.
He is seated in his leather wingback chair by the crackling fireplace.
Firelight flickers warmly on his face from the side.
His expression is kind, proud, and full of genuine emotion.
One hand is gently raised as if making an important point.
Golden sparkles float softly in the air around him.

His eyes are focused directly on camera - speaking to YOU.
Expression: loving grandfather sharing important words with a beloved grandchild.
Magical dust particles catch the warm firelight.
The atmosphere is intimate, personal, and emotional.

Camera: Medium close-up, intimate and personal framing.
Lighting: Warm firelight from side, soft ambient glow, golden particles.
Mood: Emotional core, "He knows me", validating, loving, proud.`

  return await generateKeyframe(prompt)
}

/**
 * Generate a keyframe for "Epic Launch" scene (Scene 8)
 * Shows sleigh launching into starlit sky with rainbow trail
 */
export async function generateEpicLaunchKeyframe(): Promise<{ imageBase64: string; mimeType: string }> {
  const prompt = `Cinematic quality, 4K resolution, professional Hollywood film lighting, photorealistic.

EPIC FINALE: Santa's sleigh launching into the Christmas night sky!

The magnificent RED AND GOLD SLEIGH is mid-flight, rocketing upward.
Santa Claus in his red suit is in the sleigh, waving back toward camera.
Eight majestic reindeer pulling the sleigh through the starlit sky.
RUDOLPH at the front, nose blazing bright red!

Behind the sleigh streams a MAGNIFICENT RAINBOW TRAIL of light!
Golden stardust and magical sparkles swirl in their wake.
The trail creates beautiful arcs of color against the dark sky.

Below: the snow-covered North Pole village with warm glowing windows.
Above: brilliant stars and northern lights (aurora borealis) dancing.
Snow falling gently, catching the magical light.

Camera: Epic wide shot from below, looking up at the launching sleigh.
Lighting: Magical glow from sleigh, Rudolph's red nose, starlight, aurora.
Mood: EXHILARATING, triumphant, perfect ending, "Go go go!"

The sleigh should be clearly visible against the night sky with the rainbow trail streaming behind it.`

  return await generateKeyframe(prompt)
}
