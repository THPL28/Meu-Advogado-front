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
  Paper,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
} from '@mui/material';
import {
  Gavel as GavelIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Archive as ArchiveIcon,
  CheckCircle as CheckCircleIcon,
  AssignmentTurnedIn as AssignmentTurnedInIcon,
} from '@mui/icons-material';
import { apiGet, apiPost } from '../../services/api';

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
  archived?: boolean;
  closed?: boolean;
}

export function ManageJobs() {
  const navigate = useNavigate();
  const [cases, setCases] = useState<PostedCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeJobId, setActiveJobId] = useState<number | null>(null);

  useEffect(() => {
    loadMyCases();
  }, []);

  async function loadMyCases() {
    try {
      setLoading(true);
      const response = await apiGet<{ success: boolean; data: PostedCase[] }>('/api/jobs/my');
      if (response?.success && response.data) {
        setCases(response.data);
      }
    } catch {
      setError('Erro ao carregar seus casos publicados.');
    } finally {
      setLoading(false);
    }
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, jobId: number) => {
    setAnchorEl(event.currentTarget);
    setActiveJobId(jobId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveJobId(null);
  };

  const handleArchive = async () => {
    if (!activeJobId) return;
    try {
      await apiPost(`/api/jobs/${activeJobId}/archive`, {});
      loadMyCases();
    } catch (err) {
      setError('Erro ao arquivar o caso.');
    } finally {
      handleMenuClose();
    }
  };

  const handleCloseCase = async () => {
    if (!activeJobId) return;
    try {
      await apiPost(`/api/jobs/${activeJobId}/close`, {});
      loadMyCases();
    } catch (err) {
      setError('Erro ao encerrar o caso.');
    } finally {
      handleMenuClose();
    }
  };

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
      <Container maxWidth="lg" sx={{ mt: 8, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 6 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Gerenciar Casos Publicados
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Acompanhe o andamento dos casos publicados e selecione propostas de advogados.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/jobs/create')}
        >
          Publicar Novo Caso
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {cases.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', border: '1px dashed', borderColor: 'divider' }}>
          <GavelIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Nenhum caso publicado encontrado.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Publique seu primeiro caso jurídico para receber propostas de advogados qualificados.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/jobs/create')}>
            Publicar Novo Caso
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {cases.map((c) => (
            <Grid item xs={12} key={c.jobId}>
              <Card variant="outlined" sx={{ position: 'relative' }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ pr: 6 }}>
                      <Typography variant="h6" fontWeight="bold" gutterBottom>
                        {c.title}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        <Chip
                          label={urgencyLabels[c.urgency] || c.urgency}
                          color={urgencyColors[c.urgency] || 'default'}
                          size="small"
                        />
                        <Chip
                          label={c.jobType === 'Hourly' ? 'Por Hora' : 'Valor Fixo'}
                          variant="outlined"
                          size="small"
                        />
                        <Chip
                          label={formatCurrency(c.budget)}
                          variant="outlined"
                          color="primary"
                          size="small"
                          sx={{ fontWeight: 'bold' }}
                        />
                      </Box>
                    </Box>

                    {/* Options Button */}
                    <IconButton
                      sx={{ position: 'absolute', right: 12, top: 12 }}
                      onClick={(e) => handleMenuOpen(e, c.jobId)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, whiteSpace: 'pre-line' }}>
                    {c.description}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<AssignmentTurnedInIcon />}
                      onClick={() => navigate(`/jobs/${c.jobId}/proposals`)}
                      sx={{ textTransform: 'none', borderRadius: 2 }}
                    >
                      Ver Propostas Recebidas
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Menu Options */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={handleCloseCase}>
          <ListItemIcon>
            <CheckCircleIcon fontSize="small" />
          </ListItemIcon>
          Marcar como Concluído
        </MenuItem>
        <MenuItem onClick={handleArchive}>
          <ListItemIcon>
            <ArchiveIcon fontSize="small" />
          </ListItemIcon>
          Arquivar Caso
        </MenuItem>
      </Menu>
    </Container>
  );
}
