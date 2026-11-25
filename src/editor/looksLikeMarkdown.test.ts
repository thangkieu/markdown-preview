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
