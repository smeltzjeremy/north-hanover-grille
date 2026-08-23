import { copyFileSync, mkdirSync } from 'node:fs'

mkdirSync('dist', { recursive: true })
copyFileSync('cloudflare/_redirects', 'dist/_redirects')
copyFileSync('cloudflare/_routes.json', 'dist/_routes.json')
console.log('Copied Cloudflare Pages routing files into dist/')
