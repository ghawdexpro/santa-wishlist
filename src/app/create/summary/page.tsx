'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { WizardData } from '@/components/CreateWizard/WizardContext'

export default function SummaryPage() {
  const router = useRouter()
  const [data, setData] = useState<WizardData | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('pendingOrder')
    if (stored) {
      setData(JSON.parse(stored))
    } else {
      router.push('/create')
    }
  }, [router])

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">🎅</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">✨</div>
          <h1 className="text-3xl font-bold glow-gold">Ready to Create Magic!</h1>
          <p className="text-white/70 mt-2">
            Review your details before we generate your personalized script
          </p>
        </div>

        <div className="card-christmas space-y-6">
          {/* Child Info */}
          <div className="flex items-center gap-4 pb-4 border-b border-white/10">
            {data.childPhotoPreview ? (
              <img
                src={data.childPhotoPreview}
                alt={data.childName}
                className="w-20 h-20 rounded-full object-cover border-4 border-christmas-gold"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center text-3xl">
                👶
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold text-christmas-gold">{data.childName}</h2>
              <p className="text-white/70">{data.childAge} years old</p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-christmas-gold mb-1">
                Good Behavior to Praise ⭐
              </h3>
              <p className="text-white/80">{data.goodBehavior}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-christmas-gold mb-1">
                Area for Improvement 💪
              </h3>
              <p className="text-white/80">{data.thingToImprove}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-christmas-gold mb-1">
                Goal to Encourage 🎯
              </h3>
              <p className="text-white/80">{data.thingToLearn}</p>
            </div>

            {data.customMessage && (
              <div>
                <h3 className="text-sm font-medium text-christmas-gold mb-1">
                  Custom Message 💌
                </h3>
                <p className="text-white/80">{data.customMessage}</p>
              </div>
            )}
          </div>
        </div>

        {/* What's Next */}
        <div className="card-christmas mt-6">
          <h3 className="text-lg font-bold text-christmas-gold mb-4">What Happens Next?</h3>
          <ol className="space-y-3 text-white/80">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-christmas-red flex items-center justify-center text-sm font-bold">1</span>
              <span>We&apos;ll generate a personalized script for Santa to say</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-christmas-red flex items-center justify-center text-sm font-bold">2</span>
              <span>You&apos;ll see keyframe images showing each scene</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-christmas-red flex items-center justify-center text-sm font-bold">3</span>
              <span>Approve the script and visuals</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-christmas-red flex items-center justify-center text-sm font-bold">4</span>
              <span>Pay $59 to start video creation</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-christmas-green flex items-center justify-center text-sm font-bold">5</span>
              <span>Receive your magical video within 24-48 hours!</span>
            </li>
          </ol>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/create"
            className="px-6 py-3 text-white/70 hover:text-white transition-colors text-center"
          >
            ← Edit Details
          </Link>
          <button
            className="btn-christmas px-8 py-3 flex items-center justify-center gap-2"
            onClick={() => {
              // In Stage 5, this will call the Gemini API to generate script
              alert('Script generation will be added in Stage 5!')
            }}
          >
            Generate Script <span className="text-xl">✨</span>
          </button>
        </div>

        <p className="text-center mt-4 text-white/50 text-sm">
          You won&apos;t be charged until you approve the script and visuals
        </p>
      </div>
    </div>
  )
}
