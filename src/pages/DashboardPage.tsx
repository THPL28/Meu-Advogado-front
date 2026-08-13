import React from 'react';
import {
  Briefcase,
  FileCheck2,
  CreditCard,
  Star,
  TrendingUp,
  Clock,
  Calendar,
  AlertCircle,
  PlusCircle,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  Users
} from 'lucide-react';
import { useLegalPlatform } from '../hooks/useLegalPlatform';

export const DashboardPage: React.FC = () => {
  const {
    user,
    role,
    jobs,
    proposals,
    contracts,
    payments,
    metrics,
    setActiveTab,
    navigateToCaseDetail,
    setIsNewCaseModalOpen,
    setIsAiAssistantModalOpen
  } = useLegalPlatform();

  const activeCases = jobs.filter(j => j.status === 'IN_PROGRESS' || j.status === 'OPEN');
  const pendingProposals = proposals.filter(p => p.status === 'PENDING' || p.status === 'UNDER_REVIEW');
  const upcomingHearings = jobs.flatMap(j => j.upcomingHearings || []);

  // Plan consumption metrics
  const currentPlan = user?.subscriptionPlan || 'Pro';
  const weeklyLimit = currentPlan === 'Basic' ? 2 : currentPlan === 'Pro' ? 8 : 999;
  const weeklyUsed = currentPlan === 'Basic' ? 2 : 6;

  const monthlyLimit = currentPlan === 'Basic' ? 5 : currentPlan === 'Pro' ? 25 : 999;
  const monthlyUsed = currentPlan === 'Basic' ? 4 : 18;

  const concurrentLimit = currentPlan === 'Basic' ? 2 : currentPlan === 'Pro' ? 5 : 999;
  const concurrentUsed = currentPlan === 'Basic' ? 2 : 3;

  // Filter opportunities for lawyer: OPEN jobs where lawyer hasn't submitted a proposal yet
  const userSpecialties = (user?.specialties || []).map(s => s.toLowerCase().trim());

  const isMatchingLawyerArea = (job: typeof jobs[0]) => {
    if (!userSpecialties.length) return true;
    const jobSpec = (job.specialty || '').toLowerCase();
    const jobTitle = (job.title || '').toLowerCase();
    const jobType = (job.type || '').toLowerCase();
    return userSpecialties.some(s => 
      jobSpec.includes(s) || s.includes(jobSpec) || jobTitle.includes(s) || jobType.includes(s)
    );
  };

  const openJobsNoProposal = jobs.filter(job => {
    if (job.status !== 'OPEN') return false;
    const hasSubmittedProposal = proposals.some(p => p.jobId === job.id && p.lawyerId === user?.id);
    return !hasSubmittedProposal;
  });

  const displayJobsForLawyer = [...openJobsNoProposal].sort((a, b) => {
    const aMatch = isMatchingLawyerArea(a);
    const bMatch = isMatchingLawyerArea(b);
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    return 0;
  });

  const displayJobs = displayJobsForLawyer.slice(0, 3);

  // Client-specific filtered data
  const clientJobs = jobs.filter(j => j.clientId === user?.id || role === 'CLIENT');
  const clientProposals = proposals.filter(p => clientJobs.some(j => j.id === p.jobId));
  const clientContracts = contracts.filter(c => c.clientId === user?.id || role === 'CLIENT');
  const totalEscrowInCustody = clientContracts.reduce((sum, c) => sum + (c.totalAmount || 0), 0);

  // CLIENT DASHBOARD VIEW
  if (role === 'CLIENT') {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        
        {/* Client Welcome & Quick Action Header Banner */}
        <div className="bg-alt rounded-3xl p-6 sm:p-8 text-alt-foreground relative overflow-hidden shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 border border-border-alt">
          <div className="space-y-2 z-10 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Painel do Cliente Corporativo
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Olá, {user?.name || 'Cliente'}!
            </h1>
            <p className="text-xs sm:text-sm text-alt-foreground/70 leading-relaxed">
              Gerencie suas demandas jurídicas, analise propostas de advogados verificados e acompanhe a execução dos seus contratos com custódia segura.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 z-10 shrink-0">
            <button
              onClick={() => setIsNewCaseModalOpen(true)}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Publicar Nova Demanda</span>
            </button>
            <button
              onClick={() => setActiveTab('find-lawyers')}
              className="px-5 py-3 rounded-xl bg-alt/90 hover:bg-alt text-alt-foreground/80 hover:text-alt-foreground font-semibold text-xs transition-all border border-border-alt flex items-center justify-center gap-2 cursor-pointer"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Buscar Advogados</span>
            </button>
          </div>
        </div>

        {/* Client KPI Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-border-strong transition-all">
            <div className="flex items-center justify-between text-muted-foreground/90 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Demandas Publicadas</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Briefcase className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl lg:text-3xl font-extrabold text-foreground font-mono tracking-tight">
                {clientJobs.length}
              </span>
              <span className="text-[11px] text-muted-foreground/90 font-medium">
                {clientJobs.filter(j => j.status === 'OPEN').length} em aberto
              </span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-border-strong transition-all">
            <div className="flex items-center justify-between text-muted-foreground/90 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Propostas Recebidas</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <FileCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl lg:text-3xl font-extrabold text-foreground font-mono tracking-tight">
                {clientProposals.length}
              </span>
              <button 
                onClick={() => setActiveTab('proposals')}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                Analisar propostas &rarr;
              </button>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-border-strong transition-all">
            <div className="flex items-center justify-between text-muted-foreground/90 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Contratos Ativos</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl lg:text-3xl font-extrabold text-foreground font-mono tracking-tight">
                {clientContracts.filter(c => c.status === 'ACTIVE').length}
              </span>
              <span className="text-[11px] text-muted-foreground/90 font-medium">com garantia Escrow</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-border-strong transition-all">
            <div className="flex items-center justify-between text-muted-foreground/90 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider">Em Custódia Escrow</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-xl lg:text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                R$ {(totalEscrowInCustody || 0).toLocaleString('pt-BR')}
              </span>
            </div>
          </div>

        </div>

        {/* Client Main Grid: Published Demands & Active Contracts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Column 1 & 2: Client's Published Jobs & Proposals */}
          <div className="lg:col-span-2 bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <div>
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-emerald-600" />
                  Minhas Demandas Publicadas
                </h3>
                <p className="text-xs text-muted-foreground/90 mt-0.5">Acompanhe as propostas de advogados enviadas para seus casos</p>
              </div>
              <button
                onClick={() => setActiveTab('cases')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Gerenciar Demandas <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {clientJobs.length > 0 ? (
                clientJobs.map((job) => {
                  const proposalsForJob = proposals.filter(p => p.jobId === job.id);

                  return (
                    <div
                      key={job.id}
                      onClick={() => navigateToCaseDetail(job.id)}
                      className="p-5 bg-background/70 hover:bg-muted/80 border border-border/80 hover:border-emerald-500/50 rounded-2xl transition-all cursor-pointer space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200/60">
                            {job.specialty}
                          </span>
                          <h4 className="text-sm font-bold text-foreground pt-1">{job.title}</h4>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold shrink-0 ${
                          job.status === 'OPEN' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : job.status === 'IN_PROGRESS' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-muted/80 text-muted-foreground'
                        }`}>
                          {job.status === 'OPEN' ? 'Recebendo Propostas' : job.status === 'IN_PROGRESS' ? 'Em Andamento' : 'Concluído'}
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground/90 line-clamp-2">{job.description}</p>

                      <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <FileCheck2 className="w-4 h-4 text-emerald-600" />
                          <span className="font-bold text-foreground">{proposalsForJob.length} {proposalsForJob.length === 1 ? 'Proposta Recebida' : 'Propostas Recebidas'}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                          Ver Propostas & Detalhes &rarr;
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-background rounded-2xl border border-border space-y-3">
                  <p className="text-xs text-muted-foreground/90 font-medium">Você ainda não possui nenhuma demanda publicada na plataforma.</p>
                  <button
                    onClick={() => setIsNewCaseModalOpen(true)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs inline-flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Publicar Primeira Demanda</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Column 3: Active Contracts & Escrow Status */}
          <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Contratos Ativos
              </h3>
              <button
                onClick={() => setActiveTab('contracts')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                Ver Todos &rarr;
              </button>
            </div>

            <div className="space-y-4">
              {clientContracts.length > 0 ? (
                clientContracts.map((contract) => (
                  <div key={contract.id} className="p-4 bg-background/80 rounded-2xl border border-border/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground line-clamp-1">{contract.jobTitle}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Escrow Ativo
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground/90">
                      Advogado: <strong className="text-foreground/90">{contract.lawyerName}</strong>
                    </p>

                    <div className="p-2.5 bg-card rounded-xl border border-border/80 text-xs flex items-center justify-between">
                      <span className="text-muted-foreground/90 text-[11px]">Valor Protegido:</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">R$ {(contract.totalAmount || 0).toLocaleString('pt-BR')}</span>
                    </div>

                    <button
                      onClick={() => navigateToCaseDetail(contract.jobId)}
                      className="w-full py-2 bg-card hover:bg-muted border border-border rounded-xl text-xs font-bold text-foreground/90 transition-all text-center cursor-pointer"
                    >
                      Acompanhar Execução
                    </button>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center bg-background rounded-2xl border border-border space-y-2">
                  <p className="text-xs text-muted-foreground/90">Nenhum contrato ativo no momento.</p>
                  <p className="text-[11px] text-muted-foreground/90">Ao aceitar uma proposta, o contrato e a garantia Escrow serão exibidos aqui.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    );
  }

  // LAWYER DASHBOARD VIEW

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* KPI Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI 1 */}
        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-border-strong transition-all">
          <div className="flex items-center justify-between text-muted-foreground/90 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {role === 'LAWYER' ? 'Casos em Andamento' : 'Demandas Abertas'}
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl lg:text-3xl font-extrabold text-foreground font-mono tracking-tight">{activeCases.length}</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-border-strong transition-all">
          <div className="flex items-center justify-between text-muted-foreground/90 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {role === 'LAWYER' ? 'Propostas sob Análise' : 'Propostas Recebidas'}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl lg:text-3xl font-extrabold text-foreground font-mono tracking-tight">{pendingProposals.length}</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-border-strong transition-all">
          <div className="flex items-center justify-between text-muted-foreground/90 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {role === 'LAWYER' ? 'Saldo Liberado (PIX)' : 'Faturas a Pagar'}
            </span>
            <div className={`p-2 rounded-xl ${role === 'LAWYER' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl lg:text-3xl font-extrabold font-mono tracking-tight ${role === 'LAWYER' ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
              {role === 'LAWYER' ? 'R$ 14.850,00' : 'R$ 0,00'}
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-6 rounded-2xl bg-card border border-border/80 shadow-xs hover:border-border-strong transition-all">
          <div className="flex items-center justify-between text-muted-foreground/90 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {role === 'LAWYER' ? 'Pontuação Profissional' : 'Contratos Concluídos'}
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Star className={`w-4 h-4 ${role === 'LAWYER' ? 'fill-amber-400 text-amber-400' : ''}`} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl lg:text-3xl font-extrabold text-foreground font-mono tracking-tight">
              {role === 'LAWYER' ? (user?.rating || 4.9) : jobs.filter(j => j.status === 'COMPLETED').length}
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid: Weekly Productivity Chart + Upcoming Hearings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Plan Consumption & Usage Section */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-card border border-border/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-border/50">
            <div>
              <h3 className="text-base font-bold text-foreground">
                Consumo do Plano & Propostas
              </h3>
              <p className="text-xs text-muted-foreground/90">Acompanhe seus limites de envio de propostas do Plano {currentPlan}</p>
            </div>
            <button
              onClick={() => setActiveTab('subscription')}
              className="text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-full border border-emerald-200/60 transition-colors cursor-pointer"
            >
              Gerenciar Plano &rarr;
            </button>
          </div>

          {/* Consumption Progress Bars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            
            {/* Weekly */}
            <div className="bg-background/70 p-5 rounded-2xl border border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">Propostas Semanais</span>
                <span className="text-xs font-mono font-bold text-foreground bg-card px-2 py-0.5 rounded-md border border-border/60">
                  {weeklyUsed} / {weeklyLimit === 999 ? '∞' : weeklyLimit}
                </span>
              </div>
              <div className="h-2.5 w-full bg-muted/80/70 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    weeklyLimit !== 999 && (weeklyUsed / weeklyLimit) >= 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${weeklyLimit === 999 ? 100 : Math.min(100, (weeklyUsed / weeklyLimit) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground/90 font-medium">Renova em 4 dias</p>
            </div>

            {/* Monthly */}
            <div className="bg-background/70 p-5 rounded-2xl border border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">Propostas Mensais</span>
                <span className="text-xs font-mono font-bold text-foreground bg-card px-2 py-0.5 rounded-md border border-border/60">
                  {monthlyUsed} / {monthlyLimit === 999 ? '∞' : monthlyLimit}
                </span>
              </div>
              <div className="h-2.5 w-full bg-muted/80/70 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    monthlyLimit !== 999 && (monthlyUsed / monthlyLimit) >= 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${monthlyLimit === 999 ? 100 : Math.min(100, (monthlyUsed / monthlyLimit) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground/90 font-medium">Ciclo renova em 12/03/2025</p>
            </div>

            {/* Concurrent */}
            <div className="bg-background/70 p-5 rounded-2xl border border-border/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">Propostas Simultâneas</span>
                <span className="text-xs font-mono font-bold text-foreground bg-card px-2 py-0.5 rounded-md border border-border/60">
                  {concurrentUsed} / {concurrentLimit === 999 ? '∞' : concurrentLimit}
                </span>
              </div>
              <div className="h-2.5 w-full bg-muted/80/70 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${concurrentLimit === 999 ? 100 : Math.min(100, (concurrentUsed / concurrentLimit) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground/90 font-medium">Aguardando resposta dos clientes</p>
            </div>

          </div>
        </div>

        {/* Upcoming Hearings Alert Sidebar */}
        <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-card border border-border/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600" />
              Próximas Audiências
            </h3>
          </div>

          <div className="space-y-3">
            {upcomingHearings.length > 0 ? (
              upcomingHearings.map((h) => (
                <div key={h.id} className="p-4 bg-background/80 rounded-2xl border border-border/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-foreground">{h.title}</span>
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold text-[11px]">
                      {h.type}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground/90">{h.courtLocation}</p>
                  <div className="flex items-center justify-between text-xs font-mono text-emerald-600 dark:text-emerald-400 pt-2 border-t border-border/60">
                    <span>{h.date} às {h.time}</span>
                    <span className="text-muted-foreground/90 font-sans">Juiz: {h.judgeName}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground/90 text-center py-6">Nenhuma audiência marcada para esta semana.</p>
            )}
          </div>
        </div>

      </div>

      {/* Recent Cases / Opportunities Section */}
      <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl bg-card border border-border/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              {role === 'LAWYER' ? 'Oportunidades em Aberto para Você' : 'Demandas Recentes & Oportunidades em Aberto'}
            </h3>
            <p className="text-xs text-muted-foreground/90 mt-0.5">
              {role === 'LAWYER' 
                ? 'Demandas alinhadas às suas áreas de atuação sem proposta enviada' 
                : 'Processos ativos, pareceres e solicitações com custódia de honorários'}
            </p>
          </div>
          <button
            onClick={() => setActiveTab(role === 'LAWYER' ? 'find-jobs' : 'cases')}
            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            {role === 'LAWYER' ? 'Encontrar Mais Demandas' : 'Ver Todos os Casos'} <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Opportunities Grid */}
        {displayJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayJobs.map((job) => {
              const isMatch = role === 'LAWYER' && isMatchingLawyerArea(job);

              return (
                <div
                  key={job.id}
                  onClick={() => navigateToCaseDetail(job.id)}
                  className="p-5 bg-card hover:bg-background/80 rounded-2xl border border-border/80 hover:border-emerald-500/50 transition-all duration-150 cursor-pointer space-y-3 flex flex-col justify-between shadow-xs relative group"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        {job.specialty}
                      </span>

                      {job.processNumber && (
                        <span className="text-xs font-mono text-muted-foreground/90 bg-muted px-2 py-0.5 rounded border border-border">
                          Proc. nº {job.processNumber}
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-foreground group-hover:text-emerald-600 dark:text-emerald-400 transition-colors line-clamp-1">{job.title}</h4>
                    <p className="text-xs text-muted-foreground/90 line-clamp-2 leading-relaxed">{job.description}</p>
                  </div>

                  <div className="pt-3 border-t border-border/50 flex flex-col gap-2 text-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[11px] text-muted-foreground/90 block font-medium">Honorários Previstos</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          R$ {(job.budgetMin || 0).toLocaleString('pt-BR')} - R$ {(job.budgetMax || 0).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <span className="text-muted-foreground/90 text-xs font-medium bg-muted px-2.5 py-1 rounded-lg">
                        {job.city}, {job.state}
                      </span>
                    </div>

                    {role === 'LAWYER' && (
                      <div className="flex items-center justify-between gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50/60 rounded-lg p-2 border border-emerald-100">
                        <span className="flex items-center gap-1">
                          <PlusCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Sem Proposta Enviada
                        </span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 underline font-medium">Enviar Proposta &rarr;</span>
                      </div>
                    )}

                    {role === 'CLIENT' && (
                      <div className="flex items-center gap-1.5 text-muted-foreground/90 font-semibold bg-background rounded-lg p-2 border border-border/50">
                        <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{job.proposalsCount} {job.proposalsCount === 1 ? 'proposta' : 'propostas'}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-background/60 rounded-2xl border border-border/80 space-y-2">
            <p className="text-xs font-semibold text-muted-foreground/90">Não há novas demandas abertas sem proposta para suas áreas de atuação no momento.</p>
            <button
              onClick={() => setActiveTab('find-jobs')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              Explorar todas as demandas disponíveis &rarr;
            </button>
          </div>
        )}

      </div>

    </div>
  );
};
