import { describe, expect, test } from 'vitest'
import { Editor } from '@tiptap/core'
import { extensions } from './extensions'

describe('hardening', () => {
  test('raw script tag in markdown is inert', () => {
    const e = new Editor({
      extensions,
      content: '<script>window.__x = 1</script>\n\ntext\n\n<img src=x onerror="window.__x=1">',
      contentType: 'markdown',
    })
    const html = e.getHTML()
    expect(html).not.toMatch(/<script/i)
    expect(html).not.toMatch(/onerror/i)
    expect((window as unknown as { __x?: number }).__x).toBeUndefined()
    e.destroy()
  })

  test('100 KB markdown loads within 10s', () => {
    const para = '## Heading\n\nSome **bold** text with a [link](http://x.com) and `code`.\n\n- a\n- b\n\n'
    const big = para.repeat(Math.ceil(100_000 / para.length))
    const t0 = performance.now()
    const e = new Editor({ extensions, content: big, contentType: 'markdown' })
    expect(e.getMarkdown().length).toBeGreaterThan(50_000)
    expect(performance.now() - t0).toBeLessThan(10_000)
    e.destroy()
  })
})
