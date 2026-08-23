import { useState, type FormEvent } from 'react'
import { Calendar, Users } from 'lucide-react'
import type { SiteData } from '@shared/types'
import { sendInquiry } from '../lib/api'

export default function BanquetCard({ data }: { data: SiteData }) {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    guests: '',
    notes: '',
  })

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    const ok = await sendInquiry(form)
    setBusy(false)
    if (ok) setSent(true)
  }

  return (
    <section id="banquet" className="mx-auto max-w-5xl px-4 py-10">
      <article className="glass overflow-hidden">
        <img
          src="/images/from-site/int_dr1.jpg"
          alt="Rear dining room at North Hanover Grille"
          className="h-56 w-full object-cover"
        />
        <div className="p-6 sm:p-8">
          <p className="section-kicker">Private Dining Suite</p>
          <h2 className="font-display mt-2 text-3xl">Room for {data.banquet.capacity}.</h2>
          <p className="mt-3 max-w-2xl text-mist">{data.banquet.blurb}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <span className="chip">
              <Users className="mr-1 h-3 w-3" />
              Up to {data.banquet.capacity} guests
            </span>
            <span className="chip">
              <Calendar className="mr-1 h-3 w-3" />
              Downtown Carlisle
            </span>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" className="btn-gold" onClick={() => setOpen(true)}>
              Inquire about the room
            </button>
            <a href={data.venue.phoneHref} className="btn-ghost">
              Call {data.venue.phone}
            </a>
          </div>
        </div>
      </article>

      {open && (
        <div className="fixed inset-0 z-[80] grid place-items-end bg-black/60 p-3 sm:place-items-center">
          <form onSubmit={submit} className="glass w-full max-w-md p-5">
            <h3 className="font-display text-2xl">Banquet inquiry</h3>
            {sent ? (
              <p className="mt-4 text-mist">
                Received. We’ll confirm by phone. You can also reach us at {data.venue.phone}.
              </p>
            ) : (
              <div className="mt-4 grid gap-3">
                {(
                  [
                    ['name', 'Name', 'text'],
                    ['phone', 'Phone', 'tel'],
                    ['email', 'Email', 'email'],
                    ['date', 'Preferred date', 'date'],
                    ['guests', 'Guest count', 'number'],
                  ] as const
                ).map(([key, label, type]) => (
                  <label key={key} className="grid gap-1 text-sm">
                    {label}
                    <input
                      required={key === 'name' || key === 'phone'}
                      type={type}
                      value={form[key]}
                      onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 outline-none focus:border-gold"
                    />
                  </label>
                ))}
                <label className="grid gap-1 text-sm">
                  Notes
                  <textarea
                    rows={3}
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 outline-none focus:border-gold"
                  />
                </label>
              </div>
            )}
            <div className="mt-5 flex gap-2">
              <button type="button" className="btn-ghost flex-1" onClick={() => setOpen(false)}>
                Close
              </button>
              {!sent && (
                <button type="submit" className="btn-gold flex-1" disabled={busy}>
                  {busy ? 'Sending…' : 'Send'}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </section>
  )
}
