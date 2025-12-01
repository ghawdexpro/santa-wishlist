import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Snowfall from '@/components/Snowfall'

interface Props {
  params: Promise<{ orderId: string }>
}

export default async function ScriptPage({ params }: Props) {
  const { orderId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch order with script
  const { data: order, error } = await supabase
    .from('orders')
    .select(`
      *,
      children (*)
    `)
    .eq('id', orderId)
    .single()

  if (error || !order) {
    notFound()
  }

  // Verify ownership
  if (order.user_id !== user.id) {
    redirect('/dashboard')
  }

  const script = order.generated_script

  if (!script) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Snowfall />
        <div className="card-christmas max-w-md text-center">
          <div className="text-6xl mb-4">📜</div>
          <h1 className="text-2xl font-bold text-christmas-gold mb-4">
            No Script Yet
          </h1>
          <p className="text-white/70 mb-6">
            The script for this order hasn&apos;t been generated yet.
          </p>
          <Link href="/dashboard" className="btn-christmas inline-block">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Get children names
  const childrenNames = order.children?.map((c: { name: string }) => c.name).join(', ') || 'Child'

  return (
    <div className="min-h-screen py-8 px-4">
      <Snowfall />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard" className="text-white/60 hover:text-white mb-2 inline-block">
              ← Return to Dashboard
            </Link>
            <h1 className="text-3xl font-bold glow-gold">
              Script for: {childrenNames}
            </h1>
          </div>
        </div>

        {/* Script Scenes */}
        <div className="space-y-6">
          {script.scenes?.map((scene: {
            sceneNumber: number
            title: string
            duration: string
            setting: string
            santaDialogue: string
            visualDescription: string
            emotionalTone: string
            isPremade: boolean
          }) => (
            <div
              key={scene.sceneNumber}
              className={`card-christmas ${scene.isPremade ? 'opacity-70' : ''}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {scene.isPremade ? '🎬' : '✨'}
                    </span>
                    <h3 className="text-xl font-bold text-christmas-gold">
                      Scene {scene.sceneNumber}: {scene.title}
                    </h3>
                  </div>
                  <p className="text-white/50 text-sm mt-1">
                    {scene.duration} • {scene.emotionalTone}
                  </p>
                </div>
                {scene.isPremade && (
                  <span className="px-3 py-1 bg-white/10 rounded-full text-xs text-white/60">
                    Pre-made
                  </span>
                )}
              </div>

              {/* Setting */}
              <div className="mb-4">
                <p className="text-white/60 text-sm mb-1">Setting:</p>
                <p className="text-white/80">{scene.setting}</p>
              </div>

              {/* Santa's Dialogue */}
              {scene.santaDialogue && (
                <div className="mb-4 p-4 bg-christmas-red/20 rounded-xl border border-christmas-red/30">
                  <p className="text-white/60 text-sm mb-2">🎅 Santa says:</p>
                  <p className="text-white italic">&quot;{scene.santaDialogue}&quot;</p>
                </div>
              )}

              {/* Visual Description */}
              <div>
                <p className="text-white/60 text-sm mb-1">Visual Description:</p>
                <p className="text-white/70 text-sm">{scene.visualDescription}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-8 text-center">
          <Link href="/dashboard" className="btn-christmas inline-block">
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
