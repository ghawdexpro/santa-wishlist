/**
 * HOLLYWOOD-LEVEL KEYFRAME PROMPTS
 *
 * Design Philosophy:
 * - Photorealistic, NOT animated/cartoon
 * - Reference real cinematography (Vilmos Zsigmond, Roger Deakins)
 * - Specific VFX terminology (volumetric, subsurface scattering, caustics)
 * - Child's photo integrated in MULTIPLE scenes (4, 5, 6, 8)
 * - Dual-keyframe system (start + end) for controlled Veo animation
 */

// =============================================================================
// UNIVERSAL STYLE CONSTANTS
// =============================================================================

export const CINEMATOGRAPHY = {
  camera: `Shot on ARRI Alexa 65 with Panavision C-Series anamorphic lenses.
Shallow depth of field at T1.4, oval bokeh characteristic of anamorphic glass.
Subtle breathing focus pulls. Handheld micro-movements for organic feel.
2.39:1 aspect ratio aesthetic even in 16:9 frame.`,

  lighting: `Practical lighting augmented with diffused fill.
Warm tungsten key (3200K) mixed with cool ambient moonlight (5600K) for contrast.
Motivated sources: fireplace, candles, oil lamps, window light.
Volumetric atmosphere with theatrical haze for visible light rays.
Rim lighting to separate subject from background.`,

  colorScience: `ACES color managed workflow.
Warm shadows, lifted blacks with subtle blue in deep shadows.
Skin tones: creamy, healthy, naturalistic - never orange or waxen.
Highlights: soft roll-off, no harsh clipping.
Color palette: deep burgundy, antique gold, warm cream, forest green.`,

  vfx: `Photoreal VFX integration - invisible effect work.
Practical elements enhanced, not replaced by CG.
Particle systems: dust motes, snow, ember sparks - physically accurate.
Light interaction: caustics, subsurface scattering, proper shadow casting.
No cartoon glow - use lens flares, light wrap, halation instead.`,
}

export const SANTA_CHARACTER = {
  face: `Distinguished Caucasian male, 68 years old.
Full natural white beard, meticulously groomed but not artificial.
Genuine smile lines (crow's feet), warm expression.
Bright blue eyes with visible catchlights, hint of moisture for life.
Rosy cheeks from natural warmth, not painted on.
Skin texture: visible pores, age spots, naturalistic imperfections.`,

  costume: `Traditional Santa suit - practical costume not CGI.
Deep crimson velvet (not bright red) with natural fabric folds.
Pristine white Arctic fox fur trim, individual hairs visible.
Wide black leather belt with ornate brass buckle (tarnished with age).
Black leather boots, worn but polished.
Costume shows subtle wear - this is REAL Santa, not a costume.`,

  demeanor: `Grandfatherly warmth, quiet wisdom, playful twinkle.
Movement: deliberate, graceful, never rushed.
Expressions: subtle, naturalistic, emotionally genuine.
Eye contact: direct, engaging, creates connection through lens.`,
}

export const WORKSHOP_INTERIOR = {
  architecture: `Handcrafted timber frame construction, centuries old.
Honey-colored oak beams with visible adze marks.
Stone fireplace: river rock, massive, well-used with soot staining.
Plaster walls with subtle texture, warm cream color.
Wide plank floors, worn smooth in high-traffic areas.`,

  lighting_setup: `Key: Fireplace practical (warm, flickering, 2800K)
Fill: Brass oil lamps on desk (warm pools of light)
Accent: Candles in wall sconces (dancing flames)
Window: Blue hour moonlight through frost (cool contrast)
Result: Chiaroscuro lighting with dramatic shadows.`,

  props: `Antique leather-bound books with gold leaf.
Brass telescope, pocket watch, quill pens.
Snow globes with visible snow particles.
Wooden toys: hand-carved, showing craftsmanship.
Letters in aged parchment, wax seals.
Persian rugs, worn leather wingback chair.`,
}

// =============================================================================
// SCENE 4: PHOTO COMES ALIVE (Uses Child Photo)
// =============================================================================

export const SCENE_4_PROMPTS = {
  /**
   * START KEYFRAME: Magic book open, photo visible but static
   * CRITICAL: Child's photo must be LARGE (40-50% of frame) for Veo to maintain likeness
   */
  startKeyframe: (childName: string) => `PHOTOREALISTIC KEYFRAME - Scene 4 Start

${CINEMATOGRAPHY.camera}
${CINEMATOGRAPHY.lighting}
${CINEMATOGRAPHY.colorScience}

COMPOSITION:
EXTREME CLOSE-UP on the book page - the photograph fills most of the frame.
Book edges barely visible at corners.
HERO ELEMENT: Child's photograph takes up 40-50% OF THE ENTIRE FRAME.

CRITICAL - PHOTO SIZE:
- The child's face from reference image must be LARGE - at least 40% of frame width
- This is essential for video animation to maintain facial likeness
- Do NOT make the photo small in a busy scene
- The photo IS the scene - everything else is background

THE PHOTOGRAPH:
- Reference image is the DOMINANT visual element
- Child's face clearly visible, sharp, well-lit
- Ornate gold leaf frame around the photo (thin, not overwhelming)
- Subtle 3D depth - photo emerging from page
- Warm golden light illuminates the face

LIGHTING:
Primary: Golden glow emanating from book pages (practical light effect)
Secondary: Warm fireplace light from screen right
Volumetric: Dust motes caught in the light beam from the book
Lens effect: Subtle warm halation around bright areas

ATMOSPHERE:
Macro dust particles floating in foreground (out of focus)
Background: Santa's study in soft bokeh
Color: Deep amber, antique gold, warm cream

TECHNICAL:
- Child's face from reference image is THE FOCAL POINT
- Photograph must look physically present on the page
- No floating UI elements or text overlays
- Photorealistic - could be a frame from a Spielberg film

This is the moment ${childName}'s photo appears in Santa's magical book.`,

  /**
   * END KEYFRAME: Photo glowing intensely, magical transformation beginning
   * CRITICAL: Maintain same large photo size as start keyframe
   */
  endKeyframe: (childName: string) => `PHOTOREALISTIC KEYFRAME - Scene 4 End

${CINEMATOGRAPHY.camera}
${CINEMATOGRAPHY.colorScience}

COMPOSITION:
SAME FRAMING as start - child's photo still 40-50% of frame.
Photo now GLOWING with warm inner light.

CRITICAL - MAINTAIN PHOTO SIZE:
- Child's face must remain LARGE - same size as start keyframe
- Do not zoom out or add more elements
- The transformation happens TO the large photo

THE TRANSFORMATION:
- Child's photograph is LUMINOUS - lit from within
- Golden light rays emanate outward from the photo
- Edges of photograph have soft glow (light wrap effect)
- Photo appears more three-dimensional, emerging from page
- Child's face UNCHANGED - just lighting effects around it

LIGHTING EVOLUTION:
Book glow: INTENSIFIED - brighter golden light
Light rays: Visible volumetric beams extending from photo
Lens effects: Anamorphic flares stretching horizontally
Practical sparks: Tiny ember-like particles rising from book edges

ATMOSPHERE:
Increased haze for more dramatic volumetric lighting
Santa's face visible at edge of frame, lit by book's glow
Expression: Wonder, recognition, delight

TECHNICAL:
- Same child's face but now ALIVE with inner light
- Transition implies magic happening
- Maintain photorealistic aesthetic despite magical elements
- Light effects are practical/optical, not cartoon CG

The moment ${childName}'s photo comes alive with Christmas magic.`,

  /**
   * VIDEO PROMPT: Animation between start and end keyframes
   */
  videoPrompt: (childName: string) => `Seamless transformation sequence: Child's photograph in magical book begins to glow with warm golden light.

MOTION:
- Initial stillness, then subtle movement within the photograph
- Light intensifies gradually, rays extending outward
- Dust motes swirl gently around the book
- Pages flutter slightly from magical energy
- Santa's hands steady, his breath visible in anticipation

AUDIO CUES:
- Soft magical hum building
- Paper rustling
- Warm orchestral swell
- Santa's gentle gasp of recognition

PACING:
Slow, deliberate reveal. Let the magic breathe.
This is ${childName}'s hero moment - their photo coming alive.

Photorealistic quality. No cartoon effects. Spielberg-level movie magic.`,
}

// =============================================================================
// SCENE 5: NAME REVEAL (Uses Child Photo in Background)
// =============================================================================

export const SCENE_5_PROMPTS = {
  /**
   * START KEYFRAME: Golden letters beginning to form
   * NOTE: No child photo in this scene - focus on the NAME as hero element
   * Photo was already shown prominently in Scene 4
   */
  startKeyframe: (childName: string) => `PHOTOREALISTIC KEYFRAME - Scene 5 Start

${CINEMATOGRAPHY.camera}
${CINEMATOGRAPHY.lighting}
${CINEMATOGRAPHY.colorScience}

COMPOSITION:
CLOSE-UP on golden letters forming in mid-air.
Letters fill 60% of frame - they are the HERO ELEMENT.
Dark workshop background with warm bokeh lights.

THE NAME - HERO ELEMENT:
Letters "${childName.toUpperCase()}" - LARGE, filling most of the frame.
- Letters are SOLID GOLD - photoreal precious metal
- Each letter 15-20% of frame height
- Currently semi-transparent, particles coalescing
- Floating against dark background for contrast

GOLD MATERIAL:
Not cartoon gold - photoreal 24k gold.
Visible reflections, subtle surface imperfections.
Hammered texture, handcrafted artisan feel.
Micro-scratches for authenticity.

LIGHTING:
Letters are SELF-LUMINOUS - primary light source.
Dark background makes letters POP.
Subtle warm rim light from off-screen fireplace.
Lens flares on brightest letter edges.

ATMOSPHERE:
Particles of golden light streaming toward letters.
Dark, moody background - letters are the star.
Volumetric haze for depth.

NO PHOTO IN THIS SCENE - focus entirely on the magical name reveal.
This is about ${childName}'s NAME being celebrated.`,

  /**
   * END KEYFRAME: Name fully formed, triumphant reveal
   * NO PHOTO - pure focus on golden name
   */
  endKeyframe: (childName: string) => `PHOTOREALISTIC KEYFRAME - Scene 5 End

${CINEMATOGRAPHY.camera}
${CINEMATOGRAPHY.colorScience}

COMPOSITION:
HERO SHOT - golden name dominates frame (70% of width).
Letters "${childName.toUpperCase()}" now SOLID and RADIANT.
Dark background with subtle warm bokeh.

THE COMPLETE NAME - FILLS THE FRAME:
- Fully formed 3D metallic gold letters
- Letters span almost entire frame width
- Each letter catches light differently
- Anamorphic lens flares on brightest points
- MASSIVE presence - this is the hero shot

GOLD QUALITY:
Pure 24k gold - warm yellow, photoreal metal.
Mirror reflections, visible surface texture.
Weight and mass implied - solid, not hollow.
Crafted, not CGI-perfect.

LIGHTING:
Letters at PEAK luminosity - main light source.
Horizontal anamorphic flares stretching across.
Light wrap where gold meets dark background.
Subtle particles orbiting the letters.

ATMOSPHERE:
Dark moody background - name POPS.
Golden particles suspended around letters.
Volumetric haze catching the light.
NO SANTA, NO BOOK - just the name in glory.

This is ${childName}'s HERO MOMENT.
Their name, massive and golden, filling the screen.`,

  /**
   * VIDEO PROMPT: Animation between start and end
   * Focus on letters only - no photo, no Santa
   */
  videoPrompt: (childName: string) => `Golden name reveal: Letters "${childName.toUpperCase()}" coalesce and solidify against dark background.

MOTION:
- Golden particles streaming inward toward letter shapes
- Letters forming from transparent to solid gold
- Subtle rotation as they settle into place
- Lens flares tracking across as light catches edges
- Particles continue orbiting completed letters

FRAMING:
- Letters remain LARGE throughout (60-70% of frame)
- Dark background - letters are the ONLY subject
- Subtle push-in as formation completes
- NO cutaways - stay on the name

AUDIO CUES:
- Ascending magical chimes
- Metallic shimmer sound
- Triumphant orchestral swell

Keep it SIMPLE - just the beautiful golden name forming.
${childName}'s name, massive and glorious.`,
}

// =============================================================================
// SCENE 6: SANTA'S MESSAGE (Uses Child Photo - LARGE in frame)
// =============================================================================

export const SCENE_6_PROMPTS = {
  /**
   * START KEYFRAME: EXTREME CLOSE-UP on photo in Santa's hands
   * CRITICAL: Photo must be 50%+ of frame for Veo to maintain likeness
   */
  startKeyframe: (childName: string) => `PHOTOREALISTIC KEYFRAME - Scene 6 Start

${CINEMATOGRAPHY.camera}
${CINEMATOGRAPHY.lighting}
${CINEMATOGRAPHY.colorScience}

COMPOSITION:
EXTREME CLOSE-UP on the photograph held in Santa's hands.
Photo fills 50-60% OF THE FRAME - it is the HERO ELEMENT.
Santa's hands visible at edges, his face OUT OF FRAME or barely visible.

CRITICAL - PHOTO SIZE:
- Child's face from reference image must be LARGE - 50%+ of frame
- Santa is NOT the subject - the PHOTO is the subject
- We see Santa's weathered hands holding the photo tenderly
- Maybe glimpse of Santa's beard/chin at very top of frame
- Focus is 100% on the child's photograph

THE PHOTOGRAPH:
- Reference image is the DOMINANT visual element
- Vintage-style print with cream border
- Child's face sharp, clear, well-lit
- Held at slight angle catching firelight
- Warm golden glow on the photo surface

SANTA'S HANDS (supporting element):
- White-gloved hands, worn red sleeves visible
- Holding photo gently, reverently
- Thumbs visible at photo edges
- NOT the focus - just framing device

LIGHTING:
Warm firelight illuminating the photo from the side.
Soft fill from ambient workshop light.
Photo surface has subtle reflections.

This shot is about ${childName}'s FACE being the center of attention.
Santa admires the photo - we see what he sees.`,

  /**
   * END KEYFRAME: Photo slightly lowered, Santa's warm smile visible above
   * CRITICAL: Photo still large (40%+), Santa's face now partially visible
   */
  endKeyframe: (childName: string) => `PHOTOREALISTIC KEYFRAME - Scene 6 End

${CINEMATOGRAPHY.camera}
${CINEMATOGRAPHY.colorScience}

COMPOSITION:
Photo lowered slightly - now Santa's face visible in upper portion.
Photo still 40% of frame - child's face still prominent.
Santa's warm, loving expression visible above the photo.

CRITICAL - MAINTAIN PHOTO PROMINENCE:
- Photo lowered but still LARGE in frame (40%+)
- Child's face remains sharp and clear
- Santa's face now visible - warm smile, twinkling eyes
- Split composition: photo below, Santa above

SANTA'S EXPRESSION (upper 40% of frame):
- Warm, grandfatherly smile
- Eyes with visible catchlights, hint of emotion
- White beard framing his face
- Looking toward camera with love

THE PHOTOGRAPH (lower 50% of frame):
- Still the reference image, still prominent
- Lowered to reveal Santa's reaction
- Warm light on both photo and Santa's face

LIGHTING:
Warm firelight on both subjects.
Santa's face well-lit, emotional.
Photo still catches the golden glow.

This creates the connection: Santa loves this child.
Seeing both together - the admirer and the admired.`,

  /**
   * VIDEO PROMPT: Santa's personal message
   * Photo remains LARGE throughout - minimal camera movement
   */
  videoPrompt: (childName: string) => `Intimate moment: Santa holds ${childName}'s photo, then lowers it slightly to reveal his loving expression.

MOTION:
- Start: Extreme close-up on photo in Santa's hands
- Photo gently lowers over 8 seconds
- Santa's warm face gradually revealed above
- Subtle breathing movement in Santa's hands
- Firelight flickers on both subjects

FRAMING:
- Photo remains LARGE throughout (never below 40% of frame)
- Child's face always visible and clear
- Santa's face revealed gradually from top of frame
- NO dramatic camera moves - intimate, steady shot

THE TRANSITION:
- Hands lower photo slowly, reverently
- Santa's smile appears above the photo
- His eyes have warmth and pride
- Connection between Santa and the child in photo

Keep the child's photo PROMINENT throughout.
This is about Santa's love for ${childName}.`,
}

// =============================================================================
// SCENE 8: EPIC LAUNCH (Child's Name/Face in Stars)
// =============================================================================

export const SCENE_8_PROMPTS = {
  /**
   * START KEYFRAME: Sleigh launching, night sky
   */
  startKeyframe: (childName: string) => `PHOTOREALISTIC KEYFRAME - Scene 8 Start

${CINEMATOGRAPHY.camera}
${CINEMATOGRAPHY.vfx}

COMPOSITION:
Epic wide shot - Santa's sleigh launching into Christmas night.
Ground level angle looking UP at the ascending sleigh.
Vast starfield backdrop with subtle aurora glow.

THE SLEIGH:
- Ornate golden sleigh, baroque scrollwork details
- Piled high with wrapped presents (practical, not CGI)
- Runners leaving trails of golden light
- Motion blur on outer edges (speed implied)

THE REINDEER:
- Eight majestic reindeer in powerful flight formation
- Rudolph at lead - nose glowing (practical light effect, not cartoon)
- Breath visible in cold air
- Harness bells catching starlight
- Muscular, powerful, REAL animals not cartoon

ENVIRONMENT:
- Snow-covered rooftops below receding
- Starfield: realistic night sky photography
- Aurora borealis ribbons (subtle, not overwhelming)
- Moon partially visible, providing rim light

LIGHTING:
- Sleigh lit by its own golden glow
- Rudolph's nose: warm red practical light
- Stars: points of light with subtle diffraction
- Snow below reflects moonlight

TECHNICAL:
- Epic scope and scale
- Movement implied through motion blur
- Photorealistic - ILM-quality visual effects
- This is the beginning of the finale`,

  /**
   * END KEYFRAME: Sleigh distant, child's constellation visible
   */
  endKeyframe: (childName: string) => `PHOTOREALISTIC KEYFRAME - Scene 8 End

${CINEMATOGRAPHY.camera}
${CINEMATOGRAPHY.vfx}

COMPOSITION:
Sleigh now distant - a streak of golden light among stars.
HERO ELEMENT: Child's name "${childName.toUpperCase()}" visible in STARS.
Like a constellation - stars connected by subtle golden lines.

THE CONSTELLATION:
- Child's name formed by ACTUAL STARS
- Stars are brighter along the letters
- Faint golden lines connecting stars (like constellation maps)
- Subtle twinkle animation implied
- OPTIONAL: Child's face faintly visible in nebula cloud nearby

THE DEPARTURE:
- Sleigh: small golden light with rainbow trail
- Trail forms subtle heart shape as it recedes
- Stars around sleigh seem to part for its passage
- Sense of speed and purpose

ENVIRONMENT:
- Deep space blue-black gradient sky
- Milky Way visible across frame
- Earth's curve visible at bottom edge
- Aurora glow illuminates horizon

EMOTIONAL BEAT:
${childName}'s name written in the stars.
Permanent. Eternal. "You matter to the universe."
Tears-in-eyes level of emotional payoff.

TECHNICAL:
- Astrophotography quality starfield
- Constellation effect: subtle, elegant, not garish
- Sleigh trail: physically plausible light behavior
- This is the FINAL IMAGE of the video`,

  /**
   * VIDEO PROMPT: Epic farewell sequence
   */
  videoPrompt: (childName: string) => `Epic finale: Santa's sleigh launches into the Christmas night, revealing ${childName}'s name written in the stars.

MOTION:
- Sleigh ROCKETS upward from snowy ground
- Golden light trail streams behind
- Reindeer in powerful galloping flight
- Camera follows upward, then settles on sky
- Stars rearrange to reveal child's name

SEQUENCE:
1. Ground level: Sleigh launches with explosive energy
2. Mid-sky: Sleigh arcs across frame trailing light
3. High sky: Sleigh becomes distant point of light
4. Stars: "${childName.toUpperCase()}" constellation reveals itself
5. Final: Sleigh light winks goodbye near the name

AUDIO CUES:
- Sleigh bells crescendo
- Whoosh of takeoff
- Wind rush
- Distant "Ho Ho Ho!"
- Magical chimes as name appears in stars
- Emotional orchestral finale

This is the TRIUMPHANT ENDING.
${childName}'s name written eternally in the stars.
There won't be a dry eye in the house.`,
}

// =============================================================================
// PRE-MADE SCENES (1, 2, 3, 7) - No Child Photo Required
// =============================================================================

export const SCENE_1_PROMPTS = {
  startKeyframe: `PHOTOREALISTIC KEYFRAME - Scene 1 Start: Above the Clouds

${CINEMATOGRAPHY.camera}
${CINEMATOGRAPHY.vfx}

POV: Flying above thick cloud layer, stars visible above.
Camera traveling FORWARD through space.
First glimpse of aurora borealis on horizon.
Sense of JOURNEY BEGINNING - we're going somewhere magical.

TECHNICAL:
- Cloudscape below: volumetric, lit by moonlight
- Stars above: realistic, subtle twinkle
- Aurora: ribbons of green/purple on horizon
- Speed lines: subtle motion blur at frame edges
- NO snow yet - we're too high

MOOD: Anticipation. Adventure begins. "Where are we going?"`,

  endKeyframe: `PHOTOREALISTIC KEYFRAME - Scene 1 End: Diving Through Clouds

${CINEMATOGRAPHY.camera}
${CINEMATOGRAPHY.vfx}

POV: Just broken through cloud layer, North Pole village visible below.
Speed lines intense - we're DIVING.
Aurora borealis surrounds us - ribbons of light whipping past.
North Pole: cluster of warm glowing buildings in snowy valley.

TECHNICAL:
- Cloud wisps streaming past camera
- Snow beginning (we've entered the atmosphere)
- Village: hundreds of tiny warm lights
- Aurora: filling frame with color
- Motion blur: extreme, roller-coaster energy

MOOD: EXHILARATION. "WOOOAH!" Arrival imminent.`,

  videoPrompt: `Thrilling POV dive through clouds to the North Pole.

Start: Serene above clouds, stars visible.
Middle: Dive THROUGH aurora borealis, speed intensifies.
End: Break through clouds, North Pole village revealed below.

MOTION: Roller-coaster energy. G-force implied.
AUDIO: Wind whoosh building, magical chimes, sleigh bells distant.
EMOTION: Pure exhilaration. The adventure has begun.`,
}

export const SCENE_2_PROMPTS = {
  startKeyframe: `PHOTOREALISTIC KEYFRAME - Scene 2 Start: Workshop Entry

${CINEMATOGRAPHY.camera}
${CINEMATOGRAPHY.lighting}
${WORKSHOP_INTERIOR.architecture}

POV entering through massive wooden doors into Santa's workshop.
Scale: ENORMOUS space, cathedral-like.
Activity: Hundreds of elves, flying toys, organized magical chaos.
First impression: overwhelming wonder.

ELEMENTS:
- Elves: 2-3 feet tall, pointed ears, colorful outfits
- Toys: teddy bears, trains, dolls - FLYING through space
- Conveyors: ribbons of wrapped presents moving
- Lights: thousands of warm bulbs, candles, magical orbs

TECHNICAL:
- Deep focus showing full depth of space
- Volumetric light from high windows
- Dust motes and magical particles
- Practical effects aesthetic - not CGI overload

MOOD: "WOW." Childhood dream made real.`,

  endKeyframe: `PHOTOREALISTIC KEYFRAME - Scene 2 End: Workshop Wonder

${CINEMATOGRAPHY.camera}
${CINEMATOGRAPHY.lighting}

COMPOSITION:
Low angle looking UP at the magical spectacle.
Toys EVERYWHERE - filling the frame.
Elves doing impossible acrobatics.
Pure sensory overload of Christmas magic.

ELEMENTS:
- Teddy bear flying directly toward camera (friendly)
- Elf doing backflip between workstations
- Conveyor of presents forms golden ribbon through space
- Giant candy canes as structural pillars
- Snow globes the size of beach balls, floating

TECHNICAL:
- Slightly wider lens for epic scope
- Lens flares from bright light sources
- Motion blur on fast-moving elements
- Warm color palette: gold, red, green, cream

MOOD: Pure JOY. "I want to stay here forever."`,

  videoPrompt: `Magical tour through Santa's workshop filled with wonder.

MOTION:
- Camera glides through the space like a tracking shot
- Toys fly past camera, barely missing
- Elves wave and do tricks
- Conveyors of presents curve through frame
- Everything is in coordinated magical motion

ATMOSPHERE: Organized chaos. Joy. Childhood dreams made real.
AUDIO: Workshop sounds, elf laughter, jingling, warm music.`,
}

export const SCENE_3_PROMPTS = {
  startKeyframe: `PHOTOREALISTIC KEYFRAME - Scene 3 Start: Book Summons

${CINEMATOGRAPHY.camera}
${CINEMATOGRAPHY.lighting}
${WORKSHOP_INTERIOR.architecture}
${WORKSHOP_INTERIOR.lighting_setup}
${SANTA_CHARACTER.face}
${SANTA_CHARACTER.costume}

COMPOSITION:
Santa in his private study, seated by fireplace.
He raises his hand in a magical gesture.
Across the room: ancient book begins to GLOW.

THE GESTURE:
- Santa's hand extended, fingers spread
- Subtle golden light around his fingertips
- Expression: knowing smile, playful magic
- He's done this thousands of times

THE BOOK:
- The Nice List - massive leather-bound tome
- Sitting on distant shelf
- Beginning to glow golden
- Not yet moving - power building

ATMOSPHERE:
- Fireplace crackling warmly
- Study filled with books, antiques
- Intimate space vs. grand workshop
- This is Santa's PRIVATE domain

MOOD: "He has POWERS." Magic is real.`,

  endKeyframe: `PHOTOREALISTIC KEYFRAME - Scene 3 End: Book Arrival

${CINEMATOGRAPHY.camera}
${CINEMATOGRAPHY.lighting}
${SANTA_CHARACTER.face}

COMPOSITION:
Book has flown across room, now in Santa's hands.
OPENED - golden light EXPLODES from pages.
Santa's face bathed in warm glow from below.

THE BOOK OPEN:
- Pages illuminated with inner light
- Golden particles rising from pages
- Text and images visible but glowing
- Light rays extend upward like sunrise

SANTA'S REACTION:
- Eyes wide with anticipation
- Warm smile - he knows something wonderful is coming
- Face lit dramatically from below (book glow)
- His white beard catches the golden light

ATMOSPHERE:
- Room now filled with golden light
- Shadows pushed back by the radiance
- Dust motes illuminated in light beams
- Magic has ARRIVED

MOOD: "Something AMAZING is about to happen."`,

  videoPrompt: `Santa uses telekinesis to summon his magical Nice List book.

SEQUENCE:
1. Santa raises hand - subtle power gesture
2. Book on distant shelf begins to glow
3. Book RISES and FLIES through the air
4. Trail of golden sparkles follows the book
5. Book lands gently in Santa's hands
6. Santa opens it - EXPLOSION of golden light

MOTION: Smooth, controlled, deliberate magic.
AUDIO: Magical hum building, whoosh of flight, golden shimmer, dramatic reveal.
EMOTION: Awe. "He really IS magic."`,
}

export const SCENE_7_PROMPTS = {
  startKeyframe: `PHOTOREALISTIC KEYFRAME - Scene 7 Start: Door Opens

${CINEMATOGRAPHY.camera}
${CINEMATOGRAPHY.lighting}
${SANTA_CHARACTER.face}
${SANTA_CHARACTER.costume}

COMPOSITION:
Interior shot - Santa walking toward large wooden doors.
Doors: ornate, carved with Christmas scenes.
Santa's hand reaching for the door handle.
Light leaking through the door crack - something magical outside.

THE SETUP:
- Santa in silhouette against the door
- Workshop warm glow behind him
- Mysterious light through door gaps
- Anticipation: what's out there?

ATMOSPHERE:
- Transition moment: interior to exterior
- Warm inside, cool promise outside
- Adventure awaits

MOOD: "Where is he going?" Anticipation building.`,

  endKeyframe: `PHOTOREALISTIC KEYFRAME - Scene 7 End: Sleigh Revealed

${CINEMATOGRAPHY.camera}
${CINEMATOGRAPHY.vfx}

COMPOSITION:
Santa in doorway, DOORS WIDE OPEN.
REVEAL: Magnificent sleigh and reindeer in snowy courtyard.
Epic scale - this is the HERO SHOT of the vehicle.

THE SLEIGH:
- Golden and red, baroque scrollwork
- Piled with presents, ribbons glowing
- Runners gleaming in moonlight
- Steam rising from runners (magical cold)

THE REINDEER:
- Eight majestic animals, plus Rudolph
- Rudolph's nose BLAZING red (practical light)
- Breath visible, pawing the snow
- Harnessed with ornate leather and brass bells

ENVIRONMENT:
- Snow-covered courtyard
- Elves making final preparations
- Northern lights in sky above
- Stars brilliant overhead
- Snow falling gently

LIGHTING:
- Interior warm light behind Santa
- Cool moonlight on exterior scene
- Rudolph's nose casts red glow on snow
- Sleigh has subtle golden glow

MOOD: "IT'S TIME." The grand adventure is about to begin.`,

  videoPrompt: `Grand reveal of Santa's sleigh and reindeer team.

SEQUENCE:
1. Santa walks purposefully to the door
2. Hand on ornate handle
3. Doors SWING OPEN dramatically
4. REVEAL: Magnificent sleigh, eight reindeer, Rudolph blazing
5. Elves wave and cheer
6. Reindeer snort and paw eagerly
7. Santa steps through into the Christmas night

CAMERA: Following Santa, then WIDE REVEAL of the spectacular scene.
AUDIO: Door creak, wind, sleigh bells, reindeer sounds, elf cheers.
EMOTION: "LET'S GO!" Pure excitement. Adventure awaits.`,
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

export type SceneNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8

export interface KeyframePrompts {
  startKeyframe: string
  endKeyframe: string
  videoPrompt: string
}

/**
 * Get prompts for a specific scene
 * Scenes 4, 5, 6, 8 require childName for personalization
 */
export function getScenePrompts(sceneNumber: SceneNumber, childName?: string): KeyframePrompts {
  switch (sceneNumber) {
    case 1:
      return {
        startKeyframe: SCENE_1_PROMPTS.startKeyframe,
        endKeyframe: SCENE_1_PROMPTS.endKeyframe,
        videoPrompt: SCENE_1_PROMPTS.videoPrompt,
      }
    case 2:
      return {
        startKeyframe: SCENE_2_PROMPTS.startKeyframe,
        endKeyframe: SCENE_2_PROMPTS.endKeyframe,
        videoPrompt: SCENE_2_PROMPTS.videoPrompt,
      }
    case 3:
      return {
        startKeyframe: SCENE_3_PROMPTS.startKeyframe,
        endKeyframe: SCENE_3_PROMPTS.endKeyframe,
        videoPrompt: SCENE_3_PROMPTS.videoPrompt,
      }
    case 4:
      if (!childName) throw new Error('Scene 4 requires childName')
      return {
        startKeyframe: SCENE_4_PROMPTS.startKeyframe(childName),
        endKeyframe: SCENE_4_PROMPTS.endKeyframe(childName),
        videoPrompt: SCENE_4_PROMPTS.videoPrompt(childName),
      }
    case 5:
      if (!childName) throw new Error('Scene 5 requires childName')
      return {
        startKeyframe: SCENE_5_PROMPTS.startKeyframe(childName),
        endKeyframe: SCENE_5_PROMPTS.endKeyframe(childName),
        videoPrompt: SCENE_5_PROMPTS.videoPrompt(childName),
      }
    case 6:
      if (!childName) throw new Error('Scene 6 requires childName')
      return {
        startKeyframe: SCENE_6_PROMPTS.startKeyframe(childName),
        endKeyframe: SCENE_6_PROMPTS.endKeyframe(childName),
        videoPrompt: SCENE_6_PROMPTS.videoPrompt(childName),
      }
    case 7:
      return {
        startKeyframe: SCENE_7_PROMPTS.startKeyframe,
        endKeyframe: SCENE_7_PROMPTS.endKeyframe,
        videoPrompt: SCENE_7_PROMPTS.videoPrompt,
      }
    case 8:
      if (!childName) throw new Error('Scene 8 requires childName')
      return {
        startKeyframe: SCENE_8_PROMPTS.startKeyframe(childName),
        endKeyframe: SCENE_8_PROMPTS.endKeyframe(childName),
        videoPrompt: SCENE_8_PROMPTS.videoPrompt(childName),
      }
    default:
      throw new Error(`Unknown scene number: ${sceneNumber}`)
  }
}

/**
 * Scenes that require child's photo as reference image
 * Scene 4: Photo in magical book (photo is hero)
 * Scene 6: Photo in Santa's hands (photo is hero)
 * NOT Scene 5: Just golden letters, no photo needed
 * NOT Scene 8: Name in stars, no photo needed
 */
export const SCENES_WITH_PHOTO_REFERENCE = [4, 6] as const

/**
 * Check if a scene should use child's photo as reference
 */
export function sceneUsesPhotoReference(sceneNumber: SceneNumber): boolean {
  return SCENES_WITH_PHOTO_REFERENCE.includes(sceneNumber as 4 | 6)
}
