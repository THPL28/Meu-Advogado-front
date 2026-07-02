import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
const Hero = () => {
  return (
    <Container
      component='section'
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        flex: '1',
        gap: '1rem',
        marginTop: '5rem',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          '@media (max-width: 1040px)': {
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
          },
        }}
      >
        <Typography component='h1' variant='h2'>
          A plataforma jurídica mais completa
        </Typography>
        <Typography component='p'>
          Conectamos clientes aos melhores advogados. Publique seu caso, receba
          propostas, acompanhe o progresso e pague com segurança.
        </Typography>
        <Button
          sx={{
            width: '30%',
            color: 'white',
            padding: '.5rem 1rem',
          }}
        >
          <RouterLink style={{ color: 'white', textDecoration: 'none' }} to='/signup/client'>
            Começar agora
          </RouterLink>
        </Button>
      </Box>
      <Box
        sx={{
          '@media (max-width: 1040px)': {
            display: 'none',
          },
        }}
      >
        <img
          style={{
            width: '100%',
            height: '100%',
          }}
          src='./images/hero-section-img.png'
        />
      </Box>
    </Container>
  );
};
export default Hero;
