import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Autocomplete,
  Chip,
  Typography,
  Divider
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { supabase } from '../lib/supabase';
import { 
  FornecedorCompleto, 
  FornecedorCompleteFormValues,
  SegmentoVarejo
} from '../types';

interface FornecedorCompleteModalProps {
  open: boolean;
  onClose: () => void;
  fornecedor: FornecedorCompleto | null;
  mode: 'create' | 'edit';
  onSuccess?: () => void;
}

const validationSchema = Yup.object({
  nome: Yup.string()
    .required('Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  logo: Yup.string()
    .nullable()
    .url('Deve ser uma URL válida'),
  cnpjs: Yup.array()
    .of(Yup.string().test('cnpj-format', 'CNPJ deve ter formato válido', (value) => {
      if (!value) return true; // Campo opcional
      const digits = value.replace(/\D/g, '');
      return digits.length === 14 || /^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/.test(value);
    })),
  segmentos: Yup.array()
    .of(Yup.number())
    .min(0, 'Selecione pelo menos um segmento')
});

const FornecedorCompleteModal: React.FC<FornecedorCompleteModalProps> = ({
  open,
  onClose,
  fornecedor,
  mode,
  onSuccess
}) => {
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [segmentos, setSegmentos] = useState<SegmentoVarejo[]>([]);
  const [newCnpj, setNewCnpj] = useState('');

  const fetchSegmentos = async () => {
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
  };

  const fetchFornecedorDetails = async (fornecedorId: number) => {
    try {
      console.log('Buscando detalhes do fornecedor ID:', fornecedorId);
      
      // Buscar CNPJs do fornecedor
      const { data: cnpjData, error: cnpjError } = await supabase
        .from('cnpjs_fornecedores')
        .select('cnpj')
        .eq('fornecedor_id', fornecedorId);

      if (cnpjError) {
        console.error('Erro ao buscar CNPJs:', cnpjError);
        throw cnpjError;
      }

      console.log('CNPJs encontrados:', cnpjData);

      // Buscar segmentos do fornecedor
      const { data: segmentoData, error: segmentoError } = await supabase
        .from('segmentos_fornecedores')
        .select('segmento_id')
        .eq('fornecedor_id', fornecedorId);

      if (segmentoError) {
        console.error('Erro ao buscar segmentos:', segmentoError);
        throw segmentoError;
      }

      console.log('Segmentos encontrados:', segmentoData);

      const result = {
        cnpjs: cnpjData?.map(item => item.cnpj) || [],
        segmentos: segmentoData?.map(item => item.segmento_id) || []
      };

      console.log('Resultado final dos detalhes:', result);
      return result;
    } catch (error) {
      console.error('Erro ao carregar detalhes do fornecedor:', error);
      return { cnpjs: [], segmentos: [] };
    }
  };

  const formatCnpj = (cnpj: string) => {
    // Remove tudo que não é dígito
    const digits = cnpj.replace(/\D/g, '');
    
    // Se tem 14 dígitos, formatar como CNPJ
    if (digits.length === 14) {
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    // Se já está formatado, retornar como está
    if (/^\d{2}\.\d{3}\.\d{3}\/\d{4}\-\d{2}$/.test(cnpj)) {
      return cnpj;
    }
    
    return cnpj;
  };

  const handleSubmit = async (values: FornecedorCompleteFormValues, actions: any) => {
    try {
      setStatus(mode === 'create' ? 'Criando fornecedor...' : 'Atualizando fornecedor...');
      setError(null);

      if (mode === 'create') {
        // Criar fornecedor
        const { data: fornecedorData, error: fornecedorError } = await supabase
          .from('fornecedores')
          .insert({
            nome: values.nome,
            logo: values.logo || null,
          })
          .select()
          .single();

        if (fornecedorError) throw fornecedorError;

        const fornecedorId = fornecedorData.id;

        // Inserir CNPJs
        if (values.cnpjs.length > 0) {
          const cnpjInserts = values.cnpjs.map(cnpj => ({
            fornecedor_id: fornecedorId,
            cnpj: cnpj.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
          }));

          const { error: cnpjError } = await supabase
            .from('cnpjs_fornecedores')
            .insert(cnpjInserts);

          if (cnpjError) throw cnpjError;
        }

        // Inserir segmentos
        if (values.segmentos.length > 0) {
          const segmentoInserts = values.segmentos.map(segmentoId => ({
            fornecedor_id: fornecedorId,
            segmento_id: segmentoId
          }));

          const { error: segmentoError } = await supabase
            .from('segmentos_fornecedores')
            .insert(segmentoInserts);

          if (segmentoError) throw segmentoError;
        }

        setStatus('Fornecedor criado com sucesso!');
      } else {
        // Editar fornecedor
        if (!fornecedor) return;

        const { error: fornecedorError } = await supabase
          .from('fornecedores')
          .update({
            nome: values.nome,
            logo: values.logo || null,
          })
          .eq('id', fornecedor.id);

        if (fornecedorError) throw fornecedorError;

        // Atualizar CNPJs - remover existentes e inserir novos
        await supabase
          .from('cnpjs_fornecedores')
          .delete()
          .eq('fornecedor_id', fornecedor.id);

        if (values.cnpjs.length > 0) {
          const cnpjInserts = values.cnpjs.map(cnpj => ({
            fornecedor_id: fornecedor.id,
            cnpj: cnpj.replace(/\D/g, '').replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
          }));

          const { error: cnpjError } = await supabase
            .from('cnpjs_fornecedores')
            .insert(cnpjInserts);

          if (cnpjError) throw cnpjError;
        }

        // Atualizar segmentos - remover existentes e inserir novos
        await supabase
          .from('segmentos_fornecedores')
          .delete()
          .eq('fornecedor_id', fornecedor.id);

        if (values.segmentos.length > 0) {
          const segmentoInserts = values.segmentos.map(segmentoId => ({
            fornecedor_id: fornecedor.id,
            segmento_id: segmentoId
          }));

          const { error: segmentoError } = await supabase
            .from('segmentos_fornecedores')
            .insert(segmentoInserts);

          if (segmentoError) throw segmentoError;
        }

        setStatus('Fornecedor atualizado com sucesso!');
      }

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        setStatus(null);
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao salvar fornecedor:', error);
      setError(error.message || 'Erro ao salvar fornecedor');
      setStatus(null);
    } finally {
      actions.setSubmitting(false);
    }
  };

  const handleClose = () => {
    setStatus(null);
    setError(null);
    setNewCnpj('');
    onClose();
  };

  const getInitialValues = async (): Promise<FornecedorCompleteFormValues> => {
    if (mode === 'create') {
      return {
        nome: '',
        logo: '',
        cnpjs: [],
        segmentos: []
      };
    }

    if (fornecedor) {
      console.log('Carregando dados do fornecedor:', fornecedor.id);
      const details = await fetchFornecedorDetails(fornecedor.id);
      console.log('Detalhes carregados:', details);
      
      return {
        nome: fornecedor.nome,
        logo: fornecedor.logo || '',
        cnpjs: details.cnpjs,
        segmentos: details.segmentos
      };
    }

    return {
      nome: '',
      logo: '',
      cnpjs: [],
      segmentos: []
    };
  };

  useEffect(() => {
    if (open) {
      fetchSegmentos();
    }
  }, [open]);

  const [initialValues, setInitialValues] = useState<FornecedorCompleteFormValues>({
    nome: '',
    logo: '',
    cnpjs: [],
    segmentos: []
  });

  const [valuesLoaded, setValuesLoaded] = useState(false);

  useEffect(() => {
    if (open) {
      setValuesLoaded(false);
      getInitialValues().then(values => {
        console.log('Setting initial values:', values);
        setInitialValues(values);
        setValuesLoaded(true);
      });
    } else {
      // Reset quando fechar
      setValuesLoaded(false);
      setInitialValues({
        nome: '',
        logo: '',
        cnpjs: [],
        segmentos: []
      });
    }
  }, [open, mode, fornecedor?.id]); // Adicionar fornecedor?.id como dependência

  if (!valuesLoaded) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent>
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {mode === 'create' ? 'Novo Fornecedor' : 'Editar Fornecedor'}
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => (
          <Form>
            <DialogContent>
              {status && (
                <Alert severity="success" sx={{ mb: 2 }}>
                  {status}
                </Alert>
              )}
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Informações Básicas */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Informações Básicas
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      name="nome"
                      label="Nome do Fornecedor"
                      value={values.nome}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.nome && Boolean(errors.nome)}
                      helperText={touched.nome && errors.nome}
                      fullWidth
                      required
                    />

                    <TextField
                      name="logo"
                      label="URL do Logo"
                      value={values.logo}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.logo && Boolean(errors.logo)}
                      helperText={touched.logo && errors.logo}
                      fullWidth
                      placeholder="https://exemplo.com/logo.png"
                    />
                  </Box>
                </Box>

                <Divider />

                {/* CNPJs */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    CNPJs
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      label="Adicionar CNPJ"
                      value={newCnpj}
                      onChange={(e) => setNewCnpj(e.target.value)}
                      placeholder="00.000.000/0000-00"
                      size="small"
                      sx={{ flexGrow: 1 }}
                    />
                    <Button
                      variant="outlined"
                      onClick={() => {
                        if (newCnpj.trim()) {
                          const formatted = formatCnpj(newCnpj);
                          setFieldValue('cnpjs', [...values.cnpjs, formatted]);
                          setNewCnpj('');
                        }
                      }}
                      size="small"
                    >
                      Adicionar
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {values.cnpjs.map((cnpj, index) => (
                      <Chip
                        key={index}
                        label={cnpj}
                        onDelete={() => {
                          const newCnpjs = values.cnpjs.filter((_, i) => i !== index);
                          setFieldValue('cnpjs', newCnpjs);
                        }}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                  {values.cnpjs.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Nenhum CNPJ adicionado
                    </Typography>
                  )}
                </Box>

                <Divider />

                {/* Segmentos */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Segmentos de Varejo
                  </Typography>
                  <Autocomplete
                    multiple
                    options={segmentos}
                    getOptionLabel={(option) => option.nome}
                    value={segmentos.filter(seg => values.segmentos.includes(seg.id))}
                    onChange={(_, newValue) => {
                      setFieldValue('segmentos', newValue.map(item => item.id));
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Selecionar Segmentos"
                        error={touched.segmentos && Boolean(errors.segmentos)}
                        helperText={touched.segmentos && errors.segmentos}
                        placeholder={values.segmentos.length === 0 ? "Nenhum segmento selecionado" : ""}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          label={option.nome}
                          {...getTagProps({ index })}
                          key={option.id}
                        />
                      ))
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    getOptionDisabled={() => false}
                  />
                  {values.segmentos.length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Nenhum segmento selecionado
                    </Typography>
                  )}
                </Box>
              </Box>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClose} disabled={isSubmitting}>
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    {mode === 'create' ? 'Criando...' : 'Salvando...'}
                  </>
                ) : (
                  mode === 'create' ? 'Criar' : 'Salvar'
                )}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default FornecedorCompleteModal; 