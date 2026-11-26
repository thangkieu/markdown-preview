# Markdown Preview

Paste markdown, see it rendered Notion-style, edit it in place, and copy any selection back out as **markdown**.

Static, client-only web app. No backend, no database, no network calls.

## Features

- **Paste markdown** and it renders as blocks: headings, lists, task lists, tables, blockquotes, code blocks, images, links, and inline marks (including bold or links wrapping `code`).
- **Edit in the rendered view.** No separate source pane.
- **Copy as markdown.** Selecting any part and copying puts markdown on the clipboard (`text/plain`); `text/html` is kept for rich paste targets. Table cell selections copy as markdown tables.
- **Floating table of contents** on the right (h1–h3), with click-to-jump and a highlight for the section in view. Hidden when there are no headings and below 1100px wide.
- **Empty state** with an icon and message, centered on the page.

### Paste behavior

| Clipboard | Result |
|---|---|
| Plain markdown text | Parsed as markdown |
| Markdown source with HTML wrapper (editors, terminals) | Parsed as markdown from the plain text |
| Plain text with a heading, table, or code fence, even with rich HTML | Parsed as markdown |
| Rich HTML from a web page (links, bold, lists) without those markers | Default rich paste, so links are kept |
| Copies from this editor with real structure | Default paste |
| Pasting into a code block | Inserted literally |
| Inline-only markdown (e.g. `` `npm i` ``) mid-paragraph | Stays inline, doesn't split the paragraph |

If markdown can't be inserted, the plain text is pasted literally and a warning is logged to the console.

## Tech stack

Vite, React 19, TypeScript, [Tiptap v3](https://tiptap.dev) (with the official `@tiptap/markdown` package), Vitest + Testing Library.

## Getting started

Requires Node 22+.

```bash
npm install
npm run dev        # dev server
npm test           # run the test suite (Vitest, jsdom)
npx tsc            # type check
npm run build      # production build into dist/
npm run preview    # serve the production build locally
```

## Project structure

```
src/
  App.tsx                     page shell
  main.tsx                    entry
  styles.css                  Notion-like styles
  editor/
    MarkdownEditor.tsx        editor + paste/copy wiring
    extensions.ts             Tiptap extensions (markdown, tables, tasks, images, ...)
    looksLikeMarkdown.ts      paste heuristics (weak and strong markdown signals)
    isRichHtml.ts             tells structured clipboard HTML from plain-text wrappers
    sliceToMarkdown.ts        selection to markdown serializer used for copy
    extractHeadings.ts        heading list for the outline
    Outline.tsx               floating table of contents
    EmptyState.tsx            centered empty state
public/favicon.svg            favicon
docs/superpowers/             design spec and implementation plan
```

Tests sit next to the modules they cover (`*.test.ts(x)`).

## Deploy

It's a static site: build, then serve `dist/`.

**Cloudflare Pages (direct upload):**

```bash
npm run build
npx wrangler login
npx wrangler pages deploy dist --project-name markdown-preview
```

**Cloudflare Pages (Git integration):** build command `npm run build`, output directory `dist`, env var `NODE_VERSION=22`.

Any other static host works the same way (Vercel, Netlify, GitHub Pages, S3).

## Known limitations

- **Very large pastes are slow.** The markdown parser slows down faster than the input grows: about 0.5 s for 100 KB, about 2 s for 200 KB, and tens of seconds around 1 MB.
- **Round-trip normalizes some formatting**, for example `*` bullets become `-`.
- Some edge-case selections (partial nested lists, text selections spanning table cells) copy valid markdown but with approximated structure.
- Literal text that looks like markdown (e.g. a paragraph starting with `- `) isn't escaped on copy.
- Light theme only.
