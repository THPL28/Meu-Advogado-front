import { Button, CircularProgress, TextField, Typography, Paper, Grid, MenuItem } from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { apiRequest } from '../../services/api';
import { getAuthState, isLawyer, isClient } from '../../services/authService';
import { green } from '@mui/material/colors';

interface ProfileData {
  firstName: string;
  lastName: string;
  title: string;
  description: string;
  hourlyRate: string;
  location: string;
  // Legal fields
  oabNumber: string;
  oabState: string;
  country: string;
  phone: string;
  photoUrl: string;
  dateOfBirth: string;
  languages: string;
  experienceYears: string;
  clientType: string;
  companyName: string;
}

const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

const ContactInfo = () => {
  const { email } = getAuthState();
  const userIsLawyer = isLawyer();
  const userIsClient = isClient();

  const [formData, setFormData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    title: '',
    description: '',
    hourlyRate: '',
    location: '',
    oabNumber: '',
    oabState: '',
    country: 'BR',
    phone: '',
    photoUrl: '',
    dateOfBirth: '',
    languages: '',
    experienceYears: '',
    clientType: 'individual',
    companyName: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await apiRequest<{ success: boolean; data: ProfileData }>('/api/users/profile/me', { credentials: 'include' });
      if (response?.success && response.data) {
        const d = response.data;
        setFormData({
          firstName: d.firstName || '',
          lastName: d.lastName || '',
          title: d.title || '',
          description: d.description || '',
          hourlyRate: d.hourlyRate || '',
          location: d.location || '',
          oabNumber: d.oabNumber || '',
          oabState: d.oabState || '',
          country: d.country || 'BR',
          phone: d.phone || '',
          photoUrl: d.photoUrl || '',
          dateOfBirth: d.dateOfBirth || '',
          languages: d.languages || '',
          experienceYears: d.experienceYears || '',
          clientType: d.clientType || 'individual',
          companyName: d.companyName || '',
        });
      }
    } catch {
      // Profile not found, use empty form
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await apiRequest('/api/users/profile/me', {
        method: 'PUT',
        body: JSON.stringify(formData),
        credentials: 'include',
      });
      setSuccess('Perfil atualizado com sucesso!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <CircularProgress sx={{ mt: 4 }} />;
  }

  return (
    <Paper sx={{ p: 4, mt: 2, maxWidth: 700 }}>
      <Typography variant='h5' gutterBottom fontWeight='bold'>
        {userIsLawyer ? 'Perfil do Advogado' : userIsClient ? 'Perfil do Cliente' : 'Meu Perfil'}
      </Typography>
      <Typography variant='body2' color='text.secondary' gutterBottom sx={{ mb: 3 }}>
        {email && `Autenticado como: ${email}`}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Typography variant='subtitle1' fontWeight='bold' sx={{ mt: 2, mb: 1 }}>
          Informações Pessoais
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField fullWidth label='Nome' value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} margin='normal' required />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label='Sobrenome' value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} margin='normal' required />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label='Telefone' value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })} margin='normal'
              placeholder='+55 11 99999-9999' />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label='Data de Nascimento' type='date' value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} margin='normal'
              InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label='País' value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })} margin='normal' />
          </Grid>
          <Grid item xs={6}>
            <TextField fullWidth label='Cidade / Localização' value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })} margin='normal'
              placeholder='São Paulo, SP' />
          </Grid>
        </Grid>

        {userIsLawyer && (
          <>
            <Typography variant='subtitle1' fontWeight='bold' sx={{ mt: 3, mb: 1 }}>
              Informações Profissionais (OAB)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField fullWidth label='Número da OAB' value={formData.oabNumber}
                  onChange={(e) => setFormData({ ...formData, oabNumber: e.target.value })} margin='normal'
                  placeholder='123456' />
              </Grid>
              <Grid item xs={3}>
                <TextField fullWidth label='UF OAB' select value={formData.oabState}
                  onChange={(e) => setFormData({ ...formData, oabState: e.target.value })} margin='normal'>
                  {brazilianStates.map((state) => (
                    <MenuItem key={state} value={state}>{state}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField fullWidth label='Anos de Experiência' type='number' value={formData.experienceYears}
                  onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })} margin='normal' />
              </Grid>
            </Grid>

            <Typography variant='subtitle1' fontWeight='bold' sx={{ mt: 2, mb: 1 }}>
              Perfil Profissional
            </Typography>
            <TextField fullWidth label='Título Profissional' value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} margin='normal'
              placeholder='Ex: Advogado Especialista em Direito Civil' />
            <TextField fullWidth label='Descrição / Biografia' value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })} margin='normal'
              multiline rows={4} placeholder='Descreva sua experiência e áreas de atuação...' />
            <TextField fullWidth label='Idiomas (separados por vírgula)' value={formData.languages}
              onChange={(e) => setFormData({ ...formData, languages: e.target.value })} margin='normal'
              placeholder='Português, Inglês, Espanhol' />
            <TextField fullWidth label='Valor por Hora (R$)' type='number' value={formData.hourlyRate}
              onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })} margin='normal'
              placeholder='300' />
          </>
        )}

        {userIsClient && (
          <>
            <Typography variant='subtitle1' fontWeight='bold' sx={{ mt: 3, mb: 1 }}>
              Informações do Cliente
            </Typography>
            <TextField fullWidth label='Tipo de Cliente' select value={formData.clientType}
              onChange={(e) => setFormData({ ...formData, clientType: e.target.value })} margin='normal'>
              <MenuItem value='individual'>Pessoa Física</MenuItem>
              <MenuItem value='company'>Empresa</MenuItem>
            </TextField>
            {formData.clientType === 'company' && (
              <TextField fullWidth label='Nome da Empresa' value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })} margin='normal' />
            )}
          </>
        )}

        {error && (
          <Typography color='error' variant='body2' sx={{ mt: 1 }}>{error}</Typography>
        )}
        {success && (
          <Typography color='success' variant='body2' sx={{ mt: 1 }}>{success}</Typography>
        )}

        <Button type='submit' variant='contained' disabled={saving}
          sx={{ mt: 3, backgroundColor: green[700], '&:hover': { backgroundColor: green[800] } }}>
          {saving ? <CircularProgress size={24} color='inherit' /> : 'Salvar Alterações'}
        </Button>
      </form>
    </Paper>
  );
};

export default ContactInfo;
