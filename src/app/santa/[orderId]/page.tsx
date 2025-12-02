'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'

type ContactMode = 'home' | 'chat' | 'call' | 'video' | 'inbox'

interface Message {
  id: string
  role: 'santa' | 'child'
  content: string
  timestamp: Date
}

interface ChildData {
  name: string
  age: number
  orderId: string
}

export default function SantaHotlinePage() {
  const params = useParams()
  const orderId = params.orderId as string

  const [mode, setMode] = useState<ContactMode>('home')
  const [childData, setChildData] = useState<ChildData | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [callActive, setCallActive] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Load child data
  useEffect(() => {
    async function loadChildData() {
      try {
        const res = await fetch(`/api/santa-hotline/child?orderId=${orderId}`)
        if (res.ok) {
          const data = await res.json()
          setChildData(data)
        }
      } catch (err) {
        console.error('Failed to load child data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadChildData()
  }, [orderId])

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Send chat message
  const sendMessage = async () => {
    if (!inputText.trim() || isSending) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'child',
      content: inputText.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setIsSending(true)

    try {
      const res = await fetch('/api/santa-hotline/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          message: userMessage.content,
          history: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      })

      const data = await res.json()

      const santaMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'santa',
        content: data.response || 'Ho ho ho! Something went wrong...',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, santaMessage])
    } catch (err) {
      console.error('Chat error:', err)
    } finally {
      setIsSending(false)
    }
  }

  // Start audio call
  const startCall = async () => {
    setCallActive(true)
    setMode('call')

    try {
      const res = await fetch('/api/santa-hotline/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          text: `Ho ho ho! Hello ${childData?.name || 'my dear child'}! This is Santa! I'm so happy you called me! How are you doing?`,
        }),
      })

      if (res.ok) {
        const audioBlob = await res.blob()
        const audioUrl = URL.createObjectURL(audioBlob)
        if (audioRef.current) {
          audioRef.current.src = audioUrl
          audioRef.current.play()
          setIsPlaying(true)
        }
      }
    } catch (err) {
      console.error('Call error:', err)
    }
  }

  const endCall = () => {
    setCallActive(false)
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setMode('home')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-green-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎅</div>
          <p className="text-white text-xl">Connecting to the North Pole...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-900 via-red-800 to-green-900">
      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />

      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm p-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎅</span>
            <div>
              <h1 className="text-white font-bold">Santa Hotline</h1>
              <p className="text-green-300 text-xs">
                {childData ? `Hi, ${childData.name}!` : 'Connected to the North Pole'}
              </p>
            </div>
          </div>
          {mode !== 'home' && (
            <button
              onClick={() => setMode('home')}
              className="text-white/70 hover:text-white"
            >
              ← Back
            </button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto p-4 pb-24">
        {/* HOME MODE */}
        {mode === 'home' && (
          <div className="space-y-4">
            {/* Welcome */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-6xl mb-4">🎄</div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Hello{childData ? `, ${childData.name}` : ''}!
              </h2>
              <p className="text-white/80">
                Santa is waiting for your message!
              </p>
            </div>

            {/* Contact Options */}
            <div className="grid grid-cols-2 gap-4">
              {/* Chat */}
              <button
                onClick={() => setMode('chat')}
                className="bg-green-600 hover:bg-green-500 rounded-2xl p-6 text-center transition-all hover:scale-105 active:scale-95"
              >
                <div className="text-4xl mb-2">💬</div>
                <h3 className="text-white font-bold">Message</h3>
                <p className="text-white/70 text-xs mt-1">Chat with Santa</p>
              </button>

              {/* Call */}
              <button
                onClick={startCall}
                className="bg-red-600 hover:bg-red-500 rounded-2xl p-6 text-center transition-all hover:scale-105 active:scale-95"
              >
                <div className="text-4xl mb-2">📞</div>
                <h3 className="text-white font-bold">Call</h3>
                <p className="text-white/70 text-xs mt-1">Hear Santa</p>
              </button>

              {/* Video Messages */}
              <button
                onClick={() => setMode('video')}
                className="bg-purple-600 hover:bg-purple-500 rounded-2xl p-6 text-center transition-all hover:scale-105 active:scale-95"
              >
                <div className="text-4xl mb-2">🎬</div>
                <h3 className="text-white font-bold">Watch</h3>
                <p className="text-white/70 text-xs mt-1">Video from Santa</p>
              </button>

              {/* Inbox */}
              <button
                onClick={() => setMode('inbox')}
                className="bg-yellow-600 hover:bg-yellow-500 rounded-2xl p-6 text-center transition-all hover:scale-105 active:scale-95"
              >
                <div className="text-4xl mb-2">📬</div>
                <h3 className="text-white font-bold">Inbox</h3>
                <p className="text-white/70 text-xs mt-1">Messages</p>
              </button>
            </div>

            {/* Christmas Countdown */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <p className="text-white/70 text-sm">Until Christmas Eve:</p>
              <ChristmasCountdown />
            </div>
          </div>
        )}

        {/* CHAT MODE */}
        {mode === 'chat' && (
          <div className="flex flex-col h-[calc(100vh-180px)]">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.length === 0 && (
                <div className="text-center text-white/50 py-8">
                  <div className="text-4xl mb-2">💬</div>
                  <p>Write to Santa!</p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'child' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'child'
                        ? 'bg-green-600 text-white'
                        : 'bg-white/90 text-gray-800'
                    }`}
                  >
                    {msg.role === 'santa' && (
                      <span className="text-lg mr-1">🎅</span>
                    )}
                    {msg.content}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-white/90 rounded-2xl px-4 py-3">
                    <span className="text-lg mr-1">🎅</span>
                    <span className="animate-pulse">Santa is typing...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Write a message..."
                className="flex-1 rounded-full px-4 py-3 bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <button
                onClick={sendMessage}
                disabled={isSending || !inputText.trim()}
                className="bg-green-600 hover:bg-green-500 disabled:bg-gray-500 text-white rounded-full px-6 py-3 transition-colors"
              >
                Send
              </button>
            </div>
          </div>
        )}

        {/* CALL MODE */}
        {mode === 'call' && (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-180px)]">
            <div className={`text-8xl mb-6 ${isPlaying ? 'animate-bounce' : ''}`}>
              🎅
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {isPlaying ? 'Santa is speaking...' : 'Connected to Santa'}
            </h2>
            <p className="text-white/70 mb-8">
              {isPlaying ? 'Listen carefully!' : 'Press to speak'}
            </p>

            <div className="flex gap-4">
              <button
                onClick={endCall}
                className="bg-red-600 hover:bg-red-500 text-white rounded-full px-8 py-4 text-lg transition-colors"
              >
                📵 Hang up
              </button>
            </div>
          </div>
        )}

        {/* VIDEO MODE */}
        {mode === 'video' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center mb-4">
              🎬 Video from Santa
            </h2>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-6xl mb-4">🎅</div>
              <p className="text-white/70">
                Your personalized video is here!
              </p>
              <a
                href={`/video/${orderId}`}
                className="inline-block mt-4 bg-red-600 hover:bg-red-500 text-white rounded-full px-6 py-3 transition-colors"
              >
                ▶️ Watch video
              </a>
            </div>

            {/* Video snippets library */}
            <div className="space-y-3">
              <h3 className="text-white/70 text-sm">More from Santa:</h3>
              {[
                { title: 'Greeting from Santa', emoji: '👋' },
                { title: 'Story about the reindeer', emoji: '🦌' },
                { title: 'Elf workshop', emoji: '🧝' },
                { title: 'Goodnight from Santa', emoji: '🌙' },
              ].map((video, i) => (
                <button
                  key={i}
                  className="w-full bg-white/10 hover:bg-white/20 rounded-xl p-4 flex items-center gap-4 transition-colors"
                >
                  <span className="text-3xl">{video.emoji}</span>
                  <span className="text-white">{video.title}</span>
                  <span className="ml-auto text-white/50">▶️</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* INBOX MODE */}
        {mode === 'inbox' && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white text-center mb-4">
              📬 Inbox
            </h2>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
              <div className="text-6xl mb-4">✉️</div>
              <h3 className="text-white font-bold mb-2">No new messages</h3>
              <p className="text-white/70 text-sm">
                Santa will send you a message before Christmas Eve!
              </p>
            </div>

            <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-4">
              <p className="text-yellow-200 text-sm">
                💡 <strong>Tip:</strong> Enable notifications so you don&apos;t miss messages from Santa!
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Install PWA Banner (shown on mobile) */}
      <InstallBanner />
    </div>
  )
}

// Christmas Countdown Component
function ChristmasCountdown() {
  const [timeLeft, setTimeLeft] = useState('')

  useEffect(() => {
    const calculateTimeLeft = () => {
      const christmas = new Date(new Date().getFullYear(), 11, 24, 18, 0, 0) // Dec 24, 6 PM
      const now = new Date()

      if (now > christmas) {
        return 'Merry Christmas! 🎄'
      }

      const diff = christmas.getTime() - now.getTime()
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (days > 0) {
        return `${days} days, ${hours} hrs`
      }
      return `${hours} hrs ${minutes} min`
    }

    setTimeLeft(calculateTimeLeft())
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <p className="text-2xl font-bold text-white mt-2">{timeLeft}</p>
  )
}

// Install PWA Banner
function InstallBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if already installed or if on iOS
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)

    if (!isStandalone && isIOS) {
      setShowBanner(true)
    }
  }, [])

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t">
      <div className="max-w-lg mx-auto flex items-center gap-4">
        <span className="text-3xl">📲</span>
        <div className="flex-1">
          <p className="font-bold text-gray-800">Add to Home Screen</p>
          <p className="text-gray-600 text-sm">
            Tap <strong>Share</strong> → <strong>Add to Home Screen</strong>
          </p>
        </div>
        <button
          onClick={() => setShowBanner(false)}
          className="text-gray-400"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
