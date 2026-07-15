import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  AccessTimeOutlined,
  AttachMoneyOutlined,
  CheckCircleOutline,
  DescriptionOutlined,
  GavelOutlined,
} from '@mui/icons-material';
import { type ChangeEvent, type FormEvent, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { apiPost } from '../../services/api';
import { green } from '@mui/material/colors';

const ProposalForm = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    coverLetter: '',
    proposedRate: '',
    proposedDuration: '',
    strategy: '',
    totalValue: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFieldChange = (field: keyof typeof formData) => (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await apiPost('/api/proposals/', {
        jobId: Number(jobId),
        coverLetter: formData.coverLetter,
        proposedRate: formData.proposedRate ? Number(formData.proposedRate) : null,
        proposedDuration: formData.proposedDuration ? Number(formData.proposedDuration) : null,
        strategy: formData.strategy,
        totalValue: formData.totalValue ? Number(formData.totalValue) : null,
      });
      setSuccess('Proposta enviada com sucesso!');
      window.setTimeout(() => navigate('/jobs'), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar proposta');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f8f4', py: { xs: 3, md: 5 }, px: 2 }}>
      <Paper
        elevation={0}
        sx={{
          maxWidth: 820,
          mx: 'auto',
          p: { xs: 3, md: 5 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 12px 40px rgba(16, 63, 19, 0.08)',
        }}
      >
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent='space-between' alignItems='flex-start' spacing={1}>
            <Box>
              <Typography variant='h5' fontWeight='bold' color='text.primary'>
                Enviar Proposta Jurídica
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5 }}>
                Apresente sua estratégia, valores e prazo para este caso.
              </Typography>
            </Box>
            <Chip label={`Caso #${jobId || 'em análise'}`} color='success' variant='outlined' />
          </Stack>

          <Divider />

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label='Mensagem / Carta de Apresentação'
                multiline
                rows={5}
                value={formData.coverLetter}
                onChange={handleFieldChange('coverLetter')}
                required
                placeholder='Descreva por que você é o advogado ideal para este caso...'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <DescriptionOutlined color='action' />
                    </InputAdornment>
                  ),
                }}
              />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label='Valor da Hora (R$)'
                  type='number'
                  value={formData.proposedRate}
                  onChange={handleFieldChange('proposedRate')}
                  placeholder='300'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <AttachMoneyOutlined color='action' />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label='Valor Total Estimado (R$)'
                  type='number'
                  value={formData.totalValue}
                  onChange={handleFieldChange('totalValue')}
                  placeholder='5000'
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position='start'>
                        <AttachMoneyOutlined color='action' />
                      </InputAdornment>
                    ),
                  }}
                />
              </Stack>

              <TextField
                fullWidth
                label='Prazo Estimado (dias)'
                type='number'
                value={formData.proposedDuration}
                onChange={handleFieldChange('proposedDuration')}
                placeholder='30'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <AccessTimeOutlined color='action' />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                label='Estratégia Jurídica Inicial'
                multiline
                rows={4}
                value={formData.strategy}
                onChange={handleFieldChange('strategy')}
                placeholder='Descreva a estratégia inicial para este caso...'
                InputProps={{
                  startAdornment: (
                    <InputAdornment position='start'>
                      <GavelOutlined color='action' />
                    </InputAdornment>
                  ),
                }}
              />

              {error && <Alert severity='error'>{error}</Alert>}
              {success && <Alert severity='success'>{success}</Alert>}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type='submit'
                  variant='contained'
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={18} color='inherit' /> : <CheckCircleOutline />}
                  sx={{
                    px: 3,
                    py: 1.2,
                    backgroundColor: green[700],
                    '&:hover': { backgroundColor: green[800] },
                  }}
                >
                  {saving ? 'Enviando...' : 'Enviar Proposta'}
                </Button>
              </Box>
            </Stack>
          </form>
        </Stack>
      </Paper>
    </Box>
  );
};

export default ProposalForm;
