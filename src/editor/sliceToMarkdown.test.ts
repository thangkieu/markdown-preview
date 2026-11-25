import { describe, expect, test } from 'vitest'
import { Editor } from '@tiptap/core'
import { CellSelection } from '@tiptap/pm/tables'
import { extensions } from './extensions'
import { sliceToMarkdown } from './sliceToMarkdown'

const md = '# Title\n\n> some quoted words\n\n- first item\n- second item'

function make() {
  return new Editor({ extensions, content: md, contentType: 'markdown' })
}
function posOf(editor: Editor, text: string) {
  let found = -1
  editor.state.doc.descendants((node, pos) => {
    if (found < 0 && node.isText && node.text!.includes(text)) {
      found = pos + node.text!.indexOf(text)
    }
  })
  return found
}

describe('sliceToMarkdown', () => {
  test('select all equals getMarkdown', () => {
    const e = make()
    e.commands.selectAll()
    expect(sliceToMarkdown(e, e.state.selection.content())).toBe(e.getMarkdown())
  })

  test('single heading selection gives "# Title"', () => {
    const e = make()
    e.commands.setNodeSelection(0)
    expect(sliceToMarkdown(e, e.state.selection.content()).trim()).toBe('# Title')
  })

  test('partial selection inside blockquote does not throw and keeps text', () => {
    const e = make()
    const from = posOf(e, 'quoted')
    e.commands.setTextSelection({ from, to: from + 'quoted'.length })
    const out = sliceToMarkdown(e, e.state.selection.content())
    expect(out).toContain('quoted')
  })

  test('partial selection inside list item does not throw and keeps text', () => {
    const e = make()
    const from = posOf(e, 'second')
    e.commands.setTextSelection({ from, to: from + 'second item'.length })
    expect(sliceToMarkdown(e, e.state.selection.content())).toContain('second item')
  })

  test('empty selection returns empty string', () => {
    const e = make()
    e.commands.setTextSelection(3)
    expect(sliceToMarkdown(e, e.state.selection.content())).toBe('')
  })

  test('table CellSelection copies as a markdown table, not plain text', () => {
    const e = new Editor({
      extensions,
      content: '| h1 | h2 |\n| --- | --- |\n| c1 | c2 |\n| c3 | c4 |',
      contentType: 'markdown',
    })
    const cells: number[] = []
    e.state.doc.descendants((n, pos) => {
      if (n.type.name === 'tableCell' || n.type.name === 'tableHeader') cells.push(pos)
    })
    const sel = CellSelection.create(e.state.doc, cells[2], cells[5])
    const out = sliceToMarkdown(e, sel.content())
    expect(out).toMatch(/\|\s*c1\s*\|\s*c2\s*\|/)
    expect(out).toMatch(/\|\s*c3\s*\|\s*c4\s*\|/)
  })
})
