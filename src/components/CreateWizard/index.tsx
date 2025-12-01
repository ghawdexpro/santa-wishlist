'use client'

import { useWizard } from './WizardContext'
import ProgressBar from './ProgressBar'
import Step1ChildInfo from './Step1ChildInfo'
import Step2Age from './Step2Age'
import Step3GoodBehavior from './Step3GoodBehavior'
import Step4Improve from './Step4Improve'
import Step5Learn from './Step5Learn'
import Step6CustomMessage from './Step6CustomMessage'
import Step7RoomPhoto from './Step7RoomPhoto'

export default function CreateWizard() {
  const { currentStep } = useWizard()

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1ChildInfo />
      case 2:
        return <Step2Age />
      case 3:
        return <Step3GoodBehavior />
      case 4:
        return <Step4Improve />
      case 5:
        return <Step5Learn />
      case 6:
        return <Step6CustomMessage />
      case 7:
        return <Step7RoomPhoto />
      default:
        return <Step1ChildInfo />
    }
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold glow-gold">Create Your Santa Video</h1>
          <p className="text-white/70 mt-2">
            Fill in the details below to create a magical, personalized video
          </p>
        </div>

        {/* Progress Bar */}
        <ProgressBar />

        {/* Step Content */}
        <div className="card-christmas">
          {renderStep()}
        </div>

        {/* Price reminder */}
        <div className="text-center mt-6 text-white/50 text-sm">
          Preview script and visuals before payment • Starting at $59 per video
        </div>
      </div>
    </div>
  )
}
