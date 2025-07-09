import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiWifiOff, FiWifi, FiAlertCircle } = FiIcons;

const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-hide message after 5 seconds when back online
  useEffect(() => {
    if (isOnline && showOfflineMessage) {
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOnline, showOfflineMessage]);

  return (
    <AnimatePresence>
      {showOfflineMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-4 right-4 z-50"
        >
          <div className={`rounded-lg shadow-lg p-3 flex items-center space-x-3 ${
            isOnline 
              ? 'bg-green-600 text-white' 
              : 'bg-yellow-600 text-white'
          }`}>
            <SafeIcon 
              icon={isOnline ? FiWifi : FiWifiOff} 
              className="w-5 h-5 flex-shrink-0" 
            />
            
            <div className="flex-1">
              <p className="text-sm font-medium">
                {isOnline 
                  ? 'Conexão restaurada!' 
                  : 'Você está offline'
                }
              </p>
              <p className="text-xs opacity-90">
                {isOnline 
                  ? 'Sincronizando dados...' 
                  : 'Algumas funcionalidades podem estar limitadas'
                }
              </p>
            </div>

            {!isOnline && (
              <SafeIcon icon={FiAlertCircle} className="w-5 h-5 flex-shrink-0" />
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OfflineIndicator;