import { describe, expect, test } from 'vitest'
import { looksLikeMarkdown } from './looksLikeMarkdown'

describe('looksLikeMarkdown', () => {
  test.each([
    ['heading', '# Hi'],
    ['list', '- a\n- b'],
    ['blockquote', '> q'],
    ['fence', '```js\nx\n```'],
    ['bold', '**bold** text'],
    ['link', '[a](http://x)'],
  ])('true for %s', (_n, text) => {
    expect(looksLikeMarkdown(text)).toBe(true)
  })

  test.each([
    ['plain', 'hello world'],
    ['prose', 'Meeting at 3pm. Bring lunch.'],
    ['empty', ''],
  ])('false for %s', (_n, text) => {
    expect(looksLikeMarkdown(text)).toBe(false)
  })
})

import { hasStrongBlockMarkdown } from './looksLikeMarkdown'

describe('hasStrongBlockMarkdown', () => {
  test.each([
    ['heading', 'intro\n\n## UAT settings\n\ntext'],
    ['table delimiter row', '| a | b |\n|---|---|\n| 1 | 2 |'],
    ['table delimiter with spaces/colons', 'a | b\n:--- | ---:'],
    ['fence', 'x\n```sh\nls\n```'],
  ])('true for %s', (_n, t) => expect(hasStrongBlockMarkdown(t)).toBe(true))

  test.each([
    ['bullets', '- a\n- b'],
    ['numbered', '1. Read the docs'],
    ['bold', '**x** and `y`'],
    ['prose', 'Meeting at 3pm.'],
    ['hash mid-line', 'issue #12 is fixed'],
    ['empty', ''],
  ])('false for %s', (_n, t) => expect(hasStrongBlockMarkdown(t)).toBe(false))
})
