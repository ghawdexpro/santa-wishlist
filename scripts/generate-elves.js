/**
 * Generate Elf Reference Characters for Operation: Nice List
 * Uses NanoBanana (Gemini Image Gen) via Vertex AI
 *
 * Run: node scripts/generate-elves.js
 */

const fs = require('fs');
const path = require('path');

// Load env
require('dotenv').config({ path: '.env.local' });

const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
const LOCATION = 'us-central1';

// Elf character definitions
const ELVES = [
  {
    name: 'jingle',
    role: 'Team Leader',
    prompt: `Create a Christmas elf character named Jingle, the leader of Santa's elite Scout Team Alpha.

Character details:
- Red tactical vest over forest green turtleneck sweater
- Round golden-rimmed glasses perched on nose
- Always carries a small clipboard with checklist
- Tiny earpiece radio in pointed ear
- Determined, professional but friendly expression
- One pointed ear has a small gold hoop earring
- Rosy cheeks, bright eyes, confident posture
- Age appears mid-30s in elf years (looks youthful)

Style: Pixar/Disney animation quality but photorealistic rendering. Warm, magical lighting. Character is standing in 3/4 view pose, looking slightly off-camera with a knowing smile. Background is simple soft gradient (dark green to warm gold) for easy compositing.

The character should feel like a professional spy who also loves Christmas - think James Bond meets Christmas elf.`
  },
  {
    name: 'twinkle',
    role: 'Tech Specialist',
    prompt: `Create a Christmas elf character named Twinkle, the tech specialist of Santa's elite Scout Team Alpha.

Character details:
- Cozy blue knit cap with a tiny antenna poking out the top
- Warm striped scarf in red and white candy cane pattern
- Vintage polaroid camera hanging around neck
- Utility belt with various gadgets and tools
- Curious, excited, eager expression - loves the mission
- Adorable freckles scattered across nose and cheeks
- Slightly smaller/younger looking than other elves
- Big expressive eyes full of wonder

Style: Pixar/Disney animation quality but photorealistic rendering. Warm, magical lighting. Character is in an action pose, holding up camera as if about to take a photo, with excited smile. Background is simple soft gradient (midnight blue to warm amber) for easy compositing.

The character should feel like an enthusiastic tech nerd who gets excited about every mission.`
  },
  {
    name: 'sprocket',
    role: 'Equipment Specialist',
    prompt: `Create a Christmas elf character named Sprocket, the equipment specialist of Santa's elite Scout Team Alpha.

Character details:
- Steampunk-style brass goggles pushed up on forehead
- Heavy leather tool belt loaded with measuring tapes, wrenches, gadgets
- Forest green work overalls over red flannel undershirt
- Rolled up sleeves showing strong forearms
- Bushy expressive eyebrows (trademark feature)
- Confident, capable, "can fix anything" expression
- Slightly stockier build than other elves - the strong one
- Smudge of grease on cheek (badge of honor)

Style: Pixar/Disney animation quality but photorealistic rendering. Warm, magical lighting. Character is standing with arms crossed confidently, slight smirk, measuring tape draped over shoulder. Background is simple soft gradient (warm brown to golden) for easy compositing.

The character should feel like the reliable engineer who's always prepared for any situation.`
  }
];

async function getAccessToken() {
  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);

  // Create JWT
  const jwt = require('jsonwebtoken');
  const now = Math.floor(Date.now() / 1000);

  const token = jwt.sign(
    {
      iss: credentials.client_email,
      sub: credentials.client_email,
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
      scope: 'https://www.googleapis.com/auth/cloud-platform'
    },
    credentials.private_key,
    { algorithm: 'RS256' }
  );

  // Exchange for access token
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token
    })
  });

  const data = await response.json();
  return data.access_token;
}

async function generateElfImage(elf, accessToken) {
  console.log(`\nGenerating ${elf.name.toUpperCase()} (${elf.role})...`);

  const model = 'gemini-2.0-flash-preview-image-generation';
  const endpoint = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${model}:generateContent`;

  const body = {
    contents: [{
      role: 'user',
      parts: [{ text: elf.prompt }]
    }],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      temperature: 0.8
    }
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  const result = await response.json();

  // Extract image from response
  const parts = result.candidates?.[0]?.content?.parts || [];

  for (const part of parts) {
    if (part.inlineData) {
      const imageData = part.inlineData.data;
      const mimeType = part.inlineData.mimeType;
      const extension = mimeType.includes('png') ? 'png' : 'jpg';

      // Save to assets folder
      const outputDir = path.join(__dirname, '..', 'public', 'assets', 'elves');
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const outputPath = path.join(outputDir, `${elf.name}.${extension}`);
      fs.writeFileSync(outputPath, Buffer.from(imageData, 'base64'));

      console.log(`  ✓ Saved: ${outputPath}`);
      return outputPath;
    }
  }

  // Check for text response (might explain why no image)
  for (const part of parts) {
    if (part.text) {
      console.log(`  Response text: ${part.text}`);
    }
  }

  throw new Error('No image in response');
}

async function main() {
  console.log('='.repeat(50));
  console.log('OPERATION: NICE LIST - Elf Character Generator');
  console.log('='.repeat(50));

  try {
    // Get access token
    console.log('\nAuthenticating with Google Cloud...');
    const accessToken = await getAccessToken();
    console.log('  ✓ Authenticated');

    // Generate each elf
    const results = [];
    for (const elf of ELVES) {
      try {
        const imagePath = await generateElfImage(elf, accessToken);
        results.push({ elf: elf.name, status: 'success', path: imagePath });
      } catch (error) {
        console.error(`  ✗ Failed: ${error.message}`);
        results.push({ elf: elf.name, status: 'failed', error: error.message });
      }

      // Small delay between requests
      await new Promise(r => setTimeout(r, 2000));
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('GENERATION COMPLETE');
    console.log('='.repeat(50));

    for (const r of results) {
      const icon = r.status === 'success' ? '✓' : '✗';
      console.log(`${icon} ${r.elf}: ${r.status}`);
    }

    const successCount = results.filter(r => r.status === 'success').length;
    console.log(`\nTotal: ${successCount}/${ELVES.length} elves generated`);

    if (successCount > 0) {
      console.log(`\nElf images saved to: public/assets/elves/`);
    }

  } catch (error) {
    console.error('\nFatal error:', error.message);
    process.exit(1);
  }
}

main();
