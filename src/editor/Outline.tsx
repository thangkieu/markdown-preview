import { useEffect, useState } from 'react'
import type { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'
import { extractHeadings } from './extractHeadings'

const ACTIVE_OFFSET = 120 // px from viewport top

export function Outline({ editor }: { editor: Editor | null }) {
  const headings =
    useEditorState({
      editor,
      selector: ({ editor }) => (editor ? extractHeadings(editor.state.doc) : []),
    }) ?? []
  const [activePos, setActivePos] = useState<number | null>(null)

  useEffect(() => {
    if (!editor || headings.length === 0) return
    let raf = 0
    const update = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        let current = headings[0].pos
        for (const h of headings) {
          const el = editor.view.nodeDOM(h.pos) as HTMLElement | null
          if (el && el.getBoundingClientRect().top <= ACTIVE_OFFSET) current = h.pos
        }
        setActivePos(current)
      })
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [editor, headings])

  if (!editor || headings.length === 0) return null

  const go = (pos: number) => {
    editor.commands.setTextSelection(pos + 1)
    editor.view.focus()
    const el = editor.view.nodeDOM(pos) as HTMLElement | null
    el?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav className="outline" aria-label="Table of contents">
      {headings.map((h) => (
        <button
          key={h.pos}
          type="button"
          data-level={h.level}
          className={h.pos === activePos ? 'active' : undefined}
          onClick={() => go(h.pos)}
        >
          {h.text}
        </button>
      ))}
    </nav>
  )
}
