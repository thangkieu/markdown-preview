import { describe, expect, test } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'

const SITE = 'https://markdown.purrspective.uk/'
const html = readFileSync('index.html', 'utf8')
const doc = new DOMParser().parseFromString(html, 'text/html')
const meta = (sel: string) => doc.querySelector(sel)?.getAttribute('content') ?? ''

describe('SEO: index.html', () => {
  test('lang, title and description are present and a sensible length', () => {
    expect(doc.documentElement.lang).toBe('en')
    expect(doc.title.length).toBeGreaterThanOrEqual(30)
    expect(doc.title.length).toBeLessThanOrEqual(65)
    expect(doc.title).toMatch(/markdown/i)
    const d = meta('meta[name="description"]')
    expect(d.length).toBeGreaterThanOrEqual(70)
    expect(d.length).toBeLessThanOrEqual(160)
  })

  test('canonical, robots and theme color', () => {
    expect(doc.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(SITE)
    expect(meta('meta[name="robots"]')).toContain('index')
    expect(meta('meta[name="theme-color"]')).toMatch(/^#/)
  })

  test('Open Graph and Twitter card tags use absolute URLs', () => {
    expect(meta('meta[property="og:type"]')).toBe('website')
    expect(meta('meta[property="og:url"]')).toBe(SITE)
    expect(meta('meta[property="og:title"]')).not.toBe('')
    expect(meta('meta[property="og:description"]')).not.toBe('')
    expect(meta('meta[property="og:image"]')).toBe(`${SITE}og-image.png`)
    expect(meta('meta[property="og:image:width"]')).toBe('1200')
    expect(meta('meta[property="og:image:height"]')).toBe('630')
    expect(meta('meta[name="twitter:card"]')).toBe('summary_large_image')
    expect(meta('meta[name="twitter:image"]')).toBe(`${SITE}og-image.png`)
  })

  test('JSON-LD is valid WebApplication schema', () => {
    const raw = doc.querySelector('script[type="application/ld+json"]')?.textContent
    expect(raw).toBeTruthy()
    const ld = JSON.parse(raw!)
    expect(ld['@context']).toBe('https://schema.org')
    expect(ld['@type']).toBe('WebApplication')
    expect(ld.url).toBe(SITE)
    expect(ld.offers?.price).toBe('0')
  })

  test('crawlers without JS get an h1 and text inside #root', () => {
    const root = doc.getElementById('root')!
    expect(root.querySelector('h1')?.textContent).toMatch(/markdown/i)
    expect((root.textContent ?? '').length).toBeGreaterThan(150)
  })

  test('icons are linked and exist', () => {
    for (const f of ['favicon.svg', 'favicon-32.png', 'apple-touch-icon.png', 'og-image.png']) {
      expect(existsSync(`public/${f}`), f).toBe(true)
    }
    expect(doc.querySelector('link[rel="apple-touch-icon"]')?.getAttribute('href')).toBe('/apple-touch-icon.png')
  })
})

describe('SEO: crawler files', () => {
  test('robots.txt allows crawling and points to the sitemap', () => {
    const t = readFileSync('public/robots.txt', 'utf8')
    expect(t).toMatch(/User-agent:\s*\*/)
    expect(t).not.toMatch(/Disallow:\s*\/\s*$/m)
    expect(t).toContain(`Sitemap: ${SITE}sitemap.xml`)
  })

  test('sitemap.xml lists the home page', () => {
    const t = readFileSync('public/sitemap.xml', 'utf8')
    expect(t).toContain(`<loc>${SITE}</loc>`)
    expect(t).toMatch(/<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/)
  })

  test('_headers caches hashed assets long and sets basic security headers', () => {
    const t = readFileSync('public/_headers', 'utf8')
    expect(t).toMatch(/\/assets\/\*\s+Cache-Control: public, max-age=31536000, immutable/)
    expect(t).toContain('X-Content-Type-Options: nosniff')
    expect(t).toContain('Referrer-Policy: strict-origin-when-cross-origin')
  })
})
