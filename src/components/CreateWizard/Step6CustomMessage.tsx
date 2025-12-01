'use client'

import { useWizard } from './WizardContext'

export default function Step6CustomMessage() {
  const { data, updateData, prevStep, nextStep } = useWizard()

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">💌</div>
        <h2 className="text-2xl font-bold glow-gold mb-2">
          Specjalna wiadomość? (Opcjonalnie)
        </h2>
        <p className="text-white/70">
          Dodaj cokolwiek innego, co Mikołaj powinien wspomnieć
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-christmas-gold mb-2">
            Własna wiadomość (Opcjonalnie)
          </label>
          <textarea
            value={data.customMessage}
            onChange={(e) => updateData({ customMessage: e.target.value })}
            placeholder="np. Wspomnij że babcia przyjeżdża w odwiedziny, albo że dostają nowego pieska, albo cokolwiek specjalnego dla Waszej rodziny..."
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-christmas-gold focus:outline-none focus:ring-2 focus:ring-christmas-gold/50 min-h-[120px]"
            maxLength={500}
          />
          <div className="flex justify-between mt-1">
            <p className="text-xs text-white/50">
              To jest całkowicie opcjonalne - pomiń jeśli nie potrzebujesz
            </p>
            <p className="text-xs text-white/50">
              {data.customMessage.length}/500
            </p>
          </div>
        </div>

        {/* Summary Preview */}
        <div className="card-christmas mt-8">
          <h3 className="text-lg font-bold text-christmas-gold mb-4">Szybkie podsumowanie</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">Imię dziecka:</span>
              <span className="text-white font-medium">{data.childName || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Wiek:</span>
              <span className="text-white font-medium">{data.childAge || '-'} lat</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Zdjęcie:</span>
              <span className="text-white font-medium">
                {data.childPhotoPreview ? '✓ Dodane' : 'Nie dodano'}
              </span>
            </div>
            <div className="pt-2 border-t border-white/10">
              <span className="text-white/70">Dobre zachowanie:</span>
              <p className="text-white text-xs mt-1 line-clamp-2">{data.goodBehavior || '-'}</p>
            </div>
            <div>
              <span className="text-white/70">Do poprawy:</span>
              <p className="text-white text-xs mt-1 line-clamp-2">{data.thingToImprove || '-'}</p>
            </div>
            <div>
              <span className="text-white/70">Cel:</span>
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
          ← Wstecz
        </button>
        <button
          onClick={nextStep}
          className="btn-christmas px-8 py-3 flex items-center gap-2"
        >
          Następny krok <span className="text-xl">→</span>
        </button>
      </div>
    </div>
  )
}
