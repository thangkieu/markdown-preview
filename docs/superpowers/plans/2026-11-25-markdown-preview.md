# Markdown Preview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Static web app: paste markdown, see Notion-style rendered editable view, copy any selection as markdown.

**Architecture:** Single Vite + React + TS page hosting one Tiptap v3 editor. `@tiptap/markdown` parses markdown into the doc and serializes back. Two small pure modules (`looksLikeMarkdown`, `sliceToMarkdown`) hook paste and copy via `editorProps`. No server.

**Tech Stack:** Vite, React, TypeScript, Tiptap v3 (`@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/markdown`, task-list/table/placeholder extensions), Vitest + jsdom.

**Spec:** `docs/superpowers/specs/2026-11-25-markdown-preview-design.md`

## Global Constraints

- Static client-only SPA. No backend/BFF, DB, auth, or network call for render/copy.
- Copy puts **markdown** on `text/plain`; `text/html` kept for rich paste targets.
- Light theme only. Single centered column ~720px. Blockquote has left bar.
- No file save/export, no raw markdown pane (v1).
- Round-trip normalization (`*` → `-`) accepted.
- Tiptap v3 markdown API: verify exact names against installed docs (`node_modules/@tiptap/markdown`) before coding; names below (`Markdown`, `contentType: 'markdown'`, `editor.getMarkdown()`, `editor.markdown.parse/serialize`) are the expected ones.
- No git repo exists; do not init or commit unless user asks.

## Review Focus

1. Empty selection / copy with nothing selected → clipboard untouched (no empty-string overwrite).
2. Partial selection that cuts through a list item or blockquote (open slice) → valid markdown, no throw.
3. Pasting plain prose (no markdown syntax) → stays literal text, not mangled into blocks.
4. Pasting markdown containing raw HTML / `<script>` → rendered inert, no script execution.
5. Very large paste (~1 MB markdown) → editor stays responsive, no crash.

---

## File Structure

- `package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html` — scaffold
- `src/main.tsx` — mounts `<App />`
- `src/App.tsx` — page shell + `<MarkdownEditor />`
- `src/editor/extensions.ts` — exports `extensions: Extensions`
- `src/editor/looksLikeMarkdown.ts` — paste heuristic
- `src/editor/sliceToMarkdown.ts` — copy serializer
- `src/editor/MarkdownEditor.tsx` — `useEditor` wiring, paste/copy props
- `src/styles.css` — Notion-like styles
- `src/editor/*.test.ts` — Vitest tests beside modules

### Task 1: Scaffold + markdown round-trip

**Files:**
- Create: Vite React-TS project in repo root (`npm create vite@latest . -- --template react-ts`, keep `docs/`), `src/editor/extensions.ts`
- Test: `src/editor/extensions.test.ts`

**Interfaces:**
- Produces: `export const extensions: Extensions` (StarterKit, Markdown, TaskList, TaskItem(nested), Table family, Placeholder "Paste markdown here", Link with `openOnClick: false`).

- [ ] **Step 1:** Scaffold Vite; install `@tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/markdown @tiptap/extension-task-list @tiptap/extension-task-item @tiptap/extension-table @tiptap/extension-placeholder` and dev deps `vitest jsdom`. Configure Vitest `environment: 'jsdom'`, add `"test": "vitest run"`.
- [ ] **Step 2: Write failing test** `round-trips headings, blockquote, list, code block, table, task list`: build headless `new Editor({ extensions, content: md, contentType: 'markdown' })`; assert `editor.getMarkdown()` contains `# Title`, `> quote`, `- item`, a fenced ```` ```js ```` block, a `| a | b |` table row, `- [ ] todo`.
- [ ] **Step 3:** Run `npx vitest run src/editor/extensions.test.ts`. Expected: FAIL (module missing).
- [ ] **Step 4:** Implement `extensions.ts` as specified above.
- [ ] **Step 5:** Re-run. Expected: PASS. Adjust assertions only for documented normalization.

### Task 2: Paste heuristic

**Files:**
- Create: `src/editor/looksLikeMarkdown.ts`
- Test: `src/editor/looksLikeMarkdown.test.ts`

**Interfaces:**
- Produces: `export function looksLikeMarkdown(text: string): boolean`

- [ ] **Step 1: Write failing tests:** true for `"# Hi"`, `"- a\n- b"`, `"> q"`, `"```js\nx\n```"`, `"**bold** text"`, `"[a](http://x)"`; false for `"hello world"`, `"Meeting at 3pm. Bring lunch."`, `""`.
- [ ] **Step 2:** Run test file. Expected: FAIL.
- [ ] **Step 3:** Implement with line-anchored regexes (headings, list/task markers, blockquote, fences, table rule row) plus inline `**x**`, `` `x` ``, `[x](y)`.
- [ ] **Step 4:** Run. Expected: PASS.

### Task 3: Selection → markdown

**Files:**
- Create: `src/editor/sliceToMarkdown.ts`
- Test: `src/editor/sliceToMarkdown.test.ts`

**Interfaces:**
- Consumes: `extensions` (Task 1).
- Produces: `export function sliceToMarkdown(editor: Editor, slice: Slice): string` — wraps `slice.content` in a doc node (`schema.topNodeType.createAndFill(null, slice.content)`, falling back to wrapping each top-level node individually), serializes via `editor.markdown.serialize(node.toJSON())`. Returns `""` on failure; never throws.

- [ ] **Step 1: Write failing tests** with headless editor loaded from markdown: (a) select whole doc via `editor.state.selection.content()` after `selectAll` → equals `editor.getMarkdown()`; (b) select a single heading → `"# Title"`; (c) select partial text inside a blockquote paragraph (open slice) → string contains `>` or the text, no throw; (d) selection inside one list item → no throw, contains item text; (e) empty selection → `""`.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement per Interfaces.
- [ ] **Step 4:** Run. Expected: PASS.

### Task 4: Editor component + app shell + styling

**Files:**
- Create: `src/editor/MarkdownEditor.tsx`, `src/styles.css`
- Modify: `src/App.tsx`, `src/main.tsx` (import styles)
- Test: `src/editor/MarkdownEditor.test.tsx` (Vitest + `@testing-library/react`)

**Interfaces:**
- Consumes: `extensions`, `looksLikeMarkdown`, `sliceToMarkdown`.
- Produces: `export function MarkdownEditor(): JSX.Element`

- [ ] **Step 1: Write failing test:** render `<MarkdownEditor />`; assert placeholder "Paste markdown here" is present; simulate paste event on the editor DOM with `text/plain` `"# Hi\n\n> quote"` and assert an `h1` and `blockquote` exist.
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement `useEditor({ extensions, editorProps })`:
  - `handlePaste(view, event)`: read `clipboardData.getData('text/plain')`; if `looksLikeMarkdown`, `preventDefault`, insert `editor.markdown.parse(text)` content at selection via `editor.commands.insertContent(..., { contentType: 'markdown' })` (check v3 signature), return `true`; else return `false`.
  - `clipboardTextSerializer: (slice) => sliceToMarkdown(editor, slice)` (editor ref via closure/`useRef`). Empty-selection copy must not fire this path.
- [ ] **Step 4:** Styles: body bg `#fff`, text `#37352f`, system sans stack, `.tiptap` max-width 720px centered, padding 96px 24px; h1–h3 scale; `blockquote` `border-left: 3px solid currentColor; padding-left: 14px`; inline code bg `rgba(135,131,120,.15)`; code block bg `#f7f6f3`; table borders `1px solid #e9e9e7`; placeholder color `#b4b4b0`; remove default outline.
- [ ] **Step 5:** Run `npx vitest run`. Expected: all PASS.

### Task 5: Hardening + build verification

**Files:**
- Test: `src/editor/hardening.test.ts`

- [ ] **Step 1: Write tests** for Review Focus 3–5: (3) prose-only paste leaves `looksLikeMarkdown` false (already covered; assert editor content stays one paragraph); (4) loading `"<script>window.__x=1</script>\n\ntext"` markdown yields no `script` element in `editor.getHTML()` and `window.__x` undefined; (5) 1 MB generated markdown loads in under 5 s (generous bound) without throw.
- [ ] **Step 2:** Run. Expected: PASS; if (4) fails, disable HTML parsing in the markdown extension options and re-run.
- [ ] **Step 3:** Run `npm run build`. Expected: exit 0, `dist/` produced.
- [ ] **Step 4:** Manual check (`npm run dev`, browser): paste `# H`, a blockquote, list, table, code → renders; edit text; select a range; copy; paste into a plain-text field → markdown appears; copy with nothing selected leaves clipboard unchanged. Report result honestly.
