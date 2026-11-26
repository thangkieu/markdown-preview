// Renders PNG icons and the social preview from SVG. Run: node scripts/generate-images.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { Resvg } from '@resvg/resvg-js'

const favicon = readFileSync('public/favicon.svg', 'utf8')

const render = (svg, width, out) => {
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: width },
    font: { loadSystemFonts: true, defaultFontFamily: 'Helvetica Neue' },
  })
    .render()
    .asPng()
  writeFileSync(out, png)
  console.log('wrote', out, png.length, 'bytes')
}

// App icons from the favicon.
render(favicon, 180, 'public/apple-touch-icon.png')
render(favicon, 32, 'public/favicon-32.png')

// 1200x630 social preview.
const mark = favicon
  .replace(/<svg[^>]*>/, '<g transform="translate(90 175) scale(4.7)">')
  .replace('</svg>', '</g>')
  .replace('id="bg"', 'id="mbg"')
  .replace('url(#bg)', 'url(#mbg)')
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1e3a8a"/><stop offset="1" stop-color="#a21caf"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  ${mark}
  <text x="450" y="290" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="70" font-weight="700" fill="#fff">Markdown Preview</text>
  <text x="450" y="365" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="40" fill="#f5d0fe">Paste markdown. See it rendered.</text>
  <text x="450" y="420" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="40" fill="#f5d0fe">Edit. Copy it back as markdown.</text>
  <text x="450" y="520" font-family="Helvetica Neue, Helvetica, Arial, sans-serif" font-size="30" fill="#e9d5ff">markdown.purrspective.uk</text>
</svg>`
render(og, 1200, 'public/og-image.png')
