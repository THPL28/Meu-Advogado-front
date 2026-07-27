import { Box, Typography, Link as MuiLink } from '@mui/material';
import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#fbfbfb' }}>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', py: 8 }}>
        {children}
      </Box>
      <Box 
        component="footer"
        sx={{ 
          backgroundColor: '#333333', 
          color: '#a0a0a0', 
          py: 4, 
          px: { xs: 3, md: 8 }, 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'center', md: 'flex-start' }, mb: { xs: 3, md: 0 } }}>
          <Typography variant="h5" sx={{ color: '#16a30b', fontWeight: 900, letterSpacing: 1, fontFamily: 'Rubik, sans-serif' }}>
            LWORK
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, fontSize: '0.85rem' }}>
            © 2024 Legal Work. Todos os direitos reservados.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: { xs: 2, md: 4 }, flexWrap: 'wrap', justifyContent: 'center' }}>
          <MuiLink href="#" color="inherit" underline="none" sx={{ fontSize: '0.9rem', '&:hover': { color: '#fff' } }}>Privacidade</MuiLink>
          <MuiLink href="#" color="inherit" underline="none" sx={{ fontSize: '0.9rem', '&:hover': { color: '#fff' } }}>Termos de Uso</MuiLink>
          <MuiLink href="#" color="inherit" underline="none" sx={{ fontSize: '0.9rem', '&:hover': { color: '#fff' } }}>Contato</MuiLink>
          <MuiLink href="#" color="inherit" underline="none" sx={{ fontSize: '0.9rem', '&:hover': { color: '#fff' } }}>Blog</MuiLink>
        </Box>
      </Box>
    </Box>
  );
}
