import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { green } from '@mui/material/colors';

const Hero = () => {
  return (
    <Container
      component='section'
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flex: '1',
        gap: '2rem',
        py: { xs: 4, md: 8 },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          maxWidth: 560,
          '@media (max-width: 1040px)': {
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
          },
        }}
      >
        <Typography component='h1' variant='h3' fontWeight='bold' color='text.primary'>
          Conecte clientes e advogados em um só lugar
        </Typography>
        <Typography component='p' variant='body1' color='text.secondary'>
          Acompanhe casos, envie propostas, organize contratos e acompanhe pagamentos com uma experiência simples e segura.
        </Typography>
        <Button
          component={RouterLink}
          to='/login'
          variant='contained'
          sx={{
            width: { xs: '100%', sm: 'fit-content' },
            px: 3,
            py: 1.2,
            borderRadius: 3,
            backgroundColor: green[700],
            '&:hover': { backgroundColor: green[800] },
          }}
        >
          Acessar plataforma
        </Button>
      </Box>
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          '@media (max-width: 1040px)': {
            display: 'none',
          },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 480,
            minHeight: 320,
            borderRadius: 4,
            background: 'linear-gradient(135deg, #eaf6ea 0%, #d5ead3 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 12px 32px rgba(0,0,0,0.08)',
          }}
        >
          <Typography variant='h5' fontWeight='bold' color={green[800]}>
            Meu Advogado
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};
export default Hero;
