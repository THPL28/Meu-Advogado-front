import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  X,
  Star,
  Clock,
  MapPin,
  FileCheck2,
  Calendar,
  DollarSign,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ChevronRight,
  UserCheck,
  Globe,
  Award
} from 'lucide-react';
import { useLegalPlatform } from '../hooks/useLegalPlatform';

export const FindJobsPage: React.FC = () => {
  const {
    jobs,
    role,
    user,
    verificationStatus,
    isVerifiedLawyer,
    setActiveTab,
    navigateToCaseDetail,
    setIsNewProposalModalOpen,
    setSelectedCaseId,
    openUpgradeModal,
    openClientProfile,
    proposals
  } = useLegalPlatform();

  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [selectedSort, setSelectedSort] = useState<string>('recent');

  // Filter state
  const [minBudget, setMinBudget] = useState<string>('');
  const [maxBudget, setMaxBudget] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [onlyVerifiedClient, setOnlyVerifiedClient] = useState<boolean>(false);
  const [maxProposalsFilter, setMaxProposalsFilter] = useState<string>('ALL');
  const [daysPublishedFilter, setDaysPublishedFilter] = useState<string>('ALL');
  const [hiringTypeFilter, setHiringTypeFilter] = useState<string>('ALL');
  const [languageFilter, setLanguageFilter] = useState<string>('ALL');

  const specialties = ['ALL', ...Array.from(new Set(jobs.map(j => j.specialty)))];
  const states = ['ALL', ...Array.from(new Set(jobs.map(j => j.state).filter(Boolean)))];
  const countries = ['ALL', 'Brasil', 'Internacional'];

  // Only open jobs
  const openJobs = jobs.filter(j => j.status === 'OPEN');

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedSpecialty !== 'ALL') count++;
    if (minBudget !== '') count++;
    if (maxBudget !== '') count++;
    if (selectedState !== 'ALL') count++;
    if (selectedCountry !== 'ALL') count++;
    if (onlyVerifiedClient) count++;
    if (maxProposalsFilter !== 'ALL') count++;
    if (daysPublishedFilter !== 'ALL') count++;
    if (hiringTypeFilter !== 'ALL') count++;
    if (languageFilter !== 'ALL') count++;
    return count;
  }, [
    selectedSpecialty, minBudget, maxBudget, selectedState, selectedCountry,
    onlyVerifiedClient, maxProposalsFilter, daysPublishedFilter, hiringTypeFilter, languageFilter
  ]);

  const resetFilters = () => {
    setSelectedSpecialty('ALL');
    setMinBudget('');
    setMaxBudget('');
    setSelectedState('ALL');
    setSelectedCountry('ALL');
    setOnlyVerifiedClient(false);
    setMaxProposalsFilter('ALL');
    setDaysPublishedFilter('ALL');
    setHiringTypeFilter('ALL');
    setLanguageFilter('ALL');
    setSearchTerm('');
    setSelectedSort('recent');
  };

  const filteredJobs = useMemo(() => {
    let result = openJobs;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.description.toLowerCase().includes(q) ||
        j.specialty.toLowerCase().includes(q) ||
        (j.city && j.city.toLowerCase().includes(q))
      );
    }

    if (selectedSpecialty !== 'ALL') {
      result = result.filter(j => j.specialty === selectedSpecialty);
    }

    if (minBudget !== '') {
      const minVal = Number(minBudget);
      result = result.filter(j => j.budgetMax >= minVal);
    }

    if (maxBudget !== '') {
      const maxVal = Number(maxBudget);
      result = result.filter(j => j.budgetMin <= maxVal);
    }

    if (selectedState !== 'ALL') {
      result = result.filter(j => j.state === selectedState);
    }

    if (selectedCountry !== 'ALL') {
      if (selectedCountry === 'Brasil') {
        result = result.filter(j => !j.country || j.country === 'Brasil');
      } else {
        result = result.filter(j => j.country && j.country !== 'Brasil');
      }
    }

    if (onlyVerifiedClient) {
      result = result.filter(j => j.clientVerified);
    }

    if (maxProposalsFilter !== 'ALL') {
      const limit = Number(maxProposalsFilter);
      result = result.filter(j => j.proposalsCount <= limit);
    }

    if (daysPublishedFilter !== 'ALL') {
      const days = Number(daysPublishedFilter);
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      result = result.filter(j => new Date(j.createdAt).getTime() >= cutoff);
    }

    if (hiringTypeFilter !== 'ALL') {
      result = result.filter(j => (j.hiringType || 'Fixo') === hiringTypeFilter);
    }

    if (languageFilter !== 'ALL') {
      result = result.filter(j => (j.language || 'Português (BR)') === languageFilter);
    }

    // Sort
    return [...result].sort((a, b) => {
      switch (selectedSort) {
        case 'recent':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'budget_high':
          return b.budgetMax - a.budgetMax;
        case 'budget_low':
          return a.budgetMin - b.budgetMin;
        case 'proposals_low':
          return a.proposalsCount - b.proposalsCount;
        case 'proposals_high':
          return b.proposalsCount - a.proposalsCount;
        case 'deadline_short':
          return a.estimatedDeadlineDays - b.estimatedDeadlineDays;
        case 'deadline_long':
          return b.estimatedDeadlineDays - a.estimatedDeadlineDays;
        default:
          return 0;
      }
    });
  }, [
    openJobs, searchTerm, selectedSpecialty, minBudget, maxBudget, selectedState,
    selectedCountry, onlyVerifiedClient, maxProposalsFilter, daysPublishedFilter,
    hiringTypeFilter, languageFilter, selectedSort
  ]);

  const getCompetitivenessBadges = (job: typeof jobs[0]) => {
    const badges = [];

    // Proposal count badges
    if (job.proposalsCount <= 3) {
      badges.push({ label: 'Pouca concorrência', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' });
    } else if (job.proposalsCount >= 10) {
      badges.push({ label: 'Alta concorrência', color: 'bg-amber-50 text-amber-700 border-amber-200' });
    }

    // Client history
    if (job.clientHistoryCount && job.clientHistoryCount > 3) {
      badges.push({ label: 'Cliente recorrente', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' });
    }

    // High hiring probability
    if (job.proposalsCount <= 3 && job.clientVerified) {
      badges.push({ label: 'Alta prob. de contratação', color: 'bg-blue-50 text-blue-700 border-blue-200' });
    }

    // New opportunity
    const isNew = (Date.now() - new Date(job.createdAt).getTime()) < 48 * 60 * 60 * 1000;
    if (isNew) {
      badges.push({ label: 'Nova oportunidade', color: 'bg-purple-50 text-purple-700 border-purple-200' });
    }

    return badges;
  };

  const handleSendProposal = (jobId: string) => {
    if (!user) {
      setActiveTab('login');
      return;
    }

    if (role === 'LAWYER' && verificationStatus !== 'VERIFIED') {
      setIsVerificationModalOpen(true);
      return;
    }

    // Check if lawyer already submitted a proposal
    const existing = proposals.find(p => p.jobId === jobId && p.lawyerId === user.id && p.status !== 'REJECTED');
    if (existing) {
      setSelectedCaseId(jobId);
      navigateToCaseDetail(jobId);
      return;
    }

    // Open proposal modal for this job
    setSelectedCaseId(jobId);
    setIsNewProposalModalOpen(true);
  };

  return (
    <div className="space-y-6 text-foreground animate-in fade-in duration-200">
      
      {/* Educational Verification Status Banner for unverified lawyers */}
      {role === 'LAWYER' && verificationStatus !== 'VERIFIED' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
                {verificationStatus === 'PENDING'
                  ? 'Inscrição OAB em Análise'
                  : verificationStatus === 'REJECTED'
                  ? 'Cadastro OAB Rejeitado'
                  : verificationStatus === 'SUSPENDED'
                  ? 'Inscrição OAB Suspensa'
                  : verificationStatus === 'EXPIRED'
                  ? 'Certidão OAB Expirada'
                  : 'Verificação OAB Obrigatória para Envio de Propostas'}
              </h4>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                {verificationStatus === 'PENDING'
                  ? 'Seus dados e documentos da OAB estão em análise pela nossa equipe. A submissão de propostas será liberada automaticamente após a homologação.'
                  : 'Para garantir a segurança jurídica e regulatória da plataforma, é obrigatório validar suas credenciais da OAB antes de submeter propostas de honorários.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('edit-profile')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 transition-all cursor-pointer"
          >
            {verificationStatus === 'PENDING' ? 'Ver Status Cadastral' : 'Completar Verificação'}
          </button>
        </div>
      )}

      {/* Header Banner with rounded corners and gradient */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white border border-border-alt/60 shadow-lg relative overflow-hidden space-y-6">
        <div className="max-w-3xl space-y-2 relative z-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            Marketplace de Demandas Jurídicas
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Pesquisar Demandas & Casos
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-2xl">
            Explore demandas públicas, filtre por honorários, urgência e área de atuação, e envie propostas com concorrência em tempo real.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 relative z-10 max-w-3xl">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground/90" />
            <input
              type="text"
              placeholder="Busque por área, palavras-chave ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card/10 backdrop-blur-md border border-white/20 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-400 focus:bg-card focus:text-foreground focus:placeholder-slate-400 focus:outline-none transition-all shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Main Container: Sidebar Filters + Results */}
      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* Filter Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 space-y-6 bg-card p-6 rounded-3xl border border-border/80 shadow-xs h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-foreground text-sm">Filtros Avançados</h3>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-muted-foreground/90 hover:text-rose-600 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3 h-3" /> Limpar
              </button>
            )}
          </div>

          {/* Specialty */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Área do Direito
            </label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all cursor-pointer"
            >
              {specialties.map(s => (
                <option key={s} value={s}>{s === 'ALL' ? 'Todas as Áreas' : s}</option>
              ))}
            </select>
          </div>

          {/* Budget Range */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Faixa de Orçamento (R$)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Mín (ex: 1000)"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-2 text-xs text-foreground/90 placeholder:text-muted-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              />
              <input
                type="number"
                placeholder="Máx (ex: 20000)"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-2 text-xs text-foreground/90 placeholder:text-muted-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              />
            </div>
          </div>

          {/* State */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Estado (UF)
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all cursor-pointer"
            >
              {states.map(st => (
                <option key={st} value={st}>{st === 'ALL' ? 'Todos os Estados' : st}</option>
              ))}
            </select>
          </div>

          {/* Max Proposals Filter */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Concorrência (Propostas)
            </label>
            <select
              value={maxProposalsFilter}
              onChange={(e) => setMaxProposalsFilter(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all cursor-pointer"
            >
              <option value="ALL">Todas</option>
              <option value="0">Sem propostas (0)</option>
              <option value="3">Até 3 propostas (Pouca concorrência)</option>
              <option value="5">Até 5 propostas</option>
              <option value="10">Até 10 propostas</option>
            </select>
          </div>

          {/* Published Within */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Data de Publicação
            </label>
            <select
              value={daysPublishedFilter}
              onChange={(e) => setDaysPublishedFilter(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all cursor-pointer"
            >
              <option value="ALL">Qualquer data</option>
              <option value="1">Últimas 24 horas</option>
              <option value="3">Últimos 3 dias</option>
              <option value="7">Última semana</option>
              <option value="30">Último mês</option>
            </select>
          </div>

          {/* Hiring Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Tipo de Contratação
            </label>
            <select
              value={hiringTypeFilter}
              onChange={(e) => setHiringTypeFilter(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all cursor-pointer"
            >
              <option value="ALL">Todos os tipos</option>
              <option value="Fixo">Valor Fixo (Projeto)</option>
              <option value="Hora">Por Hora / Consultoria</option>
            </select>
          </div>

          {/* Client Verified Checkbox */}
          <div className="pt-2 border-t border-border/50">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-muted-foreground">
              <input
                type="checkbox"
                checked={onlyVerifiedClient}
                onChange={(e) => setOnlyVerifiedClient(e.target.checked)}
                className="w-4 h-4 rounded-sm text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              Apenas Clientes Verificados
            </label>
          </div>

        </aside>

        {/* Results Section */}
        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">
              Exibindo <span className="text-foreground font-extrabold">{filteredJobs.length}</span> {filteredJobs.length === 1 ? 'demanda encontrada' : 'demandas encontradas'}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {filteredJobs.map(job => {
              const badges = getCompetitivenessBadges(job);
              const hasSubmitted = user && proposals.some(p => p.jobId === job.id && p.lawyerId === user.id && p.status !== 'REJECTED');

              return (
                <div
                  key={job.id}
                  className="bg-card rounded-3xl p-6 sm:p-8 border border-border/80 shadow-xs hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col group"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                          {job.specialty}
                        </span>

                        {badges.map((b, i) => (
                          <span key={i} className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${b.color}`}>
                            {b.label}
                          </span>
                        ))}

                        {job.clientVerified && (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Cliente Verificado
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => {
                          setSelectedCaseId(job.id);
                          navigateToCaseDetail(job.id);
                        }}
                        className="text-xl font-extrabold text-foreground group-hover:text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer tracking-tight"
                      >
                        {job.title}
                      </h3>

                      {job.processNumber && (
                        <p className="text-xs font-mono text-muted-foreground/90">
                          Proc. N° {job.processNumber}
                        </p>
                      )}

                      <p className="text-xs sm:text-sm text-muted-foreground/90 line-clamp-2 leading-relaxed">
                        {job.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-start md:items-end shrink-0 bg-background p-3.5 rounded-2xl border border-border/50 min-w-[180px]">
                      <span className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider">Faixa Estimada</span>
                      <p className="text-lg font-extrabold text-foreground font-mono mt-0.5">
                        R$ {job.budgetMin.toLocaleString('pt-BR')} - R$ {job.budgetMax.toLocaleString('pt-BR')}
                      </p>
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-1">
                        Modalidade: {job.hiringType || 'Projeto Fixo'}
                      </span>
                    </div>
                  </div>

                  {/* Demands details grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3.5 border-t border-border/50 mt-auto">
                    <div className="flex items-center gap-2 text-muted-foreground/90">
                      <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">Propostas Recebidas</p>
                        <p className="text-xs font-bold text-foreground">{job.proposalsCount} {job.proposalsCount === 1 ? 'proposta' : 'propostas'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground/90">
                      <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">Prazo Estimado</p>
                        <p className="text-xs font-bold text-foreground">{job.estimatedDeadlineDays} dias</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground/90">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">Localização</p>
                        <p className="text-xs font-bold text-foreground">{job.city}, {job.state}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-muted-foreground/90">
                      <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">Publicado em</p>
                        <p className="text-xs font-bold text-foreground">{new Date(job.createdAt).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Footer Client & Action */}
                  <div className="flex items-center justify-between pt-4 mt-3 border-t border-border/50">
                    <button
                      onClick={() => openClientProfile(job.clientId)}
                      className="flex items-center gap-3 text-left group/client cursor-pointer"
                    >
                      {job.clientAvatar ? (
                        <img src={job.clientAvatar} alt={job.clientName} className="w-8 h-8 rounded-full object-cover group-hover/client:ring-2 group-hover/client:ring-emerald-500 transition-all" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-muted/80 flex items-center justify-center font-bold text-xs text-muted-foreground/90">
                          {job.clientName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-foreground/90 group-hover/client:text-emerald-600 dark:text-emerald-400 transition-colors underline-offset-2 hover:underline">{job.clientName}</p>
                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/90 font-medium">
                          {job.clientRating && (
                            <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                              <Star className="w-3 h-3 fill-amber-500" /> {job.clientRating}
                            </span>
                          )}
                          <span>({job.clientHistoryCount || 1} contratações na plataforma)</span>
                        </div>
                      </div>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedCaseId(job.id);
                          navigateToCaseDetail(job.id);
                        }}
                        className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-bold transition-colors cursor-pointer"
                      >
                        Ver Detalhes
                      </button>

                      {hasSubmitted ? (
                        <button
                          onClick={() => {
                            setSelectedCaseId(job.id);
                            navigateToCaseDetail(job.id);
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          Proposta Enviada <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendProposal(job.id)}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                        >
                          Enviar Proposta
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}

            {filteredJobs.length === 0 && (
              <div className="text-center py-16 bg-card rounded-3xl border border-border p-8 space-y-4">
                <Search className="w-12 h-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-bold text-foreground">Nenhuma demanda encontrada</h3>
                <p className="text-xs text-muted-foreground/90 max-w-sm mx-auto">
                  Tente alterar seus termos de pesquisa ou resetar os filtros avançados.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl bg-alt text-alt-foreground font-bold text-xs transition-colors cursor-pointer"
                >
                  Resetar Filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Educational Verification Blocking Modal */}
      {isVerificationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2.5 text-amber-600">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800">
                  <ShieldAlert className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-base font-extrabold text-foreground">Verificação OAB Obrigatória</h3>
              </div>
              <button
                onClick={() => setIsVerificationModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-muted-foreground leading-relaxed">
              <p>
                O envio de propostas de honorários é exclusivo para advogados devidamente verificados e ativos na Ordem dos Advogados do Brasil (OAB).
              </p>
              <div className="p-3.5 bg-background rounded-2xl border border-border/60 space-y-1.5">
                <span className="font-bold text-foreground block">Status Atual da Conta:</span>
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                    verificationStatus === 'PENDING'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : verificationStatus === 'REJECTED' || verificationStatus === 'SUSPENDED' || verificationStatus === 'EXPIRED'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-muted text-muted-foreground border border-border'
                  }`}>
                    {verificationStatus === 'PENDING'
                      ? 'OAB Em Análise'
                      : verificationStatus === 'REJECTED'
                      ? 'Cadastro Rejeitado'
                      : verificationStatus === 'SUSPENDED'
                      ? 'OAB Suspensa'
                      : verificationStatus === 'EXPIRED'
                      ? 'OAB Expirada'
                      : 'Cadastro Incompleto (DRAFT)'}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground pt-1">
                  {verificationStatus === 'PENDING'
                    ? 'Nossa equipe está analisando os dados da sua inscrição e certidão da OAB.'
                    : 'Complete seus dados de inscrição OAB, estados de jurisdição e anexo de certidão para liberar o envio de propostas.'}
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                onClick={() => setIsVerificationModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-bold hover:bg-muted/80 transition-colors cursor-pointer"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setIsVerificationModalOpen(false);
                  setActiveTab('edit-profile');
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              >
                Ir para Validação de Perfil
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
