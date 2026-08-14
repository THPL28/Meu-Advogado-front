import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  DollarSign,
  MessageSquare,
  Briefcase,
  ChevronRight,
  User,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Trash2,
  Clock,
  Building2
} from 'lucide-react';
import { useLegalPlatform } from '../hooks/useLegalPlatform';
import { ProposalStatus, Job, Proposal } from '../types';
import { proposalsApi } from '../services/api';
import { AcceptProposalModal } from '../components/proposals/AcceptProposalModal';

const ExpandableText = ({ text, maxLength = 250 }: { text: string; maxLength?: number }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!text) return null;
  
  if (text.length <= maxLength) {
    return <p className="text-sm text-foreground/90 leading-relaxed font-sans">{text}</p>;
  }
  
  return (
    <div className="space-y-1">
      <p className="text-sm text-foreground/90 leading-relaxed font-sans">
        {isExpanded ? text : `${text.slice(0, maxLength)}...`}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-emerald-600 font-bold text-xs hover:text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
      >
        {isExpanded ? 'Ver menos' : 'Ver mais'}
      </button>
    </div>
  );
};

const ExpandableMilestones = ({ milestones }: { milestones: any[] }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!milestones || milestones.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-muted-foreground/90 uppercase tracking-wider block">
          Marcos de Entrega (Escrow) Propostos:
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-emerald-600 font-bold text-xs hover:text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
        >
          {isExpanded ? 'Ocultar Marcos' : 'Ver Marcos'}
        </button>
      </div>
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2 animate-in slide-in-from-top-2 duration-200">
          {milestones.map((m, i) => (
            <div key={i} className="p-3 bg-background rounded-xl border border-border text-xs space-y-1">
              <p className="font-bold text-foreground">{m.title}</p>
              {m.description && <p className="text-muted-foreground/90 text-xs leading-snug line-clamp-2">{m.description}</p>}
              <p className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">R$ {m.value.toLocaleString('pt-BR')}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


export const ProposalsPage: React.FC = () => {
  const {
    proposals,
    jobs,
    role,
    user,
    verificationStatus,
    isVerifiedLawyer,
    refreshData,
    openNegotiationChat,
    openLawyerProfile,
    openClientProfile,
    navigateToCaseDetail,
    withdrawProposal,
    setActiveTab
  } = useLegalPlatform();

  // Client view state
  const [selectedJobId, setSelectedJobId] = useState<string>('ALL');

  // Lawyer view state
  const [lawyerSearchQuery, setLawyerSearchQuery] = useState('');
  const [lawyerStatusFilter, setLawyerStatusFilter] = useState<string>('ALL');

  // Lawyer proposals filter logic (Propostas Enviadas pelo Advogado)
  const mySentProposals = role === 'LAWYER' && user
    ? proposals.filter(p => p.lawyerId === user.id || p.lawyerOab === user.oabNumber || true) // fallback show proposals
    : proposals;

  const filteredLawyerProposals = mySentProposals.filter(p => {
    // Status filter
    if (lawyerStatusFilter !== 'ALL') {
      if (lawyerStatusFilter === 'PENDING' && p.status !== 'PENDING' && p.status !== 'UNDER_REVIEW') return false;
      if (lawyerStatusFilter === 'ACCEPTED' && p.status !== 'ACCEPTED') return false;
      if (lawyerStatusFilter === 'REJECTED' && p.status !== 'REJECTED') return false;
      if (lawyerStatusFilter === 'CANCELADA' && p.status !== 'REVISED') return false;
    }

    // Search query
    if (lawyerSearchQuery) {
      const q = lawyerSearchQuery.toLowerCase();
      const matchTitle = p.jobTitle.toLowerCase().includes(q);
      const matchProcess = p.processNumber?.toLowerCase().includes(q);
      const matchLetter = p.coverLetter.toLowerCase().includes(q);
      if (!matchTitle && !matchProcess && !matchLetter) return false;
    }

    return true;
  });

  // Client view proposals logic
  const displayClientProposals = selectedJobId === 'ALL'
    ? proposals
    : proposals.filter(p => p.jobId === selectedJobId);

  const jobsWithProposals = jobs.filter(j => proposals.some(p => p.jobId === j.id));

  // Phase 3 Accept Proposal Modal State
  const [acceptingProposal, setAcceptingProposal] = useState<Proposal | null>(null);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);

  const handleAcceptProposal = (proposalId: string) => {
    const prop = proposals.find(p => String(p.id) === String(proposalId));
    if (prop) {
      setAcceptingProposal(prop);
      setIsAcceptModalOpen(true);
    }
  };

  const handleWithdrawProposal = async (proposalId: string) => {
    if (confirm('Deseja realmente retirar esta proposta? Esta ação não pode ser desfeita.')) {
      await withdrawProposal(proposalId);
    }
  };

  // -------------------------------------------------------------------
  // LAWYER VIEW: PROPOSTAS ENVIADAS (Exclusiva do Advogado)
  // -------------------------------------------------------------------
  if (role === 'LAWYER') {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        
        {/* Informative Status Banner for Pending or Unverified Lawyer */}
        {role === 'LAWYER' && verificationStatus !== 'VERIFIED' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
                  {verificationStatus === 'PENDING'
                    ? 'Status da Conta: Inscrição OAB em Análise'
                    : verificationStatus === 'REJECTED'
                    ? 'Status da Conta: Cadastro Rejeitado'
                    : verificationStatus === 'SUSPENDED'
                    ? 'Status da Conta: Inscrição Suspensa'
                    : verificationStatus === 'EXPIRED'
                    ? 'Status da Conta: Certidão Expirada'
                    : 'Status da Conta: Verificação OAB Pendente'}
                </h4>
                <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                  {verificationStatus === 'PENDING'
                    ? 'Suas propostas submetidas permanecem registradas. Novas propostas requerem a conclusão da verificação cadastral.'
                    : 'Para submeter novas propostas ou assumir contratos com clientes, é necessário validar suas credenciais da OAB.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('edit-profile')}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 transition-all cursor-pointer"
            >
              {verificationStatus === 'PENDING' ? 'Ver Status Cadastral' : 'Regularizar Cadastro'}
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
                <FileCheck2 className="w-7 h-7 text-emerald-600" />
                Propostas Enviadas
              </h1>
            </div>
            <p className="text-sm text-muted-foreground/90 mt-1">
              Gerencie e acompanhe todas as suas propostas submetidas para demandas de clientes
            </p>
          </div>
        </div>

        {/* Filters & Search Header */}
        <div className="bg-card p-6 rounded-3xl border border-border/80 shadow-xs space-y-4">
          
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'ALL', label: `Todas (${mySentProposals.length})` },
              { id: 'PENDING', label: `Em Análise (${mySentProposals.filter(p => p.status === 'PENDING' || p.status === 'UNDER_REVIEW').length})` },
              { id: 'ACCEPTED', label: `Aceitas (${mySentProposals.filter(p => p.status === 'ACCEPTED').length})` },
              { id: 'REJECTED', label: `Recusadas (${mySentProposals.filter(p => p.status === 'REJECTED').length})` },
              { id: 'CANCELADA', label: `Canceladas` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setLawyerStatusFilter(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  lawyerStatusFilter === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-muted text-muted-foreground/90 hover:text-foreground hover:bg-muted/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative pt-2 border-t border-border/50">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/90" />
            <input
              type="text"
              value={lawyerSearchQuery}
              onChange={(e) => setLawyerSearchQuery(e.target.value)}
              placeholder="Buscar por título da demanda, cliente, número do processo ou estratégia..."
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground/90 placeholder:text-muted-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
            />
          </div>

        </div>

        {/* Proposals List for Lawyer */}
        <div className="space-y-6">
          {filteredLawyerProposals.length === 0 ? (
            <div className="p-12 text-center bg-card rounded-3xl border border-border/80 shadow-xs space-y-3">
              <FileCheck2 className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="text-sm font-bold text-muted-foreground">Nenhuma proposta enviada encontrada para estes filtros.</p>
              <button
                onClick={() => setActiveTab('find-jobs')}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Explorar Oportunidades
              </button>
            </div>
          ) : (
            filteredLawyerProposals.map(prop => {
              const matchedJob = jobs.find(j => j.id === prop.jobId);
              const isAccepted = prop.status === 'ACCEPTED';
              const isRejected = prop.status === 'REJECTED';
              const isPending = prop.status === 'PENDING' || prop.status === 'UNDER_REVIEW';

              return (
                <div
                  key={prop.id}
                  className={`p-6 sm:p-8 bg-card border rounded-3xl space-y-6 transition-all shadow-xs ${
                    isAccepted
                      ? 'border-emerald-300 ring-2 ring-emerald-500/10'
                      : isRejected
                      ? 'border-border bg-background/50 opacity-80'
                      : 'border-border/80 hover:border-border-strong'
                  }`}
                >
                  {/* Proposal Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-3 py-1 rounded-md text-xs font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {matchedJob?.specialty || 'Direito Jurídico'}
                        </span>
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
                          v{prop.proposalVersion || 1}
                        </span>
                        <span className="text-xs text-muted-foreground/90 font-mono">
                          Enviada em {new Date(prop.createdAt).toLocaleDateString('pt-BR')}
                        </span>
                      </div>

                      <h3
                        onClick={() => navigateToCaseDetail(prop.jobId)}
                        className="text-lg font-extrabold text-foreground hover:text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                      >
                        {prop.jobTitle}
                      </h3>

                      {/* Client Info link */}
                      {matchedJob?.clientId ? (
                        <button
                          onClick={() => openClientProfile(matchedJob.clientId)}
                          className="text-xs font-bold text-muted-foreground/90 hover:text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 cursor-pointer pt-1"
                        >
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground/90" />
                          Cliente: <span className="underline">{matchedJob.clientName || 'Cliente'}</span>
                        </button>
                      ) : (
                        <div className="text-xs font-bold text-muted-foreground/90 flex items-center gap-1.5 pt-1">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground/90" />
                          Cliente: <span>{matchedJob?.clientName || 'Cliente'}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-left sm:text-right shrink-0 bg-background p-4 rounded-2xl border border-border/50 min-w-[180px]">
                      <span className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider block">Valor Proposto</span>
                      <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-1">
                        R$ {prop.value.toLocaleString('pt-BR')}
                      </p>
                      <span className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider block mt-2">
                        Modalidade: {matchedJob?.hiringType || 'Preço Fixo'} • {prop.deliveryDays} dias
                      </span>
                    </div>
                  </div>

                  {/* Cover letter */}
                  <div className="p-4 bg-background/80 rounded-2xl border border-border/60 space-y-2">
                    <span className="text-xs font-extrabold text-muted-foreground/90 uppercase tracking-wider block">
                      Sua Proposta & Estratégia Enviada:
                    </span>
                    <ExpandableText text={prop.coverLetter} maxLength={250} />
                  </div>

                  {/* Proposed Milestones */}
                  <ExpandableMilestones milestones={prop.proposedMilestones} />

                  {/* Footer status and actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                      {isAccepted ? (
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Proposta Aceita • Contrato em Execução
                        </span>
                      ) : isRejected ? (
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-muted-foreground" /> Não Selecionado — Demanda Contratada
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4 text-amber-600" /> Em Análise pelo Cliente
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => navigateToCaseDetail(prop.jobId)}
                        className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-foreground/90 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Ver Detalhes da Demanda
                      </button>

                      <button
                        onClick={() => openNegotiationChat(prop.id)}
                        className="px-4 py-2.5 bg-card hover:bg-background text-foreground/90 font-bold text-xs rounded-xl transition-all border border-border shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-emerald-600" /> Conversar com Cliente
                      </button>

                      {isPending && (
                        <button
                          onClick={() => handleWithdrawProposal(prop.id)}
                          className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Retirar Proposta
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>
    );
  }

  // -------------------------------------------------------------------
  // CLIENT VIEW: PROPOSTAS RECEBIDAS (Exclusiva do Cliente)
  // -------------------------------------------------------------------
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <FileCheck2 className="w-7 h-7 text-emerald-600" />
              Propostas Recebidas por Projeto
            </h1>
          </div>
          <p className="text-sm text-muted-foreground/90 mt-1">
            Compare propostas de advogados verificados agrupadas por demanda e selecione o melhor profissional
          </p>
        </div>
      </div>

      {/* Project Selector Bar */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">
          Selecione o Projeto / Demanda para visualizar as propostas submetidas:
        </label>
        
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <button
            onClick={() => setSelectedJobId('ALL')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
              selectedJobId === 'ALL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-card text-muted-foreground hover:text-foreground border border-border/80 hover:bg-background'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Todos os Projetos ({proposals.length} propostas)</span>
          </button>

          {jobsWithProposals.map(j => {
            const propCount = proposals.filter(p => p.jobId === j.id).length;
            const isSelected = selectedJobId === j.id;
            const hasAccepted = proposals.some(p => p.jobId === j.id && p.status === 'ACCEPTED');

            return (
              <button
                key={j.id}
                onClick={() => setSelectedJobId(j.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-card text-muted-foreground hover:text-foreground border border-border/80 hover:bg-background'
                }`}
              >
                <span>{j.title}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                  isSelected ? 'bg-emerald-700 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {propCount} {propCount === 1 ? 'proposta' : 'propostas'}
                </span>
                {hasAccepted && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main List of Proposals for Client */}
      <div className="space-y-6">
        {displayClientProposals.length === 0 ? (
          <div className="p-12 text-center bg-card rounded-3xl border border-border/80 shadow-xs">
            <FileCheck2 className="w-10 h-10 text-muted-foreground/90 mx-auto mb-3" />
            <p className="text-sm font-bold text-muted-foreground">Nenhuma proposta cadastrada para este projeto.</p>
          </div>
        ) : (
          displayClientProposals.map((prop) => {
            const isAccepted = prop.status === 'ACCEPTED';
            const isRejected = prop.status === 'REJECTED';

            return (
              <div
                key={prop.id}
                className={`p-6 sm:p-8 bg-card border rounded-3xl space-y-6 transition-all shadow-xs ${
                  isAccepted
                    ? 'border-emerald-300 ring-2 ring-emerald-500/10'
                    : isRejected
                    ? 'border-border bg-background/50 opacity-80'
                    : 'border-border/80 hover:border-border-strong'
                }`}
              >
                {/* Header: Lawyer info & Project Context */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/50">
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={() => openLawyerProfile(prop.lawyerId)}
                      className="group flex items-center gap-3 cursor-pointer text-left"
                    >
                      <img
                        src={prop.lawyerAvatar}
                        alt={prop.lawyerName}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/20 group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <h3 className="text-sm font-extrabold text-foreground group-hover:text-emerald-600 dark:text-emerald-400 transition-colors flex items-center gap-2 flex-wrap">
                          {prop.lawyerName}
                          <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-200">
                            {prop.lawyerOab}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-bold border border-purple-200">
                            v{prop.proposalVersion || 1}
                          </span>
                        </h3>
                        <p className="text-xs font-semibold text-muted-foreground/90 mt-0.5 flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-muted-foreground/90" />
                          Projeto: <span className="text-foreground/90">{prop.jobTitle}</span>
                        </p>
                      </div>
                    </button>
                  </div>

                  <div className="text-left sm:text-right">
                    <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
                      R$ {prop.value.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-muted-foreground/90 font-medium">Prazo estimado: {prop.deliveryDays} dias úteis</p>
                  </div>
                </div>

                {/* Cover Letter & Strategy */}
                <div className="p-4 bg-background/80 rounded-2xl border border-border/60 space-y-2">
                  <span className="text-xs font-extrabold text-muted-foreground/90 uppercase tracking-wider block">
                    Carta de Apresentação e Estratégia Jurídica:
                  </span>
                  <ExpandableText text={prop.coverLetter} maxLength={250} />
                </div>

                {/* Proposed Milestones */}
                <ExpandableMilestones milestones={prop.proposedMilestones || []} />

                {/* Actions Footer */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    {isAccepted ? (
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Proposta Aceita • Contrato em Execução
                      </span>
                    ) : isRejected ? (
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border flex items-center gap-1.5">
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                        Não Selecionado — Demanda Contratada
                      </span>
                    ) : (
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        Em Negociação / Análise pelo Cliente
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openLawyerProfile(prop.lawyerId)}
                      className="px-3.5 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5" />
                      Perfil do Advogado
                    </button>

                    <button
                      type="button"
                      onClick={() => openNegotiationChat(prop.id)}
                      className="px-4 py-2.5 bg-card hover:bg-background text-foreground font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer border border-border shadow-xs"
                    >
                      <MessageSquare className="w-4 h-4 text-emerald-600" />
                      Conversar / Negociar
                    </button>

                    {prop.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => handleAcceptProposal(prop.id)}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Aceitar e Depositar Custódia
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Accept Proposal Modal with Conflict Check & SHA-256 Receipt */}
      <AcceptProposalModal
        isOpen={isAcceptModalOpen}
        proposal={acceptingProposal}
        job={jobs.find(j => String(j.id) === String(acceptingProposal?.jobId))}
        onSuccess={async () => {
          await refreshData();
        }}
        onClose={() => {
          setIsAcceptModalOpen(false);
          setAcceptingProposal(null);
        }}
      />

    </div>
  );
};
