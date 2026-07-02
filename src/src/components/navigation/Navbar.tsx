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
import GavelIcon from '@mui/icons-material/Gavel';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PaymentsIcon from '@mui/icons-material/Payments';
import RateReviewIcon from '@mui/icons-material/RateReview';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { logout, isLawyer, isClient, isFirm } from '../../services/authService';
import { NotificationBell } from '../notifications/NotificationBell';

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
        Entrar
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
        Cadastrar
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
        Início
      </Button>

      <Button
        component={Link}
        to='/dashboard'
        startIcon={<DashboardIcon />}
        sx={{ color: 'black' }}
      >
        Dashboard
      </Button>

      {isLawyer() && (
        <Button
          component={Link}
          to='/jobs'
          startIcon={<GavelIcon />}
          sx={{ color: 'black' }}
        >
          Encontrar Casos
        </Button>
      )}

      {isClient() && (
        <Button
          component={Link}
          to='/jobs'
          startIcon={<WorkIcon />}
          sx={{ color: 'black' }}
        >
          Publicar Caso
        </Button>
      )}

      {isFirm() && (
        <Button
          component={Link}
          to='/jobs'
          startIcon={<BusinessIcon />}
          sx={{ color: 'black' }}
        >
          Gerir Casos
        </Button>
      )}

      {(isLawyer() || isClient()) && (
        <Button
          component={Link}
          to='/contracts'
          startIcon={<AssignmentIcon />}
          sx={{ color: 'black' }}
        >
          Mandatos
        </Button>
      )}

      {(isLawyer() || isClient()) && (
        <Button
          component={Link}
          to='/payments'
          startIcon={<PaymentsIcon />}
          sx={{ color: 'black' }}
        >
          Pagamentos
        </Button>
      )}

      {(isLawyer() || isClient()) && (
        <Button
          component={Link}
          to='/reviews'
          startIcon={<RateReviewIcon />}
          sx={{ color: 'black' }}
        >
          Avaliações
        </Button>
      )}

      <Button
        component={Link}
        to='/settings/contact-info'
        sx={{ color: 'black' }}
      >
        Perfil
      </Button>
      <NotificationBell />
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
            {userEmail || 'Utilizador'}
          </Typography>
        </MenuItem>
        <MenuItem onClick={() => { handleClose(); navigate('/settings/contact-info'); }}>
          Definições
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          Sair
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
