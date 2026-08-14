import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  FileText,
  Calendar,
  Clock,
  UserCheck,
  ShieldCheck,
  Upload,
  Sparkles,
  CreditCard,
  PlusCircle,
  Download,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  FileCheck2,
  RotateCcw,
  Trash2,
  Star,
  Lock,
  ArrowLeft,
  ArrowRight,
  Building2,
  Share2,
  Heart,
  Flag,
  DollarSign
} from 'lucide-react';
import { useLegalPlatform } from '../hooks/useLegalPlatform';
import { proposalsApi, contractsApi } from '../services/api';

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
    <div className="space-y-2 pt-2">
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

export const CaseDetailPage: React.FC = () => {
  const {
    selectedCaseId,
    jobs,
    proposals,
    contracts,
    role,
    user,
    documents,
    payments,
    setIsUploadDocModalOpen,
    setIsAiAssistantModalOpen,
    setIsNewProposalModalOpen,
    openNegotiationChat,
    openClientProfile,
    reopenJob,
    withdrawProposal,
    openReviewModal,
    refreshData,
    setActiveTab: setNavTab,
    caseDetailInitialTab
  } = useLegalPlatform();

  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'PROPOSALS' | 'DOCUMENTS' | 'TIMELINE' | 'PAYMENTS' | 'CONTRACT'>(caseDetailInitialTab);
  const [isFavorited, setIsFavorited] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    setActiveTab(caseDetailInitialTab);
  }, [caseDetailInitialTab]);

  const job = jobs.find((j) => j.id === selectedCaseId) || jobs[0];

  if (!job) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <div>
          <button
            onClick={() => setNavTab(role === 'LAWYER' ? 'find-jobs' : 'cases')}
            className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground/90 hover:text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar para {role === 'LAWYER' ? 'Encontrar Demandas' : 'Minhas Demandas'}</span>
          </button>
        </div>

        <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-12 text-center shadow-xs space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-foreground">Demanda não encontrada ou indisponível.</h2>
          <p className="text-xs text-muted-foreground">A demanda solicitada não existe ou foi removida do sistema.</p>
          <button
            onClick={() => setNavTab(role === 'LAWYER' ? 'find-jobs' : 'cases')}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Voltar para {role === 'LAWYER' ? 'Demandas' : 'Painel de Casos'}
          </button>
        </div>
      </div>
    );
  }

  let caseProposals = proposals.filter((p) => p.jobId === job?.id);
  if (role === 'LAWYER' && user) {
    caseProposals = caseProposals.filter((p) => p.lawyerId === user.id);
  }
  
  const caseContract = contracts.find((c) => c.jobId === job?.id);
  const caseDocs = documents.filter((d) => d.processNumber === job?.processNumber || d.category === 'Peças Processuais');
  const casePayments = payments.filter((p) => p.processNumber === job?.processNumber);

  const myProposal = user ? caseProposals.find(p => p.lawyerId === user.id) : null;

  const isContractedOrAssumed = !!caseContract || job.status !== 'OPEN';
  const isMyAssumedJob = role === 'CLIENT' || (job.assignedLawyerId && user && job.assignedLawyerId === user.id);

  const handleShare = () => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      await proposalsApi.acceptProposal(proposalId);
      await refreshData();
    } catch (err) {
      console.error('Erro ao aceitar proposta:', err);
    }
  };

  const handleWithdrawProposal = async (proposalId: string) => {
    if (confirm('Tem certeza que deseja retirar sua proposta?')) {
      await withdrawProposal(proposalId);
    }
  };

  const handleReopenJob = async () => {
    if (confirm('Deseja reabrir esta demanda para receber novas propostas de advogados?')) {
      await reopenJob(job.id);
    }
  };

  const handleReleaseMilestone = async (milestoneId: string) => {
    if (!caseContract) return;
    try {
      const updated = await contractsApi.releaseMilestone(caseContract.id, milestoneId);
      await refreshData();
      if (updated.status === 'COMPLETED') {
        openReviewModal({
          contractId: updated.id,
          jobTitle: updated.jobTitle,
          otherPartyName: role === 'CLIENT' ? updated.lawyerName : updated.clientName,
          otherPartyRole: role === 'CLIENT' ? 'LAWYER' : 'CLIENT'
        });
      }
    } catch (err) {
      console.error('Erro ao liberar marco:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Back Button Breadcrumb */}
      <div>
        <button
          onClick={() => setNavTab(myProposal ? 'proposals' : isMyAssumedJob ? 'cases' : 'find-jobs')}
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground/90 hover:text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para {myProposal ? 'Propostas Enviadas' : isMyAssumedJob ? (role === 'LAWYER' ? 'Meus Casos' : 'Minhas Demandas') : 'Encontrar Demandas'}</span>
        </button>
      </div>

      {/* Top Banner / Case Title Header */}
      <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/50">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                {job.specialty}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                job.status === 'OPEN' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                job.status === 'IN_PROGRESS' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-muted text-muted-foreground border-border'
              }`}>
                Status: {job.status === 'OPEN' ? 'Aberta para Propostas' : job.status === 'IN_PROGRESS' ? 'Em Execução' : 'Concluída / Encerrada'}
              </span>

              {/* Hiring Modality Badge */}
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-muted text-muted-foreground border border-border flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" />
                Modalidade: {job.hiringType || 'Preço Fixo'}
              </span>

              {/* Proposals Count Badge */}
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-alt text-alt-foreground flex items-center gap-1.5">
                <FileCheck2 className="w-3.5 h-3.5 text-emerald-400" />
                {job.proposalsCount} {job.proposalsCount === 1 ? 'proposta recebida' : 'propostas recebidas'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight mt-2">{job.title}</h1>
            {job.processNumber && (
              <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                Processo nº <span>{job.processNumber}</span>
              </p>
            )}

            {/* Client Profile link */}
            <div className="pt-2">
              <button
                onClick={() => openClientProfile(job.clientId)}
                className="text-xs font-bold text-muted-foreground/90 hover:text-emerald-600 dark:text-emerald-400 flex items-center gap-2 cursor-pointer transition-colors"
              >
                {job.clientAvatar ? (
                  <img src={job.clientAvatar} alt={job.clientName} className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <Building2 className="w-4 h-4 text-muted-foreground/90" />
                )}
                <span>Cliente: <strong className="underline">{job.clientName}</strong> ({job.city}, {job.state})</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                isFavorited ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-background border-border text-muted-foreground/90 hover:bg-muted'
              }`}
              title="Favoritar Demanda"
            >
              <Heart className={`w-4 h-4 ${isFavorited ? 'fill-rose-500' : ''}`} />
            </button>

            {role === 'CLIENT' && job.status !== 'OPEN' && (
              <button
                onClick={handleReopenJob}
                className="px-4 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 font-semibold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-amber-600" /> Reabrir Demanda
              </button>
            )}

            <button
              onClick={() => setIsAiAssistantModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 font-semibold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" /> Análise IA
            </button>

            {isMyAssumedJob && (
              <button
                onClick={() => setIsUploadDocModalOpen(true)}
                className="px-4 py-2.5 bg-muted hover:bg-muted/80 border border-border text-foreground/90 font-semibold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-muted-foreground/90" /> Anexar Peça
              </button>
            )}
          </div>
        </div>

        {/* Lawyer Proposal Banner if Lawyer already sent proposal */}
        {role === 'LAWYER' && myProposal && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-600 text-white">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Sua proposta foi enviada em {new Date(myProposal.createdAt).toLocaleDateString('pt-BR')}</p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400">Valor Proposto: <strong className="font-mono">R$ {myProposal.value.toLocaleString('pt-BR')}</strong> • Status: {myProposal.status === 'ACCEPTED' ? 'Aceita pelo Cliente' : 'Em Análise pelo Cliente'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openNegotiationChat(myProposal.id)}
                className="px-3.5 py-2 bg-card text-foreground/90 font-bold text-xs rounded-xl border border-border cursor-pointer hover:bg-background"
              >
                Conversar com Cliente
              </button>
              {myProposal.status === 'PENDING' && (
                <button
                  onClick={() => handleWithdrawProposal(myProposal.id)}
                  className="px-3 py-2 bg-rose-100 text-rose-800 font-bold text-xs rounded-xl cursor-pointer hover:bg-rose-200"
                >
                  Retirar Proposta
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-1">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'OVERVIEW'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-muted text-muted-foreground/90 hover:text-foreground hover:bg-muted/80'
            }`}
          >
            Visão Geral & Partes
          </button>

          <button
            onClick={() => setActiveTab('PROPOSALS')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PROPOSALS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-muted text-muted-foreground/90 hover:text-foreground hover:bg-muted/80'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            Propostas ({caseProposals.length})
          </button>

          {caseContract && (
            <button
              onClick={() => setActiveTab('CONTRACT')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'CONTRACT'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-muted text-muted-foreground/90 hover:text-foreground hover:bg-muted/80'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Contrato & Custódia
            </button>
          )}

          <button
            onClick={() => setActiveTab('DOCUMENTS')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'DOCUMENTS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-muted text-muted-foreground/90 hover:text-foreground hover:bg-muted/80'
            }`}
          >
            Documentos ({caseDocs.length})
          </button>

          {isContractedOrAssumed && (
            <button
              onClick={() => setActiveTab('TIMELINE')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'TIMELINE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-muted text-muted-foreground/90 hover:text-foreground hover:bg-muted/80'
              }`}
            >
              Histórico
            </button>
          )}

          {isContractedOrAssumed && (
            <button
              onClick={() => setActiveTab('PAYMENTS')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'PAYMENTS'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-muted text-muted-foreground/90 hover:text-foreground hover:bg-muted/80'
              }`}
            >
              Financeiro
            </button>
          )}
        </div>

      </div>

      {/* Main Content View Switcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        
        {/* Left Primary Details */}
        <div className="lg:col-span-2 xl:col-span-3 space-y-6">
          
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              
              {/* Description Box */}
              <div className="p-6 sm:p-8 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-4 shadow-xs">
                <h3 className="text-xs font-semibold text-muted-foreground/90 uppercase tracking-wider">Objeto da Demanda</h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-normal">
                  {job.description}
                </p>
                <div className="pt-4 border-t border-border/50 flex flex-wrap gap-6 text-xs text-muted-foreground/90">
                  <div><span className="font-bold text-foreground">Foro / Vara:</span> {job.courtBranch || 'Comarca de Porto Alegre'}</div>
                  <div><span className="font-bold text-foreground">Localização:</span> {job.city}, {job.state}</div>
                  <div><span className="font-bold text-foreground">Propostas Recebidas:</span> {job.proposalsCount}</div>
                </div>
              </div>

              {/* Parties Involved */}
              <div className="p-6 sm:p-8 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-4 shadow-xs">
                <h3 className="text-xs font-semibold text-muted-foreground/90 uppercase tracking-wider">Partes do Processo & Representantes Legais</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {job.parties ? (
                    job.parties.map((party, i) => (
                      <div key={i} className="p-4 bg-background/80 rounded-2xl border border-border/80 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-foreground">{party.name}</span>
                          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            party.role === 'AUTOR' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {party.role}
                          </span>
                        </div>
                        {party.lawyer && (
                          <p className="text-xs text-muted-foreground/90">Advogado: {party.lawyer}</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 p-4 text-center text-xs text-muted-foreground/90">
                      Cliente: {job.clientName}
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}

          {activeTab === 'PROPOSALS' && (
            <div className="p-6 sm:p-8 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-border/50">
                <div>
                  <h3 className="text-xs font-semibold text-muted-foreground/90 uppercase tracking-wider flex items-center gap-2">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    Propostas Apresentadas ({caseProposals.length})
                  </h3>
                  <p className="text-xs text-muted-foreground/90 mt-0.5">Contador atualizado em tempo real</p>
                </div>

                {role === 'LAWYER' && job.status === 'OPEN' && !myProposal && (
                  <button
                    onClick={() => setIsNewProposalModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs"
                  >
                    + Enviar Proposta
                  </button>
                )}
              </div>

              {caseProposals.length === 0 ? (
                <p className="text-xs text-muted-foreground/90 py-6 text-center">Nenhuma proposta recebida para esta demanda ainda.</p>
              ) : (
                <div className="space-y-4">
                  {caseProposals.map((prop) => {
                    const isMyOwn = user && prop.lawyerId === user.id;
                    const canSeeDetails = role === 'CLIENT' || isMyOwn;

                    return (
                      <div key={prop.id} className="p-5 bg-background/80 border border-border/80 rounded-2xl space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={prop.lawyerAvatar}
                              alt={prop.lawyerName}
                              className="w-10 h-10 rounded-xl object-cover ring-1 ring-border/50"
                            />
                            <div>
                              <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                                {prop.lawyerName}
                                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">({prop.lawyerOab})</span>
                                {isMyOwn && (
                                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px]">Sua Proposta</span>
                                )}
                              </p>
                              <p className="text-xs text-muted-foreground/90">Avaliação: ⭐ {prop.lawyerRating.toFixed(1)}</p>
                            </div>
                          </div>

                          {canSeeDetails && (
                            <div className="text-left sm:text-right">
                              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono block">
                                R$ {prop.value.toLocaleString('pt-BR')}
                              </span>
                              <span className="text-xs text-muted-foreground/90">Prazo: {prop.deliveryDays} dias úteis</span>
                            </div>
                          )}
                        </div>

                        {canSeeDetails && (
                          <div className="p-3.5 bg-card border border-border/60 rounded-xl text-xs text-muted-foreground leading-relaxed">
                            <span className="font-bold text-muted-foreground/90 block text-[11px] uppercase mb-1">Parecer / Estratégia:</span>
                            <ExpandableText text={prop.coverLetter} maxLength={250} />
                            <ExpandableMilestones milestones={prop.proposedMilestones || []} />
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border/60">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            prop.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {prop.status === 'ACCEPTED' ? 'Aceita & Em Execução' : 'Em Negociação'}
                          </span>

                          <div className="flex items-center gap-2">
                            {canSeeDetails && (
                              <button
                                onClick={() => openNegotiationChat(prop.id)}
                                className="px-3.5 py-2 bg-card hover:bg-muted text-foreground/90 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-border shadow-xs"
                              >
                                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                                Conversar no Chat
                              </button>
                            )}

                            {isMyOwn && prop.status === 'PENDING' && (
                              <button
                                onClick={() => handleWithdrawProposal(prop.id)}
                                className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Retirar Proposta
                              </button>
                            )}

                            {role === 'CLIENT' && prop.status === 'PENDING' && (
                              <button
                                onClick={() => handleAcceptProposal(prop.id)}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-xs"
                              >
                                Aceitar e Depositar Custódia
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'CONTRACT' && caseContract && (
            <div className="p-6 sm:p-8 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-6 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-border/50">
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
                    Contrato Digital & Custódia Escrow
                  </span>
                  <h3 className="text-xl font-extrabold text-foreground tracking-tight mt-1">{caseContract.jobTitle}</h3>
                </div>
                <div className="text-right">
                  <p className="text-lg font-mono font-extrabold text-foreground">R$ {caseContract.totalValue.toLocaleString('pt-BR')}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">Garantia em Custódia: R$ {caseContract.escrowBalance.toLocaleString('pt-BR')}</p>
                </div>
              </div>

              {/* Milestones */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Marcos de Entrega & Liberação de Fundos</h4>
                <div className="space-y-3">
                  {caseContract.milestones.map((m) => (
                    <div key={m.id} className="p-4 bg-background border border-border/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-bold text-foreground">{m.title}</h5>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            m.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                            m.status === 'SUBMITTED' ? 'bg-amber-100 text-amber-800' : 
                            m.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-muted/80 text-muted-foreground/90'
                          }`}>
                            {m.status === 'PAID' ? 'Pago / Liberado' : 
                             m.status === 'SUBMITTED' ? 'Aguardando Aprovação' : 
                             m.status === 'REJECTED' ? 'Ajustes Solicitados' : 'Em Execução'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground/90 mt-1">{m.description}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 shrink-0">
                        <span className="text-sm font-mono font-bold text-foreground">R$ {m.value.toLocaleString('pt-BR')}</span>

                        <div className="flex flex-col sm:flex-row items-center gap-2">
                          {role === 'LAWYER' && (
                            <>
                              {(m.status === 'PENDING' || m.status === 'IN_PROGRESS' || m.status === 'REJECTED') && (
                                <button
                                  onClick={async () => {
                                    try {
                                      await contractsApi.updateMilestoneStatus(caseContract.id, m.id, 'SUBMITTED');
                                      await refreshData();
                                    } catch(e) {}
                                  }}
                                  className="w-full sm:w-auto px-4 py-2 bg-alt hover:bg-alt/90 text-alt-foreground font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                                >
                                  Solicitar Aprovação
                                </button>
                              )}
                              {m.status === 'SUBMITTED' && (
                                <span className="text-xs font-semibold text-muted-foreground/90 italic px-2">Aguardando cliente...</span>
                              )}
                            </>
                          )}
                          
                          {role === 'CLIENT' && (
                            <>
                              {m.status === 'SUBMITTED' && (
                                <>
                                  <button
                                    onClick={async () => {
                                      try {
                                        await contractsApi.updateMilestoneStatus(caseContract.id, m.id, 'REJECTED');
                                        await refreshData();
                                      } catch(e) {}
                                    }}
                                    className="w-full sm:w-auto px-3 py-2 bg-card hover:bg-background text-muted-foreground font-bold text-xs rounded-xl border border-border transition-colors cursor-pointer"
                                  >
                                    Rejeitar
                                  </button>
                                  <button
                                    onClick={() => handleReleaseMilestone(m.id)}
                                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                                  >
                                    Aprovar e Liberar
                                  </button>
                                </>
                              )}
                              {(m.status === 'PENDING' || m.status === 'IN_PROGRESS' || m.status === 'REJECTED') && (
                                <span className="text-xs font-semibold text-muted-foreground/90 italic px-2">Aguardando advogado...</span>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Finalize Project Button */}
              {caseContract.milestones.every(m => m.status === 'PAID') && caseContract.status !== 'COMPLETED' && (
                <div className="p-6 bg-emerald-50 border-t border-emerald-100 text-center rounded-2xl">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">Todos os marcos concluídos!</h4>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">O projeto foi entregue com sucesso e todos os valores foram liberados.</p>
                    </div>
                    <button 
                      onClick={async () => {
                        try {
                          const updated = await contractsApi.finishContract(caseContract.id);
                          await refreshData();
                          if (updated) {
                            openReviewModal({
                              contractId: updated.id,
                              jobTitle: updated.jobTitle,
                              otherPartyName: role === 'CLIENT' ? updated.lawyerName : updated.clientName,
                              otherPartyRole: role === 'CLIENT' ? 'LAWYER' : 'CLIENT'
                            });
                          }
                        } catch (err) {}
                      }}
                      className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      Finalizar Projeto & Avaliar
                    </button>
                  </div>
                </div>
              )}

              {/* Evaluation Trigger Button */}
              {caseContract.status === 'COMPLETED' && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Contrato Concluído!</h5>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">Envie sua avaliação no sistema duplo-cego.</p>
                  </div>
                  <button
                    onClick={() => openReviewModal({
                      contractId: caseContract.id,
                      jobTitle: caseContract.jobTitle,
                      otherPartyName: role === 'CLIENT' ? caseContract.lawyerName : caseContract.clientName,
                      otherPartyRole: role === 'CLIENT' ? 'LAWYER' : 'CLIENT'
                    })}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Avaliar Agora
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'DOCUMENTS' && (
            <div className="p-6 sm:p-8 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-muted-foreground/90 uppercase tracking-wider">Peças & Anexos Vinculados</h3>
                <button
                  onClick={() => setIsUploadDocModalOpen(true)}
                  className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4" /> Adicionar Documento
                </button>
              </div>

              <div className="divide-y divide-border/50">
                {caseDocs.map((doc) => (
                  <div key={doc.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-muted text-emerald-600 dark:text-emerald-400">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-foreground">{doc.title}</p>
                        <p className="text-xs text-muted-foreground/90">{doc.fileName} • {doc.fileSize} • {doc.uploadDate}</p>
                      </div>
                    </div>
                    <button className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground transition-colors cursor-pointer">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'TIMELINE' && (
            <div className="p-6 sm:p-8 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-6 shadow-xs">
              <h3 className="text-xs font-semibold text-muted-foreground/90 uppercase tracking-wider">Linha do Tempo e Andamentos</h3>
              <div className="space-y-6 pl-4 border-l-2 border-emerald-500/30">
                {job.timeline?.map((event) => (
                  <div key={event.id} className="relative space-y-1">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-emerald-600 ring-4 ring-white" />
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-foreground">{event.title}</span>
                      <span className="text-xs text-muted-foreground/90 font-mono">{event.date}</span>
                    </div>
                    <p className="text-xs text-muted-foreground/90 leading-relaxed">{event.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'PAYMENTS' && (
            <div className="p-6 sm:p-8 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-4 shadow-xs">
              <h3 className="text-xs font-semibold text-muted-foreground/90 uppercase tracking-wider">Histórico de Transações de Custódia</h3>
              <div className="divide-y divide-border/50">
                {casePayments.map((p) => (
                  <div key={p.id} className="py-3.5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground">{p.jobTitle}</p>
                      <p className="text-xs text-muted-foreground/90">{p.payerName} → {p.receiverName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        R$ {p.amount.toLocaleString('pt-BR')}
                      </p>
                      <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                        {p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          
          {/* Client Profile Card */}
          <div className="p-6 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-4 shadow-xs">
            <h3 className="text-xs font-semibold text-muted-foreground/90 uppercase tracking-wider">Cliente da Demanda</h3>
            <button
              onClick={() => openClientProfile(job.clientId)}
              className="w-full flex items-center gap-3 p-3 bg-background hover:bg-emerald-50/50 border border-border/80 hover:border-emerald-300 rounded-2xl transition-all cursor-pointer text-left group"
            >
              {job.clientAvatar ? (
                <img src={job.clientAvatar} alt={job.clientName} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30 shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-2xl bg-muted/80 flex items-center justify-center font-bold text-muted-foreground/90 shrink-0">
                  {job.clientName.charAt(0)}
                </div>
              )}
              <div className="space-y-0.5 min-w-0">
                <p className="text-sm font-bold text-foreground group-hover:text-emerald-600 dark:text-emerald-400 transition-colors truncate">{job.clientName}</p>
                <p className="text-xs text-muted-foreground/90 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> {job.clientRating || '4.9'} • CNPJ Verificado
                </p>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold underline block pt-0.5">Ver Perfil Completo do Cliente →</span>
              </div>
            </button>
          </div>

          {/* Assigned Lawyer Info (Only shown when a lawyer has been assigned/hired) */}
          {job.assignedLawyerName && (
            <div className="p-6 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-4 shadow-xs">
              <h3 className="text-xs font-semibold text-muted-foreground/90 uppercase tracking-wider">Advogado Responsável</h3>
              <div className="flex items-center gap-3">
                {job.assignedLawyerAvatar ? (
                  <img
                    src={job.assignedLawyerAvatar}
                    alt={job.assignedLawyerName}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-emerald-500/30"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm ring-2 ring-emerald-500/30 shrink-0">
                    {job.assignedLawyerName.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-sm font-bold text-foreground">{job.assignedLawyerName}</p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> OAB Verificado
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions (Only rendered when there are active actions available) */}
          {((role === 'LAWYER' && job.status === 'OPEN' && !myProposal) || (role === 'CLIENT' && job.status === 'COMPLETED')) && (
            <div className="p-6 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-3 shadow-xs">
              <h3 className="text-xs font-semibold text-muted-foreground/90 uppercase tracking-wider">Ações Rápidas</h3>
              
              {role === 'LAWYER' && job.status === 'OPEN' && !myProposal && (
                <button
                  onClick={() => setIsNewProposalModalOpen(true)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs cursor-pointer"
                >
                  Submeter Proposta de Honorários
                </button>
              )}

              {role === 'CLIENT' && job.status === 'COMPLETED' && (
                <button
                  onClick={handleReopenJob}
                  className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold text-xs rounded-xl cursor-pointer transition-all"
                >
                  Reabrir Demanda Pública
                </button>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
