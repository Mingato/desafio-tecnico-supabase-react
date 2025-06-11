-- Script de configuração do banco de dados para o projeto Desafio Técnico
-- Sistema de Cadastro de Fornecedores
-- Execute este script no SQL Editor do Supabase

-- Criar a tabela de fornecedores
CREATE TABLE fornecedores (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  logo TEXT, -- URL da logo do fornecedor
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar a tabela de CNPJs dos fornecedores
CREATE TABLE cnpjs_fornecedores (
  id BIGSERIAL PRIMARY KEY,
  fornecedor_id BIGINT NOT NULL REFERENCES fornecedores(id) ON DELETE CASCADE,
  cnpj VARCHAR(18) NOT NULL UNIQUE, -- Formato: 00.000.000/0000-00
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT valid_cnpj CHECK (cnpj ~ '^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$')
);

-- Criar a tabela de segmentos de varejos
CREATE TABLE segmentos_varejos (
  id BIGSERIAL PRIMARY KEY,
  nome VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar a tabela de segmentos dos fornecedores (relacionamento N:N)
CREATE TABLE segmentos_fornecedores (
  id BIGSERIAL PRIMARY KEY,
  fornecedor_id BIGINT NOT NULL REFERENCES fornecedores(id) ON DELETE CASCADE,
  segmento_id BIGINT NOT NULL REFERENCES segmentos_varejos(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(fornecedor_id, segmento_id) -- Evita duplicatas
);

-- Criar índices para melhor performance
CREATE INDEX idx_cnpjs_fornecedor ON cnpjs_fornecedores(fornecedor_id);
CREATE INDEX idx_segmentos_fornecedor ON segmentos_fornecedores(fornecedor_id);
CREATE INDEX idx_segmentos_segmento ON segmentos_fornecedores(segmento_id);

-- Índices otimizados para buscas com filtros
-- Para busca parcial por nome de fornecedor (ILIKE)
CREATE INDEX idx_fornecedores_nome_text_pattern ON fornecedores(nome text_pattern_ops);
CREATE INDEX idx_fornecedores_nome_lower ON fornecedores(LOWER(nome) text_pattern_ops);

-- Para busca parcial por CNPJ (ILIKE)
CREATE INDEX idx_cnpjs_cnpj_text_pattern ON cnpjs_fornecedores(cnpj text_pattern_ops);
CREATE INDEX idx_cnpjs_cnpj_lower ON cnpjs_fornecedores(LOWER(cnpj) text_pattern_ops);

-- Para busca parcial por nome de segmento (ILIKE)
CREATE INDEX idx_segmentos_nome_text_pattern ON segmentos_varejos(nome text_pattern_ops);
CREATE INDEX idx_segmentos_nome_lower ON segmentos_varejos(LOWER(nome) text_pattern_ops);

-- Índices compostos para otimizar a view vw_fornecedores_completo
CREATE INDEX idx_cnpjs_fornecedor_cnpj ON cnpjs_fornecedores(fornecedor_id, cnpj);
CREATE INDEX idx_segmentos_fornecedor_segmento ON segmentos_fornecedores(fornecedor_id, segmento_id);

-- Índice para ordenação padrão por nome
CREATE INDEX idx_fornecedores_nome ON fornecedores(nome);
CREATE INDEX idx_segmentos_nome ON segmentos_varejos(nome);

-- Índices para datas (útil para ordenação por data de criação)
CREATE INDEX idx_fornecedores_created_at ON fornecedores(created_at);
CREATE INDEX idx_segmentos_created_at ON segmentos_varejos(created_at);

-- Habilitar RLS (Row Level Security) para todas as tabelas
ALTER TABLE fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE cnpjs_fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE segmentos_varejos ENABLE ROW LEVEL SECURITY;
ALTER TABLE segmentos_fornecedores ENABLE ROW LEVEL SECURITY;

-- Criar políticas para permitir todas as operações (para demonstração)
-- Em produção, você deve criar políticas mais restritivas baseadas na autenticação
CREATE POLICY "Allow all operations on fornecedores" ON fornecedores FOR ALL USING (true);
CREATE POLICY "Allow all operations on cnpjs_fornecedores" ON cnpjs_fornecedores FOR ALL USING (true);
CREATE POLICY "Allow all operations on segmentos_varejos" ON segmentos_varejos FOR ALL USING (true);
CREATE POLICY "Allow all operations on segmentos_fornecedores" ON segmentos_fornecedores FOR ALL USING (true);

-- Inserir dados de exemplo para segmentos de varejos
INSERT INTO segmentos_varejos (nome) VALUES
  ('Supermercados'),
  ('Farmácias'),
  ('Postos de Combustível'),
  ('Restaurantes'),
  ('Lojas de Conveniência'),
  ('Padarias'),
  ('Açougues'),
  ('Hortifrútis');

-- Inserir dados de exemplo para fornecedores
INSERT INTO fornecedores (nome, logo) VALUES
  ('Fornecedor ABC Ltda', 'https://via.placeholder.com/150x60/0066cc/ffffff?text=ABC'),
  ('Distribuidora XYZ S.A.', 'https://via.placeholder.com/150x60/cc6600/ffffff?text=XYZ'),
  ('Comercial 123 Eireli', 'https://via.placeholder.com/150x60/009966/ffffff?text=123');

-- Inserir CNPJs de exemplo
INSERT INTO cnpjs_fornecedores (fornecedor_id, cnpj) VALUES
  (1, '11.222.333/0001-44'),
  (1, '11.222.333/0002-25'), -- Mesmo fornecedor, filial diferente
  (2, '55.666.777/0001-88'),
  (3, '99.888.777/0001-66');

-- Inserir relacionamentos de segmentos de exemplo
INSERT INTO segmentos_fornecedores (fornecedor_id, segmento_id) VALUES
  (1, 1), -- Fornecedor ABC -> Supermercados
  (1, 2), -- Fornecedor ABC -> Farmácias
  (2, 1), -- Distribuidora XYZ -> Supermercados
  (2, 5), -- Distribuidora XYZ -> Lojas de Conveniência
  (3, 4), -- Comercial 123 -> Restaurantes
  (3, 6); -- Comercial 123 -> Padarias

-- Views úteis para consultas
CREATE VIEW vw_fornecedores_completo AS
SELECT 
  f.id,
  f.nome,
  f.logo,
  f.created_at,
  array_agg(DISTINCT cf.cnpj) as cnpjs,
  array_agg(DISTINCT sv.nome) as segmentos
FROM fornecedores f
LEFT JOIN cnpjs_fornecedores cf ON f.id = cf.fornecedor_id
LEFT JOIN segmentos_fornecedores sf ON f.id = sf.fornecedor_id
LEFT JOIN segmentos_varejos sv ON sf.segmento_id = sv.id
GROUP BY f.id, f.nome, f.logo, f.created_at
ORDER BY f.nome;

-- Verificar se as tabelas foram criadas corretamente
SELECT 'Fornecedores' as tabela, count(*) as registros FROM fornecedores
UNION ALL
SELECT 'CNPJs', count(*) FROM cnpjs_fornecedores
UNION ALL
SELECT 'Segmentos', count(*) FROM segmentos_varejos
UNION ALL
SELECT 'Segmentos dos Fornecedores', count(*) FROM segmentos_fornecedores; 