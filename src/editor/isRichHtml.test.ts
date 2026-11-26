import { describe, expect, test } from 'vitest'
import { isRichHtml } from './isRichHtml'

describe('isRichHtml', () => {
  test.each([
    ['link', '<p>see <a href="https://x.com">docs</a></p>'],
    ['heading', '<h2>Title</h2>'],
    ['list', '<ul><li>a</li></ul>'],
    ['table', '<table><tr><td>a</td></tr></table>'],
    ['bold', 'x <strong>y</strong>'],
    ['image', '<img src="a.png">'],
    ['our own copy', '<p data-pm-slice="1 1 []">x</p>'],
  ])('true for %s', (_n, html) => {
    expect(isRichHtml(html)).toBe(true)
  })

  test.each([
    ['empty', ''],
    ['styled spans', "<meta charset='utf-8'><div style=\"color:#000\"><span>a</span><br>b</div>"],
    ['pre wrapper', '<pre>x = 1</pre>'],
  ])('false for %s', (_n, html) => {
    expect(isRichHtml(html)).toBe(false)
  })
})
