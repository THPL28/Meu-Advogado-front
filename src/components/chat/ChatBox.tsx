import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { apiGet, apiPost } from '../../services/api';
import { getAuthState } from '../../services/authService';

interface ChatMessageDTO {
  messageId: number;
  contractId: number;
  senderId: number;
  senderName: string;
  senderPhotoUrl: string | null;
  message: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

interface ChatBoxProps {
  contractId: number;
}

export function ChatBox({ contractId }: ChatBoxProps) {
  const [messages, setMessages] = useState<ChatMessageDTO[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const authState = getAuthState();

  useEffect(() => {
    loadMessages();
    // Poll every 15 seconds for new messages
    pollingRef.current = setInterval(loadMessages, 15000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [contractId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function loadMessages() {
    try {
      const response = await apiGet<{
        success: boolean;
        data: { messages: ChatMessageDTO[]; unreadCount: number };
      }>(`/api/chat/messages/${contractId}`);

      if (response?.success && response.data) {
        setMessages(response.data.messages);
        // Mark as read
        if (response.data.unreadCount > 0) {
          apiPost(`/api/chat/read/${contractId}`, {}).catch(() => {});
        }
      }
    } catch {
      // Silent fail for polling
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!newMessage.trim()) return;
    setSending(true);
    try {
      const response = await apiPost<{ success: boolean; data: ChatMessageDTO }>(
        `/api/chat/send/${contractId}`,
        { message: newMessage.trim() }
      );
      if (response?.success && response.data) {
        setMessages((prev) => [...prev, response.data]);
        setNewMessage('');
      }
    } catch {
      // Silent fail
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });

  // Group messages by date
  const groupedMessages: { date: string; messages: ChatMessageDTO[] }[] = [];
  messages.forEach((msg) => {
    const dateKey = new Date(msg.createdAt).toLocaleDateString('pt-BR');
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.date === dateKey) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ date: dateKey, messages: [msg] });
    }
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 450 }}>
      {/* Messages Area */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, backgroundColor: 'grey.50' }}>
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={24} />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6, color: 'text.secondary' }}>
            <Typography variant="body2">
              Nenhuma mensagem ainda. Envie a primeira mensagem!
            </Typography>
          </Box>
        ) : (
          groupedMessages.map((group) => (
            <Box key={group.date}>
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Chip label={group.date} size="small" variant="outlined" />
              </Box>
              {group.messages.map((msg) => {
                const isMine = msg.senderId === authState.userId;
                return (
                  <Box
                    key={msg.messageId}
                    sx={{
                      display: 'flex',
                      justifyContent: isMine ? 'flex-end' : 'flex-start',
                      mb: 1.5,
                    }}
                  >
                    <Box sx={{ display: 'flex', gap: 1, maxWidth: '75%', flexDirection: isMine ? 'row-reverse' : 'row' }}>
                      <Avatar
                        src={msg.senderPhotoUrl || undefined}
                        sx={{ width: 32, height: 32, bgcolor: isMine ? 'primary.main' : 'secondary.main', mt: 0.5 }}
                      >
                        <PersonIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Box>
                        <Paper
                          elevation={0}
                          sx={{
                            p: 1.5,
                            backgroundColor: isMine ? 'primary.main' : 'white',
                            color: isMine ? 'white' : 'text.primary',
                            borderRadius: 2,
                            borderTopRightRadius: isMine ? 0 : 2,
                            borderTopLeftRadius: isMine ? 2 : 0,
                          }}
                        >
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {msg.message}
                          </Typography>
                        </Paper>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: 'block', textAlign: isMine ? 'right' : 'left', mt: 0.25 }}
                        >
                          {isMine ? '' : msg.senderName.split(' ')[0] + ' · '}
                          {formatTime(msg.createdAt)}
                          {isMine && (msg.isRead ? ' · Lida' : ' · Enviada')}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          ))
        )}
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input Area */}
      <Box sx={{ display: 'flex', gap: 1, p: 2, backgroundColor: 'white' }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Escreva uma mensagem..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          multiline
          maxRows={3}
          disabled={sending}
          variant="outlined"
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={!newMessage.trim() || sending}
          sx={{ alignSelf: 'flex-end' }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
