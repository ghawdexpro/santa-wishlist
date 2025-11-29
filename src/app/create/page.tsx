import { WizardProvider } from '@/components/CreateWizard/WizardContext'
import CreateWizard from '@/components/CreateWizard'

export const metadata = {
  title: 'Create Your Video | The Santa Experience',
  description: 'Create a personalized Santa video message for your child',
}

export default function CreatePage() {
  return (
    <WizardProvider>
      <CreateWizard />
    </WizardProvider>
  )
}
