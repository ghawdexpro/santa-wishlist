'use client'

import { useWizard } from './WizardContext'

const suggestions = [
  "dzielenie się zabawkami z rodzeństwem",
  "pomaganie w obowiązkach domowych bez proszenia",
  "bycie miłym dla kolegów w szkole",
  "pilna praca nad lekcjami",
  "cierpliwość i czekanie na swoją kolej",
  "opiekowanie się zwierzątkiem",
  "bycie dzielnym u lekarza",
  "próbowanie nowych potraw",
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
          Co {data.childName || 'Twoje dziecko'} zrobiło dobrze?
        </h2>
        <p className="text-white/70">
          Mikołaj pochwali to konkretne zachowanie w filmie
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-christmas-gold mb-2">
            Dobre zachowanie do pochwalenia *
          </label>
          <textarea
            value={data.goodBehavior}
            onChange={(e) => updateData({ goodBehavior: e.target.value })}
            placeholder="np. Byłeś/aś taki miły/a dla swojej siostrzyczki w tym roku, zawsze dzieliłeś/aś się zabawkami i pomagałeś/aś jej..."
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-christmas-gold focus:outline-none focus:ring-2 focus:ring-christmas-gold/50 min-h-[120px]"
            maxLength={300}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-white/50">
              Bądź konkretny - to sprawia, że wiadomość jest bardziej osobista!
            </p>
            <p className="text-xs text-white/50">
              {data.goodBehavior.length}/300
            </p>
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <p className="text-sm text-white/50 mb-2">Szybkie sugestie (kliknij aby dodać):</p>
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
          ← Wstecz
        </button>
        <button
          onClick={nextStep}
          disabled={!isStepValid(3)}
          className={`btn-christmas px-8 py-3 ${
            !isStepValid(3) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Następny krok →
        </button>
      </div>
    </div>
  )
}
