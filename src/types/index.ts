export type Role = 'LAWYER' | 'CLIENT' | 'ADMIN';

export type VerificationStatus = 'DRAFT' | 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED' | 'EXPIRED';

export type JobStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';

export type JobType = 'LITIGATION' | 'CONSULTING' | 'CONTRACT_REVIEW' | 'DUE_DILIGENCE' | 'COMPLIANCE' | 'INTELLECTUAL_PROPERTY';

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type ConfidentialityLevel = 'STANDARD' | 'CONFIDENTIAL' | 'STRICTLY_CONFIDENTIAL';

export type VisibilityLevel = 'PRIVATE' | 'INVITE_ONLY' | 'DISCOVERY_SANITIZED';

export type SensitivityLevel = 'STANDARD' | 'CONFIDENTIAL' | 'STRICTLY_CONFIDENTIAL';

export type ModerationStatus = 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED' | 'FLAGGED';

export interface JobDiscoveryDto {
  id: string | number;
  title: string;
  specialty: string;
  urgency: UrgencyLevel;
  budgetMin: number;
  budgetMax: number;
  city: string;
  state: string;
  createdAt: string;
  visibility: VisibilityLevel;
  status: JobStatus;
  moderationStatus?: ModerationStatus;
  proposalsCount: number;
  hiringType?: 'FIXED' | 'HOURLY' | 'Fixo' | 'Hora';
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // page index (0-based)
  first: boolean;
  last: boolean;
}

export interface NegotiationMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  senderRole: Role;
  contentMasked: string;
  sentAt: string;
  isModerated: boolean;
}

export interface NegotiationThread {
  id: string;
  proposalId: string;
  createdAt: string;
  closedAt?: string;
  retentionDays: number;
  messages: NegotiationMessage[];
}

export type ProposalStatus = 'PENDING' | 'UNDER_REVIEW' | 'ACCEPTED' | 'REJECTED' | 'REVISED';

export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'PENDING_SIGNATURE' | 'COMPLETED' | 'DISPUTED' | 'TERMINATED';

export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID';

export type PaymentStatus = 'IN_ESCROW' | 'RELEASED' | 'REFUNDED' | 'PROCESSING' | 'FAILED';

export type NotificationType = 'PROPOSAL_RECEIVED' | 'PROPOSAL_ACCEPTED' | 'MILESTONE_COMPLETED' | 'PAYMENT_RECEIVED' | 'CHAT_MESSAGE' | 'DOCUMENT_UPLOADED' | 'HEARING_REMINDER';

export interface LawyerSpecialtyDetail {
  id: string;
  name: string;
  yearsExperience: number;
  masteryLevel: 'Iniciante' | 'Intermediário' | 'Avançado' | 'Especialista';
}

export interface LawyerSkillDetail {
  id: string;
  name: string;
  endorsementsCount: number;
}

export interface Education {
  id: string;
  university: string;
  course: string;
  degree: 'Bacharelado' | 'Especialização' | 'Pós-graduação' | 'Mestrado' | 'Doutorado' | 'LL.M.';
  year: string;
}

export interface Certificate {
  id: string;
  name: string;
  institution: string;
  year: string;
  fileUrl?: string;
  fileType?: 'PDF' | 'PNG' | 'JPG';
  linkUrl?: string;
}

export interface Language {
  id: string;
  language: string;
  level: 'Básico' | 'Intermediário' | 'Avançado' | 'Fluente' | 'Nativo';
}

export interface WorkExperience {
  id: string;
  company: string;
  role: string;
  period: string;
  description: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: 'Parecer Técnico' | 'Contrato' | 'Artigo' | 'Peça Processual' | 'Caso de Sucesso' | 'Publicação';
  description: string;
  date: string;
  fileUrl?: string;
  linkUrl?: string;
}

export interface CompletedProjectItem {
  id: string;
  title: string;
  category: string;
  clientName: string;
  clientAvatar?: string;
  value: number;
  deadlineDays: number;
  completionDate: string;
  rating: number;
  reviewComment: string;
  status: 'COMPLETED';
}

export interface LawyerReviewItem {
  id: string;
  reviewerName: string;
  reviewerAvatar: string;
  reviewerCompany: string;
  rating: number;
  comment: string;
  projectTitle: string;
  date: string;
}

export interface FullLawyerProfile extends UserProfile {
  slug: string;
  primarySpecialty: string;
  country: string;
  availability: 'Disponível Imadiatamente' | 'Disponível em 24h' | 'Ocupado / Consultar';
  avgResponseTime: string;
  isOnline: boolean;
  totalClients: number;
  successRate: number; // e.g. 98.5
  onTimeDeliveryPercentage: number; // e.g. 99
  avgDeliveryDays: number;
  avgContractValue: number;
  
  specialtyDetails: LawyerSpecialtyDetail[];
  skillDetails: LawyerSkillDetail[];
  education: Education[];
  certificates: Certificate[];
  languages: Language[];
  workExperience: WorkExperience[];
  portfolio: PortfolioItem[];
  completedProjectsHistory: CompletedProjectItem[];
  reviewsList: LawyerReviewItem[];
  
  stats: {
    totalContractsCount: number;
    totalEarned: number;
    activeProjectsCount: number;
    avgResponseMinutes: number;
    proposalTimeAvgHours: number;
    recurringClientPercentage: number;
  };

  serviceModalities: ('Atendimento Remoto' | 'Atendimento Presencial' | 'Híbrido')[];
  socialLinks?: {
    linkedin?: string;
    website?: string;
    instagram?: string;
  };
}

export interface SubscriptionLimits {
  weeklyProposalsLimit: number;
  monthlyProposalsLimit: number;
  concurrentProposalsLimit: number;
  monthlyInvitesLimit: number;
  profileHighlight: boolean;
  prioritySearch: boolean;
  premiumBadge: boolean;
  advancedReports: boolean;
  conversionStats: boolean;
  certificatesEnabled: boolean;
  maxPortfolioItems: number;
  maxAttachmentSizeMb: number;
}

export interface SubscriptionUsage {
  weeklyProposalsUsed: number;
  monthlyProposalsUsed: number;
  concurrentProposalsUsed: number;
  monthlyInvitesUsed: number;
  lastBillingDate: string;
  nextBillingDate: string;
  cardLast4?: string;
  cardBrand?: string;
  autoRenew: boolean;
}

export interface LawyerBankInfo {
  pixKeyType: 'CPF' | 'CNPJ' | 'EMAIL' | 'TELEFONE' | 'ALEATORIA';
  pixKey: string;
  bankName: string;
  accountType: 'CORRENTE' | 'POUPANCA';
  agency: string;
  accountNumber: string;
}

export interface LawyerWallet {
  availableBalance: number; // Saldo disponível para resgate em PIX
  escrowBalance: number;    // Saldo em custódia (contratos em andamento)
  internalBalance: number;  // Saldo interno para assinaturas e serviços da plataforma
  totalEarned: number;      // Faturamento total acumulado
  bankInfo?: LawyerBankInfo;
}

export interface ClientWallet {
  walletBalance: number;    // Saldo disponível na conta do cliente
  escrowBalance: number;    // Saldo retido em Escrow para projetos
  totalInvested: number;   // Total pago em demandas jurídicas
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl: string;
  phone: string;
  cpfCnpj: string;
  subscriptionPlan?: 'Basic' | 'Pro' | 'Premium';
  subscriptionLimits?: SubscriptionLimits;
  subscriptionUsage?: SubscriptionUsage;
  oabNumber?: string; // e.g., "OAB/SP 412.980"
  oabState?: string;
  bio?: string;
  specialties: string[];
  skills: string[];
  hourlyRate?: number;
  fixedRateEstimate?: number;
  rating: number; // e.g., 4.9
  reviewCount: number;
  completedCasesCount: number;
  verifiedOab: boolean;
  verificationStatus?: VerificationStatus;
  oabExpiryDate?: string;
  jurisdictionStates?: string[];
  mfaEnabled?: boolean;
  city: string;
  state: string;
  joinedDate: string;
  companyName?: string;
  lawyerWallet?: LawyerWallet;
  clientWallet?: ClientWallet;
}

export type User = UserProfile;

export interface Specialty {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface Skill {
  id: string;
  name: string;
}

export interface Party {
  name: string;
  role: 'AUTOR' | 'RÉU' | 'TERCEIRO' | 'ADVOGADO_ADVERSO' | 'JUIZ';
  document?: string;
  lawyer?: string;
}

export interface Hearing {
  id: string;
  title: string;
  date: string;
  time: string;
  courtLocation: string;
  judgeName?: string;
  status: 'AGENDADA' | 'REALIZADA' | 'CANCELADA';
  type: 'CONCILIAÇÃO' | 'INSTRUÇÃO_E_JULGAMENTO' | 'ACOMPANHAMENTO' | 'PERÍCIA';
}

export interface TimelineEvent {
  id: string;
  title: string;
  date: string;
  author: string;
  description: string;
  type: 'PETICAO' | 'DESPACHO' | 'AUDIENCIA' | 'DOCUMENTO' | 'ANDAMENTO_PROCESSUAL';
  attachmentName?: string;
}

export interface Job {
  id: string;
  processNumber?: string; // e.g. 5024192-45.2023.8.21.0001
  title: string;
  description: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  clientVerified?: boolean;
  clientRating?: number;
  clientHistoryCount?: number;
  hiringType?: 'FIXED' | 'HOURLY' | 'Fixo' | 'Hora'; // Chosen by Client
  assignedLawyerId?: string;
  assignedLawyerName?: string;
  assignedLawyerAvatar?: string;
  type: JobType;
  specialty: string;
  status: JobStatus;
  urgency: UrgencyLevel;
  confidentiality: ConfidentialityLevel;
  visibility?: VisibilityLevel;
  sensitivity?: SensitivityLevel;
  moderationStatus?: ModerationStatus;
  budgetMin: number;
  budgetMax: number;
  estimatedDeadlineDays: number;
  createdAt: string;
  updatedAt: string;
  city: string;
  state: string;
  country?: string;
  language?: string;
  courtBranch?: string;
  proposalsCount: number;
  parties?: Party[];
  upcomingHearings?: Hearing[];
  timeline?: TimelineEvent[];
}

export interface Proposal {
  id: string;
  jobId: string;
  jobTitle: string;
  processNumber?: string;
  lawyerId: string;
  lawyerName: string;
  lawyerAvatar: string;
  lawyerOab: string;
  lawyerRating: number;
  hiringType?: 'FIXED' | 'HOURLY' | 'Fixo' | 'Hora'; // Inherited from Job
  hourlyRate?: number; // Present if HOURLY
  estimatedHours?: number; // Present if HOURLY
  value: number; // Total proposal amount in BRL
  deliveryDays: number;
  coverLetter: string;
  status: ProposalStatus;
  proposalVersion?: number;
  negotiationThreadId?: string;
  createdAt: string;
  proposedMilestones: {
    title: string;
    description: string;
    value: number;
  }[];
}

export interface Milestone {
  id: string;
  contractId: string;
  title: string;
  description: string;
  value: number;
  dueDate: string;
  status: MilestoneStatus;
  submittedAt?: string;
  approvedAt?: string;
}

export type ConflictStatus = 'NOT_STARTED' | 'IN_REVIEW' | 'CLEAR' | 'CONSENT_REQUIRED' | 'CONSENTED' | 'BLOCKED';

export interface ConflictCheck {
  id: string | number;
  jobId: string | number;
  lawyerId: string | number;
  lawyerName?: string;
  status: ConflictStatus;
  reasonMasked?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface ContractSignature {
  id: string | number;
  contractId: string | number;
  userId: string | number;
  userName?: string;
  signatureType: string;
  termsVersion: string;
  ipAddress?: string;
  userAgent?: string;
  hashReceipt: string;
  signedAt: string;
}

export type DocumentClassification = 'PUBLIC' | 'CONFIDENTIAL' | 'RESTRICTED';

export type VirusScanStatus = 'CLEAN' | 'PENDING' | 'INFECTED';

export interface SecureDocument {
  id: string | number;
  contractId?: string | number;
  jobId?: string | number;
  ownerId: string | number;
  ownerName?: string;
  fileName: string;
  fileSize: number;
  contentType: string;
  storagePath?: string;
  sha256Hash: string;
  classification: DocumentClassification;
  virusScanStatus: VirusScanStatus;
  version: number;
  createdAt: string;
  expiresAt?: string;
}

export interface DocumentAccessLog {
  id: string | number;
  documentId: string | number;
  userId?: string | number;
  userName?: string;
  action: 'UPLOAD' | 'DOWNLOAD' | 'VIEW_METADATA' | 'DELETE' | string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
}

export type ContractTimelineEventType =
  | 'JOB_CREATED'
  | 'PROPOSAL_SUBMITTED'
  | 'PROPOSAL_ACCEPTED'
  | 'CONFLICT_CHECK'
  | 'CONFLICT_CLEARED'
  | 'TERMS_SIGNED'
  | 'CONTRACT_SIGNED'
  | 'FUNDING_LOCKED'
  | 'DOCUMENT_ATTACHED'
  | 'MILESTONE_CREATED'
  | 'MILESTONE_SUBMITTED'
  | 'MILESTONE_APPROVED'
  | 'MILESTONE_COMPLETED'
  | 'PAYMENT_RELEASED'
  | 'CONTRACT_COMPLETED'
  | 'CONTRACT_TERMINATED'
  | string;

export interface ContractTimelineEvent {
  id: string;
  contractId?: string | number;
  eventType: ContractTimelineEventType;
  title: string;
  description: string;
  timestamp: string;
  actorName?: string;
  actorRole?: string;
  status?: string;
  hashReceipt?: string;
  termsVersion?: string;
  documentId?: string | number;
  milestoneId?: string | number;
  metadata?: Record<string, any>;
}

export interface ContractTimelineDto {
  contractId: string | number;
  contractTitle?: string;
  events: ContractTimelineEvent[];
}

export interface AcceptContractRequestDto {
  proposalId: number | string;
  termsVersion?: string;
  notes?: string;
}

export interface Contract {
  id: string;
  jobId: string;
  jobTitle: string;
  processNumber?: string;
  proposalId: string;
  clientId: string;
  clientName: string;
  lawyerId: string;
  lawyerName: string;
  lawyerPhotoUrl?: string;
  lawyerOab: string;
  totalValue: number;
  escrowBalance: number;
  releasedBalance: number;
  status: ContractStatus;
  startDate: string;
  endDateEst: string;
  milestones: Milestone[];
  termsPdfUrl?: string;
  progressPercentage: number;
  // Phase 3 extensions
  conflictStatus?: ConflictStatus | string;
  termsVersion?: string;
  signedAt?: string;
  hashReceipt?: string;
  signatures?: ContractSignature[];
  documents?: SecureDocument[];
  timelineEvents?: ContractTimelineEvent[];
}

export type PaymentType =
  | 'PROJECT_ESCROW'
  | 'MILESTONE_RELEASE'
  | 'INTERNAL_DEPOSIT'
  | 'CLIENT_DEPOSIT'
  | 'WITHDRAWAL'
  | 'SUBSCRIPTION_PAYMENT'
  | 'REFUND';

export interface Payment {
  id: string;
  contractId: string;
  jobTitle: string;
  processNumber?: string;
  payerName: string;
  receiverName: string;
  amount: number;
  feeAmount: number;
  netAmount: number;
  type?: PaymentType;
  payerRole?: Role;
  receiverRole?: Role;
  status: PaymentStatus;
  paymentMethod: 'PIX' | 'CARTAO_CREDITO' | 'BOLETO' | 'TRANSFERENCIA' | 'SALDO_INTERNO';
  createdAt: string;
  releasedAt?: string;
  invoiceNumber?: string;
}

export type ChatState = 'NEGOCIACAO' | 'EXECUCAO' | 'READ_ONLY' | 'MEDIACAO';

export interface Review {
  id: string;
  contractId: string;
  jobTitle?: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  reviewerRole: Role;
  revieweeId: string;
  rating: number; // 1-5
  detailedRatings?: {
    // If reviewer is CLIENT (evaluating LAWYER)
    technicalQuality?: number;
    communication?: number;
    deadlineCompliance?: number;
    professionalism?: number;
    // If reviewer is LAWYER (evaluating CLIENT)
    clarity?: number;
    responsiveness?: number;
    organization?: number;
    easeOfWork?: number;
  };
  comment: string;
  createdAt: string;
  status: 'PENDING_OTHER' | 'PUBLISHED';
}

export interface ChatAttachment {
  id: string;
  name: string;
  size: string;
  type: 'PDF' | 'DOCX' | 'XLSX' | 'PNG' | 'JPG';
  url: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  wasModerated?: boolean;
  attachments?: ChatAttachment[];
}

export interface ChatConversation {
  id: string;
  jobId?: string;
  jobTitle?: string;
  proposalId?: string;
  proposalValue?: number;
  lawyerName?: string;
  clientName?: string;
  state?: ChatState;
  otherUser: {
    id: string;
    name: string;
    avatar: string;
    role: Role;
    oabOrCompany?: string;
    isOnline: boolean;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export interface AppDocument {
  id: string;
  title: string;
  processNumber?: string;
  category: 'Contratos' | 'Peças Processuais' | 'Procurações' | 'Certidões' | 'Provas & Anexos';
  fileName: string;
  fileSize: string;
  fileType: 'PDF' | 'DOCX' | 'XLSX' | 'ZIP';
  uploadedBy: string;
  uploadDate: string;
  statusTag: 'Assinado' | 'Em revisão' | 'Finalizado' | 'Urgente' | 'Aguardando Assinatura';
  downloadUrl: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  isRead: boolean;
  linkUrl?: string;
}

export interface DashboardMetrics {
  activeCasesCount: number;
  pendingProposalsCount: number;
  monthlyRevenue: number;
  escrowBalanceTotal: number;
  rating: number;
  totalClientsOrLawyers: number;
  weeklyProductivity: { day: string; horas: number; casos: number }[];
  caseDistribution: { label: string; count: number; percentage: number }[];
}
