/// <reference types="@cloudflare/workers-types" />
import { DEFAULT_SITE_DATA } from '../../shared/defaults'
import type { Inquiry, SiteData } from '../../shared/types'

export interface Env {
  SITE_KV?: KVNamespace
  MEDIA?: R2Bucket
  ADMIN_PIN?: string
  SESSION_SECRET?: string
}

const KV_KEY = 'site_data'
const COOKIE = 'nhg_session'
const PDF_KEY = 'specials.pdf'

function json(data: unknown, status = 200, extra: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...extra,
    },
  })
}

function pinOf(env: Env) {
  return env.ADMIN_PIN || '5517'
}

function secretOf(env: Env) {
  return env.SESSION_SECRET || `nhg-${pinOf(env)}`
}

async function hmac(secret: string, payload: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload))
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

async function makeSession(env: Env) {
  const exp = Date.now() + 7 * 24 * 60 * 60 * 1000
  const payload = `ok.${exp}`
  const sig = await hmac(secretOf(env), payload)
  return `${payload}.${sig}`
}

async function validSession(env: Env, request: Request) {
  const cookie = request.headers.get('Cookie') || ''
  const match = cookie.split(';').map((s) => s.trim()).find((s) => s.startsWith(`${COOKIE}=`))
  if (!match) return false
  const token = decodeURIComponent(match.slice(COOKIE.length + 1))
  const parts = token.split('.')
  if (parts.length !== 3) return false
  const [ok, exp, sig] = parts
  const payload = `${ok}.${exp}`
  const expect = await hmac(secretOf(env), payload)
  if (expect !== sig || ok !== 'ok') return false
  return Number(exp) > Date.now()
}

function sessionCookie(token: string, clear = false) {
  const maxAge = clear ? 0 : 60 * 60 * 24 * 7
  return `${COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`
}

async function readSite(env: Env): Promise<SiteData> {
  if (!env.SITE_KV) return structuredClone(DEFAULT_SITE_DATA)
  const raw = await env.SITE_KV.get(KV_KEY)
  if (!raw) {
    const seed = structuredClone(DEFAULT_SITE_DATA)
    await env.SITE_KV.put(KV_KEY, JSON.stringify(seed))
    return seed
  }
  const parsed = JSON.parse(raw) as SiteData
  return {
    ...structuredClone(DEFAULT_SITE_DATA),
    ...parsed,
    venue: { ...DEFAULT_SITE_DATA.venue, ...parsed.venue },
    specials: { ...DEFAULT_SITE_DATA.specials, ...parsed.specials },
    banquet: { ...DEFAULT_SITE_DATA.banquet, ...parsed.banquet },
    taps: parsed.taps?.length === 14 ? parsed.taps : DEFAULT_SITE_DATA.taps,
    menu: parsed.menu?.length ? parsed.menu : DEFAULT_SITE_DATA.menu,
    hours: parsed.hours?.length ? parsed.hours : DEFAULT_SITE_DATA.hours,
    sauces: parsed.sauces?.length ? parsed.sauces : DEFAULT_SITE_DATA.sauces,
    inquiries: parsed.inquiries ?? [],
  }
}

async function writeSite(env: Env, data: SiteData) {
  if (!env.SITE_KV) throw new Error('SITE_KV not bound')
  await env.SITE_KV.put(KV_KEY, JSON.stringify(data))
}

function publicSite(data: SiteData) {
  const { inquiries: _i, ...rest } = data
  return { ...rest, inquiries: [] as Inquiry[] }
}

export const onRequest: PagesFunction<Env> = async (ctx) => {
  const { request, env } = ctx
  const url = new URL(request.url)
  const path = url.pathname.replace(/\/+$/, '') || '/'
  const method = request.method.toUpperCase()

  if (method === 'OPTIONS') {
    return new Response(null, { status: 204 })
  }

  try {
    if (path === '/api/site-data' && method === 'GET') {
      const data = await readSite(env)
      if (env.MEDIA) {
        const obj = await env.MEDIA.head(PDF_KEY)
        data.specials.hasFlyer = Boolean(obj)
      }
      return json(publicSite(data))
    }

    if (path === '/api/specials' && method === 'GET') {
      if (!env.MEDIA) return json({ error: 'No flyer storage' }, 404)
      const obj = await env.MEDIA.get(PDF_KEY)
      if (!obj) return json({ error: 'No flyer this week' }, 404)
      return new Response(obj.body, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'inline; filename="specials.pdf"',
          'Cache-Control': 'public, max-age=60',
        },
      })
    }

    if (path === '/api/inquiries' && method === 'POST') {
      const body = (await request.json()) as Omit<Inquiry, 'id' | 'createdAt'>
      if (!body.name || !body.phone) return json({ error: 'Name and phone required' }, 400)
      const data = await readSite(env)
      const inquiry: Inquiry = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        name: String(body.name).slice(0, 120),
        phone: String(body.phone).slice(0, 40),
        email: String(body.email || '').slice(0, 120),
        date: String(body.date || '').slice(0, 40),
        guests: String(body.guests || '').slice(0, 20),
        notes: String(body.notes || '').slice(0, 1000),
      }
      data.inquiries = [inquiry, ...data.inquiries].slice(0, 50)
      if (env.SITE_KV) await writeSite(env, data)
      return json({ ok: true })
    }

    if (path === '/api/admin/login' && method === 'POST') {
      const body = (await request.json()) as { pin?: string }
      if (String(body.pin || '') !== pinOf(env)) return json({ error: 'invalid' }, 401)
      const token = await makeSession(env)
      return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie(token) })
    }

    if (path === '/api/admin/logout' && method === 'POST') {
      return json({ ok: true }, 200, { 'Set-Cookie': sessionCookie('', true) })
    }

    if (path === '/api/admin/session' && method === 'GET') {
      return json({ ok: await validSession(env, request) }, (await validSession(env, request)) ? 200 : 401)
    }

    const authed = await validSession(env, request)
    if (!authed) return json({ error: 'unauthorized' }, 401)

    if (path === '/api/admin/site-data' && method === 'PUT') {
      const incoming = (await request.json()) as SiteData
      const current = await readSite(env)
      const next: SiteData = {
        ...current,
        ...incoming,
        inquiries: current.inquiries,
        taps: Array.isArray(incoming.taps) && incoming.taps.length === 14 ? incoming.taps : current.taps,
        menu: Array.isArray(incoming.menu) ? incoming.menu : current.menu,
      }
      await writeSite(env, next)
      return json({ ok: true })
    }

    if (path === '/api/admin/site-data' && method === 'GET') {
      return json(await readSite(env))
    }

    if (path === '/api/admin/specials' && method === 'POST') {
      if (!env.MEDIA) return json({ error: 'MEDIA bucket not bound' }, 500)
      const form = await request.formData()
      const file = form.get('file')
      if (!(file instanceof File)) return json({ error: 'file required' }, 400)
      if (file.type && file.type !== 'application/pdf') {
        return json({ error: 'PDF only' }, 400)
      }
      await env.MEDIA.put(PDF_KEY, await file.arrayBuffer(), {
        httpMetadata: { contentType: 'application/pdf' },
      })
      const data = await readSite(env)
      data.specials = { hasFlyer: true, updatedAt: new Date().toISOString() }
      if (env.SITE_KV) await writeSite(env, data)
      return json({ ok: true, updatedAt: data.specials.updatedAt })
    }

    return json({ error: 'not found' }, 404)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'error'
    return json({ error: message }, 500)
  }
}
