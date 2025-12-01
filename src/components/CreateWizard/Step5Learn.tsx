'use client'

import { useWizard } from './WizardContext'

const suggestions = [
  "jazda na rowerze",
  "wiązanie butów",
  "czytanie trudniejszych książek",
  "nauka pływania",
  "zawieranie nowych przyjaźni",
  "próbowanie nowego sportu",
  "nauka gry na instrumencie",
  "bycie bardziej samodzielnym",
]

export default function Step5Learn() {
  const { data, updateData, nextStep, prevStep, isStepValid } = useWizard()

  const handleSuggestionClick = (suggestion: string) => {
    updateData({ thingToLearn: suggestion })
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🎯</div>
        <h2 className="text-2xl font-bold glow-gold mb-2">
          Co {data.childName || 'Twoje dziecko'} powinno spróbować?
        </h2>
        <p className="text-white/70">
          Mikołaj zachęci do tego celu w nowym roku
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-christmas-gold mb-2">
            Cel lub umiejętność do nauczenia *
          </label>
          <textarea
            value={data.thingToLearn}
            onChange={(e) => updateData({ thingToLearn: e.target.value })}
            placeholder="np. Słyszałem że chcesz nauczyć się jeździć na rowerze! To wspaniałe - wiem że ci się uda jeśli będziesz ćwiczyć..."
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-christmas-gold focus:outline-none focus:ring-2 focus:ring-christmas-gold/50 min-h-[120px]"
            maxLength={300}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-white/50">
              To da dziecku coś, na co może się cieszyć!
            </p>
            <p className="text-xs text-white/50">
              {data.thingToLearn.length}/300
            </p>
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <p className="text-sm text-white/50 mb-2">Popularne cele (kliknij aby użyć):</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  data.thingToLearn === suggestion
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

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={prevStep}
          className="px-6 py-3 text-white/70 hover:text-white transition-colors"
        >
          ← Wstecz
        </button>
        <button
          onClick={nextStep}
          disabled={!isStepValid(5)}
          className={`btn-christmas px-8 py-3 ${
            !isStepValid(5) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Następny krok →
        </button>
      </div>
    </div>
  )
}
