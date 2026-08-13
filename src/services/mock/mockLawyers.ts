import { FullLawyerProfile } from '../../types';

export const MOCK_LAWYERS: FullLawyerProfile[] = [
  {
    id: 'usr_lawyer_1',
    slug: 'dr-rodrigo-silveira',
    name: 'Dr. Rodrigo Silveira',
    email: 'rodrigo.silveira@adv.oabsp.org.br',
    role: 'LAWYER',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=256',
    phone: '(11) 98765-4321',
    cpfCnpj: '321.654.987-00',
    oabNumber: '412.980',
    oabState: 'SP',
    verifiedOab: true,
    primarySpecialty: 'Direito Empresarial & Compliance LGPD',
    city: 'São Paulo',
    state: 'SP',
    country: 'Brasil',
    joinedDate: 'Maio 2022',
    companyName: 'Silveira & Associados Advocacia',
    availability: 'Disponível Imadiatamente',
    avgResponseTime: '< 25 minutos',
    isOnline: true,
    rating: 4.9,
    reviewCount: 42,
    completedCasesCount: 87,
    totalClients: 38,
    successRate: 98.8,
    onTimeDeliveryPercentage: 100,
    avgDeliveryDays: 5,
    avgContractValue: 8500,
    hourlyRate: 350,
    fixedRateEstimate: 5000,
    
    bio: `Especialista em Direito Empresarial, Contratos Tecnológicos e Adequação LGPD com mais de 12 anos de atuação contenciosa e consultiva para startups, fintechs e grandes corporações multinacionais.

Formado pela Universidade de São Paulo (USP) com LL.M. em Direito dos Negócios pelo Insper. Atuo na liderança de auditorias de compliance, elaboração de acordos de acionistas, due diligence e defesa técnica em contencioso cível e bancário perante o TJSP, STJ e STF.

Comprometido com entregas jurídicas ágeis, focadas no ecossistema de inovação, garantindo total segurança regulatória com transparência nos marcos de honorários.`,

    specialties: ['Direito Empresarial', 'Compliance LGPD', 'Contratos & M&A', 'Propriedade Intelectual', 'Contencioso Cível'],
    skills: ['Auditoria LGPD', 'Elaboração de Minutas', 'Contencioso Cível', 'Negociação Estratégica', 'DPIA / RIPD', 'Societário & M&A'],

    specialtyDetails: [
      { id: 'sd_1', name: 'Direito Empresarial & Societário', yearsExperience: 12, masteryLevel: 'Especialista' },
      { id: 'sd_2', name: 'Compliance & LGPD', yearsExperience: 7, masteryLevel: 'Especialista' },
      { id: 'sd_3', name: 'Contratos Internacionais & M&A', yearsExperience: 10, masteryLevel: 'Avançado' },
      { id: 'sd_4', name: 'Contencioso Cível & Bancário', yearsExperience: 11, masteryLevel: 'Especialista' }
    ],

    skillDetails: [
      { id: 'sk_1', name: 'LGPD & Mapeamento de Dados (Data Mapping)', endorsementsCount: 34 },
      { id: 'sk_2', name: 'Redação de Aditivos & Termos de Uso', endorsementsCount: 29 },
      { id: 'sk_3', name: 'Parecer Técnico Societário', endorsementsCount: 22 },
      { id: 'sk_4', name: 'Defesa em Processos no STJ / TJSP', endorsementsCount: 18 },
      { id: 'sk_5', name: 'Arbitragem & Mediação Corporativa', endorsementsCount: 15 }
    ],

    education: [
      { id: 'ed_1', university: 'Universidade de São Paulo (USP)', course: 'Direito', degree: 'Bacharelado', year: '2012' },
      { id: 'ed_2', university: 'Insper Instituto de Ensino e Pesquisa', course: 'LL.M. em Direito dos Negócios', degree: 'LL.M.', year: '2016' },
      { id: 'ed_3', university: 'FGV Law - Fundação Getulio Vargas', course: 'Especialização em Direito Digital e Privacidade', degree: 'Pós-graduação', year: '2020' }
    ],

    certificates: [
      { id: 'cert_1', name: 'Certificação CIPP/E - Certified Information Privacy Professional Europe', institution: 'IAPP (International Association of Privacy Professionals)', year: '2021', fileUrl: '#', fileType: 'PDF' },
      { id: 'cert_2', name: 'Compliance Auditor Certificate', institution: 'FGV / Transparency International', year: '2019', fileUrl: '#', fileType: 'PDF' },
      { id: 'cert_3', name: 'Especialista em Arbitragem Comercial', institution: 'CAM-CCBC', year: '2022', fileUrl: '#', fileType: 'PNG' }
    ],

    languages: [
      { id: 'lang_1', language: 'Português', level: 'Nativo' },
      { id: 'lang_2', language: 'Inglês', level: 'Fluente' },
      { id: 'lang_3', language: 'Espanhol', level: 'Avançado' }
    ],

    workExperience: [
      { id: 'we_1', company: 'Silveira & Associados Advocacia', role: 'Sócio Fundador', period: '2018 - Presente', description: 'Coordenação de equipe especializada em Direito Digital, M&A e Governança Corporativa para empresas do setor de tecnologia e serviços.' },
      { id: 'we_2', company: 'Mattos Filho, Veiga Filho, Marrey Jr. e Quiroga Advogados', role: 'Advogado Senior - Societário', period: '2013 - 2018', description: 'Atuação em operações corporativas de fusões e aquisições, due diligence estruturada e elaboração de contratos societários complexos.' }
    ],

    portfolio: [
      { id: 'port_1', title: 'Adequação LGPD de Plataforma Fintech com 500k Usuários', category: 'Caso de Sucesso', description: 'Mapeamento completo de dados, política de privacidade e revisão contratual reduzindo riscos regulatórios perante a ANPD.', date: '2024', fileUrl: '#' },
      { id: 'port_2', title: 'Parecer sobre Cláusulas Abusivas em Contratos de Mutuo Bancário', category: 'Parecer Técnico', description: 'Análise fundamentada nas Súmulas do STJ que resultou em concessão de liminar para suspensão de execução.', date: '2024', fileUrl: '#' },
      { id: 'port_3', title: 'Modelo de Acordo de Acionistas e Vesting para Startup SaaS', category: 'Contrato', description: 'Estruturação jurídica de captação Seed/Series A com cláusulas de drag-along e tag-along.', date: '2023', linkUrl: '#' }
    ],

    completedProjectsHistory: [
      { id: 'cp_1', title: 'Adequação LGPD e Reestruturação de Contratos Trabalhistas', category: 'Compliance & LGPD', clientName: 'TechCorp Brasil Ltda', clientAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256', value: 12500, deadlineDays: 30, completionDate: '19/02/2025', rating: 5.0, reviewComment: 'O Dr. Rodrigo foi extremamente atencioso e rigoroso na elaboração de todos os aditivos. Entregou os relatórios DPIA antes do prazo estipulado!', status: 'COMPLETED' },
      { id: 'cp_2', title: 'Registro de Marca e Proteção de Propriedade Intelectual Software SaaS', category: 'Propriedade Intelectual', clientName: 'TechCorp Brasil Ltda', clientAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256', value: 6800, deadlineDays: 15, completionDate: '20/01/2025', rating: 5.0, reviewComment: 'Processo no INPI concluído com deferimento total. Excelente profissional!', status: 'COMPLETED' },
      { id: 'cp_3', title: 'Revisão e Minuta de Contrato Social para Holdings Familiar', category: 'Direito Empresarial', clientName: 'Grupo Vanguarda Patrimonial', clientAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256', value: 14000, deadlineDays: 20, completionDate: '10/12/2024', rating: 4.8, reviewComment: 'Domínio impressionante de holdings e planejamento sucessório.', status: 'COMPLETED' }
    ],

    reviewsList: [
      { id: 'rev_1', reviewerName: 'Ricardo Santos', reviewerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256', reviewerCompany: 'TechCorp Brasil Ltda', rating: 5.0, comment: 'Trabalho impecável do Dr. Rodrigo. Além do conhecimento técnico profundo, a clareza na comunicação facilitou muito a aprovação interna com o conselho.', projectTitle: 'Adequação LGPD e Reestruturação Contratual', date: 'Há 2 semanas' },
      { id: 'rev_2', reviewerName: 'Fernando Alcantara', reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256', reviewerCompany: 'Grupo Vanguarda', rating: 4.9, comment: 'Profissional de altíssima competência. Nos orientou em todas as fases da reorganização societária.', projectTitle: 'Revisão e Minuta de Contrato Social para Holdings', date: '10/12/2024' }
    ],

    stats: {
      totalContractsCount: 87,
      totalEarned: 420000,
      activeProjectsCount: 3,
      avgResponseMinutes: 18,
      proposalTimeAvgHours: 2.4,
      recurringClientPercentage: 74
    },

    serviceModalities: ['Atendimento Remoto', 'Atendimento Presencial', 'Híbrido'],
    socialLinks: {
      linkedin: 'https://linkedin.com/in/rodrigosilveira-adv',
      website: 'https://silveiraadvocacia.com.br'
    }
  },
  {
    id: 'usr_lawyer_2',
    slug: 'dra-camila-santos',
    name: 'Dra. Camila Santos',
    email: 'camila.santos@adv.oabrj.org.br',
    role: 'LAWYER',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=256',
    phone: '(21) 97654-3210',
    cpfCnpj: '456.789.123-11',
    oabNumber: '198.450',
    oabState: 'RJ',
    verifiedOab: true,
    primarySpecialty: 'Direito Trabalhista & Relações do Trabalho',
    city: 'Rio de Janeiro',
    state: 'RJ',
    country: 'Brasil',
    joinedDate: 'Agosto 2021',
    companyName: 'Camila Santos Advocacia Trabalhista',
    availability: 'Disponível Imadiatamente',
    avgResponseTime: '< 15 minutos',
    isOnline: true,
    rating: 5.0,
    reviewCount: 56,
    completedCasesCount: 112,
    totalClients: 49,
    successRate: 99.1,
    onTimeDeliveryPercentage: 100,
    avgDeliveryDays: 3,
    avgContractValue: 6200,
    hourlyRate: 290,
    fixedRateEstimate: 4200,

    bio: `Advogada parecerista com foco estratégico em Prevenção de Riscos Trabalhistas, Acordos Coletivos, Negociações de PLR e Gestão do Contencioso de Massa.

Mestre em Direito do Trabalho pela UERJ. Atuo ativamente em negociações sindicais e na elaboração de defesas em reclamações trabalhistas de alto valor para corporações do setor de telecomunicações, logística e varejo.`,

    specialties: ['Direito Trabalhista', 'Compliance Trabalhista', 'Acordos Coletivos', 'Contencioso de Massa'],
    skills: ['Defesas Trabalhistas', 'Negociação Sindical', 'Revisão de Turnos & Horas', 'Mediação TRT'],

    specialtyDetails: [
      { id: 'sd_10', name: 'Contencioso Trabalhista Patronal', yearsExperience: 10, masteryLevel: 'Especialista' },
      { id: 'sd_11', name: 'Compliance & Prevenção Trabalhista', yearsExperience: 8, masteryLevel: 'Especialista' }
    ],

    skillDetails: [
      { id: 'sk_10', name: 'Elaboração de Contestação TRT', endorsementsCount: 42 },
      { id: 'sk_11', name: 'Acordos Coletivos & Sindicatos', endorsementsCount: 38 }
    ],

    education: [
      { id: 'ed_10', university: 'Universidade do Estado do Rio de Janeiro (UERJ)', course: 'Direito', degree: 'Bacharelado', year: '2014' },
      { id: 'ed_11', university: 'UERJ', course: 'Direito das Relações de Trabalho', degree: 'Mestrado', year: '2018' }
    ],

    certificates: [
      { id: 'cert_10', name: 'Especialização em Direito do Trabalho Contemporâneo', institution: 'FGV Rio', year: '2020', fileUrl: '#', fileType: 'PDF' }
    ],

    languages: [
      { id: 'lang_10', language: 'Português', level: 'Nativo' },
      { id: 'lang_11', language: 'Inglês', level: 'Avançado' }
    ],

    workExperience: [
      { id: 'we_10', company: 'Camila Santos Advocacia', role: 'Sócia Titular', period: '2019 - Presente', description: 'Gestão de contencioso estratégico e consultoria preventiva para mais de 30 empresas de grande porte.' }
    ],

    portfolio: [
      { id: 'port_10', title: 'Redução de 70% no Passivo Trabalhista de Transportadora', category: 'Caso de Sucesso', description: 'Implementação de acordo preventivo e regularização do banco de horas.', date: '2024' }
    ],

    completedProjectsHistory: [
      { id: 'cp_10', title: 'Defesa em Ação Trabalhista Coletiva', category: 'Direito Trabalhista', clientName: 'Logística Expresso Brasil', value: 8500, deadlineDays: 15, completionDate: '15/01/2025', rating: 5.0, reviewComment: 'A Dra. Camila reverteu um pedido liminar gravíssimo!', status: 'COMPLETED' }
    ],

    reviewsList: [
      { id: 'rev_10', reviewerName: 'Marcos de Souza', reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256', reviewerCompany: 'Expresso Brasil', rating: 5.0, comment: 'Profissional espetacular. Rapidez surpreendente!', projectTitle: 'Defesa em Ação Trabalhista Coletiva', date: '15/01/2025' }
    ],

    stats: {
      totalContractsCount: 112,
      totalEarned: 380000,
      activeProjectsCount: 4,
      avgResponseMinutes: 12,
      proposalTimeAvgHours: 1.5,
      recurringClientPercentage: 82
    },

    serviceModalities: ['Atendimento Remoto', 'Híbrido']
  },
  {
    id: 'usr_lawyer_3',
    slug: 'dr-fernando-henrique',
    name: 'Dr. Fernando Henrique Viana',
    email: 'fernando.viana@adv.oabmg.org.br',
    role: 'LAWYER',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=256',
    phone: '(31) 98877-6655',
    cpfCnpj: '567.890.123-22',
    oabNumber: '154.210',
    oabState: 'MG',
    verifiedOab: true,
    primarySpecialty: 'Direito Tributário & Planejamento Fiscal',
    city: 'Belo Horizonte',
    state: 'MG',
    country: 'Brasil',
    joinedDate: 'Novembro 2022',
    companyName: 'Viana Tributários & Consultoria',
    availability: 'Disponível em 24h',
    avgResponseTime: '< 45 minutos',
    isOnline: false,
    rating: 4.8,
    reviewCount: 31,
    completedCasesCount: 64,
    totalClients: 29,
    successRate: 96.5,
    onTimeDeliveryPercentage: 98,
    avgDeliveryDays: 7,
    avgContractValue: 11500,
    hourlyRate: 400,
    fixedRateEstimate: 7500,

    bio: `Consultor Tributário especialista em Planejamento Fiscal, Recuperação de Créditos de PIS/COFINS/ICMS e Defesas em Execuções Fiscais Federais e Estaduais.

Especialista pela UFMG com mais de 14 anos de experiência na otimização de carga tributária de indústrias, mineradoras e empresas de e-commerce.`,

    specialties: ['Direito Tributário', 'Recuperação de Créditos', 'Planejamento Fiscal', 'Contencioso Administrativo CARF'],
    skills: ['Recuperação Tese do Século', 'Defesa CARF', 'Planejamento Lucro Real/Presumido'],

    specialtyDetails: [
      { id: 'sd_20', name: 'Planejamento Tributário Corporativo', yearsExperience: 14, masteryLevel: 'Especialista' },
      { id: 'sd_21', name: 'Contencioso CARF & Receita Federal', yearsExperience: 12, masteryLevel: 'Especialista' }
    ],

    skillDetails: [
      { id: 'sk_20', name: 'Auditoria de Notas & Sped Fiscal', endorsementsCount: 25 }
    ],

    education: [
      { id: 'ed_20', university: 'UFMG', course: 'Direito', degree: 'Bacharelado', year: '2010' },
      { id: 'ed_21', university: 'IBMEC', course: 'Gestão Tributária', degree: 'Pós-graduação', year: '2013' }
    ],

    certificates: [
      { id: 'cert_20', name: 'Auditor Tributário Certificado', institution: 'IBET', year: '2017', fileUrl: '#' }
    ],

    languages: [
      { id: 'lang_20', language: 'Português', level: 'Nativo' },
      { id: 'lang_21', language: 'Inglês', level: 'Intermediário' }
    ],

    workExperience: [
      { id: 'we_20', company: 'Viana Tributários', role: 'Sócio Gestor', period: '2016 - Presente', description: 'Atuação na recuperação de mais de R$ 30M em tributos recolhidos indevidamente.' }
    ],

    portfolio: [
      { id: 'port_20', title: 'Recuperação de R$ 1.8M em PIS/COFINS para Indústria Alimentícia', category: 'Caso de Sucesso', description: 'Ajuizamento de mandado de segurança com exclusão do ICMS da base do PIS/COFINS.', date: '2024' }
    ],

    completedProjectsHistory: [
      { id: 'cp_20', title: 'Parecer Tributário sobre Benefícios Fiscais de ICMS em MG', category: 'Direito Tributário', clientName: 'Distribuidora Central de Medicamentos', value: 15000, deadlineDays: 20, completionDate: '12/11/2024', rating: 4.8, reviewComment: 'Parecer extremamente fundamentado com viabilidade prática imediata.', status: 'COMPLETED' }
    ],

    reviewsList: [
      { id: 'rev_20', reviewerName: 'Luciana Mello', reviewerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256', reviewerCompany: 'Distribuidora Central', rating: 4.8, comment: 'Excelente parecer tributário, economia real comprovada.', projectTitle: 'Parecer Tributário sobre Benefícios Fiscais', date: '12/11/2024' }
    ],

    stats: {
      totalContractsCount: 64,
      totalEarned: 510000,
      activeProjectsCount: 2,
      avgResponseMinutes: 35,
      proposalTimeAvgHours: 3.0,
      recurringClientPercentage: 68
    },

    serviceModalities: ['Atendimento Remoto', 'Atendimento Presencial']
  }
];
