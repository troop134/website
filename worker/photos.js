// Worker for troop134.org. It runs only for /photos/* (see run_worker_first in wrangler.jsonc).
// /photos/<slug> pages are filled from events/<slug>/event.json in the R2 bucket, so link
// previews in WhatsApp and iMessage show the title and the cover photo.
// Every other address is served from the static files in site/.
import { renderEvent, MEDIA_BASE } from './render.js';

const SLUG = /^[0-9]{4}-[0-9]{2}-[0-9]{2}-[a-z0-9]+(-[a-z0-9]+)*$/;
const EVENT_PATH = /^\/photos\/([^/]+)\/?$/;

async function notFound(request, env) {
  // "/404" serves site/404.html (html_handling drops the .html).
  const page = await env.ASSETS.fetch(new URL('/404', request.url).href);
  return new Response(page.body, {
    status: 404,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' },
  });
}

async function readEvent(env, slug) {
  const obj = await env.ALBUMS.get('events/' + slug + '/event.json');
  if (!obj) return null;
  try {
    const event = JSON.parse(await obj.text());
    return event && typeof event === 'object' ? event : null;
  } catch {
    return null;
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const m = url.pathname.match(EVENT_PATH);
    if (!m || (request.method !== 'GET' && request.method !== 'HEAD')) return env.ASSETS.fetch(request);

    const slug = m[1];
    if (!SLUG.test(slug)) return notFound(request, env);
    const event = await readEvent(env, slug);
    if (!event) return notFound(request, env);

    const template = await (await env.ASSETS.fetch(new URL('/event', request.url).href)).text();
    const html = renderEvent(template, { ...event, slug }, MEDIA_BASE);
    return new Response(request.method === 'HEAD' ? null : html, {
      headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'max-age=300' },
    });
  },
};
