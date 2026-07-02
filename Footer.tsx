import { Box, Container, Link, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { GitHub } from '@mui/icons-material';
const Footer = () => {
  return (
    <Box
      py={4}
      bgcolor='black'
      color='white'
      textAlign='center'
      component='footer'
    >
      <Container maxWidth='md'>
        <Typography variant='h6' component='div' gutterBottom>
          Conecte-se Connosco
        </Typography>
        <Box display='flex' justifyContent='center' alignItems='center' gap={4}>
          <Link underline='hover' component={RouterLink} to='/' color='inherit'>
            Sobre nós
          </Link>
          <Link
            underline='hover'
            href='https://github.com/fernandoquipiaca007-commits/Meu-Advogado-front'
            color='inherit'
          >
            <GitHub />
          </Link>
        </Box>
        <Typography variant='body2' color='inherit' mt={2}>
          © {new Date().getFullYear()} LegalWork. Todos os direitos reservados.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;
