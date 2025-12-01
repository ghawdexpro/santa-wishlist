'use client'

import { useState } from 'react'

export default function GenerateElfPage() {
  const [loading, setLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  const generateElf = async () => {
    setLoading(true)
    setError(null)
    setSaved(false)

    try {
      const res = await fetch('/api/admin/generate-elf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate' }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate')
      }

      setImageUrl(`data:image/png;base64,${data.imageBase64}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const saveElf = async () => {
    if (!imageUrl) return

    setLoading(true)
    try {
      const base64 = imageUrl.split(',')[1]
      const res = await fetch('/api/admin/generate-elf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', imageBase64: base64 }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save')
      }

      setSaved(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-christmas-dark to-black p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-christmas-gold mb-8">
          🧝 Generator Elfa Reference
        </h1>

        <div className="card-christmas p-6 mb-6">
          <p className="text-white/70 mb-4">
            Wygeneruj obraz referencyjny elfa, który będzie używany do spójnego wyglądu
            elfów we wszystkich scenach &quot;Elf Reconnaissance&quot;.
          </p>

          <button
            onClick={generateElf}
            disabled={loading}
            className="btn-christmas w-full mb-4"
          >
            {loading ? 'Generuję... (może potrwać 30s)' : 'Wygeneruj nowego elfa'}
          </button>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-4">
              {error}
            </div>
          )}
        </div>

        {imageUrl && (
          <div className="card-christmas p-6">
            <h2 className="text-xl font-bold text-christmas-gold mb-4">
              Podgląd wygenerowanego elfa:
            </h2>

            <div className="flex justify-center mb-6">
              <img
                src={imageUrl}
                alt="Wygenerowany elf"
                className="max-w-md rounded-lg border-4 border-christmas-gold shadow-2xl"
              />
            </div>

            {saved ? (
              <div className="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded-lg text-center">
                ✅ Zapisano jako public/assets/elf-reference.png
              </div>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={generateElf}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  🔄 Wygeneruj innego
                </button>
                <button
                  onClick={saveElf}
                  disabled={loading}
                  className="flex-1 btn-christmas"
                >
                  ✅ Zatwierdź i zapisz
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
