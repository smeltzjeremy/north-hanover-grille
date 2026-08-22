import type { SiteData } from '@shared/types'

export default function TapGrid({ data }: { data: SiteData }) {
  const onCount = data.taps.filter((t) => t.on).length

  return (
    <section id="taps" className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="section-kicker">Draft Lineup</p>
          <h2 className="font-display mt-2 text-3xl sm:text-4xl">14 beers on tap</h2>
        </div>
        <p className="text-sm text-mist">
          <span className="text-gold-bright">{onCount}</span> pouring
        </p>
      </div>

      <div className="relative mb-6 overflow-hidden rounded-[16px]">
        <img src="/images/taps.jpg" alt="Tap handles" className="h-40 w-full object-cover sm:h-52" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {data.taps.map((tap) => (
          <article
            key={tap.tap}
            className={`glass flex items-start gap-3 p-4 ${tap.on ? '' : 'opacity-50'}`}
          >
            <span className="font-display grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gold/40 bg-crimson/40 text-gold-bright">
              {tap.tap}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="truncate font-semibold leading-tight">{tap.name}</h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase ${
                    tap.on
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-rose-500/15 text-rose-300'
                  }`}
                >
                  {tap.on ? 'Pouring' : 'Kicked'}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="chip">{tap.style}</span>
                <span className="chip">{tap.abv.toFixed(1)}% ABV</span>
              </div>
              <p className="mt-2 truncate text-xs text-mist">
                {tap.brewery} · {tap.origin}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
