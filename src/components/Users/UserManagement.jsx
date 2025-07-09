import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import UserForm from './UserForm';
import UserList from './UserList';
import { useUsers } from '../../hooks/useUsers';

const { FiUsers, FiPlus, FiRefreshCw, FiDatabase, FiHardDrive, FiAlertCircle, FiCheck } = FiIcons;

const UserManagement = () => {
  const {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    migrateLocalUsers,
    getUserStats,
    isConfigured
  } = useUsers();

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [stats, setStats] = useState(null);

  // Carregar estatísticas
  useEffect(() => {
    if (isConfigured) {
      getUserStats().then(setStats);
    }
  }, [users, isConfigured]);

  const handleAddUser = async (userData) => {
    try {
      await createUser(userData);
      setShowForm(false);
      alert('Usuário criado com sucesso!');
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      alert('Erro ao criar usuário: ' + error.message);
    }
  };

  const handleEditUser = async (userData) => {
    try {
      await updateUser(editingUser.id, userData);
      setEditingUser(null);
      setShowForm(false);
      alert('Usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      alert('Erro ao atualizar usuário: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário?')) {
      try {
        await deleteUser(userId);
        alert('Usuário excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao excluir usuário: ' + error.message);
      }
    }
  };

  const openEditForm = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingUser(null);
  };

  const handleMigration = async () => {
    if (window.confirm('Deseja migrar usuários do armazenamento local para o Supabase?')) {
      setMigrationStatus({ loading: true });
      
      try {
        const result = await migrateLocalUsers();
        setMigrationStatus(result);
        
        if (result.success) {
          await loadUsers(); // Recarregar lista após migração
        }
      } catch (error) {
        setMigrationStatus({ 
          success: false, 
          message: 'Erro na migração: ' + error.message 
        });
      }
    }
  };

  if (!isConfigured) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-6"
      >
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <SafeIcon icon={FiAlertCircle} className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            Supabase Não Configurado
          </h3>
          <p className="text-yellow-700">
            Configure as credenciais do Supabase primeiro para gerenciar usuários na base de dados.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto p-6"
    >
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <SafeIcon icon={FiUsers} className="w-8 h-8 text-blue-500" />
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Gerenciamento de Usuários</h2>
                <p className="text-gray-600">Gerencie usuários sincronizados com Supabase</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                onClick={loadUsers}
                disabled={loading}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:bg-gray-400 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SafeIcon icon={loading ? FiRefreshCw : FiDatabase} className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Carregando...' : 'Recarregar'}</span>
              </motion.button>
              <motion.button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SafeIcon icon={FiPlus} className="w-5 h-5" />
                <span>Novo Usuário</span>
              </motion.button>
            </div>
          </div>

          {/* Estatísticas */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{stats.total_users}</div>
                <div className="text-sm text-blue-700">Total de Usuários</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{stats.active_users}</div>
                <div className="text-sm text-green-700">Usuários Ativos</div>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.admin_users}</div>
                <div className="text-sm text-purple-700">Administradores</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{stats.recent_logins}</div>
                <div className="text-sm text-orange-700">Logins Recentes (30d)</div>
              </div>
            </div>
          )}
        </div>

        {/* Status de Migração */}
        {migrationStatus && (
          <div className="p-4 border-b border-gray-200">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 rounded-lg flex items-center space-x-3 ${
                migrationStatus.loading
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : migrationStatus.success
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}
            >
              <SafeIcon
                icon={
                  migrationStatus.loading
                    ? FiRefreshCw
                    : migrationStatus.success
                    ? FiCheck
                    : FiAlertCircle
                }
                className={`w-6 h-6 ${migrationStatus.loading ? 'animate-spin' : ''}`}
              />
              <div>
                <p className="font-medium">
                  {migrationStatus.loading
                    ? 'Migrando usuários...'
                    : migrationStatus.success
                    ? 'Migração Concluída!'
                    : 'Erro na Migração'}
                </p>
                <p className="text-sm">{migrationStatus.message}</p>
              </div>
              {migrationStatus.success && (
                <button
                  onClick={() => setMigrationStatus(null)}
                  className="ml-auto text-green-500 hover:text-green-700"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              )}
            </motion.div>
          </div>
        )}

        {/* Botão de Migração */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Migração de Dados</h3>
              <p className="text-sm text-gray-600">
                Migre usuários do armazenamento local para o Supabase
              </p>
            </div>
            <motion.button
              onClick={handleMigration}
              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <SafeIcon icon={FiHardDrive} className="w-5 h-5" />
              <span>Migrar Usuários</span>
            </motion.button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiAlertCircle} className="w-5 h-5" />
                <span className="font-medium">Erro:</span>
                <span>{error}</span>
              </div>
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <SafeIcon icon={FiRefreshCw} className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">Carregando usuários...</h3>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <SafeIcon icon={FiUsers} className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">Nenhum usuário encontrado</h3>
              <p className="text-gray-400 mb-4">Clique em "Novo Usuário" para começar</p>
              <motion.button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Criar Primeiro Usuário
              </motion.button>
            </div>
          ) : (
            <UserList
              users={users}
              onEdit={openEditForm}
              onDelete={handleDeleteUser}
            />
          )}
        </div>
      </div>

      {showForm && (
        <UserForm
          user={editingUser}
          onSubmit={editingUser ? handleEditUser : handleAddUser}
          onCancel={closeForm}
        />
      )}
    </motion.div>
  );
};

export default UserManagement;