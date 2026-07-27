import { AppBar, Toolbar } from '@mui/material';
import { Container, styled } from '@mui/system';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../navigation/Navbar';
import { getAuthState } from '../../services/authService';

const Logo = styled('img')({
  height: '50px',
  marginRight: '16px',
  cursor: 'pointer',
});

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn, email } = getAuthState();

  const onClick = () => {
    navigate('/');
  };

  const isAuthRoute = location.pathname === '/login' || location.pathname === '/' || location.pathname === '/reset-password' || location.pathname === '/password-sent' || location.pathname.startsWith('/signup');
  if (isAuthRoute) {
    return null;
  }

  return (
    <Container>
      <AppBar
        position='static'
        sx={{
          backgroundColor: 'white',
          width: '100%',
          boxShadow: 'none',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Toolbar>
          <Logo
            src='/images/download.png'
            alt='Logo'
            sx={{ height: '28px' }}
            onClick={onClick}
          />
        </Toolbar>
        <Navbar isUser={isLoggedIn} userEmail={email} />
      </AppBar>
    </Container>
  );
};

export default Header;
