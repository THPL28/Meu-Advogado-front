import React, { useState } from 'react';
import {
  ShieldCheck,
  Star,
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  Award,
  BookOpen,
  Briefcase,
  FileText,
  MessageSquare,
  Share2,
  Copy,
  Heart,
  Send,
  Download,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Globe,
  Check,
  Building2,
  Sparkles,
  Edit
} from 'lucide-react';
import { useLegalPlatform } from '../../hooks/useLegalPlatform';
import { FullLawyerProfile } from '../../types';

interface LawyerPublicProfileProps {
  profileSlug?: string;
}

export const LawyerPublicProfile: React.FC<LawyerPublicProfileProps> = ({ profileSlug }) => {
  const {
    lawyers,
    selectedLawyerSlug,
    user,
    role,
    openInviteModal,
    setActiveTab,
    openNegotiationChat,
    setIsNewProposalModalOpen
  } = useLegalPlatform();

  const activeSlug = profileSlug || selectedLawyerSlug;
  const lawyer = lawyers.find(l => l.slug === activeSlug || l.id === activeSlug);

  const [copiedLink, setCopiedLink] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeSection, setActiveSection] = useState<'bio' | 'specialties' | 'portfolio' | 'projects' | 'reviews' | 'experience'>('bio');

  if (!lawyer) {
    return (
      <div className="max-w-md mx-auto p-12 text-center bg-card border border-border rounded-3xl shadow-xs space-y-4 my-12 animate-in fade-in duration-200">
        <h3 className="text-lg font-bold text-foreground">Advogado não encontrado.</h3>
        <p className="text-xs text-muted-foreground/90">
          O perfil do advogado solicitado não está disponível ou foi desativado.
        </p>
        <button
          onClick={() => setActiveTab('find-lawyers')}
          className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          Explorar Advogados
        </button>
      </div>
    );
  }

  const isOwnProfile = user?.id === lawyer.id || user?.email === lawyer.email;

  const handleCopyLink = () => {
    const url = `${window.location.origin}/advogado/${lawyer.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 text-foreground max-w-7xl mx-auto">
      
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-4 sm:p-6 rounded-3xl border border-border/80 shadow-xs">
        <div className="flex items-center gap-2 text-xs text-muted-foreground/90 font-medium">
          <button onClick={() => setActiveTab('find-lawyers')} className="hover:text-emerald-600 transition-colors cursor-pointer">
            Advogados
          </button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-bold">{lawyer.name}</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsFavorite(!isFavorite)}
            className={`px-3 py-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isFavorite
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'bg-background border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
            <span>{isFavorite ? 'Salvo nos Favoritos' : 'Favoritar'}</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="px-3 py-2 rounded-xl bg-background border border-border hover:bg-muted text-muted-foreground text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-muted-foreground/90" />}
            <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
          </button>

          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('edit-profile')}
              className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              Editar Meu Perfil
            </button>
          )}
        </div>
      </div>

      {/* Main Profile Header Card (Workana Inspired) */}
      <div className="bg-card rounded-3xl border border-border/80 p-6 sm:p-8 shadow-xs relative overflow-hidden space-y-6">
        
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          
          {/* Avatar & Main Info */}
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className="relative shrink-0">
              <img
                src={lawyer.avatarUrl}
                alt={lawyer.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-md"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${
                  lawyer.isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/50'
                }`}
                title={lawyer.isOnline ? 'Online na plataforma' : 'Offline'}
              />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">{lawyer.name}</h1>
                {lawyer.verifiedOab && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    OAB/{lawyer.oabState} {lawyer.oabNumber} Verificado
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[11px] font-semibold border border-border">
                  {lawyer.availability}
                </span>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400">{lawyer.primarySpecialty}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground/90 font-medium">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground/90" />
                  <span>{lawyer.city}, {lawyer.state} • {lawyer.country}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground/90" />
                  <span>Resp. média: <strong className="text-foreground/90">{lawyer.avgResponseTime}</strong></span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground/90" />
                  <span>Membro desde <strong className="text-foreground/90">{lawyer.joinedDate}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs Box */}
          <div className="w-full lg:w-auto bg-background/80 p-5 rounded-2xl border border-border/80 space-y-3 shrink-0">
            <div className="flex items-center justify-between lg:justify-end gap-3 text-xs">
              <span className="text-muted-foreground/90 font-medium">Honorários Estimados:</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                R$ {lawyer.hourlyRate}/h <span className="text-muted-foreground/90 font-normal text-xs">ou fixo</span>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-2">
              <button
                onClick={() => {
                  if (!user) setActiveTab('login');
                  else openInviteModal(lawyer.id);
                }}
                className="w-full px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Briefcase className="w-4 h-4" />
                Convidar para uma Demanda
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    if (!user) setActiveTab('login');
                    else openInviteModal(lawyer.id);
                  }}
                  className="px-3 py-2 rounded-xl bg-card border border-border hover:bg-muted text-foreground/90 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  Mensagem
                </button>
                <button
                  onClick={() => { 
                    if (!user) setActiveTab('login');
                    else if (role === 'CLIENT') setIsNewProposalModalOpen(true); 
                    else openInviteModal(lawyer.id); 
                  }}
                  className="px-3 py-2 rounded-xl bg-alt hover:bg-alt/90 text-alt-foreground text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  Contratar
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Rating & Performance Metrics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-6 border-t border-border/50 text-center">
          
          <div className="p-3 rounded-2xl bg-background border border-border/60">
            <div className="flex items-center justify-center gap-1 text-amber-500 font-extrabold text-base">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>{lawyer.rating}</span>
            </div>
            <p className="text-[11px] text-muted-foreground/90 font-medium mt-0.5">{lawyer.reviewCount} Avaliações</p>
          </div>

          <div className="p-3 rounded-2xl bg-background border border-border/60">
            <p className="text-base font-extrabold text-foreground font-mono">{lawyer.completedCasesCount}</p>
            <p className="text-[11px] text-muted-foreground/90 font-medium mt-0.5">Casos Concluídos</p>
          </div>

          <div className="p-3 rounded-2xl bg-background border border-border/60">
            <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">{lawyer.successRate}%</p>
            <p className="text-[11px] text-muted-foreground/90 font-medium mt-0.5">Taxa de Sucesso</p>
          </div>

          <div className="p-3 rounded-2xl bg-background border border-border/60">
            <p className="text-base font-extrabold text-foreground font-mono">{lawyer.onTimeDeliveryPercentage}%</p>
            <p className="text-[11px] text-muted-foreground/90 font-medium mt-0.5">Entregas no Prazo</p>
          </div>

          <div className="p-3 rounded-2xl bg-background border border-border/60">
            <p className="text-base font-extrabold text-foreground font-mono">~{lawyer.avgDeliveryDays} dias</p>
            <p className="text-[11px] text-muted-foreground/90 font-medium mt-0.5">Prazo Médio Entrega</p>
          </div>

          <div className="p-3 rounded-2xl bg-background border border-border/60">
            <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">R$ {lawyer.avgContractValue.toLocaleString()}</p>
            <p className="text-[11px] text-muted-foreground/90 font-medium mt-0.5">Valor Médio Contrato</p>
          </div>

        </div>

      </div>

      {/* Navigation Tabs Bar for Sections */}
      <div className="flex items-center gap-2 border-b border-border overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveSection('bio')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'bio'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-muted-foreground/90 hover:text-foreground hover:bg-muted'
          }`}
        >
          Apresentação & Biografia
        </button>
        <button
          onClick={() => setActiveSection('specialties')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'specialties'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-muted-foreground/90 hover:text-foreground hover:bg-muted'
          }`}
        >
          Especializações & Competências
        </button>
        <button
          onClick={() => setActiveSection('portfolio')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'portfolio'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-muted-foreground/90 hover:text-foreground hover:bg-muted'
          }`}
        >
          Portfólio & Publicações
        </button>
        <button
          onClick={() => setActiveSection('projects')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'projects'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-muted-foreground/90 hover:text-foreground hover:bg-muted'
          }`}
        >
          Histórico de Projetos ({lawyer.completedProjectsHistory?.length || 0})
        </button>
        <button
          onClick={() => setActiveSection('reviews')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
            activeSection === 'reviews'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-muted-foreground/90 hover:text-foreground hover:bg-muted'
          }`}
        >
          Avaliações de Clientes ({lawyer.reviewCount})
        </button>
      </div>

      {/* Main Grid Layout: Left Content & Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Biography Section */}
          {(activeSection === 'bio' || activeSection === 'specialties') && (
            <div className="bg-card rounded-3xl border border-border/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                Apresentação Profissional & Trajetória
              </h3>
              <div className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line bg-background/60 p-4 rounded-2xl border border-border/60 font-sans">
                {lawyer.bio}
              </div>
            </div>
          )}

          {/* Specialties & Mastery Details */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Especializações Jurídicas & Nível de Domínio
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {lawyer.specialtyDetails?.map((sd) => (
                <div key={sd.id} className="p-3.5 rounded-2xl bg-background border border-border/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-foreground">{sd.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px]">
                      {sd.masteryLevel}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground/90 font-medium">{sd.yearsExperience} anos de atuação contínua</p>
                </div>
              ))}
            </div>
          </div>

          {/* Competencies / Skills (LinkedIn Style with Endorsements) */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Competências & Habilidades Táticas
            </h3>
            <div className="flex flex-wrap gap-2">
              {lawyer.skillDetails?.map((sk) => (
                <div
                  key={sk.id}
                  className="px-3.5 py-2 rounded-xl bg-background border border-border hover:border-emerald-500/50 transition-all flex items-center gap-2 text-xs font-semibold text-foreground/90"
                >
                  <span>{sk.name}</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold">
                    +{sk.endorsementsCount}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Work Experience Timeline */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              Experiência Profissional
            </h3>
            <div className="space-y-4 relative before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-muted/80">
              {lawyer.workExperience?.map((exp) => (
                <div key={exp.id} className="pl-8 relative space-y-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 absolute left-2 top-1.5 ring-4 ring-emerald-100" />
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-foreground">{exp.role}</h4>
                    <span className="text-[11px] font-mono font-medium text-muted-foreground/90">{exp.period}</span>
                  </div>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{exp.company}</p>
                  <p className="text-xs text-muted-foreground/90 leading-relaxed">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio & Case Studies */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-emerald-600" />
              Portfólio & Casos Públicos Autorizados
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {lawyer.portfolio?.map((port) => (
                <div key={port.id} className="p-4 rounded-2xl bg-background border border-border space-y-2 hover:border-emerald-500/50 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                      {port.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground/90 font-mono">{port.date}</span>
                  </div>
                  <h4 className="font-bold text-xs text-foreground leading-snug">{port.title}</h4>
                  <p className="text-xs text-muted-foreground/90 line-clamp-3 leading-relaxed">{port.description}</p>
                  <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Visualizar Documento / Resumo</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Completed Projects History */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Histórico de Projetos Concluídos
            </h3>
            <div className="space-y-3">
              {lawyer.completedProjectsHistory?.map((proj) => (
                <div key={proj.id} className="p-4 rounded-2xl bg-background border border-border/80 space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs text-foreground">{proj.title}</h4>
                      <p className="text-[11px] text-muted-foreground/90 font-medium">
                        Cliente: <strong className="text-muted-foreground">{proj.clientName}</strong> • {proj.category}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">R$ {proj.value.toLocaleString()}</span>
                      <p className="text-[10px] text-muted-foreground/90">Concluído em {proj.completionDate}</p>
                    </div>
                  </div>
                  <div className="p-3 bg-card rounded-xl border border-border/50 text-xs text-muted-foreground/90 space-y-1">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{proj.rating}.0</span>
                    </div>
                    <p className="italic text-[11px]">"{proj.reviewComment}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Client Reviews Section */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              Avaliações de Clientes Verificados ({lawyer.reviewsList?.length || 0})
            </h3>
            <div className="space-y-4 divide-y divide-border/50">
              {lawyer.reviewsList?.map((rev) => (
                <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={rev.reviewerAvatar}
                        alt={rev.reviewerName}
                        className="w-9 h-9 rounded-xl object-cover ring-1 ring-border/50"
                      />
                      <div>
                        <h4 className="font-bold text-xs text-foreground">{rev.reviewerName}</h4>
                        <p className="text-[11px] text-muted-foreground/90">{rev.reviewerCompany}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{rev.rating}.0</span>
                      <span className="text-muted-foreground/90 font-normal ml-1 text-[11px]">{rev.date}</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed bg-background p-3 rounded-xl border border-border/50">
                    "{rev.comment}"
                  </p>
                  <p className="text-[10px] text-muted-foreground/90 font-medium">Projeto: {rev.projectTitle}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Sidebar Column (1 col) */}
        <div className="space-y-6">
          
          {/* Education & Qualifications Box */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              Formação Acadêmica & Títulos
            </h3>
            <div className="space-y-3">
              {lawyer.education?.map((edu) => (
                <div key={edu.id} className="p-3.5 rounded-2xl bg-background border border-border/80 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      {edu.degree}
                    </span>
                    <span className="text-[10px] text-muted-foreground/90 font-mono">{edu.year}</span>
                  </div>
                  <p className="font-bold text-xs text-foreground mt-1">{edu.course}</p>
                  <p className="text-[11px] text-muted-foreground/90">{edu.university}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Certificates */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              Certificados Verificados
            </h3>
            <div className="space-y-2.5">
              {lawyer.certificates?.map((cert) => (
                <div key={cert.id} className="p-3 rounded-xl bg-background border border-border flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-foreground text-xs">{cert.name}</p>
                    <p className="text-[10px] text-muted-foreground/90">{cert.institution} ({cert.year})</p>
                  </div>
                  <Download className="w-4 h-4 text-muted-foreground/90 hover:text-emerald-600 cursor-pointer" />
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              Idiomas
            </h3>
            <div className="space-y-2">
              {lawyer.languages?.map((lang) => (
                <div key={lang.id} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-background border border-border/50">
                  <span className="font-bold text-foreground">{lang.language}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {lang.level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Full Platform Performance Stats Panel */}
          <div className="bg-card rounded-3xl border border-border/80 p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Estatísticas no LWork
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground/90">Contratos na Plataforma:</span>
                <span className="font-mono font-bold text-foreground">{lawyer.stats?.totalContractsCount}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground/90">Total Faturado em Custódia:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">R$ {lawyer.stats?.totalEarned.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground/90">Projetos Ativos Hoje:</span>
                <span className="font-mono font-bold text-foreground">{lawyer.stats?.activeProjectsCount}</span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-border/50">
                <span className="text-muted-foreground/90">Tempo Médio Resposta:</span>
                <span className="font-mono font-bold text-foreground">{lawyer.stats?.avgResponseMinutes} minutos</span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-muted-foreground/90">Clientes Recorrentes:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{lawyer.stats?.recurringClientPercentage}%</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
