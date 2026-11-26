import { useRef } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import type { Editor, JSONContent } from '@tiptap/core'
import { extensions } from './extensions'
import { looksLikeMarkdown } from './looksLikeMarkdown'
import { sliceToMarkdown } from './sliceToMarkdown'
import { Outline } from './Outline'
import { isRichHtml } from './isRichHtml'

export function MarkdownEditor() {
  const editorRef = useRef<Editor | null>(null)

  const editor = useEditor({
    extensions,
    editorProps: {
      handlePaste(view, event) {
        const ed = editorRef.current
        const data = event.clipboardData
        if (!ed || !data) return false
        const text = data.getData('text/plain')
        const html = data.getData('text/html') // read once; reuse
        // Structured HTML (web pages, copies with real headings/lists) uses
        // default paste. HTML that only wraps plain text does not.
        const fromVsCode = Array.from(data.types).includes('vscode-editor-data')
        if (isRichHtml(html) && !fromVsCode) return false
        if (view.state.selection.$from.parent.type.spec.code) return false
        if (!looksLikeMarkdown(text)) return false
        try {
          const blocks: JSONContent[] = ed.markdown!.parse(text).content ?? []
          // Inline-only markdown stays inline so it doesn't split the paragraph.
          const content =
            blocks.length === 1 && blocks[0].type === 'paragraph'
              ? (blocks[0].content ?? [])
              : blocks
          if (!ed.commands.insertContent(content)) return false
          event.preventDefault()
          return true
        } catch {
          return false // fall back to default paste; never lose the text
        }
      },
      clipboardTextSerializer: (slice) =>
        editorRef.current ? sliceToMarkdown(editorRef.current, slice) : '',
    },
  })
  editorRef.current = editor

  return (
    <>
      <EditorContent editor={editor} />
      <Outline editor={editor} />
    </>
  )
}
