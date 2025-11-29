import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="text-center max-w-5xl mx-auto">
          <div className="text-7xl mb-6">🎅</div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
            <span className="glow-gold">The Santa</span>{' '}
            <span className="text-christmas-red glow-red">Experience</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-4 max-w-3xl mx-auto">
            Give your child a magical, personalized video message from Santa himself.
          </p>
          <p className="text-lg text-christmas-gold mb-8">
            A premium Christmas gift they will never forget.
          </p>

          {/* Demo Video Placeholder */}
          <div className="max-w-3xl mx-auto mb-8 rounded-2xl overflow-hidden border-4 border-christmas-gold/30 bg-black/40">
            <div className="aspect-video flex items-center justify-center bg-gradient-to-br from-christmas-red/20 to-christmas-green/20">
              <div className="text-center">
                <div className="text-6xl mb-4">🎬</div>
                <p className="text-white/60">Demo video coming soon</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/create" className="btn-christmas text-lg px-8 py-4 flex items-center gap-2">
              Create Your Video <span className="text-2xl">🎁</span>
            </Link>
            <div className="text-white/60">
              Starting at <span className="text-christmas-gold font-bold text-xl">$59</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-black/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 glow-gold">
            How It Works
          </h2>
          <p className="text-center text-white/70 mb-12 max-w-2xl mx-auto">
            In just a few minutes, create a personalized Santa video your child will treasure forever.
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-christmas text-center relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-christmas-red flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div className="text-5xl mb-4 mt-4">📝</div>
              <h3 className="text-xl font-bold mb-2 text-christmas-gold">Tell Us About Your Child</h3>
              <p className="text-white/70">
                Share their name, photo, and what makes them special - their achievements and goals.
              </p>
            </div>
            <div className="card-christmas text-center relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-christmas-red flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div className="text-5xl mb-4 mt-4">✨</div>
              <h3 className="text-xl font-bold mb-2 text-christmas-gold">Preview & Approve</h3>
              <p className="text-white/70">
                See the personalized script and visual storyboard before we create your video.
              </p>
            </div>
            <div className="card-christmas text-center relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-christmas-red flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div className="text-5xl mb-4 mt-4">🎬</div>
              <h3 className="text-xl font-bold mb-2 text-christmas-gold">Receive Your Video</h3>
              <p className="text-white/70">
                Get a magical 90-second video of Santa speaking directly to your child by name.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes It Special Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 glow-gold">
            Why Parents Love It
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card-christmas">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🎯</div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-christmas-gold">Truly Personal</h3>
                  <p className="text-white/70">
                    Santa calls your child by name, mentions their photo, and talks about their specific achievements and goals.
                  </p>
                </div>
              </div>
            </div>
            <div className="card-christmas">
              <div className="flex items-start gap-4">
                <div className="text-4xl">💝</div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-christmas-gold">Meaningful Message</h3>
                  <p className="text-white/70">
                    Reinforce good behavior and encourage goals - Santa validates what you&apos;ve been teaching.
                  </p>
                </div>
              </div>
            </div>
            <div className="card-christmas">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🎥</div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-christmas-gold">Premium Quality</h3>
                  <p className="text-white/70">
                    High-definition video with professional Santa in a beautiful North Pole setting.
                  </p>
                </div>
              </div>
            </div>
            <div className="card-christmas">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🎄</div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-christmas-gold">Lasting Memory</h3>
                  <p className="text-white/70">
                    Download and keep forever - a magical keepsake your family will watch year after year.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 bg-black/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 glow-gold">
            Simple Pricing
          </h2>
          <p className="text-white/70 mb-8">
            One magical video, one special price.
          </p>
          <div className="card-christmas max-w-md mx-auto">
            <div className="text-6xl mb-4">🎅</div>
            <h3 className="text-2xl font-bold mb-2 text-christmas-gold">The Santa Experience</h3>
            <div className="text-5xl font-bold mb-4">$59</div>
            <ul className="text-left text-white/80 space-y-3 mb-8">
              <li className="flex items-center gap-2">
                <span className="text-christmas-green">✓</span>
                ~90 second personalized video
              </li>
              <li className="flex items-center gap-2">
                <span className="text-christmas-green">✓</span>
                Child&apos;s name spoken by Santa
              </li>
              <li className="flex items-center gap-2">
                <span className="text-christmas-green">✓</span>
                Photo shown in Santa&apos;s magic book
              </li>
              <li className="flex items-center gap-2">
                <span className="text-christmas-green">✓</span>
                Custom message about achievements
              </li>
              <li className="flex items-center gap-2">
                <span className="text-christmas-green">✓</span>
                Script & storyboard preview
              </li>
              <li className="flex items-center gap-2">
                <span className="text-christmas-green">✓</span>
                HD download to keep forever
              </li>
            </ul>
            <Link href="/create" className="btn-christmas text-lg px-8 py-4 w-full block">
              Create Your Video Now
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 glow-gold">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="card-christmas">
              <h3 className="text-lg font-bold text-christmas-gold mb-2">How long does it take to get my video?</h3>
              <p className="text-white/70">
                After you approve your script and storyboard, videos are typically ready within 24-48 hours.
              </p>
            </div>
            <div className="card-christmas">
              <h3 className="text-lg font-bold text-christmas-gold mb-2">What information do I need to provide?</h3>
              <p className="text-white/70">
                Your child&apos;s name, a photo, their age, something they did well this year, something to work on, and a goal to encourage.
              </p>
            </div>
            <div className="card-christmas">
              <h3 className="text-lg font-bold text-christmas-gold mb-2">Can I preview before paying?</h3>
              <p className="text-white/70">
                Yes! You&apos;ll see the personalized script and visual storyboard for approval before any payment is required.
              </p>
            </div>
            <div className="card-christmas">
              <h3 className="text-lg font-bold text-christmas-gold mb-2">How does Santa mention my child&apos;s photo?</h3>
              <p className="text-white/70">
                Santa opens his magical Nice List book and your child&apos;s photo appears glowing on the page as he calls out their name.
              </p>
            </div>
            <div className="card-christmas">
              <h3 className="text-lg font-bold text-christmas-gold mb-2">Can I download and keep the video?</h3>
              <p className="text-white/70">
                Absolutely! You&apos;ll receive a high-definition video file you can download, save, and share with family.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 px-4 bg-black/20">
        <div className="max-w-4xl mx-auto text-center card-christmas">
          <div className="text-6xl mb-4">🎄</div>
          <h2 className="text-3xl font-bold mb-4 glow-gold">
            Make This Christmas Unforgettable
          </h2>
          <p className="text-white/70 mb-6 max-w-2xl mx-auto">
            Give your child the magic of Santa knowing their name, seeing their face, and speaking directly to them about their year.
          </p>
          <Link href="/create" className="btn-christmas text-lg px-8 py-4 inline-block">
            Create Your Santa Experience 🌟
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-6xl mx-auto text-center text-white/50">
          <p>Made with love and holiday magic | The Santa Experience 2024</p>
        </div>
      </footer>
    </div>
  )
}
