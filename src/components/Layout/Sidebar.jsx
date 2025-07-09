import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useAuth } from '../../hooks/useAuth';

const {
  FiDatabase,
  FiCloud,
  FiUsers,
  FiSettings,
  FiHome,
  FiLogOut,
  FiTestTube,
  FiImage,
  FiPackage,
  FiShoppingCart
} = FiIcons;

const Sidebar = ({ activeTab, setActiveTab, onLogout, menuItems }) => {
  const { user } = useAuth();
  
  // Se não houver menuItems, usar um menu padrão
  const defaultMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FiHome },
    { id: 'catalog', label: 'Catálogo de Produtos', icon: FiPackage },
    { id: 'sales', label: 'Vendas', icon: FiShoppingCart },
    { id: 'supabase', label: 'Configurar Supabase', icon: FiDatabase },
    { id: 'googledrive', label: 'Configurar Google Drive', icon: FiCloud },
    { id: 'users', label: 'Gerenciar Usuários', icon: FiUsers },
    { id: 'settings', label: 'Configurações', icon: FiSettings },
    { id: 'test-supabase', label: 'Testar Supabase', icon: FiTestTube },
    { id: 'test-googledrive', label: 'Testar Google Drive', icon: FiImage }
  ];
  
  // Usar menuItems se fornecido, senão usar o padrão
  const items = menuItems || defaultMenuItems;

  // Função para obter o ícone com base no ID ou nome
  const getIconByName = (iconName) => {
    const iconMap = {
      'Home': FiHome,
      'Package': FiPackage,
      'ShoppingCart': FiShoppingCart,
      'Database': FiDatabase,
      'Cloud': FiCloud,
      'Users': FiUsers,
      'Settings': FiSettings,
      'TestTube': FiTestTube,
      'Image': FiImage
    };
    
    if (typeof iconName === 'string') {
      return iconMap[iconName] || FiSettings;
    }
    
    return iconName || FiSettings;
  };

  // Obter o nome amigável do perfil do usuário
  const getRoleName = (role) => {
    const roleNames = {
      admin: 'Administrador',
      gerente: 'Gerente',
      vendedor: 'Vendedor',
      cliente: 'Cliente'
    };
    return roleNames[role] || role;
  };

  return (
    <motion.div
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col"
    >
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold">Sistema Admin</h1>
        <p className="text-gray-400 text-sm mt-1">Gestão de Produtos</p>
      </div>
      
      {/* Perfil do Usuário */}
      {user && (
        <div className="mb-6 bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <SafeIcon icon={FiUsers} className="w-5 h-5 text-white" />
            </div>
            <div className="overflow-hidden">
              <h3 className="font-medium text-white truncate">{user.name}</h3>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <div className="bg-gray-700 rounded px-3 py-1 text-center">
            <span className="text-xs font-medium text-gray-300">
              {getRoleName(user.role)}
            </span>
          </div>
        </div>
      )}

      <nav className="space-y-2 flex-1 overflow-y-auto">
        {items.map((item) => {
          const IconComponent = getIconByName(item.icon);
          
          return (
            <motion.button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon icon={IconComponent} className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </motion.button>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-gray-800">
        <motion.button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/20 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <SafeIcon icon={FiLogOut} className="w-5 h-5" />
          <span>Sair</span>
        </motion.button>
      </div>
    </motion.div>
  );
};

export default Sidebar;