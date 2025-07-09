-- SQL para atualizar o sistema de perfis de usuários para 4 categorias: Admin, Gerente, Vendedor e Cliente
-- Execute este SQL no Supabase SQL Editor

-- 1. Modificar a constraint para aceitar os 4 perfis
ALTER TABLE system_users_admin 
DROP CONSTRAINT IF EXISTS system_users_admin_role_check;

ALTER TABLE system_users_admin 
ADD CONSTRAINT system_users_admin_role_check 
CHECK (role IN ('admin', 'gerente', 'vendedor', 'cliente', 'user'));

-- 2. Garantir que a coluna permissions existe
ALTER TABLE system_users_admin
ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '{"catalog": true}';

-- 3. Criar função para definir permissões padrão baseado no perfil
CREATE OR REPLACE FUNCTION set_default_permissions()
RETURNS TRIGGER AS $$
BEGIN
  -- Define permissões padrão baseado no perfil
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

-- 4. Criar trigger para definir permissões automáticas
DROP TRIGGER IF EXISTS set_user_permissions ON system_users_admin;
CREATE TRIGGER set_user_permissions 
BEFORE INSERT OR UPDATE OF role ON system_users_admin
FOR EACH ROW 
WHEN (NEW.permissions IS NULL OR OLD.role IS DISTINCT FROM NEW.role)
EXECUTE FUNCTION set_default_permissions();

-- 5. Atualizar usuários existentes para aplicar novas permissões
UPDATE system_users_admin SET permissions = NULL WHERE TRUE;

-- 6. Criar usuários exemplo para cada perfil (se não existirem)
-- Admin (já deve existir)
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

-- 7. Atualizar a view de estatísticas para incluir contagem por perfil
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
  'Configuração de perfis concluída!' as status,
  COUNT(*) FILTER (WHERE role = 'admin') as admin_count,
  COUNT(*) FILTER (WHERE role = 'gerente') as gerente_count,
  COUNT(*) FILTER (WHERE role = 'vendedor') as vendedor_count,
  COUNT(*) FILTER (WHERE role = 'cliente') as cliente_count,
  (SELECT permissions FROM system_users_admin WHERE role = 'admin' LIMIT 1) as admin_permissions
FROM system_users_admin;