import { Phone } from 'lucide-react'
import { getOpenStatus } from '@shared/hours'
import type { SiteData } from '@shared/types'

const links = [
  { href: '#menu', label: 'Menu' },
  { href: '#taps', label: 'On Tap' },
  { href: '#specials', label: 'Specials' },
  { href: '#banquet', label: 'Private Dining' },
]

export default function HeaderDock({ data }: { data: SiteData }) {
  const status = getOpenStatus(data)

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50 p-3 sm:p-4">
      <div className="glass-tight pointer-events-auto mx-auto flex max-w-5xl flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:px-4">
        <a href="#top" className="flex min-w-0 items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full bg-white shadow-[0_0_0_1px_rgba(212,175,55,0.65)]">
            <img src="/images/logo-live.png" alt="" className="h-10 w-10 object-contain" />
          </span>
          <span className="min-w-0">
            <span className="font-display block truncate text-sm tracking-[0.14em] text-ivory sm:text-base">
              {data.venue.shortName}
            </span>
            <span className="block text-[10px] tracking-[0.22em] text-mist uppercase">
              Carlisle, PA
            </span>
          </span>
        </a>

        <nav className="hidden flex-1 items-center justify-center gap-5 text-xs tracking-[0.16em] text-mist uppercase md:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="hover:text-gold-bright">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-between gap-2 sm:justify-end">
          <div
            className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5"
            aria-live="polite"
          >
            <span
              className={`h-2 w-2 rounded-full ${status.isOpen ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : 'bg-rose-500'}`}
            />
            <span className="text-xs font-semibold">
              {status.label}
              <span className="hidden text-mist font-normal sm:inline"> · {status.detail}</span>
            </span>
          </div>
          <a href={data.venue.phoneHref} className="btn-gold !px-3 !py-2 text-sm">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">{data.venue.phone}</span>
            <span className="sm:hidden">Call</span>
          </a>
        </div>
      </div>
    </header>
  )
}
