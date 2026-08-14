import React, { useState } from 'react';
import {
  Scale,
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  User,
  LogOut,
  ShieldCheck,
  PlusCircle,
  Briefcase,
  Menu,
  X,
  LayoutDashboard,
  FileCheck2,
  FileText,
  CreditCard,
  MessageSquare,
  FolderOpen,
  Settings,
  Plus,
  Users,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { useLegalPlatform } from '../../hooks/useLegalPlatform';
import { ActiveTab } from '../../context/PlatformContext';

interface NavbarProps {
  isMobileMenuOpen?: boolean;
  setIsMobileMenuOpen?: (open: boolean) => void;
}

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

export const Navbar: React.FC<NavbarProps> = ({
  isMobileMenuOpen: externalMobileMenuOpen,
  setIsMobileMenuOpen: externalSetIsMobileMenuOpen
}) => {
  const {
    user,
    role,
    verificationStatus,
    switchRole,
    activeTab,
    setActiveTab,
    notifications,
    markNotificationRead,
    globalSearch,
    setGlobalSearch,
    jobs,
    proposals,
    logout,
    setIsNewCaseModalOpen,
    setIsAiAssistantModalOpen
  } = useLegalPlatform();

  const vBadge = getVerificationBadgeConfig(user?.verificationStatus || verificationStatus);

  const [internalMobileMenuOpen, setInternalMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isMobileMenuOpen = externalMobileMenuOpen !== undefined ? externalMobileMenuOpen : internalMobileMenuOpen;
  const setIsMobileMenuOpen = externalSetIsMobileMenuOpen || setInternalMobileMenuOpen;

  if (!user) {
    const scrollTo = (id: string) => {
      if (activeTab !== 'landing') {
        setActiveTab('landing');
        setTimeout(() => {
          document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }
    };

    return (
      <header className="sticky top-0 z-50 bg-card text-foreground border-b border-border/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
        <div className="w-full max-w-[1700px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-16 flex items-center justify-between gap-3 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-foreground">LWork</span>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollTo('como-funciona')} className="text-sm font-semibold text-muted-foreground/90 hover:text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer">Como Funciona</button>
            <button onClick={() => setActiveTab('find-lawyers')} className="text-sm font-semibold text-muted-foreground/90 hover:text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer">Encontrar Advogados</button>
            <button onClick={() => scrollTo('para-clientes')} className="text-sm font-semibold text-muted-foreground/90 hover:text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer">Para Clientes</button>
            <button onClick={() => scrollTo('para-advogados')} className="text-sm font-semibold text-muted-foreground/90 hover:text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer">Para Advogados</button>
          </nav>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setActiveTab('login')}
              className="px-4 py-2 text-sm font-bold text-muted-foreground hover:text-emerald-600 dark:text-emerald-400 transition-colors cursor-pointer"
            >
              Entrar
            </button>
            <button 
              onClick={() => setActiveTab('register')}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-xs transition-colors cursor-pointer"
            >
              Criar Conta
            </button>
          </div>
        </div>
      </header>
    );
  }

  const unreadNotifs = notifications.filter(n => !n.isRead);

  const activeJobsCount = jobs.filter(j => j.status === 'IN_PROGRESS' || j.status === 'OPEN').length;
  const pendingProposalsCount = proposals.filter(p => p.status === 'PENDING' || p.status === 'UNDER_REVIEW').length;
  const unreadMessagesCount = notifications.filter(n => n.type === 'CHAT_MESSAGE' && !n.isRead).length;

  const navItems: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; roles: ('LAWYER' | 'CLIENT')[] }[] = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard, roles: ['LAWYER', 'CLIENT'] },
    { id: 'find-jobs', label: 'Encontrar Demandas', icon: Search, roles: ['LAWYER'] },
    { id: 'find-lawyers', label: 'Encontrar Advogados', icon: Users, roles: ['CLIENT'] },
    { id: 'cases', label: role === 'LAWYER' ? 'Demandas Recebidas' : 'Minhas Demandas', icon: Briefcase, badge: activeJobsCount, roles: ['LAWYER', 'CLIENT'] },
    { id: 'proposals', label: role === 'LAWYER' ? 'Propostas Enviadas' : 'Propostas Recebidas', icon: FileCheck2, badge: pendingProposalsCount, roles: ['LAWYER', 'CLIENT'] },
    { id: 'contracts', label: 'Contratos & Escrow', icon: FileText, roles: ['LAWYER', 'CLIENT'] },
    { id: 'payments', label: role === 'LAWYER' ? 'Financeiro' : 'Pagamentos', icon: CreditCard, roles: ['LAWYER', 'CLIENT'] },
    { id: 'chat', label: 'Mensagens', icon: MessageSquare, badge: unreadMessagesCount > 0 ? unreadMessagesCount : undefined, roles: ['LAWYER', 'CLIENT'] },
    { id: 'documents', label: 'Arquivos & Documentos', icon: FolderOpen, roles: ['LAWYER', 'CLIENT'] },
    { id: 'settings', label: 'Configurações', icon: Settings, roles: ['LAWYER', 'CLIENT'] }
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

  return (
    <header className="sticky top-0 z-40 bg-card text-foreground border-b border-border/80 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
      <div className="w-full max-w-[1700px] 2xl:max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-10 h-16 flex items-center justify-between gap-3 sm:gap-6">
        
        {/* Left Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground md:hidden transition-colors"
            aria-label="Alternar Menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5 text-emerald-600" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2 sm:gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-foreground">LWork</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Global Search - Only for Client */}
        {role === 'CLIENT' && (
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/90" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Buscar processos, advogados ou documentos..."
                className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-xs text-foreground/90 placeholder:text-muted-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10 transition-all"
              />
            </div>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Dynamic Verification Badge for Lawyers */}
          {role === 'LAWYER' && (
            <button
              onClick={() => setActiveTab('edit-profile')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${vBadge.className}`}
              title="Clique para gerenciar sua verificação cadastral"
            >
              <vBadge.icon className="w-3.5 h-3.5" />
              <span>{vBadge.label}</span>
            </button>
          )}

          {/* Role Switcher Toggle Badge */}
          <div className="hidden lg:flex items-center bg-muted p-1 rounded-xl border border-border">
            <button
              onClick={() => switchRole('LAWYER')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                role === 'LAWYER'
                  ? 'bg-card text-foreground shadow-xs border border-border/80'
                  : 'text-muted-foreground/90 hover:text-foreground'
              }`}
            >
              Advogado
            </button>
            <button
              onClick={() => switchRole('CLIENT')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                role === 'CLIENT'
                  ? 'bg-card text-foreground shadow-xs border border-border/80'
                  : 'text-muted-foreground/90 hover:text-foreground'
              }`}
            >
              Cliente
            </button>
          </div>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground transition-colors relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white font-bold text-[10px] rounded-full flex items-center justify-center shadow-xs">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 sm:w-96 bg-card border border-border rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-border/50">
                  <h4 className="font-bold text-xs text-foreground flex items-center gap-2">
                    <Bell className="w-4 h-4 text-emerald-600" />
                    Notificações
                  </h4>
                  <span className="text-xs text-muted-foreground/90">{notifications.length} recados</span>
                </div>
                <div className="max-h-80 overflow-y-auto divide-y divide-border/50 my-2">
                  {notifications.length === 0 ? (
                    <div className="py-8 px-4 text-center text-xs text-muted-foreground/90 font-medium">
                      Você não possui novas notificações.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`py-3 px-2 rounded-xl cursor-pointer transition-colors ${
                          !n.isRead ? 'bg-emerald-50/50' : 'hover:bg-background'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold text-xs text-foreground">{n.title}</span>
                          <span className="text-[11px] text-muted-foreground/90 whitespace-nowrap">{n.timestamp}</span>
                        </div>
                        <p className="text-xs text-muted-foreground/90 mt-1">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl bg-muted hover:bg-muted/80 transition-all border border-border cursor-pointer"
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.name || 'Avatar'}
                  className="w-8 h-8 rounded-lg object-cover ring-2 ring-emerald-500/30"
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs ring-2 ring-emerald-500/30">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <ChevronDown className="w-4 h-4 text-muted-foreground/90" />
            </button>

            {/* Profile Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-2xl shadow-xl p-3 z-50">
                <div className="p-2 border-b border-border/50 mb-2">
                  <p className="text-xs font-bold text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground/90 truncate">{user?.email}</p>
                  {role === 'LAWYER' ? (
                    <div className="mt-2 flex items-center justify-between gap-1 flex-wrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${vBadge.className}`}>
                        <vBadge.icon className="w-3 h-3" />
                        {vBadge.label}
                      </span>
                      {user?.oabNumber && (
                        <span className="text-[10px] font-mono text-muted-foreground">
                          OAB/{user.oabState} {user.oabNumber}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Cliente Verificado
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  {role === 'LAWYER' ? (
                    <button
                      onClick={() => { setActiveTab('profile'); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      Meu Perfil Público
                    </button>
                  ) : (
                    <button
                      onClick={() => { setActiveTab('edit-profile'); setShowUserMenu(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                    >
                      <User className="w-4 h-4 text-emerald-600" />
                      Meu Perfil
                    </button>
                  )}
                  <button
                    onClick={() => { setActiveTab('find-lawyers'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <Search className="w-4 h-4 text-emerald-600" />
                    Encontrar Advogados
                  </button>
                  <button
                    onClick={() => { setActiveTab('settings'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground/90" />
                    Configurações da Conta
                  </button>
                  <button
                    onClick={() => { setActiveTab('cases'); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <Briefcase className="w-4 h-4 text-muted-foreground/90" />
                    {role === 'LAWYER' ? 'Meus Processos' : 'Minhas Demandas'}
                  </button>
                  <button
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair da Plataforma
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex flex-col bg-card animate-in fade-in duration-200">
          
          {/* Mobile Header */}
          <div className="p-4 border-b border-border flex items-center justify-between bg-background">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-lg text-foreground">LWork</span>
              </div>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-xl bg-muted/80 text-muted-foreground"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* Mobile Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/90" />
              <input
                type="text"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Buscar no LWork..."
                className="w-full bg-muted border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/90 focus:outline-none focus:border-emerald-600"
              />
            </div>

            {/* Mobile Role Switcher */}
            <div className="p-3 bg-background rounded-2xl border border-border space-y-2">
              <p className="text-[11px] uppercase font-bold text-muted-foreground/90">Perfil Ativo na Plataforma</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => switchRole('LAWYER')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    role === 'LAWYER'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-card text-muted-foreground border border-border'
                  }`}
                >
                  Advogado
                </button>
                <button
                  onClick={() => switchRole('CLIENT')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    role === 'CLIENT'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-card text-muted-foreground border border-border'
                  }`}
                >
                  Cliente
                </button>
              </div>
            </div>

            {/* Mobile Navigation Links */}
            <div className="space-y-1">
              <p className="px-2 text-[11px] uppercase font-bold text-muted-foreground/90 mb-2">Menu de Navegação</p>
              {filteredNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id || (item.id === 'cases' && activeTab === 'case-detail');

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-900 font-bold border-l-4 border-emerald-600'
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-emerald-600" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-600 text-white">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* User Profile Footer */}
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center gap-3">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user?.name || 'Avatar'}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-emerald-600"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm ring-2 ring-emerald-600 shrink-0">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground/90">{user?.email}</p>
                  {role === 'LAWYER' && (
                    <div className="mt-1">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${vBadge.className}`}>
                        <vBadge.icon className="w-3 h-3" />
                        {vBadge.label}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  logout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sair da Plataforma
              </button>
            </div>

          </div>

        </div>
      )}

    </header>
  );
};
