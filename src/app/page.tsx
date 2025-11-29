import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="text-8xl mb-6 animate-bounce">🎄</div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="glow-gold">Santa&apos;s</span>{' '}
            <span className="text-christmas-red glow-red">Nice List</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
            Create magical Christmas wishlists, share them with loved ones, and make gift-giving a breeze this holiday season!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup" className="btn-christmas text-lg px-8 py-4">
              Create Your Wishlist 🎁
            </Link>
            <Link href="/login" className="btn-christmas btn-green text-lg px-8 py-4">
              Sign In 🔔
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 glow-gold">
            Holiday Magic Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-christmas text-center">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold mb-2 text-christmas-gold">Create Wishlists</h3>
              <p className="text-white/70">
                Add all the gifts you&apos;re dreaming of with links, prices, and priority levels.
              </p>
            </div>
            <div className="card-christmas text-center">
              <div className="text-5xl mb-4">🔗</div>
              <h3 className="text-xl font-bold mb-2 text-christmas-gold">Share with Family</h3>
              <p className="text-white/70">
                Share your list with a simple link. Family can see what you want without spoiling surprises!
              </p>
            </div>
            <div className="card-christmas text-center">
              <div className="text-5xl mb-4">🎁</div>
              <h3 className="text-xl font-bold mb-2 text-christmas-gold">Secret Claiming</h3>
              <p className="text-white/70">
                Claim gifts secretly - the recipient never knows who&apos;s getting what!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center card-christmas">
          <div className="text-6xl mb-4">🎅</div>
          <h2 className="text-3xl font-bold mb-4 glow-gold">
            Ready to Make Christmas Magical?
          </h2>
          <p className="text-white/70 mb-6">
            Join thousands of families making gift-giving easier and more fun!
          </p>
          <Link href="/signup" className="btn-christmas text-lg px-8 py-4 inline-block">
            Start Your List Now 🌟
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-white/50">
          <p>Made with love and holiday cheer | Santa&apos;s Nice List 2024</p>
        </div>
      </footer>
    </div>
  )
}
