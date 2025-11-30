'use client'

import { useState } from 'react'
import { PREMADE_SCENES, PERSONALIZED_SCENE_TEMPLATES } from '@/lib/premade-scenes'

interface SceneStatus {
  scene_number: number
  name: string
  description: string
  duration_seconds: number
  video_url?: string
  keyframe_url?: string
  keyframe_end_url?: string
  prompt_used?: string
  created_at?: string
  updated_at?: string
}

interface GenerationResult {
  sceneNumber: number
  name: string
  startKeyframeGenerated?: boolean
  endKeyframeGenerated?: boolean
  videoOperationStarted?: boolean
  operationName?: string
  error?: string
}

type ActionType = 'keyframe_start' | 'keyframe_end' | 'video' | 'all'

export default function AdminScenesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [adminKey, setAdminKey] = useState('')
  const [sceneStatuses, setSceneStatuses] = useState<SceneStatus[]>([])
  const [loading, setLoading] = useState(false)
  const [generatingScene, setGeneratingScene] = useState<number | null>(null)
  const [generatingAction, setGeneratingAction] = useState<ActionType | null>(null)
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

  const generateContent = async (sceneNumber: number, action: ActionType) => {
    setGeneratingScene(sceneNumber)
    setGeneratingAction(action)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/generate-premade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminKey,
          sceneNumbers: [sceneNumber],
          action,
          useKeyframes: action === 'all', // Only use keyframes when generating all
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const result = data.results[0] as GenerationResult
        const messages: string[] = []

        if (result.startKeyframeGenerated) messages.push('Start keyframe generated')
        if (result.endKeyframeGenerated) messages.push('End keyframe generated')
        if (result.videoOperationStarted) messages.push(`Video started: ${result.operationName?.slice(-20)}...`)
        if (result.error) messages.push(`Error: ${result.error}`)

        setMessage({
          type: result.error ? 'error' : 'success',
          text: messages.join(' | ') || 'Operation completed'
        })
        fetchSceneStatuses()
      } else {
        setMessage({ type: 'error', text: data.error || 'Generation failed' })
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to start generation' })
    }

    setGeneratingScene(null)
    setGeneratingAction(null)
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
              Generate keyframes (NanoBanana) + videos (Veo)
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
            const hasVideo = !!status?.video_url
            const hasStartKeyframe = !!status?.keyframe_url
            const hasEndKeyframe = !!status?.keyframe_end_url
            const isGenerating = generatingScene === scene.sceneNumber
            const isPremade = scene.type === 'premade'

            // Check if video generation was started
            let operationStarted = false
            let usedKeyframes = { start: false, end: false }
            if (status?.prompt_used) {
              try {
                const parsed = JSON.parse(status.prompt_used)
                operationStarted = !!parsed.operationName
                usedKeyframes.start = !!parsed.usedStartKeyframe
                usedKeyframes.end = !!parsed.usedEndKeyframe
              } catch {}
            }

            return (
              <div key={scene.sceneNumber} className="card-christmas">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Preview placeholder */}
                  <div className="lg:w-64 flex-shrink-0">
                    <div className="w-full aspect-video bg-white/5 rounded-lg border border-white/20 flex items-center justify-center">
                      <span className="text-white/40 text-4xl">
                        {scene.sceneNumber}
                      </span>
                    </div>
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

                    {/* Status indicators */}
                    <div className="flex flex-wrap gap-4 text-sm mb-4">
                      <span className="text-white/60">Duration: {scene.durationSeconds}s</span>
                      <span className={hasStartKeyframe ? 'text-blue-400' : 'text-white/40'}>
                        Start KF: {hasStartKeyframe ? '✓' : '✗'}
                      </span>
                      <span className={hasEndKeyframe ? 'text-purple-400' : 'text-white/40'}>
                        End KF: {hasEndKeyframe ? '✓' : '✗'}
                      </span>
                      <span className={hasVideo ? 'text-green-400' : operationStarted ? 'text-yellow-400' : 'text-white/40'}>
                        Video: {hasVideo ? '✓ Ready' : operationStarted ? '⏳ Processing' : '✗'}
                      </span>
                    </div>

                    {/* Actions - Only for pre-made scenes */}
                    {isPremade && (
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => generateContent(scene.sceneNumber, 'keyframe_start')}
                          disabled={isGenerating}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm py-2 px-3 rounded transition-colors"
                        >
                          {isGenerating && generatingAction === 'keyframe_start' ? '...' : 'Gen Start KF'}
                        </button>
                        <button
                          onClick={() => generateContent(scene.sceneNumber, 'keyframe_end')}
                          disabled={isGenerating}
                          className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm py-2 px-3 rounded transition-colors"
                        >
                          {isGenerating && generatingAction === 'keyframe_end' ? '...' : 'Gen End KF'}
                        </button>
                        <button
                          onClick={() => generateContent(scene.sceneNumber, 'video')}
                          disabled={isGenerating}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm py-2 px-3 rounded transition-colors"
                        >
                          {isGenerating && generatingAction === 'video' ? '...' : 'Gen Video Only'}
                        </button>
                        <button
                          onClick={() => generateContent(scene.sceneNumber, 'all')}
                          disabled={isGenerating}
                          className="btn-christmas text-sm py-2 px-4"
                        >
                          {isGenerating && generatingAction === 'all' ? 'Generating...' : 'Gen All'}
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
                    View Video Prompt
                  </summary>
                  <div className="mt-3">
                    <pre className="bg-black/30 p-3 rounded text-white/70 whitespace-pre-wrap text-xs max-h-48 overflow-y-auto">
                      {scene.videoPrompt || (scene as any).videoPromptTemplate}
                    </pre>
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
              <div className="text-3xl font-bold text-blue-400">
                {sceneStatuses.filter(s => s.keyframe_url).length}
              </div>
              <div className="text-white/60 text-sm">Start Keyframes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400">
                {sceneStatuses.filter(s => s.keyframe_end_url).length}
              </div>
              <div className="text-white/60 text-sm">End Keyframes</div>
            </div>
            <div>
              <div className="text-3xl font-bold glow-gold">
                {sceneStatuses.filter(s => s.video_url).length}
              </div>
              <div className="text-white/60 text-sm">Videos Ready</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-green-400">
                {PREMADE_SCENES.length}
              </div>
              <div className="text-white/60 text-sm">Pre-made Total</div>
            </div>
          </div>
        </div>

        {/* Cost Info */}
        <div className="card-christmas mt-4 text-sm text-white/60">
          <p><strong>Costs:</strong> NanoBanana keyframe ~$0.04/image | Veo video ~varies by duration</p>
        </div>
      </div>
    </div>
  )
}
