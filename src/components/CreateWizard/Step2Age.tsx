'use client'

import { useWizard } from './WizardContext'

const ageOptions = Array.from({ length: 17 }, (_, i) => i + 2) // Ages 2-18

export default function Step2Age() {
  const { data, updateData, nextStep, prevStep, isStepValid } = useWizard()

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🎂</div>
        <h2 className="text-2xl font-bold glow-gold mb-2">How old is {data.childName || 'your child'}?</h2>
        <p className="text-white/70">
          Santa will adjust his message to the right age level
        </p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
        {ageOptions.map((age) => (
          <button
            key={age}
            onClick={() => updateData({ childAge: age })}
            className={`p-4 rounded-lg text-xl font-bold transition-all ${
              data.childAge === age
                ? 'bg-christmas-gold text-black scale-110'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {age}
          </button>
        ))}
      </div>

      {data.childAge && (
        <p className="text-center mt-4 text-christmas-gold">
          {data.childAge <= 5 && "Perfect age for magical wonders! 🌟"}
          {data.childAge > 5 && data.childAge <= 8 && "Still believes in the magic! ✨"}
          {data.childAge > 8 && data.childAge <= 12 && "Big enough for an important message! 🎄"}
          {data.childAge > 12 && "A special message for a young person! 🎁"}
        </p>
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
          disabled={!isStepValid(2)}
          className={`btn-christmas px-8 py-3 ${
            !isStepValid(2) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          Next Step →
        </button>
      </div>
    </div>
  )
}
