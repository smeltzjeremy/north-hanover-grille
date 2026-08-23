import { Facebook, Instagram, MapPin, Phone } from 'lucide-react'
import { formatHoursLine } from '@shared/hours'
import type { SiteData } from '@shared/types'

export default function Footer({ data }: { data: SiteData }) {
  return (
    <footer className="mx-auto max-w-5xl px-4 pb-16 pt-6">
      <div className="glass p-6 sm:p-8">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <p className="font-display text-xl">{data.venue.name}</p>
            <p className="mt-2 text-sm text-mist">{data.venue.address}</p>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <a href={data.venue.phoneHref} className="inline-flex items-center gap-2 hover:text-gold">
                <Phone className="h-4 w-4 text-gold" />
                {data.venue.phone}
              </a>
              <a
                href={data.venue.mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-gold"
              >
                <MapPin className="h-4 w-4 text-gold" />
                Get directions
              </a>
              <a
                href={data.venue.facebookUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-gold"
              >
                <Facebook className="h-4 w-4 text-gold" />
                Facebook
              </a>
              <a
                href={data.venue.instagramUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 hover:text-gold"
              >
                <Instagram className="h-4 w-4 text-gold" />
                Instagram
              </a>
            </div>
          </div>
          <div>
            <p className="section-kicker">Hours</p>
            <ul className="mt-3 space-y-1 text-sm">
              {data.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-4">
                  <span>{h.label}</span>
                  <span className="text-mist">{formatHoursLine(h)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="section-kicker">Owner</p>
            <p className="mt-3 text-sm text-mist">
              Tap lineup, 86 switches, and the weekly flyer live in the owner portal.
            </p>
            <a href="/admin" className="btn-ghost mt-4 !py-2 text-sm">
              Owner admin
            </a>
          </div>
        </div>
        <p className="mt-8 text-xs tracking-wide text-mist/70">
          © {new Date().getFullYear()} North Hanover Grille · 37 N. Hanover Street, Carlisle, PA
        </p>
      </div>
    </footer>
  )
}
