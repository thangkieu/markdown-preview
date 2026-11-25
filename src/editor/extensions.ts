import type { Extensions } from '@tiptap/core'
import StarterKit from '@tiptap/starter-kit'
import { Markdown } from '@tiptap/markdown'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { TableKit } from '@tiptap/extension-table'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'

export const extensions: Extensions = [
  StarterKit.configure({ link: { openOnClick: false } }),
  Markdown,
  TaskList,
  TaskItem.configure({ nested: true }),
  TableKit,
  Image.configure({ inline: true }),
  Placeholder.configure({ placeholder: 'Paste markdown here' }),
]
