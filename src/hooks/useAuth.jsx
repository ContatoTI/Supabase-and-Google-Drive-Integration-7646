import { useState, useEffect, createContext, useContext } from 'react';
import { useUsers } from './useUsers';

// Contexto de autenticação
const AuthContext = createContext(null);

// Hook para fornecer autenticação
export const AuthProvider = ({ children }) => {
  const { authenticateUser, isConfigured } = useUsers();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Carregar usuário do localStorage quando o componente é montado
  useEffect(() => {
    const loadUser = () => {
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Erro ao carregar usuário:', error);
          localStorage.removeItem('currentUser');
        }
      }
      setLoading(false);
      setInitialized(true);
    };

    loadUser();
  }, []);

  // Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const result = await authenticateUser(email, password);
      if (result.success) {
        setUser(result.user);
        localStorage.setItem('currentUser', JSON.stringify(result.user));
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
  };

  // Verificar permissão específica
  const hasPermission = (permission) => {
    if (!user) return false;
    
    // Para admin, retornar true para qualquer permissão
    if (user.role === 'admin') return true;
    
    // Verificar permissão específica nas permissões do usuário
    if (user.permissions && user.permissions[permission] === true) {
      return true;
    }
    
    return false;
  };

  // Verificar se o usuário tem um dos perfis especificados
  const hasRole = (roles) => {
    if (!user) return false;
    
    // Se roles for uma string, converter para array
    const roleArray = typeof roles === 'string' ? [roles] : roles;
    
    return roleArray.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      initialized,
      login, 
      logout, 
      isAuthenticated: !!user,
      hasPermission,
      hasRole,
      isConfigured
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};

export default useAuth;