'use client'

import { useWizard } from './WizardContext'
import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Step7RoomPhoto() {
  const router = useRouter()
  const { data, updateData, prevStep, isStepValid } = useWizard()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePhotoSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        updateData({
          roomPhoto: file,
          roomPhotoPreview: e.target?.result as string,
        })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handlePhotoSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handlePhotoSelect(e.target.files[0])
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)

    try {
      // Store data in sessionStorage for the script generation page
      sessionStorage.setItem('pendingOrder', JSON.stringify(data))
      // Clear any previously generated script
      sessionStorage.removeItem('generatedScript')
      sessionStorage.removeItem('scriptApproved')
      router.push('/create/script')
    } catch (error) {
      console.error('Error submitting:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🧝</div>
        <h2 className="text-2xl font-bold glow-gold mb-2">Elfy sprawdzą Twój dom!</h2>
        <p className="text-white/70">
          Wyślij zdjęcie pokoju z choinką - nasze elfy pojawią się w nim jak prawdziwi zwiadowcy Mikołaja!
        </p>
      </div>

      {/* Feature explanation */}
      <div className="bg-christmas-green/20 border border-christmas-green/40 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-christmas-gold mb-2">Co zyskujesz?</h3>
        <ul className="text-sm text-white/80 space-y-2">
          <li className="flex items-start gap-2">
            <span>👀</span>
            <span>Elf zagląda zza choinki - sprawdza czy dziecko śpi</span>
          </li>
          <li className="flex items-start gap-2">
            <span>📋</span>
            <span>Elfy robią notatki - &quot;Dom sprawdzony, gotowy na wizytę!&quot;</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✨</span>
            <span>Magiczne ujęcia w PRAWDZIWYM pokoju Twojego dziecka!</span>
          </li>
        </ul>
      </div>

      <div className="space-y-6">
        {/* Room Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-christmas-gold mb-2">
            Zdjęcie pokoju z choinką (opcjonalne)
          </label>
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              dragActive
                ? 'border-christmas-gold bg-christmas-gold/10'
                : 'border-white/30 hover:border-white/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />

            {data.roomPhotoPreview ? (
              <div className="space-y-4">
                <img
                  src={data.roomPhotoPreview}
                  alt="Podgląd pokoju"
                  className="w-full max-w-xs mx-auto rounded-lg border-2 border-christmas-gold"
                />
                <p className="text-sm text-christmas-gold">
                  Super! Elfy już planują wizytę w tym pokoju!
                </p>
                <button
                  onClick={() => {
                    updateData({ roomPhoto: null, roomPhotoPreview: null })
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="text-sm text-christmas-red hover:underline"
                >
                  Usuń zdjęcie
                </button>
              </div>
            ) : (
              <div
                className="cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-4xl mb-2">🎄</div>
                <p className="text-white/70">
                  Przeciągnij i upuść zdjęcie pokoju z choinką
                </p>
                <p className="text-xs text-white/50 mt-2">
                  Najlepiej całe zdjęcie pokoju ze stojącą choinką
                </p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="mt-4 text-xs text-white/50 space-y-1">
            <p>💡 <strong>Wskazówki:</strong></p>
            <ul className="list-disc list-inside pl-4 space-y-1">
              <li>Zrób zdjęcie w dzień przy dobrym oświetleniu</li>
              <li>Pokaż całą choinkę i trochę podłogi</li>
              <li>Im więcej widać pokoju, tym lepiej dla elfów!</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={prevStep}
          className="px-6 py-3 text-white/70 hover:text-white transition-colors"
        >
          ← Wróć
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className={`btn-christmas px-8 py-3 ${isSubmitting ? 'opacity-50' : ''}`}
        >
          {isSubmitting ? 'Przygotowuję...' : 'Zobacz podgląd i zapłać →'}
        </button>
      </div>

      {/* Skip option */}
      {!data.roomPhotoPreview && (
        <div className="mt-4 text-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="text-sm text-white/50 hover:text-white/70 underline"
          >
            Pomiń ten krok - nie chcę scen z elfami
          </button>
        </div>
      )}
    </div>
  )
}
