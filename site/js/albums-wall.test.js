// Tests for wallCardData (the pure part of the Photos wall). Run: node --test 'site/js/*.test.js'
const test = require('node:test');
const assert = require('node:assert/strict');
const { wallCardData, isValidSlug } = require('./albums-wall.js');

const BASE = 'https://media.troop134.org/';
const camporee = {
  slug: '2026-09-25-fall-camporee', title: 'Fall Camporee', category: 'Campout',
  start_date: '2026-09-25', cover_thumb: 'events/x/A1/001-thumb.webp', photo_count: 24, video_count: 1,
};

test('card data', () => {
  const c = wallCardData(camporee, BASE);
  assert.equal(c.href, '/photos/2026-09-25-fall-camporee');
  assert.equal(c.img, 'https://media.troop134.org/events/x/A1/001-thumb.webp');
  assert.equal(c.title, 'Fall Camporee');
  assert.equal(c.when, 'September 2026');
  assert.equal(c.badge, 'Campout');
  assert.equal(c.counts, '24 photos, 1 video');
});

test('one photo, no video reads "1 photo"', () => {
  assert.equal(wallCardData({ ...camporee, photo_count: 1, video_count: 0 }, BASE).counts, '1 photo');
});

test('no photos reads "12 videos"', () => {
  assert.equal(wallCardData({ ...camporee, photo_count: 0, video_count: 12 }, BASE).counts, '12 videos');
});

test('video part is left out when 0', () => {
  assert.equal(wallCardData({ ...camporee, photo_count: 18, video_count: 0 }, BASE).counts, '18 photos');
});

test('month does not shift with the time zone', () => {
  const save = process.env.TZ;
  for (const tz of ['America/Los_Angeles', 'Pacific/Kiritimati', 'UTC']) {
    process.env.TZ = tz;
    assert.equal(wallCardData({ ...camporee, start_date: '2026-09-01' }, BASE).when, 'September 2026');
    assert.equal(wallCardData({ ...camporee, start_date: '2026-12-31' }, BASE).when, 'December 2026');
  }
  process.env.TZ = save;
});

test('cover path segments are encoded', () => {
  const c = wallCardData({ ...camporee, cover_thumb: 'events/a b/c#1/001 thumb.webp' }, BASE);
  assert.equal(c.img, 'https://media.troop134.org/events/a%20b/c%231/001%20thumb.webp');
});

test('missing cover, category or date give empty strings', () => {
  const c = wallCardData({ slug: '2026-09-25-x', title: 'X', photo_count: 2 }, BASE);
  assert.equal(c.img, '');
  assert.equal(c.badge, '');
  assert.equal(c.when, '');
});

test('slug check', () => {
  assert.equal(isValidSlug('2026-09-25-fall-camporee'), true);
  for (const bad of ['fall-camporee', '2026-09-25-Fall', '2026-09-25-a--b', '2026-09-25-', '../x', '2026-09-25-a/b', null, undefined, 5]) {
    assert.equal(isValidSlug(bad), false, String(bad));
  }
});
