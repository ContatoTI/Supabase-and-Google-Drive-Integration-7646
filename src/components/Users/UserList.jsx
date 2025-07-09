import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { format } from 'date-fns';

const { FiEdit2, FiTrash2, FiUser, FiMail, FiShield, FiUserCheck, FiUserX, FiUsers, FiUserPlus, FiShoppingCart } = FiIcons;

const UserList = ({ users, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Função para obter o ícone e cor com base no perfil
  const getRoleIconAndColor = (role) => {
    switch (role) {
      case 'admin':
        return { icon: FiShield, bgColor: 'bg-purple-100', textColor: 'text-purple-800' };
      case 'gerente':
        return { icon: FiUserCheck, bgColor: 'bg-blue-100', textColor: 'text-blue-800' };
      case 'vendedor':
        return { icon: FiShoppingCart, bgColor: 'bg-green-100', textColor: 'text-green-800' };
      case 'cliente':
        return { icon: FiUser, bgColor: 'bg-orange-100', textColor: 'text-orange-800' };
      default:
        return { icon: FiUser, bgColor: 'bg-gray-100', textColor: 'text-gray-800' };
    }
  };

  // Função para obter o nome amigável do perfil
  const getRoleName = (role) => {
    const roleNames = {
      admin: 'Administrador',
      gerente: 'Gerente',
      vendedor: 'Vendedor',
      cliente: 'Cliente',
      user: 'Usuário'
    };
    return roleNames[role] || role;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Usuário</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Perfil</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Criado em</th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Ações</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const { icon: RoleIcon, bgColor, textColor } = getRoleIconAndColor(user.role);
            return (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <SafeIcon icon={FiUser} className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-800">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiMail} className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{user.email}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={RoleIcon} className={`w-4 h-4 ${textColor}`} />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
                      {getRoleName(user.role)}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <SafeIcon
                      icon={user.active ? FiUserCheck : FiUserX}
                      className={`w-4 h-4 ${user.active ? 'text-green-500' : 'text-red-500'}`}
                    />
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-4 text-gray-600 text-sm">
                  {formatDate(user.createdAt || user.created_at)}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center space-x-2">
                    <motion.button
                      onClick={() => onEdit(user)}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Editar usuário"
                    >
                      <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => onDelete(user.id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      title="Excluir usuário"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;