-- SQL para Sistema de Categorias de Usuários: Admin, Gerente, Vendedor e Cliente
-- Execute este SQL no Supabase SQL Editor

-- 1. Modificar a tabela de usuários para suportar as 4 categorias
ALTER TABLE system_users_admin
DROP CONSTRAINT IF EXISTS system_users_admin_role_check;

-- 2. Adicionar as 4 categorias: admin, gerente, vendedor, cliente
ALTER TABLE system_users_admin
ADD CONSTRAINT system_users_admin_role_check
CHECK (role IN ('admin', 'gerente', 'vendedor', 'cliente'));

-- 3. Garantir que o campo permissions existe
ALTER TABLE system_users_admin
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"catalog": true}';

-- 4. Criar função para definir permissões baseado na categoria
CREATE OR REPLACE FUNCTION set_user_permissions()
RETURNS TRIGGER AS $$
BEGIN
    -- Define permissões baseado na categoria do usuário
    CASE NEW.role
        WHEN 'admin' THEN
            NEW.permissions := '{
                "admin": true,
                "catalog": true, 
                "sales": true,
                "users": true, 
                "settings": true,
                "dashboard": true
            }';
        WHEN 'gerente' THEN
            NEW.permissions := '{
                "admin": false,
                "catalog": true, 
                "sales": true,
                "users": false, 
                "settings": false,
                "dashboard": false
            }';
        WHEN 'vendedor' THEN
            NEW.permissions := '{
                "admin": false,
                "catalog": true, 
                "sales": true,
                "users": false, 
                "settings": false,
                "dashboard": false
            }';
        WHEN 'cliente' THEN
            NEW.permissions := '{
                "admin": false,
                "catalog": true, 
                "sales": false,
                "users": false, 
                "settings": false,
                "dashboard": false
            }';
        ELSE
            NEW.permissions := '{
                "catalog": true
            }';
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar trigger para aplicar permissões automaticamente
DROP TRIGGER IF EXISTS set_user_permissions_trigger ON system_users_admin;
CREATE TRIGGER set_user_permissions_trigger
    BEFORE INSERT OR UPDATE OF role ON system_users_admin
    FOR EACH ROW
    EXECUTE FUNCTION set_user_permissions();

-- 6. Atualizar usuários existentes para aplicar novas permissões
UPDATE system_users_admin SET permissions = NULL WHERE TRUE;

-- 7. Criar usuários exemplo para cada categoria (se não existirem)
-- Admin
INSERT INTO system_users_admin (name, email, password, role, active)
SELECT 'Administrador', 'admin@sistema.com', 'admin123', 'admin', true
WHERE NOT EXISTS (
    SELECT 1 FROM system_users_admin WHERE email = 'admin@sistema.com'
);

-- Gerente
INSERT INTO system_users_admin (name, email, password, role, active)
SELECT 'João Silva - Gerente', 'gerente@sistema.com', 'gerente123', 'gerente', true
WHERE NOT EXISTS (
    SELECT 1 FROM system_users_admin WHERE email = 'gerente@sistema.com'
);

-- Vendedor
INSERT INTO system_users_admin (name, email, password, role, active)
SELECT 'Maria Santos - Vendedora', 'vendedor@sistema.com', 'vendedor123', 'vendedor', true
WHERE NOT EXISTS (
    SELECT 1 FROM system_users_admin WHERE email = 'vendedor@sistema.com'
);

-- Cliente
INSERT INTO system_users_admin (name, email, password, role, active)
SELECT 'Pedro Costa - Cliente', 'cliente@sistema.com', 'cliente123', 'cliente', true
WHERE NOT EXISTS (
    SELECT 1 FROM system_users_admin WHERE email = 'cliente@sistema.com'
);

-- 8. Atualizar a view de estatísticas
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE active = true) as active_users,
    COUNT(*) FILTER (WHERE role = 'admin') as admin_users,
    COUNT(*) FILTER (WHERE role = 'gerente') as gerente_users,
    COUNT(*) FILTER (WHERE role = 'vendedor') as vendedor_users,
    COUNT(*) FILTER (WHERE role = 'cliente') as cliente_users,
    COUNT(*) FILTER (WHERE last_login > NOW() - INTERVAL '30 days') as recent_logins,
    MAX(created_at) as last_user_created
FROM system_users_admin;

-- Verificar se tudo foi criado corretamente
SELECT 
    'Sistema de categorias configurado!' as status,
    COUNT(*) FILTER (WHERE role = 'admin') as admins,
    COUNT(*) FILTER (WHERE role = 'gerente') as gerentes,
    COUNT(*) FILTER (WHERE role = 'vendedor') as vendedores,
    COUNT(*) FILTER (WHERE role = 'cliente') as clientes
FROM system_users_admin;