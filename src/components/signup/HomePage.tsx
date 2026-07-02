import { Box, Button, Container, Grid, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Footer from '../Shared/Footer';
import Hero from './Hero';
import { getAuthState } from '../../services/authService';
import { green, grey } from '@mui/material/colors';

const categories = [
  { title: 'Direito Civil', jobs: 1243, icon: '⚖️' },
  { title: 'Direito Penal', jobs: 856, icon: '🔒' },
  { title: 'Direito Trabalhista', jobs: 2102, icon: '👷' },
  { title: 'Direito de Família', jobs: 1567, icon: '👨‍👩‍👧‍👦' },
  { title: 'Direito Tributário', jobs: 678, icon: '📋' },
  { title: 'Direito Empresarial', jobs: 934, icon: '🏢' },
];

const howItWorksLawyer = [
  { step: '1', title: 'Criar Conta', desc: 'Cadastre-se como advogado e crie seu perfil profissional' },
  { step: '2', title: 'Encontrar Casos', desc: 'Navegue por casos jurídicos compatíveis com sua especialidade' },
  { step: '3', title: 'Enviar Proposta', desc: 'Envie sua proposta com valor e estratégia' },
  { step: '4', title: 'Receber Pagamento', desc: 'Conclua o serviço e receba de forma segura' },
];

const howItWorksClient = [
  { step: '1', title: 'Publicar Caso', desc: 'Descreva seu caso jurídico e defina seu orçamento' },
  { step: '2', title: 'Receber Propostas', desc: 'Advogados especializados enviam propostas' },
  { step: '3', title: 'Contratar', desc: 'Escolha o melhor advogado para o seu caso' },
  { step: '4', title: 'Pagar com Segurança', desc: 'Só libere o pagamento quando estiver satisfeito' },
];

const stats = [
  { value: '500+', label: 'Advogados' },
  { value: '1K+', label: 'Clientes' },
  { value: '2K+', label: 'Casos Resolvidos' },
  { value: 'R$ 5M+', label: 'Honorários Pagos' },
];

const HomePage = () => {
  const { isLoggedIn } = getAuthState();

  return (
    <Box display='flex' flexDirection='column' flex='1'>
      <Hero />
      
      {/* Stats Section */}
      <Box sx={{ backgroundColor: green[700], py: 6, color: 'white' }}>
        <Container>
          <Grid container spacing={4} justifyContent='center'>
            {stats.map((stat) => (
              <Grid item xs={6} md={3} key={stat.label}>
                <Box textAlign='center'>
                  <Typography variant='h3' fontWeight='bold'>{stat.value}</Typography>
                  <Typography variant='subtitle1'>{stat.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Categories Section */}
      <Container sx={{ py: 8 }}>
        <Typography variant='h4' textAlign='center' gutterBottom fontWeight='bold'>
          Especialidades Jurídicas
        </Typography>
        <Typography variant='body1' textAlign='center' color='text.secondary' sx={{ mb: 4 }}>
          Encontre o advogado ideal para o seu caso
        </Typography>
        <Grid container spacing={3}>
          {categories.map((cat) => (
            <Grid item xs={12} sm={6} md={4} key={cat.title}>
              <Box
                sx={{
                  p: 3,
                  border: `1px solid ${grey[300]}`,
                  borderRadius: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    borderColor: green[500],
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography variant='h3' sx={{ mb: 1 }}>{cat.icon}</Typography>
                <Typography variant='h6' fontWeight='bold'>{cat.title}</Typography>
                <Typography variant='body2' color='text.secondary'>{cat.jobs.toLocaleString()} casos disponíveis</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works - For Lawyers */}
      <Box sx={{ backgroundColor: grey[100], py: 8 }}>
        <Container>
          <Typography variant='h4' textAlign='center' gutterBottom fontWeight='bold'>
            Para Advogados
          </Typography>
          <Typography variant='body1' textAlign='center' color='text.secondary' sx={{ mb: 4 }}>
            Como começar a atender na plataforma
          </Typography>
          <Grid container spacing={4}>
            {howItWorksLawyer.map((item) => (
              <Grid item xs={12} sm={6} md={3} key={item.step}>
                <Box textAlign='center'>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      backgroundColor: green[700],
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                      fontSize: 24,
                      fontWeight: 'bold',
                    }}
                  >
                    {item.step}
                  </Box>
                  <Typography variant='h6' fontWeight='bold'>{item.title}</Typography>
                  <Typography variant='body2' color='text.secondary'>{item.desc}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          {!isLoggedIn && (
            <Box textAlign='center' mt={4}>
              <Button
                component={RouterLink}
                to='/signup/lawyer'
                variant='contained'
                size='large'
                sx={{ backgroundColor: green[700], '&:hover': { backgroundColor: green[800] } }}
              >
                Cadastrar como Advogado
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* How It Works - For Clients */}
      <Container sx={{ py: 8 }}>
        <Typography variant='h4' textAlign='center' gutterBottom fontWeight='bold'>
          Para Clientes
        </Typography>
        <Typography variant='body1' textAlign='center' color='text.secondary' sx={{ mb: 4 }}>
          Como contratar o melhor advogado
        </Typography>
        <Grid container spacing={4}>
          {howItWorksClient.map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item.step}>
              <Box textAlign='center'>
                <Box
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: green[700],
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    fontSize: 24,
                    fontWeight: 'bold',
                  }}
                >
                  {item.step}
                </Box>
                <Typography variant='h6' fontWeight='bold'>{item.title}</Typography>
                <Typography variant='body2' color='text.secondary'>{item.desc}</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>          {!isLoggedIn && (
            <Box textAlign='center' mt={4}>
              <Button
                component={RouterLink}
                to='/signup/client'
                variant='outlined'
                size='large'
                sx={{ borderColor: green[700], color: green[700], '&:hover': { borderColor: green[800], backgroundColor: green[50] } }}
              >
                Cadastrar como Cliente
              </Button>
            </Box>
          )}
      </Container>

      <Footer />
    </Box>
  );
};

export default HomePage;
