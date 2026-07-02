import { AppBar, Toolbar } from '@mui/material';
import { Container, styled } from '@mui/system';
import { useNavigate } from 'react-router-dom';
import Navbar from '../navigation/Navbar';
import { getAuthState } from '../../services/authService';

const Logo = styled('img')({
  height: '50px',
  marginRight: '16px',
  cursor: 'pointer',
});

const Header = () => {
  const navigate = useNavigate();
  const { isLoggedIn, email } = getAuthState();

  const onClick = () => {
    navigate('/');
  };

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
