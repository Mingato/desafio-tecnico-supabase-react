import React, { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Button,
  TextField,
  Box,
  Chip,
  IconButton,
  Avatar,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Autocomplete,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Toolbar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Business as BusinessIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { 
  FornecedorCompleto, 
  FornecedorFilters, 
  PaginationData,
  SegmentoVarejo,
  CNPJFornecedor
} from '../types';
import FornecedorCompleteModal from './FornecedorCompleteModal';

const FornecedorTable: React.FC = () => {
  const [fornecedores, setFornecedores] = useState<FornecedorCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Paginação
  const [pagination, setPagination] = useState<PaginationData>({
    page: 0,
    size: 20,
    total: 0,
    totalPages: 0
  });
  
  // Filtros
  const [filters, setFilters] = useState<FornecedorFilters>({});
  const [searchValues, setSearchValues] = useState<FornecedorFilters>({});
  
  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFornecedor, setSelectedFornecedor] = useState<FornecedorCompleto | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Dialog de confirmação
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fornecedorToDelete, setFornecedorToDelete] = useState<FornecedorCompleto | null>(null);
  
  // Dados para filtros
  const [segmentos, setSegmentos] = useState<SegmentoVarejo[]>([]);

  const fetchSegmentos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('segmentos_varejos')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      setSegmentos(data || []);
    } catch (error) {
      console.error('Erro ao carregar segmentos:', error);
    }
  }, []);

  const buildQuery = useCallback(() => {
    let query = supabase
      .from('vw_fornecedores_completo')
      .select('*', { count: 'exact' });

    // Aplicar filtros
    if (filters.nome) {
      query = query.ilike('nome', `%${filters.nome}%`);
    }
    
    if (filters.segmento) {
      query = query.contains('segmentos', `{${filters.segmento}}`);
    }

    return query;
  }, [filters]);

  const fetchFornecedores = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      let query;
      let data, error, count;

      if (filters.cnpj) {
        // Para busca parcial em CNPJ, fazemos duas queries separadas
        // Primeiro buscamos todos os fornecedores que atendem aos outros filtros
        let baseQuery = supabase
          .from('vw_fornecedores_completo')
          .select('*', { count: 'exact' });

        if (filters.nome) {
          baseQuery = baseQuery.ilike('nome', `%${filters.nome}%`);
        }
        
        if (filters.segmento) {
          baseQuery = baseQuery.contains('segmentos', `{${filters.segmento}}`);
        }

        const { data: allData, error: allError, count: allCount } = await baseQuery.order('nome');
        
        if (allError) throw allError;

        // Filtrar por CNPJ no lado do cliente
        const filteredData = (allData || []).filter((item: any) => {
          const cnpjs = item.cnpjs ? item.cnpjs.filter((cnpj: any) => cnpj !== null) : [];
          return cnpjs.some((cnpj: string) => 
            cnpj.toLowerCase().includes(filters.cnpj!.toLowerCase())
          );
        });

        // Aplicar paginação manualmente
        const startIndex = pagination.page * pagination.size;
        const endIndex = startIndex + pagination.size;
        data = filteredData.slice(startIndex, endIndex);
        count = filteredData.length;
        error = null;
      } else {
        // Query normal sem filtro de CNPJ
        query = buildQuery();
        
        const result = await query
          .order('nome')
          .range(
            pagination.page * pagination.size,
            (pagination.page + 1) * pagination.size - 1
          );
        
        data = result.data;
        error = result.error;
        count = result.count;
      }

      if (error) throw error;

      // Processar dados
      const processedData = (data || []).map((item: any) => ({
        ...item,
        cnpjs: item.cnpjs ? item.cnpjs.filter((cnpj: any) => cnpj !== null) : [],
        segmentos: item.segmentos ? item.segmentos.filter((seg: any) => seg !== null) : [],
      }));

      setFornecedores(processedData);
      
      const total = count || 0;
      setPagination(prev => ({
        ...prev,
        total,
        totalPages: Math.ceil(total / prev.size)
      }));
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar fornecedores');
    } finally {
      setLoading(false);
    }
  }, [buildQuery, pagination.page, pagination.size, filters]);

  const handlePageChange = (event: unknown, newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = parseInt(event.target.value, 10);
    setPagination(prev => ({ 
      ...prev, 
      size: newSize, 
      page: 0 
    }));
  };

  const handleFilterChange = (field: keyof FornecedorFilters, value: string) => {
    setSearchValues(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    setFilters({ ...searchValues });
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const clearFilters = () => {
    setSearchValues({});
    setFilters({});
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleCreate = () => {
    setSelectedFornecedor(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (fornecedor: FornecedorCompleto) => {
    setSelectedFornecedor(fornecedor);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDeleteClick = (fornecedor: FornecedorCompleto) => {
    setFornecedorToDelete(fornecedor);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!fornecedorToDelete) return;

    try {
      const { error } = await supabase
        .from('fornecedores')
        .delete()
        .eq('id', fornecedorToDelete.id);

      if (error) throw error;

      await fetchFornecedores();
      setDeleteDialogOpen(false);
      setFornecedorToDelete(null);
    } catch (error: any) {
      setError(error.message || 'Erro ao deletar fornecedor');
    }
  };

  const handleModalSuccess = () => {
    fetchFornecedores();
    setModalOpen(false);
    setSelectedFornecedor(null);
  };

  useEffect(() => {
    fetchSegmentos();
  }, [fetchSegmentos]);

  useEffect(() => {
    fetchFornecedores();
  }, [fetchFornecedores]);

  // Debounce para filtros automáticos (nome e CNPJ)
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      // Aplicar filtros automaticamente apenas para nome e CNPJ
      const hasAutoFilters = searchValues.nome || searchValues.cnpj;
      const shouldApplyFilters = 
        searchValues.nome !== filters.nome || 
        searchValues.cnpj !== filters.cnpj;

      if (shouldApplyFilters) {
        setFilters(prev => ({
          ...prev,
          nome: searchValues.nome,
          cnpj: searchValues.cnpj
        }));
        setPagination(prev => ({ ...prev, page: 0 }));
      }
    }, 800); // 800ms de delay após parar de digitar

    return () => clearTimeout(debounceTimer);
  }, [searchValues.nome, searchValues.cnpj, filters.nome, filters.cnpj]);

  return (
    <Box>
      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filtros
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={2} alignItems="center">
            <TextField
              label="Nome (busca automática)"
              value={searchValues.nome || ''}
              onChange={(e) => handleFilterChange('nome', e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
              placeholder="Digite para buscar..."
            />
            <TextField
              label="CNPJ (busca automática)"
              value={searchValues.cnpj || ''}
              onChange={(e) => handleFilterChange('cnpj', e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
              placeholder="Digite para buscar..."
            />
            <Autocomplete
              options={segmentos}
              getOptionLabel={(option) => option.nome}
              value={segmentos.find(s => s.nome === searchValues.segmento) || null}
              onChange={(_, value) => {
                handleFilterChange('segmento', value?.nome || '');
                // Aplicar filtro de segmento imediatamente
                setTimeout(() => {
                  setFilters(prev => ({
                    ...prev,
                    segmento: value?.nome || undefined
                  }));
                  setPagination(prev => ({ ...prev, page: 0 }));
                }, 0);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Segmento de Varejo"
                  size="small"
                />
              )}
              size="small"
              sx={{ minWidth: 200 }}
            />
            <Box display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearFilters}
                size="small"
              >
                Limpar Filtros
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Toolbar */}
      <Toolbar sx={{ px: 0, mb: 2 }}>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Fornecedores ({pagination.total})
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Novo Fornecedor
        </Button>
      </Toolbar>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fornecedor</TableCell>
              <TableCell>CNPJs</TableCell>
              <TableCell>Segmentos</TableCell>
              <TableCell>Data Cadastro</TableCell>
              <TableCell align="center" width={120}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : fornecedores.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    Nenhum fornecedor encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              fornecedores.map((fornecedor) => (
                <TableRow key={fornecedor.id} hover>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar
                        src={fornecedor.logo}
                        sx={{ width: 40, height: 40 }}
                      >
                        <BusinessIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2">
                          {fornecedor.nome}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {fornecedor.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {fornecedor.cnpjs.length > 0 ? (
                        fornecedor.cnpjs.slice(0, 2).map((cnpj, index) => (
                          <Chip
                            key={index}
                            label={cnpj}
                            size="small"
                            variant="outlined"
                          />
                        ))
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Nenhum CNPJ
                        </Typography>
                      )}
                      {fornecedor.cnpjs.length > 2 && (
                        <Chip
                          label={`+${fornecedor.cnpjs.length - 2}`}
                          size="small"
                          variant="outlined"
                          color="primary"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" flexWrap="wrap" gap={0.5}>
                      {fornecedor.segmentos.length > 0 ? (
                        fornecedor.segmentos.slice(0, 2).map((segmento, index) => (
                          <Chip
                            key={index}
                            label={segmento}
                            size="small"
                            color="primary"
                          />
                        ))
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          Nenhum segmento
                        </Typography>
                      )}
                      {fornecedor.segmentos.length > 2 && (
                        <Chip
                          label={`+${fornecedor.segmentos.length - 2}`}
                          size="small"
                          color="primary"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(fornecedor.created_at).toLocaleDateString('pt-BR')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(fornecedor)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(fornecedor)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={pagination.total}
        page={pagination.page}
        onPageChange={handlePageChange}
        rowsPerPage={pagination.size}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[10, 20, 50, 100]}
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
        }
      />

      {/* Modal de Criação/Edição */}
      <FornecedorCompleteModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        fornecedor={selectedFornecedor}
        mode={modalMode}
        onSuccess={handleModalSuccess}
      />

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o fornecedor "{fornecedorToDelete?.nome}"?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FornecedorTable; 