-- SQL para Sistema Completo de Usuários
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar se a tabela existe e recriar com estrutura otimizada
DROP TABLE IF EXISTS system_users_admin CASCADE;

-- 2. Criar tabela de usuários com estrutura completa
CREATE TABLE system_users_admin (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Em produção, use hash bcrypt
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    active BOOLEAN DEFAULT true,
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES system_users_admin(id),
    
    -- Campos adicionais para auditoria
    profile_data JSONB DEFAULT '{}',
    permissions TEXT[] DEFAULT ARRAY['read'],
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_name CHECK (length(trim(name)) >= 2)
);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE system_users_admin ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de segurança

-- Política para leitura (todos podem ler usuários ativos)
DROP POLICY IF EXISTS "Users can read all active users" ON system_users_admin;
CREATE POLICY "Users can read all active users" 
ON system_users_admin FOR SELECT 
USING (active = true);

-- Política para inserção (apenas admins podem criar usuários)
DROP POLICY IF EXISTS "Only admins can create users" ON system_users_admin;
CREATE POLICY "Only admins can create users" 
ON system_users_admin FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM system_users_admin 
        WHERE id = auth.uid() AND role = 'admin' AND active = true
    ) OR 
    -- Permitir primeiro usuário (bootstrap)
    NOT EXISTS (SELECT 1 FROM system_users_admin)
);

-- Política para atualização (admins podem atualizar qualquer usuário, usuários podem atualizar a si mesmos)
DROP POLICY IF EXISTS "Users can update own profile or admins can update any" ON system_users_admin;
CREATE POLICY "Users can update own profile or admins can update any" 
ON system_users_admin FOR UPDATE 
USING (
    id = auth.uid() OR 
    EXISTS (
        SELECT 1 FROM system_users_admin 
        WHERE id = auth.uid() AND role = 'admin' AND active = true
    )
);

-- Política para deleção (apenas admins podem deletar)
DROP POLICY IF EXISTS "Only admins can delete users" ON system_users_admin;
CREATE POLICY "Only admins can delete users" 
ON system_users_admin FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM system_users_admin 
        WHERE id = auth.uid() AND role = 'admin' AND active = true
    )
);

-- 5. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Criar trigger para updated_at
DROP TRIGGER IF EXISTS update_system_users_admin_updated_at ON system_users_admin;
CREATE TRIGGER update_system_users_admin_updated_at
    BEFORE UPDATE ON system_users_admin
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Criar função para registrar login
CREATE OR REPLACE FUNCTION register_user_login(user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE system_users_admin 
    SET 
        last_login = NOW(),
        login_count = COALESCE(login_count, 0) + 1,
        updated_at = NOW()
    WHERE id = user_id AND active = true;
END;
$$ LANGUAGE plpgsql;

-- 8. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_system_users_email ON system_users_admin(email);
CREATE INDEX IF NOT EXISTS idx_system_users_role ON system_users_admin(role);
CREATE INDEX IF NOT EXISTS idx_system_users_active ON system_users_admin(active);
CREATE INDEX IF NOT EXISTS idx_system_users_created_at ON system_users_admin(created_at);

-- 9. Criar função para buscar usuário por email e senha
CREATE OR REPLACE FUNCTION authenticate_user(user_email TEXT, user_password TEXT)
RETURNS TABLE(
    id UUID,
    name TEXT,
    email TEXT,
    role TEXT,
    active BOOLEAN,
    last_login TIMESTAMP WITH TIME ZONE,
    login_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.name,
        u.email,
        u.role,
        u.active,
        u.last_login,
        u.login_count
    FROM system_users_admin u
    WHERE 
        u.email = user_email 
        AND u.password = user_password 
        AND u.active = true;
        
    -- Registrar login se usuário encontrado
    IF FOUND THEN
        PERFORM register_user_login((SELECT u.id FROM system_users_admin u WHERE u.email = user_email AND u.password = user_password AND u.active = true LIMIT 1));
    END IF;
END;
$$ LANGUAGE plpgsql;

-- 10. Inserir usuário administrador padrão (se não existir)
INSERT INTO system_users_admin (name, email, password, role, active)
SELECT 'Administrador', 'admin@sistema.com', 'admin123', 'admin', true
WHERE NOT EXISTS (
    SELECT 1 FROM system_users_admin WHERE email = 'admin@sistema.com'
);

-- 11. Criar função para migrar usuários do localStorage (usar no frontend)
CREATE OR REPLACE FUNCTION migrate_local_users(users_data JSONB)
RETURNS INTEGER AS $$
DECLARE
    user_record JSONB;
    inserted_count INTEGER := 0;
BEGIN
    FOR user_record IN SELECT * FROM jsonb_array_elements(users_data)
    LOOP
        INSERT INTO system_users_admin (name, email, password, role, active)
        VALUES (
            user_record->>'name',
            user_record->>'email',
            user_record->>'password',
            COALESCE(user_record->>'role', 'user'),
            COALESCE((user_record->>'active')::boolean, true)
        )
        ON CONFLICT (email) DO UPDATE SET
            name = EXCLUDED.name,
            role = EXCLUDED.role,
            active = EXCLUDED.active,
            updated_at = NOW();
            
        inserted_count := inserted_count + 1;
    END LOOP;
    
    RETURN inserted_count;
END;
$$ LANGUAGE plpgsql;

-- 12. Criar view para estatísticas de usuários
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE active = true) as active_users,
    COUNT(*) FILTER (WHERE role = 'admin') as admin_users,
    COUNT(*) FILTER (WHERE last_login > NOW() - INTERVAL '30 days') as recent_logins,
    MAX(created_at) as last_user_created
FROM system_users_admin;

-- 13. Comentários sobre a estrutura
COMMENT ON TABLE system_users_admin IS 'Tabela principal para gerenciamento de usuários do sistema';
COMMENT ON COLUMN system_users_admin.profile_data IS 'Dados adicionais do perfil em formato JSON';
COMMENT ON COLUMN system_users_admin.permissions IS 'Array de permissões específicas do usuário';
COMMENT ON COLUMN system_users_admin.login_count IS 'Contador de logins do usuário';

-- Verificar se tudo foi criado corretamente
SELECT 
    'Tabela criada com sucesso!' as status,
    COUNT(*) as total_users
FROM system_users_admin;