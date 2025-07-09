import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useUsers } from '../../hooks/useUsers';

const { FiUser, FiLock, FiEye, FiEyeOff, FiLogIn, FiUserPlus, FiRefreshCw } = FiIcons;

export const Login = ({ onLogin }) => {
  const { authenticateUser, createUser, isConfigured } = useUsers();
  
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFirstAccess, setShowFirstAccess] = useState(false);

  // Verificar usuários locais como fallback
  const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
  const hasLocalUsers = localUsers.length > 0;

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      setError('Email e senha são obrigatórios');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authenticateUser(credentials.email, credentials.password);
      
      if (result.success) {
        onLogin(result.user);
      } else {
        setError(result.message || 'Credenciais inválidas');
      }
    } catch (err) {
      console.error('Erro no login:', err);
      setError('Erro ao fazer login: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFirstAccess = async () => {
    setLoading(true);
    setError('');

    try {
      // Criar usuário administrador padrão
      const defaultAdmin = {
        name: 'Administrador',
        email: 'admin@sistema.com',
        password: 'admin123',
        role: 'admin',
        active: true
      };

      if (isConfigured) {
        // Criar no Supabase
        const result = await createUser(defaultAdmin);
        if (result.success) {
          onLogin(result.user);
        } else {
          throw new Error('Erro ao criar usuário administrador');
        }
      } else {
        // Fallback para localStorage
        const newUsers = [{ ...defaultAdmin, id: Date.now(), createdAt: new Date().toISOString() }];
        localStorage.setItem('users', JSON.stringify(newUsers));
        localStorage.setItem('currentUser', JSON.stringify(newUsers[0]));
        onLogin(newUsers[0]);
      }
    } catch (err) {
      console.error('Erro no primeiro acesso:', err);
      setError('Erro ao criar administrador: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Se não há usuários e não está mostrando primeiro acesso
  if (!hasLocalUsers && !showFirstAccess && isConfigured) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8"
        >
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <SafeIcon icon={FiUserPlus} className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-2xl font-bold text-gray-800">Primeiro Acesso</h1>
            <p className="text-gray-600">Configure o sistema pela primeira vez</p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-800 mb-2">Bem-vindo!</h3>
              <p className="text-sm text-blue-700 mb-4">
                Este é o primeiro acesso ao sistema. Clique no botão abaixo para criar 
                automaticamente um usuário administrador padrão.
              </p>
              <div className="bg-white p-3 rounded border">
                <p className="text-sm"><strong>Email:</strong> admin@sistema.com</p>
                <p className="text-sm"><strong>Senha:</strong> admin123</p>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              onClick={handleFirstAccess}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center space-x-2"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              <SafeIcon icon={loading ? FiRefreshCw : FiUserPlus} className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Criando...' : 'Criar Administrador e Entrar'}</span>
            </motion.button>

            <div className="text-center">
              <button
                onClick={() => setShowFirstAccess(true)}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Já tenho usuários cadastrados? Fazer login
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-2xl w-full max-w-md p-8"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <SafeIcon icon={FiUser} className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-800">Sistema Admin</h1>
          <p className="text-gray-600">
            Faça login para acessar o painel
            {!isConfigured && ' (modo local)'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <div className="relative">
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="seu@email.com"
              />
              <SafeIcon icon={FiUser} className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                placeholder="Sua senha"
              />
              <SafeIcon icon={FiLock} className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="w-5 h-5" />
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
            >
              {error}
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center space-x-2"
            whileHover={{ scale: loading ? 1 : 1.02 }}
            whileTap={{ scale: loading ? 1 : 0.98 }}
          >
            <SafeIcon icon={loading ? FiRefreshCw : FiLogIn} className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Entrando...' : 'Entrar'}</span>
          </motion.button>
        </form>

        {!hasLocalUsers && !isConfigured && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowFirstAccess(false)}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              ← Voltar ao primeiro acesso
            </button>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-2">Credenciais padrão:</h3>
          <p className="text-sm text-gray-600">
            <strong>Email:</strong> admin@sistema.com<br/>
            <strong>Senha:</strong> admin123
          </p>
          {!isConfigured && (
            <p className="text-xs text-orange-600 mt-2">
              ⚠️ Modo local ativo - Configure Supabase para sincronização
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
};