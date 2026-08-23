import { Beer, FileText, Utensils } from 'lucide-react'
import type { SiteData } from '@shared/types'

export default function HeroHub({ data }: { data: SiteData }) {
  const pouring = data.taps.filter((t) => t.on && t.name.trim()).length
  const openSpecials = () => {
    if (data.specials.hasFlyer) {
      window.open('/api/specials', '_blank', 'noopener')
      return
    }
    window.open('/North_Hanover_Grille_TakeOut_Menu.pdf', '_blank', 'noopener')
  }

  return (
    <section id="top" className="relative isolate min-h-dvh overflow-hidden">
      <img
        src="/images/from-site/int_bar.jpg"
        alt="The bar at North Hanover Grille"
        className="absolute inset-0 h-full w-full object-cover object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/55 via-ink/60 to-ink" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(91,20,39,0.4),transparent_55%)]" />

      <div className="relative mx-auto flex min-h-dvh max-w-5xl flex-col justify-end px-4 pb-16 pt-32 sm:justify-center sm:pb-24">
        <p className="section-kicker">Downtown Carlisle · Hanover &amp; East Louther</p>
        <h1 className="font-display mt-4 max-w-3xl text-4xl leading-[1.05] sm:text-6xl md:text-7xl">
          Wings. Burgers. Wraps.
          <span className="gold-text"> Steak, seafood, pasta.</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-mist sm:text-lg">
          We take pride in preparing and serving the Carlisle area’s best food — plus the best
          selection of drafts, with {pouring} micro and import beers pouring right now on restaurant
          row.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <a href="#menu" className="btn-gold">
            <Utensils className="h-4 w-4" />
            View Full Menu
          </a>
          <a href="#taps" className="btn-ghost">
            <Beer className="h-4 w-4 text-gold" />
            {pouring} Beers On Tap
          </a>
          <button type="button" onClick={openSpecials} className="btn-ghost">
            <FileText className="h-4 w-4 text-gold" />
            {data.specials.hasFlyer ? 'Weekly Specials PDF' : 'Takeout Menu PDF'}
          </button>
        </div>
      </div>
    </section>
  )
}
