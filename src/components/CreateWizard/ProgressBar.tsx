'use client'

import { useWizard } from './WizardContext'

const stepLabels = [
  'Child Info',
  'Age',
  'Good Behavior',
  'To Improve',
  'Goals',
  'Message',
]

export default function ProgressBar() {
  const { currentStep, totalSteps, setCurrentStep, isStepValid } = useWizard()

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      {/* Progress bar */}
      <div className="relative">
        {/* Background line */}
        <div className="absolute top-4 left-0 right-0 h-1 bg-white/20 rounded-full" />

        {/* Progress line */}
        <div
          className="absolute top-4 left-0 h-1 bg-christmas-gold rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {/* Step indicators */}
        <div className="relative flex justify-between">
          {stepLabels.map((label, index) => {
            const stepNumber = index + 1
            const isCompleted = stepNumber < currentStep
            const isCurrent = stepNumber === currentStep
            const canNavigate = stepNumber < currentStep || (stepNumber === currentStep + 1 && isStepValid(currentStep))

            return (
              <button
                key={stepNumber}
                onClick={() => canNavigate && setCurrentStep(stepNumber)}
                disabled={!canNavigate && stepNumber !== currentStep}
                className={`flex flex-col items-center ${canNavigate ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    isCompleted
                      ? 'bg-christmas-green text-white'
                      : isCurrent
                      ? 'bg-christmas-gold text-black'
                      : 'bg-white/20 text-white/50'
                  }`}
                >
                  {isCompleted ? '✓' : stepNumber}
                </div>
                <span
                  className={`mt-2 text-xs hidden sm:block ${
                    isCurrent ? 'text-christmas-gold' : 'text-white/50'
                  }`}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
