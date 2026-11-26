// Validate CMS links before they become navigation targets or image sources.
export function contentUrl(value: unknown, allowEmail = false): string | null {
  if (typeof value !== 'string') return null
  const text = value.trim()
  if (!text || /[\\\u0000-\u001f\u007f]/.test(text)) return null
  if (text.startsWith('/') && !text.startsWith('//')) return text
  try {
    const url = new URL(text)
    if (url.username || url.password) return null
    if (url.protocol === 'https:' || url.protocol === 'http:') return url.href
    if (allowEmail && url.protocol === 'mailto:') return url.href
  } catch { /* Empty and malformed links have no destination. */ }
  return null
}
