import { useEffect, useMemo, useState } from 'react'
import {
  Beer,
  FileText,
  LogOut,
  Save,
  Search,
  Utensils,
  Users,
} from 'lucide-react'
import { BEER_STYLES, MENU_CATEGORIES } from '@shared/types'
import type { MenuCategoryId, SiteData, Tap } from '@shared/types'
import {
  adminLogin,
  adminLogout,
  checkAdminSession,
  saveSiteData,
  uploadSpecials,
} from '../lib/api'

type Tab = 'taps' | 'menu' | 'flyer' | 'inbox'

export default function Admin({
  data,
  onChange,
}: {
  data: SiteData
  onChange: (d: SiteData) => void
}) {
  const [authed, setAuthed] = useState(false)
  const [checking, setChecking] = useState(true)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('taps')
  const [draft, setDraft] = useState<SiteData>(data)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [q, setQ] = useState('')
  const [menuCat, setMenuCat] = useState<MenuCategoryId | 'all'>('all')
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    checkAdminSession()
      .then(setAuthed)
      .finally(() => setChecking(false))
  }, [])

  useEffect(() => {
    setDraft(data)
  }, [data])

  const login = async () => {
    setError('')
    const ok = await adminLogin(pin)
    if (ok) {
      setAuthed(true)
      setPin('')
    } else {
      setError('Wrong PIN')
      setPin('')
    }
  }

  const persist = async () => {
    setSaving(true)
    const ok = await saveSiteData(draft)
    setSaving(false)
    if (ok) {
      onChange(draft)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      setError('Save failed — check Cloudflare KV binding.')
    }
  }

  const setTap = (tap: number, patch: Partial<Tap>) => {
    setDraft({
      ...draft,
      taps: draft.taps.map((t) => (t.tap === tap ? { ...t, ...patch } : t)),
    })
  }

  const menuItems = useMemo(() => {
    return draft.menu.filter((m) => {
      const catOk = menuCat === 'all' || m.category === menuCat
      const hay = `${m.name} ${m.description ?? ''} ${m.group ?? ''}`.toLowerCase()
      return catOk && hay.includes(q.toLowerCase())
    })
  }, [draft.menu, menuCat, q])

  const onFile = async (file?: File) => {
    if (!file) return
    const ok = await uploadSpecials(file)
    if (ok) {
      const next = {
        ...draft,
        specials: { hasFlyer: true, updatedAt: new Date().toISOString() },
      }
      setDraft(next)
      onChange(next)
    } else {
      setError('Upload failed — check R2 binding and login session.')
    }
  }

  if (checking) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <p className="text-mist">Checking session…</p>
      </div>
    )
  }

  if (!authed) {
    return (
      <div className="mx-auto grid min-h-dvh max-w-sm place-items-center px-4">
        <div className="glass w-full p-6">
          <p className="section-kicker">Owner Portal</p>
          <h1 className="font-display mt-2 text-3xl">Enter PIN</h1>
          <p className="mt-2 text-sm text-mist">Mobile-first. Changes go live instantly.</p>
          <input
            inputMode="numeric"
            autoFocus
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void login()}
            className="mt-5 w-full rounded-2xl border border-gold/40 bg-black/40 px-4 py-4 text-center text-2xl tracking-[0.4em] outline-none"
          />
          <div className="mt-4 grid grid-cols-3 gap-2">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '←', '0', 'Go'].map((k) => (
              <button
                key={k}
                type="button"
                className="btn-ghost !rounded-2xl !py-4 text-lg"
                onClick={() => {
                  if (k === '←') setPin((p) => p.slice(0, -1))
                  else if (k === 'Go') void login()
                  else setPin((p) => (p + k).slice(0, 8))
                }}
              >
                {k}
              </button>
            ))}
          </div>
          {error && <p className="mt-3 text-center text-sm text-rose-300">{error}</p>}
          <a href="/" className="mt-5 block text-center text-sm text-mist">
            Back to site
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-3 pb-28 pt-4">
      <header className="glass mb-4 flex items-center justify-between p-3">
        <div>
          <p className="section-kicker">NHG Admin</p>
          <p className="font-display text-lg">Live controls</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-gold !py-2 text-sm" onClick={() => void persist()}>
            <Save className="h-4 w-4" />
            {saving ? 'Saving' : saved ? 'Saved' : 'Save'}
          </button>
          <button
            type="button"
            className="btn-ghost !py-2"
            onClick={async () => {
              await adminLogout()
              setAuthed(false)
            }}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {error && <p className="mb-3 text-sm text-rose-300">{error}</p>}

      {tab === 'taps' && (
        <section className="space-y-3">
          {draft.taps.map((t) => (
            <article key={t.tap} className="glass p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-display text-gold-bright">Tap {t.tap}</span>
                <button
                  type="button"
                  onClick={() => setTap(t.tap, { on: !t.on })}
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                    t.on ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {t.on ? 'On' : 'Kicked'}
                </button>
              </div>
              <input
                value={t.name}
                onChange={(e) => setTap(t.tap, { name: e.target.value })}
                className="mb-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                placeholder="Beer name"
              />
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={t.style}
                  onChange={(e) => setTap(t.tap, { style: e.target.value })}
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                >
                  {BEER_STYLES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                  {!BEER_STYLES.includes(t.style as (typeof BEER_STYLES)[number]) && (
                    <option value={t.style}>{t.style}</option>
                  )}
                </select>
                <input
                  type="number"
                  step="0.1"
                  value={t.abv}
                  onChange={(e) => setTap(t.tap, { abv: Number(e.target.value) })}
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                  placeholder="ABV"
                />
                <input
                  value={t.brewery}
                  onChange={(e) => setTap(t.tap, { brewery: e.target.value })}
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                  placeholder="Brewery"
                />
                <input
                  value={t.origin}
                  onChange={(e) => setTap(t.tap, { origin: e.target.value })}
                  className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                  placeholder="Origin"
                />
              </div>
            </article>
          ))}
        </section>
      )}

      {tab === 'menu' && (
        <section>
          <div className="glass mb-3 flex items-center gap-2 p-2">
            <Search className="ml-2 h-4 w-4 text-mist" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search dishes"
              className="w-full bg-transparent py-2 outline-none"
            />
          </div>
          <div className="no-scrollbar mb-3 flex gap-2 overflow-x-auto">
            <button
              type="button"
              className={menuCat === 'all' ? 'btn-gold !py-2 text-sm' : 'btn-ghost !py-2 text-sm'}
              onClick={() => setMenuCat('all')}
            >
              All
            </button>
            {MENU_CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                className={menuCat === c.id ? 'btn-gold !py-2 text-sm' : 'btn-ghost !py-2 text-sm'}
                onClick={() => setMenuCat(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {menuItems.map((item) => (
              <article key={item.id} className="glass p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    {item.group && <p className="text-xs text-mist">{item.group}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        menu: draft.menu.map((m) =>
                          m.id === item.id ? { ...m, available: !m.available } : m,
                        ),
                      })
                    }
                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                      item.available
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {item.available ? 'In' : "86'd"}
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {item.variants.map((v) => (
                    <label key={v.id} className="text-xs text-mist">
                      {v.label || 'Price'}
                      <input
                        type="number"
                        step="0.01"
                        value={v.price}
                        onChange={(e) => {
                          const price = Number(e.target.value)
                          setDraft({
                            ...draft,
                            menu: draft.menu.map((m) =>
                              m.id === item.id
                                ? {
                                    ...m,
                                    variants: m.variants.map((x) =>
                                      x.id === v.id ? { ...x, price } : x,
                                    ),
                                  }
                                : m,
                            ),
                          })
                        }}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-ivory"
                      />
                    </label>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === 'flyer' && (
        <section className="glass p-5">
          <h2 className="font-display text-2xl">Weekly specials PDF</h2>
          <p className="mt-2 text-sm text-mist">
            Drop a flyer to replace <code>specials.pdf</code> in R2. The public button updates
            immediately.
          </p>
          <label
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              void onFile(e.dataTransfer.files[0])
            }}
            className={`mt-5 grid h-40 cursor-pointer place-items-center rounded-2xl border border-dashed ${
              dragOver ? 'border-gold bg-gold/10' : 'border-white/20'
            }`}
          >
            <span className="text-center text-sm text-mist">
              Drag & drop PDF
              <br />
              or tap to upload
            </span>
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={(e) => void onFile(e.target.files?.[0])}
            />
          </label>
          <p className="mt-3 text-xs text-mist">
            {draft.specials.hasFlyer
              ? `Live · updated ${draft.specials.updatedAt ?? ''}`
              : 'No flyer uploaded yet.'}
          </p>
          {draft.specials.hasFlyer && (
            <a href="/api/specials" className="btn-ghost mt-3 text-sm" target="_blank" rel="noreferrer">
              Preview current PDF
            </a>
          )}
        </section>
      )}

      {tab === 'inbox' && (
        <section className="space-y-3">
          {draft.inquiries.length === 0 && (
            <p className="glass p-5 text-sm text-mist">No banquet inquiries yet.</p>
          )}
          {draft.inquiries.map((inq) => (
            <article key={inq.id} className="glass p-4 text-sm">
              <p className="font-semibold">{inq.name}</p>
              <p className="text-mist">
                {inq.phone} · {inq.email}
              </p>
              <p className="mt-1">
                {inq.date} · {inq.guests} guests
              </p>
              {inq.notes && <p className="mt-2 text-mist">{inq.notes}</p>}
            </article>
          ))}
        </section>
      )}

      <nav className="glass-tight fixed inset-x-3 bottom-3 z-50 mx-auto flex max-w-3xl justify-around py-2">
        {(
          [
            ['taps', 'Taps', Beer],
            ['menu', 'Menu', Utensils],
            ['flyer', 'Flyer', FileText],
            ['inbox', 'Inbox', Users],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex flex-col items-center gap-1 px-3 py-1 text-[11px] ${
              tab === id ? 'text-gold-bright' : 'text-mist'
            }`}
          >
            <Icon className="h-5 w-5" />
            {label}
          </button>
        ))}
      </nav>
    </div>
  )
}
