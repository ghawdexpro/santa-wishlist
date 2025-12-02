'use client'

import { useWizard } from './WizardContext'

const suggestions = [
  "keeping their room tidy",
  "listening the first time",
  "being patient with siblings",
  "doing homework before playing",
  "eating more vegetables",
  "going to bed on time",
  "not complaining when asked for help",
  "using kind words when upset",
]

export default function Step4Improve() {
  const { data, updateData, nextStep, prevStep, isStepValid } = useWizard()

  const handleSuggestionClick = (suggestion: string) => {
    updateData({ thingToImprove: suggestion })
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">💪</div>
        <h2 className="text-2xl font-bold glow-gold mb-2">
          What can {data.childName || 'your child'} work on?
        </h2>
        <p className="text-white/70">
          Santa will gently encourage improvement in this area
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-christmas-gold mb-2">
            Area to improve *
          </label>
          <textarea
            value={data.thingToImprove}
            onChange={(e) => updateData({ thingToImprove: e.target.value })}
            placeholder="e.g., Sometimes it's hard for you to keep your room tidy, and I know mom and dad would like you to try harder..."
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-christmas-gold focus:outline-none focus:ring-2 focus:ring-christmas-gold/50 min-h-[120px]"
            maxLength={300}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-white/50">
              Santa will be gentle and encouraging - never harsh!
            </p>
            <p className="text-xs text-white/50">
              {data.thingToImprove.length}/300
            </p>
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <p className="text-sm text-white/50 mb-2">Common areas (click to use):</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  data.thingToImprove === suggestion
                    ? 'bg-christmas-gold text-black'
                    : 'bg-white/10 hover:bg-white/20 text-white/70 hover:text-white'
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Validation Message */}
      {!isStepValid(4) && data.thingToImprove.length > 0 && (
        <div className="mt-4 p-3 bg-christmas-red/20 border border-christmas-red/40 rounded-lg text-center">
          <p className="text-white/90 text-sm">
            ⚠️ Please write at least 10 characters ({10 - data.thingToImprove.length} more needed)
          </p>
        </div>
      )}

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
          disabled={!isStepValid(4)}
          className={`btn-christmas px-8 py-3 ${
            !isStepValid(4) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Next Step →
        </button>
      </div>
    </div>
  )
}
