# North Hanover Grille

Glassmorphic gastropub site for **37 N. Hanover Street, Carlisle, PA**. React + TypeScript on Cloudflare Pages, live data in KV, weekly flyer in R2. No external database.

## Stack

- Frontend: Vite, React 19, TypeScript, Tailwind v4
- Hosting: Cloudflare Pages
- `site_data` JSON: Cloudflare KV (`SITE_KV`)
- `specials.pdf` + photography: Cloudflare R2 (`MEDIA`)
- Owner portal: `/admin` (PIN cookie session)

## Local

```bash
npm install
npm run dev
```

Public pages fall back to the seeded menu/taps if `/api` is not running. Full stack:

```bash
npm run pages:dev
```

Default admin PIN: `5517` (last four of `(717) 241-5517`). Change it in production.

## Cloudflare

1. Create resources:

```bash
npx wrangler kv namespace create SITE_KV
npx wrangler r2 bucket create nhg-media
```

2. Uncomment and fill the IDs in `wrangler.toml`.

3. Set secrets (Pages dashboard or wrangler):

```bash
npx wrangler pages secret put ADMIN_PIN --project-name north-hanover-grille
npx wrangler pages secret put SESSION_SECRET --project-name north-hanover-grille
```

4. Deploy:

```bash
npm run deploy
```

Or connect this GitHub repo to Cloudflare Pages:

- Build command: `npm run build`
- Output directory: `dist`
- Root: `/`
- Bind `SITE_KV` and `MEDIA` on the project

## Owner admin

- **14-tap lineup** — name, style, brewery, origin, ABV, keg on/off
- **86 switches** — hide/show dishes and override prices
- **Specials PDF** — drag-and-drop replaces `specials.pdf` in R2
- **Inbox** — banquet inquiries from the private dining card

## Hours (America/New_York)

| Day | Hours |
| --- | --- |
| Sun–Mon | Closed |
| Tue–Thu | 11 AM – 9 PM |
| Fri–Sat | 11 AM – 9:30 PM |

Tuesday 60¢ boneless wings start at 3 PM.
