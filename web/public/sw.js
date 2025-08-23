// Senu PWA Service Worker
// Version 1.0.0

const CACHE_NAME = 'senu-v2';
const OFFLINE_URL = '/offline';

// Recursos críticos para cachear
const STATIC_CACHE_URLS = [
  '/',
  '/payments',
  '/offline',
  '/manifest.json',
  
  // Iconos
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/favicon.ico',
  '/icon-48x48.png',
  '/icon-72x72.png',
  '/icon-96x96.png',
  '/icon-128x128.png',
  '/icon-144x144.png',
  '/icon-256x256.png',
  '/icon-384x384.png',
  
  // Screenshots
  '/screenshot-mobile.png',
  '/screenshot-desktop.png',
];

// Recursos de la API que se pueden cachear
const API_CACHE_URLS = [
  '/api/wallets/create',
  '/api/transactions/send',
];

// Instalación del Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker');
  
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      
      try {
        // Cachear recursos estáticos críticos individualmente para evitar fallos
        console.log('[SW] Caching static resources individually...');
        const cachePromises = STATIC_CACHE_URLS.map(async (url) => {
          try {
            const response = await fetch(url);
            if (response.ok) {
              await cache.put(url, response);
              console.log(`[SW] Cached successfully: ${url}`);
            } else {
              console.warn(`[SW] Failed to fetch ${url}: ${response.status}`);
            }
          } catch (err) {
            console.warn(`[SW] Failed to cache ${url}:`, err.message);
          }
        });
        
        await Promise.allSettled(cachePromises);
        console.log('[SW] Static resources caching completed');
      } catch (error) {
        console.warn('[SW] Error during caching process:', error);
      }
      
      // Forzar activación inmediata
      self.skipWaiting();
    })()
  );
});

// Activación del Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker');
  
  event.waitUntil(
    (async () => {
      // Limpiar caches antiguos
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
      
      // Tomar control inmediato de todas las páginas
      await self.clients.claim();
      console.log('[SW] Service Worker activated and claimed clients');
    })()
  );
});

// Estrategia de fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Solo manejar requests del mismo origen
  if (url.origin !== location.origin) {
    return;
  }
  
  // Estrategia para navegación (páginas HTML)
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
  
  // Estrategia para API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Estrategia para recursos estáticos
  if (isStaticResource(request)) {
    event.respondWith(handleStaticResource(request));
    return;
  }
  
  // Para todo lo demás, ir directo a la red
  event.respondWith(fetch(request));
});

// Manejo de requests de navegación (páginas)
async function handleNavigationRequest(request) {
  try {
    // Intentar obtener de la red primero (Network First)
    const networkResponse = await fetch(request);
    
    // Si es exitoso, cachear y devolver
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
      return networkResponse;
    }
    
    throw new Error('Network response not ok');
  } catch (error) {
    console.log('[SW] Network failed for navigation, trying cache');
    
    // Si falla la red, intentar cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si no hay cache, mostrar página offline
    const offlineResponse = await caches.match(OFFLINE_URL);
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Fallback básico
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8">
          <title>Senu - Sin Conexión</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
            .offline { color: #666; }
          </style>
        </head>
        <body>
          <div class="offline">
            <h1>Sin Conexión</h1>
            <p>Por favor verifica tu conexión a internet e intenta nuevamente.</p>
            <button onclick="window.location.reload()">Reintentar</button>
          </div>
        </body>
      </html>
      `,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Manejo de requests de API
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Para APIs críticas, intentar red primero
    const networkResponse = await fetch(request);
    
    // Cachear respuestas exitosas de GET
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] API request failed, trying cache');
    
    // Si es GET y falla la red, intentar cache
    if (request.method === 'GET') {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        return cachedResponse;
      }
    }
    
    // Para POST/PUT/DELETE sin conexión, guardar para sync posterior
    if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
      // Aquí se podría implementar background sync
      console.log('[SW] Offline API request detected, could implement background sync');
    }
    
    // Respuesta de error
    return new Response(
      JSON.stringify({
        error: 'Sin conexión',
        message: 'No se pudo completar la operación. Intenta nuevamente cuando tengas conexión.',
        offline: true
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Manejo de recursos estáticos
async function handleStaticResource(request) {
  // Cache First para recursos estáticos
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Failed to fetch static resource:', request.url);
    
    // Para imágenes, devolver un placeholder si es necesario
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect width="200" height="200" fill="#f0f0f0"/><text x="100" y="100" text-anchor="middle" fill="#999">Sin conexión</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    throw error;
  }
}

// Verificar si es un recurso estático
function isStaticResource(request) {
  const url = new URL(request.url);
  
  return (
    url.pathname.startsWith('/_next/') ||
    url.pathname.startsWith('/static/') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico') ||
    url.pathname.endsWith('.woff') ||
    url.pathname.endsWith('.woff2')
  );
}

// Manejo de mensajes desde la aplicación
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;
      
    case 'GET_VERSION':
      event.ports[0].postMessage({ version: CACHE_NAME });
      break;
      
    case 'CACHE_URLS':
      if (payload && payload.urls) {
        cacheUrls(payload.urls);
      }
      break;
      
    default:
      console.log('[SW] Unknown message type:', type);
  }
});

// Función para cachear URLs adicionales
async function cacheUrls(urls) {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(urls);
    console.log('[SW] Additional URLs cached successfully');
  } catch (error) {
    console.warn('[SW] Failed to cache additional URLs:', error);
  }
}

// Notificaciones Push (preparado para futuro uso)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'Tienes una nueva transacción en Senu',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      url: '/'
    },
    actions: [
      {
        action: 'view',
        title: 'Ver Detalles'
      },
      {
        action: 'dismiss',
        title: 'Cerrar'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.message || options.body;
    options.data = { ...options.data, ...data };
  }
  
  event.waitUntil(
    self.registration.showNotification('Senu', options)
  );
});

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const { action, data } = event;
  
  if (action === 'dismiss') {
    return;
  }
  
  // Abrir o enfocar la aplicación
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of clientList) {
        if (client.url.includes(location.origin) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Si no, abrir nueva ventana
      if (clients.openWindow) {
        const url = data?.url || '/';
        return clients.openWindow(url);
      }
    })
  );
});

console.log('[SW] Service Worker loaded successfully');
