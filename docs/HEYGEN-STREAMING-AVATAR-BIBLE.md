# HeyGen Streaming Avatar (LiveAvatar) Bible

> Comprehensive documentation for HeyGen's Streaming Avatar API & SDK - for real-time interactive avatar conversations.

**Last Updated:** 2024-11-30
**Product Name:** LiveAvatar (formerly Interactive Avatar)
**Use Case:** Live video calls with Santa - children can talk to Santa in real-time

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Pricing & Credits](#pricing--credits)
4. [Authentication](#authentication)
5. [REST API Endpoints](#rest-api-endpoints)
6. [Streaming Avatar SDK](#streaming-avatar-sdk)
7. [Session Management](#session-management)
8. [Voice Chat & Speech-to-Text](#voice-chat--speech-to-text)
9. [Knowledge Base & LLM Integration](#knowledge-base--llm-integration)
10. [Events & Callbacks](#events--callbacks)
11. [Best Practices](#best-practices)
12. [Code Examples](#code-examples)
13. [Santa Project Integration](#santa-project-integration)
14. [Troubleshooting](#troubleshooting)

---

## Overview

HeyGen's **Streaming Avatar** (now branded as **LiveAvatar**) enables **real-time, interactive video conversations** with AI avatars. Unlike the Video Generation API which creates pre-rendered videos, Streaming Avatar provides:

- **Sub-second latency** - Avatar responds in real-time
- **WebRTC streaming** - Live video/audio like a video call
- **Two-way interaction** - User speaks, avatar responds
- **LLM Integration** - Connect to ChatGPT or your own AI

### Key Characteristics

| Feature | Description |
|---------|-------------|
| **Type** | Real-time WebRTC streaming |
| **Latency** | <1 second |
| **Interaction** | Two-way (user ↔ avatar) |
| **Session Duration** | Up to 60 minutes |
| **Text Limit** | 1,000 characters per message |
| **Quality Options** | 720p (High), 480p (Medium), 360p (Low) |

### When to Use

- Live Santa video calls with children
- Virtual customer support
- Interactive e-learning
- Real-time sales demos
- AI companion applications

### Product Evolution

> **Note:** HeyGen is transitioning "Interactive Avatar" to "LiveAvatar" with its own dedicated platform. New integrations should use LiveAvatar.

---

## Architecture

### How Streaming Works

```
┌─────────────┐     WebRTC      ┌─────────────┐
│   Browser   │ ←─────────────→ │   HeyGen    │
│   Client    │   (Video/Audio) │   Server    │
└─────────────┘                 └─────────────┘
       │                               │
       │  User speaks                  │  Avatar speaks
       │  (microphone)                 │  (TTS)
       ↓                               ↓
┌─────────────┐                 ┌─────────────┐
│  Speech-to- │                 │    LLM      │
│    Text     │ ───────────────→│  (GPT-4o    │
│  (Deepgram) │   User's text   │   mini)     │
└─────────────┘                 └─────────────┘
```

### Components

1. **WebRTC Connection** - Low-latency video/audio streaming
2. **Speech-to-Text** - Converts user speech to text (Deepgram, Gladia, AssemblyAI)
3. **LLM** - Generates avatar responses (built-in GPT-4o mini or your own)
4. **Text-to-Speech** - Avatar speaks the response
5. **Avatar Rendering** - Real-time video of avatar speaking

---

## Pricing & Credits

### Credit Consumption

| Action | Cost |
|--------|------|
| **Active streaming session** | 0.2 credits/minute |
| **Minimum billing** | 30 seconds (0.1 credits) |
| **Billing increment** | 1 second |

### Cost Calculation

| Session Duration | Credits Used | Cost (Pro @ $0.99/credit) |
|-----------------|--------------|---------------------------|
| 30 seconds | 0.1 | $0.10 |
| 1 minute | 0.2 | $0.20 |
| 5 minutes | 1.0 | $0.99 |
| 10 minutes | 2.0 | $1.98 |
| 30 minutes | 6.0 | $5.94 |

### Equivalent Streaming Minutes per Plan

| Plan | Credits | Streaming Minutes |
|------|---------|-------------------|
| Free | 10 | 50 minutes |
| Pro ($99) | 100 | 500 minutes |
| Scale ($330) | 660 | 3,300 minutes |

### For Santa Project

**Estimated per "Talk to Santa" session:**
- Average session: 5-10 minutes
- Cost: 1-2 credits ($1-2 per session)
- 100 sessions/month: 100-200 credits

---

## Authentication

### Two-Step Authentication

1. **Server-side:** Use API key to create session token
2. **Client-side:** Use session token to connect

### Step 1: Create Session Token (Server)

```bash
curl -X POST "https://api.heygen.com/v1/streaming.create_token" \
  -H "X-Api-Key: YOUR_API_KEY"
```

**Response:**
```json
{
  "error": null,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Step 2: Use Token in SDK (Client)

```typescript
import StreamingAvatar from '@heygen/streaming-avatar';

const avatar = new StreamingAvatar({
  token: 'token_from_step_1'
});
```

### Important Token Rules

- **One token per session** - Generate a new token for each streaming session
- **Tokens are single-use** - Cannot reuse tokens across sessions
- **No expiration documented** - Generate tokens on-demand

---

## REST API Endpoints

### Session Management

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/streaming.create_token` | POST | Create session authentication token |
| `/v1/streaming.new` | POST | Start new streaming session |
| `/v1/streaming.task` | POST | Send text for avatar to speak |
| `/v1/streaming.stop` | POST | End streaming session |

### Avatar Discovery

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/v1/streaming.list` | GET | List available streaming avatars |

---

### Create New Session

```
POST https://api.heygen.com/v1/streaming.new
```

**Request Body:**
```json
{
  "quality": "high",
  "avatar_id": "avatar_id_here",
  "voice_id": "voice_id_here",
  "video_encoding": "H264",
  "voice": {
    "rate": 1.0,
    "emotion": "friendly"
  },
  "stt_settings": {
    "provider": "deepgram",
    "confidence": 0.6
  },
  "knowledge_base_id": "kb_123",
  "version": "v2",
  "disable_idle_timeout": false,
  "activity_idle_timeout": 300
}
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `quality` | string | "medium" | `"high"` (720p), `"medium"` (480p), `"low"` (360p) |
| `avatar_id` | string | - | Streaming avatar ID |
| `voice_id` | string | - | Voice for TTS |
| `video_encoding` | string | "VP8" | `"H264"` or `"VP8"` |
| `voice.rate` | float | 1.0 | Speech speed |
| `voice.emotion` | string | - | `"excited"`, `"serious"`, `"friendly"`, `"soothing"`, `"broadcaster"` |
| `stt_settings.provider` | string | "deepgram" | `"deepgram"`, `"gladia"`, `"assembly_ai"` |
| `stt_settings.confidence` | float | 0.6 | STT confidence threshold |
| `knowledge_base_id` | string | - | Knowledge base for LLM responses |
| `version` | string | - | Use `"v2"` for enhanced features |
| `disable_idle_timeout` | bool | false | Deprecated: use activity_idle_timeout |
| `activity_idle_timeout` | int | 120 | Idle timeout in seconds (30-3600) |

**Response:**
```json
{
  "data": {
    "session_id": "sess_abc123",
    "url": "wss://livekit.heygen.com/...",
    "access_token": "lk_token_...",
    "livekit_agent_token": "agent_token_...",
    "session_duration_limit": 3600
  }
}
```

---

### Send Task (Make Avatar Speak)

```
POST https://api.heygen.com/v1/streaming.task
```

**Request Body:**
```json
{
  "session_id": "sess_abc123",
  "text": "Hello! How can I help you today?",
  "task_type": "repeat",
  "task_mode": "async"
}
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `session_id` | string | Active session ID |
| `text` | string | Text for avatar to speak (max 1000 chars) |
| `task_type` | string | `"repeat"` (say exactly) or `"chat"` (LLM generates response) |
| `task_mode` | string | `"sync"` (wait) or `"async"` (non-blocking) |

**Response:**
```json
{
  "data": {
    "task_id": "task_xyz789",
    "duration_ms": 2500
  }
}
```

---

### Close Session

```
POST https://api.heygen.com/v1/streaming.stop
```

**Request Body:**
```json
{
  "session_id": "sess_abc123"
}
```

**Response:**
```json
{
  "data": {
    "status": "success"
  }
}
```

---

## Streaming Avatar SDK

### Installation

```bash
npm install @heygen/streaming-avatar livekit-client
```

### SDK Class: StreamingAvatar

```typescript
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
  TaskMode,
  VoiceEmotion
} from '@heygen/streaming-avatar';
```

### Configuration

```typescript
interface StreamingAvatarApiConfig {
  token: string;           // Session token from create_token endpoint
  basePath?: string;       // API URL (default: https://api.heygen.com)
}

const avatar = new StreamingAvatar({
  token: 'your_session_token'
});
```

### Start Session

```typescript
interface StartAvatarRequest {
  avatarName: string;           // Avatar ID
  quality: AvatarQuality;       // High, Medium, Low
  voice: VoiceSetting;          // Voice configuration
  knowledgeId?: string;         // Knowledge base ID
  knowledgeBase?: string;       // Custom system prompt
  sttSettings?: STTSettings;    // Speech-to-text config
  language?: string;            // Language code (e.g., "en", "pl")
  activityIdleTimeout?: number; // Idle timeout (30-3600 seconds)
}

const session = await avatar.createStartAvatar({
  avatarName: 'santa_avatar_id',
  quality: AvatarQuality.High,
  voice: {
    voiceId: 'santa_voice_id',
    rate: 1.0,
    emotion: VoiceEmotion.FRIENDLY
  },
  knowledgeBase: 'You are Santa Claus. Be warm, friendly, and magical.',
  language: 'en'
});
```

### Quality Levels

```typescript
enum AvatarQuality {
  High = 'high',     // 2000kbps, 720p
  Medium = 'medium', // 1000kbps, 480p
  Low = 'low'        // 500kbps, 360p
}
```

### Voice Emotions

```typescript
enum VoiceEmotion {
  EXCITED = 'excited',
  SERIOUS = 'serious',
  FRIENDLY = 'friendly',
  SOOTHING = 'soothing',
  BROADCASTER = 'broadcaster'
}
```

---

## Session Management

### Core Methods

| Method | Purpose |
|--------|---------|
| `createStartAvatar(config)` | Initialize and start session |
| `startSession()` | Start with existing config |
| `stopAvatar()` | End session |
| `speak(request)` | Make avatar speak |
| `interrupt()` | Stop current speech |

### Speak Request

```typescript
interface SpeakRequest {
  text: string;          // What to say
  taskType: TaskType;    // TALK or REPEAT
  taskMode?: TaskMode;   // SYNC or ASYNC
}

// REPEAT: Avatar says exactly what you send
await avatar.speak({
  text: 'Ho ho ho! Merry Christmas!',
  taskType: TaskType.REPEAT,
  taskMode: TaskMode.ASYNC
});

// TALK: LLM generates response based on your input
await avatar.speak({
  text: 'Tell me about the North Pole',
  taskType: TaskType.TALK
});
```

### Task Types

| Type | Description | Use Case |
|------|-------------|----------|
| `TaskType.REPEAT` | Avatar speaks exact text | You control the script via your own LLM |
| `TaskType.TALK` | Built-in LLM generates response | Use HeyGen's GPT-4o mini |

---

## Voice Chat & Speech-to-Text

### Enable Voice Chat

```typescript
// Start voice chat (user can speak to avatar)
await avatar.startVoiceChat({
  useSilencePrompt: true,     // Avatar speaks when user is silent
  isInputAudioMuted: false    // User microphone enabled
});

// Stop voice chat
await avatar.closeVoiceChat();
```

### Listening Control

```typescript
// Start listening to user
await avatar.startListening();

// Stop listening
await avatar.stopListening();
```

### STT Providers

| Provider | Description |
|----------|-------------|
| `deepgram` | Default, good accuracy |
| `gladia` | Alternative option |
| `assembly_ai` | AssemblyAI integration |

### STT Configuration

```typescript
const session = await avatar.createStartAvatar({
  // ...other config
  sttSettings: {
    provider: 'deepgram',
    confidence: 0.6  // Minimum confidence threshold (0-1)
  }
});
```

---

## Knowledge Base & LLM Integration

### Option 1: HeyGen's Built-in LLM (GPT-4o mini)

Use `knowledgeBase` to provide a system prompt:

```typescript
const session = await avatar.createStartAvatar({
  avatarName: 'santa_id',
  quality: AvatarQuality.High,
  knowledgeBase: `
    You are Santa Claus, speaking to children.

    Personality:
    - Warm, jolly, and magical
    - Always positive and encouraging
    - Love hearing about children's wishes
    - Speak about the North Pole, elves, and reindeer

    Rules:
    - Keep responses under 100 words
    - Never discuss anything inappropriate
    - If asked about presents, say you're checking the list
    - Always end with "Ho ho ho!"
  `
});

// Now use TALK task type - LLM will respond
await avatar.speak({
  text: "What's it like at the North Pole?",
  taskType: TaskType.TALK
});
```

### Option 2: Your Own LLM (Recommended for Production)

Use `REPEAT` task type with your own LLM:

```typescript
// 1. User speaks → STT converts to text
avatar.on(StreamingEvents.USER_END_MESSAGE, async (event) => {
  const userText = event.message;

  // 2. Send to your LLM (OpenAI, Anthropic, etc.)
  const santaResponse = await callYourLLM(userText);

  // 3. Avatar speaks the response
  await avatar.speak({
    text: santaResponse,
    taskType: TaskType.REPEAT
  });
});

async function callYourLLM(userMessage: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: 'You are Santa Claus...' },
      { role: 'user', content: userMessage }
    ]
  });
  return response.choices[0].message.content;
}
```

### Option 3: Pre-configured Knowledge Base ID

```typescript
// Create knowledge base in HeyGen dashboard first
const session = await avatar.createStartAvatar({
  avatarName: 'santa_id',
  knowledgeId: 'kb_your_knowledge_base_id'
});
```

---

## Events & Callbacks

### Event Types

```typescript
enum StreamingEvents {
  // Avatar events
  AVATAR_START_TALKING = 'avatar_start_talking',
  AVATAR_STOP_TALKING = 'avatar_stop_talking',
  AVATAR_TALKING_MESSAGE = 'avatar_talking_message',
  AVATAR_END_MESSAGE = 'avatar_end_message',

  // User events
  USER_START = 'user_start',
  USER_STOP = 'user_stop',
  USER_TALKING_MESSAGE = 'user_talking_message',
  USER_END_MESSAGE = 'user_end_message',
  USER_SILENCE = 'user_silence',

  // Connection events
  STREAM_READY = 'stream_ready',
  STREAM_DISCONNECTED = 'stream_disconnected'
}
```

### Registering Event Handlers

```typescript
// Avatar started speaking
avatar.on(StreamingEvents.AVATAR_START_TALKING, (event) => {
  console.log('Avatar is speaking...');
  disableUserMicrophone();
});

// Avatar finished speaking
avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (event) => {
  console.log('Avatar finished speaking');
  enableUserMicrophone();
});

// User finished speaking (STT complete)
avatar.on(StreamingEvents.USER_END_MESSAGE, (event) => {
  console.log('User said:', event.message);
  processUserInput(event.message);
});

// User is silent
avatar.on(StreamingEvents.USER_SILENCE, (event) => {
  // Optionally prompt user
  avatar.speak({
    text: "Are you still there?",
    taskType: TaskType.REPEAT
  });
});

// Stream ready
avatar.on(StreamingEvents.STREAM_READY, (event) => {
  console.log('Video stream is ready!');
  showVideoElement();
});

// Disconnected
avatar.on(StreamingEvents.STREAM_DISCONNECTED, (event) => {
  console.log('Stream disconnected');
  handleDisconnection();
});
```

### Unregistering Events

```typescript
const handler = (event) => console.log(event);
avatar.on(StreamingEvents.AVATAR_START_TALKING, handler);

// Later...
avatar.off(StreamingEvents.AVATAR_START_TALKING, handler);
```

---

## Best Practices

### 1. Session Management

```typescript
// Always clean up sessions
async function endCall() {
  try {
    await avatar.stopAvatar();
  } catch (error) {
    console.error('Error stopping avatar:', error);
  } finally {
    // Clean up UI regardless
    hideVideoElement();
    resetState();
  }
}

// Handle page unload
window.addEventListener('beforeunload', () => {
  avatar.stopAvatar();
});
```

### 2. Token Management

```typescript
// Generate fresh token for each session
async function startNewSession() {
  // Server-side: Get new token
  const tokenResponse = await fetch('/api/heygen/token');
  const { token } = await tokenResponse.json();

  // Client-side: Use token
  const avatar = new StreamingAvatar({ token });
  await avatar.createStartAvatar(config);
}
```

### 3. Error Handling

```typescript
try {
  await avatar.createStartAvatar(config);
} catch (error) {
  if (error.code === 'insufficient_credits') {
    showUpgradePrompt();
  } else if (error.code === 'session_limit_exceeded') {
    showBusyMessage();
  } else {
    showGenericError();
  }
}
```

### 4. Quality Based on Connection

```typescript
async function selectQuality(): Promise<AvatarQuality> {
  const connection = navigator.connection;

  if (connection?.downlink > 5) {
    return AvatarQuality.High;
  } else if (connection?.downlink > 2) {
    return AvatarQuality.Medium;
  } else {
    return AvatarQuality.Low;
  }
}
```

### 5. Conversation Flow

```typescript
// Prevent overlapping speech
let isAvatarSpeaking = false;

avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
  isAvatarSpeaking = true;
});

avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
  isAvatarSpeaking = false;
});

async function sendResponse(text: string) {
  if (isAvatarSpeaking) {
    await avatar.interrupt();
  }
  await avatar.speak({ text, taskType: TaskType.REPEAT });
}
```

---

## Code Examples

### Complete React Integration

```tsx
// components/SantaVideoCall.tsx
import React, { useEffect, useRef, useState } from 'react';
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
  VoiceEmotion
} from '@heygen/streaming-avatar';

interface SantaVideoCallProps {
  childName: string;
  onEnd: () => void;
}

export function SantaVideoCall({ childName, onEnd }: SantaVideoCallProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const avatarRef = useRef<StreamingAvatar | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    startSession();
    return () => endSession();
  }, []);

  async function startSession() {
    try {
      // 1. Get token from your server
      const res = await fetch('/api/heygen/token');
      const { token } = await res.json();

      // 2. Initialize SDK
      const avatar = new StreamingAvatar({ token });
      avatarRef.current = avatar;

      // 3. Set up event handlers
      avatar.on(StreamingEvents.STREAM_READY, () => {
        setIsConnected(true);
      });

      avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
        setIsSpeaking(true);
      });

      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        setIsSpeaking(false);
      });

      avatar.on(StreamingEvents.USER_END_MESSAGE, async (event) => {
        // Process user speech with your LLM
        const response = await generateSantaResponse(event.message, childName);
        await avatar.speak({
          text: response,
          taskType: TaskType.REPEAT
        });
      });

      // 4. Start avatar session
      const session = await avatar.createStartAvatar({
        avatarName: process.env.NEXT_PUBLIC_SANTA_AVATAR_ID!,
        quality: AvatarQuality.High,
        voice: {
          voiceId: process.env.NEXT_PUBLIC_SANTA_VOICE_ID!,
          rate: 0.95,
          emotion: VoiceEmotion.FRIENDLY
        },
        language: 'en'
      });

      // 5. Attach video stream
      if (videoRef.current && session.mediaStream) {
        videoRef.current.srcObject = session.mediaStream;
      }

      // 6. Start voice chat
      await avatar.startVoiceChat({
        useSilencePrompt: false,
        isInputAudioMuted: false
      });

      // 7. Santa greets the child
      await avatar.speak({
        text: `Ho ho ho! Hello ${childName}! It's so wonderful to see you! How are you doing today?`,
        taskType: TaskType.REPEAT
      });

    } catch (error) {
      console.error('Failed to start session:', error);
    }
  }

  async function endSession() {
    if (avatarRef.current) {
      try {
        await avatarRef.current.stopAvatar();
      } catch (e) {
        console.error('Error ending session:', e);
      }
    }
    onEnd();
  }

  async function generateSantaResponse(userMessage: string, childName: string): Promise<string> {
    const res = await fetch('/api/santa-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage, childName })
    });
    const { response } = await res.json();
    return response;
  }

  return (
    <div className="santa-video-call">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full rounded-lg"
      />

      <div className="controls mt-4 flex gap-4">
        <div className={`status ${isConnected ? 'connected' : 'connecting'}`}>
          {isConnected ? 'Connected' : 'Connecting...'}
        </div>

        {isSpeaking && (
          <div className="speaking-indicator">
            Santa is speaking...
          </div>
        )}

        <button
          onClick={endSession}
          className="btn-end-call"
        >
          End Call
        </button>
      </div>
    </div>
  );
}
```

### Server-Side Token Endpoint

```typescript
// app/api/heygen/token/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.heygen.com/v1/streaming.create_token', {
      method: 'POST',
      headers: {
        'X-Api-Key': process.env.HEYGEN_API_KEY!
      }
    });

    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    return NextResponse.json({ token: data.data.token });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create token' },
      { status: 500 }
    );
  }
}
```

### Santa Chat LLM Endpoint

```typescript
// app/api/santa-chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SANTA_SYSTEM_PROMPT = `
You are Santa Claus having a video call with a child.

Personality:
- Warm, jolly, and magical
- Full of "Ho ho ho!" laughter
- Patient and kind with children
- Loves to hear about their wishes and good deeds

Guidelines:
- Keep responses short (2-3 sentences max)
- Ask follow-up questions to keep conversation going
- If they ask about presents, say you're checking the Nice List
- Mention the North Pole, elves, Mrs. Claus, and reindeer naturally
- If they say something inappropriate, gently redirect
- Always be encouraging and positive
- End with something magical or exciting

Never:
- Make promises about specific gifts
- Discuss anything inappropriate
- Break character
`;

export async function POST(request: NextRequest) {
  try {
    const { message, childName } = await request.json();

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SANTA_SYSTEM_PROMPT },
        { role: 'system', content: `The child's name is ${childName}.` },
        { role: 'user', content: message }
      ],
      max_tokens: 150,
      temperature: 0.8
    });

    const response = completion.choices[0].message.content;

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Santa chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
```

---

## Santa Project Integration

### Feature: "Talk to Santa" Live Video Call

#### User Flow

1. User purchases "Talk to Santa" add-on ($X extra)
2. Schedules a time slot (to manage concurrent sessions)
3. At scheduled time, clicks "Start Call"
4. WebRTC connection establishes
5. Santa greets child by name
6. 5-10 minute conversation
7. Call ends with Santa's goodbye

#### Implementation Plan

```
src/
├── app/
│   ├── api/
│   │   ├── heygen/
│   │   │   └── token/route.ts      # Token generation
│   │   └── santa-chat/route.ts     # LLM endpoint
│   └── call/
│       └── [orderId]/page.tsx      # Video call page
├── components/
│   ├── SantaVideoCall.tsx          # Main call component
│   └── CallScheduler.tsx           # Booking UI
└── lib/
    └── heygen-streaming.ts         # SDK wrapper
```

#### Environment Variables

```env
# HeyGen Streaming
HEYGEN_API_KEY=your_api_key
NEXT_PUBLIC_SANTA_AVATAR_ID=avatar_id_for_streaming
NEXT_PUBLIC_SANTA_VOICE_ID=voice_id_for_streaming

# OpenAI for Santa chat
OPENAI_API_KEY=your_openai_key
```

#### Database Schema Addition

```sql
-- Add to existing orders table or create new
ALTER TABLE orders ADD COLUMN includes_live_call BOOLEAN DEFAULT FALSE;
ALTER TABLE orders ADD COLUMN call_scheduled_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN call_completed_at TIMESTAMP;
ALTER TABLE orders ADD COLUMN call_duration_seconds INTEGER;

-- Track active sessions to manage concurrency
CREATE TABLE live_call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id),
  session_id TEXT,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  credits_used DECIMAL(10,2)
);
```

#### Cost Considerations

| Sessions/Month | Avg Duration | Credits Needed | Plan Required |
|----------------|--------------|----------------|---------------|
| 50 | 5 min | 50 | Free (barely) |
| 100 | 5 min | 100 | Pro ($99) |
| 200 | 5 min | 200 | Scale ($330) |
| 500 | 5 min | 500 | Scale ($330) |

---

## Troubleshooting

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| No video showing | Stream not attached | Check `videoRef.srcObject = session.mediaStream` |
| Audio echo | Microphone feedback | Use headphones or implement echo cancellation |
| High latency | Poor connection | Reduce quality to Medium or Low |
| Session drops | Idle timeout | Set `activityIdleTimeout` higher |
| Avatar not responding | Wrong task type | Use `TaskType.REPEAT` for custom LLM |
| STT not working | Permission denied | Request microphone permission |

### Debug Mode

```typescript
const avatar = new StreamingAvatar({
  token: 'your_token',
  debug: true  // Enables console logging
});
```

### Check Session Status

```typescript
avatar.on(StreamingEvents.STREAM_DISCONNECTED, (event) => {
  console.log('Disconnect reason:', event.reason);

  if (event.reason === 'idle_timeout') {
    // Session expired due to inactivity
  } else if (event.reason === 'credits_exhausted') {
    // Out of credits
  } else if (event.reason === 'network_error') {
    // Connection lost
  }
});
```

---

## Resources

- [Streaming Avatar SDK Documentation](https://docs.heygen.com/docs/streaming-avatar-sdk)
- [SDK API Reference](https://docs.heygen.com/docs/streaming-avatar-sdk-reference)
- [Interactive Avatar Demo (GitHub)](https://github.com/HeyGen-Official/InteractiveAvatarNextJSDemo)
- [HeyGen Labs - Create Avatars](https://labs.heygen.com/interactive-avatar)
- [LiveAvatar Website](https://www.heygen.com/interactive-avatar)
- [API Limits & Pricing](https://docs.heygen.com/reference/limits)

---

## Changelog

| Date | Changes |
|------|---------|
| 2024-11-30 | Initial comprehensive documentation |
