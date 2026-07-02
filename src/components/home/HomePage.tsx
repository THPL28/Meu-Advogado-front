import { Box, Button, Container, Grid, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import Footer from '../Shared/Footer';
import Hero from './Hero';
import { getAuthState } from '../../services/authService';
import { green, grey } from '@mui/material/colors';

const categories = [
  { title: 'Web Development', jobs: 1243, icon: '💻' },
  { title: 'Mobile Development', jobs: 856, icon: '📱' },
  { title: 'Design & Creative', jobs: 2102, icon: '🎨' },
  { title: 'Writing & Translation', jobs: 1567, icon: '✍️' },
  { title: 'Data Science & Analytics', jobs: 678, icon: '📊' },
  { title: 'Marketing & SEO', jobs: 934, icon: '📈' },
];

const howItWorksFreelancer = [
  { step: '1', title: 'Create Account', desc: 'Sign up as a freelancer and build your profile' },
  { step: '2', title: 'Find Work', desc: 'Browse jobs that match your skills and expertise' },
  { step: '3', title: 'Submit Proposal', desc: 'Apply to jobs with your bid and portfolio' },
  { step: '4', title: 'Get Paid', desc: 'Complete work and receive payments securely' },
];

const howItWorksClient = [
  { step: '1', title: 'Post a Job', desc: 'Describe your project and set your budget' },
  { step: '2', title: 'Review Proposals', desc: 'Get bids from qualified freelancers' },
  { step: '3', title: 'Hire', desc: 'Choose the best freelancer for your project' },
  { step: '4', title: 'Pay Safely', desc: 'Only pay when you are satisfied with the work' },
];

const stats = [
  { value: '500K+', label: 'Freelancers' },
  { value: '100K+', label: 'Clients' },
  { value: '2M+', label: 'Jobs Posted' },
  { value: '$1B+', label: 'Earned by Freelancers' },
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
          Browse Top Categories
        </Typography>
        <Typography variant='body1' textAlign='center' color='text.secondary' sx={{ mb: 4 }}>
          Find the perfect freelancer for your project
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
                <Typography variant='body2' color='text.secondary'>{cat.jobs.toLocaleString()} jobs available</Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works - For Freelancers */}
      <Box sx={{ backgroundColor: grey[100], py: 8 }}>
        <Container>
          <Typography variant='h4' textAlign='center' gutterBottom fontWeight='bold'>
            For Freelancers
          </Typography>
          <Typography variant='body1' textAlign='center' color='text.secondary' sx={{ mb: 4 }}>
            How to start earning on our platform
          </Typography>
          <Grid container spacing={4}>
            {howItWorksFreelancer.map((item) => (
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
                to='/signup/freelancer'
                variant='contained'
                size='large'
                sx={{ backgroundColor: green[700], '&:hover': { backgroundColor: green[800] } }}
              >
                Start as Freelancer
              </Button>
            </Box>
          )}
        </Container>
      </Box>

      {/* How It Works - For Clients */}
      <Container sx={{ py: 8 }}>
        <Typography variant='h4' textAlign='center' gutterBottom fontWeight='bold'>
          For Clients
        </Typography>
        <Typography variant='body1' textAlign='center' color='text.secondary' sx={{ mb: 4 }}>
          How to hire the best talent
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
        </Grid>
        {!isLoggedIn && (
          <Box textAlign='center' mt={4}>
            <Button
              component={RouterLink}
              to='/signup/client'
              variant='outlined'
              size='large'
              sx={{ borderColor: green[700], color: green[700], '&:hover': { borderColor: green[800], backgroundColor: green[50] } }}
            >
              Start as Client
            </Button>
          </Box>
        )}
      </Container>

      <Footer />
    </Box>
  );
};

export default HomePage;
