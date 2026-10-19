/* Accounting Lab service worker (generated from scripts/sw-template.js at build time).
 * - Precaches the shell, hashed assets and all bounded released content packs.
 * - Static-web datasets cache after first successful download; local mode precaches them.
 * - Cache name is versioned by the build hash (1:1 with a promoted release).
 * - Never caches /__lab/* (health + backup API).
 * - A new version waits until the app sends {type:'SKIP_WAITING'} (update prompt is
 *   deferred by the app during exams and unsaved drafts).
 */
const BUILD_HASH = '08541c9698798067';
const RELEASE_ID = 'web-08541c9698798067';
const SCOPE_PATH = new URL(self.registration.scope).pathname;
const CACHE_PREFIX = 'accounting-lab-' + SCOPE_PATH + '-';
const CACHE = CACHE_PREFIX + BUILD_HASH;
const PRECACHE = ["/accounting-lab-web/assets/esm-BF8Ugyw8.js","/accounting-lab-web/assets/index-BTexEg8x.js","/accounting-lab-web/assets/index-CsGj_BVS.css","/accounting-lab-web/assets/learner-CUrLmLZ4.js","/accounting-lab-web/content/manifest.json","/accounting-lab-web/content/packs/assessments.json","/accounting-lab-web/content/packs/career.json","/accounting-lab-web/content/packs/company.json","/accounting-lab-web/content/packs/day-01.json","/accounting-lab-web/content/packs/day-02.json","/accounting-lab-web/content/packs/day-03.json","/accounting-lab-web/content/packs/day-04.json","/accounting-lab-web/content/packs/day-05.json","/accounting-lab-web/content/packs/day-06.json","/accounting-lab-web/content/packs/day-07.json","/accounting-lab-web/content/packs/day-08.json","/accounting-lab-web/content/packs/day-09.json","/accounting-lab-web/content/packs/day-10.json","/accounting-lab-web/content/packs/day-11.json","/accounting-lab-web/content/packs/day-12.json","/accounting-lab-web/content/packs/day-13.json","/accounting-lab-web/content/packs/day-14.json","/accounting-lab-web/content/packs/dictionary.json","/accounting-lab-web/content/packs/documents.json","/accounting-lab-web/content/packs/excel.json","/accounting-lab-web/content/packs/labs.json","/accounting-lab-web/content/packs/research.json","/accounting-lab-web/content/packs/skills.json","/accounting-lab-web/content/packs/track.json","/accounting-lab-web/content/packs/whatif.json","/accounting-lab-web/favicon.svg","/accounting-lab-web/icons/accounting-lab.svg","/accounting-lab-web/icons/apple-touch-icon.png","/accounting-lab-web/icons/icon-192.png","/accounting-lab-web/icons/icon-512.png","/accounting-lab-web/icons/maskable-512.png","/accounting-lab-web/index.html","/accounting-lab-web/manifest.webmanifest"];
const RUNTIME = new Set(["/accounting-lab-web/datasets/bank/bank_statement.csv","/accounting-lab-web/datasets/bank/bank_statement.xlsx","/accounting-lab-web/datasets/bank/cash_book.csv","/accounting-lab-web/datasets/bank/cash_book.xlsx","/accounting-lab-web/datasets/expenses/expenses_clean.csv","/accounting-lab-web/datasets/expenses/expenses_clean.xlsx","/accounting-lab-web/datasets/expenses/expenses_dirty.csv","/accounting-lab-web/datasets/expenses/expenses_dirty.xlsx","/accounting-lab-web/datasets/expenses/expenses_solution.csv","/accounting-lab-web/datasets/expenses/expenses_solution.xlsx","/accounting-lab-web/datasets/inventory/inventory_count_clean.csv","/accounting-lab-web/datasets/inventory/inventory_count_clean.xlsx","/accounting-lab-web/datasets/inventory/inventory_count_dirty.csv","/accounting-lab-web/datasets/inventory/inventory_count_dirty.xlsx","/accounting-lab-web/datasets/payroll/payroll_march_dirty.csv","/accounting-lab-web/datasets/payroll/payroll_march_dirty.xlsx","/accounting-lab-web/datasets/purchases/purchases_clean.csv","/accounting-lab-web/datasets/purchases/purchases_clean.xlsx","/accounting-lab-web/datasets/purchases/purchases_dirty.csv","/accounting-lab-web/datasets/purchases/purchases_dirty.xlsx","/accounting-lab-web/datasets/purchases/purchases_solution.csv","/accounting-lab-web/datasets/purchases/purchases_solution.xlsx","/accounting-lab-web/datasets/sales/customers.csv","/accounting-lab-web/datasets/sales/customers.xlsx","/accounting-lab-web/datasets/sales/sales_clean.csv","/accounting-lab-web/datasets/sales/sales_clean.xlsx","/accounting-lab-web/datasets/sales/sales_dirty.csv","/accounting-lab-web/datasets/sales/sales_dirty.xlsx"]);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      cache.addAll(PRECACHE.map((url) => new Request(url, { cache: 'reload' }))),
    ),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => k.startsWith(CACHE_PREFIX) && k !== CACHE).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') self.skipWaiting();
  if (data.type === 'GET_VERSION' && event.source) {
    event.source.postMessage({ type: 'VERSION', buildHash: BUILD_HASH, releaseId: RELEASE_ID });
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(SCOPE_PATH)) return;
  if (url.pathname.startsWith('/__lab/')) return;
  if (request.mode !== 'navigate' && !PRECACHE.includes(url.pathname) && !RUNTIME.has(url.pathname)) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      if (request.mode === 'navigate' && (url.pathname === SCOPE_PATH || url.pathname === SCOPE_PATH + 'index.html')) {
        const shell = await cache.match(SCOPE_PATH + 'index.html');
        if (shell) return shell;
        return fetch(request);
      }
      const hit = await cache.match(url.pathname);
      if (hit) return hit;
      try {
        const response = await fetch(request);
        if (response.ok && RUNTIME.has(url.pathname)) {
          // Quota failure must never turn a successful spreadsheet download into a failure.
          try { await cache.put(url.pathname, response.clone()); } catch { /* optional runtime cache */ }
        }
        return response;
      } catch (err) {
        return new Response('offline', { status: 503, statusText: 'offline' });
      }
    })(),
  );
});
