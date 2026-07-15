import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Box,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Divider,
} from '@mui/material';
import {
  Gavel as GavelIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  CalendarToday as CalendarIcon,
  MonetizationOn as MoneyIcon,
  CheckCircle as CheckCircleIcon,

  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { apiGet } from '../../services/api';
import { getAuthState } from '../../services/authService';

interface MilestoneDTO {
  milestoneId: number;
  contractId: number;
  title: string;
  description: string;
  amount: number;
  dueDate: string;
  status: string;
  completedAt: string | null;
}

interface ContractDTO {
  contractId: number;
  jobId: number;
  jobTitle: string;
  clientId: number;
  clientName: string;
  lawyerId: number;
  lawyerName: string;
  lawyerPhotoUrl: string | null;
  lawyerOab: string | null;
  proposalId: number | null;
  title: string;
  description: string;
  totalValue: number;
  startDate: string;
  endDate: string | null;
  status: string;
  createdAt: string;
  milestones: MilestoneDTO[];
}

const statusLabels: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default' | 'info' }> = {
  Active: { label: 'Ativo', color: 'success' },
  Completed: { label: 'Concluído', color: 'info' },
  Terminated: { label: 'Encerrado', color: 'warning' },
  Cancelled: { label: 'Cancelado', color: 'error' },
};

const milestoneStatusLabels: Record<string, { label: string; color: 'success' | 'warning' | 'default' | 'error' }> = {
  Pending: { label: 'Pendente', color: 'default' },
  InProgress: { label: 'Em Andamento', color: 'warning' },
  Completed: { label: 'Concluído', color: 'success' },
  Cancelled: { label: 'Cancelado', color: 'error' },
};

export function MyContracts() {
  const navigate = useNavigate();
  const [contracts, setContracts] = useState<ContractDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    loadContracts();
  }, []);

  async function loadContracts() {
    try {
      setLoading(true);
      const response = await apiGet<{ success: boolean; data: ContractDTO[] }>('/api/contracts/my');
      if (response?.success && response.data) {
        setContracts(response.data);
      }
    } catch (err) {
      setError('Erro ao carregar contratos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const filteredContracts = contracts.filter((c) => {
    if (tabIndex === 0) return true;
    if (tabIndex === 1) return c.status === 'Active';
    if (tabIndex === 2) return c.status === 'Completed';
    if (tabIndex === 3) return c.status === 'Terminated' || c.status === 'Cancelled';
    return true;
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>Carregando contratos...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/home')}
          variant="outlined"
          size="small"
        >
          Voltar
        </Button>
        <GavelIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" fontWeight="bold">
          Meus Mandatos
        </Typography>
      </Box>

      <Tabs
        value={tabIndex}
        onChange={(_, v) => setTabIndex(v)}
        sx={{ mb: 3 }}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab label="Todos" />
        <Tab label="Ativos" />
        <Tab label="Concluídos" />
        <Tab label="Encerrados" />
      </Tabs>

      {filteredContracts.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <WorkIcon sx={{ fontSize: 64, mb: 2, opacity: 0.4 }} />
          <Typography variant="h6">Nenhum contrato encontrado</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {tabIndex === 0
              ? 'Ainda não tens contratos ativos. Procure casos jurídicos na página inicial.'
              : 'Nenhum contrato nesta categoria.'}
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => navigate('/jobs')}
          >
            Ver Casos Disponíveis
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredContracts.map((contract) => {
            const statusInfo = statusLabels[contract.status] || { label: contract.status, color: 'default' };
            const authState = getAuthState();
            const isCurrentUserClient = contract.clientId === authState.userId;
            const otherParty = isCurrentUserClient ? contract.lawyerName : contract.clientName;
            const otherLabel = isCurrentUserClient ? 'Advogado:' : 'Cliente:';

            return (
              <Grid item xs={12} key={contract.contractId}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 4 },
                  }}
                  onClick={() => navigate(`/contracts/${contract.contractId}`)}
                >
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Typography variant="h6" fontWeight="bold">
                        {contract.title}
                      </Typography>
                      <Chip
                        label={statusInfo.label}
                        color={statusInfo.color}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {contract.description && contract.description.length > 150
                        ? contract.description.substring(0, 150) + '...'
                        : contract.description}
                    </Typography>

                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            <strong>{otherLabel}</strong> {otherParty}
                          </Typography>
                        </Box>
                        {contract.lawyerOab && (
                          <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                            OAB: {contract.lawyerOab}
                          </Typography>
                        )}
                      </Grid>

                      <Grid item xs={6} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon fontSize="small" color="primary" />
                          <Typography variant="body2">
                            {formatDate(contract.startDate)}
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid item xs={6} sm={3}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MoneyIcon fontSize="small" color="primary" />
                          <Typography variant="body2" fontWeight="bold">
                            {formatCurrency(contract.totalValue)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {contract.milestones && contract.milestones.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          Etapas:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {contract.milestones.map((ms) => {
                            const msInfo = milestoneStatusLabels[ms.status] || { label: ms.status, color: 'default' };
                            return (
                              <Chip
                                key={ms.milestoneId}
                                label={ms.title}
                                size="small"
                                variant="outlined"
                                color={msInfo.color as any}
                                icon={ms.status === 'Completed' ? <CheckCircleIcon /> : undefined}
                              />
                            );
                          })}
                        </Box>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
}
