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
  Divider,
  Chip,
  Pagination,
  IconButton,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  DoneAll as DoneAllIcon,
} from '@mui/icons-material';
import { apiGet, apiPost } from '../../services/api';

interface NotificationDTO {
  notificationId: number;
  type: string;
  title: string;
  message: string;
  referenceType: string | null;
  referenceId: number | null;
  isRead: boolean;
  createdAt: string;
}

export function MyNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadNotifications();
  }, [page]);

  async function loadNotifications() {
    try {
      setLoading(true);
      const response = await apiGet<{
        success: boolean;
        data: { notifications: NotificationDTO[]; totalPages: number; totalElements: number };
      }>(`/api/notifications?page=${page}&size=20`);

      if (response?.success && response.data) {
        setNotifications(response.data.notifications);
        setTotalPages(response.data.totalPages);
      }
    } catch {
      setError('Erro ao carregar notificações.');
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAllRead() {
    try {
      await apiPost('/api/notifications/read-all', {});
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
    } catch { /* ignore */ }
  }

  async function handleMarkRead(notificationId: number) {
    try {
      await apiPost(`/api/notifications/${notificationId}/read`, {});
      setNotifications(notifications.map((n) =>
        n.notificationId === notificationId ? { ...n, isRead: true } : n
      ));
    } catch { /* ignore */ }
  }

  function handleNotificationClick(notification: NotificationDTO) {
    if (!notification.isRead) {
      handleMarkRead(notification.notificationId);
    }
    if (notification.referenceType === 'contract' && notification.referenceId) {
      navigate(`/contracts/${notification.referenceId}`);
    } else if (notification.referenceType === 'job' && notification.referenceId) {
      navigate('/jobs');
    }
  }

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading && notifications.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Carregando notificações...</Typography>
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
        <NotificationsIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h4" fontWeight="bold" sx={{ flexGrow: 1 }}>
          Notificações
        </Typography>
        <Button
          startIcon={<DoneAllIcon />}
          onClick={handleMarkAllRead}
          variant="outlined"
          size="small"
        >
          Marcar todas lidas
        </Button>
      </Box>

      {notifications.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <NotificationsIcon sx={{ fontSize: 64, mb: 2, opacity: 0.4 }} />
          <Typography variant="h6">Nenhuma notificação</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            As notificações aparecerão quando houver atividade nos seus contratos.
          </Typography>
        </Box>
      ) : (
        <>
          {notifications.map((notification) => (
            <Card
              key={notification.notificationId}
              sx={{
                mb: 1,
                cursor: 'pointer',
                backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
                '&:hover': { boxShadow: 2 },
              }}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {notification.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(notification.createdAt)}
                        </Typography>
                        {!notification.isRead && (
                          <Chip
                            label="Nova"
                            color="primary"
                            size="small"
                            sx={{ height: 20, fontSize: 11 }}
                          />
                        )}
                      </Box>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {notification.message}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(_, p) => setPage(p - 1)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Container>
  );
}
