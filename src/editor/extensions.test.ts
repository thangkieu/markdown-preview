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
