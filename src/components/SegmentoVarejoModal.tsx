import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../lib/supabase';

interface SegmentoVarejo {
  id: number;
  nome: string;
  created_at: string;
}

interface SegmentoVarejoModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  segmento: SegmentoVarejo | null;
  onClose: () => void;
  onSuccess: () => void;
}

const validationSchema = Yup.object({
  nome: Yup.string()
    .required('Nome é obrigatório')
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
});

const SegmentoVarejoModal: React.FC<SegmentoVarejoModalProps> = ({
  open,
  mode,
  segmento,
  onClose,
  onSuccess
}) => {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (values: { nome: string }, actions: any) => {
    try {
      setError(null);

      if (mode === 'create') {
        const { error } = await supabase
          .from('segmentos_varejos')
          .insert([values]);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('segmentos_varejos')
          .update(values)
          .eq('id', segmento?.id);

        if (error) throw error;
      }

      onSuccess();
    } catch (error: any) {
      setError(error.message || 'Erro ao salvar segmento');
    } finally {
      actions.setSubmitting(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {mode === 'create' ? 'Novo Segmento de Varejo' : 'Editar Segmento de Varejo'}
      </DialogTitle>
      
      <Formik
        initialValues={{
          nome: segmento?.nome || '',
        }}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
          <Form>
            <DialogContent>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  name="nome"
                  label="Nome do Segmento"
                  value={values.nome}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.nome && Boolean(errors.nome)}
                  helperText={touched.nome && errors.nome}
                  fullWidth
                  required
                  placeholder="Ex: Alimentício, Farmacêutico, Automotivo..."
                  autoFocus
                />
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

export default SegmentoVarejoModal; 