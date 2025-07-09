// Utilitários para PWA

export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered successfully:', registration.scope);
          
          // Verificar atualizações periodicamente
          setInterval(() => {
            registration.update();
          }, 60000); // Verifica a cada 1 minuto

        })
        .catch((error) => {
          console.log('[PWA] Service Worker registration failed:', error);
        });
    });
  }
};

export const unregisterServiceWorker = () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
};

// Detectar se está executando como PWA
export const isPWA = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone || 
         document.referrer.includes('android-app://');
};

// Detectar tipo de dispositivo
export const getDeviceType = () => {
  const ua = navigator.userAgent;
  
  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    return 'tablet';
  }
  
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(ua)) {
    return 'mobile';
  }
  
  return 'desktop';
};

// Detectar iOS
export const isIOS = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

// Detectar Android
export const isAndroid = () => {
  return /Android/.test(navigator.userAgent);
};

// Detectar Safari
export const isSafari = () => {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

// Verificar se o prompt de instalação está disponível
export const canInstallPWA = () => {
  return new Promise((resolve) => {
    const handler = (e) => {
      e.preventDefault();
      window.removeEventListener('beforeinstallprompt', handler);
      resolve(true);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    
    // Timeout para casos onde o evento não é disparado
    setTimeout(() => {
      window.removeEventListener('beforeinstallprompt', handler);
      resolve(false);
    }, 1000);
  });
};

// Gerenciar cache offline
export const cacheResource = async (url, cacheName = 'falcontruck-dynamic') => {
  if ('caches' in window) {
    try {
      const cache = await caches.open(cacheName);
      await cache.add(url);
      console.log(`[PWA] Cached: ${url}`);
    } catch (error) {
      console.error(`[PWA] Failed to cache ${url}:`, error);
    }
  }
};

// Limpar cache antigo
export const clearOldCaches = async () => {
  if ('caches' in window) {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => 
      !name.includes('v1.0.0') // Manter apenas caches da versão atual
    );
    
    await Promise.all(
      oldCaches.map(cacheName => caches.delete(cacheName))
    );
    
    console.log('[PWA] Old caches cleared:', oldCaches);
  }
};

// Verificar status da conexão
export const getConnectionStatus = () => {
  return {
    online: navigator.onLine,
    connection: navigator.connection || navigator.mozConnection || navigator.webkitConnection,
    effectiveType: navigator.connection?.effectiveType || 'unknown'
  };
};

// Aguardar conexão
export const waitForConnection = (timeout = 5000) => {
  return new Promise((resolve, reject) => {
    if (navigator.onLine) {
      resolve(true);
      return;
    }
    
    const timer = setTimeout(() => {
      window.removeEventListener('online', onlineHandler);
      reject(new Error('Connection timeout'));
    }, timeout);
    
    const onlineHandler = () => {
      clearTimeout(timer);
      window.removeEventListener('online', onlineHandler);
      resolve(true);
    };
    
    window.addEventListener('online', onlineHandler);
  });
};

// Sincronizar dados offline
export const syncOfflineData = async () => {
  try {
    const pendingRequests = JSON.parse(localStorage.getItem('offline-requests') || '[]');
    
    for (const request of pendingRequests) {
      try {
        await fetch(request.url, request.options);
        console.log('[PWA] Synced offline request:', request.url);
      } catch (error) {
        console.error('[PWA] Failed to sync:', request.url, error);
      }
    }
    
    // Limpar requests sincronizados
    localStorage.removeItem('offline-requests');
    
  } catch (error) {
    console.error('[PWA] Sync failed:', error);
  }
};

// Salvar request para sincronização offline
export const saveOfflineRequest = (url, options = {}) => {
  try {
    const pendingRequests = JSON.parse(localStorage.getItem('offline-requests') || '[]');
    pendingRequests.push({ url, options, timestamp: Date.now() });
    localStorage.setItem('offline-requests', JSON.stringify(pendingRequests));
  } catch (error) {
    console.error('[PWA] Failed to save offline request:', error);
  }
};