import {
  UserProfile,
  Job,
  Proposal,
  Contract,
  Payment,
  ChatMessage,
  ChatConversation,
  AppDocument,
  Notification,
  DashboardMetrics,
  Specialty
} from '../../types';

export const INITIAL_LAWYER_USER: UserProfile = {
  id: '',
  name: '',
  email: '',
  role: 'LAWYER',
  avatarUrl: '',
  phone: '',
  cpfCnpj: '',
  specialties: [],
  skills: [],
  rating: 5.0,
  reviewCount: 0,
  completedCasesCount: 0,
  verifiedOab: false,
  city: '',
  state: '',
  joinedDate: ''
};

export const INITIAL_CLIENT_USER: UserProfile = {
  id: '',
  name: '',
  email: '',
  role: 'CLIENT',
  avatarUrl: '',
  phone: '',
  cpfCnpj: '',
  specialties: [],
  skills: [],
  rating: 5.0,
  reviewCount: 0,
  completedCasesCount: 0,
  verifiedOab: false,
  city: '',
  state: '',
  joinedDate: ''
};

export const SPECIALTIES_LIST: Specialty[] = [
  { id: 'sp_1', name: 'Direito Empresarial', category: 'Corporativo', description: 'Societário, M&A, governança corporativa e reestruturação' },
  { id: 'sp_2', name: 'Compliance & LGPD', category: 'Tecnologia', description: 'Adequação à LGPD, políticas de privacidade e proteção de dados' },
  { id: 'sp_3', name: 'Direito Trabalhista', category: 'Relações de Trabalho', description: 'Contencioso trabalhista, acordos coletivos e prevenção de riscos' },
  { id: 'sp_4', name: 'Direito Tributário', category: 'Fiscal', description: 'Planejamento fiscal, recuperação de créditos e contencioso administrativo' },
  { id: 'sp_5', name: 'Propriedade Intelectual', category: 'Marcas & Patentes', description: 'Registro no INPI, segredos de negócio e contratos de licença' },
  { id: 'sp_6', name: 'Direito Cível & Imobiliário', category: 'Imobiliário', description: 'Contratos imobiliários, incorporações, locação e usucapião' },
];

export const INITIAL_JOBS: Job[] = [];

export const INITIAL_PROPOSALS: Proposal[] = [];

export const INITIAL_CONTRACTS: Contract[] = [];

export const INITIAL_PAYMENTS: Payment[] = [];

export const INITIAL_CHAT_CONVERSATIONS: ChatConversation[] = [];

export const INITIAL_CHAT_MESSAGES: Record<string, ChatMessage[]> = {};

export const INITIAL_DOCUMENTS: AppDocument[] = [];

export const INITIAL_NOTIFICATIONS: Notification[] = [];

export const MOCK_DASHBOARD_METRICS: DashboardMetrics = {
  activeCasesCount: 0,
  pendingProposalsCount: 0,
  monthlyRevenue: 0,
  escrowBalanceTotal: 0,
  rating: 0,
  totalClientsOrLawyers: 0,
  weeklyProductivity: [],
  caseDistribution: []
};
