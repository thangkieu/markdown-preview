/**
 * True when clipboard HTML carries real structure (headings, lists, links,
 * tables, emphasis, images), including copies from this editor. Plain text
 * that a browser merely wraps in styled spans/divs/pre, or paragraphs of
 * literal markdown text copied from this editor, is NOT rich.
 */
const STRUCTURE = /<(?:(?:h[1-6]|ul|ol|li|table|blockquote|strong|em|b|i|del|s|img)[\s>/]|a\s[^>]*href)/i

export function isRichHtml(html: string): boolean {
  if (!html) return false
  return STRUCTURE.test(html)
}
