export type DayHours = {
  day: number
  label: string
  open: string | null
  close: string | null
}

export type Tap = {
  tap: number
  name: string
  style: string
  brewery: string
  origin: string
  abv: number
  on: boolean
}

export type PriceVariant = {
  id: string
  label: string
  price: number
}

export type MenuCategoryId =
  | 'wings'
  | 'quesadillas'
  | 'starters'
  | 'soups-salads'
  | 'handhelds'
  | 'entrees'
  | 'sides'
  | 'kids'

export type MenuItem = {
  id: string
  category: MenuCategoryId
  group?: string
  name: string
  description?: string
  variants: PriceVariant[]
  available: boolean
  tags?: string[]
}

export type Inquiry = {
  id: string
  createdAt: string
  name: string
  phone: string
  email: string
  date: string
  guests: string
  notes: string
}

export type SiteData = {
  venue: {
    name: string
    shortName: string
    phone: string
    phoneHref: string
    address: string
    mapsUrl: string
    facebookUrl: string
    instagramUrl: string
    timezone: string
  }
  hours: DayHours[]
  taps: Tap[]
  menu: MenuItem[]
  sauces: string[]
  wingNotes: string
  specials: {
    hasFlyer: boolean
    updatedAt: string | null
  }
  banquet: {
    capacity: number
    blurb: string
  }
  inquiries: Inquiry[]
}

export const TAP_COUNT = 14

export function normalizeTaps(taps: Tap[]): Tap[] {
  const byNum = new Map(taps.map((t) => [t.tap, t]))
  return Array.from({ length: TAP_COUNT }, (_, i) => {
    const n = i + 1
    return (
      byNum.get(n) ?? {
        tap: n,
        name: '',
        style: 'Seasonal',
        brewery: '',
        origin: '',
        abv: 0,
        on: false,
      }
    )
  })
}

export const MENU_CATEGORIES: { id: MenuCategoryId; label: string }[] = [
  { id: 'wings', label: 'Wings' },
  { id: 'quesadillas', label: 'Quesadillas' },
  { id: 'starters', label: 'Starters' },
  { id: 'soups-salads', label: 'Soups & Salads' },
  { id: 'handhelds', label: 'Handhelds / Burgers' },
  { id: 'entrees', label: 'Entrees' },
  { id: 'sides', label: 'Sides' },
  { id: 'kids', label: 'Kids' },
]

export const BEER_STYLES = [
  'IPA',
  'Pale Ale',
  'Lager',
  'Pilsner',
  'Stout',
  'Porter',
  'Amber',
  'Wheat',
  'Witbier',
  'Belgian',
  'Sour',
  'Cider',
  'Hefeweizen',
  'Seasonal',
] as const
