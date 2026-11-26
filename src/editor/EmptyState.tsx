import type { Editor } from '@tiptap/core'
import { useEditorState } from '@tiptap/react'

/** Centered icon + message shown while the document is empty. Never blocks clicks. */
export function EmptyState({ editor }: { editor: Editor | null }) {
  const isEmpty = useEditorState({
    editor,
    selector: ({ editor }) => editor?.isEmpty ?? false,
  })
  if (!isEmpty) return null

  return (
    <div className="empty-state">
      <svg viewBox="0 0 64 64" width="64" height="64" fill="none" aria-hidden="true">
        <rect x="3" y="11" width="58" height="42" rx="9" stroke="currentColor" strokeWidth="3" />
        <path
          d="M14 42V22h4.5l6.5 9 6.5-9H36v20h-4.5V30L25 38l-6.5-8v12z"
          fill="currentColor"
        />
        <path
          d="M46 22v14m0 0-5-5m5 5 5-5"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h1 className="empty-state-heading">Markdown Preview</h1>
      <p className="empty-state-title">Paste markdown here</p>
      <p className="empty-state-hint">It renders as you paste. Select and copy to get markdown back.</p>
      <ul className="empty-state-features">
        <li>Tables, task lists, code blocks and blockquotes</li>
        <li>Edit directly in the rendered view</li>
        <li>Free, and runs in your browser: nothing is uploaded</li>
      </ul>
    </div>
  )
}
