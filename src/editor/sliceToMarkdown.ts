import type { Editor } from '@tiptap/core'
import { Fragment } from '@tiptap/pm/model'
import type { Node as PMNode, Schema, Slice } from '@tiptap/pm/model'

/** Wrap bare table cells/rows (from a CellSelection) so they form a valid table. */
function wrapTableParts(schema: Schema, content: Fragment): Fragment {
  const first = content.firstChild?.type.name
  const { table, tableRow } = schema.nodes
  if (!table || !tableRow) return content
  if (first === 'tableCell' || first === 'tableHeader') {
    content = Fragment.from(tableRow.create(null, content))
  }
  if (content.firstChild?.type === tableRow) {
    content = Fragment.from(table.create(null, content))
  }
  return content
}

/** Serialize a clipboard slice to markdown. Never throws; "" on failure. */
export function sliceToMarkdown(editor: Editor, slice: Slice): string {
  try {
    if (slice.content.size === 0) return ''
    const { schema } = editor
    const content = wrapTableParts(schema, slice.content)
    const whole = schema.topNodeType.createAndFill(null, content)
    if (whole) return editor.markdown!.serialize(whole.toJSON())

    const parts: string[] = []
    content.forEach((child: PMNode) => {
      const block = child.isInline
        ? schema.nodes.paragraph.create(null, child)
        : child
      parts.push(
        editor.markdown!.serialize({ type: 'doc', content: [block.toJSON()] }),
      )
    })
    return parts.join('\n\n')
  } catch (err) {
    console.warn('sliceToMarkdown failed; falling back to plain text', err)
    return ''
  }
}
