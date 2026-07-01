import { Box, Button, CircularProgress, Link, Paper, TextField, Typography } from '@mui/material';
import { FormEvent, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { apiRequest } from '../../services/api';

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
      setError('Email and password are required');
      return;
    }

    setLoading(true);
    try {
      await apiRequest<string>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      }, true);
      navigate('/home');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className='login'>
      <Paper
        elevation={3}
        sx={{
          width: 300,
          mx: 'auto',
          mt: 10,
          p: 3,
        }}
      >
        <Typography
          variant='h6'
          gutterBottom
          sx={{
            textAlign: 'center',
            fontSize: 33,
            fontWeight: 'normal',
            color: '#129900',
            position: 'relative',
            display: 'inline-block',
            transform: 'translateX(-50%)',
            left: '50%',
            '&::after': {
              content: '""',
              display: 'block',
              width: '100%',
              height: '2px',
              backgroundColor: '#129900',
              margin: '8px auto 0',
            },
          }}
        >
          Login
        </Typography>

        <Box component='form' onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label='Email'
            type='email'
            variant='outlined'
            margin='normal'
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            fullWidth
            label='Password'
            type='password'
            variant='outlined'
            margin='normal'
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <Typography color='error' variant='body2' sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}

          <Button
            fullWidth
            variant='contained'
            color='primary'
            type='submit'
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? <CircularProgress size={24} color='inherit' /> : 'Login'}
          </Button>
        </Box>

        <Box
          sx={{
            textAlign: 'center',
            mt: 2,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant='body2'>
            <Link
              component={RouterLink}
              to={'/'}
              underline='hover'
            >
              Sign Up
            </Link>
          </Typography>
          <Typography variant='body2'>
            <Link
              component={RouterLink}
              to={'/reset-password'}
              underline='hover'
            >
              Forgot Password ?
            </Link>
          </Typography>
        </Box>
      </Paper>
    </div>
  );
}
