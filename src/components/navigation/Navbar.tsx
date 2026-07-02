import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { logout } from '../../services/authService';

interface NavbarProps {
  isUser: boolean;
  userEmail?: string | null;
  onLogout?: () => void;
}

const NonUserNavbar = () => {
  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Button
        component={Link}
        to='/login'
        sx={{
          color: 'black',
          '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' },
        }}
      >
        Login
      </Button>
      <Button
        component={Link}
        to='/'
        variant='contained'
        sx={{
          backgroundColor: '#129900',
          '&:hover': { backgroundColor: '#0f7a00' },
        }}
      >
        Sign Up
      </Button>
    </Box>
  );
};

const UserNavbar = ({ userEmail, onLogout }: { userEmail?: string | null; onLogout?: () => void }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    if (onLogout) await onLogout();
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Button
        component={Link}
        to='/home'
        sx={{ color: 'black' }}
      >
        Home
      </Button>
      <Button
        component={Link}
        to='/jobs'
        sx={{ color: 'black' }}
      >
        Find Jobs
      </Button>
      <Button
        component={Link}
        to='/settings/contact-info'
        sx={{ color: 'black' }}
      >
        Profile
      </Button>
      <IconButton
        size='large'
        onClick={handleMenu}
        color='inherit'
      >
        <MenuIcon />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem disabled>
          <Typography variant='body2' color='text.secondary'>
            {userEmail || 'User'}
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); navigate('/settings/contact-info'); }}>
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          Logout
        </MenuItem>
      </Menu>
    </Box>
  );
};

const Navbar = ({ isUser = false, userEmail = null, onLogout }: NavbarProps) => {
  if (!isUser) return <NonUserNavbar />;
  return <UserNavbar userEmail={userEmail} onLogout={onLogout} />;
};

export default Navbar;
