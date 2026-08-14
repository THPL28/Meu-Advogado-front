import React from 'react';
import {
  Building2,
  MapPin,
  Calendar,
  Star,
  ShieldCheck,
  CheckCircle2,
  Briefcase,
  DollarSign,
  ArrowLeft,
  MessageSquare,
  FileCheck2,
  Award,
  Globe,
  ExternalLink
} from 'lucide-react';
import { useLegalPlatform } from '../../hooks/useLegalPlatform';

export const ClientPublicProfile: React.FC = () => {
  const {
    selectedClientId,
    jobs,
    contracts,
    setActiveTab,
    navigateToCaseDetail,
    role,
    user
  } = useLegalPlatform();

  // Find jobs created by this client
  const clientJobs = jobs.filter(j => (selectedClientId ? j.clientId === selectedClientId : role === 'CLIENT' || j.clientId === user?.id));
  const sampleJob = clientJobs[0];
  const clientName = sampleJob?.clientName || (role === 'CLIENT' && user?.name ? user.name : 'Cliente');
  const clientAvatar = sampleJob?.clientAvatar || (role === 'CLIENT' ? user?.avatarUrl : undefined);

  const completedCount = clientJobs.filter(j => j.status === 'COMPLETED').length;
  const inProgressCount = clientJobs.filter(j => j.status === 'IN_PROGRESS').length;
  const totalPostedCount = clientJobs.length;

  // Real reviews given by client to lawyers
  const clientReviews: any[] = [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      
      {/* Back Button */}
      <button
        onClick={() => setActiveTab(role === 'LAWYER' ? 'find-jobs' : 'find-lawyers')}
        className="px-4 py-2 bg-card border border-border/80 hover:bg-background text-muted-foreground font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para {role === 'LAWYER' ? 'Demandas' : 'Início'}
      </button>

      {/* Profile Header Banner */}
      <div className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-xs">
        
        {/* Cover Graphic */}
        <div className="h-36 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 relative p-6">
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Cliente Verificado LWork
            </span>
          </div>
        </div>

        {/* Profile Details Container */}
        <div className="px-6 sm:px-8 pb-8 pt-0 relative flex flex-col sm:flex-row items-start justify-between gap-6">
          
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {clientAvatar ? (
              <img
                src={clientAvatar}
                alt={clientName}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-white shadow-md bg-card shrink-0 -mt-12 sm:-mt-14 z-10"
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 flex items-center justify-center font-bold text-2xl ring-4 ring-white shadow-md bg-card shrink-0 -mt-12 sm:-mt-14 z-10">
                {clientName ? clientName.slice(0, 2).toUpperCase() : 'CL'}
              </div>
            )}

            <div className="space-y-1.5 pt-2 sm:pt-4">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">{clientName}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-bold border border-border">
                  Pessoa Jurídica (CNPJ Verificado)
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-muted-foreground/90 pt-0.5">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground/90" /> {user?.city && user?.state ? `${user.city}, ${user.state}` : 'Localização não informada'}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-muted-foreground/90" /> Integrante desde {user?.joinedDate || '2024'}
                </span>
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {user?.rating ?? 5.0} ({completedCount} contratos)
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Key Client Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-border/50 divide-x divide-border/50 bg-background/50">
          <div className="p-4 sm:p-5 text-center">
            <span className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider block">Demandas Publicadas</span>
            <p className="text-xl font-extrabold text-foreground mt-0.5">{totalPostedCount}</p>
          </div>
          <div className="p-4 sm:p-5 text-center">
            <span className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider block">Taxa de Contratação</span>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">100%</p>
          </div>
          <div className="p-4 sm:p-5 text-center">
            <span className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider block">Contratos Concluídos</span>
            <p className="text-xl font-extrabold text-foreground mt-0.5">{completedCount}</p>
          </div>
          <div className="p-4 sm:p-5 text-center">
            <span className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-wider block">Pagamentos em Custódia</span>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">Pontualidade 100%</p>
          </div>
        </div>

      </div>

      {/* Main Grid: Info + Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Client Bio & Verification Status */}
        <div className="space-y-6">
          
          <div className="p-6 bg-card border border-border/80 rounded-3xl space-y-4 shadow-xs">
            <h3 className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">Sobre a Empresa</h3>
            <p className="text-xs text-muted-foreground/90 leading-relaxed">
              {user?.bio || 'Empresa verificada na plataforma LWork para contratação e gestão de demandas jurídicas.'}
            </p>

            <div className="pt-3 border-t border-border/50 space-y-2 text-xs">
              <div className="flex justify-between text-muted-foreground/90">
                <span className="text-muted-foreground/90 font-semibold">Setor:</span>
                <span className="font-bold text-foreground/90">{user?.companyName ? 'Corporativo' : 'Não informado'}</span>
              </div>
              <div className="flex justify-between text-muted-foreground/90">
                <span className="text-muted-foreground/90 font-semibold">Porte:</span>
                <span className="font-bold text-foreground/90">Verificado</span>
              </div>
              <div className="flex justify-between text-muted-foreground/90">
                <span className="text-muted-foreground/90 font-semibold">Verificações:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> CNPJ & Pagamento OK
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 bg-alt text-alt-foreground rounded-3xl space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Award className="w-4 h-4" /> Cliente Diamante
            </div>
            <p className="text-xs text-alt-foreground/80 leading-relaxed">
              Este cliente possui histórico exemplar de depósitos em custódia no prazo e excelente comunicação com advogados contratados.
            </p>
          </div>

        </div>

        {/* Right Column: Past Reviews Given to Lawyers & Active Demands */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active / Public Demands by this client */}
          <div className="p-6 sm:p-8 bg-card border border-border/80 rounded-3xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                Demandas Publicadas pelo Cliente ({clientJobs.length})
              </h3>
            </div>

            {clientJobs.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground/90 font-medium bg-background/50 rounded-2xl border border-border/80">
                Este cliente ainda não possui demandas públicas cadastradas.
              </div>
            ) : (
              <div className="space-y-3">
                {clientJobs.map(job => (
                  <div
                    key={job.id}
                    onClick={() => navigateToCaseDetail(job.id)}
                    className="p-4 bg-background hover:bg-emerald-50/50 border border-border/80 hover:border-emerald-300 rounded-2xl transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-card text-emerald-600 dark:text-emerald-400 border border-emerald-200">
                        {job.specialty}
                      </span>
                      <h4 className="text-sm font-bold text-foreground group-hover:text-emerald-600 dark:text-emerald-400 transition-colors">
                        {job.title}
                      </h4>
                      <p className="text-xs text-muted-foreground/90 font-mono">
                        Orçamento: R$ {job.budgetMin.toLocaleString('pt-BR')} - R$ {job.budgetMax.toLocaleString('pt-BR')}
                      </p>
                    </div>

                    <span className="px-3 py-1 bg-card border border-border text-muted-foreground text-xs font-bold rounded-xl shrink-0 group-hover:bg-emerald-600 group-hover:text-white group-hover:border-emerald-600 transition-all">
                      Ver Detalhes
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Reviews Given by Client to Lawyers */}
          <div className="p-6 sm:p-8 bg-card border border-border/80 rounded-3xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                Avaliações Concedidas a Advogados em Casos Anteriores
              </h3>
            </div>

            {clientReviews.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground/90 font-medium bg-background/50 rounded-2xl border border-border/80">
                Nenhuma avaliação registrada ainda.
              </div>
            ) : (
              <div className="space-y-4">
                {clientReviews.map(rev => (
                  <div key={rev.id} className="p-5 bg-background/80 border border-border/80 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.lawyerAvatar}
                          alt={rev.lawyerName}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-border/50"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-foreground">{rev.lawyerName}</h4>
                          <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">{rev.lawyerOab}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-400" /> {rev.rating}
                        </div>
                        <span className="text-[10px] text-muted-foreground/90 font-mono">{rev.date}</span>
                      </div>
                    </div>

                    <div className="p-3 bg-card rounded-xl border border-border/60 text-xs text-muted-foreground leading-relaxed italic">
                      "{rev.comment}"
                    </div>

                    <p className="text-[11px] font-semibold text-muted-foreground/90">
                      Projeto Concluído: <span className="text-foreground/90">{rev.projectTitle}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
