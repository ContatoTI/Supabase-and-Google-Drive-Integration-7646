const CACHE_NAME = 'falcontruck-v1.0.0';
const STATIC_CACHE_NAME = 'falcontruck-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'falcontruck-dynamic-v1.0.0';

// Recursos essenciais para cache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css',
  '/src/App.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  // Fontes do sistema
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// URLs que devem sempre buscar da rede primeiro
const NETWORK_FIRST_URLS = [
  '/api/',
  'supabase.co',
  'googleapis.com'
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('[SW] Error caching static assets:', error);
      })
  );
  
  // Força a ativação imediata
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Remove caches antigos
          if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Assume controle imediato
  self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ignorar requisições não HTTP
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  // Estratégia Network First para APIs
  if (NETWORK_FIRST_URLS.some(pattern => url.href.includes(pattern))) {
    event.respondWith(networkFirst(event.request));
    return;
  }
  
  // Estratégia Cache First para recursos estáticos
  if (event.request.destination === 'image' || 
      event.request.destination === 'script' || 
      event.request.destination === 'style' ||
      event.request.destination === 'font') {
    event.respondWith(cacheFirst(event.request));
    return;
  }
  
  // Estratégia Stale While Revalidate para navegação
  if (event.request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }
  
  // Default: Cache First
  event.respondWith(cacheFirst(event.request));
});

// Estratégia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    const networkResponse = await fetch(request);
    
    // Cache apenas respostas válidas
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache First failed:', error);
    
    // Fallback para página offline se for navegação
    if (request.mode === 'navigate') {
      return caches.match('/index.html');
    }
    
    throw error;
  }
}

// Estratégia Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Estratégia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => {
    // Se falhar e não há cache, retorna página principal
    return caches.match('/index.html');
  });
  
  return cachedResponse || fetchPromise;
}

// Eventos de background sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-cotacao') {
    event.waitUntil(syncCotacao());
  }
});

// Sincronizar cotação quando voltar online
async function syncCotacao() {
  try {
    // Implementar lógica de sincronização da cotação
    console.log('[SW] Syncing cotacao...');
    
    // Buscar dados pendentes do IndexedDB
    const pendingData = await getPendingCotacao();
    
    if (pendingData.length > 0) {
      // Enviar dados para servidor
      for (const item of pendingData) {
        await fetch('/api/cotacao', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
      }
      
      // Limpar dados pendentes
      await clearPendingCotacao();
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}

// Placeholder para IndexedDB operations
async function getPendingCotacao() {
  // Implementar busca no IndexedDB
  return [];
}

async function clearPendingCotacao() {
  // Implementar limpeza do IndexedDB
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');
  
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nova atualização disponível',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      tag: 'falcontruck-notification',
      actions: [
        {
          action: 'open',
          title: 'Abrir App',
          icon: '/icons/icon-72x72.png'
        },
        {
          action: 'close',
          title: 'Fechar',
          icon: '/icons/icon-72x72.png'
        }
      ],
      data: data
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'FalconTruck', options)
    );
  }
});

// Clique em notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  
  event.notification.close();
  
  if (event.action === 'open' || !event.action) {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});