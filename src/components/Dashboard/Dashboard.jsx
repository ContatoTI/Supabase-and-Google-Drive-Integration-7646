import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { getSupabaseConfig, getGoogleDriveConfig } from '../../config/storage';

const { FiDatabase, FiCloud, FiUsers, FiSettings, FiCheck, FiX, FiAlertCircle } = FiIcons;

const Dashboard = () => {
  const supabaseConfig = getSupabaseConfig();
  const googleDriveConfig = getGoogleDriveConfig();
  const users = JSON.parse(localStorage.getItem('users') || '[]');

  const configStatus = [
    {
      title: 'Supabase',
      icon: FiDatabase,
      configured: !!supabaseConfig?.url && !!supabaseConfig?.anonKey,
      color: 'blue'
    },
    {
      title: 'Google Drive',
      icon: FiCloud,
      configured: !!googleDriveConfig?.clientId && !!googleDriveConfig?.apiKey,
      color: 'green'
    },
    {
      title: 'Usuários',
      icon: FiUsers,
      configured: users.length > 0,
      color: 'purple'
    }
  ];

  const stats = [
    {
      title: 'Total de Usuários',
      value: users.length,
      icon: FiUsers,
      color: 'blue'
    },
    {
      title: 'Usuários Ativos',
      value: users.filter(u => u.active).length,
      icon: FiCheck,
      color: 'green'
    },
    {
      title: 'Administradores',
      value: users.filter(u => u.role === 'admin').length,
      icon: FiSettings,
      color: 'purple'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto p-6 space-y-6"
    >
      {/* Status das Configurações */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Status das Configurações</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {configStatus.map((config) => (
            <motion.div
              key={config.title}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-lg border-2 ${
                config.configured
                  ? 'border-green-200 bg-green-50'
                  : 'border-red-200 bg-red-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <SafeIcon 
                    icon={config.icon} 
                    className={`w-8 h-8 text-${config.color}-500`} 
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{config.title}</h3>
                    <p className={`text-sm ${
                      config.configured ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {config.configured ? 'Configurado' : 'Não configurado'}
                    </p>
                  </div>
                </div>
                <SafeIcon 
                  icon={config.configured ? FiCheck : FiX} 
                  className={`w-6 h-6 ${
                    config.configured ? 'text-green-500' : 'text-red-500'
                  }`} 
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Estatísticas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 p-4 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
                <SafeIcon 
                  icon={stat.icon} 
                  className={`w-8 h-8 text-${stat.color}-500`} 
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Alertas */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Alertas do Sistema</h2>
        <div className="space-y-3">
          {!supabaseConfig?.url && (
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium">Supabase não configurado</p>
                <p className="text-yellow-700 text-sm">Configure as credenciais do Supabase para usar o banco de dados.</p>
              </div>
            </div>
          )}

          {!googleDriveConfig?.clientId && (
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-yellow-800 font-medium">Google Drive não configurado</p>
                <p className="text-yellow-700 text-sm">Configure as credenciais do Google Drive para gerenciar imagens.</p>
              </div>
            </div>
          )}

          {users.length === 0 && (
            <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-blue-800 font-medium">Nenhum usuário cadastrado</p>
                <p className="text-blue-700 text-sm">Crie pelo menos um usuário administrador para gerenciar o sistema.</p>
              </div>
            </div>
          )}

          {configStatus.every(c => c.configured) && users.length > 0 && (
            <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="text-green-800 font-medium">Sistema configurado com sucesso!</p>
                <p className="text-green-700 text-sm">Todas as configurações estão prontas. Você pode começar a usar o sistema.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;