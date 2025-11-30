'use client'

import { useState, useEffect, useCallback } from 'react'
import { PREMADE_SCENES, PERSONALIZED_SCENE_TEMPLATES } from '@/lib/premade-scenes'

interface SceneData {
  sceneNumber: number
  name: string
  description: string
  durationSeconds: number
  type: 'premade' | 'personalized'
  keyframeUrl?: string
  keyframeEndUrl?: string
  visualDescription?: string
}

interface SceneStatus {
  scene_number: number
  keyframe_url?: string
  keyframe_end_url?: string
}

export default function StoryboardViewerPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminKey, setAdminKey] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [sceneStatuses, setSceneStatuses] = useState<SceneStatus[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showEndKeyframe, setShowEndKeyframe] = useState(false)

  // Combine all scenes
  const allScenes: SceneData[] = [
    ...PREMADE_SCENES.map(s => ({
      sceneNumber: s.sceneNumber,
      name: s.name,
      description: s.description,
      durationSeconds: s.durationSeconds,
      type: 'premade' as const,
      visualDescription: s.videoPrompt,
    })),
    ...PERSONALIZED_SCENE_TEMPLATES.map(s => ({
      sceneNumber: s.sceneNumber,
      name: s.name,
      description: s.description,
      durationSeconds: s.durationSeconds,
      type: 'personalized' as const,
      visualDescription: s.videoPromptTemplate,
    })),
  ].sort((a, b) => a.sceneNumber - b.sceneNumber)

  // Merge keyframe URLs from database
  const scenesWithKeyframes = allScenes.map(scene => {
    const status = sceneStatuses.find(s => s.scene_number === scene.sceneNumber)
    return {
      ...scene,
      keyframeUrl: status?.keyframe_url,
      keyframeEndUrl: status?.keyframe_end_url,
    }
  })

  const currentScene = scenesWithKeyframes[currentIndex]

  const fetchSceneStatuses = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/generate-premade?adminKey=${adminKey}`)
      if (response.ok) {
        const data = await response.json()
        setSceneStatuses(data.scenes || [])
        setIsAuthenticated(true)
      }
    } catch (error) {
      console.error('Failed to fetch scenes:', error)
    }
    setIsLoading(false)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSceneStatuses()
  }

  const goToScene = useCallback((index: number) => {
    if (index >= 0 && index < scenesWithKeyframes.length) {
      setCurrentIndex(index)
      setShowEndKeyframe(false)
    }
  }, [scenesWithKeyframes.length])

  const nextScene = useCallback(() => {
    if (currentIndex < scenesWithKeyframes.length - 1) {
      goToScene(currentIndex + 1)
    }
  }, [currentIndex, scenesWithKeyframes.length, goToScene])

  const prevScene = useCallback(() => {
    if (currentIndex > 0) {
      goToScene(currentIndex - 1)
    }
  }, [currentIndex, goToScene])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isViewerOpen) return
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault()
        nextScene()
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        prevScene()
      } else if (e.key === 'Escape') {
        setIsViewerOpen(false)
      } else if (e.key === 'Tab') {
        e.preventDefault()
        setShowEndKeyframe(prev => !prev)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isViewerOpen, nextScene, prevScene])

  // Login screen
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-[#0a0a0f] flex items-center justify-center">
        {/* Animated stars background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
                opacity: 0.3 + Math.random() * 0.7,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 w-full max-w-md px-8">
          <div className="text-center mb-12">
            <h1 className="font-serif text-5xl text-amber-100 tracking-wide mb-4"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              THE SANTA
            </h1>
            <h2 className="font-serif text-3xl text-amber-200/80 tracking-[0.3em]"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              EXPERIENCE
            </h2>
            <p className="text-amber-100/40 mt-6 tracking-widest text-sm">
              STORYBOARD PREVIEW
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <input
                type="password"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
                placeholder="Enter screening pass..."
                className="w-full bg-transparent border border-amber-200/20 rounded-none px-6 py-4 text-amber-100 placeholder:text-amber-200/30 focus:outline-none focus:border-amber-200/50 transition-colors text-center tracking-widest"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full border border-amber-200/40 px-6 py-4 text-amber-100 tracking-[0.2em] hover:bg-amber-200/10 transition-all duration-300 disabled:opacity-50"
            >
              {isLoading ? 'AUTHENTICATING...' : 'ENTER SCREENING'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-[#0a0a0f] text-amber-100 overflow-hidden">
      {/* Atmospheric background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-radial from-amber-900/10 via-transparent to-transparent" />
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-amber-200 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: 0.2 + Math.random() * 0.5,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <header className="flex-shrink-0 p-6 flex items-center justify-between border-b border-amber-200/10">
          <div>
            <h1 className="font-serif text-2xl tracking-wide" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              Storyboard Screening
            </h1>
            <p className="text-amber-200/40 text-sm tracking-widest mt-1">
              {scenesWithKeyframes.length} SCENES &bull; THE MAGICAL JOURNEY
            </p>
          </div>
          <button
            onClick={() => setIsViewerOpen(true)}
            className="px-8 py-3 border border-amber-200/40 text-amber-100 tracking-[0.15em] hover:bg-amber-200/10 transition-all duration-300 flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            BEGIN SCREENING
          </button>
        </header>

        {/* Filmstrip Grid */}
        <div className="flex-1 overflow-auto p-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {scenesWithKeyframes.map((scene, index) => (
              <button
                key={scene.sceneNumber}
                onClick={() => {
                  setCurrentIndex(index)
                  setIsViewerOpen(true)
                }}
                className="group relative aspect-video bg-gradient-to-br from-amber-900/20 to-transparent border border-amber-200/10 hover:border-amber-200/40 transition-all duration-500 overflow-hidden"
              >
                {/* Keyframe image or placeholder */}
                {scene.keyframeUrl ? (
                  <img
                    src={scene.keyframeUrl}
                    alt={scene.name}
                    className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-6xl font-serif text-amber-200/20" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                      {scene.sceneNumber}
                    </span>
                  </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                {/* Scene info */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs tracking-widest ${
                      scene.type === 'premade' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {scene.type === 'premade' ? 'PREMADE' : 'PERSONALIZED'}
                    </span>
                    <span className="text-amber-200/40 text-xs">&bull;</span>
                    <span className="text-amber-200/60 text-xs">{scene.durationSeconds}s</span>
                  </div>
                  <h3 className="font-serif text-sm text-amber-100 line-clamp-1" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                    {scene.sceneNumber}. {scene.name}
                  </h3>
                </div>

                {/* Film sprocket holes */}
                <div className="absolute top-0 bottom-0 left-0 w-4 flex flex-col justify-between py-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-amber-200/10 rounded-sm" />
                  ))}
                </div>
                <div className="absolute top-0 bottom-0 right-0 w-4 flex flex-col justify-between py-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-2 h-2 bg-amber-200/10 rounded-sm ml-auto" />
                  ))}
                </div>

                {/* Hover play icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-16 h-16 rounded-full border-2 border-amber-200/60 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <svg className="w-8 h-8 text-amber-200 ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Full-screen Viewer Modal */}
      {isViewerOpen && currentScene && (
        <div className="fixed inset-0 z-50 bg-black">
          {/* Close button */}
          <button
            onClick={() => setIsViewerOpen(false)}
            className="absolute top-6 right-6 z-50 w-12 h-12 flex items-center justify-center text-amber-200/60 hover:text-amber-200 transition-colors"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Main keyframe display */}
          <div className="absolute inset-0 flex items-center justify-center p-16">
            {currentScene.keyframeUrl ? (
              <div className="relative max-w-full max-h-full animate-fadeIn">
                <img
                  src={showEndKeyframe && currentScene.keyframeEndUrl ? currentScene.keyframeEndUrl : currentScene.keyframeUrl}
                  alt={currentScene.name}
                  className="max-w-full max-h-[70vh] object-contain shadow-2xl transition-opacity duration-500"
                  style={{ boxShadow: '0 0 100px rgba(217, 119, 6, 0.2)' }}
                />

                {/* Cinematic letterbox effect */}
                <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-b from-black to-transparent" />
                <div className="absolute -bottom-8 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent" />
              </div>
            ) : (
              <div className="text-center">
                <span className="text-9xl font-serif text-amber-200/20" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                  {currentScene.sceneNumber}
                </span>
                <p className="text-amber-200/40 mt-4 tracking-widest">KEYFRAME NOT YET GENERATED</p>
              </div>
            )}
          </div>

          {/* Scene info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent pt-32 pb-8 px-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-4">
                <span className={`px-3 py-1 text-xs tracking-widest ${
                  currentScene.type === 'premade'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {currentScene.type === 'premade' ? 'PREMADE SCENE' : 'PERSONALIZED SCENE'}
                </span>
                <span className="text-amber-200/40 tracking-widest text-sm">
                  SCENE {currentScene.sceneNumber} OF {scenesWithKeyframes.length}
                </span>
                <span className="text-amber-200/40">&bull;</span>
                <span className="text-amber-200/60 tracking-widest text-sm">
                  {currentScene.durationSeconds} SECONDS
                </span>
                {currentScene.keyframeEndUrl && (
                  <>
                    <span className="text-amber-200/40">&bull;</span>
                    <button
                      onClick={() => setShowEndKeyframe(prev => !prev)}
                      className={`text-sm tracking-widest transition-colors ${
                        showEndKeyframe ? 'text-purple-400' : 'text-blue-400'
                      }`}
                    >
                      {showEndKeyframe ? 'END KEYFRAME' : 'START KEYFRAME'} (TAB)
                    </button>
                  </>
                )}
              </div>

              <h2 className="font-serif text-4xl text-amber-100 mb-3" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
                {currentScene.name}
              </h2>

              <p className="text-amber-200/70 text-lg leading-relaxed max-w-3xl">
                {currentScene.description}
              </p>
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={prevScene}
            disabled={currentIndex === 0}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center text-amber-200/40 hover:text-amber-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300 group"
          >
            <div className="w-full h-full border border-amber-200/20 group-hover:border-amber-200/40 flex items-center justify-center transition-colors">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </div>
          </button>

          <button
            onClick={nextScene}
            disabled={currentIndex === scenesWithKeyframes.length - 1}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-16 h-16 flex items-center justify-center text-amber-200/40 hover:text-amber-200 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300 group"
          >
            <div className="w-full h-full border border-amber-200/20 group-hover:border-amber-200/40 flex items-center justify-center transition-colors">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>

          {/* Film strip progress bar */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2 flex items-center gap-1">
            {scenesWithKeyframes.map((scene, index) => (
              <button
                key={scene.sceneNumber}
                onClick={() => goToScene(index)}
                className={`h-1 transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-amber-400'
                    : scene.keyframeUrl
                      ? 'w-4 bg-amber-200/40 hover:bg-amber-200/60'
                      : 'w-4 bg-amber-200/10 hover:bg-amber-200/20'
                }`}
              />
            ))}
          </div>

          {/* Keyboard hints */}
          <div className="absolute bottom-6 right-6 flex items-center gap-6 text-amber-200/30 text-xs tracking-widest">
            <span>← → NAVIGATE</span>
            <span>TAB TOGGLE KEYFRAME</span>
            <span>ESC CLOSE</span>
          </div>
        </div>
      )}

      {/* Custom animations */}
      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle at center, var(--tw-gradient-from), var(--tw-gradient-via), var(--tw-gradient-to));
        }
      `}</style>
    </div>
  )
}
