import { stores } from './stores.js';
import { distanceMiles, formatDistance } from './geo.js';

const grid = document.querySelector('[data-store-grid]');
const search = document.querySelector('#store-search');
const count = document.querySelector('[data-result-count]');
const noResults = document.querySelector('[data-no-results]');
const filterButtons = [...document.querySelectorAll('[data-town]')];
let townFilter = 'all';
let userLocation = null;
let storesExpanded = false;
const viewAllButton = document.querySelector('[data-view-all]');

function fullAddress(store) { return `${store.address}, ${store.town}, ${store.state} ${store.zip}`; }
function mapsUrl(store) { return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullAddress(store))}`; }
function storeCard(store, index) {
  return `<article class="store-card" style="--delay:${Math.min(index * 40, 240)}ms">
    <div class="store-index">${String(index + 1).padStart(2, '0')}</div>
    <div><p>${store.town}, ${store.state}</p><h3>${store.name}</h3><address>${store.address}<br>${store.town}, ${store.state} ${store.zip}</address></div>
    ${store.distance == null ? '' : `<p class="store-distance"><i></i>${formatDistance(store.distance)}</p>`}
    <a href="${mapsUrl(store)}" target="_blank" rel="noopener" aria-label="Get directions to ${store.name}">Directions <span aria-hidden="true">↗</span></a>
    <button type="button" data-report-store="${store.name.replaceAll('"', '&quot;')}" aria-label="Report a shortage at ${store.name}">Empty shelf?</button>
  </article>`;
}
function filteredStores() {
  const term = search.value.trim().toLowerCase();
  const results = stores.filter(store => {
    const matchesSearch = !term || `${store.name} ${fullAddress(store)}`.toLowerCase().includes(term);
    const matchesTown = townFilter === 'all' || (townFilter === 'other' ? !['Amityville', 'Wyandanch'].includes(store.town) : store.town === townFilter);
    return matchesSearch && matchesTown;
  }).map(store => ({ ...store, distance: userLocation ? distanceMiles(userLocation, store) : null }));
  if (userLocation) results.sort((first, second) => first.distance - second.distance);
  return results;
}
function renderStores() {
  const results = filteredStores();
  const isFiltered = search.value.trim() || townFilter !== 'all';
  const displayedResults = storesExpanded || isFiltered ? results : results.slice(0, 3);
  grid.innerHTML = displayedResults.map(storeCard).join('');
  count.textContent = results.length;
  noResults.hidden = results.length > 0;
  grid.hidden = results.length === 0;
  viewAllButton.hidden = results.length <= 3 || Boolean(isFiltered);
  viewAllButton.setAttribute('aria-expanded', String(storesExpanded));
  viewAllButton.innerHTML = storesExpanded
    ? 'Show featured locations <span>↑</span>'
    : `View all ${results.length} retail locations <span>→</span>`;
}

search?.addEventListener('input', renderStores);
document.querySelector('[data-clear-search]')?.addEventListener('click', () => { search.value = ''; search.focus(); renderStores(); });
filterButtons.forEach(button => button.addEventListener('click', () => {
  townFilter = button.dataset.town;
  storesExpanded = false;
  filterButtons.forEach(item => item.classList.toggle('active', item === button));
  renderStores();
}));
viewAllButton?.addEventListener('click', () => {
  storesExpanded = !storesExpanded;
  renderStores();
  if (!storesExpanded) document.querySelector('#find')?.scrollIntoView({ behavior: 'smooth' });
});

const locationButton = document.querySelector('[data-use-location]');
const locationStatus = document.querySelector('[data-location-status]');
locationButton?.addEventListener('click', () => {
  if (!navigator.geolocation) {
    locationStatus.textContent = 'Location is not supported by this browser. You can still search by town or ZIP code.';
    return;
  }
  locationButton.disabled = true;
  locationButton.classList.add('loading');
  locationStatus.textContent = 'Waiting for location permission…';
  navigator.geolocation.getCurrentPosition(position => {
    userLocation = { lat: position.coords.latitude, lon: position.coords.longitude };
    townFilter = 'all';
    search.value = '';
    filterButtons.forEach(button => button.classList.toggle('active', button.dataset.town === 'all'));
    locationButton.textContent = 'Location on';
    locationButton.classList.remove('loading');
    locationStatus.textContent = 'Stores are sorted nearest first. Distances are approximate straight-line miles.';
    renderStores();
  }, error => {
    locationButton.disabled = false;
    locationButton.classList.remove('loading');
    locationStatus.textContent = error.code === 1
      ? 'Location access was not allowed. Search by town or ZIP code instead.'
      : 'Your location could not be found. Try again or search by town or ZIP code.';
  }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
});

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

const photoInputs = [...document.querySelectorAll('[data-photo-input]')];
const photoPreview = document.querySelector('[data-photo-preview]');
const photoPreviewImage = photoPreview?.querySelector('img');
const photoName = document.querySelector('[data-photo-name]');
const photoStatus = document.querySelector('[data-photo-status]');
let photoObjectUrl = null;

function clearPhoto() {
  photoInputs.forEach(input => { input.value = ''; });
  if (photoObjectUrl) URL.revokeObjectURL(photoObjectUrl);
  photoObjectUrl = null;
  if (photoPreviewImage) photoPreviewImage.removeAttribute('src');
  if (photoPreview) photoPreview.hidden = true;
  if (photoName) photoName.textContent = '';
}

photoInputs.forEach(input => input.addEventListener('change', () => {
  const file = input.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) {
    clearPhoto();
    photoStatus.textContent = 'Choose an image file such as a photo from your camera or gallery.';
    return;
  }
  if (file.size > 8 * 1024 * 1024) {
    clearPhoto();
    photoStatus.textContent = 'That photo is over 8 MB. Choose a smaller image and try again.';
    return;
  }
  photoInputs.filter(other => other !== input).forEach(other => { other.value = ''; });
  if (photoObjectUrl) URL.revokeObjectURL(photoObjectUrl);
  photoObjectUrl = URL.createObjectURL(file);
  photoPreviewImage.src = photoObjectUrl;
  photoName.textContent = file.name;
  photoPreview.hidden = false;
  photoStatus.textContent = 'Photo ready to send with your shortage report.';
}));
document.querySelector('[data-remove-photo]')?.addEventListener('click', () => {
  clearPhoto();
  photoStatus.textContent = 'Photo removed.';
});

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
