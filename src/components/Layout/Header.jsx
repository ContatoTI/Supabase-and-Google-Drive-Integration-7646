import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiBell, FiUser, FiArrowLeft, FiShoppingCart, FiSettings, FiLogOut, FiPackage, FiChevronDown, FiBarChart2, FiUsers, FiDatabase, FiHome } = FiIcons;

const Header = ({ 
  title, 
  user, 
  onBackClick, 
  showBackButton = false, 
  showCotacao = false, 
  cotacaoCount = 0, 
  onCotacaoClick, 
  onLogout, 
  onMenuItemClick, 
  userRole = 'cliente' 
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef(null);

  // Debug: Log quando o botão é clicado
  const handleCotacaoClick = () => {
    console.log('Header.jsx - Botão de cotação clicado!');
    console.log('Header.jsx - onCotacaoClick disponível:', !!onCotacaoClick);
    console.log('Header.jsx - cotacaoCount:', cotacaoCount);

    if (onCotacaoClick) {
      onCotacaoClick();
    } else {
      console.error('Header.jsx - onCotacaoClick não foi fornecido!');
    }
  };

  // Fechar menu quando clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  // Gerar itens de menu baseado no perfil do usuário
  const getMenuItems = () => {
    const baseItems = [
      { id: 'catalog', label: 'Catálogo', icon: FiPackage }
    ];

    // Itens para vendedor e superiores
    if (['vendedor', 'gerente', 'admin'].includes(userRole)) {
      baseItems.push({ id: 'sales', label: 'Vendas', icon: FiBarChart2 });
    }

    // Itens exclusivos para gerente e admin
    if (['gerente', 'admin'].includes(userRole)) {
      baseItems.push({ id: 'dashboard', label: 'Dashboard', icon: FiHome });
    }

    // Itens exclusivos para admin
    if (userRole === 'admin') {
      baseItems.push(
        { id: 'users', label: 'Usuários', icon: FiUsers },
        { id: 'supabase', label: 'Configurar DB', icon: FiDatabase },
        { id: 'settings', label: 'Configurações', icon: FiSettings }
      );
    }

    // Todos os usuários têm opção de logout
    baseItems.push({ id: 'logout', label: 'Sair', icon: FiLogOut });

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="app-header bg-white shadow-sm border-b border-gray-200 px-6 py-3 flex justify-between items-center fixed top-0 left-0 right-0 z-50"
    >
      {/* Lado Esquerdo - Logo + Título */}
      <div className="flex items-center space-x-4">
        {/* Logo FalconTruck */}
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
          {/* Fallback caso a imagem não carregue */}
          <div className="hidden h-8 w-8 bg-falcon-blue-600 rounded-sm flex items-center justify-center">
            <span className="text-white font-bold text-sm">FT</span>
          </div>
        </div>

        {/* Título */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>
      </div>

      {/* Lado Direito - Botões + Usuário */}
      <div className="flex items-center space-x-4">
        {/* Botão de Cotação */}
        {showCotacao && (
          <motion.button
            onClick={handleCotacaoClick}
            className="relative bg-falcon-blue-600 hover:bg-falcon-blue-700 text-white px-4 py-2 rounded-sm flex items-center space-x-2 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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

        {/* Info do Usuário - Apenas se logado */}
        {user && (
          <div className="relative" ref={menuRef}>
            <motion.button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 py-2 px-3 rounded-sm hover:bg-gray-100 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="w-8 h-8 bg-falcon-blue-600 rounded-sm flex items-center justify-center">
                <SafeIcon icon={FiUser} className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm text-gray-700 hidden sm:block">{user}</span>
              <SafeIcon 
                icon={FiChevronDown} 
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  showUserMenu ? 'rotate-180' : ''
                }`} 
              />
            </motion.button>

            {/* Menu Dropdown */}
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-sm shadow-lg border border-gray-200 z-50"
                >
                  <div className="p-3 border-b border-gray-200">
                    <div className="font-medium text-gray-800">{user}</div>
                    <div className="text-xs text-gray-500 capitalize">{userRole}</div>
                  </div>
                  <div className="py-2">
                    {menuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setShowUserMenu(false);
                          if (item.id === 'logout') {
                            onLogout && onLogout();
                          } else {
                            onMenuItemClick && onMenuItemClick(item.id);
                          }
                        }}
                        className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors text-left"
                      >
                        <SafeIcon 
                          icon={item.icon} 
                          className={`w-4 h-4 ${item.id === 'logout' ? 'text-red-500' : 'text-gray-500'}`} 
                        />
                        <span className={item.id === 'logout' ? 'text-red-500' : ''}>{item.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Botão Voltar */}
        {showBackButton && onBackClick && (
          <motion.button
            onClick={onBackClick}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-sm flex items-center space-x-2 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <SafeIcon icon={FiArrowLeft} className="w-4 h-4" />
            <span className="font-medium hidden sm:inline">Voltar</span>
          </motion.button>
        )}
      </div>
    </motion.header>
  );
};

export default Header;