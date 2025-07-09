import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';

const { FiLock, FiAlertCircle } = FiIcons;

/**
 * Componente para proteger rotas com base em autenticação e permissões
 * @param {Object} props - Propriedades do componente
 * @param {React.ReactNode} props.children - Componentes filhos a serem renderizados se autorizado
 * @param {string|string[]} [props.requiredRoles] - Perfis necessários para acessar a rota
 * @param {string|string[]} [props.requiredPermissions] - Permissões necessárias para acessar a rota
 * @param {string} [props.redirectTo='/'] - Rota para redirecionar se não autorizado
 */
const ProtectedRoute = ({
  children,
  requiredRoles,
  requiredPermissions,
  redirectTo = '/'
}) => {
  const { user, initialized, isAuthenticated, hasPermission, hasRole } = useAuth();

  // Se ainda está inicializando, mostrar loading
  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Se não estiver autenticado, redirecionar
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Verificar permissões (se especificadas)
  if (requiredPermissions) {
    const permissionArray = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];
    
    const hasAllPermissions = permissionArray.every(permission => 
      hasPermission(permission)
    );
    
    if (!hasAllPermissions) {
      return <AccessDenied reason="Você não tem permissão para acessar esta área." />;
    }
  }

  // Verificar perfis (se especificados)
  if (requiredRoles) {
    if (!hasRole(requiredRoles)) {
      return <AccessDenied 
        reason={`Esta área é restrita para ${Array.isArray(requiredRoles) ? requiredRoles.join(', ') : requiredRoles}.`}
      />;
    }
  }

  // Se passou por todas as verificações, renderizar conteúdo protegido
  return children;
};

const AccessDenied = ({ reason }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="max-w-lg mx-auto p-6 mt-10"
  >
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
      <div className="flex items-center justify-center mb-4">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <SafeIcon icon={FiLock} className="w-8 h-8 text-red-600" />
        </div>
      </div>
      <h2 className="text-xl font-semibold text-red-800 mb-3">Acesso Negado</h2>
      <div className="bg-white p-4 rounded-lg border border-red-100 mb-4">
        <div className="flex items-start space-x-3">
          <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-500 mt-0.5" />
          <p className="text-red-600">{reason}</p>
        </div>
      </div>
      <p className="text-gray-600 mb-4">
        Você não tem permissão para acessar esta área. Entre em contato com um administrador se você acredita que isto é um erro.
      </p>
      <a href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
        Voltar para Home
      </a>
    </div>
  </motion.div>
);

export default ProtectedRoute;