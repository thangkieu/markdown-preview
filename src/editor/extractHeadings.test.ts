import { describe, expect, test } from 'vitest'
import { Editor } from '@tiptap/core'
import { extensions } from './extensions'
import { extractHeadings } from './extractHeadings'

const make = (md: string) =>
  new Editor({ extensions, content: md, contentType: 'markdown' })

describe('extractHeadings', () => {
  test('returns h1-h3 with level, text and node position; skips h4+ and empty', () => {
    const e = make('# One\n\ntext\n\n## Two\n\n### Three\n\n#### Four\n\n## **Bold** title')
    const hs = extractHeadings(e.state.doc)
    expect(hs.map((h) => [h.level, h.text])).toEqual([
      [1, 'One'],
      [2, 'Two'],
      [3, 'Three'],
      [2, 'Bold title'],
    ])
    for (const h of hs) expect(e.state.doc.nodeAt(h.pos)?.type.name).toBe('heading')
  })

  test('empty doc has no headings', () => {
    expect(extractHeadings(make('just text').state.doc)).toEqual([])
  })
})
