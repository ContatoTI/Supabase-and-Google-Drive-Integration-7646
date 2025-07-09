import { useState, useEffect } from 'react';
import { getSupabaseClient } from '../config/database';

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [supabase, setSupabase] = useState(null);

  // Inicializar Supabase
  useEffect(() => {
    try {
      const client = getSupabaseClient();
      setSupabase(client);
      setError(null);
    } catch (err) {
      console.error('Erro ao inicializar Supabase:', err);
      setError('Supabase não configurado. Configure as credenciais primeiro.');
    }
  }, []);

  // Migrar usuários do localStorage para Supabase
  const migrateLocalUsers = async () => {
    if (!supabase) return { success: false, message: 'Supabase não configurado' };

    try {
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      
      if (localUsers.length === 0) {
        return { success: true, message: 'Nenhum usuário local para migrar' };
      }

      console.log('Migrando usuários do localStorage:', localUsers);

      // Usar a função SQL para migrar
      const { data, error } = await supabase.rpc('migrate_local_users', {
        users_data: localUsers
      });

      if (error) throw error;

      console.log('Usuários migrados com sucesso:', data);
      
      // Limpar localStorage após migração bem-sucedida
      localStorage.removeItem('users');
      
      return { 
        success: true, 
        message: `${data} usuário(s) migrado(s) com sucesso!` 
      };

    } catch (err) {
      console.error('Erro na migração:', err);
      return { 
        success: false, 
        message: `Erro na migração: ${err.message}` 
      };
    }
  };

  // Carregar usuários do Supabase
  const loadUsers = async () => {
    if (!supabase) {
      setError('Supabase não configurado');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('system_users_admin')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('Usuários carregados do Supabase:', data);
      setUsers(data || []);

    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
      setError(`Erro ao carregar usuários: ${err.message}`);
      
      // Fallback para localStorage se Supabase falhar
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      setUsers(localUsers);
      
    } finally {
      setLoading(false);
    }
  };

  // Autenticar usuário
  const authenticateUser = async (email, password) => {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }

    try {
      console.log('Autenticando usuário:', email);

      const { data, error } = await supabase.rpc('authenticate_user', {
        user_email: email,
        user_password: password
      });

      if (error) throw error;

      if (data && data.length > 0) {
        const user = data[0];
        console.log('Usuário autenticado:', user);
        
        // Salvar usuário logado
        localStorage.setItem('currentUser', JSON.stringify(user));
        
        return { success: true, user };
      } else {
        return { success: false, message: 'Credenciais inválidas' };
      }

    } catch (err) {
      console.error('Erro na autenticação:', err);
      
      // Fallback para localStorage
      const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const user = localUsers.find(u => 
        u.email === email && 
        u.password === password && 
        u.active
      );

      if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user));
        return { success: true, user };
      }

      return { success: false, message: 'Credenciais inválidas' };
    }
  };

  // Criar usuário
  const createUser = async (userData) => {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }

    try {
      const { data, error } = await supabase
        .from('system_users_admin')
        .insert([{
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role || 'user',
          active: userData.active !== undefined ? userData.active : true
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('Usuário criado:', data);
      await loadUsers(); // Recarregar lista
      
      return { success: true, user: data };

    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      throw new Error(`Erro ao criar usuário: ${err.message}`);
    }
  };

  // Atualizar usuário
  const updateUser = async (userId, userData) => {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }

    try {
      const updateData = {
        name: userData.name,
        email: userData.email,
        role: userData.role,
        active: userData.active,
        updated_at: new Date().toISOString()
      };

      // Apenas incluir senha se foi fornecida
      if (userData.password) {
        updateData.password = userData.password;
      }

      const { data, error } = await supabase
        .from('system_users_admin')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;

      console.log('Usuário atualizado:', data);
      await loadUsers(); // Recarregar lista
      
      return { success: true, user: data };

    } catch (err) {
      console.error('Erro ao atualizar usuário:', err);
      throw new Error(`Erro ao atualizar usuário: ${err.message}`);
    }
  };

  // Deletar usuário
  const deleteUser = async (userId) => {
    if (!supabase) {
      throw new Error('Supabase não configurado');
    }

    try {
      const { error } = await supabase
        .from('system_users_admin')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      console.log('Usuário deletado:', userId);
      await loadUsers(); // Recarregar lista
      
      return { success: true };

    } catch (err) {
      console.error('Erro ao deletar usuário:', err);
      throw new Error(`Erro ao deletar usuário: ${err.message}`);
    }
  };

  // Obter estatísticas
  const getUserStats = async () => {
    if (!supabase) {
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .single();

      if (error) throw error;

      return data;

    } catch (err) {
      console.error('Erro ao obter estatísticas:', err);
      return null;
    }
  };

  // Auto-carregar usuários quando Supabase estiver pronto
  useEffect(() => {
    if (supabase) {
      const initializeUsers = async () => {
        // Primeiro tentar migrar usuários locais
        await migrateLocalUsers();
        // Depois carregar usuários do Supabase
        await loadUsers();
      };

      initializeUsers();
    }
  }, [supabase]);

  return {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    authenticateUser,
    migrateLocalUsers,
    getUserStats,
    isConfigured: !!supabase
  };
};