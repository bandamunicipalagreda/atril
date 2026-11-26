/* Atril · funcionamiento sin conexión */
const VERSION = 'atril-v6';
const BASE = ['./', './index.html', './config.js', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
const EXTERNOS = [
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'
];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(async c => {
    await c.addAll(BASE);
    for (const u of EXTERNOS) { try { const r = await fetch(u, { mode: 'cors' }); if (r.ok) await c.put(u, r); } catch (err) {} }
  }).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== VERSION).map(x => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                                  // las llamadas al motor no se guardan
  const url = new URL(req.url);
  if (url.hostname.endsWith('google.com') || url.hostname.endsWith('googleusercontent.com')) return;
  if (url.pathname.endsWith('.mp4')) return;                        // el vídeo guía no se guarda (pesa mucho)
  if (url.origin === location.origin) {
    // la app: primero internet (para tener la última versión), si no, lo guardado
    e.respondWith(fetch(req).then(r => { const c = r.clone(); caches.open(VERSION).then(x => x.put(req, c)); return r; })
      .catch(() => caches.match(req, { ignoreSearch: req.mode === 'navigate' }).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
    return;
  }
  // librerías y fuentes: lo guardado primero
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
    if (res.ok || res.type === 'opaque') { const c = res.clone(); caches.open(VERSION).then(x => x.put(req, c)); }
    return res;
  })));
});

/* ---------- Notificaciones ---------- */
try { importScripts('config.js'); } catch (e) {}
function leerCodigo() {
  return new Promise(ok => {
    try {
      const r = indexedDB.open('atril', 1);
      r.onupgradeneeded = () => { r.result.createObjectStore('kv'); r.result.createObjectStore('pdf'); };
      r.onsuccess = () => { try { const q = r.result.transaction('kv').objectStore('kv').get('codigo'); q.onsuccess = () => ok(q.result || ''); q.onerror = () => ok(''); } catch (e) { ok(''); } };
      r.onerror = () => ok('');
    } catch (e) { ok(''); }
  });
}
self.addEventListener('push', e => {
  let d = {};
  try { const j = e.data.json(); d = j.data || j.notification || j; } catch (err) { d = { titulo: 'Atril', cuerpo: e.data ? e.data.text() : '' }; }
  const opciones = {
    body: d.cuerpo || '', tag: d.tag || 'atril', renotify: true, requireInteraction: true,
    icon: 'icon-192.png', badge: 'icon-192.png', vibrate: [200, 100, 200, 100, 300], data: d
  };
  if (d.tipo === 'urgente') opciones.vibrate = [500, 200, 500, 200, 900];
  if (d.tipo === 'vienes' && d.programa) opciones.actions = [{ action: 'si', title: '✓ Sí, voy' }, { action: 'no', title: '✗ No puedo' }];
  e.waitUntil(self.registration.showNotification(d.titulo || 'Atril', opciones));
});
self.addEventListener('notificationclick', e => {
  const d = e.notification.data || {};
  e.notification.close();
  if ((e.action === 'si' || e.action === 'no') && d.programa && self.ATRIL_API) {
    const respuesta = e.action === 'si' ? 'Sí' : 'No';
    e.waitUntil(leerCodigo().then(codigo => fetch(self.ATRIL_API, {
      method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ accion: 'responder', codigo: codigo, programa: d.programa, respuesta: respuesta })
    }).then(r => r.json()).then(j => self.registration.showNotification(j.ok ? (respuesta === 'Sí' ? '¡Apuntado! Cuentan contigo ✓' : 'Apuntado: no vas') : 'No se ha podido guardar', {
      body: j.ok ? (respuesta === 'No' ? 'Si quieres, explica el motivo en Atril.' : '') : (j.error || 'Ábrelo en Atril'), tag: d.tag, icon: 'icon-192.png', data: d
    })).catch(() => self.registration.showNotification('Sin conexión', { body: 'Contesta en Atril cuando tengas internet.', tag: d.tag, icon: 'icon-192.png', data: d }))));
    return;
  }
  // Al abrir, la app enseña primero el contenido de la notificación
  const q = new URLSearchParams(); if (d.ir) q.set('ir', d.ir); if (d.titulo) q.set('nt', d.titulo); if (d.cuerpo) q.set('nc', d.cuerpo); if (d.tipo) q.set('np', d.tipo);
  const destino = './' + (String(q) ? '?' + q : '');
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(l => {
    const c = l.find(x => 'focus' in x);
    if (c) { c.postMessage({ ir: d.ir, titulo: d.titulo, cuerpo: d.cuerpo, tipo: d.tipo }); return c.focus(); }
    return self.clients.openWindow(destino);
  }));
});
