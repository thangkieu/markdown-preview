import type { Node as PMNode } from '@tiptap/pm/model'

export interface OutlineHeading {
  level: 1 | 2 | 3
  text: string
  /** Document position of the heading node. */
  pos: number
}

/** h1–h3 headings with non-empty text, in document order. */
export function extractHeadings(doc: PMNode): OutlineHeading[] {
  const out: OutlineHeading[] = []
  doc.descendants((node, pos) => {
    if (node.type.name !== 'heading') return
    const level = node.attrs.level as number
    const text = node.textContent.trim()
    if (level <= 3 && text) out.push({ level: level as 1 | 2 | 3, text, pos })
    return false
  })
  return out
}
