'use client'

import { useWizard } from './WizardContext'
import { useRef, useState } from 'react'

export default function Step1ChildInfo() {
  const { data, updateData, nextStep, isStepValid } = useWizard()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handlePhotoSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        updateData({
          childPhoto: file,
          childPhotoPreview: e.target?.result as string,
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

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">👶</div>
        <h2 className="text-2xl font-bold glow-gold mb-2">Tell Us About Your Child</h2>
        <p className="text-white/70">
          Santa needs to know who he&apos;s talking to!
        </p>
      </div>

      <div className="space-y-6">
        {/* Child's Name */}
        <div>
          <label className="block text-sm font-medium text-christmas-gold mb-2">
            Child&apos;s Name *
          </label>
          <input
            type="text"
            value={data.childName}
            onChange={(e) => updateData({ childName: e.target.value })}
            placeholder="Enter child's name"
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-christmas-gold focus:outline-none focus:ring-2 focus:ring-christmas-gold/50"
            maxLength={50}
          />
          <p className="mt-1 text-xs text-white/50">
            Santa will address your child by this name in the video
          </p>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-christmas-gold mb-2">
            Child&apos;s Photo (optional)
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

            {data.childPhotoPreview ? (
              <div className="space-y-4">
                <img
                  src={data.childPhotoPreview}
                  alt="Photo preview"
                  className="w-32 h-32 object-cover rounded-full mx-auto border-4 border-christmas-gold"
                />
                <button
                  onClick={() => {
                    updateData({ childPhoto: null, childPhotoPreview: null })
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
                <div className="text-4xl mb-2">📷</div>
                <p className="text-white/70">
                  Drag and drop a photo here, or click to select
                </p>
                <p className="text-xs text-white/50 mt-2">
                  This photo will appear in Santa&apos;s magical book
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-end">
        <button
          onClick={nextStep}
          disabled={!isStepValid(1)}
          className={`btn-christmas px-8 py-3 ${
            !isStepValid(1) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Next Step →
        </button>
      </div>
    </div>
  )
}
