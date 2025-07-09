import React from 'react';
import {motion} from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import {SafeIcon} from '../Common';

const {FiDatabase, FiCloud, FiUsers, FiSettings, FiHome, FiLogOut, FiTestTube, FiImage, FiPackage, FiBell, FiUser, FiArrowLeft, FiShoppingCart} = FiIcons;

// Header Component
export const Header = ({title, user, onBackClick, showBackButton = false, showCotacao = false, cotacaoCount = 0, onCotacaoClick}) => {
  const handleCotacaoClick = () => {
    console.log('Header - Botão de cotação clicado!');
    if (onCotacaoClick) {
      onCotacaoClick();
    }
  };

  return (
    <motion.header
      initial={{y: -50, opacity: 0}}
      animate={{y: 0, opacity: 1}}
      className="bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex justify-between items-center"
      style={{height: '60px'}}
    >
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <img 
            src="https://falcontruck.com.br/wp-content/uploads/2023/06/logo-falcontruck-positivosvg.svg" 
            alt="FalconTruck" 
            className="h-8 w-auto"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="hidden h-8 w-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">FT</span>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {showCotacao && (
          <motion.button
            onClick={handleCotacaoClick}
            className="relative bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.95}}
          >
            <SafeIcon icon={FiShoppingCart} className="w-5 h-5" />
            <span className="font-medium">Cotação</span>
            {cotacaoCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold">
                {cotacaoCount > 99 ? '99+' : cotacaoCount}
              </span>
            )}
          </motion.button>
        )}

        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <SafeIcon icon={FiUser} className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm text-gray-700">{user || 'Usuário'}</span>
        </div>

        {showBackButton && onBackClick && (
          <motion.button
            onClick={onBackClick}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.95}}
          >
            <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
            <span className="font-medium">Voltar</span>
          </motion.button>
        )}
      </div>
    </motion.header>
  );
};

// Sidebar Component
export const Sidebar = ({activeTab, setActiveTab, onLogout}) => {
  const menuItems = [
    {id: 'dashboard', label: 'Dashboard', icon: FiHome},
    {id: 'catalog', label: 'Catálogo de Produtos', icon: FiPackage},
    {id: 'supabase', label: 'Configurar Supabase', icon: FiDatabase},
    {id: 'googledrive', label: 'Configurar Google Drive', icon: FiCloud},
    {id: 'users', label: 'Gerenciar Usuários', icon: FiUsers},
    {id: 'settings', label: 'Configurações', icon: FiSettings},
    {id: 'test-supabase', label: 'Testar Supabase', icon: FiTestTube},
    {id: 'test-googledrive', label: 'Testar Google Drive', icon: FiImage}
  ];

  return (
    <motion.div
      initial={{x: -250}}
      animate={{x: 0}}
      className="w-64 bg-gray-900 text-white min-h-screen p-4"
    >
      <div className="mb-8">
        <h1 className="text-xl font-bold text-center">Sistema Admin</h1>
        <p className="text-gray-400 text-center text-sm mt-1">Gestão de Produtos</p>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === item.id 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-300 hover:bg-gray-800 hover:text-white'
            }`}
            whileHover={{scale: 1.02}}
            whileTap={{scale: 0.98}}
          >
            <SafeIcon icon={item.icon} className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </motion.button>
        ))}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <motion.button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
          whileHover={{scale: 1.02}}
          whileTap={{scale: 0.98}}
        >
          <SafeIcon icon={FiLogOut} className="w-5 h-5" />
          <span>Sair</span>
        </motion.button>
      </div>
    </motion.div>
  );
};