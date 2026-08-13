import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ShieldCheck,
  Star,
  Clock,
  MapPin,
  Briefcase,
  MessageSquare,
  Send,
  UserCheck,
  SlidersHorizontal,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  X,
  Grid,
  List
} from 'lucide-react';
import { useLegalPlatform } from '../hooks/useLegalPlatform';
import { FullLawyerProfile } from '../types';

export const FindLawyersPage: React.FC = () => {
  const {
    lawyers,
    openLawyerProfile,
    openInviteModal,
    openNegotiationChat,
    role,
    setIsNewProposalModalOpen,
    user,
    setActiveTab
  } = useLegalPlatform();

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('ALL');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxHourlyRate, setMaxHourlyRate] = useState<number>(1000);
  const [modalityFilter, setModalityFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'RATING' | 'CASES' | 'PRICE_LOW' | 'PRICE_HIGH'>('RATING');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter Logic
  const filteredLawyers = useMemo(() => {
    return lawyers.filter((l) => {
      // Search term
      if (searchTerm.trim() !== '') {
        const term = searchTerm.toLowerCase();
        const matchesName = l.name.toLowerCase().includes(term);
        const matchesSpec = l.primarySpecialty.toLowerCase().includes(term);
        const matchesCity = l.city.toLowerCase().includes(term);
        const matchesSkills = l.skills.some(s => s.toLowerCase().includes(term));
        if (!matchesName && !matchesSpec && !matchesCity && !matchesSkills) return false;
      }

      // Specialty filter
      if (selectedSpecialty !== 'ALL' && !l.specialties.some(s => s.toLowerCase().includes(selectedSpecialty.toLowerCase()))) {
        return false;
      }

      // State filter
      if (selectedState !== 'ALL' && l.state !== selectedState) {
        return false;
      }

      // Verified OAB filter
      if (verifiedOnly && !l.verifiedOab) {
        return false;
      }

      // Min Rating
      if (l.rating < minRating) {
        return false;
      }

      // Max Hourly Rate
      if (l.hourlyRate && l.hourlyRate > maxHourlyRate) {
        return false;
      }

      // Modality
      if (modalityFilter !== 'ALL' && l.serviceModalities && !l.serviceModalities.includes(modalityFilter as any)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'RATING') return b.rating - a.rating;
      if (sortBy === 'CASES') return b.completedCasesCount - a.completedCasesCount;
      if (sortBy === 'PRICE_LOW') return (a.hourlyRate || 0) - (b.hourlyRate || 0);
      if (sortBy === 'PRICE_HIGH') return (b.hourlyRate || 0) - (a.hourlyRate || 0);
      return 0;
    });
  }, [lawyers, searchTerm, selectedSpecialty, selectedState, verifiedOnly, minRating, maxHourlyRate, modalityFilter, sortBy]);

  return (
    <div className="space-y-6 pb-12 text-foreground animate-in fade-in duration-200">
      
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 rounded-3xl text-white border border-border-alt/60 shadow-lg relative overflow-hidden">
        <div className="max-w-2xl space-y-2 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Rede de Advogados Verificados OAB • Plataforma LWork Legal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Encontre o Advogado Perfeito para sua Demanda
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
            Conecte-se com pareceristas e especialistas jurídicos em todo o Brasil. Analise históricos de cases, avaliações, honorários e convide diretamente para seus processos.
          </p>
        </div>

        {/* Global Search Bar inside Banner */}
        <div className="mt-6 relative max-w-2xl z-10">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/90" />
          <input
            type="text"
            placeholder="Busque por nome do advogado, especialidade (ex: LGPD, Trabalhista, M&A) ou cidade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-card/10 backdrop-blur-md border border-white/20 rounded-2xl text-xs sm:text-sm text-white placeholder:text-muted-foreground/90 focus:bg-card focus:text-foreground focus:placeholder:text-muted-foreground/90 focus:outline-none transition-all shadow-inner"
          />
        </div>
      </div>

      {/* Control Bar: Filters Toggle & Sort Options */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border/80 shadow-xs">
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="lg:hidden px-3.5 py-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filtros ({filteredLawyers.length})</span>
          </button>
          
          <p className="text-xs text-muted-foreground/90 font-medium hidden sm:block">
            Exibindo <strong className="text-foreground font-bold">{filteredLawyers.length}</strong> advogados qualificados
          </p>
        </div>

        <div className="flex items-center gap-3 justify-between sm:justify-end">
          
          <div className="flex items-center gap-2 text-xs">
            <span className="text-muted-foreground/90 font-medium">Ordenar por:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-background border border-border rounded-xl px-3 py-1.5 text-xs text-foreground/90 font-semibold focus:bg-card focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="RATING">Melhor Avaliação ★</option>
              <option value="CASES">Mais Casos Concluídos</option>
              <option value="PRICE_LOW">Menor Valor/Hora</option>
              <option value="PRICE_HIGH">Maior Valor/Hora</option>
            </select>
          </div>

          <div className="flex items-center bg-muted p-1 rounded-xl border border-border">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground/90 hover:text-foreground/90'
              }`}
              title="Visualização em Grade"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground/90 hover:text-foreground/90'
              }`}
              title="Visualização em Lista"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Layout Grid: Left Sidebar Filters + Right Lawyer Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Filter Sidebar */}
        <div className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} space-y-6 bg-card p-5 rounded-3xl border border-border/80 shadow-xs h-fit`}>
          
          <div className="flex items-center justify-between pb-3 border-b border-border/50">
            <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              Filtros Avançados
            </h3>
            <button
              onClick={() => {
                setSelectedSpecialty('ALL');
                setSelectedState('ALL');
                setVerifiedOnly(false);
                setMinRating(0);
                setMaxHourlyRate(1000);
                setModalityFilter('ALL');
              }}
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
            >
              Limpar Tudo
            </button>
          </div>

          {/* Specialty Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-foreground/90">Especialidade Jurídica</label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="ALL">Todas as Especialidades</option>
              <option value="Empresarial">Direito Empresarial & Societário</option>
              <option value="Compliance">Compliance & LGPD</option>
              <option value="Trabalhista">Direito Trabalhista Patronal</option>
              <option value="Tributário">Direito Tributário & Fiscal</option>
              <option value="Intelectual">Propriedade Intelectual & INPI</option>
              <option value="Cível">Direito Cível & Imobiliário</option>
            </select>
          </div>

          {/* State / Region Filter */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-foreground/90">Estado (UF)</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 cursor-pointer"
            >
              <option value="ALL">Todos os Estados</option>
              <option value="SP">São Paulo (SP)</option>
              <option value="RJ">Rio de Janeiro (RJ)</option>
              <option value="MG">Minas Gerais (MG)</option>
              <option value="RS">Rio Grande do Sul (RS)</option>
              <option value="PR">Paraná (PR)</option>
            </select>
          </div>

          {/* OAB Verified Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-foreground/90 cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedOnly}
                onChange={(e) => setVerifiedOnly(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-border-strong"
              />
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Apenas OAB Verificada
              </span>
            </label>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <label className="block text-xs font-bold text-foreground/90">Avaliação Mínima</label>
            <div className="flex gap-1.5">
              {[0, 4.0, 4.5, 4.8].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setMinRating(rate)}
                  className={`flex-1 py-1.5 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                    minRating === rate
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-background text-muted-foreground border-border hover:bg-muted'
                  }`}
                >
                  {rate === 0 ? 'Todas' : `${rate}★+`}
                </button>
              ))}
            </div>
          </div>

          {/* Max Hourly Rate Slider */}
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex justify-between items-center text-xs font-bold text-foreground/90">
              <span>Valor Máximo / Hora:</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-mono">R$ {maxHourlyRate}</span>
            </div>
            <input
              type="range"
              min="150"
              max="1000"
              step="50"
              value={maxHourlyRate}
              onChange={(e) => setMaxHourlyRate(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

        </div>

        {/* Right Lawyers Grid / List Results */}
        <div className="lg:col-span-3 space-y-4">
          
          {filteredLawyers.length === 0 ? (
            <div className="bg-card rounded-3xl border border-border p-12 text-center space-y-3">
              <UserCheck className="w-12 h-12 text-muted-foreground mx-auto" />
              <h3 className="text-base font-bold text-foreground">Nenhum advogado encontrado com estes filtros</h3>
              <p className="text-xs text-muted-foreground/90 max-w-sm mx-auto">
                Tente ajustar o termo de busca ou redefinir os filtros avançados de localização e valor para ver mais profissionais.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedSpecialty('ALL');
                  setSelectedState('ALL');
                  setVerifiedOnly(false);
                  setMinRating(0);
                  setMaxHourlyRate(1000);
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-700 font-bold text-xs hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                Limpar Filtros de Busca
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}>
              {filteredLawyers.map((lawyer) => (
                <div
                  key={lawyer.id}
                  className="bg-card rounded-3xl border border-border/80 p-5 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4 group"
                >
                  
                  {/* Card Header */}
                  <div className="space-y-3">
                    
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={lawyer.avatarUrl}
                            alt={lawyer.name}
                            className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/20 group-hover:scale-105 transition-transform"
                          />
                          <span
                            className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                              lawyer.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/50'
                            }`}
                          />
                        </div>

                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                              onClick={() => openLawyerProfile(lawyer.slug)}
                              className="font-extrabold text-sm text-foreground hover:text-emerald-600 transition-colors text-left cursor-pointer"
                            >
                              {lawyer.name}
                            </button>
                            {lawyer.verifiedOab && (
                              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" title={`OAB/${lawyer.oabState} Verificada`} />
                            )}
                          </div>
                          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{lawyer.primarySpecialty}</p>
                          <p className="text-[11px] text-muted-foreground/90 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3 text-muted-foreground/90" />
                            {lawyer.city}, {lawyer.state}
                          </p>
                        </div>
                      </div>

                      {/* Hourly Rate Badge */}
                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                          R$ {lawyer.hourlyRate}/h
                        </span>
                        <p className="text-[10px] text-muted-foreground/90">Honorários est.</p>
                      </div>
                    </div>

                    {/* Stats Pill Row */}
                    <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-background border border-border/50 text-center text-[11px]">
                      <div>
                        <div className="flex items-center justify-center gap-0.5 font-extrabold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                          <span>{lawyer.rating}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground/90 font-medium">({lawyer.reviewCount} avaliações)</span>
                      </div>

                      <div>
                        <p className="font-extrabold text-foreground font-mono">{lawyer.completedCasesCount}</p>
                        <span className="text-[10px] text-muted-foreground/90 font-medium">Casos Concluídos</span>
                      </div>

                      <div>
                        <p className="font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{lawyer.successRate}%</p>
                        <span className="text-[10px] text-muted-foreground/90 font-medium">Taxa Sucesso</span>
                      </div>
                    </div>

                    {/* Skills Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {lawyer.skills?.slice(0, 3).map((sk, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-muted text-muted-foreground text-[10px] font-semibold">
                          {sk}
                        </span>
                      ))}
                    </div>

                  </div>

                  {/* Card Actions Footer */}
                  <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openLawyerProfile(lawyer.slug)}
                      className="px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground text-xs font-bold transition-colors cursor-pointer"
                    >
                      Ver Perfil
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (!user) {
                            setActiveTab('login');
                          } else {
                            openNegotiationChat('prop_201');
                          }
                        }}
                        className="px-3 py-2 rounded-xl bg-card border border-border hover:bg-background text-foreground/90 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        Chat
                      </button>

                      <button
                        onClick={() => {
                          if (!user) {
                            setActiveTab('login');
                          } else {
                            openInviteModal(lawyer.id);
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Briefcase className="w-3.5 h-3.5" />
                        Convidar
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
