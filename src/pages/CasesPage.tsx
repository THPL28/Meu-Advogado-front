import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  PlusCircle,
  Clock,
  MapPin,
  Building2,
  ChevronRight,
  ShieldAlert,
  Sparkles,
  FileText,
  MessageSquare,
  FolderOpen,
  DollarSign,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useLegalPlatform } from '../hooks/useLegalPlatform';
import { JobStatus, ContractStatus } from '../types';

export const CasesPage: React.FC = () => {
  const {
    jobs,
    contracts,
    role,
    user,
    navigateToCaseDetail,
    setIsNewCaseModalOpen,
    openNegotiationChat,
    openClientProfile,
    setActiveTab
  } = useLegalPlatform();

  // Lawyer view state
  const [lawyerSearchQuery, setLawyerSearchQuery] = useState('');
  const [lawyerStatusTab, setLawyerStatusTab] = useState<string>('ALL');

  // Client view state
  const [clientSearchQuery, setSearchQuery] = useState('');
  const [clientStatusTab, setStatusTab] = useState<'ALL' | JobStatus>('ALL');

  // Filter lawyer active & completed cases (assigned contracts)
  const lawyerContracts = role === 'LAWYER' && user
    ? contracts.filter(c => c.lawyerId === user.id || c.lawyerOab === user.oabNumber)
    : contracts;

  const filteredLawyerCases = lawyerContracts.filter(c => {
    if (lawyerStatusTab !== 'ALL') {
      if (lawyerStatusTab === 'ACTIVE' && c.status !== 'ACTIVE') return false;
      if (lawyerStatusTab === 'COMPLETED' && c.status !== 'COMPLETED') return false;
      if (lawyerStatusTab === 'DISPUTED' && c.status !== 'DISPUTED') return false;
    }

    if (lawyerSearchQuery) {
      const q = lawyerSearchQuery.toLowerCase();
      const matchTitle = c.jobTitle.toLowerCase().includes(q);
      const matchClient = c.clientName.toLowerCase().includes(q);
      const matchProcess = c.processNumber?.toLowerCase().includes(q);
      if (!matchTitle && !matchClient && !matchProcess) return false;
    }

    return true;
  });

  // Filter client published demands
  const filteredClientJobs = jobs.filter(j => {
    if (clientStatusTab !== 'ALL' && j.status !== clientStatusTab) return false;
    if (clientSearchQuery) {
      const q = clientSearchQuery.toLowerCase();
      const matchTitle = j.title.toLowerCase().includes(q);
      const matchProc = j.processNumber?.toLowerCase().includes(q);
      if (!matchTitle && !matchProc) return false;
    }
    return true;
  });

  // -------------------------------------------------------------------
  // LAWYER VIEW: MEUS CASOS (Exclusiva do Advogado)
  // -------------------------------------------------------------------
  if (role === 'LAWYER') {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <Briefcase className="w-7 h-7 text-emerald-600" />
              Meus Casos & Contratos
            </h1>
            <p className="text-sm text-muted-foreground/90 mt-1">
              Acompanhe a execução dos seus contratos ativos, entregas de marcos e casos concluídos
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-card p-6 rounded-3xl border border-border/80 shadow-xs space-y-4">
          
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'ALL', label: `Todos os Casos (${lawyerContracts.length})` },
              { id: 'ACTIVE', label: `Em Andamento (${lawyerContracts.filter(c => c.status === 'ACTIVE').length})` },
              { id: 'COMPLETED', label: `Concluídos (${lawyerContracts.filter(c => c.status === 'COMPLETED').length})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setLawyerStatusTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  lawyerStatusTab === tab.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-muted text-muted-foreground/90 hover:text-foreground hover:bg-muted/80'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative pt-2 border-t border-border/50">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/90" />
            <input
              type="text"
              value={lawyerSearchQuery}
              onChange={(e) => setLawyerSearchQuery(e.target.value)}
              placeholder="Buscar por cliente, título do caso, número do processo ou comarca..."
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground/90 placeholder:text-muted-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
            />
          </div>

        </div>

        {/* Lawyer Active/Completed Cases Cards Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredLawyerCases.length === 0 ? (
            <div className="col-span-full p-12 text-center bg-card rounded-3xl border border-border/80 shadow-xs space-y-3">
              <Briefcase className="w-10 h-10 text-muted-foreground mx-auto" />
              <p className="text-sm font-bold text-muted-foreground">Nenhum contrato ativo ou atribuído a você no momento.</p>
              <button
                onClick={() => setActiveTab('find-jobs')}
                className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer"
              >
                Buscar Novas Demandas
              </button>
            </div>
          ) : (
            filteredLawyerCases.map(contract => {
              const matchedJob = jobs.find(j => j.id === contract.jobId);
              const nextMilestone = contract.milestones.find(m => m.status !== 'RELEASED') || contract.milestones[0];

              return (
                <div
                  key={contract.id}
                  className="p-6 bg-card border border-border/80 hover:border-emerald-500/50 rounded-3xl transition-all shadow-xs flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          {matchedJob?.specialty || 'Direito Empresarial'}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                          contract.status === 'ACTIVE' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          contract.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {contract.status === 'ACTIVE' ? 'Em Andamento' : contract.status === 'COMPLETED' ? 'Concluído' : 'Em Análise'}
                        </span>
                      </div>

                      <span className="text-xs text-muted-foreground/90 font-mono">
                        Início: {contract.startDate}
                      </span>
                    </div>

                    <div>
                      <h3
                        onClick={() => navigateToCaseDetail(contract.jobId)}
                        className="text-lg font-extrabold text-foreground hover:text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                      >
                        {contract.jobTitle}
                      </h3>
                      {contract.processNumber && (
                        <p className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                          Proc. N° {contract.processNumber}
                        </p>
                      )}
                    </div>

                    {/* Client info link */}
                    <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground/90">
                      <button
                        onClick={() => openClientProfile(contract.clientId)}
                        className="flex items-center gap-2 font-bold hover:text-emerald-600 dark:text-emerald-400 cursor-pointer"
                      >
                        <Building2 className="w-4 h-4 text-muted-foreground/90" />
                        Cliente: <span className="underline">{contract.clientName}</span>
                      </button>

                      <div className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                        R$ {contract.totalValue.toLocaleString('pt-BR')}
                      </div>
                    </div>
                  </div>

                  {/* Progress & Escrow breakdown */}
                  <div className="bg-background p-4 rounded-2xl border border-border/60 space-y-3 text-xs">
                    <div className="flex justify-between items-center text-muted-foreground font-semibold">
                      <span>Progresso da Execução</span>
                      <span className="font-mono font-extrabold text-emerald-600 dark:text-emerald-400">{contract.progressPercentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-muted/80 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-600 rounded-full transition-all duration-300"
                        style={{ width: `${contract.progressPercentage}%` }}
                      />
                    </div>

                    {nextMilestone && (
                      <div className="pt-2 border-t border-border/60 flex items-center justify-between text-muted-foreground/90">
                        <span className="text-[11px] font-bold uppercase text-muted-foreground/90">Próximo Marco:</span>
                        <span className="font-semibold text-foreground/90 truncate max-w-[200px]">{nextMilestone.title}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons for Lawyer Case Execution */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/50">
                    <button
                      onClick={() => navigateToCaseDetail(contract.jobId)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all text-center cursor-pointer"
                    >
                      Abrir Caso
                    </button>
                    <button
                      onClick={() => openNegotiationChat(contract.proposalId)}
                      className="px-3 py-2 bg-muted hover:bg-muted/80 text-foreground/90 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> Mensagens
                    </button>
                    <button
                      onClick={() => navigateToCaseDetail(contract.jobId)}
                      className="px-3 py-2 bg-muted hover:bg-muted/80 text-foreground/90 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5 text-muted-foreground/90" /> Documentos
                    </button>
                    <button
                      onClick={() => navigateToCaseDetail(contract.jobId)}
                      className="px-3 py-2 bg-muted hover:bg-muted/80 text-foreground/90 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Financeiro
                    </button>
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
  // CLIENT VIEW: MINHAS DEMANDAS (Exclusiva do Cliente)
  // -------------------------------------------------------------------
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
            <Briefcase className="w-7 h-7 text-emerald-600" />
            Minhas Demandas Publicadas
          </h1>
          <p className="text-sm text-muted-foreground/90 mt-1">
            Gerencie suas solicitações jurídicas publicadas, analise propostas e acompanhe a contratação
          </p>
        </div>

        <button
          onClick={() => setIsNewCaseModalOpen(true)}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Cadastrar Nova Demanda
        </button>
      </div>

      {/* Filter Tabs & Controls */}
      <div className="bg-card p-6 rounded-3xl border border-border/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setStatusTab('ALL')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              clientStatusTab === 'ALL'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-muted text-muted-foreground/90 hover:text-foreground hover:bg-muted/80'
            }`}
          >
            Todas ({jobs.length})
          </button>
          <button
            onClick={() => setStatusTab('OPEN')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              clientStatusTab === 'OPEN'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-muted text-muted-foreground/90 hover:text-foreground hover:bg-muted/80'
            }`}
          >
            Abertas para Propostas ({jobs.filter(j => j.status === 'OPEN').length})
          </button>
          <button
            onClick={() => setStatusTab('IN_PROGRESS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              clientStatusTab === 'IN_PROGRESS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-muted text-muted-foreground/90 hover:text-foreground hover:bg-muted/80'
            }`}
          >
            Em Execução ({jobs.filter(j => j.status === 'IN_PROGRESS').length})
          </button>
          <button
            onClick={() => setStatusTab('COMPLETED')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              clientStatusTab === 'COMPLETED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-muted text-muted-foreground/90 hover:text-foreground hover:bg-muted/80'
            }`}
          >
            Concluídas ({jobs.filter(j => j.status === 'COMPLETED').length})
          </button>
        </div>

        <div className="relative pt-2 border-t border-border/50">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/90" />
          <input
            type="text"
            value={clientSearchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título ou número do processo..."
            className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground/90 placeholder:text-muted-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
          />
        </div>
      </div>

      {/* Client Jobs List */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {filteredClientJobs.length === 0 ? (
          <div className="col-span-full p-12 text-center bg-card rounded-3xl border border-border/80 shadow-xs space-y-3">
            <Briefcase className="w-10 h-10 text-muted-foreground mx-auto" />
            <p className="text-sm font-bold text-muted-foreground">Nenhuma demanda encontrada.</p>
          </div>
        ) : (
          filteredClientJobs.map((job) => (
            <div
              key={job.id}
              className="p-6 bg-card border border-border/80 rounded-3xl space-y-4 shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                    {job.specialty}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground/90">
                    {new Date(job.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                </div>

                <div>
                  <h3
                    onClick={() => navigateToCaseDetail(job.id)}
                    className="text-base font-extrabold text-foreground hover:text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
                  >
                    {job.title}
                  </h3>
                  <p className="text-xs text-muted-foreground/90 mt-2 line-clamp-2">
                    {job.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50 space-y-3">
                <div className="flex items-center justify-between text-xs bg-background p-3 rounded-xl border border-border/50">
                  <span className="font-bold text-muted-foreground/90">Propostas Recebidas:</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-xs">
                    {job.proposalsCount} {job.proposalsCount === 1 ? 'proposta' : 'propostas'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigateToCaseDetail(job.id)}
                    className="flex-1 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground/90 text-xs font-bold transition-all text-center cursor-pointer"
                  >
                    Ver Detalhes
                  </button>
                  <button
                    onClick={() => navigateToCaseDetail(job.id, 'PROPOSALS')}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all text-center cursor-pointer shadow-xs"
                  >
                    Ver Propostas ({job.proposalsCount})
                  </button>
                </div>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};
