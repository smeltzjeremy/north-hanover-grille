import type { DayHours, SiteData } from './types'

export type OpenStatus = {
  isOpen: boolean
  label: string
  detail: string
}

function partsInZone(timeZone: string, date = new Date()) {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
  const bag: Record<string, string> = {}
  for (const p of fmt.formatToParts(date)) {
    if (p.type !== 'literal') bag[p.type] = p.value
  }
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  }
  return {
    day: weekdayMap[bag.weekday] ?? date.getDay(),
    minutes: Number(bag.hour) * 60 + Number(bag.minute),
  }
}

function parseHm(hm: string): number {
  const [h, m] = hm.split(':').map(Number)
  return h * 60 + m
}

function prettyTime(hm: string): string {
  const [hRaw, m] = hm.split(':').map(Number)
  const ampm = hRaw >= 12 ? 'PM' : 'AM'
  const h = hRaw % 12 || 12
  return m === 0 ? `${h} ${ampm}` : `${h}:${String(m).padStart(2, '0')} ${ampm}`
}

function nextOpen(hours: DayHours[], fromDay: number): DayHours | null {
  for (let i = 1; i <= 7; i++) {
    const d = hours.find((h) => h.day === (fromDay + i) % 7)
    if (d?.open) return d
  }
  return null
}

export function getOpenStatus(data: SiteData, now = new Date()): OpenStatus {
  const tz = data.venue.timezone || 'America/New_York'
  const { day, minutes } = partsInZone(tz, now)
  const today = data.hours.find((h) => h.day === day)
  const nxt = nextOpen(data.hours, day)

  if (!today?.open || !today.close) {
    return {
      isOpen: false,
      label: 'Closed',
      detail: nxt?.open ? `Opens ${nxt.label} ${prettyTime(nxt.open)}` : 'See hours',
    }
  }

  const openM = parseHm(today.open)
  const closeM = parseHm(today.close)

  if (minutes < openM) {
    return {
      isOpen: false,
      label: 'Closed',
      detail: `Opens ${prettyTime(today.open)}`,
    }
  }
  if (minutes >= closeM) {
    return {
      isOpen: false,
      label: 'Closed',
      detail: nxt?.open ? `Opens ${nxt.label} ${prettyTime(nxt.open)}` : 'See hours',
    }
  }

  return {
    isOpen: true,
    label: 'Open',
    detail: `Until ${prettyTime(today.close)}`,
  }
}

export function isTuesdayWingsLive(data: SiteData, now = new Date()): boolean {
  const tz = data.venue.timezone || 'America/New_York'
  const { day, minutes } = partsInZone(tz, now)
  return day === 2 && minutes >= 15 * 60
}

export function formatHoursLine(h: DayHours): string {
  if (!h.open || !h.close) return 'Closed'
  return `${prettyTime(h.open)} – ${prettyTime(h.close)}`
}
