import { useMemo, useState } from 'react'
import { MENU_CATEGORIES } from '@shared/types'
import type { MenuCategoryId, SiteData } from '@shared/types'
import { usd } from '../lib/format'

export default function MenuDeck({ data }: { data: SiteData }) {
  const [cat, setCat] = useState<MenuCategoryId>('wings')

  const items = useMemo(
    () => data.menu.filter((m) => m.category === cat),
    [data.menu, cat],
  )

  const groups = useMemo(() => {
    const map = new Map<string, typeof items>()
    for (const item of items) {
      const key = item.group || ''
      const arr = map.get(key) ?? []
      arr.push(item)
      map.set(key, arr)
    }
    return [...map.entries()]
  }, [items])

  return (
    <section id="menu" className="mx-auto max-w-5xl px-4 py-10">
      <p className="section-kicker">The Board</p>
      <h2 className="font-display mt-2 text-3xl sm:text-4xl">Full menu</h2>
      <p className="mt-2 max-w-2xl text-mist">
        Current takeout board from northhanovergrille.com — wings, shareables, scratch soups, wraps,
        burgers, and dinners. 86'd items stay visible so you know what's out.{' '}
        <a
          href="/North_Hanover_Grille_TakeOut_Menu.pdf"
          target="_blank"
          rel="noreferrer"
          className="text-gold-bright underline-offset-2 hover:underline"
        >
          Download the takeout PDF
        </a>
        .
      </p>

      <div className="no-scrollbar mt-6 flex gap-2 overflow-x-auto pb-2">
        {MENU_CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCat(c.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold tracking-wide ${
              cat === c.id ? 'btn-gold !py-2' : 'btn-ghost !py-2'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {cat === 'wings' && (
        <div className="glass mt-4 p-4">
          <p className="text-sm text-mist">{data.wingNotes}</p>
          <p className="mt-3 text-[10px] tracking-[0.2em] text-gold uppercase">
            17 Sauces & Dry Rubs
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {data.sauces.map((s) => (
              <span key={s} className="chip">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 space-y-8">
        {groups.map(([group, list]) => (
          <div key={group || 'default'}>
            {group && (
              <h3 className="font-display mb-3 text-xl text-gold-bright">{group}</h3>
            )}
            <div className="grid gap-3">
              {list.map((item) => (
                <article
                  key={item.id}
                  className={`glass p-4 ${item.available ? '' : 'opacity-55'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold">{item.name}</h4>
                      {item.description && (
                        <p className="mt-1 text-sm text-mist">{item.description}</p>
                      )}
                    </div>
                    {!item.available && (
                      <span className="chip !text-rose-200">86'd</span>
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                    {item.variants.map((v) => (
                      <span key={v.id} className="price">
                        {v.label ? `${v.label} ` : ''}
                        {usd(v.price)}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
