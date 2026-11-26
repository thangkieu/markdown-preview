import { describe, expect, test } from 'vitest'
import { Editor } from '@tiptap/core'
import { extensions } from './extensions'

const md = [
  '# Title',
  '',
  '> quote',
  '',
  '- item',
  '',
  '```js',
  'const a = 1',
  '```',
  '',
  '| a | b |',
  '| --- | --- |',
  '| 1 | 2 |',
  '',
  '- [ ] todo',
].join('\n')

describe('markdown round-trip', () => {
  test('round-trips headings, blockquote, list, code block, table, task list', () => {
    const editor = new Editor({ extensions, content: md, contentType: 'markdown' })
    const out = editor.getMarkdown()
    expect(out).toContain('# Title')
    expect(out).toContain('> quote')
    expect(out).toContain('- item')
    expect(out).toContain('```js')
    expect(out).toMatch(/\|\s*a\s*\|\s*b\s*\|/)
    expect(out).toContain('- [ ] todo')
    editor.destroy()
  })
})

describe('marks combined with inline code', () => {
  test('bold and link wrapping inline code insert without throwing and keep both marks', () => {
    const e = new Editor({ extensions })
    const md = '**bold with `code` inside** and [`linked code`](https://x.com)'
    const blocks = e.markdown!.parse(md).content ?? []
    expect(() => e.commands.insertContent(blocks)).not.toThrow()
    const html = e.getHTML()
    expect(html).toMatch(/<strong>[^]*<code>code<\/code>/)
    expect(html).toMatch(/<a [^>]*href="https:\/\/x\.com"[^>]*>[^]*<code>linked code<\/code>/)
    e.destroy()
  })
})
