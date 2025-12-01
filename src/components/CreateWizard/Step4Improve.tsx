'use client'

import { useWizard } from './WizardContext'

const suggestions = [
  "utrzymywanie porządku w pokoju",
  "słuchanie od pierwszego razu",
  "cierpliwość wobec rodzeństwa",
  "odrabianie lekcji przed zabawą",
  "jedzenie więcej warzyw",
  "chodzenie spać o czasie",
  "nienarzekanie przy proszeniu o pomoc",
  "używanie miłych słów gdy jest zdenerwowany/a",
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
          Nad czym {data.childName || 'Twoje dziecko'} może popracować?
        </h2>
        <p className="text-white/70">
          Mikołaj delikatnie zachęci do poprawy w tym obszarze
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-christmas-gold mb-2">
            Obszar do poprawy *
          </label>
          <textarea
            value={data.thingToImprove}
            onChange={(e) => updateData({ thingToImprove: e.target.value })}
            placeholder="np. Czasem trudno ci utrzymać porządek w pokoju, i wiem że mama i tata chcieliby żebyś bardziej się starał/a..."
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-christmas-gold focus:outline-none focus:ring-2 focus:ring-christmas-gold/50 min-h-[120px]"
            maxLength={300}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-white/50">
              Mikołaj będzie delikatny i zachęcający - nigdy surowy!
            </p>
            <p className="text-xs text-white/50">
              {data.thingToImprove.length}/300
            </p>
          </div>
        </div>

        {/* Suggestions */}
        <div>
          <p className="text-sm text-white/50 mb-2">Popularne obszary (kliknij aby użyć):</p>
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
          disabled={!isStepValid(4)}
          className={`btn-christmas px-8 py-3 ${
            !isStepValid(4) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Następny krok →
        </button>
      </div>
    </div>
  )
}
