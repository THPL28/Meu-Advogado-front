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
} from '@mui/material';
import {
  Gavel as GavelIcon,
  Assignment as AssignmentIcon,
  Payments as PaymentsIcon,
  Add as AddIcon,
  Notifications as NotificationsIcon,
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

interface PostedCase {
  jobId: number;
  title: string;
  description: string;
  budget: number;
  jobType: string;
  urgency: string;
  confidentiality: string;
  clientName: string;
  deadline?: string;
}

export function ClientDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [cases, setCases] = useState<PostedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const metricsResponse = await apiGet<{ success: boolean; data: Metrics }>('/api/dashboard/metrics');
      const casesResponse = await apiGet<{ success: boolean; data: PostedCase[] }>('/api/jobs/my');

      if (metricsResponse?.success && metricsResponse.data) {
        setMetrics(metricsResponse.data);
      }
      if (casesResponse?.success && casesResponse.data) {
        setCases(casesResponse.data);
      }
    } catch {
      setError('Erro ao carregar dados do painel do cliente.');
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const urgencyLabels: Record<string, string> = {
    Low: 'Baixa',
    Medium: 'Média',
    High: 'Alta',
    Urgent: 'Urgente',
  };

  const urgencyColors: Record<string, 'default' | 'info' | 'warning' | 'error'> = {
    Low: 'default',
    Medium: 'info',
    High: 'warning',
    Urgent: 'error',
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
            Painel do Cliente
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Gerencie seus casos jurídicos, propostas recebidas e mandatos ativos.
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => navigate('/jobs/create')}
          sx={{
            px: 3,
            py: 1.2,
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(18, 153, 0, 0.2)',
          }}
        >
          Publicar Novo Caso
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
                    {metrics.proposalsForMyCases}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    Propostas Recebidas
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
                    {formatCurrency(metrics.totalPaid)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium" sx={{ mt: 0.5 }}>
                    Total Investido
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
                  <Typography variant="h5" fontWeight="bold" color="primary.main" sx={{ mt: 1 }}>
                    {metrics.unreadNotifications} Mensagens
                  </Typography>
                  <Typography variant="body2" color="text.secondary" fontWeight="medium">
                    Notificações Pendentes
                  </Typography>
                </Box>
                <NotificationsIcon color="primary" sx={{ fontSize: 36, opacity: 0.7 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Section */}
      <Grid container spacing={4}>
        {/* Posted Cases */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
            Meus Casos Jurídicos Publicados
          </Typography>
          {cases.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider' }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Você ainda não publicou nenhum caso jurídico no LegalWork.
              </Typography>
              <Button variant="outlined" color="primary" onClick={() => navigate('/jobs/create')}>
                Publicar Primeiro Caso
              </Button>
            </Paper>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead sx={{ bgcolor: 'action.hover' }}>
                  <TableRow>
                    <TableCell><Typography fontWeight="bold">Caso</Typography></TableCell>
                    <TableCell><Typography fontWeight="bold">Orçamento</Typography></TableCell>
                    <TableCell><Typography fontWeight="bold">Urgência</Typography></TableCell>
                    <TableCell align="center"><Typography fontWeight="bold">Ações</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {cases.map((c) => (
                    <TableRow key={c.jobId} sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                      <TableCell>
                        <Typography variant="body1" fontWeight="medium">
                          {c.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {c.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(c.budget)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.jobType === 'Hourly' ? 'Por Hora' : 'Valor Fixo'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={urgencyLabels[c.urgency] || c.urgency}
                          color={urgencyColors[c.urgency] || 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => navigate(`/jobs/${c.jobId}/proposals`)}
                          sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                          Ver Propostas
                        </Button>
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
            Atividade Recente
          </Typography>
          <Paper variant="outlined" sx={{ p: 2 }}>
            {metrics.recentActivity.length === 0 ? (
              <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                Nenhuma atividade recente registrada.
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
                        Advogado: {activity.otherParty}
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
