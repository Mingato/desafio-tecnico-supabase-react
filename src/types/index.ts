// Interfaces para o sistema de cadastro de fornecedores

export interface Fornecedor {
  id: number;
  nome: string;
  logo?: string;
  created_at: string;
}

export interface CNPJFornecedor {
  id: number;
  fornecedor_id: number;
  cnpj: string;
  created_at: string;
}

export interface SegmentoVarejo {
  id: number;
  nome: string;
  created_at: string;
}

export interface SegmentoFornecedor {
  id: number;
  fornecedor_id: number;
  segmento_id: number;
  created_at: string;
}

// Interfaces para formulários
export interface FornecedorFormValues {
  nome: string;
  logo: string;
}

export interface CNPJFormValues {
  fornecedor_id: number;
  cnpj: string;
}

export interface SegmentoVarejoFormValues {
  nome: string;
}

export interface SegmentoFornecedorFormValues {
  fornecedor_id: number;
  segmento_id: number;
}

// Interface para visualização completa do fornecedor
export interface FornecedorCompleto extends Fornecedor {
  cnpjs: string[];
  segmentos: string[];
}

// Novas interfaces para filtros e formulários completos
export interface FornecedorFilters {
  nome?: string;
  cnpj?: string;
  segmento?: string;
}

export interface FornecedorCompleteFormValues {
  nome: string;
  logo: string;
  cnpjs: string[];
  segmentos: number[];
}

export interface PaginationData {
  page: number;
  size: number;
  total: number;
  totalPages: number;
} 