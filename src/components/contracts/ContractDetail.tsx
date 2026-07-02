import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Chip,
  Box,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Gavel as GavelIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  MonetizationOn as MoneyIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Payments as PaymentsIcon,
} from '@mui/icons-material';
import { apiGet, apiPost } from '../../services/api';

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

export function ContractDetail() {
  const navigate = useNavigate();
  const { contractId } = useParams<{ contractId: string }>();
  const [contract, setContract] = useState<ContractDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (contractId) loadContract();
  }, [contractId]);

  async function loadContract() {
    try {
      setLoading(true);
      const response = await apiGet<{ success: boolean; data: ContractDTO }>(`/api/contracts/${contractId}`);
      if (response?.success && response.data) {
        setContract(response.data);
      } else {
        setError('Contrato não encontrado.');
      }
    } catch (err) {
      setError('Erro ao carregar contrato.');
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete() {
    try {
      const response = await apiPost<{ success: boolean; data: ContractDTO }>(
        `/api/contracts/${contractId}/complete`, {}
      );
      if (response?.success && response.data) {
        setContract(response.data);
      }
    } catch {
      setError('Erro ao completar contrato.');
    }
  }

  async function handleCompleteMilestone(milestoneId: number) {
    try {
      const response = await apiPost<{ success: boolean; data: MilestoneDTO }>(
        `/api/contracts/milestones/${milestoneId}/complete`, {}
      );
      if (response?.success && response.data && contract) {
        const updatedMilestones = contract.milestones.map((m) =>
          m.milestoneId === milestoneId ? { ...m, status: response.data.status, completedAt: response.data.completedAt } : m
        );
        setContract({ ...contract, milestones: updatedMilestones });
      }
    } catch {
      setError('Erro ao completar etapa.');
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR');

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Carregando contrato...</Typography>
      </Container>
    );
  }

  if (error || !contract) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Contrato não encontrado'}</Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/contracts')} sx={{ mt: 2 }}>
          Voltar aos Contratos
        </Button>
      </Container>
    );
  }

  const statusInfo = statusLabels[contract.status] || { label: contract.status, color: 'default' };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/contracts')}
          variant="outlined"
          size="small"
        >
          Voltar
        </Button>
        <GavelIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
          Detalhes do Mandato
        </Typography>
        <Chip label={statusInfo.label} color={statusInfo.color} />
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {contract.title}
          </Typography>

          <Typography variant="body1" color="text.secondary" paragraph>
            {contract.description}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Cliente</Typography>
                  <Typography variant="body1">{contract.clientName}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <PersonIcon color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Advogado</Typography>
                  <Typography variant="body1">{contract.lawyerName}</Typography>
                  {contract.lawyerOab && (
                    <Typography variant="body2" color="text.secondary">
                      OAB: {contract.lawyerOab}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Início</Typography>
                  <Typography variant="body2">{formatDate(contract.startDate)}</Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Prazo</Typography>
                  <Typography variant="body2">
                    {contract.endDate ? formatDate(contract.endDate) : 'Indeterminado'}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyIcon color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Valor Total</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(contract.totalValue)}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GavelIcon color="primary" />
                <Box>
                  <Typography variant="caption" color="text.secondary">Caso</Typography>
                  <Typography variant="body2">{contract.jobTitle}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Milestones */}
      <Typography variant="h6" fontWeight="bold" gutterBottom>
        Etapas do Mandato
      </Typography>

      {contract.milestones.length === 0 ? (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="text.secondary">
              Nenhuma etapa definida para este mandato.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ mb: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Etapa</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell>Prazo</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Ação</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {contract.milestones.map((ms) => {
                const msInfo = milestoneStatusLabels[ms.status] || { label: ms.status, color: 'default' };
                return (
                  <TableRow key={ms.milestoneId}>
                    <TableCell>
                      <Typography fontWeight="medium">{ms.title}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {ms.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {ms.amount ? formatCurrency(ms.amount) : '-'}
                    </TableCell>
                    <TableCell>
                      {ms.dueDate ? formatDate(ms.dueDate) : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip label={msInfo.label} color={msInfo.color} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      {ms.status === 'Pending' && contract.status === 'Active' && (
                        <Button
                          variant="outlined"
                          size="small"
                          color="success"
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleCompleteMilestone(ms.milestoneId)}
                        >
                          Concluir
                        </Button>
                      )}
                      {ms.status === 'Completed' && (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          <CheckCircleIcon color="success" />
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            startIcon={<PaymentsIcon />}
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                const resp = await apiPost<{ success: boolean; data: any }>(
                                  `/api/payments/create/${ms.milestoneId}`, {}
                                );
                                if (resp?.success) {
                                  alert('Pagamento criado com sucesso!');
                                }
                              } catch {
                                alert('Erro ao criar pagamento.');
                              }
                            }}
                          >
                            Pagar
                          </Button>
                        </Box>
                      )}
                      {ms.status === 'Cancelled' && (
                        <CancelIcon color="error" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Actions */}
      {contract.status === 'Active' && (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            onClick={handleComplete}
          >
            Concluir Mandato
          </Button>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<CancelIcon />}
            onClick={async () => {
              try {
                const response = await apiPost<{ success: boolean; data: ContractDTO }>(
                  `/api/contracts/${contractId}/terminate`, {}
                );
                if (response?.success && response.data) {
                  setContract(response.data);
                }
              } catch {
                setError('Erro ao encerrar contrato.');
              }
            }}
          >
            Encerrar Mandato
          </Button>
        </Box>
      )}
    </Container>
  );
}
