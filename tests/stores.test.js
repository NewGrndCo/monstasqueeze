import test from 'node:test';
import assert from 'node:assert/strict';
import { stores } from '../stores.js';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { distanceMiles, formatDistance } from '../geo.js';

const officialGameStores = [
  ['Jelly Gumbo', '522 Broadway, Amityville, NY 11701'],
  ['Casa Blanca Deli & Smoke Shop', '544 Broadway, Amityville, NY 11701'],
  ['M&B Deli', '571 Broadway, Amityville, NY 11701'],
  ['Jamaican Grand Restaurant (Lil Jamaica)', '691 Broadway, Amityville, NY 11701'],
  ['M&R Tobacco and Convenience', '703 Broadway, Amityville, NY 11701'],
  ['Jason’s Deli', '1180 Sunrise Hwy, Copiague, NY 11726'],
  ['Cloud 9', '3277 Sunrise Highway Service Rd, Islip Terrace, NY 11752'],
  ['Pot Scrappers Jelly Gumbo', '935 Little East Neck Rd, West Babylon, NY 11704'],
  ['M&A Supermarket', '1531 Straight Path, Wyandanch, NY 11798'],
  ['Alex Convenience Store', '301 Merritt Ave, Unit 3, Wyandanch, NY 11798'],
  ['HP State Gas Station', '1373 Straight Path, Wyandanch, NY 11798'],
  ['La Plaza', '1311 Straight Path, Wyandanch, NY 11798'],
  ['Respect My Spoon', '12 Squaw Ln, Mastic, NY 11950']
];

test('new retail locator matches all 13 official game stores exactly', () => {
  assert.equal(stores.length, 13);
  assert.deepEqual(stores.map(store => [store.name, `${store.address}, ${store.town}, ${store.state} ${store.zip}`]), officialGameStores);
});

test('every official retailer produces a valid full-address Maps destination', () => {
  for (const store of stores) {
    const address = `${store.address}, ${store.town}, ${store.state} ${store.zip}`;
    const url = new URL(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`);
    assert.equal(url.searchParams.get('destination'), address);
    assert.match(address, /, NY \d{5}$/);
  }
});

test('public lineup contains every product image in the restock catalog', () => {
  const catalogAssets = [
    'strawberry-lemonade-cutout.webp',
    'classic-lemonade-cutout.webp',
    'half-half-cutout.webp',
    'alkaline-water-cutout.webp',
    'blueberry-lemonade-cutout.webp',
    'mango-lemonade-cutout.webp',
    'raspberry-lemonade-cutout.webp',
    'pineapple-lemonade-cutout.webp'
  ];
  assert.equal(catalogAssets.length, 8);
  for (const asset of catalogAssets) assert.equal(existsSync(resolve('public/assets', asset)), true, `${asset} is missing`);
});

test('approved campaign redesign assets are present', () => {
  const campaignAssets = [
    'monsta-squeeze-logo.png',
    'retailer-bottles.png',
    'monsta-character.png',
    'fruit-splash-atmosphere.webp',
    'squeeze-rush-promo.webp',
    'squeeze-rush-promo-mobile.webp',
    'squeeze-rush-motion.webp',
    'hero-atmosphere-v2.webp',
    'hero-fruit-splash-v2.webp'
  ];
  for (const asset of campaignAssets) assert.equal(existsSync(resolve('public/assets', asset)), true, `${asset} is missing`);
});

test('all official stores have validated coordinates for opt-in distance sorting', () => {
  for (const store of stores) {
    assert.ok(Number.isFinite(store.lat));
    assert.ok(Number.isFinite(store.lon));
    assert.ok(store.lat > 40 && store.lat < 42);
    assert.ok(store.lon < -72 && store.lon > -75);
  }
});

test('distance calculation returns human-readable approximate miles', () => {
  const nearby = distanceMiles(stores[0], stores[1]);
  assert.ok(nearby > 0 && nearby < 1);
  assert.match(formatDistance(nearby), /mi away$/);
});

test('hero uses the approved three-bottle layered composition', () => {
  const html = readFileSync(resolve('index.html'), 'utf8');
  assert.match(html, /hero-atmosphere-v2\.webp/);
  assert.match(html, /hero-fruit-splash-v2\.webp/);
  assert.match(html, /class="hero-bottle strawberry-bottle"/);
  assert.match(html, /class="hero-bottle classic-bottle"/);
  assert.match(html, /class="hero-bottle half-bottle"/);
  assert.doesNotMatch(html.match(/<section class="hero"[\s\S]*?<\/section>/)?.[0] ?? '', /blueberry/i);
});

test('shortage report accepts camera or uploaded photos without contact fields', () => {
  const html = readFileSync(resolve('index.html'), 'utf8');
  const form = html.match(/<form name="shortage-report"[\s\S]*?<\/form>/)?.[0] ?? '';
  assert.match(form, /enctype="multipart\/form-data"/);
  assert.match(form, /name="shelf-photo-camera"[^>]*capture="environment"/);
  assert.match(form, /name="shelf-photo-upload"/);
  assert.doesNotMatch(form, /type="email"|type="tel"|contact-consent/);
});

test('retailer section links directly to the restock portal', () => {
  const html = readFileSync(resolve('index.html'), 'utf8');
  assert.match(html, /href="https:\/\/restock\.monstasqueeze\.com"[^>]*aria-label="Restock Monsta Squeeze"[^>]*>Restock/);
});

test('Netlify credit is visually recessed when the host injects its required badge', () => {
  const css = readFileSync(resolve('styles.css'), 'utf8');
  assert.match(css, /\.site-footer\{position:relative;isolation:isolate/);
  assert.match(css, /#nl-badge-frame\{z-index:0!important;opacity:\.2!important/);
});
