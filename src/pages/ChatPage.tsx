import React, { useState, useEffect, useRef } from 'react';
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
  Maximize2,
  Minimize2,
  Briefcase,
  User,
  Clock
} from 'lucide-react';
import { useLegalPlatform } from '../hooks/useLegalPlatform';
import { ChatMessage, ChatConversation } from '../types';
import { chatApi, proposalsApi } from '../services/api';

export const ChatPage: React.FC = () => {
  const {
    user,
    activeConversationId,
    setActiveConversationId,
    role,
    refreshData,
    sidebarState,
    setSidebarState,
    openLawyerProfile
  } = useLegalPlatform();

  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(activeConversationId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isFocusMode = sidebarState === 'hidden' || sidebarState === 'collapsed';

  const toggleFocusMode = () => {
    if (sidebarState === 'expanded') {
      setSidebarState('collapsed');
    } else {
      setSidebarState('expanded');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    async function loadChatData() {
      const convs = await chatApi.getConversations();
      setConversations(convs);
      if (activeConversationId) {
        setActiveConvId(activeConversationId);
        setMobileShowThread(true);
      }
    }
    loadChatData();
  }, [activeConversationId]);

  useEffect(() => {
    async function loadThread() {
      if (!activeConvId) {
        setMessages([]);
        return;
      }
      const msgs = await chatApi.getMessages(activeConvId);
      setMessages(msgs);
    }
    loadThread();
  }, [activeConvId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const handleSelectConv = (id: string) => {
    setActiveConvId(id);
    setActiveConversationId(id);
    setMobileShowThread(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeConvId) return;
    if (activeConv?.state === 'READ_ONLY') return;

    setSending(true);
    try {
      const newMsg = await chatApi.sendMessage(activeConvId, inputMessage);
      setMessages((prev) => [...prev, newMsg]);
      setInputMessage('');

      // Refresh list to update lastMessage
      const updatedConvs = await chatApi.getConversations();
      setConversations(updatedConvs);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleAcceptProposalFromChat = async () => {
    if (!activeConv?.proposalId) return;
    setAccepting(true);
    try {
      await proposalsApi.acceptProposal(activeConv.proposalId);
      await refreshData();
      const updatedConvs = await chatApi.getConversations();
      setConversations(updatedConvs);
      const updatedMsgs = await chatApi.getMessages(activeConvId);
      setMessages(updatedMsgs);
      alert('🎉 Proposta aceita com sucesso! Custódia depositada em garantia (Escrow) e chat de execução liberado.');
    } catch (err) {
      console.error('Falha ao aceitar proposta:', err);
    } finally {
      setAccepting(false);
    }
  };

  const filteredConversations = conversations.filter(c =>
    c.otherUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full w-full flex overflow-hidden bg-background animate-in fade-in duration-150">
      
      {/* 1. Left Conversations Sidebar (Independent Scroll Column) */}
      <div className={`w-full md:w-80 lg:w-[350px] xl:w-[380px] h-full flex flex-col shrink-0 bg-card/90 border-r border-border/70 z-10 ${
        mobileShowThread ? 'hidden md:flex' : 'flex'
      }`}>
        {/* Sidebar Header & Search */}
        <div className="p-4 border-b border-border/70 bg-card/95 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-foreground flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-600" />
              Mensagens
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground/90 text-[11px] font-bold">
              {conversations.length} conversas
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/90" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar conversas..."
              className="w-full bg-background border border-border rounded-xl pl-9 pr-3 py-2 text-xs text-foreground/90 placeholder:text-muted-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all font-medium"
            />
          </div>
        </div>

        {/* Conversations List (Independent Scroll) */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/50/80">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground/90 text-xs">
              Nenhuma conversa encontrada.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = activeConvId === conv.id;
              const isNegotiation = conv.state === 'NEGOCIACAO' || !conv.state;
              const isExecution = conv.state === 'EXECUCAO';
              const isReadOnly = conv.state === 'READ_ONLY';

              return (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConv(conv.id)}
                  className={`p-4 cursor-pointer transition-all flex items-start gap-3 relative ${
                    isSelected
                      ? 'bg-emerald-50/50 border-l-4 border-emerald-600 font-semibold'
                      : 'hover:bg-background/80'
                  }`}
                >
                  <div className="relative shrink-0 mt-0.5">
                    <img
                      src={conv.otherUser.avatar}
                      alt={conv.otherUser.name}
                      className="w-11 h-11 rounded-2xl object-cover ring-2 ring-border/50/80"
                    />
                    {conv.otherUser.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 ring-2 ring-white rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-foreground truncate pr-2">{conv.otherUser.name}</span>
                      <span className="text-xs text-muted-foreground/90 shrink-0 font-mono font-medium">{conv.lastMessageTime}</span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-1">
                      <p className="text-sm text-muted-foreground/90 truncate leading-tight pr-2">{conv.lastMessage}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Right Chat Conversation Stream (Full Available Space) */}
      <div className={`flex-1 h-full flex flex-col bg-background min-w-0 relative ${
        !mobileShowThread ? 'hidden md:flex' : 'flex'
      }`}>
        {!activeConv ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="text-base font-bold text-foreground">Selecione uma conversa para visualizar as mensagens.</h3>
            <p className="text-xs text-muted-foreground/90 max-w-sm">
              Escolha uma conversa na lista lateral para negociar honorários, tirar dúvidas ou acompanhar a execução dos casos.
            </p>
          </div>
        ) : (
          <>
            {/* Fixed Chat Thread Header */}
            <div className="shrink-0 bg-card/95 border-b border-border/70 p-3 sm:p-4 flex flex-col gap-3 shadow-2xs z-10">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Back Button on Mobile */}
                  <button
                    onClick={() => setMobileShowThread(false)}
                    className="p-2 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 md:hidden shrink-0"
                    aria-label="Voltar para conversas"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <img
                    src={activeConv.otherUser.avatar}
                    alt={activeConv.otherUser.name}
                    onClick={() => { if (activeConv.otherUser) openLawyerProfile(activeConv.otherUser.id || activeConv.otherUser.name); }}
                    className="w-11 h-11 rounded-2xl object-cover ring-2 ring-emerald-500/30 cursor-pointer hover:opacity-90 transition-opacity shrink-0"
                    title="Ver perfil completo"
                  />

                  <div className="min-w-0">
                    <h3
                      onClick={() => { if (activeConv.otherUser) openLawyerProfile(activeConv.otherUser.id || activeConv.otherUser.name); }}
                      className="text-sm sm:text-base font-extrabold text-foreground flex items-center gap-2 cursor-pointer hover:text-emerald-600 transition-colors truncate"
                    >
                      <span className="truncate">{activeConv.otherUser.name}</span>
                    </h3>
                    <p className="text-xs text-muted-foreground/90 font-semibold truncate flex items-center gap-1">
                      <Briefcase className="w-3 h-3 text-muted-foreground/90 shrink-0" />
                      <span className="truncate">{activeConv.jobTitle}</span>
                    </p>
                  </div>
                </div>

                {/* Top State Badge */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
                    activeConv.state === 'EXECUCAO'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : activeConv.state === 'READ_ONLY'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {activeConv.state === 'EXECUCAO' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    {activeConv.state === 'READ_ONLY' && <Lock className="w-3.5 h-3.5 text-rose-600" />}
                    {(!activeConv.state || activeConv.state === 'NEGOCIACAO') && <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />}
                    <span className="hidden sm:inline">
                      {activeConv.state === 'EXECUCAO' ? 'Em Execução' : activeConv.state === 'READ_ONLY' ? 'Somente Leitura' : 'Chat Ativo'}
                    </span>
                  </span>
                </div>
              </div>

              {/* Proposal Banner during Negotiation */}
              {activeConv.state !== 'EXECUCAO' && activeConv.proposalId ? (
                /* Compact Negotiation Proposal Banner */
                <div className="p-3 bg-background rounded-2xl border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center shrink-0 shadow-2xs">
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-foreground flex items-center gap-2 truncate">
                        Proposta de Honorários
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">
                          R$ {(activeConv.proposalValue || 8000).toLocaleString('pt-BR')}
                        </span>
                      </p>
                      <p className="text-[11px] text-muted-foreground/90 truncate">
                        Advogado: {activeConv.lawyerName} • Aguardando aceite para início
                      </p>
                    </div>
                  </div>

                  {role === 'CLIENT' && activeConv.state !== 'READ_ONLY' && (
                    <button
                      type="button"
                      onClick={handleAcceptProposalFromChat}
                      disabled={accepting}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {accepting ? 'Processando...' : 'Aceitar e Depositar Custódia'}
                    </button>
                  )}
                </div>
              ) : null}
            </div>

            {/* 3. Message Stream (Independent Scroll Area) */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-background">
              {messages.map((msg) => {
                const isMe = msg.senderId === user?.id;
                const isSystem = msg.senderId === 'system';

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex justify-center my-3">
                      <div className="max-w-md px-4 py-1.5 bg-muted border border-border/80 rounded-full text-center space-y-0.5 shadow-2xs">
                        <p className="text-xs font-bold text-muted-foreground">{msg.content}</p>
                        <span className="text-[10px] text-muted-foreground/90 font-mono block">{msg.timestamp}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[88%] sm:max-w-xl p-4 rounded-2xl space-y-2 shadow-2xs ${
                        isMe
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-card text-foreground/90 border border-border/80 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm leading-relaxed font-sans font-normal">{msg.content}</p>

                      {/* Moderation Warning Badge */}
                      {msg.wasModerated && (
                        <div className="p-2 bg-amber-500/20 rounded-xl text-xs text-amber-900 border border-amber-300/40 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Filtro de Evasão: Dados de contato pessoal ocultados para proteção do contrato.</span>
                        </div>
                      )}

                      {/* Attachment Card Preview inside Chat */}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="space-y-2 pt-1">
                          {msg.attachments.map((att) => (
                            <div
                              key={att.id}
                              className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                                isMe
                                  ? 'bg-emerald-700/60 border-emerald-500/40 text-white'
                                  : 'bg-background border-border text-foreground/90'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 overflow-hidden">
                                <FileText className={`w-4 h-4 shrink-0 ${isMe ? 'text-white' : 'text-emerald-600'}`} />
                                <div className="overflow-hidden">
                                  <p className="font-bold text-xs truncate max-w-[140px] sm:max-w-[200px]">{att.name}</p>
                                  <span className="text-[10px] opacity-80">{att.size} • {att.type}</span>
                                </div>
                              </div>
                              <Download className="w-4 h-4 cursor-pointer hover:opacity-80 shrink-0 ml-2" />
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-1 pt-1">
                        <span className={`text-[10px] font-mono ${isMe ? 'text-emerald-100' : 'text-muted-foreground/90'}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* 4. Fixed Bottom Input Form (Pinned to bottom) */}
            <div className="shrink-0 bg-card border-t border-border/80 p-3 sm:p-4 z-20">
              {activeConv.state === 'READ_ONLY' ? (
                <div className="p-3 bg-background border border-border rounded-xl text-center text-xs text-muted-foreground/90 font-bold flex items-center justify-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground/90" />
                  Esta conversa foi encerrada e está mantida em modo somente leitura.
                </div>
              ) : (
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-2.5 text-muted-foreground/90 hover:text-foreground rounded-xl bg-muted hover:bg-muted/80 transition-colors shrink-0 cursor-pointer"
                    title="Anexar arquivo / documento"
                  >
                    <Paperclip className="w-4.5 h-4.5" />
                  </button>

                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={
                      activeConv.state === 'EXECUCAO'
                        ? 'Escreva sua mensagem ou envie documentação do processo...'
                        : 'Escreva sua mensagem de negociação...'
                    }
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all font-medium"
                  />

                  <button
                    type="submit"
                    disabled={sending || !inputMessage.trim()}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-2xs transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                  >
                    <span>Enviar</span>
                    <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </form>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );
};
