import React from 'react';
import {
  LayoutDashboard,
  Briefcase,
  FileCheck2,
  FileText,
  CreditCard,
  MessageSquare,
  FolderOpen,
  Sparkles,
  Settings,
  ShieldCheck,
  Star,
  Plus,
  Users,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  User,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useLegalPlatform } from '../../hooks/useLegalPlatform';
import { ActiveTab } from '../../context/PlatformContext';
import { UserAvatar } from '../ui/UserAvatar';

const getVerificationBadgeConfig = (status?: string) => {
  switch (status) {
    case 'VERIFIED':
      return {
        label: 'OAB Verificada',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
        icon: ShieldCheck,
      };
    case 'PENDING':
      return {
        label: 'OAB Em Análise',
        className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
        icon: AlertCircle,
      };
    case 'REJECTED':
      return {
        label: 'Cadastro Rejeitado',
        className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
        icon: XCircle,
      };
    case 'SUSPENDED':
      return {
        label: 'OAB Suspensa',
        className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
        icon: XCircle,
      };
    case 'EXPIRED':
      return {
        label: 'OAB Expirada',
        className: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
        icon: AlertCircle,
      };
    case 'DRAFT':
    default:
      return {
        label: 'Cadastro Incompleto',
        className: 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700',
        icon: AlertCircle,
      };
  }
};

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    user,
    role,
    verificationStatus,
    jobs,
    proposals,
    notifications,
    selectedCaseId,
    contracts,
    setIsNewCaseModalOpen,
    setIsAiAssistantModalOpen,
    sidebarState,
    toggleSidebar
  } = useLegalPlatform();

  const vBadge = getVerificationBadgeConfig(user?.verificationStatus || verificationStatus);
  const BadgeIcon = vBadge.icon;

  if (sidebarState === 'hidden') return null;

  const isCollapsed = sidebarState === 'collapsed';

  const activeJobsCount = jobs.filter(j => j.status === 'IN_PROGRESS' || j.status === 'OPEN').length;
  const pendingProposalsCount = proposals.filter(p => p.status === 'PENDING' || p.status === 'UNDER_REVIEW').length;
  const unreadMessagesCount = notifications.filter(n => n.type === 'CHAT_MESSAGE' && !n.isRead).length;

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; roles: ('LAWYER' | 'CLIENT')[] }[] = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard, roles: ['LAWYER', 'CLIENT'] },
    { id: 'find-lawyers', label: 'Encontrar Advogados', icon: Users, roles: ['CLIENT'] },
    { id: 'find-jobs', label: 'Encontrar Demandas', icon: Users, roles: ['LAWYER'] },
    { id: 'cases', label: role === 'LAWYER' ? 'Meus Casos' : 'Minhas Demandas', icon: Briefcase, badge: activeJobsCount, roles: ['LAWYER', 'CLIENT'] },
    { id: 'proposals', label: 'Propostas Enviadas', icon: FileCheck2, badge: pendingProposalsCount, roles: ['LAWYER'] },
    { id: 'contracts', label: 'Contratos & Escrow', icon: FileText, roles: ['CLIENT'] },
    { id: 'payments', label: role === 'LAWYER' ? 'Financeiro' : 'Pagamentos', icon: CreditCard, roles: ['LAWYER', 'CLIENT'] },
    { id: 'chat', label: 'Mensagens', icon: MessageSquare, badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined, roles: ['LAWYER', 'CLIENT'] },
    { id: 'documents', label: 'Arquivos & Documentos', icon: FolderOpen, roles: ['LAWYER', 'CLIENT'] },
    { id: 'subscription', label: 'Assinatura', icon: Star, roles: ['LAWYER'] },
    { id: 'edit-profile', label: role === 'LAWYER' ? 'Perfil Profissional' : 'Meu Perfil', icon: User, roles: ['LAWYER', 'CLIENT'] },
    { id: 'settings', label: 'Configurações', icon: Settings, roles: ['LAWYER', 'CLIENT'] }
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <aside
      className={`bg-card text-muted-foreground border-r border-border/80 flex flex-col justify-between hidden md:flex shrink-0 h-[calc(100dvh-4rem)] select-none shadow-[1px_0_2px_rgba(0,0,0,0.02)] transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? 'w-20' : 'w-64 xl:w-72'
      }`}
    >
      
      {/* Navigation Section */}
      <div className="p-3 sm:p-4 space-y-4 flex-1 overflow-y-auto overflow-x-hidden">
        
        {/* Toggle Collapse Button Header */}
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} pb-2 border-b border-border/50`}>
          {!isCollapsed && (
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/90">
              Navegação LWork
            </span>
          )}
          <button
            onClick={toggleSidebar}
            title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
            className="p-1.5 rounded-xl hover:bg-muted text-muted-foreground/90 hover:text-foreground transition-colors cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Quick Action Button */}
        {role === 'CLIENT' ? (
          <button
            onClick={() => setIsNewCaseModalOpen(true)}
            title="Cadastrar Nova Demanda"
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-xs transition-all duration-150 active:scale-[0.98] cursor-pointer ${
              isCollapsed ? 'px-0' : ''
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5] shrink-0" />
            {!isCollapsed && <span>Nova Demanda</span>}
          </button>
        ) : (
          <button
            onClick={() => setIsAiAssistantModalOpen(true)}
            title="Análise com IA Jurídica"
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 font-semibold text-xs transition-all duration-150 cursor-pointer ${
              isCollapsed ? 'px-0' : ''
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            {!isCollapsed && <span>IA Jurídica</span>}
          </button>
        )}

        {/* Navigation Links */}
        <nav className="space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;

            const selectedJob = jobs.find(j => j.id === selectedCaseId);
            const myProposalForJob = (user && selectedCaseId) ? proposals.find(p => p.jobId === selectedCaseId && p.lawyerId === user.id) : null;
            const isAssumedOrContractedJob = selectedJob && (
              role === 'CLIENT' || 
              (selectedJob.assignedLawyerId && user && selectedJob.assignedLawyerId === user.id) ||
              contracts.some(c => c.jobId === selectedJob.id)
            );

            let isActive = activeTab === item.id;
            if (activeTab === 'case-detail') {
              if (isAssumedOrContractedJob) {
                isActive = item.id === 'cases';
              } else if (myProposalForJob) {
                isActive = item.id === 'proposals';
              } else {
                isActive = item.id === 'find-jobs';
              }
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} px-3 py-2.5 rounded-xl text-xs transition-all duration-150 cursor-pointer relative group ${
                  isActive
                    ? 'bg-emerald-50/80 text-emerald-900 font-bold border-l-4 border-emerald-600 pl-2.5'
                    : 'text-muted-foreground/90 hover:text-foreground hover:bg-muted/80 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600' : 'text-muted-foreground/90'}`} />
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                      isActive
                        ? 'bg-emerald-600 text-white'
                        : 'bg-muted text-emerald-600 dark:text-emerald-400 border border-border'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Badge Indicator in Collapsed Mode */}
                {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-white" />
                )}

                {/* Hover Tooltip when Collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-2 px-2.5 py-1 bg-alt text-alt-foreground text-[11px] font-bold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

      </div>

      {/* Bottom Profile Badge & Security Verification Card */}
      <div className="p-3 border-t border-border/80 bg-background/50 shrink-0">
        <div
          onClick={() => setActiveTab('profile')}
          className="p-2.5 bg-card border border-border/80 rounded-2xl space-y-2 shadow-xs cursor-pointer hover:border-emerald-400 transition-all"
        >
          <div className="flex items-center gap-2.5">
            <img
              src={user?.avatarUrl}
              alt={user?.name}
              className="w-9 h-9 rounded-xl object-cover ring-1 ring-emerald-500/30 shrink-0"
            />
            {!isCollapsed && (
              <div className="overflow-hidden min-w-0 flex-1">
                <p className="text-xs font-bold text-foreground truncate">{user?.name}</p>
                {user?.role === 'LAWYER' ? (
                  <div className="flex items-center gap-1 text-[11px] font-semibold truncate mt-0.5">
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold border ${vBadge.className}`}>
                      <BadgeIcon className="w-3 h-3 shrink-0" />
                      <span className="truncate">{vBadge.label}</span>
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium truncate">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">Cliente Corporativo</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {!isCollapsed && user?.role === 'LAWYER' && (
            <div className="flex items-center justify-between text-[11px] pt-2 border-t border-border/50 text-muted-foreground/90 gap-1">
              <div className="flex items-center gap-1 text-amber-600 font-semibold shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                <span>{user.rating}</span>
                <span className="text-muted-foreground/90 font-normal">({user.reviewCount})</span>
              </div>
              <span className="text-muted-foreground/90 font-mono text-[11px] shrink-0">OAB/{user.oabState} {user.oabNumber}</span>
            </div>
          )}
        </div>
      </div>

    </aside>
  );
};

