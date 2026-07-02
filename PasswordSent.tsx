/* eslint-disable react/no-unescaped-entities */
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Button, Paper, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const PasswordSent = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        width: '100vw', // Full width of the viewport
        height: '100vh', // Full height of the viewport
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff', // Changed to white
        position: 'relative', // Enable absolute positioning for children
      }}
    >
      <Paper
        elevation={3}
        sx={{
          textAlign: 'center',
          height: '400px',
          maxWidth: '400px',
          position: 'relative', // Enable absolute positioning inside
          padding: '20px',
        }}
      >
        {/* Back Button in Top Left Corner */}
        <Button
          onClick={() => navigate('/reset-password')}
          style={{
            position: 'absolute',
            top: '16px', // Adjust as needed
            left: '16px', // Adjust as needed
            fontSize: '14px',
            color: 'green',
            backgroundColor: 'white',
          }}
        >
          <ArrowBackIcon />
        </Button>

        <Typography
          variant='h4'
          color='green'
          gutterBottom
          style={{
            paddingTop: '80px', // Space for the button
            paddingBottom: '40px',
          }}
        >
          Password Sent
        </Typography>
        <Typography variant='body1'>
          Um email foi enviado para o endereço informado. Se este email
          estiver registado no LegalWork, receberá instruções para definir
          uma nova senha.
        </Typography>
        <Typography
          variant='body2'
          color='green'
          style={{ cursor: 'pointer', marginTop: '16px' }}
          onClick={() => navigate('/reset-password')}
          onMouseEnter={(e) =>
            ((e.target as HTMLElement).style.textDecoration = 'underline')
          }
          onMouseLeave={(e) =>
            ((e.target as HTMLElement).style.textDecoration = 'none')
          }
        >
          Didn’t get an email?
        </Typography>
      </Paper>
    </div>
  );
};

export default PasswordSent;
