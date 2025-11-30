'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { WizardData } from '@/components/CreateWizard/WizardContext'
import type { GeneratedScript, ScriptScene } from '@/lib/gemini'
import KeyframeStoryboard from '@/components/KeyframeStoryboard'

interface Keyframe {
  sceneNumber: number
  imageDataUrl: string
}

export default function ScriptPreviewPage() {
  const router = useRouter()
  const [data, setData] = useState<WizardData | null>(null)
  const [script, setScript] = useState<GeneratedScript | null>(null)
  const [keyframes, setKeyframes] = useState<Keyframe[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingKeyframes, setIsGeneratingKeyframes] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedScenes, setExpandedScenes] = useState<Set<number>>(new Set())
  const [scriptApproved, setScriptApproved] = useState(false)

  useEffect(() => {
    const stored = sessionStorage.getItem('pendingOrder')
    if (stored) {
      const parsedData = JSON.parse(stored)
      setData(parsedData)

      // Check if we already have a generated script
      const storedScript = sessionStorage.getItem('generatedScript')
      if (storedScript) {
        setScript(JSON.parse(storedScript))
      }

      // Check if script was already approved
      const approved = sessionStorage.getItem('scriptApproved')
      if (approved === 'true') {
        setScriptApproved(true)
      }

      // Check if we already have keyframes
      const storedKeyframes = sessionStorage.getItem('generatedKeyframes')
      if (storedKeyframes) {
        setKeyframes(JSON.parse(storedKeyframes))
      }
    } else {
      router.push('/create')
    }
  }, [router])

  useEffect(() => {
    if (script) {
      // Expand all scenes by default
      const allSceneNumbers = script.scenes.map(s => s.sceneNumber)
      setExpandedScenes(new Set(allSceneNumbers))
    }
  }, [script])

  const handleGenerateScript = async () => {
    if (!data) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          childName: data.childName,
          childAge: data.childAge,
          goodBehavior: data.goodBehavior,
          thingToImprove: data.thingToImprove,
          thingToLearn: data.thingToLearn,
          customMessage: data.customMessage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate script')
      }

      const { script: generatedScript } = await response.json()
      setScript(generatedScript)

      // Store for later use
      sessionStorage.setItem('generatedScript', JSON.stringify(generatedScript))
    } catch (err) {
      console.error('Script generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate script')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApproveScript = () => {
    // Store approval and proceed to keyframe generation
    sessionStorage.setItem('scriptApproved', 'true')
    setScriptApproved(true)
  }

  const handleGenerateKeyframes = async () => {
    if (!script || !data) return

    setIsGeneratingKeyframes(true)
    setError(null)

    try {
      const response = await fetch('/api/generate-keyframes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenes: script.scenes,
          childName: data.childName,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate keyframes')
      }

      const { keyframes: generatedKeyframes } = await response.json()
      setKeyframes(generatedKeyframes)

      // Store for later use
      sessionStorage.setItem('generatedKeyframes', JSON.stringify(generatedKeyframes))
    } catch (err) {
      console.error('Keyframe generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate keyframes')
    } finally {
      setIsGeneratingKeyframes(false)
    }
  }

  const handleApproveKeyframes = () => {
    // Store keyframe approval and proceed to payment
    sessionStorage.setItem('keyframesApproved', 'true')
    router.push('/create/summary')
  }

  const handleRegenerateScript = () => {
    setScript(null)
    sessionStorage.removeItem('generatedScript')
    handleGenerateScript()
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">🎅</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📜</div>
          <h1 className="text-3xl font-bold glow-gold">Santa&apos;s Script</h1>
          <p className="text-white/70 mt-2">
            {script
              ? `Preview what Santa will say to ${data.childName}`
              : `Generate a personalized script for ${data.childName}`
            }
          </p>
        </div>

        {/* Not Generated Yet */}
        {!script && !isGenerating && (
          <div className="card-christmas text-center py-12">
            <div className="text-6xl mb-6">✨</div>
            <h2 className="text-2xl font-bold mb-4">Ready to Create Magic?</h2>
            <p className="text-white/70 mb-8 max-w-md mx-auto">
              Our AI will write a personalized script where Santa speaks directly
              to {data.childName}, mentioning their good behavior and encouraging
              their goals.
            </p>
            <button
              onClick={handleGenerateScript}
              className="btn-christmas px-8 py-4 text-lg"
            >
              Generate Santa&apos;s Script 🎅
            </button>
          </div>
        )}

        {/* Generating Animation */}
        {isGenerating && (
          <div className="card-christmas text-center py-12">
            <div className="text-6xl mb-6 animate-bounce">🎅</div>
            <h2 className="text-2xl font-bold mb-4">Santa is Writing...</h2>
            <p className="text-white/70 mb-4">
              Creating a magical personalized message for {data.childName}
            </p>
            <div className="flex justify-center gap-2">
              <div className="w-3 h-3 bg-christmas-red rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-christmas-green rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-christmas-gold rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="card-christmas border-red-500/50 text-center py-8 mb-6">
            <div className="text-4xl mb-4">😢</div>
            <p className="text-red-200 mb-4">{error}</p>
            <button
              onClick={handleGenerateScript}
              className="btn-christmas px-6 py-2"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Script Preview */}
        {script && !isGenerating && (
          <>
            {/* Overview */}
            <div className="card-christmas mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-christmas-gold">Script Overview</h2>
                <span className="text-white/60 text-sm">{script.totalDuration}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-white/70">
                <span>📍 {script.scenes.length} scenes</span>
                <span>🎬 {script.scenes.filter(s => !s.isPremade).length} personalized</span>
                <span>🎥 {script.scenes.filter(s => s.isPremade).length} pre-made</span>
              </div>
            </div>

            {/* Scene List */}
            <div className="space-y-4 mb-8">
              {script.scenes.map((scene) => (
                <SceneCard
                  key={scene.sceneNumber}
                  scene={scene}
                  isExpanded={expandedScenes.has(scene.sceneNumber)}
                  onToggle={() => {
                    const newSet = new Set(expandedScenes)
                    if (newSet.has(scene.sceneNumber)) {
                      newSet.delete(scene.sceneNumber)
                    } else {
                      newSet.add(scene.sceneNumber)
                    }
                    setExpandedScenes(newSet)
                  }}
                />
              ))}
            </div>

            {/* Script Actions - Only show if script not yet approved */}
            {!scriptApproved && (
              <div className="card-christmas">
                <h3 className="text-lg font-bold text-christmas-gold mb-4">Happy with the script?</h3>
                <p className="text-white/70 text-sm mb-6">
                  You can regenerate for a different version, or approve to continue to keyframe generation.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={handleRegenerateScript}
                    className="px-6 py-3 border border-white/20 rounded-lg text-white/70 hover:text-white hover:border-white/40 transition-colors"
                  >
                    🔄 Regenerate Script
                  </button>
                  <button
                    onClick={handleApproveScript}
                    className="btn-christmas px-8 py-3 flex-1"
                  >
                    Approve Script & Generate Keyframes 🎬
                  </button>
                </div>
              </div>
            )}

            {/* Keyframe Section - Show after script is approved */}
            {scriptApproved && (
              <div className="space-y-6">
                {/* Script approved badge */}
                <div className="card-christmas border-green-500/30 bg-green-900/20">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">✓</span>
                    <div>
                      <h3 className="font-bold text-green-400">Script Approved</h3>
                      <p className="text-white/60 text-sm">Now let&apos;s generate the visual keyframes for each scene</p>
                    </div>
                  </div>
                </div>

                {/* Keyframe Storyboard */}
                {keyframes.length > 0 && (
                  <div className="card-christmas">
                    <KeyframeStoryboard
                      scenes={script.scenes.map(s => ({
                        sceneNumber: s.sceneNumber,
                        title: s.title,
                        duration: s.duration,
                        santaDialogue: s.santaDialogue,
                        isPremade: s.isPremade,
                      }))}
                      keyframes={keyframes}
                      isGenerating={isGeneratingKeyframes}
                    />
                  </div>
                )}

                {/* Generate Keyframes Button */}
                {keyframes.length === 0 && !isGeneratingKeyframes && (
                  <div className="card-christmas text-center py-8">
                    <div className="text-6xl mb-4">🎨</div>
                    <h3 className="text-xl font-bold mb-2">Generate Visual Keyframes</h3>
                    <p className="text-white/70 mb-6 max-w-md mx-auto">
                      We&apos;ll create AI-generated preview images for each scene. This helps you visualize the final video.
                    </p>
                    <button
                      onClick={handleGenerateKeyframes}
                      className="btn-christmas px-8 py-4 text-lg"
                    >
                      Generate Keyframes 🎬
                    </button>
                  </div>
                )}

                {/* Generating Keyframes Animation */}
                {isGeneratingKeyframes && keyframes.length === 0 && (
                  <div className="card-christmas text-center py-12">
                    <div className="text-6xl mb-6 animate-pulse">🎨</div>
                    <h2 className="text-2xl font-bold mb-4">Creating Visual Magic...</h2>
                    <p className="text-white/70 mb-4">
                      Generating {script.scenes.length} keyframes. This may take 2-3 minutes.
                    </p>
                    <div className="flex justify-center gap-2">
                      <div className="w-3 h-3 bg-christmas-red rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-3 h-3 bg-christmas-green rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-3 h-3 bg-christmas-gold rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}

                {/* Approve Keyframes and Continue */}
                {keyframes.length > 0 && !isGeneratingKeyframes && (
                  <div className="card-christmas">
                    <h3 className="text-lg font-bold text-christmas-gold mb-4">Ready to create your video?</h3>
                    <p className="text-white/70 text-sm mb-6">
                      These keyframes show the visual style for your video. Approve to continue to payment.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={handleGenerateKeyframes}
                        className="px-6 py-3 border border-white/20 rounded-lg text-white/70 hover:text-white hover:border-white/40 transition-colors"
                      >
                        🔄 Regenerate Keyframes
                      </button>
                      <button
                        onClick={handleApproveKeyframes}
                        className="btn-christmas px-8 py-3 flex-1"
                      >
                        Approve & Continue to Payment 💳
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {/* Back Link */}
        <div className="text-center mt-8">
          <Link
            href="/create"
            className="text-white/50 hover:text-white transition-colors text-sm"
          >
            ← Back to Edit Details
          </Link>
        </div>
      </div>
    </div>
  )
}

function SceneCard({
  scene,
  isExpanded,
  onToggle
}: {
  scene: ScriptScene
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <div
      className={`card-christmas cursor-pointer transition-all ${
        isExpanded ? 'ring-2 ring-christmas-gold' : ''
      }`}
      onClick={onToggle}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
            scene.isPremade
              ? 'bg-white/10 text-white/60'
              : 'bg-christmas-red text-white'
          }`}>
            {scene.sceneNumber}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white">{scene.title}</h3>
              {scene.isPremade && (
                <span className="text-xs px-2 py-0.5 bg-white/10 rounded text-white/60">
                  Pre-made
                </span>
              )}
            </div>
            <p className="text-sm text-white/50">{scene.duration} • {scene.emotionalTone}</p>
          </div>
        </div>
        <span className="text-white/40 text-xl">
          {isExpanded ? '−' : '+'}
        </span>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-4">
          <div>
            <h4 className="text-xs font-medium text-christmas-gold mb-1">🎤 SANTA SAYS:</h4>
            <p className="text-white/90 italic">&ldquo;{scene.santaDialogue}&rdquo;</p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-christmas-gold mb-1">🎬 VISUAL:</h4>
            <p className="text-white/70 text-sm">{scene.visualDescription}</p>
          </div>
          <div>
            <h4 className="text-xs font-medium text-christmas-gold mb-1">📍 SETTING:</h4>
            <p className="text-white/70 text-sm">{scene.setting}</p>
          </div>
        </div>
      )}
    </div>
  )
}
