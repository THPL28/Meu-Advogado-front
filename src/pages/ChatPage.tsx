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
} from 'lucide-react';
import { useLegalPlatform } from '../hooks/useLegalPlatform';
import { ChatMessage, ChatConversation } from '../types';
import { chatApi, proposalsApi, presenceApi, fmtChatDate } from '../services/api';
import { UserAvatar } from '../components/ui/UserAvatar';

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const POLL_INTERVAL_MS = 2_000;
const HEARTBEAT_MS     = 10_000;
const SCROLL_THRESHOLD = 120;

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function groupByDate(messages: ChatMessage[]): { date: string; msgs: ChatMessage[] }[] {
  const groups: { date: string; msgs: ChatMessage[] }[] = [];
  let lastDate = '';
  for (const m of messages) {
    const d = fmtChatDate(m.rawTimestamp || m.timestamp || new Date().toISOString());
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

// â”€â”€â”€ Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const ChatPage: React.FC = () => {
  const {
    user,
    activeConversationId,
    setActiveConversationId,
    role,
    refreshData,
    sidebarState,
    setSidebarState,
    openLawyerProfile,
  } = useLegalPlatform();

  const [conversations, setConversations]   = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId]     = useState<string | null>(activeConversationId || null);
  const [messages, setMessages]             = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage]     = useState('');
  const [sending, setSending]               = useState(false);
  const [accepting, setAccepting]           = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [searchTerm, setSearchTerm]         = useState('');
  const [showScrollBtn, setShowScrollBtn]   = useState(false);
  const [newMsgCount, setNewMsgCount]       = useState(0);
  const [otherUserOnline, setOtherUserOnline] = useState(false);
  const [isLoading, setIsLoading]           = useState(false);

  const messagesEndRef  = useRef<HTMLDivElement>(null);
  const scrollAreaRef   = useRef<HTMLDivElement>(null);
  const pollTimerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const heartbeatRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeConvIdRef = useRef<string | null>(null);
  const messagesRef     = useRef<ChatMessage[]>([]);
  const conversationsRef = useRef<ChatConversation[]>([]);

  useEffect(() => { activeConvIdRef.current = activeConvId; }, [activeConvId]);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { conversationsRef.current = conversations; }, [conversations]);

  const isFocusMode = sidebarState === 'hidden' || sidebarState === 'collapsed';

  // â”€â”€ Presence heartbeat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    presenceApi.heartbeat();
    heartbeatRef.current = setInterval(() => presenceApi.heartbeat(), HEARTBEAT_MS);
    return () => { if (heartbeatRef.current) clearInterval(heartbeatRef.current); };
  }, []);

  // â”€â”€ Scroll helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

  // â”€â”€ Load conversations â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    (async () => {
      setIsLoading(true);
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
        const firstId = activeConversationId || (convs.length > 0 ? convs[0].id : null);
        if (firstId) {
          setActiveConvId(firstId);
          setMobileShowThread(!!activeConversationId);
        }
      } finally {
        setIsLoading(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConversationId]);

  // â”€â”€ Load messages on conv change â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    if (!activeConvId) { setMessages([]); return; }
    setMessages([]);
    setIsLoading(true);
    chatApi.getMessages(activeConvId).then((msgs) => {
      setMessages(msgs);
      setIsLoading(false);
      setTimeout(() => scrollToBottom(true), 60);
    }).catch(() => setIsLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConvId]);

  // â”€â”€ Polling loop (2s) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
              c.id === convId ? { ...c, lastMessage: last.content, lastMessageTime: last.timestamp } : c
            )
          );
        }
        // Presence: mark other as online if they sent a message < 60s ago
        const convMsgs = messagesRef.current;
        const lastFromOther = [...convMsgs].reverse().find((m) => m.senderId !== user?.id);
        setOtherUserOnline(presenceApi.isOtherOnline(lastFromOther?.rawTimestamp));
      } catch { /* silent */ }
    }, POLL_INTERVAL_MS);

    return () => { if (pollTimerRef.current) clearInterval(pollTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeConvId]);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  // â”€â”€ Select conversation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSelectConv = (id: string) => {
    if (id === activeConvId) return;
    setActiveConvId(id);
    setActiveConversationId(id);
    setMobileShowThread(true);
    setNewMsgCount(0);
    setShowScrollBtn(false);
  };

  // â”€â”€ Send message (with optimistic UI) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text || !activeConvId || sending) return;
    if (activeConv?.state === 'READ_ONLY') return;

    setInputMessage('');
    setSending(true);

    const optimisticId = 'opt_' + Date.now();
    const optimistic: ChatMessage = {
      id: optimisticId,
      conversationId: activeConvId,
      senderId: user?.id || '',
      senderName: user?.name || 'VocÃª',
      senderAvatar: user?.avatarUrl || '',
      content: text,
      rawTimestamp: new Date().toISOString(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
      isDelivered: false,
      isSending: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setTimeout(() => scrollToBottom(true), 30);

    try {
      const sent = await chatApi.sendMessage(
        activeConvId,
        text,
        undefined,
        activeConv?.otherUser?.id,
        otherUserOnline,
      );
      setMessages((prev) =>
        prev.map((m) => m.id === optimisticId ? { ...sent, isDelivered: true, isSending: false } : m)
      );
      setConversations((prev) =>
        prev.map((c) => c.id === activeConvId
          ? { ...c, lastMessage: sent.content, lastMessageTime: sent.timestamp }
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

  // â”€â”€ Accept proposal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleAcceptProposalFromChat = async () => {
    if (!activeConv?.proposalId) return;
    setAccepting(true);
    try {
      await proposalsApi.acceptProposal(activeConv.proposalId);
      await refreshData();
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

  // â”€â”€â”€ render â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  return (
    <div className="h-full w-full flex overflow-hidden bg-background animate-in fade-in duration-150">

      {/* â”€â”€ Left Sidebar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className={`w-full md:w-80 lg:w-[340px] xl:w-[370px] h-full flex flex-col shrink-0 bg-card border-r border-border/70 z-10 ${
        mobileShowThread ? 'hidden md:flex' : 'flex'
      }`}>
        <div className="p-4 border-b border-border/70 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Mensagens
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-bold">{conversations.length}</span>
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
              <p className="text-xs text-muted-foreground">Nenhuma conversa ainda.</p>
              <p className="text-[11px] text-muted-foreground/60">As conversas aparecem quando um advogado envia uma proposta.</p>
            </div>
          ) : (
            filteredConvs.map((conv) => {
              const isSelected = activeConvId === conv.id;
              const convOnline = presenceApi.isOtherOnline(conv.lastMessageRaw);
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
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ring-2 ring-white rounded-full transition-colors ${convOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
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

      {/* â”€â”€ Right Thread Panel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                NegociaÃ§Ã£o e execuÃ§Ã£o acontecem aqui â€” seguro e privado entre as partes.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* â”€â”€ Header â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                    onClick={() => activeConv.otherUser && openLawyerProfile(activeConv.otherUser.id || activeConv.otherUser.name)}
                    className="cursor-pointer shrink-0 relative"
                  >
                    <UserAvatar src={activeConv.otherUser.avatar} name={activeConv.otherUser.name} size="lg" />
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ring-2 ring-white rounded-full transition-colors ${otherUserOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  </div>

                  <div className="min-w-0">
                    <h3
                      onClick={() => activeConv.otherUser && openLawyerProfile(activeConv.otherUser.id || activeConv.otherUser.name)}
                      className="text-sm font-extrabold text-foreground cursor-pointer hover:text-emerald-600 transition-colors truncate flex items-center gap-1.5"
                    >
                      <span className="truncate">{activeConv.otherUser.name}</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${otherUserOnline ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      <span>{otherUserOnline ? 'Online agora' : 'Offline'}</span>
                      <span className="mx-1 opacity-40">Â·</span>
                      <Briefcase className="w-3 h-3 shrink-0" />
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
                    {activeConv.state === 'EXECUCAO' ? 'Em ExecuÃ§Ã£o'
                      : activeConv.state === 'READ_ONLY' ? 'Encerrada'
                      : 'NegociaÃ§Ã£o'}
                  </span>
                </span>
              </div>

              {/* Proposal banner */}
              {activeConv.state !== 'EXECUCAO' && activeConv.proposalId && (
                <div className="p-3 bg-background rounded-xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground flex items-center gap-2 truncate">
                        Proposta de HonorÃ¡rios
                        <span className="text-emerald-600 font-mono font-bold">
                          R$ {(activeConv.proposalValue || 0).toLocaleString('pt-BR')}
                        </span>
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {activeConv.lawyerName} Â· Aguardando aceite para iniciar o mandato
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
                      {accepting ? 'Processando...' : 'Aceitar e Depositar CustÃ³dia'}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* â”€â”€ Messages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
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
                    Conversa segura e privada. Apenas vocÃª e <strong>{activeConv.otherUser.name}</strong> tÃªm acesso.
                  </p>
                  <p className="text-[11px] text-muted-foreground/60">Envie a primeira mensagem!</p>
                </div>
              ) : (
                messageGroups.map((group) => (
                  <div key={group.date}>
                    {/* Date separator */}
                    <div className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-border/50" />
                      <span className="text-[11px] font-semibold text-muted-foreground bg-white/80 dark:bg-card/80 backdrop-blur-sm px-3 py-1 rounded-full border border-border/50 shadow-sm">
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
                              <div className="shrink-0 mr-2 self-end mb-1">
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

                                {msg.attachments && msg.attachments.length > 0 && (
                                  <div className="space-y-1.5 mt-2 pt-2 border-t border-white/20">
                                    {msg.attachments.map((att) => (
                                      <div key={att.id} className={`flex items-center justify-between gap-2 px-2 py-1.5 rounded-lg text-xs ${
                                        isMe ? 'bg-white/15' : 'bg-muted border border-border'
                                      }`}>
                                        <div className="flex items-center gap-2 overflow-hidden">
                                          <FileText className="w-3.5 h-3.5 shrink-0" />
                                          <span className="truncate font-medium">{att.name}</span>
                                          <span className="opacity-60 shrink-0">{att.size}</span>
                                        </div>
                                        <Download className="w-3.5 h-3.5 cursor-pointer hover:opacity-80 shrink-0" />
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className={`flex items-center gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                  <span className={`text-[10px] font-mono ${isMe ? 'text-white/60' : 'text-muted-foreground'}`}>
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

            {/* â”€â”€ Input â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
            <div className="shrink-0 bg-card border-t border-border/70 px-4 py-3 z-20">
              {activeConv.state === 'READ_ONLY' ? (
                <div className="p-3 bg-background border border-border rounded-xl text-center text-xs text-muted-foreground font-semibold flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4" />
                  Esta conversa foi encerrada e estÃ¡ em modo somente leitura.
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2.5 text-muted-foreground hover:text-foreground rounded-xl bg-muted hover:bg-muted/80 transition-colors shrink-0 cursor-pointer"
                    title="Anexar arquivo"
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
                        ? 'Mensagem segura â€” apenas vocÃª e o advogado tÃªm acesso...'
                        : 'Escreva sua mensagem de negociaÃ§Ã£o...'
                    }
                    autoComplete="off"
                    className="flex-1 bg-background border border-border rounded-2xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-600 transition-all"
                  />

                  <button
                    type="submit"
                    disabled={sending || !inputMessage.trim()}
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

              <div className="flex items-center justify-center gap-1.5 mt-2">
                <Lock className="w-3 h-3 text-muted-foreground/50" />
                <span className="text-[10px] text-muted-foreground/50">
                  Conversa privada e segura â€” somente as partes contratantes tÃªm acesso
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

