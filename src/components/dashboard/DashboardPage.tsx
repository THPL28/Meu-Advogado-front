import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Chip,
  Divider,
  Avatar,
  Rating,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Gavel as GavelIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Payments as PaymentsIcon,
  Star as StarIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { apiGet } from '../../services/api';

interface ActivityItem {
  type: string;
  id: number;
  title: string;
  status: string;
  date: string;
  role: string;
  otherParty: string;
}

interface Metrics {
  userId: number;
  activeContracts: number;
  completedContracts: number;
  terminatedContracts: number;
  totalPaid: number;
  totalReceived: number;
  pendingProposals: number;
  proposalsForMyCases: number;
  averageRating: number;
  totalReviews: number;
  unreadNotifications: number;
  recentActivity: ActivityItem[];
}

const statusColors: Record<string, 'success' | 'info' | 'warning' | 'error' | 'default'> = {
  Active: 'success',
  Completed: 'info',
  Terminated: 'warning',
  Cancelled: 'error',
};

const statusLabels: Record<string, string> = {
  Active: 'Ativo',
  Completed: 'Concluído',
  Terminated: 'Encerrado',
  Cancelled: 'Cancelado',
};

export function DashboardPage() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    try {
      setLoading(true);
      const response = await apiGet<{ success: boolean; data: Metrics }>('/api/dashboard/metrics');
      if (response?.success && response.data) {
        setMetrics(response.data);
      }
    } catch {
      setError('Erro ao carregar métricas do dashboard.');
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Carregando dashboard...</Typography>
      </Container>
    );
  }

  if (error || !metrics) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Erro ao carregar dados.'}</Alert>
        <Button onClick={loadMetrics} variant="contained" sx={{ mt: 2 }}>
          Tentar novamente
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <DashboardIcon color="primary" sx={{ fontSize: 36 }} />
        <Typography variant="h4" fontWeight="bold">
          Dashboard
        </Typography>
      </Box>

      {/* Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
              borderLeft: 4,
              borderColor: 'success.main',
            }}
            onClick={() => navigate('/contracts')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold" color="success.main">
                    {metrics.activeContracts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Mandatos Ativos
                  </Typography>
                </Box>
                <GavelIcon color="success" sx={{ fontSize: 40, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
              borderLeft: 4,
              borderColor: 'info.main',
            }}
            onClick={() => navigate('/contracts')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold" color="info.main">
                    {metrics.completedContracts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Concluídos
                  </Typography>
                </Box>
                <CheckCircleIcon color="info" sx={{ fontSize: 40, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
              borderLeft: 4,
              borderColor: 'warning.main',
            }}
            onClick={() => navigate('/payments')}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  {metrics.totalReceived > 0 ? (
                    <>
                      <Typography variant="h5" fontWeight="bold" color="warning.main">
                        {formatCurrency(metrics.totalReceived)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Recebido
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="h5" fontWeight="bold" color="warning.main">
                        {formatCurrency(metrics.totalPaid)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Pago
                      </Typography>
                    </>
                  )}
                </Box>
                <PaymentsIcon color="warning" sx={{ fontSize: 40, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{
              transition: 'all 0.2s',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
              borderLeft: 4,
              borderColor: 'primary.main',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold" color="primary.main">
                    {metrics.averageRating > 0 ? metrics.averageRating.toFixed(1) : '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Avaliação Média
                  </Typography>
                  {metrics.averageRating > 0 && (
                    <Rating value={metrics.averageRating} precision={0.5} readOnly size="small" sx={{ mt: 0.5 }} />
                  )}
                </Box>
                <StarIcon color="primary" sx={{ fontSize: 40, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Secondary Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUpIcon color="primary" />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {metrics.pendingProposals}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Propostas Pendentes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <NotificationsIcon color="primary" />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {metrics.unreadNotifications}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Notificações Não Lidas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CheckCircleIcon color="info" />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {metrics.totalReviews}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Avaliações Recebidas
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card variant="outlined">
            <CardContent sx={{ py: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <CancelIcon color="warning" />
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {metrics.terminatedContracts}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Mandatos Encerrados
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TrendingUpIcon color="primary" />
        Atividade Recente
      </Typography>

      {metrics.recentActivity.length === 0 ? (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              Nenhuma atividade recente.
            </Typography>
            <Button
              variant="contained"
              sx={{ mt: 2 }}
              onClick={() => navigate('/jobs')}
            >
              Explorar Casos Jurídicos
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          {metrics.recentActivity.map((activity, index) => (
            <Box
              key={index}
              sx={{
                p: 2,
                cursor: 'pointer',
                '&:hover': { backgroundColor: 'action.hover' },
                borderBottom: index < metrics.recentActivity.length - 1 ? 1 : 0,
                borderColor: 'divider',
              }}
              onClick={() => navigate(`/contracts/${activity.id}`)}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: activity.role === 'client' ? 'primary.light' : 'secondary.light',
                    width: 40,
                    height: 40,
                  }}
                >
                  {activity.role === 'client' ? <GavelIcon /> : <GavelIcon />}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {activity.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {activity.role === 'client' ? 'Advogado:' : 'Cliente:'} {activity.otherParty}
                    {' · '}
                    {formatDate(activity.date)}
                  </Typography>
                </Box>
                <Chip
                  label={statusLabels[activity.status] || activity.status}
                  color={statusColors[activity.status] || 'default'}
                  size="small"
                />
                <ArrowForwardIcon color="action" fontSize="small" />
              </Box>
            </Box>
          ))}
        </Card>
      )}
    </Container>
  );
}
