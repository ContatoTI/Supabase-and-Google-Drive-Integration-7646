import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiSettings, FiDownload, FiInfo, FiX } = FiIcons;

const PWADebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pwaInfo, setPwaInfo] = useState({});

  useEffect(() => {
    // Só mostrar em desenvolvimento
    if (process.env.NODE_ENV !== 'development') return;

    const updatePWAInfo = () => {
      const info = {
        isStandalone: window.matchMedia('(display-mode: standalone)').matches,
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
        hasServiceWorker: 'serviceWorker' in navigator,
        manifestExists: !!document.querySelector('link[rel="manifest"]'),
        isSecure: window.location.protocol === 'https:' || window.location.hostname === 'localhost',
        userAgent: navigator.userAgent,
        displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
        manifestUrl: document.querySelector('link[rel="manifest"]')?.href
      };
      setPwaInfo(info);
    };

    updatePWAInfo();

    const interval = setInterval(updatePWAInfo, 5000);
    return () => clearInterval(interval);
  }, []);

  const forceInstallPrompt = () => {
    window.dispatchEvent(new CustomEvent('pwa-force-install'));
  };

  const testNotification = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('FalconTruck PWA', {
          body: 'Teste de notificação PWA!',
          icon: 'https://falcontruck.com.br/wp-content/uploads/2025/07/favicon-falcontruck-96.png'
        });
      }
    }
  };

  const checkManifest = async () => {
    try {
      const response = await fetch('/manifest.json');
      const manifest = await response.json();
      console.log('[PWA Debug] Manifest:', manifest);
      alert('Manifest carregado com sucesso! Verifique o console.');
    } catch (error) {
      console.error('[PWA Debug] Erro ao carregar manifest:', error);
      alert('Erro ao carregar manifest: ' + error.message);
    }
  };

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      {/* Botão flutuante */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 w-12 h-12 bg-purple-600 text-white rounded-full shadow-lg z-50 flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <SafeIcon icon={FiSettings} className="w-6 h-6" />
      </motion.button>

      {/* Panel */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-96 overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold">PWA Debug Panel</h3>
              <button onClick={() => setIsOpen(false)}>
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {/* Status */}
              <div>
                <h4 className="font-medium mb-2">Status PWA</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Standalone:</span>
                    <span className={pwaInfo.isStandalone ? 'text-green-600' : 'text-red-600'}>
                      {pwaInfo.isStandalone ? 'Sim' : 'Não'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>iOS:</span>
                    <span>{pwaInfo.isIOS ? 'Sim' : 'Não'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Worker:</span>
                    <span className={pwaInfo.hasServiceWorker ? 'text-green-600' : 'text-red-600'}>
                      {pwaInfo.hasServiceWorker ? 'Suportado' : 'Não suportado'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Manifest:</span>
                    <span className={pwaInfo.manifestExists ? 'text-green-600' : 'text-red-600'}>
                      {pwaInfo.manifestExists ? 'Presente' : 'Ausente'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>HTTPS:</span>
                    <span className={pwaInfo.isSecure ? 'text-green-600' : 'text-red-600'}>
                      {pwaInfo.isSecure ? 'Seguro' : 'Inseguro'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Display Mode:</span>
                    <span>{pwaInfo.displayMode}</span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div>
                <h4 className="font-medium mb-2">Ações de Teste</h4>
                <div className="space-y-2">
                  <button
                    onClick={forceInstallPrompt}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded text-sm hover:bg-blue-700"
                  >
                    <SafeIcon icon={FiDownload} className="w-4 h-4 inline mr-2" />
                    Forçar Prompt de Instalação
                  </button>
                  <button
                    onClick={testNotification}
                    className="w-full bg-green-600 text-white py-2 px-4 rounded text-sm hover:bg-green-700"
                  >
                    Testar Notificação
                  </button>
                  <button
                    onClick={checkManifest}
                    className="w-full bg-purple-600 text-white py-2 px-4 rounded text-sm hover:bg-purple-700"
                  >
                    Verificar Manifest
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(pwaInfo, null, 2));
                      alert('Informações copiadas!');
                    }}
                    className="w-full bg-gray-600 text-white py-2 px-4 rounded text-sm hover:bg-gray-700"
                  >
                    <SafeIcon icon={FiInfo} className="w-4 h-4 inline mr-2" />
                    Copiar Info PWA
                  </button>
                </div>
              </div>

              {/* Manifest URL */}
              {pwaInfo.manifestUrl && (
                <div>
                  <h4 className="font-medium mb-2">Manifest URL</h4>
                  <div className="text-xs bg-gray-100 p-2 rounded break-all">
                    {pwaInfo.manifestUrl}
                  </div>
                </div>
              )}

              {/* User Agent */}
              <div>
                <h4 className="font-medium mb-2">User Agent</h4>
                <div className="text-xs bg-gray-100 p-2 rounded break-all">
                  {pwaInfo.userAgent}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </>
  );
};

export default PWADebugPanel;