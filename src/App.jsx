import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCotacao } from './hooks/useCotacao';
import { registerServiceWorker } from './utils/pwaUtils';
import { AuthProvider, useAuth } from './hooks/useAuth';
import ProtectedRoute from './components/Layout/ProtectedRoute';

// Components
import { Login } from './components/Auth/Auth';
import Header from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Dashboard/Dashboard';
import ProductCatalog from './components/Catalog/ProductCatalog';
import { SupabaseConfig, GoogleDriveConfig } from './components/Configuration/Configuration';
import UserManagement from './components/Users/UserManagement';
import OAuthCallback from './components/OAuth/OAuthCallback';
import SupabaseTest from './components/Testing/SupabaseTest';
import GoogleDriveTest from './components/Testing/GoogleDriveTest';
import CotacaoModal from './components/Cotacao/CotacaoModal';
import SalesModule from './components/Sales/SalesModule';

// PWA Components
import PWAInstallPrompt from './components/PWA/PWAInstallPrompt';
import PWAUpdateNotification from './components/PWA/PWAUpdateNotification';
import OfflineIndicator from './components/PWA/OfflineIndicator';
import PWADebugPanel from './components/PWA/PWADebugPanel';

// Hook para buscar imagem do Google Drive
import googleDriveAPI from './config/googleDrive';

import './App.css';

// Componente de Loading personalizado
const LoadingScreen = () => {
  const [logoUrl, setLogoUrl] = useState(null);
  const [loadingText, setLoadingText] = useState('Carregando');

  useEffect(() => {
    // Buscar logo do Google Drive
    const loadLogo = async () => {
      try {
        if (googleDriveAPI.isConfigured()) {
          const logoFile = await googleDriveAPI.findFileByName('vertical-negativo.png');
          if (logoFile && logoFile.downloadUrl) {
            setLogoUrl(logoFile.downloadUrl);
          }
        }
      } catch (error) {
        console.log('Logo não encontrado no Google Drive');
      }
    };

    loadLogo();

    // Animação do texto de carregamento
    const texts = ['Carregando', 'Iniciando', 'Preparando', 'Quase pronto'];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setLoadingText(texts[index]);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="pwa-loading">
      <div className="pwa-loading-content">
        <div className="pwa-logo-container">
          {logoUrl ? (
            <img src={logoUrl} alt="FalconTruck" className="pwa-logo" />
          ) : (
            // Placeholder invisível enquanto carrega
            <div className="pwa-logo-placeholder"></div>
          )}
        </div>
        <div className="pwa-spinner"></div>
        <div className="pwa-loading-text loading-dots">
          {loadingText}
        </div>
        <div className="pwa-loading-subtext">
          Catálogo Virtual de Produtos
        </div>
      </div>
    </div>
  );
};

// Componente principal da aplicação com provedores
const AppContainer = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

// Conteúdo da aplicação que usa o contexto de autenticação
const AppContent = () => {
  const { user, logout, isAuthenticated, hasPermission, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog');
  const [previousTab, setPreviousTab] = useState('catalog');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Hook de cotação global
  const {
    items: cotacaoItems,
    isOpen: isCotacaoOpen,
    setIsOpen: setCotacaoOpen,
    updateQuantity: updateCotacaoQuantity,
    removeItem: removeFromCotacao,
    clearCotacao,
    getTotalItems,
    getTotalValue
  } = useCotacao();

  useEffect(() => {
    registerServiceWorker();

    // Simular tempo de carregamento mais realista
    setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    const viewport = document.querySelector('meta[name=viewport]');
    if (viewport) {
      viewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
      );
    }

    let startY = 0;
    document.addEventListener('touchstart', (e) => {
      startY = e.touches[0].pageY;
    });

    document.addEventListener(
      'touchmove',
      (e) => {
        const y = e.touches[0].pageY;
        if (startY <= 100 && y > startY && window.pageYOffset === 0) {
          e.preventDefault();
        }
      },
      { passive: false }
    );

    const handlePWAForceInstall = () => {
      console.log('[App] Force install event received');
      window.dispatchEvent(new CustomEvent('pwa-show-prompt'));
    };

    window.addEventListener('pwa-force-install', handlePWAForceInstall);

    return () => {
      window.removeEventListener('pwa-force-install', handlePWAForceInstall);
    };
  }, []);

  // Definir o menu com base na categoria do usuário
  const getMenuItems = () => {
    if (!user) return [];

    // Menu base para todos (catálogo sempre disponível)
    const baseMenu = [
      { id: 'catalog', label: 'Catálogo de Produtos', icon: 'Package', permission: 'catalog' }
    ];

    // Menu específico para cada perfil
    switch (user.role) {
      case 'admin': // Admin tem acesso a tudo
        return [
          ...baseMenu,
          { id: 'sales', label: 'Vendas', icon: 'ShoppingCart', permission: 'sales' },
          { id: 'dashboard', label: 'Dashboard', icon: 'Home', permission: 'admin' },
          { id: 'users', label: 'Gerenciar Usuários', icon: 'Users', permission: 'users' },
          { id: 'supabase', label: 'Configurar Supabase', icon: 'Database', permission: 'settings' },
          { id: 'googledrive', label: 'Configurar Google Drive', icon: 'Cloud', permission: 'settings' },
          { id: 'test-supabase', label: 'Testar Supabase', icon: 'TestTube', permission: 'settings' },
          { id: 'test-googledrive', label: 'Testar Google Drive', icon: 'Image', permission: 'settings' }
        ];
      case 'gerente': // Gerente tem acesso ao catálogo e vendas
        return [
          ...baseMenu,
          { id: 'sales', label: 'Vendas', icon: 'ShoppingCart', permission: 'sales' }
        ];
      case 'vendedor': // Vendedor tem acesso ao catálogo e vendas
        return [
          ...baseMenu,
          { id: 'sales', label: 'Vendas', icon: 'ShoppingCart', permission: 'sales' }
        ];
      case 'cliente': // Cliente tem acesso apenas ao catálogo
        return baseMenu;
      default:
        return baseMenu;
    }
  };

  const handleTabChange = (newTab) => {
    // Verificar permissões para o tab
    if (user) {
      // Cliente só pode acessar catálogo
      if (user.role === 'cliente' && newTab !== 'catalog') {
        console.log('Cliente não tem acesso a esta página');
        return;
      }

      // Vendedor só pode acessar catálogo e vendas
      if (user.role === 'vendedor' && newTab !== 'catalog' && newTab !== 'sales') {
        console.log('Vendedor não tem acesso a esta página');
        return;
      }
    }

    setPreviousTab(activeTab);
    setActiveTab(newTab);
  };

  const handleBackToPrevious = () => {
    const tempTab = activeTab;
    setActiveTab(previousTab);
    setPreviousTab(tempTab);
  };

  const handleCotacaoClick = () => {
    console.log('App.jsx - Botão de cotação clicado! Abrindo modal...');
    setCotacaoOpen(true);
  };

  const handleMenuItemClick = (itemId) => {
    console.log('Menu item clicked:', itemId);

    if (itemId === 'logout') {
      logout();
      return;
    }

    // Verificar permissões antes de mudar a aba
    if (user) {
      // Cliente só pode acessar catálogo
      if (user.role === 'cliente' && itemId !== 'catalog') {
        console.log('Cliente não tem acesso a esta página');
        return;
      }

      // Vendedor só pode acessar catálogo e vendas
      if (user.role === 'vendedor' && itemId !== 'catalog' && itemId !== 'sales') {
        console.log('Vendedor não tem acesso a esta página');
        return;
      }
    }

    setActiveTab(itemId);

    // Entrar em modo admin se necessário
    if (itemId !== 'catalog' && !isAdminMode) {
      setIsAdminMode(true);
    }
  };

  const getTabTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      catalog: 'Catálogo Virtual',
      supabase: 'Configurar Supabase',
      googledrive: 'Configurar Google Drive',
      users: 'Gerenciar Usuários',
      settings: 'Configurações',
      'test-supabase': 'Testar Supabase',
      'test-googledrive': 'Testar Google Drive',
      sales: 'Vendas'
    };

    return titles[activeTab] || 'FalconTruck';
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <ProtectedRoute requiredRoles={['admin', 'gerente']}>
            <Dashboard />
          </ProtectedRoute>
        );
      case 'catalog':
        return <ProductCatalog onBackToHome={handleBackToPrevious} />;
      case 'supabase':
        return (
          <ProtectedRoute requiredRoles="admin">
            <SupabaseConfig />
          </ProtectedRoute>
        );
      case 'googledrive':
        return (
          <ProtectedRoute requiredRoles="admin">
            <GoogleDriveConfig />
          </ProtectedRoute>
        );
      case 'users':
        return (
          <ProtectedRoute requiredRoles="admin">
            <UserManagement />
          </ProtectedRoute>
        );
      case 'test-supabase':
        return (
          <ProtectedRoute requiredRoles="admin">
            <SupabaseTest />
          </ProtectedRoute>
        );
      case 'test-googledrive':
        return (
          <ProtectedRoute requiredRoles="admin">
            <GoogleDriveTest />
          </ProtectedRoute>
        );
      case 'sales':
        return (
          <ProtectedRoute requiredRoles={['admin', 'gerente', 'vendedor']}>
            <SalesModule />
          </ProtectedRoute>
        );
      case 'settings':
        return (
          <ProtectedRoute requiredRoles="admin">
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Configurações</h2>
              <p className="text-gray-600">Página em desenvolvimento...</p>
            </div>
          </ProtectedRoute>
        );
      default:
        return <ProductCatalog onBackToHome={handleBackToPrevious} />;
    }
  };

  // Loading screen com novo design
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Se não estiver autenticado e estiver em modo admin, mostrar tela de login
  if (!isAuthenticated && isAdminMode) {
    return (
      <Router>
        <PWAInstallPrompt />
        <PWAUpdateNotification />
        <OfflineIndicator />
        <PWADebugPanel />
        <Routes>
          <Route path="/oauth/callback" element={<OAuthCallback />} />
          <Route path="/#/oauth/callback" element={<OAuthCallback />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    );
  }

  // Determinar se está no modo catálogo (clientes)
  const isCatalogOnlyMode = !isAdminMode || user?.role === 'cliente';

  return (
    <Router>
      <PWAInstallPrompt />
      <PWAUpdateNotification />
      <OfflineIndicator />
      <PWADebugPanel />
      <Routes>
        <Route path="/oauth/callback" element={<OAuthCallback />} />
        <Route path="/#/oauth/callback" element={<OAuthCallback />} />
        <Route
          path="/"
          element={
            isCatalogOnlyMode ? (
              // Layout sem sidebar para catálogo (clientes)
              <div className="h-screen flex flex-col overflow-hidden">
                <Header
                  title={getTabTitle()}
                  user={user?.name}
                  userRole={user?.role || 'cliente'}
                  onBackClick={handleBackToPrevious}
                  showBackButton={false}
                  showCotacao={true}
                  cotacaoCount={getTotalItems()}
                  onCotacaoClick={handleCotacaoClick}
                  onLogout={logout}
                  onMenuItemClick={handleMenuItemClick}
                />
                <main className="flex-1 min-h-0 bg-gray-50">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                  >
                    {renderContent()}
                  </motion.div>
                </main>
                <CotacaoModal
                  isOpen={isCotacaoOpen}
                  onClose={() => setCotacaoOpen(false)}
                  items={cotacaoItems}
                  onUpdateQuantity={updateCotacaoQuantity}
                  onRemove={removeFromCotacao}
                  onClear={clearCotacao}
                  getTotalValue={getTotalValue}
                />
              </div>
            ) : (
              // Layout com sidebar para admin/gerente/vendedor
              <div className="h-screen flex overflow-hidden">
                <div className="hidden lg:block">
                  <Sidebar
                    activeTab={activeTab}
                    setActiveTab={handleTabChange}
                    onLogout={logout}
                    menuItems={getMenuItems()}
                  />
                </div>
                <div className="flex-1 flex flex-col min-w-0 min-h-0">
                  <Header
                    title={getTabTitle()}
                    user={user?.name}
                    userRole={user?.role || 'cliente'}
                    showBackButton={false}
                    showCotacao={activeTab === 'catalog'}
                    cotacaoCount={getTotalItems()}
                    onCotacaoClick={handleCotacaoClick}
                    onLogout={logout}
                    onMenuItemClick={handleMenuItemClick}
                  />
                  <main className="flex-1 min-h-0 bg-gray-50 p-4 lg:p-6">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="h-full"
                    >
                      {renderContent()}
                    </motion.div>
                  </main>
                </div>
                <CotacaoModal
                  isOpen={isCotacaoOpen}
                  onClose={() => setCotacaoOpen(false)}
                  items={cotacaoItems}
                  onUpdateQuantity={updateCotacaoQuantity}
                  onRemove={removeFromCotacao}
                  onClear={clearCotacao}
                  getTotalValue={getTotalValue}
                />
              </div>
            )
          }
        />
        <Route path="*" element={<div>Página não encontrada</div>} />
      </Routes>
    </Router>
  );
};

const App = () => <AppContainer />;

export default App;