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
  IconButton,
  Typography,
  Alert,
  CircularProgress,
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
  Search as SearchIcon,
  Clear as ClearIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import SegmentoVarejoModal from './SegmentoVarejoModal';

interface SegmentoVarejo {
  id: number;
  nome: string;
  created_at: string;
}

interface SegmentoFilters {
  nome?: string;
}

interface PaginationData {
  page: number;
  size: number;
  total: number;
  totalPages: number;
}

const SegmentoVarejoTable: React.FC = () => {
  const [segmentos, setSegmentos] = useState<SegmentoVarejo[]>([]);
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
  const [filters, setFilters] = useState<SegmentoFilters>({});
  const [searchValues, setSearchValues] = useState<SegmentoFilters>({});
  
  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSegmento, setSelectedSegmento] = useState<SegmentoVarejo | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Dialog de confirmação
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [segmentoToDelete, setSegmentoToDelete] = useState<SegmentoVarejo | null>(null);

  const buildQuery = useCallback(() => {
    let query = supabase
      .from('segmentos_varejos')
      .select('*', { count: 'exact' });

    // Aplicar filtros
    if (filters.nome) {
      query = query.ilike('nome', `%${filters.nome}%`);
    }

    return query;
  }, [filters]);

  const fetchSegmentos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const query = buildQuery();
      
      const { data, error, count } = await query
        .order('nome')
        .range(
          pagination.page * pagination.size,
          (pagination.page + 1) * pagination.size - 1
        );

      if (error) throw error;

      setSegmentos(data || []);
      
      const total = count || 0;
      setPagination(prev => ({
        ...prev,
        total,
        totalPages: Math.ceil(total / prev.size)
      }));
    } catch (error: any) {
      setError(error.message || 'Erro ao carregar segmentos');
    } finally {
      setLoading(false);
    }
  }, [buildQuery, pagination.page, pagination.size]);

  useEffect(() => {
    fetchSegmentos();
  }, [fetchSegmentos]);

  // Debounce para filtro automático de nome
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      const shouldApplyFilter = searchValues.nome !== filters.nome;

      if (shouldApplyFilter) {
        setFilters(prev => ({
          ...prev,
          nome: searchValues.nome
        }));
        setPagination(prev => ({ ...prev, page: 0 }));
      }
    }, 800); // 800ms de delay após parar de digitar

    return () => clearTimeout(debounceTimer);
  }, [searchValues.nome, filters.nome]);

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

  const handleFilterChange = (field: keyof SegmentoFilters, value: string) => {
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
    setSelectedSegmento(null);
    setModalMode('create');
    setModalOpen(true);
  };

  const handleEdit = (segmento: SegmentoVarejo) => {
    setSelectedSegmento(segmento);
    setModalMode('edit');
    setModalOpen(true);
  };

  const handleDeleteClick = (segmento: SegmentoVarejo) => {
    setSegmentoToDelete(segmento);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!segmentoToDelete) return;

    try {
      const { error } = await supabase
        .from('segmentos_varejos')
        .delete()
        .eq('id', segmentoToDelete.id);

      if (error) throw error;

      fetchSegmentos();
      setDeleteDialogOpen(false);
      setSegmentoToDelete(null);
    } catch (error: any) {
      setError(error.message || 'Erro ao deletar segmento');
    }
  };

  const handleModalSuccess = () => {
    fetchSegmentos();
    setModalOpen(false);
  };

  if (loading && segmentos.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Barra de ferramentas com filtros */}
      <Paper elevation={1} sx={{ mb: 2 }}>
        <Toolbar sx={{ flexDirection: 'column', alignItems: 'stretch', gap: 2, p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="div">
              Segmentos de Varejo
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
            >
              Novo Segmento
            </Button>
          </Box>

          {/* Filtros */}
          <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
            <TextField
              label="Buscar por nome (busca automática)"
              size="small"
              value={searchValues.nome || ''}
              onChange={(e) => handleFilterChange('nome', e.target.value)}
              sx={{ minWidth: 250 }}
              placeholder="Digite para buscar..."
            />
            
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
            >
              Limpar Filtros
            </Button>
          </Box>
        </Toolbar>
      </Paper>

      {/* Tabela */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nome</TableCell>
              <TableCell>Data de Criação</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {segmentos.map((segmento) => (
              <TableRow key={segmento.id} hover>
                <TableCell>
                  <Box display="flex" alignItems="center" gap={1}>
                    <CategoryIcon color="primary" />
                    {segmento.id}
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {segmento.nome}
                  </Typography>
                </TableCell>
                <TableCell>
                  {new Date(segmento.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(segmento)}
                    title="Editar"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteClick(segmento)}
                    title="Deletar"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {segmentos.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Nenhum segmento encontrado
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Paginação */}
      <TablePagination
        component="div"
        count={pagination.total}
        page={pagination.page}
        onPageChange={handlePageChange}
        rowsPerPage={pagination.size}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 20, 50]}
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
        }
      />

      {/* Modal de criação/edição */}
      <SegmentoVarejoModal
        open={modalOpen}
        mode={modalMode}
        segmento={selectedSegmento}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
      />

      {/* Dialog de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o segmento "{segmentoToDelete?.nome}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Excluir
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SegmentoVarejoTable; 