import { WizardProvider } from '@/components/CreateWizard/WizardContext'
import CreateWizard from '@/components/CreateWizard'

export const metadata = {
  title: 'Stwórz film | Magia Świąt',
  description: 'Stwórz spersonalizowany film od Mikołaja dla swojego dziecka',
}

export default function CreatePage() {
  return (
    <WizardProvider>
      <CreateWizard />
    </WizardProvider>
  )
}
