import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Button,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
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

export function NotificationBell() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notifications, setNotifications] = useState<NotificationDTO[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const open = Boolean(anchorEl);

  useEffect(() => {
    loadUnread();
    // Poll every 30 seconds for new notifications
    pollingRef.current = setInterval(loadUnread, 30000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  async function loadUnread() {
    try {
      const response = await apiGet<{ success: boolean; data: { notifications: NotificationDTO[]; count: number } }>(
        '/api/notifications/unread'
      );
      if (response?.success && response.data) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.count);
      }
    } catch {
      // Silent fail for polling
    }
  }

  async function handleOpen(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
    await loadUnread();
  }

  function handleClose() {
    setAnchorEl(null);
  }

  async function handleMarkAllRead() {
    try {
      await apiPost('/api/notifications/read-all', {});
      setNotifications([]);
      setUnreadCount(0);
    } catch { /* ignore */ }
  }

  function handleNotificationClick(notification: NotificationDTO) {
    // Mark as read
    apiPost(`/api/notifications/${notification.notificationId}/read`, {}).catch(() => {});

    // Navigate based on reference type
    if (notification.referenceType === 'contract' && notification.referenceId) {
      navigate(`/contracts/${notification.referenceId}`);
    } else if (notification.referenceType === 'job' && notification.referenceId) {
      navigate(`/jobs`);
    }
    handleClose();
  }

  const formatRelativeTime = (dateStr: string) => {
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'agora';
    if (diffMin < 60) return `${diffMin}m`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays < 7) return `${diffDays}d`;
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  return (
    <>
      <IconButton
        onClick={handleOpen}
        size="large"
        color="inherit"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 360, maxHeight: 480 }
        }}
      >
        <Box sx={{ px: 2, py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold">
            Notificações
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead}>
              Marcar todas lidas
            </Button>
          )}
        </Box>
        <Divider />

        {notifications.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center', color: 'text.secondary' }}>
            <NotificationsIcon sx={{ fontSize: 40, mb: 1, opacity: 0.4 }} />
            <Typography variant="body2">Nenhuma notificação</Typography>
          </Box>
        ) : (
          notifications.slice(0, 10).map((notification) => (
            <MenuItem
              key={notification.notificationId}
              onClick={() => handleNotificationClick(notification)}
              sx={{
                whiteSpace: 'normal',
                py: 1.5,
                backgroundColor: notification.isRead ? 'transparent' : 'action.hover',
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="subtitle2" fontWeight="bold" sx={{ flexGrow: 1 }}>
                    {notification.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1, whiteSpace: 'nowrap' }}>
                    {formatRelativeTime(notification.createdAt)}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mt: 0.25,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {notification.message}
                </Typography>
              </Box>
            </MenuItem>
          ))
        )}

        <Divider />
        <Box sx={{ px: 2, py: 1 }}>
          <Button
            fullWidth
            size="small"
            onClick={() => { navigate('/notifications'); handleClose(); }}
          >
            Ver todas as notificações
          </Button>
        </Box>
      </Menu>
    </>
  );
}
