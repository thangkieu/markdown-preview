import { useRef } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import type { Editor, JSONContent } from '@tiptap/core'
import { extensions } from './extensions'
import { hasStrongBlockMarkdown, looksLikeMarkdown } from './looksLikeMarkdown'
import { sliceToMarkdown } from './sliceToMarkdown'
import { Outline } from './Outline'
import { EmptyState } from './EmptyState'
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
        // Structured HTML (web pages) uses default paste, unless the plain text
        // is clearly markdown source (heading / table / fence). Copies from this
        // editor that have real structure also use default paste.
        const fromVsCode = Array.from(data.types).includes('vscode-editor-data')
        const rich = isRichHtml(html) && !fromVsCode
        if (rich && html.includes('data-pm-slice')) return false
        if (rich && !hasStrongBlockMarkdown(text)) return false
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
        } catch (err) {
          // Never lose the text, and never fall back to the clipboard's HTML
          // (it would paste the wrong thing): paste the plain text literally.
          console.warn('markdown paste failed; pasting plain text', err)
          event.preventDefault()
          view.pasteText(text)
          return true
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
      <EmptyState editor={editor} />
      <Outline editor={editor} />
    </>
  )
}
