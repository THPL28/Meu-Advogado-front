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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Payments as PaymentsIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { apiGet } from '../../services/api';

interface PaymentDTO {
  paymentId: number;
  contractId: number;
  contractTitle: string;
  milestoneId: number | null;
  milestoneTitle: string | null;
  amount: number;
  status: string;
  paymentDate: string;
  description: string;
  clientName: string;
  lawyerName: string;
  lawyerOab: string | null;
}

const statusLabels: Record<string, { label: string; color: 'success' | 'warning' | 'error' | 'default' | 'info' }> = {
  Pending: { label: 'Pendente', color: 'warning' },
  Completed: { label: 'Concluído', color: 'success' },
  Failed: { label: 'Falhou', color: 'error' },
  Refunded: { label: 'Reembolsado', color: 'info' },
};

export function MyPayments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    loadPayments();
  }, []);

  async function loadPayments() {
    try {
      setLoading(true);
      const response = await apiGet<{ success: boolean; data: PaymentDTO[] }>('/api/payments/my');
      if (response?.success && response.data) {
        setPayments(response.data);
      }
    } catch (err) {
      setError('Erro ao carregar pagamentos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  const filteredPayments = payments.filter((p) => {
    if (tabIndex === 0) return true;
    if (tabIndex === 1) return p.status === 'Completed';
    if (tabIndex === 2) return p.status === 'Pending';
    if (tabIndex === 3) return p.status === 'Refunded';
    return true;
  });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR');

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Carregando pagamentos...</Typography>
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
        <PaymentsIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" fontWeight="bold">
          Pagamentos
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
        <Tab label="Concluídos" />
        <Tab label="Pendentes" />
        <Tab label="Reembolsados" />
      </Tabs>

      {filteredPayments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <ReceiptIcon sx={{ fontSize: 64, mb: 2, opacity: 0.4 }} />
          <Typography variant="h6">Nenhum pagamento encontrado</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Os pagamentos aparecerão automaticamente quando milestones forem concluídas.
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 3 }}
            onClick={() => navigate('/contracts')}
          >
            Ver Mandatos
          </Button>
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Pagamento</TableCell>
                <TableCell>Contrato</TableCell>
                <TableCell>Etapa</TableCell>
                <TableCell align="right">Valor</TableCell>
                <TableCell>Data</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredPayments.map((payment) => {
                const statusInfo = statusLabels[payment.status] || { label: payment.status, color: 'default' };
                return (
                  <TableRow
                    key={payment.paymentId}
                    sx={{ cursor: 'pointer', '&:hover': { backgroundColor: 'action.hover' } }}
                    onClick={() => navigate(`/contracts/${payment.contractId}`)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        #{payment.paymentId}
                      </Typography>
                      {payment.description && (
                        <Typography variant="caption" color="text.secondary">
                          {payment.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {payment.contractTitle && payment.contractTitle.length > 40
                          ? payment.contractTitle.substring(0, 40) + '...'
                          : payment.contractTitle}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {payment.milestoneTitle || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="bold">
                        {formatCurrency(payment.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatDate(payment.paymentDate)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusInfo.label}
                        color={statusInfo.color}
                        size="small"
                        icon={
                          payment.status === 'Completed'
                            ? <CheckCircleIcon />
                            : payment.status === 'Refunded'
                            ? <CancelIcon />
                            : undefined
                        }
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
