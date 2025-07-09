import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiUser, FiLock, FiEye, FiEyeOff, FiLogIn, FiUserPlus } = FiIcons;

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [showFirstAccess, setShowFirstAccess] = useState(false);

  // Verificar se há usuários cadastrados
  const users = JSON.parse(localStorage.getItem('users') || '[]');
  const hasUsers = users.length > 0;

  const handleInputChange = (field, value) => {
    setCredentials(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!credentials.email || !credentials.password) {
      setError('Email e senha são obrigatórios');
      return;
    }

    // Verificar usuários cadastrados
    const user = users.find(u => 
      u.email === credentials.email && 
      u.password === credentials.password && 
      u.active
    );

    if (user) {
      onLogin(user);
    } else {
      setError('Credenciais inválidas ou usuário inativo');
    }
  };

  const handleFirstAccess = () => {
    // Criar usuário administrador padrão
    const defaultAdmin = {
      id: Date.now(),
      name: 'Administrador',
      email: 'admin@sistema.com',
      password: 'admin123',
      role: 'admin',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newUsers = [defaultAdmin];
    localStorage.setItem('users', JSON.stringify(newUsers));
    
    // Fazer login automaticamente
    onLogin(defaultAdmin);
  };

  if (!hasUsers && !showFirstAccess) {
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

            <motion.button
              onClick={handleFirstAccess}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SafeIcon icon={FiUserPlus} className="w-5 h-5" />
              <span>Criar Administrador e Entrar</span>
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
          <p className="text-gray-600">Faça login para acessar o painel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="seu@email.com"
              />
              <SafeIcon icon={FiUser} className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Sua senha"
              />
              <SafeIcon icon={FiLock} className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
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
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <SafeIcon icon={FiLogIn} className="w-5 h-5" />
            <span>Entrar</span>
          </motion.button>
        </form>

        {!hasUsers && (
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
        </div>
      </motion.div>
    </div>
  );
};

export default Login;