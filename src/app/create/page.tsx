import { WizardProvider } from '@/components/CreateWizard/WizardContext'
import CreateWizard from '@/components/CreateWizard'

export const metadata = {
  title: 'Create Video | Santa Experience',
  description: 'Create a personalized video from Santa for your child',
}

export default function CreatePage() {
  return (
    <WizardProvider>
      <CreateWizard />
    </WizardProvider>
  )
}
