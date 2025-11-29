'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Keyframe {
  sceneNumber: number
  imageDataUrl: string
}

interface Scene {
  sceneNumber: number
  title: string
  duration: string
  santaDialogue: string
  isPremade: boolean
}

interface KeyframeStoryboardProps {
  scenes: Scene[]
  keyframes: Keyframe[]
  isGenerating?: boolean
  onRegenerate?: (sceneNumber: number) => void
}

export default function KeyframeStoryboard({
  scenes,
  keyframes,
  isGenerating = false,
  onRegenerate,
}: KeyframeStoryboardProps) {
  const [selectedScene, setSelectedScene] = useState<number | null>(null)

  const getKeyframeForScene = (sceneNumber: number) => {
    return keyframes.find(k => k.sceneNumber === sceneNumber)
  }

  return (
    <div className="w-full">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <span className="text-2xl">🎬</span>
        Storyboard Preview
      </h3>

      {isGenerating && (
        <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-4 mb-6 flex items-center gap-3">
          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
          <span className="text-white">Generating magical keyframes... This may take a few minutes.</span>
        </div>
      )}

      {/* Grid of keyframes */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        {scenes.map((scene) => {
          const keyframe = getKeyframeForScene(scene.sceneNumber)
          const isSelected = selectedScene === scene.sceneNumber

          return (
            <div
              key={scene.sceneNumber}
              onClick={() => setSelectedScene(isSelected ? null : scene.sceneNumber)}
              className={`
                relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                ${isSelected ? 'border-yellow-400 ring-2 ring-yellow-400/50' : 'border-white/20 hover:border-white/40'}
                ${scene.isPremade ? 'opacity-90' : ''}
              `}
            >
              {/* Scene number badge */}
              <div className="absolute top-2 left-2 z-10 bg-black/70 text-white text-xs px-2 py-1 rounded">
                Scene {scene.sceneNumber}
              </div>

              {/* Pre-made badge */}
              {scene.isPremade && (
                <div className="absolute top-2 right-2 z-10 bg-green-600/80 text-white text-xs px-2 py-1 rounded">
                  Pre-made
                </div>
              )}

              {/* Keyframe image or placeholder */}
              <div className="aspect-video bg-gray-800 relative">
                {keyframe ? (
                  <Image
                    src={keyframe.imageDataUrl}
                    alt={`Scene ${scene.sceneNumber}: ${scene.title}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    {isGenerating ? (
                      <div className="animate-pulse">Generating...</div>
                    ) : (
                      <span>No keyframe</span>
                    )}
                  </div>
                )}
              </div>

              {/* Scene title */}
              <div className="p-2 bg-black/60">
                <p className="text-white text-sm font-medium truncate">{scene.title}</p>
                <p className="text-gray-400 text-xs">{scene.duration}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Selected scene details */}
      {selectedScene && (
        <div className="bg-white/10 rounded-lg p-4 mb-4">
          {(() => {
            const scene = scenes.find(s => s.sceneNumber === selectedScene)
            const keyframe = getKeyframeForScene(selectedScene)
            if (!scene) return null

            return (
              <div className="flex flex-col md:flex-row gap-4">
                {/* Large keyframe preview */}
                <div className="md:w-1/2">
                  <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden relative">
                    {keyframe ? (
                      <Image
                        src={keyframe.imageDataUrl}
                        alt={`Scene ${scene.sceneNumber}: ${scene.title}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        No keyframe generated
                      </div>
                    )}
                  </div>
                </div>

                {/* Scene details */}
                <div className="md:w-1/2 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="text-lg font-bold">Scene {scene.sceneNumber}: {scene.title}</h4>
                    {scene.isPremade && (
                      <span className="bg-green-600 text-xs px-2 py-1 rounded">Pre-made</span>
                    )}
                  </div>
                  <p className="text-gray-300 text-sm mb-3">Duration: {scene.duration}</p>

                  <div className="bg-black/30 rounded p-3 mb-3">
                    <p className="text-sm text-gray-400 mb-1">Santa says:</p>
                    <p className="text-white italic">&ldquo;{scene.santaDialogue}&rdquo;</p>
                  </div>

                  {onRegenerate && keyframe && !scene.isPremade && (
                    <button
                      onClick={() => onRegenerate(scene.sceneNumber)}
                      className="bg-yellow-600 hover:bg-yellow-500 text-white px-4 py-2 rounded text-sm transition-colors"
                    >
                      🔄 Regenerate This Keyframe
                    </button>
                  )}
                </div>
              </div>
            )
          })()}
        </div>
      )}

      {/* Legend */}
      <div className="flex gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-600 rounded" />
          <span>Pre-made scenes (faster rendering)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-600 rounded" />
          <span>Personalized scenes</span>
        </div>
      </div>
    </div>
  )
}
