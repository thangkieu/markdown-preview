import { describe, expect, test } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import type { Editor } from '@tiptap/core'
import { MarkdownEditor } from './MarkdownEditor'

function paste(el: Element, text: string, html = '') {
  const ev = new Event('paste', { bubbles: true, cancelable: true })
  const data: Record<string, string> = { 'text/plain': text, 'text/html': html }
  Object.defineProperty(ev, 'clipboardData', {
    value: { types: Object.keys(data).filter((k) => data[k]), getData: (t: string) => data[t] ?? '' },
  })
  el.dispatchEvent(ev)
}

async function mount() {
  const utils = render(<MarkdownEditor />)
  const pm = await waitFor(() => {
    const el = utils.container.querySelector('.ProseMirror')
    expect(el).not.toBeNull()
    return el!
  })
  const editor = (pm as unknown as { editor: Editor }).editor
  return { ...utils, pm, editor }
}

describe('MarkdownEditor', () => {
  test('empty state shows icon + message, and disappears once there is content', async () => {
    const { container, editor } = await mount()
    const empty = () => container.querySelector('.empty-state')
    await waitFor(() => expect(empty()).not.toBeNull())
    expect(empty()!.querySelector('svg')).not.toBeNull()
    expect(empty()!.textContent).toContain('Paste markdown here')
    editor.commands.setContent('# Hi', { contentType: 'markdown' })
    await waitFor(() => expect(empty()).toBeNull())
    editor.commands.clearContent()
    await waitFor(() => expect(empty()).not.toBeNull())
  })

  test('pasting markdown renders heading and blockquote', async () => {
    const { container } = render(<MarkdownEditor />)
    const pm = await waitFor(() => {
      const el = container.querySelector('.ProseMirror')
      expect(el).not.toBeNull()
      return el!
    })
    paste(pm, '# Hi\n\n> quote')
    await waitFor(() => {
      expect(container.querySelector('h1')?.textContent).toBe('Hi')
      expect(container.querySelector('blockquote')).not.toBeNull()
    })
  })

  test('pasting plain prose stays one literal paragraph', async () => {
    const { container } = render(<MarkdownEditor />)
    const pm = await waitFor(() => {
      const el = container.querySelector('.ProseMirror')
      expect(el).not.toBeNull()
      return el!
    })
    paste(pm, 'Meeting at 3pm. Bring lunch.')
    await waitFor(() => {
      expect(container.querySelector('p')?.textContent).toContain('Meeting at 3pm')
      expect(container.querySelector('h1,blockquote,ul,ol')).toBeNull()
    })
  })

  test('pasted markdown with a standalone image is inserted, not lost', async () => {
    const { container, pm } = await mount()
    paste(pm, '# Project\n\n![badge](https://x.com/a.svg)\n\nSome text')
    await waitFor(() => {
      expect(container.querySelector('h1')?.textContent).toBe('Project')
      expect(container.querySelector('img[src]')?.getAttribute('src')).toBe('https://x.com/a.svg')
    })
  })

  test('pasting into a code block stays literal inside the block', async () => {
    const { container, pm, editor } = await mount()
    editor.commands.setCodeBlock()
    paste(pm, '# comment\n- y')
    await waitFor(() => {
      expect(container.querySelector('pre')?.textContent).toContain('# comment')
      expect(container.querySelector('h1')).toBeNull()
      expect(container.querySelector('ul')).toBeNull()
    })
  })

  test('rich HTML on the clipboard uses default paste (link kept)', async () => {
    const { container, pm } = await mount()
    paste(pm, '1. docs', '<p>1. <a href="https://x.com">docs</a></p>')
    await waitFor(() => {
      expect(container.querySelector('a')?.getAttribute('href')).toBe('https://x.com')
      expect(container.querySelector('ol')).toBeNull()
    })
  })

  test('inline-only markdown pasted mid-paragraph does not split it', async () => {
    const { container, pm, editor } = await mount()
    editor.commands.setContent('alpha beta')
    editor.commands.setTextSelection(7)
    paste(pm, 'use `npm i` now')
    await waitFor(() => {
      expect(container.querySelectorAll('p').length).toBe(1)
      expect(container.querySelector('code')?.textContent).toBe('npm i')
    })
  })

  test('copy event writes markdown to text/plain and keeps text/html', async () => {
    const { pm, editor } = await mount()
    editor.commands.setContent('# T\n\n> q', { contentType: 'markdown' })
    editor.commands.selectAll()
    const written: Record<string, string> = {}
    const ev = new Event('copy', { bubbles: true, cancelable: true })
    Object.defineProperty(ev, 'clipboardData', {
      value: { clearData() {}, setData: (t: string, v: string) => { written[t] = v } },
    })
    pm.dispatchEvent(ev)
    expect(written['text/plain']).toContain('# T')
    expect(written['text/plain']).toContain('> q')
    expect(written['text/html']).toContain('<h1')
  })

  test('outline lists headings, hides when none, click moves cursor to heading', async () => {
    const { container, editor } = await mount()
    expect(container.querySelector('nav.outline')).toBeNull()
    editor.commands.setContent('# Alpha\n\ntext\n\n## Beta\n\nmore', { contentType: 'markdown' })
    await waitFor(() => {
      const items = [...container.querySelectorAll('nav.outline button')]
      expect(items.map((b) => b.textContent)).toEqual(['Alpha', 'Beta'])
      expect(items[1].getAttribute('data-level')).toBe('2')
    })
    ;(container.querySelectorAll('nav.outline button')[1] as HTMLElement).click()
    const { $from } = editor.state.selection
    expect($from.parent.type.name).toBe('heading')
    expect($from.parent.textContent).toBe('Beta')
  })

  test('markdown copied from a plain-text source (styled-span HTML wrapper) is still parsed', async () => {
    const { container, pm } = await mount()
    paste(
      pm,
      '# Title\n\n- a\n- b',
      "<meta charset='utf-8'><div style=\"color:#000\"><span style=\"white-space:pre\"># Title</span><br><span># </span>- a<br>- b</div>",
    )
    await waitFor(() => {
      expect(container.querySelector('h1')?.textContent).toBe('Title')
      expect(container.querySelectorAll('li').length).toBe(2)
    })
  })

  test('re-pasting an own copy that is only plain paragraphs of markdown text renders it', async () => {
    const { container, pm } = await mount()
    paste(
      pm,
      '# Title\n\n- a',
      "<meta charset='utf-8'><p data-pm-slice=\"0 0 []\"># Title</p><p>- a</p>",
    )
    await waitFor(() => {
      expect(container.querySelector('h1')?.textContent).toBe('Title')
      expect(container.querySelectorAll('li').length).toBe(1)
    })
  })

  test('strong block markdown is parsed even when HTML on the clipboard is rich', async () => {
    const { container, pm } = await mount()
    paste(
      pm,
      '# Title\n\n| a | b |\n|---|---|\n| 1 | 2 |',
      '<p><strong>x</strong> <code>y</code></p><p># Title</p>',
    )
    await waitFor(() => {
      expect(container.querySelector('h1')?.textContent).toBe('Title')
      expect(container.querySelector('table')).not.toBeNull()
    })
  })

  test('own structured copy (real heading + data-pm-slice) still uses default paste', async () => {
    const { container, pm } = await mount()
    paste(pm, '# Title', '<h1 data-pm-slice="0 0 []">Title</h1>')
    await waitFor(() => {
      expect(container.querySelector('h1')?.textContent).toBe('Title')
    })
  })

  test('markdown with bold-wrapped inline code pastes fully (no silent fallback)', async () => {
    const { container, pm } = await mount()
    paste(
      pm,
      '# Runbook\n\n- value order (**the listing returns `flexible_schema: null`; same value**), else x\n\n```bash\nls\n```',
      "<meta charset='utf-8'><div><span>x</span></div>",
    )
    await waitFor(() => {
      expect(container.querySelector('h1')?.textContent).toBe('Runbook')
      expect(container.querySelector('li strong code')).not.toBeNull()
      expect(container.querySelector('pre')).not.toBeNull()
    })
  })
})
