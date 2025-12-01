'use client'

import { useWizard } from './WizardContext'

const suggestions = [
  "sharing toys with siblings",
  "helping with chores without being asked",
  "being kind to classmates at school",
  "working hard on homework",
  "being patient and waiting their turn",
  "taking care of their pet",
  "being brave at the doctor",
  "trying new foods",
]

export default function Step3GoodBehavior() {
  const { data, updateData, nextStep, prevStep, isStepValid } = useWizard()

  const handleSuggestionClick = (suggestion: string) => {
    const current = data.goodBehavior
    if (current) {
      updateData({ goodBehavior: `${current}, ${suggestion}` })
    } else {
      updateData({ goodBehavior: suggestion })
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">⭐</div>
        <h2 className="text-2xl font-bold glow-gold mb-2">
          What has {data.childName || 'your child'} done well?
        </h2>
        <p className="text-white/70">
          Santa will praise this specific behavior in the video
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-christmas-gold mb-2">
            Good behavior to praise *
          </label>
          <textarea
            value={data.goodBehavior}
            onChange={(e) => updateData({ goodBehavior: e.target.value })}
            placeholder="e.g., You've been so kind to your little sister this year, always sharing your toys and helping her..."
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-christmas-gold focus:outline-none focus:ring-2 focus:ring-christmas-gold/50 min-h-[120px]"
            maxLength={300}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-white/50">
              Be specific - it makes the message more personal!
            </p>
            <p className="text-xs text-white/50">
              {data.goodBehavior.length}/300
            </p>
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <p className="text-sm text-white/50 mb-2">Quick suggestions (click to add):</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1 text-sm bg-white/10 hover:bg-white/20 rounded-full text-white/70 hover:text-white transition-colors"
              >
                + {suggestion}
              </button>
            ))}
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
          onClick={nextStep}
          disabled={!isStepValid(3)}
          className={`btn-christmas px-8 py-3 ${
            !isStepValid(3) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Next Step →
        </button>
      </div>
    </div>
  )
}
