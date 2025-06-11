# Desafio Técnico - Sistema de Gerenciamento de Fornecedores

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Material-UI](https://img.shields.io/badge/Material--UI-0081CB?style=for-the-badge&logo=material-ui&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

> Uma aplicação web moderna e completa para gerenciamento de fornecedores, CNPJs e segmentos de varejo com interface intuitiva, filtros automáticos e performance otimizada.

## 📋 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [Demonstração](#-demonstração)
- [Tecnologias](#-tecnologias-utilizadas)
- [Instalação](#-instalação-e-configuração)
- [Uso](#-como-usar)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Funcionalidades](#-funcionalidades)
- [Performance](#-otimizações-de-performance)
- [Scripts](#-scripts-disponíveis)
- [Troubleshooting](#-troubleshooting)
- [Próximos Passos que poderiam ser aplicadas ao projeto para ficar mais robusto](#-próximos-passos-que-poderiam-ser-aplicadas-ao-projeto-para-ficar-mais-robusto)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

## 🎯 Sobre o Projeto

Este projeto é uma aplicação web completa para gerenciamento de fornecedores, desenvolvida como um desafio técnico. A aplicação permite gerenciar fornecedores com múltiplos CNPJs e associações com segmentos de varejo através de uma interface moderna, responsiva e altamente otimizada.

### Principais características:
- ✅ **Gerenciamento completo de fornecedores** com múltiplos CNPJs
- ✅ **Sistema de segmentos de varejo** com associações N:N
- ✅ **Filtros automáticos com debounce** para melhor UX
- ✅ **Interface moderna** com Material-UI
- ✅ **Performance otimizada** com índices de banco especializados
- ✅ **Validação robusta** de formulários com Formik + Yup
- ✅ **Tipagem completa** com TypeScript
- ✅ **Design responsivo** para todos os dispositivos
- ✅ **Feedback visual consistente** e states de loading

## 📱 Demonstração

### Funcionalidades principais:

#### 🏢 Gerenciamento de Fornecedores
- **Listagem paginada** com filtros automáticos
- **Busca por nome** com debounce de 800ms
- **Busca por CNPJ** com debounce de 800ms  
- **Filtro por segmento** com aplicação imediata
- **Modal completo** para criação e edição
- **Múltiplos CNPJs** por fornecedor
- **Múltiplos segmentos** por fornecedor
- **Exclusão segura** com confirmação

#### 🏪 Gerenciamento de Segmentos de Varejo
- **Listagem paginada** com filtro automático
- **Busca por nome** com debounce de 800ms
- **Modal para criação/edição** de segmentos
- **Exclusão segura** com confirmação
- **Associação automática** com fornecedores

#### ⚡ Performance e UX
- **Filtros automáticos** sem necessidade de botões
- **Debounce inteligente** para reduzir requisições
- **Paginação eficiente** com contadores
- **Estados de loading** em todas as operações
- **Tratamento de erros** robusto

## 🚀 Tecnologias Utilizadas

### Backend
- **[Supabase](https://supabase.com/)** - Plataforma backend com PostgreSQL e API REST
  - Banco de dados PostgreSQL
  - API REST automática
  - Row Level Security (RLS)
  - Índices otimizados para performance

### Frontend
- **[React](https://reactjs.org/)** `^18.0.0` - Biblioteca para interfaces de usuário
- **[TypeScript](https://www.typescriptlang.org/)** `^4.9.0` - Superset tipado do JavaScript
- **[Material-UI (MUI)](https://mui.com/)** `^5.0.0` - Biblioteca de componentes React
- **[Formik](https://formik.org/)** `^2.2.9` - Biblioteca para construção de formulários
- **[Yup](https://github.com/jquense/yup)** `^1.0.0` - Biblioteca para validação de esquemas

### Ferramentas de Desenvolvimento
- **Create React App** - Configuração inicial do projeto
- **ESLint** - Análise estática de código
- **Prettier** - Formatação de código

## 🛠️ Instalação e Configuração

### Pré-requisitos

Certifique-se de ter instalado em sua máquina:

- **Node.js** (versão 16.0.0 ou superior)
- **npm** (versão 8.0.0 ou superior) ou **yarn**
- **Git**
- Conta no [Supabase](https://supabase.com)

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/desafio-tecnico.git
cd desafio-tecnico-supabase-react
```

### 2. Instalação das dependências

```bash
# Com npm
npm install

# Ou com yarn
yarn install
```

### 3. Configuração do Supabase

#### 3.1. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) e faça login
2. Clique em "New Project"
3. Escolha sua organização e defina:
   - **Name**: desafio-tecnico
   - **Database Password**: uma senha segura
   - **Region**: escolha a região mais próxima

#### 3.2. Obter credenciais

1. No painel do Supabase, vá para **Project Settings > API**
2. Copie as seguintes informações:
   - **Project URL**
   - **anon public key**

#### 3.3. Configurar variáveis de ambiente

1. Crie um arquivo `.env` na raiz do projeto:
```bash
cp .env.example .env
```

2. Edite o arquivo `.env` com suas credenciais:
```env
REACT_APP_SUPABASE_URL=https://seu-projeto.supabase.co
REACT_APP_SUPABASE_ANON_KEY=sua-chave-anonima-aqui
```

### 4. Configuração do banco de dados

1. No painel do Supabase, vá para **SQL Editor**
2. Execute o script SQL disponível no arquivo `database.sql` na raiz do projeto:
   - Abra o arquivo `database.sql`
   - Copie todo o conteúdo do arquivo
   - Cole no SQL Editor do Supabase
   - Clique em "Run" para executar

O script `database.sql` contém:
- **Tabelas principais**: fornecedores, cnpjs_fornecedores, segmentos_varejos, segmentos_fornecedores
- **Índices otimizados**: Para buscas parciais (ILIKE), JOINs eficientes e ordenação
- **Configuração de RLS**: Row Level Security para segurança
- **Políticas de acesso**: Permissões adequadas para operações
- **Dados de exemplo**: Para facilitar testes iniciais
- **Views otimizadas**: Para consultas complexas eficientes

**Importante**: Este script cria um sistema completo e otimizado com índices especializados para alta performance.

### 5. Executar a aplicação

```bash
# Em modo de desenvolvimento
npm start

# Ou
yarn start
```

A aplicação estará disponível em `http://localhost:3000`

## 🔧 Como Usar

### Gerenciar Fornecedores

1. **Criar novo fornecedor**:
   - Clique em "Novo Fornecedor"
   - Preencha nome e logo (opcional)
   - Adicione CNPJs (formato: 00.000.000/0000-00)
   - Selecione segmentos de varejo
   - Clique em "Salvar"

2. **Buscar fornecedores**:
   - **Nome**: Digite e aguarde busca automática (800ms)
   - **CNPJ**: Digite e aguarde busca automática (800ms)
   - **Segmento**: Selecione para filtro imediato

3. **Editar fornecedor**:
   - Clique no ícone de edição
   - Modifique informações desejadas
   - Clique em "Salvar"

4. **Excluir fornecedor**:
   - Clique no ícone de exclusão
   - Confirme a operação

### Gerenciar Segmentos de Varejo

1. **Criar novo segmento**:
   - Clique em "Novo Segmento"
   - Digite o nome do segmento
   - Clique em "Salvar"

2. **Buscar segmentos**:
   - Digite no campo de busca
   - Aguarde busca automática (800ms)

3. **Editar/Excluir segmentos**:
   - Use os ícones respectivos na lista

## 🏗️ Estrutura do Projeto

```
desafio-tecnico/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── components/
│   │   ├── FornecedorTable.tsx           # Tabela principal de fornecedores
│   │   ├── FornecedorCompleteModal.tsx   # Modal completo para fornecedores
│   │   ├── SegmentoVarejoTable.tsx       # Tabela de segmentos de varejo
│   │   └── SegmentoVarejoModal.tsx       # Modal para segmentos
│   ├── lib/
│   │   └── supabase.ts                   # Configuração do cliente Supabase
│   ├── types/
│   │   └── index.ts                      # Definições de tipos TypeScript
│   ├── App.tsx                           # Componente principal com tabs
│   ├── App.css                           # Estilos globais
│   └── index.tsx                         # Ponto de entrada da aplicação
├── database.sql                          # Script completo do banco de dados
├── .env.example                          # Exemplo de variáveis de ambiente
├── package.json                          # Dependências e scripts
└── README.md                             # Esta documentação
```

## ✨ Funcionalidades

### 🏢 Gerenciamento de Fornecedores

#### Lista de Fornecedores
- **Tabela responsiva** com Material-UI
- **Paginação eficiente** com contador total
- **Filtros automáticos**:
  - Nome: busca parcial com debounce 800ms
  - CNPJ: busca parcial com debounce 800ms  
  - Segmento: filtro imediato por seleção
- **Carregamento automático** dos dados
- **Estados visuais** para loading, erro e dados vazios
- **Exibição otimizada**:
  - Avatar com logo do fornecedor
  - Lista de CNPJs com chips
  - Lista de segmentos com chips
  - Data de criação formatada
  - Ações de editar/excluir

#### Modal de Fornecedor
- **Formulário completo** com Formik + Yup
- **Validação em tempo real** de todos os campos
- **Gerenciamento de CNPJs**:
  - Adição dinâmica de múltiplos CNPJs
  - Validação de formato automática
  - Remoção individual de CNPJs
  - Formatação automática durante digitação
- **Gerenciamento de Segmentos**:
  - Autocomplete com todos os segmentos
  - Seleção múltipla com chips
  - Busca em tempo real nos segmentos
- **Estados de loading** durante operações
- **Feedback visual** para sucesso/erro

### 🏪 Gerenciamento de Segmentos de Varejo

#### Lista de Segmentos
- **Tabela responsiva** e limpa
- **Busca automática** por nome com debounce
- **Paginação** com controle de itens por página
- **Carregamento otimizado** dos dados
- **Estados visuais** consistentes

#### Modal de Segmento
- **Formulário simples** e eficiente
- **Validação** de nome obrigatório
- **Operações** de criação e edição
- **Feedback** visual adequado

### ⚡ Otimizações de Performance

#### Filtros Automáticos
- **Debounce inteligente** de 800ms para evitar spam
- **Cancelamento** de requisições anteriores
- **Estados independentes** para busca e filtros
- **Reset automático** de paginação ao filtrar

#### Banco de Dados
- **Índices especializados**:
  - `text_pattern_ops` para buscas ILIKE
  - Índices compostos para JOINs
  - Índices de ordenação para performance
- **Queries otimizadas** com LIMIT e OFFSET
- **View otimizada** para consultas complexas

#### Interface
- **Componentes reutilizáveis** e otimizados
- **Loading states** granulares
- **Error boundaries** para tratamento de erros
- **Memoização** de componentes custosos

## 🔍 Performance

### Índices de Banco Otimizados

O projeto inclui índices especializados para máxima performance:

```sql
-- Busca parcial por nome (ILIKE '%termo%')
CREATE INDEX idx_fornecedores_nome_text_pattern ON fornecedores(nome text_pattern_ops);
CREATE INDEX idx_fornecedores_nome_lower ON fornecedores(LOWER(nome) text_pattern_ops);

-- Busca parcial por CNPJ
CREATE INDEX idx_cnpjs_cnpj_text_pattern ON cnpjs_fornecedores(cnpj text_pattern_ops);

-- Índices compostos para JOINs eficientes
CREATE INDEX idx_cnpjs_fornecedor_cnpj ON cnpjs_fornecedores(fornecedor_id, cnpj);
CREATE INDEX idx_segmentos_fornecedor_segmento ON segmentos_fornecedores(fornecedor_id, segmento_id);

-- Ordenação otimizada
CREATE INDEX idx_fornecedores_nome ON fornecedores(nome);
CREATE INDEX idx_fornecedores_created_at ON fornecedores(created_at);
```

### Benefícios de Performance

| Operação | Antes | Depois |
|----------|-------|--------|
| Busca por nome | Sequential Scan | Index Scan |
| Busca por CNPJ | Sequential Scan | Index Scan |
| View completa | Multiple Sequential Scans | Index Nested Loops |
| Ordenação | Sort | Index-based |
| Paginação | Full scan + sort | Index range scan |

## 🧪 Scripts Disponíveis

No diretório do projeto, você pode executar:

```bash
# Desenvolvimento
npm start          # Executa em modo desenvolvimento (localhost:3000)
npm test           # Executa os testes unitários
npm run test:watch # Executa testes em modo watch

# Build e Deploy
npm run build      # Cria build otimizado para produção
npm run preview    # Visualiza o build de produção localmente

# Linting e Formatação
npm run lint       # Executa ESLint
npm run lint:fix   # Corrige problemas automáticos do ESLint
npm run format     # Formata código com Prettier

# Outros
npm run eject      # Remove abstração do Create React App (IRREVERSÍVEL)
```

## 🔍 Troubleshooting

### Problemas Comuns

#### ❌ Erro de conexão com Supabase
```
Error: Invalid API key or URL
```
**Solução**: Verifique se as variáveis de ambiente estão corretas no arquivo `.env`

#### ❌ Erro ao criar fornecedor
```
Error: duplicate key value violates unique constraint
```
**Solução**: Um CNPJ já existe no banco. Cada CNPJ deve ser único.

#### ❌ Erro de permissão no banco
```
Error: permission denied for table fornecedores
```
**Solução**: Verifique se as políticas RLS foram criadas corretamente no script SQL.

#### ❌ Filtros não funcionam
**Possíveis causas**:
- Índices não foram criados (execute o script database.sql completo)
- Conexão instável com o banco
- Console do navegador pode ter mais detalhes

#### ❌ Performance lenta
**Soluções**:
- Verifique se todos os índices foram criados
- Confirme que o script database.sql foi executado por completo
- Considere a região do Supabase (mais próxima = melhor)

### Debug

Para debuggar problemas:

1. **Verifique o console do navegador** (F12)
2. **Consulte os logs do Supabase** no painel da plataforma
3. **Verifique índices criados**:
```sql
SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public';
```

## 📝 Próximos Passos que poderiam ser aplicadas ao projeto para ficar mais robusto

### Melhorias planejadas:

- [ ] **Autenticação e autorização** com Supabase Auth
- [ ] **Upload de logos** para fornecedores
- [ ] **Exportação de dados** (CSV, PDF, Excel)
- [ ] **Relatórios** de fornecedores por segmento
- [ ] **Dashboard** com métricas e gráficos
- [ ] **Importação em lote** de fornecedores
- [ ] **Histórico de alterações** com auditoria
- [ ] **API REST** customizada para integrações
- [ ] **Notificações** para ações importantes

### Melhorias técnicas:

- [ ] **Testes unitários** completos com Jest + Testing Library
- [ ] **Testes de integração**
- [ ] **CI/CD pipeline** com GitHub Actions
- [ ] **Docker** para containerização
- [ ] **PWA** (Progressive Web App)
- [ ] **Internacionalização** (i18n)
- [ ] **Cache** de dados com React Query
- [ ] **Error boundaries** aprimorados
- [ ] **Monitoring**


---

<div align="center">

**Desenvolvido com ❤️ para o desafio técnico**

**Sistema completo de gerenciamento de fornecedores com performance otimizada**

[⬆ Voltar ao topo](#desafio-técnico---sistema-de-gerenciamento-de-fornecedores)

</div>
