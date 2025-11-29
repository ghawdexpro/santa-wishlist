'use client'

import { useState, useEffect } from 'react'
import { PREMADE_SCENES, PERSONALIZED_SCENE_TEMPLATES } from '@/lib/premade-scenes'

interface SceneStatus {
  scene_number: number
  name: string
  description: string
  duration_seconds: number
  keyframe_url?: string
  video_url?: string
  prompt_used?: string
  created_at?: string
  updated_at?: string
}

interface GenerationResult {
  sceneNumber: number
  name: string
  keyframeGenerated?: boolean
  videoOperationStarted?: boolean
  operationName?: string
  error?: string
}

export default function AdminScenesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminKey, setAdminKey] = useState('')
  const [sceneStatuses, setSceneStatuses] = useState<SceneStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState<number | null>(null)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Combine all scenes for display
  const allScenes = [
    ...PREMADE_SCENES.map(s => ({ ...s, type: 'premade' as const })),
    ...PERSONALIZED_SCENE_TEMPLATES.map(s => ({
      sceneNumber: s.sceneNumber,
      name: s.name,
      description: s.description,
      durationSeconds: s.durationSeconds,
      type: 'personalized' as const,
      videoPrompt: s.videoPromptTemplate,
      keyframePrompt: s.keyframePromptTemplate,
      audioDescription: s.audioDescription,
    })),
  ].sort((a, b) => a.sceneNumber - b.sceneNumber)

  const fetchSceneStatuses = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/admin/generate-premade?adminKey=${adminKey}`)
      if (response.ok) {
        const data = await response.json()
        setSceneStatuses(data.scenes || [])
        setIsAuthenticated(true)
      } else {
        setMessage({ type: 'error', text: 'Invalid admin key' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to fetch scene statuses' })
    }
    setLoading(false)
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSceneStatuses()
  }

  const generateKeyframe = async (sceneNumber: number) => {
    setGenerating(sceneNumber)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/generate-premade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey,
          sceneNumbers: [sceneNumber],
          type: 'keyframes',
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const result = data.results[0] as GenerationResult
        if (result.keyframeGenerated) {
          setMessage({ type: 'success', text: `Scene ${sceneNumber} keyframe generated!` })
          fetchSceneStatuses()
        } else if (result.error) {
          setMessage({ type: 'error', text: `Error: ${result.error}` })
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Generation failed' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to generate keyframe' })
    }

    setGenerating(null)
  }

  const generateVideo = async (sceneNumber: number) => {
    setGenerating(sceneNumber)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/generate-premade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey,
          sceneNumbers: [sceneNumber],
          type: 'videos',
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const result = data.results[0] as GenerationResult
        if (result.videoOperationStarted) {
          setMessage({
            type: 'success',
            text: `Scene ${sceneNumber} video generation started! Operation: ${result.operationName}`
          })
          fetchSceneStatuses()
        } else if (result.error) {
          setMessage({ type: 'error', text: `Error: ${result.error}` })
        }
      } else {
        setMessage({ type: 'error', text: data.error || 'Generation failed' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to start video generation' })
    }

    setGenerating(null)
  }

  const getSceneStatus = (sceneNumber: number): SceneStatus | undefined => {
    return sceneStatuses.find(s => s.scene_number === sceneNumber)
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="card-christmas max-w-md w-full">
          <h1 className="text-2xl font-bold glow-gold text-center mb-6">
            Admin Access
          </h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter admin key..."
              className="input-christmas mb-4"
            />
            <button
              type="submit"
              className="btn-christmas w-full"
              disabled={loading}
            >
              {loading ? 'Checking...' : 'Enter'}
            </button>
          </form>
          {message && (
            <p className={`mt-4 text-center ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
              {message.text}
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold glow-gold">Scene Generator</h1>
            <p className="text-white/70 mt-1">
              Generate pre-made scenes for The Santa Experience
            </p>
          </div>
          <button
            onClick={fetchSceneStatuses}
            className="btn-christmas btn-green"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh Status'}
          </button>
        </div>

        {message && (
          <div className={`card-christmas mb-6 ${message.type === 'error' ? 'border-red-500' : 'border-green-500'}`}>
            <p className={message.type === 'error' ? 'text-red-400' : 'text-green-400'}>
              {message.text}
            </p>
          </div>
        )}

        {/* Scene Cards */}
        <div className="grid gap-6">
          {allScenes.map((scene) => {
            const status = getSceneStatus(scene.sceneNumber)
            const hasKeyframe = !!status?.keyframe_url
            const hasVideo = !!status?.video_url
            const isGenerating = generating === scene.sceneNumber
            const isPremade = scene.type === 'premade'

            return (
              <div key={scene.sceneNumber} className="card-christmas">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Preview */}
                  <div className="lg:w-64 flex-shrink-0">
                    {hasKeyframe && status?.keyframe_url ? (
                      <img
                        src={status.keyframe_url}
                        alt={`Scene ${scene.sceneNumber} keyframe`}
                        className="w-full aspect-video object-cover rounded-lg border border-christmas-gold/30"
                      />
                    ) : (
                      <div className="w-full aspect-video bg-white/5 rounded-lg border border-white/20 flex items-center justify-center">
                        <span className="text-white/40 text-4xl">
                          {scene.sceneNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        isPremade
                          ? 'bg-christmas-green/30 text-green-300'
                          : 'bg-christmas-gold/30 text-yellow-300'
                      }`}>
                        {isPremade ? 'PRE-MADE' : 'PERSONALIZED'}
                      </span>
                      <h2 className="text-xl font-bold">
                        Scene {scene.sceneNumber}: {scene.name}
                      </h2>
                    </div>

                    <p className="text-white/70 mb-3">{scene.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-white/60 mb-4">
                      <span>Duration: {scene.durationSeconds}s</span>
                      <span className={hasKeyframe ? 'text-green-400' : 'text-white/40'}>
                        Keyframe: {hasKeyframe ? '✓' : '✗'}
                      </span>
                      <span className={hasVideo ? 'text-green-400' : 'text-white/40'}>
                        Video: {hasVideo ? '✓' : '✗'}
                      </span>
                    </div>

                    {/* Actions - Only for pre-made scenes */}
                    {isPremade && (
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => generateKeyframe(scene.sceneNumber)}
                          disabled={isGenerating}
                          className="btn-christmas text-sm py-2 px-4"
                        >
                          {isGenerating ? 'Generating...' : hasKeyframe ? 'Regenerate Keyframe' : 'Generate Keyframe'}
                        </button>
                        <button
                          onClick={() => generateVideo(scene.sceneNumber)}
                          disabled={isGenerating || !hasKeyframe}
                          className="btn-christmas btn-green text-sm py-2 px-4 disabled:opacity-50"
                        >
                          {isGenerating ? 'Starting...' : hasVideo ? 'Regenerate Video' : 'Generate Video'}
                        </button>
                      </div>
                    )}

                    {!isPremade && (
                      <p className="text-white/50 text-sm italic">
                        Personalized scenes are generated per order with child&apos;s data
                      </p>
                    )}
                  </div>
                </div>

                {/* Prompt Preview (collapsible) */}
                <details className="mt-4">
                  <summary className="cursor-pointer text-white/60 hover:text-white/80 text-sm">
                    View Prompts
                  </summary>
                  <div className="mt-3 space-y-3 text-sm">
                    <div>
                      <p className="text-christmas-gold font-semibold mb-1">Keyframe Prompt:</p>
                      <pre className="bg-black/30 p-3 rounded text-white/70 whitespace-pre-wrap text-xs">
                        {scene.keyframePrompt || (scene as any).keyframePromptTemplate}
                      </pre>
                    </div>
                    <div>
                      <p className="text-christmas-gold font-semibold mb-1">Video Prompt:</p>
                      <pre className="bg-black/30 p-3 rounded text-white/70 whitespace-pre-wrap text-xs max-h-48 overflow-y-auto">
                        {scene.videoPrompt || (scene as any).videoPromptTemplate}
                      </pre>
                    </div>
                  </div>
                </details>
              </div>
            )
          })}
        </div>

        {/* Summary Stats */}
        <div className="card-christmas mt-8">
          <h3 className="text-lg font-bold mb-4">Generation Progress</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold glow-gold">
                {sceneStatuses.filter(s => s.keyframe_url).length}
              </div>
              <div className="text-white/60 text-sm">Keyframes</div>
            </div>
            <div>
              <div className="text-3xl font-bold glow-gold">
                {sceneStatuses.filter(s => s.video_url).length}
              </div>
              <div className="text-white/60 text-sm">Videos</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">
                {PREMADE_SCENES.length}
              </div>
              <div className="text-white/60 text-sm">Pre-made Scenes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400">
                {PERSONALIZED_SCENE_TEMPLATES.length}
              </div>
              <div className="text-white/60 text-sm">Personalized Scenes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
