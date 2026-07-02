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
  Rating,
  TextField,
  Avatar,
  Snackbar,
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
  Star as StarIcon,
} from '@mui/icons-material';
import { apiGet, apiPost } from '../../services/api';
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

interface ReviewDTO {
  reviewId: number;
  contractId: number;
  contractTitle: string;
  reviewerId: number;
  reviewerName: string;
  reviewerPhotoUrl: string | null;
  revieweeId: number;
  revieweeName: string;
  revieweePhotoUrl: string | null;
  revieweeOab: string | null;
  rating: number;
  comment: string;
  createdAt: string;
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
  const [reviews, setReviews] = useState<ReviewDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number | null>(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);

  useEffect(() => {
    if (contractId) { loadContract(); loadReviews(); }
  }, [contractId]);

  async function loadReviews() {
    try {
      const response = await apiGet<{ success: boolean; data: ReviewDTO[] }>(
        `/api/reviews/contract/${contractId}`
      );
      if (response?.success && response.data) {
        setReviews(response.data);
      }
    } catch { /* ignore */ }
  }

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

      {/* Reviews Section */}
      {contract.status === 'Completed' && (
        <>
          <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 3 }}>
            Avaliações
          </Typography>

          {/* Existing Reviews */}
          {reviews.length > 0 && (
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {reviews.map((review) => (
                <Grid item xs={12} key={review.reviewId}>
                  <Card variant="outlined">
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Avatar src={review.reviewerPhotoUrl || undefined} sx={{ bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {review.reviewerName}
                          </Typography>
                          <Rating value={review.rating} readOnly size="small" />
                          {review.comment && (
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                              {review.comment}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                            {new Date(review.createdAt).toLocaleDateString('pt-BR')}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Submit Review */}
          {(() => {
            const authState = getAuthState();
            const isCurrentUserClient = authState.userId === contract.clientId;
            const isCurrentUserLawyer = authState.userId === contract.lawyerId;

            if (!isCurrentUserClient && !isCurrentUserLawyer) return null;

            const revieweeName = isCurrentUserClient ? contract.lawyerName : contract.clientName;
            const revieweeId = isCurrentUserClient ? contract.lawyerId : contract.clientId;

            // Check if user already submitted a review
            const hasReviewed = reviews.some(r => r.reviewerId === authState.userId);

            return (
              <Card sx={{ mb: 3, backgroundColor: 'grey.50' }}>
                <CardContent>
                  {hasReviewed ? (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <StarIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="subtitle1" fontWeight="bold">
                        Já avaliaste este contrato
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        A tua avaliação foi registada com sucesso.
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        Avaliar {revieweeName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Rating
                          value={reviewRating}
                          onChange={(_, v) => setReviewRating(v)}
                          size="large"
                          icon={<StarIcon color="primary" fontSize="inherit" />}
                        />
                      </Box>
                      <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Comentário (opcional)"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        variant="outlined"
                        size="small"
                        sx={{ mb: 2 }}
                      />
                      <Button
                        variant="contained"
                        startIcon={<StarIcon />}
                        disabled={submittingReview}
                        onClick={async () => {
                          setSubmittingReview(true);
                          try {
                            const resp = await apiPost<{ success: boolean; data: ReviewDTO }>(
                              `/api/reviews/create/${contractId}`,
                              {
                                revieweeId,
                                rating: reviewRating || 5,
                                comment: reviewComment,
                              }
                            );
                            if (resp?.success) {
                              setSnackbarMsg('Avaliação enviada com sucesso!');
                              setReviewComment('');
                              setReviewRating(5);
                              loadReviews();
                            }
                          } catch {
                            setSnackbarMsg('Erro ao enviar avaliação.');
                          } finally {
                            setSubmittingReview(false);
                          }
                        }}
                      >
                        {submittingReview ? 'A enviar...' : 'Enviar Avaliação'}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })()}
        </>
      )}

      <Snackbar
        open={!!snackbarMsg}
        autoHideDuration={4000}
        onClose={() => setSnackbarMsg(null)}
        message={snackbarMsg}
      />
    </Container>
  );
}
