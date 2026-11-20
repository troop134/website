// Routing tests for the /photos/* Worker, with fake ASSETS and ALBUMS bindings.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker from './photos.js';

const TEMPLATE = '<title>{{TITLE}}</title><script id="event-data" type="application/json">{{EVENT_JSON}}</script>';
const EVENT = { slug: '2026-09-25-fall-camporee', title: 'Fall Camporee', cover: 'events/x/cover.jpg', memories: [] };

function makeEnv(objects = {}, { templateMissing = false } = {}) {
  const asked = [];
  return {
    asked,
    ALBUMS: { async get(key) { asked.push(key); return key in objects ? { text: async () => objects[key] } : null; } },
    ASSETS: {
      async fetch(req) {
        const url = new URL(typeof req === 'string' ? req : req.url);
        if (url.pathname === '/event' && templateMissing) return new Response('<h1>Page not found</h1>', { status: 404, headers: { 'content-type': 'text/html' } });
        if (url.pathname === '/event') return new Response(TEMPLATE, { headers: { 'content-type': 'text/html' } });
        if (url.pathname === '/404') return new Response('<h1>Page not found</h1>', { headers: { 'content-type': 'text/html' } });
        return new Response('static ' + url.pathname);
      },
    },
  };
}
const get = (path, env) => worker.fetch(new Request('https://troop134.org' + path), env);

test('a published event renders the template', async () => {
  const env = makeEnv({ 'events/2026-09-25-fall-camporee/event.json': JSON.stringify(EVENT) });
  for (const path of ['/photos/2026-09-25-fall-camporee', '/photos/2026-09-25-fall-camporee/']) {
    const res = await get(path, env);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'max-age=300');
    assert.match(res.headers.get('content-type'), /text\/html/);
    assert.match(await res.text(), /<title>Fall Camporee · Troop 134<\/title>/);
  }
});

test('an unknown slug is the 404 page with status 404', async () => {
  const res = await get('/photos/2026-01-01-nothing-here', makeEnv());
  assert.equal(res.status, 404);
  assert.match(await res.text(), /Page not found/);
});

test('an invalid slug is a 404 and never reaches the bucket', async () => {
  const env = makeEnv();
  for (const path of ['/photos/nope', '/photos/2026-09-25-Fall', '/photos/..%2Fsecret', '/photos/2026-09-25-a--b']) {
    const res = await get(path, env);
    assert.equal(res.status, 404, path);
  }
  assert.deepEqual(env.asked, []);
});

test('a broken event.json is a 404, not a crash', async () => {
  const env = makeEnv({ 'events/2026-09-25-fall-camporee/event.json': '{not json' });
  const res = await get('/photos/2026-09-25-fall-camporee', env);
  assert.equal(res.status, 404);
});

test('everything else falls through to the static files', async () => {
  const env = makeEnv();
  for (const path of ['/photos/', '/photos/a/b.jpg', '/index.html']) {
    const res = await get(path, env);
    assert.equal(await res.text(), 'static ' + path);
  }
});

test('the raw template at /event and /event.html is a 404', async () => {
  for (const path of ['/event', '/event.html']) {
    const res = await get(path, makeEnv());
    assert.equal(res.status, 404, path);
    const body = await res.text();
    assert.match(body, /Page not found/);
    assert.ok(!body.includes('{{'), path);
  }
});

test('a missing template is a 404, never a 200', async () => {
  const env = makeEnv({ 'events/2026-09-25-fall-camporee/event.json': JSON.stringify(EVENT) }, { templateMissing: true });
  const res = await get('/photos/2026-09-25-fall-camporee', env);
  assert.equal(res.status, 404);
});
