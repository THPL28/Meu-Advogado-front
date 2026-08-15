import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Job,
  Proposal,
  Contract,
  Payment,
  AppDocument,
  Notification,
  DashboardMetrics,
  FullLawyerProfile,
  UserProfile,
  Role,
  VerificationStatus
} from '../types';
import {
  jobsApi,
  proposalsApi,
  contractsApi,
  paymentsApi,
  documentsApi,
  notificationsApi,
  dashboardApi,
  chatApi,
  lawyersApi,
  authApi,
  getStoredToken
} from '../services/api';

export type ActiveTab = 
  | 'landing'
  | 'login'
  | 'register'
  | 'dashboard'
  | 'cases'
  | 'case-detail'
  | 'proposals'
  | 'contracts'
  | 'payments'
  | 'chat'
  | 'documents'
  | 'settings'
  | 'find-lawyers'
  | 'find-jobs'
  | 'profile'
  | 'client-profile'
  | 'edit-profile'
  | 'subscription';

export type SidebarState = 'expanded' | 'collapsed' | 'hidden';

interface PlatformContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedCaseId: string | null;
  setSelectedCaseId: (id: string | null) => void;
  caseDetailInitialTab: 'OVERVIEW' | 'PROPOSALS' | 'DOCUMENTS' | 'CONTRACT';
  setCaseDetailInitialTab: (tab: 'OVERVIEW' | 'PROPOSALS' | 'DOCUMENTS' | 'CONTRACT') => void;
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  openClientProfile: (clientId: string) => void;
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  verificationStatus?: VerificationStatus;
  isVerifiedLawyer: boolean;

  // Sidebar & Layout State
  sidebarState: SidebarState;
  setSidebarState: (state: SidebarState) => void;
  toggleSidebar: () => void;
  isChatExpanded: boolean;
  setIsChatExpanded: (expanded: boolean | ((prev: boolean) => boolean)) => void;

  // Lawyer Profile & Search
  lawyers: FullLawyerProfile[];
  selectedLawyerSlug: string;
  setSelectedLawyerSlug: (slug: string) => void;
  openLawyerProfile: (lawyerIdOrSlug: string) => void;
  updateLawyerProfile: (updated: Partial<FullLawyerProfile>) => void;

  // Project Invitation Modal
  isInviteModalOpen: boolean;
  selectedLawyerForInvite: FullLawyerProfile | null;
  openInviteModal: (lawyerIdOrSlug: string) => void;
  closeInviteModal: () => void;
  sendProjectInvite: (jobId: string, lawyerId: string, customMessage: string) => Promise<void>;

  // Data State
  jobs: Job[];
  proposals: Proposal[];
  contracts: Contract[];
  payments: Payment[];
  documents: AppDocument[];
  notifications: Notification[];
  metrics: DashboardMetrics | null;
  loading: boolean;
  
  // Search & Global Filter
  globalSearch: string;
  setGlobalSearch: (q: string) => void;

  // Modals
  isNewCaseModalOpen: boolean;
  setIsNewCaseModalOpen: (open: boolean) => void;
  isNewProposalModalOpen: boolean;
  setIsNewProposalModalOpen: (open: boolean) => void;
  isAiAssistantModalOpen: boolean;
  setIsAiAssistantModalOpen: (open: boolean) => void;
  isUploadDocModalOpen: boolean;
  setIsUploadDocModalOpen: (open: boolean) => void;
  isPayoutModalOpen: boolean;
  setIsPayoutModalOpen: (open: boolean) => void;
  isAddBalanceModalOpen: boolean;
  setIsAddBalanceModalOpen: (open: boolean) => void;
  isBankDetailsModalOpen: boolean;
  setIsBankDetailsModalOpen: (open: boolean) => void;

  // Review & Upgrade Modals
  isReviewModalOpen: boolean;
  reviewContractInfo: { contractId: string; jobTitle: string; otherPartyName: string; otherPartyRole: Role } | null;
  openReviewModal: (info: { contractId: string; jobTitle: string; otherPartyName: string; otherPartyRole: Role }) => void;
  closeReviewModal: () => void;

  isUpgradeModalOpen: boolean;
  upgradeReason: string;
  openUpgradeModal: (reason?: string) => void;
  closeUpgradeModal: () => void;

  // Actions
  refreshData: () => Promise<void>;
  navigateToCaseDetail: (caseId: string, initialTab?: 'OVERVIEW' | 'PROPOSALS' | 'DOCUMENTS' | 'CONTRACT') => void;
  openNegotiationChat: (proposalId: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  reopenJob: (jobId: string) => Promise<void>;
  withdrawProposal: (proposalId: string) => Promise<void>;
  depositClientBalance: (amount: number, method: 'PIX' | 'CARTAO_CREDITO' | 'BOLETO') => Promise<void>;
  depositLawyerInternalBalance: (amount: number, method: 'PIX' | 'CARTAO_CREDITO' | 'BOLETO') => Promise<void>;
  saveLawyerBankInfo: (bankInfo: any) => Promise<void>;
  paySubscriptionWithBalance: (planName: 'Pro' | 'Premium', price: number) => Promise<void>;
  releaseMilestone: (contractId: string, milestoneId: string) => Promise<void>;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

const mapUserProfileToFullLawyer = (user: UserProfile): FullLawyerProfile => {
  const slug = (user as any).slug || (user.name ? user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '') || `lawyer-${user.id}`;
  return {
    ...user,
    slug,
    primarySpecialty: (user as any).primarySpecialty || (user.specialties && user.specialties.length > 0 ? user.specialties[0] : 'Direito Geral'),
    country: (user as any).country || 'Brasil',
    availability: (user as any).availability || 'Disponível Imadiatamente',
    avgResponseTime: (user as any).avgResponseTime || '< 30 minutos',
    isOnline: (user as any).isOnline ?? true,
    totalClients: (user as any).totalClients ?? user.completedCasesCount ?? 0,
    successRate: (user as any).successRate ?? 98.0,
    onTimeDeliveryPercentage: (user as any).onTimeDeliveryPercentage ?? 100,
    avgDeliveryDays: (user as any).avgDeliveryDays ?? 5,
    avgContractValue: (user as any).avgContractValue ?? 5000,
    specialtyDetails: (user as any).specialtyDetails || [],
    skillDetails: (user as any).skillDetails || [],
    education: (user as any).education || [],
    certificates: (user as any).certificates || [],
    languages: (user as any).languages || [{ id: 'lang_1', language: 'Português', level: 'Nativo' }],
    workExperience: (user as any).workExperience || [],
    portfolio: (user as any).portfolio || [],
    completedProjectsHistory: (user as any).completedProjectsHistory || [],
    reviewsList: (user as any).reviewsList || [],
    stats: (user as any).stats || {
      totalContractsCount: user.completedCasesCount ?? 0,
      totalEarned: user.lawyerWallet?.totalEarned ?? 0,
      activeProjectsCount: 0,
      avgResponseMinutes: 20,
      proposalTimeAvgHours: 2.0,
      recurringClientPercentage: 70
    },
    serviceModalities: (user as any).serviceModalities || ['Atendimento Remoto', 'Atendimento Presencial', 'Híbrido'],
    socialLinks: (user as any).socialLinks || {}
  };
};

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [caseDetailInitialTab, setCaseDetailInitialTab] = useState<'OVERVIEW' | 'PROPOSALS' | 'DOCUMENTS' | 'CONTRACT'>('OVERVIEW');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  
  // Sidebar & Layout State
  const [sidebarState, setSidebarState] = useState<SidebarState>('expanded');
  const [isChatExpanded, setIsChatExpanded] = useState<boolean>(false);

  // Lawyers state
  const [lawyers, setLawyers] = useState<FullLawyerProfile[]>([]);
  const [selectedLawyerSlug, setSelectedLawyerSlug] = useState<string>('');

  // Invite modal
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedLawyerForInvite, setSelectedLawyerForInvite] = useState<FullLawyerProfile | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [documents, setDocuments] = useState<AppDocument[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Modals state
  const [isNewCaseModalOpen, setIsNewCaseModalOpen] = useState(false);
  const [isNewProposalModalOpen, setIsNewProposalModalOpen] = useState(false);
  const [isAiAssistantModalOpen, setIsAiAssistantModalOpen] = useState(false);
  const [isUploadDocModalOpen, setIsUploadDocModalOpen] = useState(false);
  const [isPayoutModalOpen, setIsPayoutModalOpen] = useState(false);
  const [isAddBalanceModalOpen, setIsAddBalanceModalOpen] = useState(false);
  const [isBankDetailsModalOpen, setIsBankDetailsModalOpen] = useState(false);

  // Review & Upgrade Modals
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewContractInfo, setReviewContractInfo] = useState<{ contractId: string; jobTitle: string; otherPartyName: string; otherPartyRole: Role } | null>(null);

  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');

  const depositClientBalance = async (amount: number, method: 'PIX' | 'CARTAO_CREDITO' | 'BOLETO') => {
    await paymentsApi.depositClientBalance(amount, method);
    await refreshData();
  };

  const depositLawyerInternalBalance = async (amount: number, method: 'PIX' | 'CARTAO_CREDITO' | 'BOLETO') => {
    await paymentsApi.depositLawyerInternalBalance(amount, method);
    await refreshData();
  };

  const saveLawyerBankInfo = async (bankInfo: any) => {
    await paymentsApi.saveLawyerBankInfo(bankInfo);
    await refreshData();
  };

  const paySubscriptionWithBalance = async (planName: 'Pro' | 'Premium', price: number) => {
    await paymentsApi.paySubscriptionWithInternalBalance(planName, price);
    await refreshData();
  };

  const releaseMilestone = async (contractId: string, milestoneId: string) => {
    await contractsApi.releaseMilestone(contractId, milestoneId);
    await refreshData();
  };

  const openReviewModal = (info: { contractId: string; jobTitle: string; otherPartyName: string; otherPartyRole: Role }) => {
    setReviewContractInfo(info);
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setIsReviewModalOpen(false);
    setReviewContractInfo(null);
  };

  const openUpgradeModal = (reason?: string) => {
    setUpgradeReason(reason || 'Atingiu o limite de consumo do plano.');
    setIsUpgradeModalOpen(true);
  };

  const closeUpgradeModal = () => {
    setIsUpgradeModalOpen(false);
    setUpgradeReason('');
  };

  const reopenJob = async (jobId: string) => {
    await jobsApi.reopenJob(jobId);
    await refreshData();
  };

  const withdrawProposal = async (proposalId: string) => {
    await proposalsApi.withdrawProposal(proposalId);
    await refreshData();
  };

  const toggleSidebar = () => {
    setSidebarState(prev => prev === 'expanded' ? 'collapsed' : 'expanded');
  };

  const openLawyerProfile = (lawyerIdOrSlug: string) => {
    const found = lawyers.find(l => l.id === lawyerIdOrSlug || l.slug === lawyerIdOrSlug || l.name.toLowerCase().includes(lawyerIdOrSlug.toLowerCase()));
    if (found) {
      setSelectedLawyerSlug(found.slug);
    } else {
      setSelectedLawyerSlug(lawyerIdOrSlug);
    }
    setActiveTab('profile');
  };

  const openClientProfile = (clientId: string) => {
    setSelectedClientId(clientId);
    setActiveTab('client-profile');
  };

  const updateLawyerProfile = (updatedData: Partial<FullLawyerProfile>) => {
    setLawyers(prev => prev.map(l => l.slug === selectedLawyerSlug || l.id === updatedData.id ? { ...l, ...updatedData } : l));
  };

  const openInviteModal = (lawyerIdOrSlug: string) => {
    const found = lawyers.find(l => l.id === lawyerIdOrSlug || l.slug === lawyerIdOrSlug) || null;
    setSelectedLawyerForInvite(found);
    setIsInviteModalOpen(true);
  };

  const closeInviteModal = () => {
    setIsInviteModalOpen(false);
    setSelectedLawyerForInvite(null);
  };

  const sendProjectInvite = async (jobId: string, lawyerId: string, customMessage: string) => {
    const newNotif: Notification = {
      id: `notif_${Date.now()}`,
      title: 'Convite para Projeto Recebido!',
      message: `Você foi convidado para apresentar proposta na demanda #${jobId}. Mensagem: "${customMessage}"`,
      type: 'PROPOSAL_RECEIVED',
      timestamp: 'Agora mesmo',
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  const refreshData = async () => {
    try {
      const realLawyers = await lawyersApi.getLawyers().catch(() => []);
      const mappedLawyers = realLawyers.map(mapUserProfileToFullLawyer);
      setLawyers(mappedLawyers);

      const user = await authApi.getCurrentUser().catch(() => null);
      setCurrentUser(user);

      const token = getStoredToken();
      const hasActiveSession = user !== null || Boolean(token);
      if (hasActiveSession) {
        // Clients fetch only THEIR jobs (data isolation). Lawyers get all open jobs for discovery.
        const isLawyer = user?.role === 'LAWYER';
        const [j, p, c, pay, d, n, m] = await Promise.all([
          (isLawyer ? jobsApi.getJobs() : jobsApi.getMyJobs()).catch(() => []),
          proposalsApi.getProposals().catch(() => []),
          contractsApi.getContracts().catch(() => []),
          paymentsApi.getPayments().catch(() => []),
          documentsApi.getDocuments().catch(() => []),
          notificationsApi.getNotifications().catch(() => []),
          dashboardApi.getMetrics().catch(() => null),
        ]);
        setJobs(j);
        setProposals(p);
        setContracts(c);
        setPayments(pay);
        setDocuments(d);
        setNotifications(n);
        setMetrics(m);
      } else {
        const j = await jobsApi.getJobs().catch(() => []);
        setJobs(j);
        setProposals([]);
        setContracts([]);
        setPayments([]);
        setDocuments([]);
        setNotifications([]);
        setMetrics(null);
      }
    } catch (err) {
      console.warn('Failed to load platform data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const navigateToCaseDetail = (caseId: string, initialTab: 'OVERVIEW' | 'PROPOSALS' | 'DOCUMENTS' | 'CONTRACT' = 'OVERVIEW') => {
    setSelectedCaseId(caseId);
    setCaseDetailInitialTab(initialTab);
    setActiveTab('case-detail');
  };

  const openNegotiationChat = async (proposalId: string) => {
    try {
      const conv = await chatApi.getOrCreateNegotiationChat(proposalId);
      setActiveConversationId(conv.id);
      setActiveTab('chat');
    } catch (err) {
      console.error('Failed to open negotiation chat:', err);
    }
  };

  const markNotificationRead = async (id: string) => {
    await notificationsApi.markAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const verificationStatus = currentUser?.verificationStatus;
  const isVerifiedLawyer = currentUser?.role === 'LAWYER' && currentUser?.verificationStatus === 'VERIFIED';

  return (
    <PlatformContext.Provider value={{
      activeTab,
      setActiveTab,
      selectedCaseId,
      setSelectedCaseId,
      caseDetailInitialTab,
      setCaseDetailInitialTab,
      selectedClientId,
      setSelectedClientId,
      openClientProfile,
      activeConversationId,
      setActiveConversationId,
      verificationStatus,
      isVerifiedLawyer,
      sidebarState,
      setSidebarState,
      toggleSidebar,
      isChatExpanded,
      setIsChatExpanded,
      lawyers,
      selectedLawyerSlug,
      setSelectedLawyerSlug,
      openLawyerProfile,
      updateLawyerProfile,
      isInviteModalOpen,
      selectedLawyerForInvite,
      openInviteModal,
      closeInviteModal,
      sendProjectInvite,
      jobs,
      proposals,
      contracts,
      payments,
      documents,
      notifications,
      metrics,
      loading,
      globalSearch,
      setGlobalSearch,
      isNewCaseModalOpen,
      setIsNewCaseModalOpen,
      isNewProposalModalOpen,
      setIsNewProposalModalOpen,
      isAiAssistantModalOpen,
      setIsAiAssistantModalOpen,
      isUploadDocModalOpen,
      setIsUploadDocModalOpen,
      isPayoutModalOpen,
      setIsPayoutModalOpen,
      isAddBalanceModalOpen,
      setIsAddBalanceModalOpen,
      isBankDetailsModalOpen,
      setIsBankDetailsModalOpen,
      isReviewModalOpen,
      reviewContractInfo,
      openReviewModal,
      closeReviewModal,
      isUpgradeModalOpen,
      upgradeReason,
      openUpgradeModal,
      closeUpgradeModal,
      refreshData,
      navigateToCaseDetail,
      openNegotiationChat,
      markNotificationRead,
      reopenJob,
      withdrawProposal,
      depositClientBalance,
      depositLawyerInternalBalance,
      saveLawyerBankInfo,
      paySubscriptionWithBalance,
      releaseMilestone
    }}>
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) throw new Error('usePlatform must be used within PlatformProvider');
  return context;
};
