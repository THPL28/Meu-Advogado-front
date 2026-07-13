import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  CircularProgress,
  Alert,
  Paper,
  Box,
  InputAdornment,
} from '@mui/material';
import { Gavel as GavelIcon } from '@mui/icons-material';
import { apiGet, apiPost } from '../../services/api';

interface Specialty {
  id: number;
  name: string;
  description: string;
}

interface FormState {
  title: string;
  description: string;
  budget: string;
  jobType: string;
  urgency: string;
  confidentiality: string;
  estimatedValue: string;
  deadline: string;
  specialtyId: string;
  skillsText: string;
}

export function PostJobForm() {
  const navigate = useNavigate();
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [loadingSpecialties, setLoadingSpecialties] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState<FormState>({
    title: '',
    description: '',
    budget: '',
    jobType: 'Fixed',
    urgency: 'Medium',
    confidentiality: 'Public',
    estimatedValue: '',
    deadline: '',
    specialtyId: '',
    skillsText: '',
  });

  useEffect(() => {
    loadSpecialties();
  }, []);

  async function loadSpecialties() {
    try {
      setLoadingSpecialties(true);
      const response = await apiGet<{ success: boolean; data: Specialty[] }>('/api/specialties/');
      if (response?.success && response.data) {
        setSpecialties(response.data);
      }
    } catch {
      setError('Erro ao carregar especialidades jurídicas.');
    } finally {
      setLoadingSpecialties(false);
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!form.title || !form.description || !form.budget || !form.specialtyId) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setSubmitting(true);

    const skillNames = form.skillsText
      ? form.skillsText.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    const payload = {
      title: form.title,
      description: form.description,
      budget: parseFloat(form.budget),
      jobType: form.jobType,
      urgency: form.urgency,
      confidentiality: form.confidentiality,
      estimatedValue: form.estimatedValue ? parseFloat(form.estimatedValue) : null,
      deadline: form.deadline || null,
      specialtyId: parseInt(form.specialtyId),
      skillNames: skillNames,
    };

    try {
      const response = await apiPost<{ success: boolean }>('/api/jobs/post', payload);
      if (response?.success) {
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao publicar o caso.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      <Paper variant="outlined" sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <GavelIcon color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h5" fontWeight="bold">
            Publicar Novo Caso Jurídico
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Caso publicado com sucesso! Redirecionando para o dashboard...
          </Alert>
        )}

        {loadingSpecialties ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="title"
                  label="Título do Caso"
                  placeholder="Ex: Elaboração de Contrato Social para Startup de Tecnologia"
                  value={form.title}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  multiline
                  rows={6}
                  name="description"
                  label="Descrição Detalhada do Caso"
                  placeholder="Descreva as necessidades, o histórico do caso e os objetivos jurídicos esperados..."
                  value={form.description}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  select
                  name="specialtyId"
                  label="Especialidade Jurídica"
                  value={form.specialtyId}
                  onChange={handleChange}
                >
                  {specialties.map((spec) => (
                    <MenuItem key={spec.id} value={spec.id.toString()}>
                      {spec.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="skillsText"
                  label="Habilidades Necessárias (Separadas por vírgula)"
                  placeholder="Ex: Contratos, Startup, LGPD, Direito Societário"
                  value={form.skillsText}
                  onChange={handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  name="budget"
                  label="Orçamento do Caso"
                  type="number"
                  value={form.budget}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  select
                  name="jobType"
                  label="Tipo de Orçamento"
                  value={form.jobType}
                  onChange={handleChange}
                >
                  <MenuItem value="Fixed">Valor Fixo</MenuItem>
                  <MenuItem value="Hourly">Por Hora</MenuItem>
                  <MenuItem value="ProBono">Pro Bono</MenuItem>
                  <MenuItem value="Contingency">Êxito</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  select
                  name="urgency"
                  label="Nível de Urgência"
                  value={form.urgency}
                  onChange={handleChange}
                >
                  <MenuItem value="Low">Baixa</MenuItem>
                  <MenuItem value="Medium">Média</MenuItem>
                  <MenuItem value="High">Alta</MenuItem>
                  <MenuItem value="Urgent">Urgente</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  select
                  name="confidentiality"
                  label="Grau de Confidencialidade"
                  value={form.confidentiality}
                  onChange={handleChange}
                >
                  <MenuItem value="Public">Público</MenuItem>
                  <MenuItem value="Protected">Protegido</MenuItem>
                  <MenuItem value="StrictlyConfidential">Altamente Confidencial</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="estimatedValue"
                  label="Valor Estimado da Causa (Opcional)"
                  type="number"
                  value={form.estimatedValue}
                  onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  name="deadline"
                  label="Prazo Limite para Conclusão"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={form.deadline}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
              <Button
                variant="outlined"
                color="secondary"
                disabled={submitting}
                onClick={() => navigate('/dashboard')}
                sx={{ textTransform: 'none', borderRadius: 2 }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={submitting}
                sx={{ textTransform: 'none', borderRadius: 2, px: 4 }}
              >
                {submitting ? <CircularProgress size={24} /> : 'Publicar Caso'}
              </Button>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
