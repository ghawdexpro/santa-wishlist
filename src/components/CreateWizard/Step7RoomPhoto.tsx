'use client'

import { useWizard } from './WizardContext'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Step7RoomPhoto() {
  const router = useRouter()
  const { data, updateData, prevStep } = useWizard()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePhotoSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        updateData({
          roomPhoto: file,
          roomPhotoPreview: e.target?.result as string,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePhotoSelect(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Store data in sessionStorage for the script generation page
      sessionStorage.setItem('pendingOrder', JSON.stringify(data))
      // Clear any previously generated script
      sessionStorage.removeItem('generatedScript')
      sessionStorage.removeItem('scriptApproved')
      router.push('/create/script')
    } catch (error) {
      console.error('Error submitting:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🧝</div>
        <h2 className="text-2xl font-bold glow-gold mb-2">Elf Scout Mission!</h2>
        <p className="text-white/70">
          Upload a photo of your room with the Christmas tree - our elves will appear in it as Santa&apos;s scouts!
        </p>
      </div>

      {/* Feature explanation */}
      <div className="bg-christmas-green/20 border border-christmas-green/40 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-christmas-gold mb-2">What you get:</h3>
        <ul className="text-sm text-white/80 space-y-2">
          <li className="flex items-start gap-2">
            <span>👀</span>
            <span>Elf peeking from behind the tree - checking if your child is asleep</span>
          </li>
          <li className="flex items-start gap-2">
            <span>📋</span>
            <span>Elves taking notes - &quot;House checked, ready for Santa&apos;s visit!&quot;</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✨</span>
            <span>Magical scenes in YOUR child&apos;s REAL room!</span>
          </li>
        </ul>
      </div>

      <div className="space-y-6">
        {/* Room Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-christmas-gold mb-2">
            Photo of room with Christmas tree (optional)
          </label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-christmas-gold bg-christmas-gold/10'
                : 'border-white/30 hover:border-white/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />

            {data.roomPhotoPreview ? (
              <div className="space-y-4">
                <img
                  src={data.roomPhotoPreview}
                  alt="Room preview"
                  className="w-full max-w-xs mx-auto rounded-lg border-2 border-christmas-gold"
                />
                <p className="text-sm text-christmas-gold">
                  Perfect! The elves are already planning their visit to this room!
                </p>
                <button
                  onClick={() => {
                    updateData({ roomPhoto: null, roomPhotoPreview: null })
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="text-sm text-christmas-red hover:underline"
                >
                  Remove photo
                </button>
              </div>
            ) : (
              <div
                className="cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-4xl mb-2">🎄</div>
                <p className="text-white/70">
                  Drag and drop a photo of your room with the Christmas tree
                </p>
                <p className="text-xs text-white/50 mt-2">
                  Best if you capture the whole room with the standing tree
                </p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="mt-4 text-xs text-white/50 space-y-1">
            <p>💡 <strong>Tips:</strong></p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Take the photo during daytime with good lighting</li>
              <li>Show the whole tree and some floor space</li>
              <li>The more of the room visible, the better for the elves!</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={prevStep}
          className="px-6 py-3 text-white/70 hover:text-white transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`btn-christmas px-8 py-3 ${isSubmitting ? 'opacity-50' : ''}`}
        >
          {isSubmitting ? 'Preparing...' : 'Preview & Pay →'}
        </button>
      </div>

      {/* Skip option */}
      {!data.roomPhotoPreview && (
        <div className="mt-4 text-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="text-sm text-white/50 hover:text-white/70 underline"
          >
            Skip this step - I don&apos;t want elf scenes
          </button>
        </div>
      )}
    </div>
  )
}
