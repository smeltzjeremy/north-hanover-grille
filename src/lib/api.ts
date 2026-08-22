import { DEFAULT_SITE_DATA } from '@shared/defaults'
import type { Inquiry, SiteData } from '@shared/types'

export async function fetchSiteData(): Promise<SiteData> {
  try {
    const res = await fetch('/api/site-data', { credentials: 'include' })
    if (!res.ok) throw new Error('bad status')
    return (await res.json()) as SiteData
  } catch {
    return structuredClone(DEFAULT_SITE_DATA)
  }
}

export async function adminLogin(pin: string): Promise<boolean> {
  const res = await fetch('/api/admin/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pin }),
  })
  return res.ok
}

export async function adminLogout(): Promise<void> {
  await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' })
}

export async function saveSiteData(data: SiteData): Promise<boolean> {
  const res = await fetch('/api/admin/site-data', {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  return res.ok
}

export async function uploadSpecials(file: File): Promise<boolean> {
  const body = new FormData()
  body.append('file', file)
  const res = await fetch('/api/admin/specials', {
    method: 'POST',
    credentials: 'include',
    body,
  })
  return res.ok
}

export async function sendInquiry(
  payload: Omit<Inquiry, 'id' | 'createdAt'>,
): Promise<boolean> {
  const res = await fetch('/api/inquiries', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return res.ok
}

export async function checkAdminSession(): Promise<boolean> {
  try {
    const res = await fetch('/api/admin/session', { credentials: 'include' })
    return res.ok
  } catch {
    return false
  }
}
