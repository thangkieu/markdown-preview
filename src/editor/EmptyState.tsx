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
    <div className="empty-state" aria-hidden="true">
      <svg viewBox="0 0 64 64" width="64" height="64" fill="none">
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
      <p className="empty-state-title">Paste markdown here</p>
      <p className="empty-state-hint">It renders as you paste. Select and copy to get markdown back.</p>
    </div>
  )
}
