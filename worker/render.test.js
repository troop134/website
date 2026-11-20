// Tests for the event page renderer. Run: node --test 'worker/*.test.js'
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderEvent, escapeHtml, safeJson, MEDIA_BASE } from './render.js';

const BASE = 'https://media.troop134.org/';
const TEMPLATE = `<!DOCTYPE html><html><head>
<title>{{TITLE}}</title>
<meta name="description" content="{{DESCRIPTION}}">
<meta property="og:title" content="{{TITLE}}">
<meta property="og:description" content="{{DESCRIPTION}}">
<meta property="og:image" content="{{OG_IMAGE}}">
<link rel="canonical" href="{{CANONICAL}}">
<meta property="og:url" content="{{CANONICAL}}">
</head><body>
<script id="event-data" type="application/json">{{EVENT_JSON}}</script>
</body></html>`;

const EVENT = {
  slug: '2026-09-25-fall-camporee',
  title: 'Fall Camporee',
  category: 'Campout',
  start_date: '2026-09-25',
  end_date: '2026-09-27',
  location: 'Camp Lincoln',
  cover: 'events/2026-09-25-fall-camporee/A1/cover.jpg',
  cover_thumb: 'events/2026-09-25-fall-camporee/A1/cover-thumb.jpg',
  photo_count: 2,
  video_count: 0,
  stats: { miles: '12', nights: '2' },
  media: [],
  memories: [{ album_id: 'A1', credit: 'Sam S.', story: 'We hiked to the lake and cooked dinner on the camp stove.' }],
  updated: '2026-09-30T10:00:00Z',
};

test('MEDIA_BASE is the public bucket address', () => {
  assert.equal(MEDIA_BASE, 'https://media.troop134.org/');
});

test('fills title, description, og:image, canonical', () => {
  const html = renderEvent(TEMPLATE, EVENT, 'https://media.troop134.org/');
  assert.match(html, /<title>Fall Camporee · Troop 134<\/title>/);
  assert.match(html, /property="og:image" content="https:\/\/media\.troop134\.org\/events\/2026-09-25-fall-camporee\/A1\/cover\.jpg"/);
  assert.match(html, /rel="canonical" href="https:\/\/troop134\.org\/photos\/2026-09-25-fall-camporee"/);
  assert.ok(!html.includes('{{'), 'no placeholder left behind');
});

test('hostile text stays text', () => {
  const html = renderEvent(TEMPLATE, { ...EVENT, title: 'A "<b>" & </script><script>alert(1)</script>' }, BASE);
  assert.ok(!html.includes('<script>alert(1)'));
  assert.ok(!/<\/script>\s*<script>alert/.test(html));
  const data = JSON.parse(html.match(/<script id="event-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);   // still valid JSON
  assert.equal(data.title, 'A "<b>" & </script><script>alert(1)</script>', 'round-trips exactly as typed');
  assert.match(html, /<title>A &quot;&lt;b&gt;&quot; &amp; &lt;\/script&gt;/);
});

test('emoji and quotes survive in the JSON and the meta tags', () => {
  const title = 'Pancakes 🥞 at "Dawn"';
  const html = renderEvent(TEMPLATE, { ...EVENT, title }, BASE);
  const data = JSON.parse(html.match(/<script id="event-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(data.title, title);
  assert.match(html, /content="Pancakes 🥞 at &quot;Dawn&quot; · Troop 134"/);
});

test('description is the first 160 characters of the first story, or a default line', () => {
  const long = 'x'.repeat(400);
  const html = renderEvent(TEMPLATE, { ...EVENT, memories: [{ credit: 'Sam S.', story: '' }, { credit: 'Ana R.', story: long }] }, BASE);
  const desc = html.match(/name="description" content="([^"]*)"/)[1];
  assert.equal(desc.length, 160);
  const none = renderEvent(TEMPLATE, { ...EVENT, memories: [] }, BASE);
  assert.match(none, /name="description" content="Photos and stories from a Troop 134 activity\."/);
  const missing = renderEvent(TEMPLATE, { ...EVENT, memories: undefined }, BASE);
  assert.match(missing, /name="description" content="Photos and stories from a Troop 134 activity\."/);
});

test('description collapses whitespace in the story', () => {
  const html = renderEvent(TEMPLATE, { ...EVENT, memories: [{ story: 'Line one.\n\n  Line two.' }] }, BASE);
  assert.match(html, /name="description" content="Line one\. Line two\."/);
});

test('og:image falls back to the site logo when there is no cover', () => {
  const html = renderEvent(TEMPLATE, { ...EVENT, cover: '', cover_thumb: '' }, BASE);
  assert.match(html, /property="og:image" content="https:\/\/troop134\.org\/images\/logo\/troop-134-logo-512\.webp"/);
});

test('cover key with odd characters is escaped in the attribute', () => {
  const html = renderEvent(TEMPLATE, { ...EVENT, cover: 'events/x/"><script>/c.jpg' }, BASE);
  assert.ok(!html.includes('"><script>'));
});

test('escapeHtml escapes the five characters', () => {
  assert.equal(escapeHtml(`<a href="x">'&'</a>`), '&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
  assert.equal(escapeHtml(null), '');
});

test('safeJson escapes <, >, &, U+2028 and U+2029 and still parses', () => {
  const obj = { s: '</script><!-- & \u2028\u2029 >' };
  const out = safeJson(obj);
  assert.ok(!/[<>&\u2028\u2029]/.test(out));
  assert.deepEqual(JSON.parse(out), obj);
});

test('a $ pattern in event text is not treated as a replacement pattern', () => {
  const html = renderEvent(TEMPLATE, { ...EVENT, title: "Cost $& and $' test" }, BASE);
  assert.match(html, /<title>Cost \$&amp; and \$&#39; test · Troop 134<\/title>/);
});
