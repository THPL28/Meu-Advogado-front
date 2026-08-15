import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Paperclip,
  FileText,
  ShieldCheck,
  Download,
  ArrowLeft,
  AlertTriangle,
  Lock,
  CheckCircle2,
  FileCheck2,
  ChevronDown,
  Check,
  CheckCheck,
  Briefcase,
  X,
  File,
} from 'lucide-react';
import { useLegalPlatform } from '../hooks/useLegalPlatform';
import { ChatMessage, ChatConversation, Role } from '../types';
import { chatApi, proposalsApi, presenceApi, fmtChatDate, normalizeDate, documentsApi } from '../services/api';
import { UserAvatar } from '../components/ui/UserAvatar';

// ─── Constants ────────────────────────────────────────────────────────────────
const POLL_INTERVAL_MS = 2_000;
const HEARTBEAT_MS     = 10_000;
const SCROLL_THRESHOLD = 120;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parseTs(raw?: string): number {
  if (!raw) return 0;
  try {
    const d = normalizeDate(raw);
    const t = d.getTime();
    if (!isNaN(t)) return t;
  } catch {}
  return 0;
}

function groupByDate(messages: ChatMessage[]): { date: string; msgs: ChatMessage[] }[] {
  if (!messages || messages.length === 0) return [];

  // Sort chronologically so date groups are strictly contiguous
  const sorted = [...messages].sort((a, b) => parseTs(a.rawTimestamp) - parseTs(b.rawTimestamp));

  const groups: { date: string; msgs: ChatMessage[] }[] = [];
  let lastDate = '';

  for (const m of sorted) {
    const rawForDate = m.rawTimestamp || new Date().toISOString();
    const d = fmtChatDate(rawForDate) || 'Hoje';

    if (d !== lastDate) {
      groups.push({ date: d, msgs: [] });
      lastDate = d;
    }
    groups[groups.length - 1].msgs.push(m);
  }

  return groups;
}

function ReadReceipt({ msg, isMe }: { msg: ChatMessage; isMe: boolean }) {
  if (!isMe) return null;
  if (msg.isSending) return <span className="w-3 h-3 border border-emerald-200 rounded-full border-t-transparent animate-spin inline-block" />;
  if (msg.sendFailed) return <AlertTriangle className="w-3 h-3 text-red-300" />;
  if (msg.isReadByOther) return <CheckCheck className="w-3.5 h-3.5 text-sky-300" title="Lido" />;
  if (msg.isDelivered)   return <CheckCheck className="w-3.5 h-3.5 text-emerald-200/80" title="Entregue" />;
  return <Check className="w-3.5 h-3.5 text-emerald-200/80" title="Enviado" />;
}

interface PendingAttachment {
  id: string;
  name: string;
  size: string;
  type: 'PDF' | 'DOCX' | 'XLSX' | 'PNG' | 'JPG';
  file: File;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const ChatPage: React.FC = () => {
  const {
    user,
    activeConversationId,
    setActiveConversationId,
    role,
    refreshData,
    openLawyerProfile,
    openClientProfile,
  } = useLegalPlatform();

  // Instant Hydration from Cache (0ms latency, eliminates any white screen flash)
  const cachedConvs = chatApi.getCachedConversations();
  const initialActiveConvId = activeConversationId || (cachedConvs.length > 0 ? cachedConvs[0].id : null);

  const [conversations, setConversations]   = useState<ChatConversation[]>(cachedConvs);
  const [activeConvId, setActiveConvId]     = useState<string | null>(initialActiveConvId);
  const [messages, setMessages]             = useState<ChatMessage[]>(() => {
    return initialActiveConvId ? chatApi.getCachedMessages(initialActiveConvId) : [];
  });

  const [inputMessage, setInputMessage]     = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [sending, setSending]               = useState(false);
  const [accepting, setAccepting]           = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(Boolean(initialActiveConvId));
  const [searchTerm, setSearchTerm]         = useState('');
  const [showScrollBtn, setShowScrollBtn]   = useState(false);
  const [newMsgCount, setNewMsgCount]       = useState(0);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [isLoading, setIsLoading]           = useState(false);

  const messagesEndRef  = useRef<HTMLDivElement>(null);
  const scrollAreaRef   = useRef<HTMLDivElement>(null);
  const fileInputRef    = useRef<HTMLInputElement>(null);
  const pollTimerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeConvIdRef = useRef<string | null>(null);
  const messagesRef     = useRef<ChatMessage[]>([]);
  const otherLastActiveRef = useRef<number>(0);

  useEffect(() => { activeConvIdRef.current = activeConvId; }, [activeConvId]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // ── Role-aware Profile Navigation ─────────────────────────────────────────
  const handleOpenProfile = (otherUser?: { id?: string; name?: string; role?: Role }) => {
    if (!otherUser) return;
    if (otherUser.role === 'CLIENT') {
      openClientProfile(otherUser.id || '');
    } else {
      openLawyerProfile(otherUser.id || otherUser.name || '');
    }
  };

  // ── Presence Heartbeat (every 10s with current user ID) ───────────────────
  useEffect(() => {
    presenceApi.heartbeat(user?.id);
    heartbeatRef.current = setInterval(() => {
      presenceApi.heartbeat(user?.id);
    }, HEARTBEAT_MS);
    return () => { if (heartbeatRef.current) clearInterval(heartbeatRef.current); };
  }, [user?.id]);

  // ── Scroll helpers ────────────────────────────────────────────────────────
  const isNearBottom = useCallback((): boolean => {
    const el = scrollAreaRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < SCROLL_THRESHOLD;
  }, []);

  const scrollToBottom = useCallback((force = false) => {
    if (force || isNearBottom()) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setShowScrollBtn(false);
      setNewMsgCount(0);
    }
  }, [isNearBottom]);

  const handleScroll = useCallback(() => {
    if (isNearBottom()) { setShowScrollBtn(false); setNewMsgCount(0); }
  }, [isNearBottom]);

  // ── Load conversations in background ──────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        let convs = await chatApi.getConversations();
        if (activeConversationId && !convs.some((c) => c.id === activeConversationId)) {
          if (activeConversationId.startsWith('conv_prop_')) {
            const extra = await chatApi.getOrCreateNegotiationChat(
              activeConversationId.replace('conv_prop_', '')
            ).catch(() => null);
            if (extra) convs = [extra, ...convs];
          }
        }
        setConversations(convs);
        const firstId = activeConversationId || (convs.length > 0 ? (activeConvId || convs[0].id) : null);
        if (firstId && firstId !== activeConvId) {
          setActiveConvId(firstId);
        }
      } catch (err) {
        console.warn('Error loading conversations:', err);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  // ── Load messages on conversation change (with instant cache hydration) ────
  useEffect(() => {
    if (!activeConvId) {
      setMessages([]);
      return;
    }

    // Hydrate immediately from memory cache to avoid any white screen
    const cached = chatApi.getCachedMessages(activeConvId);
    if (cached.length > 0) {
      setMessages(cached);
      setIsLoading(false);
      setTimeout(() => scrollToBottom(true), 30);
    } else {
      setIsLoading(true);
    }

    // Fetch fresh messages from API
    chatApi.getMessages(activeConvId).then((msgs) => {
      setMessages(msgs);
      setIsLoading(false);

      // Track last activity of other user
      const lastFromOther = [...msgs].reverse().find((m) => m.senderId !== user?.id);
      if (lastFromOther?.rawTimestamp) {
        otherLastActiveRef.current = parseTs(lastFromOther.rawTimestamp);
      }

      // Check online status immediately
      const activeConvObj = conversations.find((c) => c.id === activeConvId);
      const isOnline = presenceApi.isOtherOnline(activeConvObj?.otherUser?.id, lastFromOther?.rawTimestamp);
      setOtherUserOnline(isOnline);

      setTimeout(() => scrollToBottom(true), 60);
    }).catch(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConvId]);

  // ── Polling loop (2s) ─────────────────────────────────────────────────────
  useEffect(() => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    if (!activeConvId) return;

    pollTimerRef.current = setInterval(async () => {
      const convId = activeConvIdRef.current;
      if (!convId) return;

      try {
        const newMsgs = await chatApi.pollNewMessages(convId, messagesRef.current);
        if (newMsgs.length > 0) {
          setMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id));
            const fresh = newMsgs.filter((m) => !existingIds.has(m.id));
            if (fresh.length === 0) return prev;

            // Track if other user sent a message just now
            const latestFromOther = [...fresh].reverse().find((m) => m.senderId !== user?.id);
            if (latestFromOther?.rawTimestamp) {
              const ts = parseTs(latestFromOther.rawTimestamp);
              if (ts > otherLastActiveRef.current) otherLastActiveRef.current = ts;
            }

            const updated = [...prev, ...fresh];
            if (isNearBottom()) {
              setTimeout(() => scrollToBottom(true), 30);
            } else {
              setShowScrollBtn(true);
              setNewMsgCount((c) => c + fresh.length);
            }
            return updated;
          });

          // Update sidebar last message
          const last = newMsgs[newMsgs.length - 1];
          setConversations((prev) =>
            prev.map((c) =>
              c.id === convId ? { ...c, lastMessage: last.content, lastMessageTime: last.timestamp, lastMessageRaw: last.rawTimestamp } : c
            )
          );
        }

        // Real-time presence check
        const currentConv = conversations.find((c) => c.id === convId);
        const lastFromOther = [...messagesRef.current].reverse().find((m) => m.senderId !== user?.id);
        const isOnline = presenceApi.isOtherOnline(currentConv?.otherUser?.id, lastFromOther?.rawTimestamp);
        setOtherUserOnline(isOnline);
      } catch { /* silent */ }
    }, POLL_INTERVAL_MS);

    return () => { if (pollTimerRef.current) clearInterval(pollTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConvId, conversations]);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // ── Select conversation ───────────────────────────────────────────────────
  const handleSelectConv = (id: string) => {
    if (id === activeConvId) return;
    setActiveConvId(id);
    setActiveConversationId(id);
    setMobileShowThread(true);
    setNewMsgCount(0);
    setShowScrollBtn(false);
  };

  // ── File Selection Handler ────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = Array.from(files);
    const newAttachments: PendingAttachment[] = fileList.map((f: File) => {
      const ext = f.name.split('.').pop()?.toUpperCase() || 'PDF';
      let type: 'PDF' | 'DOCX' | 'XLSX' | 'PNG' | 'JPG' = 'PDF';
      if (ext === 'DOC' || ext === 'DOCX') type = 'DOCX';
      else if (ext === 'XLS' || ext === 'XLSX') type = 'XLSX';
      else if (ext === 'PNG') type = 'PNG';
      else if (ext === 'JPG' || ext === 'JPEG') type = 'JPG';

      const sizeStr = f.size > 1024 * 1024
        ? (f.size / (1024 * 1024)).toFixed(1) + ' MB'
        : Math.round(f.size / 1024) + ' KB';

      return {
        id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        name: f.name,
        size: sizeStr,
        type,
        file: f,
      };
    });

    setPendingAttachments((prev) => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removePendingAttachment = (id: string) => {
    setPendingAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // ── Send message (with attachments & optimistic UI) ──────────────────────
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if ((!text && pendingAttachments.length === 0) || !activeConvId || sending) return;
    if (activeConv?.state === 'READ_ONLY') return;

    const currentPending = [...pendingAttachments];
    setInputMessage('');
    setPendingAttachments([]);
    setSending(true);

    const nowIso = new Date().toISOString();
    const optimisticId = 'opt_' + Date.now();

    const formattedAttachments = currentPending.map((a) => ({
      id: a.id,
      name: a.name,
      size: a.size,
      type: a.type,
      url: '#',
    }));

    const optimistic: ChatMessage = {
      id: optimisticId,
      conversationId: activeConvId,
      senderId: user?.id || '',
      senderName: user?.name || 'Você',
      senderAvatar: user?.avatarUrl || '',
      content: text || (currentPending.length > 0 ? `[Arquivo Anexo: ${currentPending.map((a) => a.name).join(', ')}]` : ''),
      rawTimestamp: nowIso,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
      isDelivered: false,
      isSending: true,
      attachments: formattedAttachments.length > 0 ? formattedAttachments : undefined,
    };

    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => scrollToBottom(true), 30);

    try {
      // Upload pending files if any
      for (const att of currentPending) {
        documentsApi.uploadSecureDocument(att.file, {
          classification: 'RESTRICTED',
        }).catch(() => {});
      }

      const sent = await chatApi.sendMessage(
        activeConvId,
        text || (currentPending.length > 0 ? `[Arquivo Anexo: ${currentPending.map((a) => a.name).join(', ')}]` : ''),
        formattedAttachments.length > 0 ? formattedAttachments : undefined,
        activeConv?.otherUser?.id,
        otherUserOnline,
      );

      setMessages((prev) =>
        prev.map((m) => m.id === optimisticId ? { ...sent, isDelivered: true, isSending: false } : m)
      );
      setConversations((prev) =>
        prev.map((c) => c.id === activeConvId
          ? { ...c, lastMessage: sent.content, lastMessageTime: sent.timestamp, lastMessageRaw: sent.rawTimestamp }
          : c
        )
      );
    } catch {
      setMessages((prev) =>
        prev.map((m) => m.id === optimisticId ? { ...m, isSending: false, sendFailed: true } : m)
      );
    } finally {
      setSending(false);
    }
  };

  // ── Accept proposal ───────────────────────────────────────────────────────
  const handleAcceptProposalFromChat = async () => {
    if (!activeConv?.proposalId) return;
    setAccepting(true);
    try {
      await proposalsApi.acceptProposal(activeConv.proposalId);
      await refreshData(true);
      const convs = await chatApi.getConversations();
      setConversations(convs);
      const msgs = await chatApi.getMessages(activeConvId!);
      setMessages(msgs);
      setTimeout(() => scrollToBottom(true), 60);
    } catch (err) {
      console.error('Falha ao aceitar proposta:', err);
    } finally {
      setAccepting(false);
    }
  };

  const filteredConvs = conversations.filter((c) =>
    c.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const messageGroups = groupByDate(messages);

  return (
    <div className="h-full w-full flex overflow-hidden bg-background animate-in fade-in duration-150">

      {/* ── Left Sidebar (Conversations List) ─────────────────────────────── */}
      <div className={`w-full md:w-80 lg:w-[340px] xl:w-[370px] h-full flex flex-col shrink-0 bg-card border-r border-border/70 z-10 ${
        mobileShowThread ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-border/70 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Mensagens
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-bold">
              {conversations.length}
            </span>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar conversas..."
              className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-600 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-border/40">
          {filteredConvs.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-muted-foreground/40 mx-auto" />
              <p className="text-xs text-muted-foreground font-medium">Nenhuma conversa ainda.</p>
              <p className="text-[11px] text-muted-foreground/70">As conversas aparecem quando um advogado envia uma proposta.</p>
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const isSelected = activeConvId === conv.id;
              const convOnline = presenceApi.isOtherOnline(conv.otherUser?.id, conv.lastMessageRaw);
              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConv(conv.id)}
                  className={`w-full text-left p-4 flex items-start gap-3 relative transition-all focus-visible:outline-none border-l-4 ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-600'
                      : 'border-transparent hover:bg-muted/50'
                  }`}
                >
                  <div className="relative shrink-0 mt-0.5">
                    <UserAvatar src={conv.otherUser.avatar} name={conv.otherUser.name} size="lg" />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ring-2 ring-white rounded-full transition-colors ${
                      convOnline ? 'bg-emerald-500 ring-emerald-200' : 'bg-slate-300'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-foreground truncate">{conv.otherUser.name}</span>
                      <span className="text-[11px] text-muted-foreground shrink-0 font-mono">{conv.lastMessageTime}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1 gap-2">
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                      <div className="flex items-center gap-1 shrink-0">
                        {conv.state === 'EXECUCAO' && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">Ativo</span>
                        )}
                        {(conv.unreadCount || 0) > 0 && (
                          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ── Right Thread Panel ────────────────────────────────────────────── */}
      <div
        className={`flex-1 h-full flex flex-col min-w-0 relative ${!mobileShowThread ? 'hidden md:flex' : 'flex'}`}
        style={{ background: 'hsl(220 14% 96%)' }}
      >
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Selecione uma conversa</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Negociação e execução acontecem aqui — seguro e privado entre as partes.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Header ─────────────────────────────────────────────────── */}
            <div className="shrink-0 bg-card border-b border-border/70 px-4 py-3 flex flex-col gap-2.5 shadow-sm z-10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setMobileShowThread(false)}
                    className="p-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 md:hidden shrink-0"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div
                    onClick={() => handleOpenProfile(activeConv.otherUser)}
                    className="cursor-pointer shrink-0 relative hover:opacity-90 transition-opacity"
                    title={`Ver perfil de ${activeConv.otherUser.name}`}
                  >
                    <UserAvatar src={activeConv.otherUser.avatar} name={activeConv.otherUser.name} size="lg" />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ring-2 ring-white rounded-full transition-colors ${
                      otherUserOnline ? 'bg-emerald-500 ring-emerald-200' : 'bg-slate-300'
                    }`} />
                  </div>

                  <div className="min-w-0">
                    <h3
                      onClick={() => handleOpenProfile(activeConv.otherUser)}
                      className="text-sm font-extrabold text-foreground cursor-pointer hover:text-emerald-600 transition-colors truncate flex items-center gap-1.5"
                      title={`Ver perfil de ${activeConv.otherUser.name}`}
                    >
                      <span className="truncate">{activeConv.otherUser.name}</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1.5 truncate">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${
                        otherUserOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                      }`} />
                      <span className={otherUserOnline ? 'text-emerald-600 font-bold' : ''}>
                        {otherUserOnline ? 'Online agora' : 'Offline'}
                      </span>
                      <span className="opacity-40">·</span>
                      <Briefcase className="w-3 h-3 shrink-0 opacity-70" />
                      <span className="truncate">{activeConv.jobTitle}</span>
                    </p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1.5 shrink-0 ${
                  activeConv.state === 'EXECUCAO' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : activeConv.state === 'READ_ONLY' ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : 'bg-sky-50 text-sky-700 border border-sky-200'
                }`}>
                  {activeConv.state === 'EXECUCAO' && <CheckCircle2 className="w-3 h-3" />}
                  {activeConv.state === 'READ_ONLY' && <Lock className="w-3 h-3" />}
                  {(!activeConv.state || activeConv.state === 'NEGOCIACAO') && <ShieldCheck className="w-3 h-3" />}
                  <span className="hidden sm:inline">
                    {activeConv.state === 'EXECUCAO' ? 'Em Execução'
                      : activeConv.state === 'READ_ONLY' ? 'Encerrada'
                      : 'Negociação'}
                  </span>
                </span>
              </div>

              {/* Proposal Banner */}
              {activeConv.state !== 'EXECUCAO' && activeConv.proposalId && (
                <div className="p-3 bg-background rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground flex items-center gap-2 truncate">
                        Proposta de Honorários
                        <span className="text-emerald-600 font-mono font-bold">
                          R$ {(activeConv.proposalValue || 0).toLocaleString('pt-BR')}
                        </span>
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {activeConv.lawyerName} · Aguardando aceite para iniciar o mandato
                      </p>
                    </div>
                  </div>
                  {role === 'CLIENT' && activeConv.state !== 'READ_ONLY' && (
                    <button
                      type="button"
                      onClick={handleAcceptProposalFromChat}
                      disabled={accepting}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {accepting ? 'Processando...' : 'Aceitar e Depositar Custódia'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ── Messages Stream ────────────────────────────────────────── */}
            <div
              ref={scrollAreaRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto px-4 py-5 scroll-smooth"
              style={{
                backgroundImage: `radial-gradient(circle, hsl(220 14% 88%) 1px, transparent 1px)`,
                backgroundSize: '24px 24px',
              }}
            >
              {isLoading && messages.length === 0 ? (
                <div className="flex justify-center items-center h-32">
                  <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-center space-y-2">
                  <ShieldCheck className="w-10 h-10 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground max-w-xs">
                    Conversa segura e privada. Apenas você e <strong>{activeConv.otherUser.name}</strong> têm acesso.
                  </p>
                  <p className="text-[11px] text-muted-foreground/60">Envie a primeira mensagem ou anexe arquivos do processo!</p>
                </div>
              ) : (
                messageGroups.map((group) => (
                  <div key={group.date}>
                    {/* Unique Date Separator per Group */}
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-border/50" />
                      <span className="text-[11px] font-semibold text-muted-foreground bg-white/90 dark:bg-card/90 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50 shadow-sm">
                        {group.date}
                      </span>
                      <div className="flex-1 h-px bg-border/50" />
                    </div>

                    <div className="space-y-1.5">
                      {group.msgs.map((msg, i) => {
                        const isMe     = msg.senderId === user?.id;
                        const isSystem = msg.senderId === 'system';
                        const isSameAuthor = i > 0 && group.msgs[i - 1].senderId === msg.senderId;

                        if (isSystem) {
                          return (
                            <div key={msg.id} className="flex justify-center my-2">
                              <div className="px-4 py-1.5 bg-white/80 dark:bg-card/80 backdrop-blur-sm border border-border/50 rounded-full shadow-sm">
                                <p className="text-[11px] font-semibold text-muted-foreground">{msg.content}</p>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'} ${isSameAuthor ? 'mt-0.5' : 'mt-3'}`}
                          >
                            {!isMe && !isSameAuthor && (
                              <div
                                onClick={() => handleOpenProfile(activeConv.otherUser)}
                                className="shrink-0 mr-2 self-end mb-1 cursor-pointer hover:opacity-80 transition-opacity"
                              >
                                <UserAvatar src={activeConv.otherUser.avatar} name={activeConv.otherUser.name} size="sm" />
                              </div>
                            )}
                            {!isMe && isSameAuthor && <div className="w-7 mr-2 shrink-0" />}

                            <div className={`max-w-[78%] sm:max-w-lg flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                              <div className={`relative px-3.5 py-2.5 shadow-sm transition-opacity ${
                                isMe
                                  ? 'bg-emerald-600 text-white rounded-2xl rounded-br-md'
                                  : 'bg-white dark:bg-card text-foreground border border-border/60 rounded-2xl rounded-bl-md'
                              } ${msg.sendFailed || msg.isSending ? 'opacity-70' : ''}`}>

                                {msg.wasModerated && (
                                  <div className={`mb-2 px-2 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 ${
                                    isMe ? 'bg-white/15 text-white/90' : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                    <AlertTriangle className="w-3 h-3 shrink-0" />
                                    <span>Dados de contato ocultados pela plataforma.</span>
                                  </div>
                                )}

                                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>

                                {/* File Attachments inside message bubble */}
                                {msg.attachments && msg.attachments.length > 0 && (
                                  <div className="space-y-1.5 mt-2 pt-2 border-t border-white/20">
                                    {msg.attachments.map((att) => (
                                      <div
                                        key={att.id}
                                        className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs ${
                                          isMe ? 'bg-black/15 text-white' : 'bg-muted border border-border'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2.5 overflow-hidden">
                                          <File className="w-4 h-4 shrink-0" />
                                          <div className="truncate">
                                            <p className="truncate font-bold text-xs">{att.name}</p>
                                            <span className="opacity-75 text-[10px]">{att.size}</span>
                                          </div>
                                        </div>
                                        <a
                                          href={att.url || '#'}
                                          download={att.name}
                                          className={`p-1 rounded-lg hover:opacity-80 transition-opacity shrink-0 ${isMe ? 'text-white' : 'text-emerald-600'}`}
                                          title="Baixar arquivo"
                                        >
                                          <Download className="w-4 h-4" />
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <span className={`text-[10px] font-mono ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                                    {msg.timestamp}
                                  </span>
                                  <ReadReceipt msg={msg} isMe={isMe} />
                                </div>
                              </div>

                              {msg.sendFailed && (
                                <span className="text-[11px] text-red-500 mt-0.5 px-1">
                                  Falha ao enviar. Tente novamente.
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Scroll-to-bottom button */}
            {showScrollBtn && (
              <button
                onClick={() => scrollToBottom(true)}
                className="absolute bottom-24 right-5 z-20 flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-full shadow-lg text-xs font-bold text-foreground hover:bg-muted transition-all"
              >
                {newMsgCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {newMsgCount > 9 ? '9+' : newMsgCount}
                  </span>
                )}
                <ChevronDown className="w-4 h-4" />
              </button>
            )}

            {/* ── Input Box & Pending Attachments ────────────────────────── */}
            <div className="shrink-0 bg-card border-t border-border/70 px-4 py-3 z-20 space-y-2">
              
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.xlsx,.xls,.png,.jpg,.jpeg,.zip"
              />

              {/* Pending Attachments preview chips */}
              {pendingAttachments.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pb-1">
                  {pendingAttachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-xl border border-border text-xs font-semibold text-foreground animate-in fade-in"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate max-w-[140px]">{att.name}</span>
                      <span className="text-[10px] text-muted-foreground">({att.size})</span>
                      <button
                        type="button"
                        onClick={() => removePendingAttachment(att.id)}
                        className="p-0.5 hover:bg-background rounded-full text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeConv.state === 'READ_ONLY' ? (
                <div className="p-3 bg-background border border-border rounded-xl text-center text-xs text-muted-foreground font-semibold flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  Esta conversa foi encerrada e está em modo somente leitura.
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2.5 text-muted-foreground hover:text-foreground rounded-xl bg-muted hover:bg-muted/80 transition-colors shrink-0 cursor-pointer"
                    title="Anexar arquivo do processo"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e as any);
                      }
                    }}
                    placeholder={
                      activeConv.state === 'EXECUCAO'
                        ? 'Mensagem segura — apenas você e o advogado têm acesso...'
                        : 'Escreva sua mensagem de negociação...'
                    }
                    autoComplete="off"
                    className="flex-1 bg-background border border-border rounded-2xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-600 transition-all"
                  />

                  <button
                    type="submit"
                    disabled={sending || (!inputMessage.trim() && pendingAttachments.length === 0)}
                    className="w-10 h-10 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-full shadow-sm transition-all cursor-pointer shrink-0"
                    title="Enviar (Enter)"
                  >
                    {sending ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 stroke-[2.5]" />
                    )}
                  </button>
                </form>
              )}

              <div className="flex items-center justify-center gap-1.5 pt-0.5">
                <Lock className="w-3 h-3 text-muted-foreground/50" />
                <span className="text-[10px] text-muted-foreground/50">
                  Conversa privada e segura — somente as partes contratantes têm acesso
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
