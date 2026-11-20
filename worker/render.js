// Fills the event page template (site/event.html) from one event.json.
// Pure functions only, so they can be tested with `node --test worker/*.test.js`.

export const MEDIA_BASE = 'https://media.troop134.org/';
export const SITE_BASE = 'https://troop134.org/';
export const DEFAULT_DESCRIPTION = 'Photos and stories from a Troop 134 activity.';
const FALLBACK_IMAGE = SITE_BASE + 'images/logo/troop-134-logo-512.webp';

const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

// Text safe to put inside HTML text or a quoted attribute.
export function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

// JSON safe to put inside <script type="application/json">: no "</script>", no "<!--",
// and no line separators that older parsers treat as line ends. JSON.parse gives back the same object.
export function safeJson(obj) {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

// First 160 characters of the first story that has text, or the default line.
export function describe(event) {
  const memories = Array.isArray(event && event.memories) ? event.memories : [];
  for (const m of memories) {
    const story = String((m && m.story) || '').replace(/\s+/g, ' ').trim();
    if (story) return Array.from(story).slice(0, 160).join('');
  }
  return DEFAULT_DESCRIPTION;
}

export function renderEvent(template, event, mediaBase = MEDIA_BASE) {
  const title = String(event.title || 'Photo album') + ' · Troop 134';
  const image = event.cover ? mediaBase + event.cover : FALLBACK_IMAGE;
  const values = {
    TITLE: escapeHtml(title),
    DESCRIPTION: escapeHtml(describe(event)),
    OG_IMAGE: escapeHtml(image),
    CANONICAL: escapeHtml(SITE_BASE + 'photos/' + encodeURIComponent(event.slug || '')),
    EVENT_JSON: safeJson(event),
  };
  // A function replacer, so "$&" or "$'" in event text is never read as a pattern.
  return template.replace(/\{\{(TITLE|DESCRIPTION|OG_IMAGE|CANONICAL|EVENT_JSON)\}\}/g, (_, k) => values[k]);
}
