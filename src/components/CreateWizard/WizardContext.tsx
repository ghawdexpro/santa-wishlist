'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

export interface WizardData {
  // Step 1: Child info
  childName: string
  childPhoto: File | null
  childPhotoPreview: string | null

  // Step 2: Age
  childAge: number | null

  // Step 3: Good behavior
  goodBehavior: string

  // Step 4: Thing to improve
  thingToImprove: string

  // Step 5: Thing to learn
  thingToLearn: string

  // Step 6: Custom message (optional)
  customMessage: string
}

interface WizardContextType {
  currentStep: number
  setCurrentStep: (step: number) => void
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
  nextStep: () => void
  prevStep: () => void
  isStepValid: (step: number) => boolean
  totalSteps: number
}

const initialData: WizardData = {
  childName: '',
  childPhoto: null,
  childPhotoPreview: null,
  childAge: null,
  goodBehavior: '',
  thingToImprove: '',
  thingToLearn: '',
  customMessage: '',
}

const WizardContext = createContext<WizardContextType | undefined>(undefined)

export function WizardProvider({ children }: { children: ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<WizardData>(() => {
    // Try to restore from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('santaWizardData')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // Don't restore file objects, only text data
          return { ...initialData, ...parsed, childPhoto: null }
        } catch {
          return initialData
        }
      }
    }
    return initialData
  })

  const totalSteps = 6

  const updateData = (updates: Partial<WizardData>) => {
    setData(prev => {
      const newData = { ...prev, ...updates }
      // Save to localStorage (except file)
      if (typeof window !== 'undefined') {
        const toSave = { ...newData, childPhoto: null, childPhotoPreview: null }
        localStorage.setItem('santaWizardData', JSON.stringify(toSave))
      }
      return newData
    })
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return data.childName.trim().length >= 2
      case 2:
        return data.childAge !== null && data.childAge >= 1 && data.childAge <= 18
      case 3:
        return data.goodBehavior.trim().length >= 10
      case 4:
        return data.thingToImprove.trim().length >= 10
      case 5:
        return data.thingToLearn.trim().length >= 10
      case 6:
        return true // Optional step
      default:
        return false
    }
  }

  return (
    <WizardContext.Provider
      value={{
        currentStep,
        setCurrentStep,
        data,
        updateData,
        nextStep,
        prevStep,
        isStepValid,
        totalSteps,
      }}
    >
      {children}
    </WizardContext.Provider>
  )
}

export function useWizard() {
  const context = useContext(WizardContext)
  if (context === undefined) {
    throw new Error('useWizard must be used within a WizardProvider')
  }
  return context
}
