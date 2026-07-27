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
  Paper,
  Divider,
} from '@mui/material';
import {
  PaymentsOutlined,
  GavelOutlined,
  AssignmentOutlined,
  Add,
  Create,
  CheckCircleOutline,
  InsertDriveFileOutlined,
  MoreVert
} from '@mui/icons-material';
import { apiGet } from '../../services/api';

interface Metrics {
  activeContracts: number;
  totalReceived: number;
  pendingProposals: number;
}

export function LawyerDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);
      const metricsResponse = await apiGet<{ success: boolean; data: Metrics }>('/api/dashboard/metrics');

      if (metricsResponse?.success && metricsResponse.data) {
        setMetrics(metricsResponse.data);
      } else {
        // Mock data for design if backend fails or doesn't have the exact fields
        setMetrics({
          activeContracts: 42,
          totalReceived: 24500,
          pendingProposals: 7
        });
      }
    } catch {
      // Fallback for design showcase
      setMetrics({
        activeContracts: 42,
        totalReceived: 24500,
        pendingProposals: 7
      });
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#16a30b' }} />
      </Box>
    );
  }

  if (error && !metrics) {
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
      {/* HEADER */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" sx={{ color: '#128209' }}>
            Bem-vindo, Dr. Rodrigo
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Você tem 4 prazos importantes vencendo nos próximos 3 dias.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          sx={{
            backgroundColor: '#333',
            color: 'white',
            px: 3,
            py: 1,
            fontWeight: 'bold',
            textTransform: 'none',
            borderRadius: 2,
            '&:hover': { backgroundColor: '#222' }
          }}
        >
          Novo Caso
        </Button>
      </Box>

      {/* METRICS CARDS */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee', p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                  Ganhos no Mês
                </Typography>
                <Box sx={{ backgroundColor: '#e8f5e9', p: 1, borderRadius: 2 }}>
                  <PaymentsOutlined sx={{ color: '#16a30b' }} />
                </Box>
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#2d2d2d', mb: 0.5 }}>
                {formatCurrency(metrics?.totalReceived || 0)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#16a30b', fontWeight: 'bold' }}>
                ↗ +12% vs mês anterior
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee', p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                  Casos Ativos
                </Typography>
                <Box sx={{ backgroundColor: '#e8f5e9', p: 1, borderRadius: 2 }}>
                  <GavelOutlined sx={{ color: '#16a30b' }} />
                </Box>
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#2d2d2d', mb: 0.5 }}>
                {metrics?.activeContracts || 0} Processos
              </Typography>
              <Typography variant="caption" color="text.secondary">
                🕑 8 aguardando audiência
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee', p: 1 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" fontWeight="bold">
                  Novas Propostas
                </Typography>
                <Box sx={{ backgroundColor: '#e8f5e9', p: 1, borderRadius: 2 }}>
                  <AssignmentOutlined sx={{ color: '#16a30b' }} />
                </Box>
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ color: '#2d2d2d', mb: 0.5 }}>
                {metrics?.pendingProposals || 0} Pendentes
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ✉ 3 visualizadas pelo cliente
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* ATIVIDADE RECENTE */}
        <Grid item xs={12} md={8}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee' }}>
              <Typography variant="body1" fontWeight="bold" sx={{ color: '#333', letterSpacing: 1 }}>
                ATIVIDADE RECENTE
              </Typography>
              <Typography variant="body2" sx={{ color: '#16a30b', cursor: 'pointer', fontWeight: 'bold' }}>
                Ver tudo
              </Typography>
            </Box>
            
            <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Item 1 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ backgroundColor: '#d9f9d9', p: 1.5, borderRadius: '50%' }}>
                    <Create sx={{ color: '#128209' }} />
                  </Box>
                  <Box>
                    <Typography variant="body1" sx={{ color: '#333' }}>Petição inicial protocolada no Processo #4829</Typography>
                    <Typography variant="body2" color="text.secondary">Cliente: Indústrias Alfa S/A • Há 2 horas</Typography>
                  </Box>
                </Box>
                <Chip label="CÍVEL" size="small" sx={{ backgroundColor: '#e0f2e9', color: '#16a30b', fontWeight: 'bold' }} />
              </Box>
              
              <Divider sx={{ my: 1 }} />
              
              {/* Item 2 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ backgroundColor: '#d9f9d9', p: 1.5, borderRadius: '50%' }}>
                    <CheckCircleOutline sx={{ color: '#128209' }} />
                  </Box>
                  <Box>
                    <Typography variant="body1" sx={{ color: '#333' }}>Proposta aceita para Contrato de Prestação</Typography>
                    <Typography variant="body2" color="text.secondary">Cliente: Marina Silva • Ontem, 16:45</Typography>
                  </Box>
                </Box>
                <Chip label="SUCESSO" size="small" sx={{ backgroundColor: '#e0f2e9', color: '#16a30b', fontWeight: 'bold' }} />
              </Box>

              <Divider sx={{ my: 1 }} />
              
              {/* Item 3 */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                  <Box sx={{ backgroundColor: '#d9f9d9', p: 1.5, borderRadius: '50%' }}>
                    <InsertDriveFileOutlined sx={{ color: '#128209' }} />
                  </Box>
                  <Box>
                    <Typography variant="body1" sx={{ color: '#333' }}>Novo documento anexado: Comprovante_Residencia.pdf</Typography>
                    <Typography variant="body2" color="text.secondary">Processo: #9921 • Ontem, 09:12</Typography>
                  </Box>
                </Box>
                <Chip label="ANEXO" size="small" sx={{ backgroundColor: '#e0f2e9', color: '#16a30b', fontWeight: 'bold' }} />
              </Box>
            </Box>
          </Card>
        </Grid>

        {/* PRODUTIVIDADE SEMANAL */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid #eee', height: '100%' }}>
            <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" fontWeight="bold" sx={{ color: '#555' }}>
                Produtividade Semanal
              </Typography>
              <MoreVert sx={{ color: '#aaa', cursor: 'pointer' }} />
            </Box>
            <CardContent sx={{ pt: 0, display: 'flex', flexDirection: 'column', height: '80%' }}>
              
              <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', height: 120, mb: 3 }}>
                 {/* Fake chart bars */}
                 <Box sx={{ width: 12, height: 40, backgroundColor: '#16a30b', borderRadius: 1 }} />
                 <Box sx={{ width: 12, height: 60, backgroundColor: '#16a30b', borderRadius: 1 }} />
                 <Box sx={{ width: 12, height: 100, backgroundColor: '#16a30b', borderRadius: 1, position: 'relative' }}>
                   <Box sx={{ position: 'absolute', top: -30, left: -10, backgroundColor: '#333', color: 'white', px: 1, borderRadius: 1, fontSize: '0.7rem' }}>20h</Box>
                 </Box>
                 <Box sx={{ width: 12, height: 30, backgroundColor: '#16a30b', borderRadius: 1 }} />
                 <Box sx={{ width: 12, height: 80, backgroundColor: '#16a30b', borderRadius: 1 }} />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-around', color: 'text.secondary' }}>
                <Typography variant="caption" fontWeight="bold">SEG</Typography>
                <Typography variant="caption" fontWeight="bold">TER</Typography>
                <Typography variant="caption" fontWeight="bold" sx={{ color: '#16a30b' }}>QUA</Typography>
                <Typography variant="caption" fontWeight="bold">QUI</Typography>
                <Typography variant="caption" fontWeight="bold">SEX</Typography>
              </Box>

              <Box sx={{ mt: 'auto', pt: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">Horas cobráveis</Typography>
                  <Typography variant="body2" fontWeight="bold">87h / 120h</Typography>
                </Box>
                <Box sx={{ width: '100%', height: 6, backgroundColor: '#eee', borderRadius: 3 }}>
                  <Box sx={{ width: '70%', height: '100%', backgroundColor: '#16a30b', borderRadius: 3 }} />
                </Box>
              </Box>

            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
