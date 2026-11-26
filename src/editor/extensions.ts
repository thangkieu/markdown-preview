import type { Extensions } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from '@tiptap/markdown'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { TableKit } from '@tiptap/extension-table'
import Code from '@tiptap/extension-code'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'

export const extensions: Extensions = [
  StarterKit.configure({ link: { openOnClick: false }, code: false }),
  // Default Code mark excludes all other marks, so **bold `code`** or
  // [`code`](url) make inserts throw. Markdown allows them.
  Code.extend({ excludes: '' }),
  Markdown,
  TaskList,
  TaskItem.configure({ nested: true }),
  TableKit,
  Image.configure({ inline: true }),
  Placeholder.configure({ placeholder: 'Paste markdown here' }),
]
