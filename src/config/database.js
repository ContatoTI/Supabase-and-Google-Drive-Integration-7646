import { createClient } from '@supabase/supabase-js';

let supabaseClient = null;

export const initializeSupabase = (config) => {
  if (!config || !config.url || !config.anonKey) {
    throw new Error('Configuração inválida: URL e ANON_KEY são obrigatórios');
  }

  const { url, anonKey } = config;

  try {
    supabaseClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    
    console.log('Supabase inicializado com sucesso');
    return supabaseClient;
  } catch (error) {
    console.error('Erro ao inicializar Supabase:', error);
    throw error;
  }
};

export const getSupabaseClient = () => {
  if (!supabaseClient) {
    // Tentar inicializar automaticamente se houver configuração
    try {
      const { getSupabaseConfig } = require('./storage');
      const config = getSupabaseConfig();
      if (config && config.url && config.anonKey) {
        return initializeSupabase(config);
      }
    } catch (error) {
      console.warn('Não foi possível inicializar Supabase automaticamente');
    }
    throw new Error('Supabase não foi inicializado. Configure primeiro as credenciais.');
  }
  return supabaseClient;
};

export const testConnection = async () => {
  try {
    if (!supabaseClient) {
      throw new Error('Cliente Supabase não inicializado');
    }

    console.log('Testando conexão com Supabase...');

    // Tentar primeiro com uma tabela conhecida
    const { data, error } = await supabaseClient
      .from('products_admin_2024')
      .select('id')
      .limit(1);

    if (error) {
      // Se a tabela não existir, tentar com information_schema
      if (error.code === 'PGRST116') {
        console.log('Tabela products_admin_2024 não encontrada, testando com information_schema...');
        
        const { data: schemaData, error: schemaError } = await supabaseClient
          .from('information_schema.tables')
          .select('table_name')
          .eq('table_schema', 'public')
          .limit(1);

        if (schemaError) {
          throw new Error(`Erro na conexão: ${schemaError.message}`);
        }

        return {
          success: true,
          message: 'Conexão estabelecida com sucesso! Nenhuma tabela do projeto encontrada. Configure as tabelas primeiro.',
          data: schemaData
        };
      }
      throw error;
    }

    return {
      success: true,
      message: `Conexão estabelecida com sucesso! Encontrados ${data?.length || 0} registros na tabela products_admin_2024.`,
      data: data
    };
  } catch (error) {
    console.error('Erro no teste de conexão:', error);
    
    let errorMessage = error.message;
    if (error.code === 'PGRST116') {
      errorMessage = 'Conexão OK, mas tabelas do projeto não encontradas. Configure as tabelas primeiro.';
    } else if (error.code === 'PGRST301') {
      errorMessage = 'Erro de autenticação. Verifique suas credenciais.';
    } else if (error.code === 'PGRST000') {
      errorMessage = 'Erro de conexão. Verifique a URL do projeto.';
    }

    return {
      success: false,
      message: errorMessage,
      code: error.code,
      details: error.details
    };
  }
};

// Função para listar todas as tabelas do banco
export const listAllTables = async () => {
  try {
    if (!supabaseClient) {
      throw new Error('Cliente Supabase não inicializado');
    }

    const { data, error } = await supabaseClient
      .from('information_schema.tables')
      .select('table_name, table_type')
      .eq('table_schema', 'public')
      .order('table_name');

    if (error) {
      throw error;
    }

    return {
      success: true,
      tables: data || [],
      message: `Encontradas ${data?.length || 0} tabelas`
    };
  } catch (error) {
    console.error('Erro ao listar tabelas:', error);
    return {
      success: false,
      message: `Erro ao listar tabelas: ${error.message}`,
      tables: []
    };
  }
};

// Função para obter políticas RLS de uma tabela
export const getTablePolicies = async (tableName) => {
  try {
    if (!supabaseClient) {
      throw new Error('Cliente Supabase não inicializado');
    }

    const { data, error } = await supabaseClient
      .from('pg_policies')
      .select('policyname, cmd, qual, with_check, roles')
      .eq('tablename', tableName)
      .order('policyname');

    if (error) {
      throw error;
    }

    return {
      success: true,
      policies: data || [],
      message: `Encontradas ${data?.length || 0} políticas RLS`
    };
  } catch (error) {
    console.error('Erro ao obter políticas RLS:', error);
    return {
      success: false,
      message: `Erro ao obter políticas: ${error.message}`,
      policies: []
    };
  }
};

// Função para verificar se RLS está habilitado em uma tabela
export const checkRLSStatus = async (tableName) => {
  try {
    if (!supabaseClient) {
      throw new Error('Cliente Supabase não inicializado');
    }

    const { data, error } = await supabaseClient
      .from('pg_class')
      .select('relname, relrowsecurity')
      .eq('relname', tableName)
      .single();

    if (error) {
      throw error;
    }

    return {
      success: true,
      rlsEnabled: data?.relrowsecurity || false,
      tableName: data?.relname
    };
  } catch (error) {
    console.error('Erro ao verificar RLS:', error);
    return {
      success: false,
      rlsEnabled: false,
      message: `Erro ao verificar RLS: ${error.message}`
    };
  }
};

// Função para obter informações detalhadas de uma tabela
export const getTableInfo = async (tableName) => {
  try {
    if (!supabaseClient) {
      throw new Error('Cliente Supabase não inicializado');
    }

    // Obter colunas da tabela
    const { data: columns, error: columnsError } = await supabaseClient
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', tableName)
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (columnsError) {
      throw columnsError;
    }

    // Obter status RLS
    const rlsStatus = await checkRLSStatus(tableName);

    // Obter políticas
    const policies = await getTablePolicies(tableName);

    // Contar registros
    const { count, error: countError } = await supabaseClient
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    return {
      success: true,
      tableName,
      columns: columns || [],
      rlsEnabled: rlsStatus.rlsEnabled,
      policies: policies.policies || [],
      recordCount: countError ? 'N/A' : count,
      message: 'Informações da tabela obtidas com sucesso'
    };
  } catch (error) {
    console.error('Erro ao obter informações da tabela:', error);
    return {
      success: false,
      message: `Erro ao obter informações: ${error.message}`,
      tableName,
      columns: [],
      policies: [],
      rlsEnabled: false,
      recordCount: 'N/A'
    };
  }
};

// Função para testar conexão com uma tabela específica
export const testTableConnection = async (tableName = 'products_admin_2024') => {
  try {
    if (!supabaseClient) {
      throw new Error('Cliente Supabase não inicializado');
    }

    console.log(`Testando conexão com tabela: ${tableName}`);

    const { data, error } = await supabaseClient
      .from(tableName)
      .select('id')
      .limit(1);

    if (error) {
      if (error.code === 'PGRST116') {
        return {
          success: false,
          message: `Tabela '${tableName}' não encontrada.`,
          tableExists: false
        };
      }
      throw error;
    }

    return {
      success: true,
      message: `Conexão com tabela '${tableName}' estabelecida com sucesso!`,
      tableExists: true,
      recordCount: data?.length || 0
    };
  } catch (error) {
    console.error('Erro no teste de tabela:', error);
    return {
      success: false,
      message: `Erro ao testar tabela: ${error.message}`,
      tableExists: false
    };
  }
};

// Função para criar as tabelas necessárias
export const createRequiredTables = async () => {
  try {
    if (!supabaseClient) {
      throw new Error('Cliente Supabase não inicializado');
    }

    console.log('Criando tabelas necessárias...');

    // SQL para criar as tabelas necessárias
    const createTablesSQL = `
      -- Criar tabela de usuários do sistema
      CREATE TABLE IF NOT EXISTS system_users_admin (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Habilitar RLS
      ALTER TABLE system_users_admin ENABLE ROW LEVEL SECURITY;

      -- Política para permitir todas as operações
      DROP POLICY IF EXISTS "Allow all operations" ON system_users_admin;
      CREATE POLICY "Allow all operations" ON system_users_admin 
        FOR ALL USING (true) WITH CHECK (true);

      -- Criar tabela de produtos
      CREATE TABLE IF NOT EXISTS products_admin_2024 (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        price NUMERIC(10,2) CHECK (price >= 0),
        image_url TEXT,
        category TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

      -- Habilitar RLS para produtos
      ALTER TABLE products_admin_2024 ENABLE ROW LEVEL SECURITY;

      -- Políticas para produtos
      DROP POLICY IF EXISTS "Public read access" ON products_admin_2024;
      CREATE POLICY "Public read access" ON products_admin_2024 
        FOR SELECT USING (true);

      DROP POLICY IF EXISTS "Admin full access" ON products_admin_2024;
      CREATE POLICY "Admin full access" ON products_admin_2024 
        FOR ALL USING (true) WITH CHECK (true);

      -- Criar função para atualizar updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Criar triggers
      DROP TRIGGER IF EXISTS update_system_users_admin_updated_at ON system_users_admin;
      CREATE TRIGGER update_system_users_admin_updated_at
        BEFORE UPDATE ON system_users_admin
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_products_admin_2024_updated_at ON products_admin_2024;
      CREATE TRIGGER update_products_admin_2024_updated_at
        BEFORE UPDATE ON products_admin_2024
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `;

    // Tentar executar o SQL
    try {
      const { data, error } = await supabaseClient.rpc('exec_sql', { sql: createTablesSQL });
      
      if (error) {
        console.error('Erro ao executar SQL:', error);
        throw error;
      }

      console.log('Tabelas criadas com sucesso!');

      // Verificar se as tabelas foram criadas
      const tablesCreated = await testTableConnection('system_users_admin');
      const productsCreated = await testTableConnection('products_admin_2024');

      return {
        success: true,
        message: `Tabelas criadas com sucesso! Usuários: ${tablesCreated.tableExists ? 'OK' : 'Erro'}, Produtos: ${productsCreated.tableExists ? 'OK' : 'Erro'}`,
        details: {
          usersTable: tablesCreated.tableExists,
          productsTable: productsCreated.tableExists
        }
      };
    } catch (sqlError) {
      console.error('Erro na execução do SQL:', sqlError);
      
      if (sqlError.code === 'PGRST202') {
        return {
          success: false,
          message: 'Função exec_sql não disponível. Por favor, execute o SQL manualmente no Supabase.',
          sqlToExecute: createTablesSQL
        };
      }
      throw sqlError;
    }
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
    return {
      success: false,
      message: `Erro ao criar tabelas: ${error.message}`,
      sqlToExecute: `-- Execute este SQL manualmente no Supabase SQL Editor:

CREATE TABLE IF NOT EXISTS system_users_admin (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE system_users_admin ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON system_users_admin FOR ALL USING (true) WITH CHECK (true);

CREATE TABLE IF NOT EXISTS products_admin_2024 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) CHECK (price >= 0),
  image_url TEXT,
  category TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE products_admin_2024 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON products_admin_2024 FOR SELECT USING (true);
CREATE POLICY "Admin full access" ON products_admin_2024 FOR ALL USING (true) WITH CHECK (true);`
    };
  }
};

// Função para sincronizar usuários do localStorage com Supabase
export const syncUsers = async () => {
  try {
    if (!supabaseClient) {
      throw new Error('Cliente Supabase não inicializado');
    }

    const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    if (localUsers.length === 0) {
      return {
        success: true,
        message: 'Nenhum usuário local para sincronizar'
      };
    }

    // Verificar se a tabela existe
    const tableTest = await testTableConnection('system_users_admin');
    if (!tableTest.tableExists) {
      return {
        success: false,
        message: 'Tabela system_users_admin não existe. Crie as tabelas primeiro.'
      };
    }

    // Verificar se usuários já existem
    const { data: existingUsers, error: fetchError } = await supabaseClient
      .from('system_users_admin')
      .select('email');

    if (fetchError) {
      throw fetchError;
    }

    const existingEmails = existingUsers ? existingUsers.map(u => u.email) : [];
    const usersToInsert = localUsers.filter(user => !existingEmails.includes(user.email));

    if (usersToInsert.length > 0) {
      const { error: insertError } = await supabaseClient
        .from('system_users_admin')
        .insert(usersToInsert.map(user => ({
          name: user.name,
          email: user.email,
          password: user.password,
          role: user.role,
          active: user.active
        })));

      if (insertError) {
        throw insertError;
      }
    }

    return {
      success: true,
      message: `${usersToInsert.length} usuários sincronizados com sucesso!`
    };
  } catch (error) {
    console.error('Erro ao sincronizar usuários:', error);
    return {
      success: false,
      message: `Erro na sincronização: ${error.message}`
    };
  }
};