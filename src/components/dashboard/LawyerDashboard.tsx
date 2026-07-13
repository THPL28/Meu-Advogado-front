import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Rating,
} from '@mui/material';
import {
  Gavel as GavelIcon,
  Assignment as AssignmentIcon,
  Payments as PaymentsIcon,
  Search as SearchIcon,
  Star as StarIcon,
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

interface Proposal {
  proposalId: number;
  jobId: number;
  jobTitle: string;
  bidAmount: number;
  coverLetter: string;
  status: string;
  createdAt: string;
}

export function LawyerDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const metricsResponse = await apiGet<{ success: boolean; data: Metrics }>('/api/dashboard/metrics');
      const proposalsResponse = await apiGet<{ success: boolean; data: Proposal[] }>('/api/proposals/my');

      if (metricsResponse?.success && metricsResponse.data) {
        setMetrics(metricsResponse.data);
      }
      if (proposalsResponse?.success && proposalsResponse.data) {
        setProposals(proposalsResponse.data);
      }
    } catch {
      setError('Erro ao carregar dados do painel do advogado.');
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const statusLabels: Record<string, string> = {
    Pending: 'Pendente',
    Accepted: 'Aceita',
    Rejected: 'Rejeitada',
    Withdrawn: 'Retirada',
  };

  const statusColors: Record<string, 'default' | 'success' | 'error' | 'warning'> = {
    Pending: 'warning',
    Accepted: 'success',
    Rejected: 'error',
    Withdrawn: 'default',
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !metrics) {
    return (
      <Box sx={{ mt: 2 }}>
        <Alert severity="error">{error || 'Erro ao carregar dados.'}</Alert>
        <Button onClick={loadDashboardData} variant="contained" sx={{ mt: 2 }}>
          Tentar novamente
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header and Call to Action */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="text.primary">
            Painel do Advogado
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Encontre novos casos, acompanhe suas propostas enviadas e gerencie mandatos ativos.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<SearchIcon />}
          onClick={() => navigate('/jobs')}
          sx={{
            px: 3,
            py: 1.2,
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(18, 153, 0, 0.2)',
          }}
        >
          Buscar Casos Jurídicos
        </Button>
      </Box>

      {/* Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: 'success.main', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold" color="success.main">
                    {metrics.activeContracts}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    Mandatos Ativos
                  </Typography>
                </Box>
                <GavelIcon color="success" sx={{ fontSize: 36, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: 'info.main', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold" color="info.main">
                    {metrics.pendingProposals}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    Propostas Enviadas
                  </Typography>
                </Box>
                <AssignmentIcon color="info" sx={{ fontSize: 36, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: 'warning.main', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="warning.main" sx={{ mt: 0.5 }}>
                    {formatCurrency(metrics.totalReceived)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                    Total Faturado
                  </Typography>
                </Box>
                <PaymentsIcon color="warning" sx={{ fontSize: 36, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderLeft: 4, borderColor: 'primary.main', height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="h3" fontWeight="bold" color="primary.main">
                    {metrics.averageRating > 0 ? metrics.averageRating.toFixed(1) : '-'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    Avaliação Média
                  </Typography>
                  {metrics.averageRating > 0 && (
                    <Rating value={metrics.averageRating} precision={0.5} readOnly size="small" sx={{ mt: 0.5 }} />
                  )}
                </Box>
                <StarIcon color="primary" sx={{ fontSize: 36, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Section */}
      <Grid container spacing={4}>
        {/* Sent Proposals */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            Minhas Propostas Enviadas
          </Typography>
          {proposals.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider' }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Você ainda não enviou nenhuma proposta para casos abertos.
              </Typography>
              <Button variant="outlined" color="primary" onClick={() => navigate('/jobs')}>
                Buscar Casos Disponíveis
              </Button>
            </Paper>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell><Typography fontWeight="bold">Caso</Typography></TableCell>
                    <TableCell><Typography fontWeight="bold">Minha Proposta</Typography></TableCell>
                    <TableCell><Typography fontWeight="bold">Status</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {proposals.map((p) => (
                    <TableRow key={p.proposalId} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {p.jobTitle || `Caso Jurídico #${p.jobId}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {p.coverLetter}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(p.bidAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={statusLabels[p.status] || p.status}
                          color={statusColors[p.status] || 'default'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>

        {/* Sidebar / Recent Activity */}
        <Grid item xs={12} md={4}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            Mandatos em Andamento
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            {metrics.recentActivity.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                Nenhum mandato ativo no momento.
              </Typography>
            ) : (
              metrics.recentActivity.map((activity, index) => (
                <Box key={activity.id || index}>
                  <Box
                    sx={{
                      py: 1.5,
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.8 },
                    }}
                    onClick={() => navigate(`/contracts/${activity.id}`)}
                  >
                    <Typography variant="body2" fontWeight="bold">
                      {activity.title}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Cliente: {activity.otherParty}
                      </Typography>
                      <Chip
                        label={activity.status === 'Active' ? 'Ativo' : activity.status === 'Completed' ? 'Concluído' : activity.status}
                        size="small"
                        color={activity.status === 'Active' ? 'success' : 'default'}
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    </Box>
                  </Box>
                  {index < metrics.recentActivity.length - 1 && <Divider />}
                </Box>
              ))
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
