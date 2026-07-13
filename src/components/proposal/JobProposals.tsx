import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Paper,
  Divider,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { apiGet, apiPost } from '../../services/api';

interface Proposal {
  proposalId: number;
  jobId: number;
  lawyerId: number;
  lawyerName: string;
  bidAmount: number;
  coverLetter: string;
  status: string;
  createdAt: string;
}

interface Job {
  jobId: number;
  title: string;
  description: string;
  budget: number;
}

export function JobProposals() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadJobAndProposals();
  }, [jobId]);

  async function loadJobAndProposals() {
    if (!jobId) return;
    try {
      setLoading(true);
      const jobResponse = await apiGet<{ success: boolean; data: Job }>(`/api/jobs/${jobId}`);
      const proposalsResponse = await apiGet<{ success: boolean; data: Proposal[] }>(`/api/proposals/job/${jobId}`);

      if (jobResponse?.success && jobResponse.data) {
        setJob(jobResponse.data);
      }
      if (proposalsResponse?.success && proposalsResponse.data) {
        setProposals(proposalsResponse.data);
      }
    } catch {
      setError('Erro ao carregar propostas do caso.');
    } finally {
      setLoading(false);
    }
  }

  const handleAccept = async (proposalId: number) => {
    setActionLoading(proposalId);
    try {
      const response = await apiPost<{ success: boolean }>(`/api/proposals/${proposalId}/accept`, {});
      if (response?.success) {
        navigate('/contracts');
      }
    } catch (err) {
      setError('Erro ao aceitar a proposta. Tente novamente.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (proposalId: number) => {
    setActionLoading(proposalId);
    try {
      const response = await apiPost<{ success: boolean }>(`/api/proposals/${proposalId}/reject`, {});
      if (response?.success) {
        loadJobAndProposals();
      }
    } catch (err) {
      setError('Erro ao rejeitar a proposta. Tente novamente.');
    } finally {
      setActionLoading(null);
    }
  };

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
      <Container maxWidth="md" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      {/* Back Button */}
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/jobs/manage')}
        sx={{ mb: 3, textTransform: 'none' }}
      >
        Voltar para Meus Casos
      </Button>

      {job && (
        <Paper variant="outlined" sx={{ p: 3, mb: 4, bgcolor: 'action.hover' }}>
          <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ textTransform: 'uppercase' }}>
            Detalhes do Caso Selecionado
          </Typography>
          <Typography variant="h5" fontWeight="bold" sx={{ mt: 1, mb: 1 }}>
            {job.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {job.description}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Typography variant="body2" fontWeight="bold">
              Orçamento Previsto:
            </Typography>
            <Chip label={formatCurrency(job.budget)} color="primary" variant="outlined" size="small" />
          </Box>
        </Paper>
      )}

      <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
        Propostas Recebidas ({proposals.length})
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {proposals.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider' }}>
          <Typography color="text.secondary">
            Nenhuma proposta recebida para este caso até o momento.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {proposals.map((p) => (
            <Grid item xs={12} key={p.proposalId}>
              <Card variant="outlined">
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <PersonIcon color="action" />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {p.lawyerName || `Advogado #${p.lawyerId}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Proposta enviada em {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
                      <Typography variant="h6" fontWeight="bold" color="primary">
                        {formatCurrency(p.bidAmount)}
                      </Typography>
                      <Chip
                        label={statusLabels[p.status] || p.status}
                        color={statusColors[p.status] || 'default'}
                        size="small"
                      />
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.primary" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
                    {p.coverLetter}
                  </Typography>

                  {p.status === 'Pending' && (
                    <>
                      <Divider sx={{ my: 2 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CloseIcon />}
                          disabled={actionLoading !== null}
                          onClick={() => handleReject(p.proposalId)}
                          sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                          Recusar
                        </Button>
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<CheckIcon />}
                          disabled={actionLoading !== null}
                          onClick={() => handleAccept(p.proposalId)}
                          sx={{ textTransform: 'none', borderRadius: 2 }}
                        >
                          {actionLoading === p.proposalId ? <CircularProgress size={16} /> : 'Aceitar Proposta'}
                        </Button>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
