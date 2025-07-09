import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiDownload, FiSmartphone, FiX, FiShare, FiPlus } = FiIcons;

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Detectar iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    setIsIOS(iOS);

    // Detectar se já está instalado
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                     window.navigator.standalone || 
                     document.referrer.includes('android-app://');
    setIsStandalone(standalone);

    // Debug: Log do estado atual
    console.log('[PWA Install] iOS:', iOS, 'Standalone:', standalone);

    // Listener para o evento beforeinstallprompt (Chrome/Edge)
    const handleBeforeInstallPrompt = (e) => {
      console.log('[PWA Install] beforeinstallprompt fired');
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
      
      // Mostrar prompt se não for iOS e não estiver instalado
      if (!iOS && !standalone) {
        setTimeout(() => {
          console.log('[PWA Install] Showing install prompt');
          setShowPrompt(true);
        }, 3000);
      }
    };

    // Listener para quando o app for instalado
    const handleAppInstalled = () => {
      console.log('[PWA Install] App was installed');
      setShowPrompt(false);
      setShowIOSInstructions(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Para iOS, mostrar instruções se não estiver instalado
    if (iOS && !standalone) {
      setTimeout(() => {
        console.log('[PWA Install] Showing iOS instructions');
        setShowIOSInstructions(true);
      }, 5000);
    }

    // Verificar se foi dispensado recentemente
    const dismissed = localStorage.getItem('pwa-dismissed');
    if (dismissed) {
      const dismissedTime = parseInt(dismissed);
      const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        setShowPrompt(false);
        setShowIOSInstructions(false);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log('[PWA Install] No deferred prompt available');
      return;
    }

    console.log('[PWA Install] Installing app...');
    
    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      console.log('[PWA Install] User choice:', outcome);
      
      if (outcome === 'accepted') {
        setShowPrompt(false);
        // Opcional: mostrar mensagem de sucesso
        setTimeout(() => {
          alert('App instalado com sucesso! Agora você pode acessá-lo diretamente da sua tela inicial.');
        }, 1000);
      }
    } catch (error) {
      console.error('[PWA Install] Error during installation:', error);
    } finally {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSInstructions(false);
    // Não mostrar novamente por 7 dias
    localStorage.setItem('pwa-dismissed', Date.now().toString());
  };

  const handleForceShow = () => {
    // Função para debug - forçar mostrar o prompt
    if (!isStandalone) {
      if (isIOS) {
        setShowIOSInstructions(true);
      } else {
        setShowPrompt(true);
      }
    }
  };

  // Debug: adicionar botão temporário para testar
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const debugButton = document.createElement('button');
      debugButton.textContent = 'Debug: Show PWA Install';
      debugButton.style.position = 'fixed';
      debugButton.style.top = '10px';
      debugButton.style.left = '10px';
      debugButton.style.zIndex = '9999';
      debugButton.style.background = '#ff6b6b';
      debugButton.style.color = 'white';
      debugButton.style.border = 'none';
      debugButton.style.padding = '8px';
      debugButton.style.borderRadius = '4px';
      debugButton.style.fontSize = '12px';
      debugButton.onclick = handleForceShow;
      
      document.body.appendChild(debugButton);
      
      return () => {
        if (document.body.contains(debugButton)) {
          document.body.removeChild(debugButton);
        }
      };
    }
  }, [isIOS, isStandalone]);

  // Não mostrar se já estiver instalado
  if (isStandalone) {
    console.log('[PWA Install] App is already installed');
    return null;
  }

  // Prompt para Android/Chrome
  const ChromePrompt = () => (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <img 
                    src="https://falcontruck.com.br/wp-content/uploads/2025/07/favicon-falcontruck-96.png"
                    alt="FalconTruck"
                    className="w-8 h-8 rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <SafeIcon icon={FiDownload} className="w-6 h-6 text-white hidden" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  Instalar FalconTruck
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Adicione o app à sua tela inicial para acesso rápido e experiência completa.
                </p>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={handleInstallClick}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 hover:bg-blue-700"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <SafeIcon icon={FiDownload} className="w-4 h-4" />
                    <span>Instalar</span>
                  </motion.button>
                  <motion.button
                    onClick={handleDismiss}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Agora não
                  </motion.button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Instruções para iOS/Safari
  const IOSInstructions = () => (
    <AnimatePresence>
      {showIOSInstructions && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                  <img 
                    src="https://falcontruck.com.br/wp-content/uploads/2025/07/favicon-falcontruck-96.png"
                    alt="FalconTruck"
                    className="w-8 h-8 rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <SafeIcon icon={FiSmartphone} className="w-6 h-6 text-white hidden" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  Adicionar à Tela Inicial
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Para instalar este app no seu iPhone:
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">1</span>
                    <span>Toque no ícone <SafeIcon icon={FiShare} className="inline w-4 h-4 mx-1" /> (Compartilhar)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">2</span>
                    <span>Selecione "Adicionar à Tela Inicial" <SafeIcon icon={FiPlus} className="inline w-4 h-4 mx-1" /></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">3</span>
                    <span>Toque em "Adicionar"</span>
                  </div>
                </div>
                <div className="mt-3">
                  <motion.button
                    onClick={handleDismiss}
                    className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Entendi
                  </motion.button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={FiX} className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {isIOS ? <IOSInstructions /> : <ChromePrompt />}
    </>
  );
};

export default PWAInstallPrompt;