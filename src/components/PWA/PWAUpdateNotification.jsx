import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiRefreshCw, FiX, FiDownload } = FiIcons;

const PWAUpdateNotification = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Página será recarregada automaticamente
        window.location.reload();
      });

      navigator.serviceWorker.ready.then((reg) => {
        setRegistration(reg);

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] New version available');
              setShowUpdate(true);
            }
          });
        });
      });
    }
  }, []);

  const handleUpdate = () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    setShowUpdate(false);
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-green-600 text-white rounded-lg shadow-2xl p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <SafeIcon icon={FiDownload} className="w-6 h-6 text-white" />
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold mb-1">
                  Nova versão disponível!
                </h3>
                <p className="text-sm text-green-100 mb-3">
                  Uma atualização do app está pronta para ser instalada.
                </p>
                
                <div className="flex space-x-2">
                  <motion.button
                    onClick={handleUpdate}
                    className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-green-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
                    <span>Atualizar</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={handleDismiss}
                    className="bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-800"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Depois
                  </motion.button>
                </div>
              </div>
              
              <button
                onClick={handleDismiss}
                className="text-green-200 hover:text-white"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAUpdateNotification;