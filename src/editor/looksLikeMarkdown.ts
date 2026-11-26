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

const STRONG_BLOCK = [
  /^ {0,3}#{1,6}\s+\S/m, // heading
  /^\s*\|?\s*:?-{3,}:?\s*(?:\|\s*:?-{3,}:?\s*)+\|?\s*$/m, // table delimiter row
  /^ {0,3}(```|~~~)/m, // code fence
]

/**
 * Block-level syntax that rendered web pages don't leak into their plain text.
 * Weak signals (bullets, numbers, inline marks) are deliberately excluded.
 */
export function hasStrongBlockMarkdown(text: string): boolean {
  return STRONG_BLOCK.some((r) => r.test(text))
}
