import { Box, Button, CircularProgress, Link, Paper, TextField, Typography, Checkbox, FormControlLabel } from '@mui/material';
import { FormEvent, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { register } from '../../services/authService';
import AuthLayout from '../Shared/AuthLayout';
import { Gavel, BusinessCenter } from '@mui/icons-material';

type ProfileType = 'LAWYER' | 'CLIENT' | null;

export default function SignupPage() {
  const [profile, setProfile] = useState<ProfileType>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!profile) {
      setError('Por favor, selecione seu perfil (Advogado ou Cliente).');
      return;
    }
    if (!fullName || !email || !password) {
      setError('Preencha todos os campos.');
      return;
    }
    if (!termsAccepted) {
      setError('Você precisa concordar com os Termos de Uso e Política de Privacidade.');
      return;
    }
    if (password.length < 8) {
      setError('A senha deve ter no mínimo 8 caracteres.');
      return;
    }

    const nameParts = fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ' ';

    setLoading(true);
    try {
      const role = profile === 'LAWYER' ? 'ROLE_LAWYER' : 'ROLE_CLIENT';
      await register({
        firstName,
        lastName,
        email,
        password,
        roles: [role],
      });
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Paper
        elevation={0}
        sx={{
          width: { xs: '90%', sm: 540 },
          p: { xs: 3, md: 5 },
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.03)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography variant='h4' sx={{ color: '#16a30b', fontWeight: 900, letterSpacing: 2, fontFamily: 'Rubik, sans-serif', mb: 1 }}>
          LWORK
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          Acesse sua plataforma jurídica
        </Typography>
        
        <Typography variant='h5' fontWeight='bold' sx={{ mb: 1, color: '#2d2d2d' }}>
          Comece Agora
        </Typography>
        <Typography variant='body2' textAlign='center' color='text.secondary' sx={{ mb: 4, maxWidth: '80%' }}>
          Junte-se à plataforma jurídica de elite para profissionais e empresas.
        </Typography>

        <Typography variant='caption' fontWeight='bold' color='text.secondary' sx={{ letterSpacing: 1, mb: 2, alignSelf: 'center' }}>
          SELECIONE SEU PERFIL
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, width: '100%', mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
          <Box 
            onClick={() => setProfile('LAWYER')}
            sx={{ 
              flex: 1, 
              border: '1px solid',
              borderColor: profile === 'LAWYER' ? '#16a30b' : '#e0e0e0',
              borderRadius: 2,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              bgcolor: profile === 'LAWYER' ? '#f5fbf5' : 'transparent',
              transition: 'all 0.2s',
              '&:hover': { borderColor: '#16a30b', bgcolor: '#f5fbf5' }
            }}
          >
            <Gavel sx={{ fontSize: 32, color: profile === 'LAWYER' ? '#16a30b' : '#757575', mb: 1 }} />
            <Typography variant='body1' fontWeight='bold' sx={{ color: profile === 'LAWYER' ? '#16a30b' : '#424242' }}>
              Sou Advogado
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Buscar novos casos
            </Typography>
          </Box>

          <Box 
            onClick={() => setProfile('CLIENT')}
            sx={{ 
              flex: 1, 
              border: '1px solid',
              borderColor: profile === 'CLIENT' ? '#16a30b' : '#e0e0e0',
              borderRadius: 2,
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              bgcolor: profile === 'CLIENT' ? '#f5fbf5' : 'transparent',
              transition: 'all 0.2s',
              '&:hover': { borderColor: '#16a30b', bgcolor: '#f5fbf5' }
            }}
          >
            <BusinessCenter sx={{ fontSize: 32, color: profile === 'CLIENT' ? '#16a30b' : '#757575', mb: 1 }} />
            <Typography variant='body1' fontWeight='bold' sx={{ color: profile === 'CLIENT' ? '#16a30b' : '#424242' }}>
              Quero Contratar
            </Typography>
            <Typography variant='caption' color='text.secondary'>
              Encontrar especialistas
            </Typography>
          </Box>
        </Box>

        <Box component='form' onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, width: '100%' }}>
          <Box>
            <Typography variant='caption' fontWeight='bold' color='text.secondary' sx={{ mb: 1, display: 'block', letterSpacing: 1 }}>
              Nome Completo
            </Typography>
            <TextField 
              fullWidth 
              type='text' 
              placeholder='Ex: Dr. Roberto Silva'
              required 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              InputProps={{ sx: { borderRadius: 2 } }}
            />
          </Box>

          <Box>
            <Typography variant='caption' fontWeight='bold' color='text.secondary' sx={{ mb: 1, display: 'block', letterSpacing: 1 }}>
              E-mail Profissional
            </Typography>
            <TextField 
              fullWidth 
              type='email' 
              placeholder='nome@exemplo.com'
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              InputProps={{ sx: { borderRadius: 2 } }}
            />
          </Box>

          <Box>
            <Typography variant='caption' fontWeight='bold' color='text.secondary' sx={{ mb: 1, display: 'block', letterSpacing: 1 }}>
              Crie sua Senha
            </Typography>
            <TextField 
              fullWidth 
              type='password' 
              placeholder='Mínimo 8 caracteres'
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{ sx: { borderRadius: 2 } }}
            />
          </Box>

          <FormControlLabel
            control={
              <Checkbox 
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                sx={{ color: '#bdbdbd', '&.Mui-checked': { color: '#16a30b' } }}
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                Eu concordo com os <Link href="#" underline="hover" sx={{ color: '#16a30b' }}>Termos de Uso</Link> e a <Link href="#" underline="hover" sx={{ color: '#16a30b' }}>Política de Privacidade</Link> da Legal Work.
              </Typography>
            }
            sx={{ alignItems: 'flex-start', mt: 1 }}
          />

          {error && (
            <Typography color='error' variant='body2' sx={{ textAlign: 'center' }}>
              {error}
            </Typography>
          )}

          <Button 
            fullWidth 
            variant='contained' 
            type='submit' 
            disabled={loading} 
            sx={{ 
              mt: 1, 
              py: 1.5,
              backgroundColor: '#16a30b', 
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: 'bold',
              borderRadius: 2,
              '&:hover': { backgroundColor: '#128209' } 
            }}
          >
            {loading ? <CircularProgress size={24} color='inherit' /> : 'Criar Conta'}
          </Button>

          <Typography variant='body2' sx={{ textAlign: 'center', color: 'text.secondary', mt: 2, pb: 1, borderBottom: '1px solid #eee' }}>
            Já possui uma conta? {' '}
            <Link component={RouterLink} to='/login' underline='hover' sx={{ color: '#16a30b', fontWeight: 'bold' }}>
              Fazer Login
            </Link>
          </Typography>
        </Box>
      </Paper>
    </AuthLayout>
  );
}
