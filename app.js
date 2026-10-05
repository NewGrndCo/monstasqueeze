import { stores } from './stores.js';

const grid = document.querySelector('[data-store-grid]');
const search = document.querySelector('#store-search');
const count = document.querySelector('[data-result-count]');
const noResults = document.querySelector('[data-no-results]');
const filterButtons = [...document.querySelectorAll('[data-town]')];
let townFilter = 'all';

function fullAddress(store) { return `${store.address}, ${store.town}, ${store.state} ${store.zip}`; }
function mapsUrl(store) { return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress(store))}`; }
function storeCard(store, index) {
  return `<article class="store-card" style="--delay:${Math.min(index * 40, 240)}ms">
    <div class="store-index">${String(index + 1).padStart(2, '0')}</div>
    <div><p>${store.town}, ${store.state}</p><h3>${store.name}</h3><address>${store.address}<br>${store.town}, ${store.state} ${store.zip}</address></div>
    <a href="${mapsUrl(store)}" target="_blank" rel="noopener" aria-label="Get directions to ${store.name}">Directions <span aria-hidden="true">↗</span></a>
    <button type="button" data-report-store="${store.name.replaceAll('"', '&quot;')}" aria-label="Report a shortage at ${store.name}">Empty shelf?</button>
  </article>`;
}
function filteredStores() {
  const term = search.value.trim().toLowerCase();
  return stores.filter(store => {
    const matchesSearch = !term || `${store.name} ${fullAddress(store)}`.toLowerCase().includes(term);
    const matchesTown = townFilter === 'all' || (townFilter === 'other' ? !['Amityville', 'Wyandanch'].includes(store.town) : store.town === townFilter);
    return matchesSearch && matchesTown;
  });
}
function renderStores() {
  const results = filteredStores();
  grid.innerHTML = results.map(storeCard).join('');
  count.textContent = results.length;
  noResults.hidden = results.length > 0;
  grid.hidden = results.length === 0;
}

search?.addEventListener('input', renderStores);
document.querySelector('[data-clear-search]')?.addEventListener('click', () => { search.value = ''; search.focus(); renderStores(); });
filterButtons.forEach(button => button.addEventListener('click', () => {
  townFilter = button.dataset.town;
  filterButtons.forEach(item => item.classList.toggle('active', item === button));
  renderStores();
}));

const dialog = document.querySelector('[data-report-dialog]');
const retailerSelect = document.querySelector('[data-retailer-select]');
stores.forEach(store => retailerSelect?.insertAdjacentHTML('beforeend', `<option value="${store.name}">${store.name} — ${store.town}</option>`));
function openReport(storeName = '') {
  if (storeName) retailerSelect.value = storeName;
  dialog.showModal();
  document.body.classList.add('dialog-open');
}
document.addEventListener('click', event => {
  const reportButton = event.target.closest('[data-open-report], [data-report-store]');
  if (reportButton) openReport(reportButton.dataset.reportStore || '');
});
document.querySelector('[data-close-report]')?.addEventListener('click', () => dialog.close());
dialog?.addEventListener('close', () => document.body.classList.remove('dialog-open'));
dialog?.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });

const now = new Date();
const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
const dateField = document.querySelector('[data-report-date]');
if (dateField) { dateField.max = today; dateField.value = today; }

const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.site-nav');
menuButton?.addEventListener('click', () => {
  const expanded = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!expanded));
  nav.classList.toggle('open', !expanded);
});
nav?.addEventListener('click', event => { if (event.target.closest('a')) { nav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); } });

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
}), { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(element => observer.observe(element));

document.querySelectorAll('[data-flavor]').forEach(link => link.addEventListener('click', () => {
  search.value = '';
  townFilter = 'all';
  filterButtons.forEach(button => button.classList.toggle('active', button.dataset.town === 'all'));
  renderStores();
}));

document.querySelector('[data-year]').textContent = new Date().getFullYear();
renderStores();
