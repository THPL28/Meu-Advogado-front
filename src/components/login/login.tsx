import { Box, Button, CircularProgress, Link, Paper, TextField, Typography, Divider, InputAdornment } from '@mui/material';
import { FormEvent, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { login } from '../../services/authService';
import { MailOutline, LockOutlined, Login as LoginIcon, SecurityOutlined } from '@mui/icons-material';
import AuthLayout from '../Shared/AuthLayout';

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
    <AuthLayout>
      <Paper
        elevation={0}
        sx={{
          width: { xs: '90%', sm: 460 },
          p: { xs: 3, md: 5 },
          borderRadius: 2,
          border: '1px solid #e0e0e0',
          boxShadow: '0px 10px 30px rgba(0, 0, 0, 0.03)',
        }}
      >
        <Box component='form' onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box>
            <Typography variant='caption' fontWeight='bold' color='text.secondary' sx={{ mb: 1, display: 'block', letterSpacing: 1 }}>
              E-MAIL CORPORATIVO
            </Typography>
            <TextField 
              fullWidth 
              type='email' 
              placeholder='exemplo@legalwork.com.br'
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutline sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant='caption' fontWeight='bold' color='text.secondary' sx={{ letterSpacing: 1 }}>
                SENHA
              </Typography>
              <Link component={RouterLink} to='/reset-password' underline='hover' sx={{ variant: 'caption', fontSize: '0.8rem', color: '#16a30b', fontWeight: 'bold' }}>
                Esqueceu a senha?
              </Link>
            </Box>
            <TextField 
              fullWidth 
              type='password' 
              placeholder='••••••••'
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                sx: { borderRadius: 2 }
              }}
            />
          </Box>

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
            endIcon={!loading && <LoginIcon />}
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
            {loading ? <CircularProgress size={24} color='inherit' /> : 'Entrar'}
          </Button>

          <Divider sx={{ my: 1 }} />

          <Typography variant='body2' sx={{ textAlign: 'center', color: 'text.secondary' }}>
            Não possui uma conta? {' '}
            <Link component={RouterLink} to='/' underline='hover' sx={{ color: '#16a30b', fontWeight: 'bold' }}>
              Criar conta
            </Link>
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ mt: 4, display: 'flex', alignItems: 'center', gap: 1, color: '#9e9e9e' }}>
        <SecurityOutlined fontSize="small" />
        <Typography variant='body2' sx={{ letterSpacing: 1, fontWeight: 'bold', fontSize: '0.8rem' }}>
          Ambiente Seguro & Criptografado
        </Typography>
      </Box>
    </AuthLayout>
  );
}
