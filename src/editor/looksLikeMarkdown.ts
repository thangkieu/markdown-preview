const BLOCK = [
  /^ {0,3}#{1,6}\s+\S/m, // heading
  /^ {0,3}[-*+]\s+\S/m, // bullet / task
  /^ {0,3}\d+[.)]\s+\S/m, // ordered list
  /^ {0,3}>\s?\S/m, // blockquote
  /^ {0,3}(```|~~~)/m, // fence
  /^\s*\|?\s*:?-{3,}:?\s*\|/m, // table rule row
]
const INLINE = [
  /\*\*[^*\n]+\*\*/,
  /`[^`\n]+`/,
  /\[[^\]\n]+\]\([^)\s]+\)/,
]

export function looksLikeMarkdown(text: string): boolean {
  if (!text.trim()) return false
  return BLOCK.some((r) => r.test(text)) || INLINE.some((r) => r.test(text))
}
