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
  id: 'usr_lawyer_1',
  name: 'Dr. Rodrigo Silveira',
  email: 'rodrigo.silveira@adv.oabsp.org.br',
  role: 'LAWYER',
  avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
  phone: '(11) 98765-4321',
  cpfCnpj: '321.654.987-00',
  oabNumber: '412.980',
  oabState: 'SP',
  bio: 'Advogado especialista em Direito Empresarial, Contratos Tecnológicos e Compliance LGPD com mais de 12 anos de atuação contenciosa e consultiva para startups e grandes corporações.',
  specialties: ['Direito Empresarial', 'Compliance LGPD', 'Contratos & M&A', 'Propriedade Intelectual'],
  skills: ['Auditoria LGPD', 'Elaboração de Minutas', 'Contencioso Cível', 'Negociação Estratégica'],
  hourlyRate: 350,
  fixedRateEstimate: 5000,
  rating: 4.9,
  reviewCount: 42,
  completedCasesCount: 87,
  verifiedOab: true,
  city: 'São Paulo',
  state: 'SP',
  joinedDate: 'Maio 2022',
  companyName: 'Silveira & Associados Advocacia',
  lawyerWallet: {
    availableBalance: 14850.00,
    escrowBalance: 32400.00,
    internalBalance: 450.00,
    totalEarned: 47250.00,
    bankInfo: {
      pixKeyType: 'CPF',
      pixKey: '321.654.987-00',
      bankName: 'Banco Itaú Unibanco S.A.',
      accountType: 'CORRENTE',
      agency: '0382',
      accountNumber: '49120-8'
    }
  }
};

export const INITIAL_CLIENT_USER: UserProfile = {
  id: 'usr_client_1',
  name: 'Empresa TechCorp Brasil Ltda',
  email: 'juridico@techcorpbrasil.com.br',
  role: 'CLIENT',
  avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
  phone: '(11) 3344-5566',
  cpfCnpj: '12.345.678/0001-90',
  bio: 'Empresa líder de tecnologia em SaaS B2B buscando assessoria jurídica recorrente e suporte em demandas consultivas e contratuais.',
  specialties: ['Tecnologia', 'SaaS', 'E-commerce'],
  skills: ['Demandas Corporativas', 'Revisão Contratual'],
  rating: 5.0,
  reviewCount: 18,
  completedCasesCount: 24,
  verifiedOab: false,
  city: 'São Paulo',
  state: 'SP',
  joinedDate: 'Janeiro 2023',
  companyName: 'TechCorp Brasil',
  clientWallet: {
    walletBalance: 25000.00,
    escrowBalance: 32400.00,
    totalInvested: 62000.00
  }
};

export const SPECIALTIES_LIST: Specialty[] = [
  { id: 'sp_1', name: 'Direito Empresarial', category: 'Corporativo', description: 'Societário, M&A, governança corporativa e reestruturação' },
  { id: 'sp_2', name: 'Compliance & LGPD', category: 'Tecnologia', description: 'Adequação à LGPD, políticas de privacidade e proteção de dados' },
  { id: 'sp_3', name: 'Direito Trabalhista', category: 'Relações de Trabalho', description: 'Contencioso trabalhista, acordos coletivos e prevenção de riscos' },
  { id: 'sp_4', name: 'Direito Tributário', category: 'Fiscal', description: 'Planejamento fiscal, recuperação de créditos e contencioso administrativo' },
  { id: 'sp_5', name: 'Propriedade Intelectual', category: 'Marcas & Patentes', description: 'Registro no INPI, segredos de negócio e contratos de licença' },
  { id: 'sp_6', name: 'Direito Cível & Imobiliário', category: 'Imobiliário', description: 'Contratos imobiliários, incorporações, locação e usucapião' },
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job_101',
    processNumber: '5024192-45.2023.8.21.0001',
    title: 'Adequação LGPD e Reestruturação de Contratos Trabalhistas',
    description: 'Buscamos parecerista e advogado para conduzir auditoria completa nos contratos de trabalho e políticas internas de TI, com elaboração de novos aditivos de confidencialidade e cláusulas de proteção de dados pessoais.',
    clientId: 'usr_client_1',
    clientName: 'TechCorp Brasil Ltda',
    clientAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    clientVerified: true,
    clientRating: 4.8,
    clientHistoryCount: 5,
    hiringType: 'Fixo',
    assignedLawyerId: 'usr_lawyer_1',
    assignedLawyerName: 'Dr. Rodrigo Silveira',
    assignedLawyerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
    type: 'COMPLIANCE',
    specialty: 'Compliance & LGPD',
    status: 'IN_PROGRESS',
    urgency: 'HIGH',
    confidentiality: 'CONFIDENTIAL',
    budgetMin: 8000,
    budgetMax: 15000,
    estimatedDeadlineDays: 30,
    createdAt: '2025-02-10T10:00:00Z',
    updatedAt: '2025-02-14T15:30:00Z',
    city: 'Porto Alegre',
    state: 'RS',
    country: 'Brasil',
    language: 'Português',
    courtBranch: '3ª Vara Cível da Comarca de Porto Alegre - TJRS',
    proposalsCount: 5,
    parties: [
      { name: 'TechCorp Brasil Ltda', role: 'AUTOR', document: '12.345.678/0001-90', lawyer: 'Dr. Rodrigo Silveira (OAB/SP 412.980)' },
      { name: 'Sindicato dos Trabalhadores em Tecnologia - SINDPD', role: 'RÉU', document: '98.765.432/0001-10', lawyer: 'Dra. Márcia Oliveira (OAB/RS 88.120)' }
    ],
    upcomingHearings: [
      {
        id: 'hr_1',
        title: 'Audiência de Conciliação e Saneamento do Processo',
        date: '2025-03-05',
        time: '14:30',
        courtLocation: 'Sala 402 - Foro Central de Porto Alegre - RS',
        judgeName: 'Dr. Fernando Augusto de Souza',
        status: 'AGENDADA',
        type: 'CONCILIAÇÃO'
      }
    ],
    timeline: [
      {
        id: 'tl_1',
        title: 'Contrato de Honorários Assinado',
        date: '12 Fev 2025 - 11:20',
        author: 'Dr. Rodrigo Silveira',
        description: 'Contrato firmado via assinatura digital com garantia em custódia na plataforma Legal Work.',
        type: 'DOCUMENTO',
        attachmentName: 'Contrato_Honorarios_Plataforma_LWork.pdf'
      },
      {
        id: 'tl_2',
        title: 'Protocolo da Petição Intermediária de Juntada de Procuração',
        date: '13 Fev 2025 - 16:45',
        author: 'Dr. Rodrigo Silveira',
        description: 'Juntada da Procuração ad judicia com poderes específicos para transigir e assinar termos de cooperação.',
        type: 'PETICAO',
        attachmentName: 'Peticao_Juntada_Procuracao.pdf'
      },
      {
        id: 'tl_3',
        title: 'Despacho do Juiz Concedendo Prazo de 15 Dias',
        date: '14 Fev 2025 - 09:10',
        author: 'Juízo da 3ª Vara Cível',
        description: 'Intimação das partes para manifestação sobre produção de provas e apresentação do cronograma de compliance.',
        type: 'DESPACHO'
      }
    ]
  },
  {
    id: 'job_102',
    processNumber: '1042391-12.2024.8.26.0100',
    title: 'Ação Revisional Contratual de Concessão de Crédito Bancário',
    description: 'Necessidade de defesa contenciosa cível em cobrança bancária com abusividade de juros compostos. Busca-se cálculo pericial e tese de liminar para sustação de protesto.',
    clientId: 'usr_client_1',
    clientName: 'Grupo Horizonte Imobiliário',
    clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256',
    clientVerified: true,
    clientRating: 4.5,
    clientHistoryCount: 12,
    hiringType: 'Hora',
    type: 'LITIGATION',
    specialty: 'Direito Empresarial',
    status: 'OPEN',
    urgency: 'CRITICAL',
    confidentiality: 'STANDARD',
    budgetMin: 10000,
    budgetMax: 22000,
    estimatedDeadlineDays: 45,
    createdAt: '2025-02-12T08:00:00Z',
    updatedAt: '2025-02-12T08:00:00Z',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brasil',
    language: 'Português',
    courtBranch: '12ª Vara Cível do Foro Central Cível da Capital - TJSP',
    proposalsCount: 8,
    parties: [
      { name: 'Grupo Horizonte Imobiliário Ltda', role: 'AUTOR' },
      { name: 'Banco Fator S.A.', role: 'RÉU' }
    ]
  },
  {
    id: 'job_103',
    processNumber: 'INPI-BR-904812391',
    title: 'Registro de Marca e Proteção de Propriedade Intelectual Software SaaS',
    description: 'Depósito de pedido de registro de marca mista e nominativa junto ao INPI na classe NCL(11) 42 para software B2B, com oposição a marcas similares registradas anteriormente.',
    clientId: 'usr_client_1',
    clientName: 'TechCorp Brasil Ltda',
    type: 'INTELLECTUAL_PROPERTY',
    specialty: 'Propriedade Intelectual',
    status: 'COMPLETED',
    urgency: 'MEDIUM',
    confidentiality: 'STANDARD',
    budgetMin: 4000,
    budgetMax: 7000,
    estimatedDeadlineDays: 15,
    createdAt: '2025-01-05T14:00:00Z',
    updatedAt: '2025-01-20T11:00:00Z',
    city: 'São Paulo',
    state: 'SP',
    courtBranch: 'INPI - Instituto Nacional da Propriedade Industrial',
    proposalsCount: 3
  },
  {
    id: 'job_104',
    title: 'Due Diligence Imobiliária e Contratual para Aquisição de Imóvel Comercial',
    description: 'Análise minuciosa de certidões cíveis, trabalhistas, federais e registros de imóveis para transação imobiliária corporativa de R$ 4,5M na Avenida Faria Lima.',
    clientId: 'usr_client_1',
    clientName: 'Investimentos São Paulo S.A.',
    type: 'DUE_DILIGENCE',
    specialty: 'Direito Cível & Imobiliário',
    status: 'OPEN',
    urgency: 'HIGH',
    confidentiality: 'STRICTLY_CONFIDENTIAL',
    budgetMin: 15000,
    budgetMax: 28000,
    estimatedDeadlineDays: 20,
    createdAt: '2025-02-14T09:30:00Z',
    updatedAt: '2025-02-14T09:30:00Z',
    city: 'São Paulo',
    state: 'SP',
    proposalsCount: 4
  },
  {
    id: 'job_105',
    title: 'Elaboração de Acordo de Cotistas e Operação de M&A para Fintech',
    description: 'Elaboração de minuta completa de acordo de sócios, cláusulas de drag-along, tag-along e vestings de executivos para nova rodada de investimento.',
    clientId: 'usr_client_1',
    clientName: 'Venture Capital Partners',
    type: 'CONSULTING',
    specialty: 'Contratos & M&A',
    status: 'OPEN',
    urgency: 'HIGH',
    confidentiality: 'CONFIDENTIAL',
    budgetMin: 12000,
    budgetMax: 25000,
    estimatedDeadlineDays: 25,
    createdAt: '2025-02-15T10:00:00Z',
    updatedAt: '2025-02-15T10:00:00Z',
    city: 'São Paulo',
    state: 'SP',
    proposalsCount: 2
  },
  {
    id: 'job_106',
    title: 'Auditoria Completa de Compliance LGPD e Termos de Uso SaaS',
    description: 'Mapeamento de fluxo de dados, revisão de Termos de Serviço e Política de Privacidade para plataforma de pagamento digital em compliance com a ANPD.',
    clientId: 'usr_client_1',
    clientName: 'PayFlow Pagamentos S.A.',
    type: 'COMPLIANCE',
    specialty: 'Compliance LGPD',
    status: 'OPEN',
    urgency: 'MEDIUM',
    confidentiality: 'STANDARD',
    budgetMin: 9000,
    budgetMax: 18000,
    estimatedDeadlineDays: 30,
    createdAt: '2025-02-16T11:00:00Z',
    updatedAt: '2025-02-16T11:00:00Z',
    city: 'Campinas',
    state: 'SP',
    proposalsCount: 3
  }
];

export const INITIAL_PROPOSALS: Proposal[] = [
  {
    id: 'prop_201',
    jobId: 'job_101',
    jobTitle: 'Adequação LGPD e Reestruturação de Contratos Trabalhistas',
    processNumber: '5024192-45.2023.8.21.0001',
    lawyerId: 'usr_lawyer_1',
    lawyerName: 'Dr. Rodrigo Silveira',
    lawyerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
    lawyerOab: 'OAB/SP 412.980',
    lawyerRating: 4.9,
    value: 12500,
    deliveryDays: 30,
    coverLetter: 'Prezados diretores da TechCorp, proponho uma abordagem completa em 3 etapas com mapeamento de inventário de dados (Data Mapping), minutas de aditivos trabalhistas com clausulado LGPD e defesa técnica perante o Foro Central.',
    status: 'ACCEPTED',
    createdAt: '2025-02-11T14:20:00Z',
    proposedMilestones: [
      { title: 'Marco 1: Auditoria e Relatório de Impacto (DPIA)', description: 'Mapeamento de processos e entrega da Matriz de Risco', value: 4000 },
      { title: 'Marco 2: Redação de Minutas e Aditivos Contratuais', description: 'Entrega de aditivos de contratos CLT/PJ e políticas de privacidade', value: 4500 },
      { title: 'Marco 3: Treinamento de Equipe e Protocolo Judicial', description: 'Workshop prático com diretores e peticionamento em juízo', value: 4000 }
    ]
  },
  {
    id: 'prop_201_b',
    jobId: 'job_101',
    jobTitle: 'Adequação LGPD e Reestruturação de Contratos Trabalhistas',
    processNumber: '5024192-45.2023.8.21.0001',
    lawyerId: 'usr_lawyer_2',
    lawyerName: 'Dra. Camila Santos',
    lawyerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    lawyerOab: 'OAB/RJ 198.450',
    lawyerRating: 5.0,
    value: 14000,
    deliveryDays: 25,
    coverLetter: 'Proposta com foco intensivo em prevenção de riscos trabalhistas sindicais e adequação das cláusulas de confidencialidade de TI.',
    status: 'REJECTED',
    createdAt: '2025-02-11T16:00:00Z',
    proposedMilestones: [
      { title: 'Fase 1: Diagnóstico Trabalhista', description: 'Análise de passivo de horas e LGPD', value: 7000 },
      { title: 'Fase 2: Aditivos e Treinamento', description: 'Revisão das normas internas', value: 7000 }
    ]
  },
  {
    id: 'prop_201_c',
    jobId: 'job_101',
    jobTitle: 'Adequação LGPD e Reestruturação de Contratos Trabalhistas',
    processNumber: '5024192-45.2023.8.21.0001',
    lawyerId: 'usr_lawyer_3',
    lawyerName: 'Dr. Fernando Henrique Viana',
    lawyerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    lawyerOab: 'OAB/MG 154.210',
    lawyerRating: 4.8,
    value: 11200,
    deliveryDays: 20,
    coverLetter: 'Consultoria integrada de conformidade de dados e análise de reflexos fiscais em contratos de prestação de serviços.',
    status: 'REJECTED',
    createdAt: '2025-02-12T09:15:00Z',
    proposedMilestones: [
      { title: 'Entrega Única: Pacote LGPD', description: 'Minutas e parecer conclusivo', value: 11200 }
    ]
  },
  {
    id: 'prop_202',
    jobId: 'job_102',
    jobTitle: 'Ação Revisional Contratual de Concessão de Crédito Bancário',
    processNumber: '1042391-12.2024.8.26.0100',
    lawyerId: 'usr_lawyer_1',
    lawyerName: 'Dr. Rodrigo Silveira',
    lawyerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
    lawyerOab: 'OAB/SP 412.980',
    lawyerRating: 4.9,
    value: 18000,
    deliveryDays: 45,
    coverLetter: 'Nossa equipe possui vasta experiência em contencioso bancário de alta complexidade. Apresentaremos parecer pericial financeiro preliminar para embasamento da tutela de urgência.',
    status: 'UNDER_REVIEW',
    createdAt: '2025-02-12T18:00:00Z',
    proposedMilestones: [
      { title: 'Elaboração da Petição Inicial e Pedido Liminar', description: 'Protocolo urgente para sustação de efeitos de mora e protestos', value: 9000 },
      { title: 'Réplica à Contestação e Perícia Contábil', description: 'Acompanhamento do laudo pericial nomeado pelo juiz', value: 9000 }
    ]
  },
  {
    id: 'prop_202_b',
    jobId: 'job_102',
    jobTitle: 'Ação Revisional Contratual de Concessão de Crédito Bancário',
    processNumber: '1042391-12.2024.8.26.0100',
    lawyerId: 'usr_lawyer_2',
    lawyerName: 'Dra. Camila Santos',
    lawyerAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    lawyerOab: 'OAB/RJ 198.450',
    lawyerRating: 5.0,
    value: 16500,
    deliveryDays: 30,
    coverLetter: 'Análise minuciosa de encargos com recalculo financeiro e pedido de liminar imediato perante a 12ª Vara Cível.',
    status: 'PENDING',
    createdAt: '2025-02-13T10:30:00Z',
    proposedMilestones: [
      { title: 'Ajuizamento com Medida Cautelar', description: 'Depósito judicial e suspensão de mora', value: 8250 },
      { title: 'Fase de Provas e Impugnação', description: 'Produção pericial e réplica', value: 8250 }
    ]
  },
  {
    id: 'prop_204',
    jobId: 'job_104',
    jobTitle: 'Due Diligence Imobiliária e Contratual para Aquisição de Imóvel Comercial',
    lawyerId: 'usr_lawyer_1',
    lawyerName: 'Dr. Rodrigo Silveira',
    lawyerAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
    lawyerOab: 'OAB/SP 412.980',
    lawyerRating: 4.9,
    value: 22000,
    deliveryDays: 20,
    coverLetter: 'Relatório completo de auditagem imobiliária, certidões cíveis, criminais, fiscais e análise do registro do imóvel na Faria Lima.',
    status: 'PENDING',
    createdAt: '2025-02-14T11:00:00Z',
    proposedMilestones: [
      { title: 'Auditoria de Certidões e Registros', description: 'Levantamento completo de contingências', value: 11000 },
      { title: 'Relatório de Fechamento e Minuta de Compra e Venda', description: 'Minuta com cláusula de garantia de evicção', value: 11000 }
    ]
  }
];

export const INITIAL_CONTRACTS: Contract[] = [
  {
    id: 'cnt_302',
    jobId: 'job_102',
    jobTitle: 'Projeto de Teste: Escrow e Marcos',
    proposalId: 'prop_202',
    clientId: 'usr_client_1',
    clientName: 'TechCorp Brasil Ltda',
    lawyerId: 'usr_lawyer_1',
    lawyerName: 'Dr. Rodrigo Silveira',
    lawyerOab: 'OAB/SP 412.980',
    totalValue: 5000,
    escrowBalance: 5000,
    releasedBalance: 0,
    status: 'ACTIVE',
    startDate: new Date().toISOString().split('T')[0],
    endDateEst: '2026-12-31',
    progressPercentage: 0,
    milestones: [
      {
        id: 'ms_test_1',
        contractId: 'cnt_302',
        title: 'Marco Inicial: Aprovação da Petição',
        description: 'Primeira fase para testes do sistema',
        value: 2500,
        dueDate: '2026-08-10',
        status: 'PENDING'
      },
      {
        id: 'ms_test_2',
        contractId: 'cnt_302',
        title: 'Marco Final: Entrega',
        description: 'Fase final do projeto',
        value: 2500,
        dueDate: '2026-08-20',
        status: 'PENDING'
      }
    ]
  },
  {
    id: 'cnt_301',
    jobId: 'job_101',
    jobTitle: 'Adequação LGPD e Reestruturação de Contratos Trabalhistas',
    processNumber: '5024192-45.2023.8.21.0001',
    proposalId: 'prop_201',
    clientId: 'usr_client_1',
    clientName: 'TechCorp Brasil Ltda',
    lawyerId: 'usr_lawyer_1',
    lawyerName: 'Dr. Rodrigo Silveira',
    lawyerOab: 'OAB/SP 412.980',
    totalValue: 12500,
    escrowBalance: 8500,
    releasedBalance: 4000,
    status: 'ACTIVE',
    startDate: '2025-02-12',
    endDateEst: '2025-03-14',
    progressPercentage: 35,
    milestones: [
      {
        id: 'ms_1',
        contractId: 'cnt_301',
        title: 'Marco 1: Auditoria e Relatório de Impacto (DPIA)',
        description: 'Mapeamento de processos internos e emissão de parecer de diagnóstico',
        value: 4000,
        dueDate: '2025-02-20',
        status: 'PAID',
        submittedAt: '2025-02-18',
        approvedAt: '2025-02-19'
      },
      {
        id: 'ms_2',
        contractId: 'cnt_301',
        title: 'Marco 2: Redação de Minutas e Aditivos Contratuais',
        description: 'Aditivos contratuais trabalhistas com garantias LGPD',
        value: 4500,
        dueDate: '2025-03-01',
        status: 'IN_PROGRESS'
      },
      {
        id: 'ms_3',
        contractId: 'cnt_301',
        title: 'Marco 3: Treinamento de Equipe e Protocolo Judicial',
        description: 'Acompanhamento judicial e encerramento do escopo',
        value: 4000,
        dueDate: '2025-03-14',
        status: 'PENDING'
      }
    ]
  }
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay_401',
    contractId: 'cnt_301',
    jobTitle: 'Adequação LGPD e Reestruturação Contratual',
    processNumber: '5024192-45.2023.8.21.0001',
    payerName: 'TechCorp Brasil Ltda',
    receiverName: 'Dr. Rodrigo Silveira',
    amount: 4000,
    feeAmount: 200,
    netAmount: 3800,
    status: 'RELEASED',
    paymentMethod: 'PIX',
    createdAt: '2025-02-19T14:30:00Z',
    releasedAt: '2025-02-19T14:31:00Z',
    invoiceNumber: 'NF-e 2025/08192'
  },
  {
    id: 'pay_402',
    contractId: 'cnt_301',
    jobTitle: 'Adequação LGPD - Custódia de Garantia Marco 2 & 3',
    processNumber: '5024192-45.2023.8.21.0001',
    payerName: 'TechCorp Brasil Ltda',
    receiverName: 'Legal Work Escrow System',
    amount: 8500,
    feeAmount: 0,
    netAmount: 8500,
    status: 'IN_ESCROW',
    paymentMethod: 'TRANSFERENCIA',
    createdAt: '2025-02-12T10:00:00Z'
  },
  {
    id: 'pay_403',
    contractId: 'cnt_300',
    jobTitle: 'Registro de Marca INPI - Honorários Sucumbenciais e Serviços',
    payerName: 'TechCorp Brasil Ltda',
    receiverName: 'Dr. Rodrigo Silveira',
    amount: 6800,
    feeAmount: 340,
    netAmount: 6460,
    status: 'RELEASED',
    paymentMethod: 'PIX',
    createdAt: '2025-01-20T16:00:00Z',
    releasedAt: '2025-01-20T16:05:00Z',
    invoiceNumber: 'NF-e 2025/01042'
  }
];

export const INITIAL_CHAT_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'conv_501',
    jobId: 'job_101',
    jobTitle: 'Adequação LGPD e Reestruturação Contratual',
    proposalId: 'prop_201',
    proposalValue: 12500,
    lawyerName: 'Dr. Rodrigo Silveira',
    clientName: 'TechCorp Brasil Ltda',
    state: 'EXECUCAO',
    otherUser: {
      id: 'usr_client_1',
      name: 'TechCorp Brasil (Ricardo Santos)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      role: 'CLIENT',
      oabOrCompany: 'TechCorp Brasil Ltda',
      isOnline: true
    },
    lastMessage: 'Dr. Rodrigo, anexei a minuta revisada pela nossa diretoria executiva.',
    lastMessageTime: '10:42',
    unreadCount: 1
  },
  {
    id: 'conv_501_b',
    jobId: 'job_101',
    jobTitle: 'Adequação LGPD e Reestruturação Contratual',
    proposalId: 'prop_201_b',
    proposalValue: 14000,
    lawyerName: 'Dra. Camila Santos',
    clientName: 'TechCorp Brasil Ltda',
    state: 'READ_ONLY',
    otherUser: {
      id: 'usr_lawyer_2',
      name: 'Dra. Camila Santos',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
      role: 'LAWYER',
      oabOrCompany: 'OAB/RJ 198.450',
      isOnline: true
    },
    lastMessage: '⚠️ Notificação do Sistema: O cliente selecionou outro advogado para conduzir esta demanda.',
    lastMessageTime: '12 Fev',
    unreadCount: 0
  },
  {
    id: 'conv_502',
    jobId: 'job_102',
    jobTitle: 'Ação Revisional Contratual de Concessão de Crédito Bancário',
    proposalId: 'prop_202',
    proposalValue: 18000,
    lawyerName: 'Dr. Rodrigo Silveira',
    clientName: 'Grupo Horizonte Imobiliário',
    state: 'NEGOCIACAO',
    otherUser: {
      id: 'usr_lawyer_1',
      name: 'Dr. Rodrigo Silveira',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
      role: 'LAWYER',
      oabOrCompany: 'OAB/SP 412.980',
      isOnline: true
    },
    lastMessage: 'Apresentaremos parecer pericial financeiro preliminar para embasamento da tutela de urgência.',
    lastMessageTime: 'Ontem',
    unreadCount: 0
  },
  {
    id: 'conv_502_b',
    jobId: 'job_102',
    jobTitle: 'Ação Revisional Contratual de Concessão de Crédito Bancário',
    proposalId: 'prop_202_b',
    proposalValue: 16500,
    lawyerName: 'Dra. Camila Santos',
    clientName: 'Grupo Horizonte Imobiliário',
    state: 'NEGOCIACAO',
    otherUser: {
      id: 'usr_lawyer_2',
      name: 'Dra. Camila Santos',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
      role: 'LAWYER',
      oabOrCompany: 'OAB/RJ 198.450',
      isOnline: false
    },
    lastMessage: 'Análise minuciosa de encargos com recalculo financeiro e pedido de liminar imediato.',
    lastMessageTime: '13 Fev',
    unreadCount: 0
  }
];

export const INITIAL_CHAT_MESSAGES: Record<string, ChatMessage[]> = {
  conv_501: [
    {
      id: 'msg_1',
      conversationId: 'conv_501',
      senderId: 'usr_lawyer_1',
      senderName: 'Dr. Rodrigo Silveira',
      senderAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
      content: 'Bom dia, Ricardo! Concluímos o mapeamento de riscos trabalhistas e LGPD para o Marco 1. O relatório completo está diponível na aba de documentos.',
      timestamp: '10:15',
      isRead: true
    },
    {
      id: 'msg_2',
      conversationId: 'conv_501',
      senderId: 'usr_client_1',
      senderName: 'Ricardo Santos (TechCorp)',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      content: 'Excelente notícia, Dr. Rodrigo! Já autorizamos a liberação do pagamento do Marco 1 em custódia.',
      timestamp: '10:30',
      isRead: true
    },
    {
      id: 'msg_3',
      conversationId: 'conv_501',
      senderId: 'usr_client_1',
      senderName: 'Ricardo Santos (TechCorp)',
      senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
      content: 'Dr. Rodrigo, anexei a minuta revisada pela nossa diretoria executiva.',
      timestamp: '10:42',
      isRead: false,
      attachments: [
        {
          id: 'att_1',
          name: 'Minuta_Revisada_LGPD_TechCorp_v2.pdf',
          size: '2.4 MB',
          type: 'PDF',
          url: '#'
        }
      ]
    }
  ]
};

export const INITIAL_DOCUMENTS: AppDocument[] = [
  {
    id: 'doc_601',
    title: 'Contrato Social & Aditivos Consolidados',
    processNumber: '5024192-45.2023.8.21.0001',
    category: 'Contratos',
    fileName: 'Contrato_Social_Consolidado_TechCorp.pdf',
    fileSize: '3.8 MB',
    fileType: 'PDF',
    uploadedBy: 'Ricardo Santos',
    uploadDate: '10/02/2025',
    statusTag: 'Assinado',
    downloadUrl: '#'
  },
  {
    id: 'doc_602',
    title: 'Petição Inicial de Juntada de Procuração',
    processNumber: '5024192-45.2023.8.21.0001',
    category: 'Peças Processuais',
    fileName: 'Peticao_Inicial_Juizo_PortoAlegre.docx',
    fileSize: '1.2 MB',
    fileType: 'DOCX',
    uploadedBy: 'Dr. Rodrigo Silveira',
    uploadDate: '13/02/2025',
    statusTag: 'Finalizado',
    downloadUrl: '#'
  },
  {
    id: 'doc_603',
    title: 'Procuração Ad Judicia et Extra com Poderes Especiais',
    processNumber: '5024192-45.2023.8.21.0001',
    category: 'Procurações',
    fileName: 'Procuracao_Ad_Judicia_DrRodrigo.pdf',
    fileSize: '850 KB',
    fileType: 'PDF',
    uploadedBy: 'Ricardo Santos',
    uploadDate: '11/02/2025',
    statusTag: 'Assinado',
    downloadUrl: '#'
  },
  {
    id: 'doc_604',
    title: 'Certidão Negativa de Débitos Tributários Federais e Trabalhistas',
    processNumber: '1042391-12.2024.8.26.0100',
    category: 'Certidões',
    fileName: 'Certidao_Conjunta_Receita_Federal.pdf',
    fileSize: '420 KB',
    fileType: 'PDF',
    uploadedBy: 'Dr. Rodrigo Silveira',
    uploadDate: '14/02/2025',
    statusTag: 'Em revisão',
    downloadUrl: '#'
  },
  {
    id: 'doc_605',
    title: 'Relatório Pericial Contábil para Tutela Antecipada',
    processNumber: '1042391-12.2024.8.26.0100',
    category: 'Provas & Anexos',
    fileName: 'Parecer_Tecnico_Calculo_Financeiro.xlsx',
    fileSize: '4.1 MB',
    fileType: 'XLSX',
    uploadedBy: 'Dr. Rodrigo Silveira',
    uploadDate: '14/02/2025',
    statusTag: 'Urgente',
    downloadUrl: '#'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif_1',
    title: 'Pagamento de Honorários Liberação de Custódia',
    message: 'R$ 4.000,00 referente ao Marco 1 do Processo 5024192-45 foi creditado via PIX.',
    type: 'PAYMENT_RECEIVED',
    timestamp: 'Há 25 minutos',
    isRead: false
  },
  {
    id: 'notif_2',
    title: 'Lembrete de Audiência Agendada',
    message: 'Audiência de Conciliação em Porto Alegre agendada para 05/03 às 14:30.',
    type: 'HEARING_REMINDER',
    timestamp: 'Há 2 horas',
    isRead: false
  },
  {
    id: 'notif_3',
    title: 'Nova Mensagem do Cliente',
    message: 'TechCorp Brasil enviou o arquivo Minuta_Revisada_LGPD_v2.pdf no chat.',
    type: 'CHAT_MESSAGE',
    timestamp: 'Há 3 horas',
    isRead: true
  }
];

export const MOCK_DASHBOARD_METRICS: DashboardMetrics = {
  activeCasesCount: 12,
  pendingProposalsCount: 4,
  monthlyRevenue: 14850.00,
  escrowBalanceTotal: 32400.00,
  rating: 4.9,
  totalClientsOrLawyers: 28,
  weeklyProductivity: [
    { day: 'Seg', horas: 7.5, casos: 4 },
    { day: 'Ter', horas: 8.2, casos: 6 },
    { day: 'Qua', horas: 6.8, casos: 5 },
    { day: 'Qui', horas: 9.1, casos: 8 },
    { day: 'Sex', horas: 7.0, casos: 4 },
    { day: 'Sáb', horas: 2.5, casos: 1 }
  ],
  caseDistribution: [
    { label: 'Direito Empresarial', count: 5, percentage: 41.6 },
    { label: 'Compliance & LGPD', count: 3, percentage: 25.0 },
    { label: 'Contencioso Cível', count: 2, percentage: 16.7 },
    { label: 'Propriedade Intelectual', count: 2, percentage: 16.7 }
  ]
};
