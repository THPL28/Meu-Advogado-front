import { Button, CircularProgress, Paper, TextField, Typography } from '@mui/material';
import { FormEvent, useState } from 'react';
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
      setTimeout(() => navigate('/jobs'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar proposta');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper sx={{ maxWidth: 700, mx: 'auto', mt: 4, p: 4 }}>
      <Typography variant='h5' fontWeight='bold' gutterBottom>
        Enviar Proposta Jurídica
      </Typography>
      <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
        Caso #{jobId} — Apresente sua proposta para este caso
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField fullWidth label='Mensagem / Carta de Apresentação' multiline rows={5}
          value={formData.coverLetter}
          onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
          margin='normal' required
          placeholder='Descreva por que você é o advogado ideal para este caso...' />

        <TextField fullWidth label='Valor da Hora (R$)' type='number'
          value={formData.proposedRate}
          onChange={(e) => setFormData({ ...formData, proposedRate: e.target.value })}
          margin='normal' placeholder='300' />

        <TextField fullWidth label='Valor Total Estimado (R$)' type='number'
          value={formData.totalValue}
          onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
          margin='normal' placeholder='5.000' />

        <TextField fullWidth label='Prazo Estimado (dias)' type='number'
          value={formData.proposedDuration}
          onChange={(e) => setFormData({ ...formData, proposedDuration: e.target.value })}
          margin='normal' placeholder='30' />

        <TextField fullWidth label='Estratégia Jurídica Inicial' multiline rows={4}
          value={formData.strategy}
          onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
          margin='normal'
          placeholder='Descreva sua estratégia para este caso...' />

        {error && <Typography color='error' variant='body2' sx={{ mt: 1 }}>{error}</Typography>}
        {success && <Typography color='success' variant='body2' sx={{ mt: 1 }}>{success}</Typography>}

        <Button type='submit' variant='contained' disabled={saving}
          sx={{ mt: 3, backgroundColor: green[700], '&:hover': { backgroundColor: green[800] } }}>
          {saving ? <CircularProgress size={24} color='inherit' /> : 'Enviar Proposta'}
        </Button>
      </form>
    </Paper>
  );
};

export default ProposalForm;
