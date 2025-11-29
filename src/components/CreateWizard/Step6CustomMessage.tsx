'use client'

import { useWizard } from './WizardContext'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Step6CustomMessage() {
  const { data, updateData, prevStep } = useWizard()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)

    // For now, just redirect to a preview/summary page
    // In Stage 4, we'll create the order via API
    try {
      // Store data in sessionStorage for the preview page
      sessionStorage.setItem('pendingOrder', JSON.stringify(data))
      router.push('/create/summary')
    } catch (error) {
      console.error('Error submitting:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">💌</div>
        <h2 className="text-2xl font-bold glow-gold mb-2">
          Any Special Message? (Optional)
        </h2>
        <p className="text-white/70">
          Add anything else you&apos;d like Santa to mention
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-christmas-gold mb-2">
            Custom Message (Optional)
          </label>
          <textarea
            value={data.customMessage}
            onChange={(e) => updateData({ customMessage: e.target.value })}
            placeholder="e.g., Mention that grandma is coming to visit, or that they're getting a new puppy, or anything special for your family..."
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-christmas-gold focus:outline-none focus:ring-2 focus:ring-christmas-gold/50 min-h-[120px]"
            maxLength={500}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-white/50">
              This is completely optional - skip if you don&apos;t need it
            </p>
            <p className="text-xs text-white/50">
              {data.customMessage.length}/500
            </p>
          </div>
        </div>

        {/* Summary Preview */}
        <div className="card-christmas mt-8">
          <h3 className="text-lg font-bold text-christmas-gold mb-4">Quick Summary</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">Child&apos;s Name:</span>
              <span className="text-white font-medium">{data.childName || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Age:</span>
              <span className="text-white font-medium">{data.childAge || '-'} years old</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Photo:</span>
              <span className="text-white font-medium">
                {data.childPhotoPreview ? '✓ Uploaded' : 'Not uploaded'}
              </span>
            </div>
            <div className="pt-2 border-t border-white/10">
              <span className="text-white/70">Good Behavior:</span>
              <p className="text-white text-xs mt-1 line-clamp-2">{data.goodBehavior || '-'}</p>
            </div>
            <div>
              <span className="text-white/70">To Improve:</span>
              <p className="text-white text-xs mt-1 line-clamp-2">{data.thingToImprove || '-'}</p>
            </div>
            <div>
              <span className="text-white/70">Goal:</span>
              <p className="text-white text-xs mt-1 line-clamp-2">{data.thingToLearn || '-'}</p>
            </div>
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
          className={`btn-christmas px-8 py-3 flex items-center gap-2 ${
            isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin">⏳</span>
              Processing...
            </>
          ) : (
            <>
              Review & Continue <span className="text-xl">🎅</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
