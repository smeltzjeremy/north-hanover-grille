import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { DEFAULT_SITE_DATA } from '@shared/defaults'
import type { SiteData } from '@shared/types'
import { fetchSiteData } from './lib/api'
import Home from './pages/Home'
import Admin from './pages/Admin'

export default function App() {
  const [data, setData] = useState<SiteData>(DEFAULT_SITE_DATA)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    fetchSiteData()
      .then(setData)
      .finally(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <div className="glass px-8 py-10 text-center">
          <p className="section-kicker">North Hanover Grille</p>
          <p className="font-display mt-3 text-2xl gold-text">Pouring the taps…</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/" element={<Home data={data} />} />
      <Route path="/admin" element={<Admin data={data} onChange={setData} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
