import { Container } from '@mui/material';
import { isClient } from '../../services/authService';
import { ClientDashboard } from './ClientDashboard';
import { LawyerDashboard } from './LawyerDashboard';

export function DashboardPage() {
  const userIsClient = isClient();

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {userIsClient ? <ClientDashboard /> : <LawyerDashboard />}
    </Container>
  );
}
