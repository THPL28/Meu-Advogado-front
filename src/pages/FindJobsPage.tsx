import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  X,
  Clock,
  MapPin,
  FileCheck2,
  Calendar,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Lock,
  Briefcase,
  Layers,
  Sparkles
} from 'lucide-react';
import { useLegalPlatform } from '../hooks/useLegalPlatform';
import { JobDiscoveryDto, UrgencyLevel } from '../types';
import { jobsApi } from '../services/api';

export const FindJobsPage: React.FC = () => {
  const {
    jobs,
    role,
    user,
    verificationStatus,
    setActiveTab,
    navigateToCaseDetail,
    setIsNewProposalModalOpen,
    setSelectedCaseId,
    proposals
  } = useLegalPlatform();

  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [minBudget, setMinBudget] = useState<string>('');
  const [maxBudget, setMaxBudget] = useState<string>('');
  const [hiringTypeFilter, setHiringTypeFilter] = useState<string>('ALL');
  const [selectedSort, setSelectedSort] = useState<string>('recent');

  // Server-side Discovery Pagination state
  const [discoveryCases, setDiscoveryCases] = useState<JobDiscoveryDto[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Available filters options
  const defaultSpecialties = [
    'ALL',
    'Direito Empresarial',
    'Compliance & LGPD',
    'Direito Trabalhista',
    'Direito Tributário',
    'Propriedade Intelectual',
    'Direito Cível & Imobiliário'
  ];
  const dynamicSpecialties = Array.from(new Set(jobs.map(j => j.specialty).filter(Boolean)));
  const specialties = Array.from(new Set([...defaultSpecialties, ...dynamicSpecialties]));

  const defaultStates = ['ALL', 'SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'DF', 'PE'];
  const dynamicStates = Array.from(new Set(jobs.map(j => j.state).filter(Boolean)));
  const states = Array.from(new Set([...defaultStates, ...dynamicStates]));

  // Fetch sanitized discovery cases from API
  const fetchDiscoveryData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await jobsApi.getDiscoveryCases({
        page: currentPage,
        size: pageSize,
        specialty: selectedSpecialty !== 'ALL' ? selectedSpecialty : undefined,
        urgency: selectedUrgency !== 'ALL' ? selectedUrgency : undefined,
        state: selectedState !== 'ALL' ? selectedState : undefined,
      });

      if (response && Array.isArray(response.content) && response.content.length > 0) {
        setDiscoveryCases(response.content);
        setTotalPages(response.totalPages || 1);
        setTotalElements(response.totalElements || response.content.length);
      } else {
        // Fallback to open jobs from context converted to sanitized DTOs
        const openList = jobs
          .filter(j => j.status === 'OPEN')
          .map(j => ({
            id: j.id,
            title: j.title,
            specialty: j.specialty,
            urgency: j.urgency,
            budgetMin: j.budgetMin,
            budgetMax: j.budgetMax,
            city: j.city,
            state: j.state,
            createdAt: j.createdAt,
            visibility: j.visibility || 'DISCOVERY_SANITIZED',
            status: j.status,
            moderationStatus: j.moderationStatus || 'APPROVED',
            proposalsCount: j.proposalsCount || 0,
            hiringType: j.hiringType === 'HOURLY' ? ('HOURLY' as const) : ('FIXED' as const),
          }));

        let filteredFallback = openList;
        if (selectedSpecialty !== 'ALL') {
          filteredFallback = filteredFallback.filter(j => j.specialty === selectedSpecialty);
        }
        if (selectedUrgency !== 'ALL') {
          filteredFallback = filteredFallback.filter(j => j.urgency === selectedUrgency);
        }
        if (selectedState !== 'ALL') {
          filteredFallback = filteredFallback.filter(j => j.state === selectedState);
        }

        const start = currentPage * pageSize;
        const pageItems = filteredFallback.slice(start, start + pageSize);
        setDiscoveryCases(pageItems);
        setTotalElements(filteredFallback.length);
        setTotalPages(Math.max(1, Math.ceil(filteredFallback.length / pageSize)));
      }
    } catch (e) {
      console.warn('Error loading discovery cases:', e);
      setDiscoveryCases([]);
      setTotalElements(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize, selectedSpecialty, selectedUrgency, selectedState, jobs]);

  useEffect(() => {
    fetchDiscoveryData();
  }, [fetchDiscoveryData]);

  // Client-side quick filter & sort on current page
  const filteredAndSortedCases = useMemo(() => {
    let result = [...discoveryCases];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(j =>
        j.title.toLowerCase().includes(q) ||
        j.specialty.toLowerCase().includes(q) ||
        (j.city && j.city.toLowerCase().includes(q)) ||
        (j.state && j.state.toLowerCase().includes(q))
      );
    }

    if (minBudget !== '') {
      const minVal = Number(minBudget);
      result = result.filter(j => j.budgetMax >= minVal);
    }

    if (maxBudget !== '') {
      const maxVal = Number(maxBudget);
      result = result.filter(j => j.budgetMin <= maxVal);
    }

    if (hiringTypeFilter !== 'ALL') {
      result = result.filter(j => (j.hiringType === 'HOURLY' ? 'Hora' : 'Fixo') === hiringTypeFilter || j.hiringType === hiringTypeFilter);
    }

    return result.sort((a, b) => {
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
        default:
          return 0;
      }
    });
  }, [discoveryCases, searchTerm, minBudget, maxBudget, hiringTypeFilter, selectedSort]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedSpecialty !== 'ALL') count++;
    if (selectedUrgency !== 'ALL') count++;
    if (selectedState !== 'ALL') count++;
    if (minBudget !== '') count++;
    if (maxBudget !== '') count++;
    if (hiringTypeFilter !== 'ALL') count++;
    return count;
  }, [selectedSpecialty, selectedUrgency, selectedState, minBudget, maxBudget, hiringTypeFilter]);

  const resetFilters = () => {
    setSelectedSpecialty('ALL');
    setSelectedUrgency('ALL');
    setSelectedState('ALL');
    setMinBudget('');
    setMaxBudget('');
    setHiringTypeFilter('ALL');
    setSearchTerm('');
    setSelectedSort('recent');
    setCurrentPage(0);
  };

  const getUrgencyBadge = (urgency: UrgencyLevel) => {
    switch (urgency) {
      case 'CRITICAL':
        return { label: 'Urgente / Risco Liminar', color: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'HIGH':
        return { label: 'Alta Urgência', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'MEDIUM':
        return { label: 'Média Urgência', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'LOW':
      default:
        return { label: 'Baixa Urgência', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
  };

  const handleSendProposal = (jobId: string | number) => {
    const idStr = String(jobId);
    if (!user) {
      setActiveTab('login');
      return;
    }

    if (role === 'LAWYER' && verificationStatus !== 'VERIFIED') {
      setIsVerificationModalOpen(true);
      return;
    }

    const existing = proposals.find(
      p => String(p.jobId) === idStr && p.lawyerId === user.id && p.status !== 'REJECTED'
    );
    if (existing) {
      setSelectedCaseId(idStr);
      navigateToCaseDetail(idStr);
      return;
    }

    setSelectedCaseId(idStr);
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

      {/* Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white border border-border-alt/60 shadow-lg relative overflow-hidden space-y-6">
        <div className="max-w-3xl space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Catálogo de Descoberta Sanitizada
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-semibold">
              <Lock className="w-3 h-3" /> Sigilo Jurídico Ativo
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Pesquisar Demandas & Oportunidades
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed max-w-2xl">
            Explore demandas publicadas com resumos higienizados, sem exposição indevida de dados processuais sensíveis ou contato prévio de clientes corporativos.
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
              <h3 className="font-bold text-foreground text-sm">Filtros da Descoberta</h3>
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
              Área Jurídica
            </label>
            <select
              value={selectedSpecialty}
              onChange={(e) => {
                setSelectedSpecialty(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all cursor-pointer"
            >
              {specialties.map(s => (
                <option key={s} value={s}>{s === 'ALL' ? 'Todas as Áreas' : s}</option>
              ))}
            </select>
          </div>

          {/* Urgency */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Nível de Urgência
            </label>
            <select
              value={selectedUrgency}
              onChange={(e) => {
                setSelectedUrgency(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all cursor-pointer"
            >
              <option value="ALL">Todas as Urgências</option>
              <option value="LOW">Baixa Urgência</option>
              <option value="MEDIUM">Média Urgência</option>
              <option value="HIGH">Alta Urgência</option>
              <option value="CRITICAL">Urgente / Risco Liminar</option>
            </select>
          </div>

          {/* State */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Estado (UF do Foro)
            </label>
            <select
              value={selectedState}
              onChange={(e) => {
                setSelectedState(e.target.value);
                setCurrentPage(0);
              }}
              className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all cursor-pointer"
            >
              {states.map(st => (
                <option key={st} value={st}>{st === 'ALL' ? 'Todos os Estados' : st}</option>
              ))}
            </select>
          </div>

          {/* Budget Range */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Faixa de Honorários (R$)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Mín"
                value={minBudget}
                onChange={(e) => setMinBudget(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-2 text-xs text-foreground/90 placeholder:text-muted-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              />
              <input
                type="number"
                placeholder="Máx"
                value={maxBudget}
                onChange={(e) => setMaxBudget(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-2 text-xs text-foreground/90 placeholder:text-muted-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              />
            </div>
          </div>

          {/* Hiring Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Modalidade de Honorários
            </label>
            <select
              value={hiringTypeFilter}
              onChange={(e) => setHiringTypeFilter(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all cursor-pointer"
            >
              <option value="ALL">Todas as Modalidades</option>
              <option value="Fixo">Valor Fixo (Projeto)</option>
              <option value="Hora">Por Hora / Consultoria</option>
            </select>
          </div>

          {/* Sort order */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Ordenar Por
            </label>
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all cursor-pointer"
            >
              <option value="recent">Mais Recentes</option>
              <option value="oldest">Mais Antigos</option>
              <option value="budget_high">Maior Orçamento</option>
              <option value="budget_low">Menor Orçamento</option>
              <option value="proposals_low">Menor Concorrência</option>
              <option value="proposals_high">Maior Concorrência</option>
            </select>
          </div>

        </aside>

        {/* Results Section */}
        <div className="flex-1 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <h2 className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Exibindo <span className="text-foreground font-extrabold">{filteredAndSortedCases.length}</span> {filteredAndSortedCases.length === 1 ? 'demanda nesta página' : 'demandas nesta página'}
              <span className="text-muted-foreground/70">({totalElements} total no catálogo)</span>
            </h2>

            {/* Page Size Selector */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Itens por página:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(0);
                }}
                className="bg-card border border-border rounded-lg px-2 py-1 text-xs font-bold text-foreground focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="p-12 text-center bg-card rounded-3xl border border-border space-y-3">
              <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-muted-foreground">Carregando catálogo de demandas sanitizadas...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredAndSortedCases.map(job => {
                const urgencyBadge = getUrgencyBadge(job.urgency);
                const hasSubmitted = user && proposals.some(
                  p => String(p.jobId) === String(job.id) && p.lawyerId === user.id && p.status !== 'REJECTED'
                );

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

                          <span className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${urgencyBadge.color}`}>
                            {urgencyBadge.label}
                          </span>

                          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> Demanda Higienizada
                          </span>

                          {job.moderationStatus === 'APPROVED' && (
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-emerald-500" /> Moderação Aprovada
                            </span>
                          )}
                        </div>

                        <h3
                          onClick={() => {
                            setSelectedCaseId(String(job.id));
                            navigateToCaseDetail(String(job.id));
                          }}
                          className="text-xl font-extrabold text-foreground group-hover:text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer tracking-tight"
                        >
                          {job.title}
                        </h3>

                        <p className="text-xs text-muted-foreground/90 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Resumo sanitizado para proteção das partes. Detalhes processuais completos disponíveis após a contratação formal.</span>
                        </p>
                      </div>

                      <div className="flex flex-col items-start md:items-end shrink-0 bg-background p-3.5 rounded-2xl border border-border/50 min-w-[180px]">
                        <span className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider">Faixa Estimada</span>
                        <p className="text-lg font-extrabold text-foreground font-mono mt-0.5">
                          R$ {job.budgetMin.toLocaleString('pt-BR')} - R$ {job.budgetMax.toLocaleString('pt-BR')}
                        </p>
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-1">
                          Modalidade: {job.hiringType === 'HOURLY' ? 'Honorários por Hora' : 'Preço Fixo'}
                        </span>
                      </div>
                    </div>

                    {/* Demands details grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 py-3.5 border-t border-border/50 mt-auto">
                      <div className="flex items-center gap-2 text-muted-foreground/90">
                        <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">Propostas Recebidas</p>
                          <p className="text-xs font-bold text-foreground">{job.proposalsCount} {job.proposalsCount === 1 ? 'proposta' : 'propostas'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground/90">
                        <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/90">Foro / Localização</p>
                          <p className="text-xs font-bold text-foreground">{job.city ? `${job.city}, ${job.state}` : (job.state || 'Nacional')}</p>
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

                    {/* Footer Actions (Client info masked per privacy specification) */}
                    <div className="flex items-center justify-between pt-4 mt-3 border-t border-border/50">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="font-semibold">Cliente Corporativo Verificado</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedCaseId(String(job.id));
                            navigateToCaseDetail(String(job.id));
                          }}
                          className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-bold transition-colors cursor-pointer"
                        >
                          Ver Detalhes
                        </button>

                        {hasSubmitted ? (
                          <button
                            onClick={() => {
                              setSelectedCaseId(String(job.id));
                              navigateToCaseDetail(String(job.id));
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

              {filteredAndSortedCases.length === 0 && (
                <div className="text-center py-16 bg-card rounded-3xl border border-border p-8 space-y-4">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-bold text-foreground">Nenhuma demanda encontrada</h3>
                  <p className="text-xs text-muted-foreground/90 max-w-sm mx-auto">
                    Tente alterar seus termos de pesquisa ou resetar os filtros da descoberta.
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
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-card rounded-2xl border border-border shadow-xs mt-6">
              <div className="text-xs text-muted-foreground">
                Página <span className="font-bold text-foreground">{currentPage + 1}</span> de <span className="font-bold text-foreground">{totalPages}</span> • <span className="font-bold text-foreground">{totalElements}</span> demandas no total
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0 || isLoading}
                  className="px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Anterior
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageIdx = i;
                    if (totalPages > 5 && currentPage > 2) {
                      pageIdx = Math.min(totalPages - 5 + i, currentPage - 2 + i);
                    }
                    return (
                      <button
                        key={pageIdx}
                        onClick={() => setCurrentPage(pageIdx)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          currentPage === pageIdx
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-muted text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {pageIdx + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={currentPage >= totalPages - 1 || isLoading}
                  className="px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Próxima <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

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
