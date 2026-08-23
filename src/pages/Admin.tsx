import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Beer,
  FileText,
  Home,
  LogOut,
  Plus,
  Save,
  Search,
  Trash2,
  Utensils,
  Users,
} from 'lucide-react'
import { BEER_STYLES, MENU_CATEGORIES, normalizeTaps } from '@shared/types'
import type { MenuCategoryId, MenuItem, PriceVariant, SiteData, Tap } from '@shared/types'
import {
  adminLogin,
  adminLogout,
  checkAdminSession,
  saveSiteData,
  uploadSpecials,
} from '../lib/api'

type Tab = 'taps' | 'menu' | 'flyer' | 'inbox'

const emptyNewItem = {
  name: '',
  category: 'starters' as MenuCategoryId,
  group: '',
  description: '',
  variants: [{ id: 'std', label: '', price: '' }] as { id: string; label: string; price: string }[],
}

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
  const [draft, setDraft] = useState<SiteData>({ ...data, taps: normalizeTaps(data.taps) })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [q, setQ] = useState('')
  const [menuCat, setMenuCat] = useState<MenuCategoryId | 'all'>('all')
  const [dragOver, setDragOver] = useState(false)
  const [adding, setAdding] = useState(false)
  const [newItem, setNewItem] = useState(emptyNewItem)

  useEffect(() => {
    checkAdminSession()
      .then(setAuthed)
      .finally(() => setChecking(false))
  }, [])

  useEffect(() => {
    setDraft({ ...data, taps: normalizeTaps(data.taps) })
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
    const payload = { ...draft, taps: normalizeTaps(draft.taps) }
    const ok = await saveSiteData(payload)
    setSaving(false)
    if (ok) {
      onChange(payload)
      setDraft(payload)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } else {
      setError('Save failed — check Cloudflare KV binding.')
    }
  }

  const setTap = (tap: number, patch: Partial<Tap>) => {
    setDraft({
      ...draft,
      taps: normalizeTaps(draft.taps).map((t) => (t.tap === tap ? { ...t, ...patch } : t)),
    })
  }

  const patchMenu = (id: string, patch: Partial<MenuItem>) => {
    setDraft({
      ...draft,
      menu: draft.menu.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    })
  }

  const addDish = () => {
    if (!newItem.name.trim()) {
      setError('New dish needs a name.')
      return
    }
    const variants: PriceVariant[] = newItem.variants
      .filter((v) => v.price !== '')
      .map((v, i) => ({
        id: v.id || `p${i + 1}`,
        label: v.label.trim(),
        price: Number(v.price) || 0,
      }))
    if (!variants.length) {
      setError('Add at least one price.')
      return
    }
    const item: MenuItem = {
      id: `item-${crypto.randomUUID()}`,
      category: newItem.category,
      name: newItem.name.trim(),
      description: newItem.description.trim() || undefined,
      group: newItem.group.trim() || undefined,
      variants,
      available: true,
    }
    setDraft({ ...draft, menu: [...draft.menu, item] })
    setNewItem(emptyNewItem)
    setAdding(false)
    setError('')
    setMenuCat(item.category)
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
          <Link to="/" className="mt-5 flex items-center justify-center gap-2 text-sm text-mist">
            <Home className="h-4 w-4" />
            Back to main page
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-dvh max-w-3xl px-3 pb-28 pt-4">
      <header className="glass mb-4 flex items-center justify-between gap-2 p-3">
        <div>
          <p className="section-kicker">NHG Admin</p>
          <p className="font-display text-lg">Live controls</p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          <Link to="/" className="btn-ghost !py-2 text-sm">
            <Home className="h-4 w-4" />
            Main page
          </Link>
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
          <p className="px-1 text-sm text-mist">14 taps. Toggle a keg off when it kicks.</p>
          {normalizeTaps(draft.taps).map((t) => (
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
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-sm text-mist">86 a dish, change a price, or add something new.</p>
            <button
              type="button"
              className="btn-gold !py-2 text-sm"
              onClick={() => setAdding((v) => !v)}
            >
              <Plus className="h-4 w-4" />
              {adding ? 'Close' : 'Add item'}
            </button>
          </div>

          {adding && (
            <article className="glass mb-4 space-y-2 p-3">
              <p className="font-display text-lg text-gold-bright">New menu item</p>
              <input
                value={newItem.name}
                onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                placeholder="Name"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
              />
              <select
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value as MenuCategoryId })
                }
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
              >
                {MENU_CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
              <input
                value={newItem.group}
                onChange={(e) => setNewItem({ ...newItem, group: e.target.value })}
                placeholder="Group (optional) — e.g. Wraps"
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
              />
              <textarea
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                placeholder="Description (optional)"
                rows={2}
                className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2"
              />
              {newItem.variants.map((v, i) => (
                <div key={v.id} className="grid grid-cols-2 gap-2">
                  <input
                    value={v.label}
                    onChange={(e) => {
                      const variants = [...newItem.variants]
                      variants[i] = { ...v, label: e.target.value }
                      setNewItem({ ...newItem, variants })
                    }}
                    placeholder="Size label (optional)"
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={v.price}
                    onChange={(e) => {
                      const variants = [...newItem.variants]
                      variants[i] = { ...v, price: e.target.value }
                      setNewItem({ ...newItem, variants })
                    }}
                    placeholder="Price"
                    className="rounded-xl border border-white/10 bg-black/30 px-3 py-2"
                  />
                </div>
              ))}
              <div className="flex gap-2">
                <button
                  type="button"
                  className="btn-ghost !py-2 text-sm"
                  onClick={() =>
                    setNewItem({
                      ...newItem,
                      variants: [
                        ...newItem.variants,
                        { id: `p${newItem.variants.length + 1}`, label: '', price: '' },
                      ],
                    })
                  }
                >
                  Add size / price
                </button>
                <button type="button" className="btn-gold !py-2 flex-1 text-sm" onClick={addDish}>
                  Add to menu
                </button>
              </div>
            </article>
          )}

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
                  <input
                    value={item.name}
                    onChange={(e) => patchMenu(item.id, { name: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 font-semibold"
                  />
                  <button
                    type="button"
                    onClick={() => patchMenu(item.id, { available: !item.available })}
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase ${
                      item.available
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {item.available ? 'In' : "86'd"}
                  </button>
                </div>
                <select
                  value={item.category}
                  onChange={(e) =>
                    patchMenu(item.id, { category: e.target.value as MenuCategoryId })
                  }
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
                >
                  {MENU_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
                <input
                  value={item.group ?? ''}
                  onChange={(e) => patchMenu(item.id, { group: e.target.value || undefined })}
                  placeholder="Group (optional)"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
                />
                <textarea
                  value={item.description ?? ''}
                  onChange={(e) =>
                    patchMenu(item.id, { description: e.target.value || undefined })
                  }
                  placeholder="Description"
                  rows={2}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm"
                />
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
                          patchMenu(item.id, {
                            variants: item.variants.map((x) =>
                              x.id === v.id ? { ...x, price } : x,
                            ),
                          })
                        }}
                        className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-ivory"
                      />
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  className="btn-ghost mt-3 !py-2 text-xs text-rose-300"
                  onClick={() => {
                    if (window.confirm(`Remove ${item.name} from the menu?`)) {
                      setDraft({
                        ...draft,
                        menu: draft.menu.filter((m) => m.id !== item.id),
                      })
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </button>
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
