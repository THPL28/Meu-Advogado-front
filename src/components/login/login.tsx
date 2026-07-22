import { Box, Button, CircularProgress, Link, Paper, TextField, Typography } from '@mui/material';
import { FormEvent, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';
import { green } from '@mui/material/colors';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Informe seu e-mail e senha.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha no login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f5f8f4', py: 6, px: 2 }}>
      <Paper
        elevation={0}
        sx={{
          width: { xs: '100%', sm: 420 },
          mx: 'auto',
          p: { xs: 3, md: 4 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 12px 40px rgba(16, 63, 19, 0.08)',
        }}
      >
        <Typography variant='h5' fontWeight='bold' textAlign='center' color={green[800]}>
          Acesse sua conta
        </Typography>
        <Typography variant='body2' textAlign='center' color='text.secondary' sx={{ mt: 1, mb: 2 }}>
          Entre para gerenciar seus casos, propostas e contratos.
        </Typography>

        <Box component='form' onSubmit={handleSubmit}>
          <TextField fullWidth label='E-mail' type='email' margin='normal' required value={email} onChange={(e) => setEmail(e.target.value)} />
          <TextField fullWidth label='Senha' type='password' margin='normal' required value={password} onChange={(e) => setPassword(e.target.value)} />

          {error && (
            <Typography color='error' variant='body2' sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Button fullWidth variant='contained' type='submit' disabled={loading} sx={{ mt: 2, backgroundColor: green[700], '&:hover': { backgroundColor: green[800] } }}>
            {loading ? <CircularProgress size={24} color='inherit' /> : 'Entrar'}
          </Button>
        </Box>

        <Box sx={{ textAlign: 'center', mt: 2, display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Typography variant='body2'>
            <Link component={RouterLink} to='/' underline='hover'>Criar conta</Link>
          </Typography>
          <Typography variant='body2'>
            <Link component={RouterLink} to='/reset-password' underline='hover'>Esqueci minha senha</Link>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
