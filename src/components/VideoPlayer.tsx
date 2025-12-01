'use client'

import { useRef, useState } from 'react'

interface VideoPlayerProps {
  src: string
  poster?: string
}

export function VideoPlayer({ src, poster }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const progress = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setProgress(progress)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = x / rect.width
      videoRef.current.currentTime = percentage * videoRef.current.duration
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (!document.fullscreenElement) {
        videoRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleDownload = () => {
    window.open(src, '_blank')
  }

  return (
    <div
      className="relative aspect-video bg-black group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
        playsInline
      />

      {/* Play Button Overlay */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity"
        >
          <div className="w-20 h-20 rounded-full bg-christmas-red flex items-center justify-center text-4xl hover:scale-110 transition-transform">
            ▶️
          </div>
        </button>
      )}

      {/* Controls */}
      <div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Progress Bar */}
        <div
          className="w-full h-2 bg-white/20 rounded-full cursor-pointer mb-3"
          onClick={handleSeek}
        >
          <div
            className="h-full bg-christmas-gold rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={togglePlay}
              className="text-2xl hover:scale-110 transition-transform"
            >
              {isPlaying ? '⏸️' : '▶️'}
            </button>

            <span className="text-white/80 text-sm">
              {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="text-xl hover:scale-110 transition-transform"
              title="Pobierz"
            >
              📥
            </button>

            <button
              onClick={toggleFullscreen}
              className="text-xl hover:scale-110 transition-transform"
              title="Pełny ekran"
            >
              {isFullscreen ? '⏹️' : '⛶'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
