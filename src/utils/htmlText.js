export function plainTextFromHtml(html = '') {
  return String(html)
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

export function countWords(html = '') {
  const text = plainTextFromHtml(html);
  const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
  return {
    words,
    characters: text.length,
    preview: text.slice(0, 140),
  };
}

export function parseTags(value) {
  if (Array.isArray(value)) {
    return [...new Set(value.map((tag) => String(tag).trim().toLowerCase()).filter(Boolean))].slice(0, 16);
  }
  return [...new Set(String(value || '')
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean))].slice(0, 16);
}
