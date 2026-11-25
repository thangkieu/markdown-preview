# Markdown Preview — Design (short)

## Intent
View how markdown renders, Notion style. Paste markdown, see rendered blocks, edit in place, select + copy gives markdown in clipboard.

## Goals
- Paste markdown → rendered, editable view (headings, lists, task lists, code blocks, tables, blockquotes, links, inline marks).
- Edit directly in rendered view.
- Copy of any selection (or all) puts **markdown** on clipboard (`text/plain`), so pasting elsewhere gives markdown.
- Notion-like look (blockquote with left bar, soft typography, generous spacing).

## Non-goals
- No backend / BFF, no database, no auth, no accounts.
- No file save/load, sync, collaboration, export formats (v1).
- No raw markdown source pane (v1).

## Anti-goals
- Copy yielding plain text or HTML instead of markdown.
- Any network call needed to render or copy.

## Constraints
- Static client-only SPA. Deployable to any static host.
- Markdown round-trip may normalize formatting (e.g. `*` → `-`). Accepted.

## Approaches considered
1. **Tiptap v3 + official markdown package (chosen).** Mature WYSIWYG, first-party markdown parse/serialize. Trade-off: light normalization on round-trip.
2. Milkdown (remark-based). More faithful round-trip, smaller ecosystem, more plugin wiring. Not chosen.
3. react-markdown + turndown, read-only. Not editable, fails the edit requirement. Dropped.

## Design (decided)
- Stack: Vite + React + TypeScript, Tiptap v3 (StarterKit + markdown package + task list, table, link, code block extensions). No server.
- One page, one editor, centered column (~720px).
- Paste handling: pasted `text/plain` that looks like markdown is parsed as markdown into blocks. Pasted rich HTML uses Tiptap default.
- Copy handling: on `copy`/`cut`, serialize current selection slice to markdown, write to `text/plain` (and keep `text/html` for rich paste targets).
- Empty state: placeholder "Paste markdown here".

## Left to builder (my calls)
- Exact CSS values, fonts, colors; light theme only for v1.
- Which Tiptap extensions beyond the list above.
- Test setup (Vitest for markdown round-trip + copy serializer).
