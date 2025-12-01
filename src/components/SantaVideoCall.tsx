'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import StreamingAvatar, {
  AvatarQuality,
  StreamingEvents,
  TaskType,
  TaskMode,
  VoiceEmotion,
} from '@heygen/streaming-avatar'
import { Child, SantaConversationContext } from '@/types/database'

interface SantaVideoCallProps {
  childName: string
  childId?: string // Optional: for full personalization
  childAge?: number
  onEnd: () => void
  onError?: (error: string) => void
}

type ConnectionState = 'idle' | 'preparing' | 'connecting' | 'connected' | 'error' | 'ended'

interface ConversationMessage {
  role: 'user' | 'santa'
  content: string
  timestamp: Date
}

interface PersonalizationData {
  child: Child | null
  context: SantaConversationContext | null
  story: string | null
}

export function SantaVideoCall({ childName, childId, childAge, onEnd, onError }: SantaVideoCallProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const avatarRef = useRef<StreamingAvatar | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [conversation, setConversation] = useState<ConversationMessage[]>([])
  const [sessionDuration, setSessionDuration] = useState(0)
  const [preparationStatus, setPreparationStatus] = useState<string>('')
  const sessionStartRef = useRef<Date | null>(null)
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Personalization data
  const personalizationRef = useRef<PersonalizationData>({
    child: null,
    context: null,
    story: null,
  })

  // Prepare child before call (generate story + context)
  const prepareChild = useCallback(async (): Promise<boolean> => {
    if (!childId) {
      console.log('No childId provided, using basic personalization')
      return true // Continue without full personalization
    }

    try {
      setPreparationStatus('Przygotowuję magiczną rozmowę...')

      // Fetch child data and prepare personalization
      const res = await fetch('/api/prepare-santa-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ childId }),
      })

      if (!res.ok) {
        console.warn('Failed to prepare child, continuing without full personalization')
        return true
      }

      const data = await res.json()

      if (data.success) {
        // Also fetch full child data
        const childRes = await fetch(`/api/children/${childId}`)
        if (childRes.ok) {
          const childData = await childRes.json()
          personalizationRef.current.child = childData.child
        }

        personalizationRef.current.context = data.context
        personalizationRef.current.story = data.story

        console.log('Personalization prepared:', {
          hasChild: !!personalizationRef.current.child,
          hasContext: !!personalizationRef.current.context,
          hasStory: !!personalizationRef.current.story,
          cached: data.cached,
        })

        setPreparationStatus(data.cached ? 'Gotowe!' : 'Bajka przygotowana!')
      }

      return true
    } catch (error) {
      console.error('Error preparing child:', error)
      return true // Continue anyway
    }
  }, [childId])

  // Generate Santa's response using our LLM endpoint with personalization
  const generateSantaResponse = useCallback(async (userMessage: string): Promise<string> => {
    try {
      const { child, context, story } = personalizationRef.current

      const res = await fetch('/api/santa-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          childName,
          childAge,
          conversationHistory: conversation.map(msg => ({
            role: msg.role === 'santa' ? 'model' : 'user',
            content: msg.content,
          })),
          // Rich personalization if available
          child,
          context,
          story,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to get Santa response')
      }

      const { response, personalized } = await res.json()
      console.log('Santa response:', { personalized, length: response.length })
      return response
    } catch (error) {
      console.error('Error generating Santa response:', error)
      return 'Ho ho ho! Przepraszam, ale trochę się zacina połączenie. Czy możesz powtórzyć?'
    }
  }, [childName, childAge, conversation])

  // Get the initial greeting (personalized or default)
  const getInitialGreeting = useCallback((): string => {
    const { context } = personalizationRef.current

    if (context?.personalizedGreeting) {
      return context.personalizedGreeting
    }

    return `Ho ho ho! Cześć ${childName}! Tak się cieszę, że do mnie zadzwoniłeś! Jak się masz?`
  }, [childName])

  // Start the streaming session
  const startSession = useCallback(async () => {
    try {
      setConnectionState('preparing')
      setErrorMessage(null)

      // 0. Prepare personalization (generate story + context)
      await prepareChild()

      setConnectionState('connecting')
      setPreparationStatus('Łączę z Biegunem Północnym...')

      // 1. Get session token from our API
      const tokenRes = await fetch('/api/heygen/token', { method: 'POST' })
      if (!tokenRes.ok) {
        throw new Error('Failed to get session token')
      }
      const { token } = await tokenRes.json()

      // 2. Initialize the SDK
      const avatar = new StreamingAvatar({ token })
      avatarRef.current = avatar

      // 3. Set up event handlers
      avatar.on(StreamingEvents.STREAM_READY, () => {
        console.log('Stream ready!')
        setConnectionState('connected')
        sessionStartRef.current = new Date()

        // Start duration timer
        durationIntervalRef.current = setInterval(() => {
          if (sessionStartRef.current) {
            const elapsed = Math.floor((Date.now() - sessionStartRef.current.getTime()) / 1000)
            setSessionDuration(elapsed)
          }
        }, 1000)
      })

      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log('Stream disconnected')
        setConnectionState('ended')
        if (durationIntervalRef.current) {
          clearInterval(durationIntervalRef.current)
        }
      })

      avatar.on(StreamingEvents.AVATAR_START_TALKING, () => {
        setIsSpeaking(true)
        setIsListening(false)
      })

      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, () => {
        setIsSpeaking(false)
        // Re-enable listening after Santa stops talking
        setIsListening(true)
      })

      avatar.on(StreamingEvents.USER_START, () => {
        setIsListening(true)
      })

      avatar.on(StreamingEvents.USER_STOP, () => {
        setIsListening(false)
      })

      // Handle user's transcribed speech
      avatar.on(StreamingEvents.USER_END_MESSAGE, async (event: { message: string }) => {
        const userMessage = event.message
        console.log('User said:', userMessage)

        // Add user message to conversation
        setConversation(prev => [...prev, {
          role: 'user',
          content: userMessage,
          timestamp: new Date(),
        }])

        // Generate and speak Santa's response
        const santaResponse = await generateSantaResponse(userMessage)

        // Add Santa's response to conversation
        setConversation(prev => [...prev, {
          role: 'santa',
          content: santaResponse,
          timestamp: new Date(),
        }])

        // Make avatar speak the response
        await avatar.speak({
          text: santaResponse,
          taskType: TaskType.REPEAT,
          taskMode: TaskMode.ASYNC,
        })
      })

      // 4. Start the avatar session
      const avatarId = process.env.NEXT_PUBLIC_SANTA_AVATAR_ID

      if (!avatarId) {
        throw new Error('Santa avatar ID not configured')
      }

      // Use avatar's built-in voice with Polish language setting
      // Optional: NEXT_PUBLIC_SANTA_VOICE_ID can override the default voice
      const voiceId = process.env.NEXT_PUBLIC_SANTA_VOICE_ID

      await avatar.createStartAvatar({
        avatarName: avatarId,
        quality: AvatarQuality.High,
        voice: voiceId ? {
          voiceId: voiceId,
          rate: 0.95,
          emotion: VoiceEmotion.FRIENDLY,
        } : {
          rate: 0.95,
          emotion: VoiceEmotion.FRIENDLY,
        },
        language: 'pl', // Polish language
      })

      // 5. Attach video stream to the video element
      // The mediaStream is available on the avatar instance after session starts
      if (videoRef.current && avatar.mediaStream) {
        videoRef.current.srcObject = avatar.mediaStream
        await videoRef.current.play()
      }

      // 6. Start voice chat (enables microphone)
      await avatar.startVoiceChat({
        isInputAudioMuted: false,
      })

      // 7. Santa greets the child with personalized greeting!
      const greeting = getInitialGreeting()
      setConversation([{
        role: 'santa',
        content: greeting,
        timestamp: new Date(),
      }])

      await avatar.speak({
        text: greeting,
        taskType: TaskType.REPEAT,
        taskMode: TaskMode.ASYNC,
      })

    } catch (error) {
      console.error('Failed to start session:', error)
      setConnectionState('error')
      const msg = error instanceof Error ? error.message : 'Failed to connect'
      setErrorMessage(msg)
      onError?.(msg)
    }
  }, [childName, prepareChild, generateSantaResponse, getInitialGreeting, onError])

  // End the session
  const endSession = useCallback(async () => {
    if (avatarRef.current) {
      try {
        // Say goodbye first
        await avatarRef.current.speak({
          text: `Do widzenia ${childName}! Wesołych Świąt! Ho ho ho!`,
          taskType: TaskType.REPEAT,
        })

        // Wait a moment for goodbye, then disconnect
        setTimeout(async () => {
          await avatarRef.current?.stopAvatar()
          avatarRef.current = null
        }, 3000)
      } catch (error) {
        console.error('Error ending session:', error)
      }
    }

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current)
    }

    setConnectionState('ended')
    onEnd()
  }, [childName, onEnd])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (avatarRef.current) {
        avatarRef.current.stopAvatar().catch(console.error)
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current)
      }
    }
  }, [])

  // Format duration as MM:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="santa-video-call flex flex-col items-center">
      {/* Video Container */}
      <div className="relative w-full max-w-3xl aspect-video bg-black rounded-2xl overflow-hidden border-4 border-christmas-gold/30">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />

        {/* Connection Overlay */}
        {connectionState === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <div className="text-6xl mb-4">🎅</div>
            <h2 className="text-2xl font-bold text-christmas-gold mb-4">
              Rozmowa ze Świętym Mikołajem
            </h2>
            <p className="text-white/70 mb-6 text-center max-w-md">
              {childName}, Mikołaj czeka na Twoją rozmowę!<br />
              Upewnij się, że masz włączony mikrofon.
            </p>
            <button
              onClick={startSession}
              className="btn-christmas text-lg px-8 py-4"
            >
              Zadzwoń do Mikołaja 📞
            </button>
          </div>
        )}

        {connectionState === 'preparing' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <div className="text-6xl mb-4 animate-pulse">✨</div>
            <p className="text-white text-xl">{preparationStatus || 'Przygotowuję magię...'}</p>
            <p className="text-white/60 mt-2 text-sm">Mikołaj przygotowuje dla Ciebie specjalną bajkę!</p>
          </div>
        )}

        {connectionState === 'connecting' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <div className="text-6xl mb-4 animate-bounce">🎅</div>
            <p className="text-white text-xl">Łączenie z Biegunem Północnym...</p>
            <div className="mt-4 w-48 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-christmas-gold animate-pulse" style={{ width: '60%' }} />
            </div>
          </div>
        )}

        {connectionState === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <div className="text-6xl mb-4">❄️</div>
            <p className="text-christmas-red text-xl mb-2">Błąd połączenia</p>
            <p className="text-white/70 mb-4">{errorMessage}</p>
            <button
              onClick={startSession}
              className="btn-christmas"
            >
              Spróbuj ponownie
            </button>
          </div>
        )}

        {connectionState === 'ended' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80">
            <div className="text-6xl mb-4">🎄</div>
            <h2 className="text-2xl font-bold text-christmas-gold mb-4">
              Wesołych Świąt, {childName}!
            </h2>
            <p className="text-white/70 mb-2">Rozmowa zakończona</p>
            <p className="text-white/50 text-sm">Czas rozmowy: {formatDuration(sessionDuration)}</p>
          </div>
        )}

        {/* Status Indicators */}
        {connectionState === 'connected' && (
          <>
            {/* Duration Timer */}
            <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full text-white text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              {formatDuration(sessionDuration)}
            </div>

            {/* Personalized indicator */}
            {personalizationRef.current.context && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-christmas-green/80 px-3 py-1 rounded-full text-white text-xs">
                ✨ Spersonalizowana rozmowa
              </div>
            )}

            {/* Speaking Indicator */}
            {isSpeaking && (
              <div className="absolute top-4 right-4 bg-christmas-gold/80 px-3 py-1 rounded-full text-black text-sm font-medium">
                🎅 Mikołaj mówi...
              </div>
            )}

            {/* Listening Indicator */}
            {isListening && !isSpeaking && (
              <div className="absolute top-4 right-4 bg-christmas-green/80 px-3 py-1 rounded-full text-white text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Mikołaj słucha...
              </div>
            )}
          </>
        )}
      </div>

      {/* Controls */}
      {connectionState === 'connected' && (
        <div className="mt-6 flex items-center gap-4">
          <button
            onClick={endSession}
            className="bg-christmas-red hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2"
          >
            <span>📞</span> Zakończ rozmowę
          </button>
        </div>
      )}

      {/* Conversation Log (optional, for debugging/demo) */}
      {conversation.length > 0 && connectionState === 'connected' && (
        <div className="mt-6 w-full max-w-3xl">
          <h3 className="text-white/60 text-sm mb-2">Rozmowa:</h3>
          <div className="bg-black/40 rounded-xl p-4 max-h-40 overflow-y-auto space-y-2">
            {conversation.slice(-6).map((msg, i) => (
              <div
                key={i}
                className={`text-sm ${msg.role === 'santa' ? 'text-christmas-gold' : 'text-white/80'}`}
              >
                <span className="font-medium">
                  {msg.role === 'santa' ? '🎅 Mikołaj: ' : '👤 ' + childName + ': '}
                </span>
                {msg.content}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default SantaVideoCall
