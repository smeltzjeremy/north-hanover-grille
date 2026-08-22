import { Beer, FileText, Utensils } from 'lucide-react'
import type { SiteData } from '@shared/types'

export default function HeroHub({ data }: { data: SiteData }) {
  const openSpecials = () => {
    if (data.specials.hasFlyer) {
      window.open('/api/specials', '_blank', 'noopener')
      return
    }
    document.getElementById('specials')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="top" className="relative isolate min-h-dvh overflow-hidden">
      <img
        src="/images/hero.jpg"
        alt="The bar at North Hanover Grille"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/55 to-ink" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(91,20,39,0.35),transparent_55%)]" />

      <div className="relative mx-auto flex min-h-dvh max-w-5xl flex-col justify-end px-4 pb-16 pt-32 sm:justify-center sm:pb-24">
        <p className="section-kicker">Downtown Carlisle · Restaurant Row</p>
        <h1 className="font-display mt-4 max-w-3xl text-4xl leading-[1.05] sm:text-6xl md:text-7xl">
          A dark modern
          <span className="gold-text"> gastropub</span>
          <span className="block">with 14 live taps.</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-mist sm:text-lg">
          Jumbo wings, half-pound burgers, steaks and seafood — poured and plated at 37 N. Hanover
          Street. Tuesday boneless wings go 60¢ from 3 PM.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <a href="#menu" className="btn-gold">
            <Utensils className="h-4 w-4" />
            View Full Menu
          </a>
          <a href="#taps" className="btn-ghost">
            <Beer className="h-4 w-4 text-gold" />
            14 Beers On Tap
          </a>
          <button type="button" onClick={openSpecials} className="btn-ghost">
            <FileText className="h-4 w-4 text-gold" />
            Weekly Specials PDF
          </button>
        </div>
      </div>
    </section>
  )
}
