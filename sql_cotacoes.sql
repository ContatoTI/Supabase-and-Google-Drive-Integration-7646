-- SQL para criar tabela de cotações no Supabase
-- Execute este SQL no SQL Editor do Supabase

-- 1. Criar tabela de cotações
CREATE TABLE IF NOT EXISTS cotacoes_falcontruck (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_company TEXT,
    customer_message TEXT,
    total_items INTEGER NOT NULL DEFAULT 0,
    total_quantity INTEGER NOT NULL DEFAULT 0,
    total_value DECIMAL(12,2) DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de itens da cotação
CREATE TABLE IF NOT EXISTS cotacao_items_falcontruck (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cotacao_id UUID NOT NULL REFERENCES cotacoes_falcontruck(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL, -- ID do produto no sistema
    codigo_produto TEXT NOT NULL,
    descricao_produto TEXT NOT NULL,
    fabricante TEXT,
    preco DECIMAL(10,2),
    quantity INTEGER NOT NULL DEFAULT 1,
    subtotal DECIMAL(12,2) GENERATED ALWAYS AS (preco * quantity) STORED,
    foto TEXT, -- nome do arquivo da foto
    unidade TEXT DEFAULT 'UN',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Habilitar RLS (Row Level Security)
ALTER TABLE cotacoes_falcontruck ENABLE ROW LEVEL SECURITY;
ALTER TABLE cotacao_items_falcontruck ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de acesso
-- Política para cotações - permitir todas as operações por enquanto
DROP POLICY IF EXISTS "Allow all operations on cotacoes" ON cotacoes_falcontruck;
CREATE POLICY "Allow all operations on cotacoes" 
ON cotacoes_falcontruck 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Política para itens - permitir todas as operações por enquanto  
DROP POLICY IF EXISTS "Allow all operations on cotacao_items" ON cotacao_items_falcontruck;
CREATE POLICY "Allow all operations on cotacao_items" 
ON cotacao_items_falcontruck 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- 5. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Criar trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_cotacoes_falcontruck_updated_at ON cotacoes_falcontruck;
CREATE TRIGGER update_cotacoes_falcontruck_updated_at
    BEFORE UPDATE ON cotacoes_falcontruck
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_cotacoes_status ON cotacoes_falcontruck(status);
CREATE INDEX IF NOT EXISTS idx_cotacoes_created_at ON cotacoes_falcontruck(created_at);
CREATE INDEX IF NOT EXISTS idx_cotacao_items_cotacao_id ON cotacao_items_falcontruck(cotacao_id);
CREATE INDEX IF NOT EXISTS idx_cotacoes_customer_email ON cotacoes_falcontruck(customer_email);

-- 8. Criar função para calcular totais da cotação
CREATE OR REPLACE FUNCTION calculate_cotacao_totals(cotacao_uuid UUID)
RETURNS VOID AS $$
DECLARE
    total_items_count INTEGER;
    total_quantity_sum INTEGER;
    total_value_sum DECIMAL(12,2);
BEGIN
    SELECT 
        COUNT(*),
        COALESCE(SUM(quantity), 0),
        COALESCE(SUM(subtotal), 0)
    INTO 
        total_items_count,
        total_quantity_sum, 
        total_value_sum
    FROM cotacao_items_falcontruck 
    WHERE cotacao_id = cotacao_uuid;
    
    UPDATE cotacoes_falcontruck 
    SET 
        total_items = total_items_count,
        total_quantity = total_quantity_sum,
        total_value = total_value_sum,
        updated_at = NOW()
    WHERE id = cotacao_uuid;
END;
$$ LANGUAGE plpgsql;

-- 9. Criar trigger para recalcular totais quando itens mudarem
CREATE OR REPLACE FUNCTION trigger_calculate_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM calculate_cotacao_totals(OLD.cotacao_id);
        RETURN OLD;
    ELSE
        PERFORM calculate_cotacao_totals(NEW.cotacao_id);
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cotacao_items_totals ON cotacao_items_falcontruck;
CREATE TRIGGER trigger_cotacao_items_totals
    AFTER INSERT OR UPDATE OR DELETE ON cotacao_items_falcontruck
    FOR EACH ROW
    EXECUTE FUNCTION trigger_calculate_totals();

-- 10. Inserir dados de exemplo (opcional - remova se não quiser)
-- INSERT INTO cotacoes_falcontruck (customer_name, customer_email, customer_phone, customer_company, status) 
-- VALUES ('João Silva', 'joao@exemplo.com', '(11) 99999-9999', 'Empresa Exemplo', 'pending');

-- Comentários sobre a estrutura:
-- 
-- COTACOES_FALCONTRUCK:
-- - Armazena informações do cliente e totais da cotação
-- - Status: pending, processing, completed, cancelled
-- - Campos calculados automaticamente via triggers
-- 
-- COTACAO_ITEMS_FALCONTRUCK:  
-- - Armazena cada produto da cotação
-- - Subtotal calculado automaticamente (preco * quantity)
-- - Referência ao produto original via product_id
-- 
-- FUNCIONALIDADES:
-- - RLS habilitado para segurança
-- - Triggers automáticos para updated_at
-- - Recálculo automático de totais
-- - Índices para performance
-- - Cascade delete (deletar cotação remove itens)