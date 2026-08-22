import { Flame } from 'lucide-react'
import { isTuesdayWingsLive } from '@shared/hours'
import type { SiteData } from '@shared/types'

export default function TuesdayWings({ data }: { data: SiteData }) {
  const live = isTuesdayWingsLive(data)

  return (
    <section id="specials" className="mx-auto max-w-5xl px-4 py-8">
      <article className="glass relative overflow-hidden p-5 sm:p-7">
        <img
          src="/images/wings.jpg"
          alt="Boneless wings"
          className="absolute inset-y-0 right-0 hidden h-full w-[42%] object-cover opacity-80 sm:block"
        />
        <div className="absolute inset-y-0 right-0 hidden w-[42%] bg-gradient-to-l from-transparent to-obsidian/90 sm:block" />

        <div className="relative max-w-xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip">Every Tuesday</span>
            {live && (
              <span className="chip !border-emerald-400/40 !text-emerald-300">Live now</span>
            )}
          </div>
          <h2 className="font-display mt-4 text-3xl sm:text-4xl">
            60¢ Boneless Wings
          </h2>
          <p className="mt-2 text-mist">
            Starts at 3 PM. Tossed in any of our 17 sauces and dry rubs — celery and bleu cheese or
            ranch on the side.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            {['Hot Honey Garlic', 'Smokey Reaper', 'Garlic Parm', 'Mango Habanero', 'Old Bay Rub'].map(
              (s) => (
                <span key={s} className="chip">
                  <Flame className="mr-1 h-3 w-3" />
                  {s}
                </span>
              ),
            )}
          </div>
        </div>
      </article>
    </section>
  )
}
