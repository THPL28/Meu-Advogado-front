import React, { useState } from 'react';
import {
  Save,
  User,
  Award,
  BookOpen,
  Briefcase,
  Globe,
  Plus,
  Trash2,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  Building2,
  Sparkles,
  Link as LinkIcon,
  ArrowUp,
  ArrowDown,
  Upload,
  Clock,
  MapPin,
  Phone,
  Mail,
  Check,
  Users,
  FileBadge2,
  UploadCloud,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { useLegalPlatform } from '../../hooks/useLegalPlatform';
import {
  FullLawyerProfile,
  LawyerSpecialtyDetail,
  LawyerSkillDetail,
  Education,
  WorkExperience,
  Language,
  Certificate,
  VerificationStatus
} from '../../types';
import { onboardingApi } from '../../services/api';

const BRAZILIAN_UFS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

export const ProfileEditPanel: React.FC = () => {
  const { lawyers, selectedLawyerSlug, updateLawyerProfile, setActiveTab, role, user, jobs, verificationStatus } = useLegalPlatform();

  const emptyLawyer: FullLawyerProfile = {
    id: user?.id || '',
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    cpfCnpj: user?.cpfCnpj || '',
    role: 'LAWYER',
    slug: user?.name ? user.name.toLowerCase().replace(/\s+/g, '-') : '',
    avatarUrl: user?.avatarUrl || '',
    oabNumber: user?.oabNumber || '',
    oabState: user?.oabState || 'SP',
    verifiedOab: !!user?.verifiedOab,
    verificationStatus: user?.verificationStatus || verificationStatus || 'DRAFT',
    oabExpiryDate: user?.oabExpiryDate || '',
    jurisdictionStates: user?.jurisdictionStates || (user?.oabState ? [user.oabState] : ['SP']),
    city: user?.city || '',
    state: user?.state || '',
    country: 'Brasil',
    primarySpecialty: user?.specialties?.[0] || 'Direito Geral',
    bio: user?.bio || '',
    hourlyRate: 250,
    rating: user?.rating ?? 5.0,
    reviewCount: 0,
    completedCasesCount: 0,
    successRate: 100,
    onTimeDeliveryPercentage: 100,
    avgDeliveryDays: 5,
    avgContractValue: 2500,
    totalClients: 0,
    isOnline: true,
    avgResponseTime: '< 2 horas',
    joinedDate: user?.joinedDate || '2024',
    specialties: user?.specialties || ['Direito Geral'],
    specialtyDetails: [],
    skills: [],
    skillDetails: [],
    education: [],
    certificates: [],
    languages: [],
    workExperience: [],
    portfolio: [],
    completedProjectsHistory: [],
    reviewsList: [],
    serviceModalities: ['Atendimento Remoto'],
    stats: {
      totalContractsCount: 0,
      totalEarned: 0,
      activeProjectsCount: 0,
      avgResponseMinutes: 30,
      proposalTimeAvgHours: 2,
      recurringClientPercentage: 0
    },
    socialLinks: { linkedin: '', website: '', instagram: '' },
    availability: 'Disponível Imadiatamente'
  };

  const currentLawyer = lawyers.find(l => l.slug === selectedLawyerSlug || l.id === user?.id) || lawyers[0] || emptyLawyer;

  const [formData, setFormData] = useState<FullLawyerProfile>({
    ...currentLawyer,
    verificationStatus: user?.verificationStatus || currentLawyer.verificationStatus || 'DRAFT',
    oabExpiryDate: user?.oabExpiryDate || currentLawyer.oabExpiryDate || '',
    jurisdictionStates: user?.jurisdictionStates || currentLawyer.jurisdictionStates || (currentLawyer.oabState ? [currentLawyer.oabState] : ['SP']),
  });
  const [activeTabSection, setActiveTabSection] = useState<'pessoal' | 'bio' | 'especialidades' | 'competencias' | 'formacao' | 'experiencia' | 'certificados' | 'idiomas' | 'portfolio' | 'redes' | 'disponibilidade'>('pessoal');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [documentAttachment, setDocumentAttachment] = useState<string>('certidao_regularidade_oab.pdf');
  const [submittingOnboarding, setSubmittingOnboarding] = useState(false);
  const [onboardingSuccessMessage, setOnboardingSuccessMessage] = useState('');

  const clientJobs = jobs.filter(j => j.clientName === user?.name || j.clientId === user?.id);

  if (role === 'CLIENT') {
    return (
      <div className="space-y-6 animate-in fade-in duration-200 text-foreground w-full max-w-5xl mx-auto">
        <div className="bg-card rounded-3xl p-6 sm:p-8 border border-border/80 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user?.name} className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl object-cover ring-2 ring-emerald-500/30" />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-3xl ring-2 ring-emerald-500/30">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
            </div>
          )}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h1 className="text-2xl font-extrabold text-foreground">{user?.name}</h1>
              {user?.verifiedOab && (
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1 mx-auto sm:mx-0 w-fit">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Cliente Verificado
                </span>
              )}
            </div>
            <p className="text-muted-foreground/90 font-medium">{user?.companyName ? 'Empresa' : 'Pessoa Física'} • {user?.city && user?.state ? `${user.city}, ${user.state} - Brasil` : 'Localização não informada'}</p>
            <p className="text-sm text-muted-foreground/90 mt-2">Membro desde {user?.joinedDate || '2024'}</p>
            
            <div className="mt-4 text-sm text-muted-foreground/90 max-w-3xl leading-relaxed">
              {user?.bio || 'Perfil de contratante verificado na plataforma.'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card p-5 rounded-2xl border border-border/80 shadow-xs flex flex-col items-center justify-center text-center">
            <Briefcase className="w-6 h-6 text-emerald-600 mb-2" />
            <p className="text-2xl font-extrabold text-foreground">{clientJobs.length}</p>
            <p className="text-xs text-muted-foreground/90 font-semibold uppercase tracking-wider">Demandas Publicadas</p>
          </div>
          <div className="bg-card p-5 rounded-2xl border border-border/80 shadow-xs flex flex-col items-center justify-center text-center">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 mb-2" />
            <p className="text-2xl font-extrabold text-foreground">{clientJobs.filter(j => j.status === 'COMPLETED').length}</p>
            <p className="text-xs text-muted-foreground/90 font-semibold uppercase tracking-wider">Contratos Concluídos</p>
          </div>
          <div className="bg-card p-5 rounded-2xl border border-border/80 shadow-xs flex flex-col items-center justify-center text-center">
            <Users className="w-6 h-6 text-emerald-600 mb-2" />
            <p className="text-2xl font-extrabold text-foreground">{clientJobs.filter(j => j.assignedLawyerId).length}</p>
            <p className="text-xs text-muted-foreground/90 font-semibold uppercase tracking-wider">Advogados Contratados</p>
          </div>
          <div className="bg-card p-5 rounded-2xl border border-border/80 shadow-xs flex flex-col items-center justify-center text-center">
            <Clock className="w-6 h-6 text-emerald-600 mb-2" />
            <p className="text-2xl font-extrabold text-foreground">{clientJobs.length > 0 ? '24h' : 'N/A'}</p>
            <p className="text-xs text-muted-foreground/90 font-semibold uppercase tracking-wider">Tempo Médio de Contratação</p>
          </div>
        </div>

        <div className="bg-card rounded-3xl border border-border/80 p-6 shadow-xs">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" /> Histórico de Demandas
          </h2>
          {clientJobs.length > 0 ? (
            <div className="space-y-4">
              {clientJobs.map(job => (
                <div key={job.id} className="p-4 rounded-2xl border border-border/50 bg-background/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-foreground">{job.title}</h3>
                    <p className="text-xs text-muted-foreground/90 font-medium mt-1">{job.specialty}</p>
                  </div>
                  <div className="flex flex-col sm:items-end gap-2 text-right w-full sm:w-auto">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-full w-fit ${
                      job.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                      job.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      job.status === 'OPEN' ? 'bg-amber-100 text-amber-700' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {job.status === 'COMPLETED' ? 'Concluída' :
                       job.status === 'IN_PROGRESS' ? 'Em andamento' :
                       job.status === 'OPEN' ? 'Aberta' : 'Cancelada'}
                    </span>
                    <p className="text-xs text-muted-foreground/90 font-medium">R$ {job.budgetMin} - R$ {job.budgetMax}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground/90 text-sm bg-background rounded-2xl border border-border/50">
              Nenhuma demanda publicada ainda.
            </div>
          )}
        </div>
      </div>
    );
  }

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateLawyerProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 2000);
  };

  const toggleJurisdictionState = (uf: string) => {
    const current = formData.jurisdictionStates || [];
    const exists = current.includes(uf);
    const updated = exists ? current.filter(s => s !== uf) : [...current, uf];
    setFormData({ ...formData, jurisdictionStates: updated });
  };

  const handleSubmitVerification = async () => {
    if (!formData.oabNumber) {
      alert('Por favor, informe seu número de inscrição na OAB.');
      return;
    }
    setSubmittingOnboarding(true);
    setOnboardingSuccessMessage('');
    try {
      await onboardingApi.submitLawyerOnboarding({
        oabNumber: formData.oabNumber,
        oabState: formData.oabState || 'SP',
        oabExpiryDate: formData.oabExpiryDate,
        jurisdictionStates: formData.jurisdictionStates || [formData.oabState || 'SP'],
        documentAttachmentPath: documentAttachment,
      });
      const updatedUser = {
        ...formData,
        verificationStatus: 'PENDING' as VerificationStatus,
        verifiedOab: false,
      };
      setFormData(updatedUser);
      updateLawyerProfile(updatedUser);
      setOnboardingSuccessMessage('Dados e documentos enviados com sucesso! Seu cadastro está em análise pela equipe de compliance (PENDING).');
      setTimeout(() => setOnboardingSuccessMessage(''), 5000);
    } catch (err: any) {
      console.error('Error submitting onboarding:', err);
      alert('Erro ao submeter verificação da OAB. Tente novamente.');
    } finally {
      setSubmittingOnboarding(false);
    }
  };

  // Helper Array Reorder
  const moveItem = <T,>(arr: T[], index: number, direction: 'up' | 'down'): T[] => {
    const newArr = [...arr];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newArr.length) return newArr;
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;
    return newArr;
  };

  // Specialty CRUD
  const addSpecialtyDetail = () => {
    const newSpec: LawyerSpecialtyDetail = {
      id: `sd_${Date.now()}`,
      name: 'Nova Especialidade Jurídica',
      yearsExperience: 3,
      masteryLevel: 'Avançado'
    };
    setFormData(prev => ({ ...prev, specialtyDetails: [...(prev.specialtyDetails || []), newSpec] }));
  };

  const removeSpecialtyDetail = (id: string) => {
    setFormData(prev => ({ ...prev, specialtyDetails: (prev.specialtyDetails || []).filter(s => s.id !== id) }));
  };

  // Skill CRUD
  const addSkillDetail = () => {
    const newSkill: LawyerSkillDetail = {
      id: `sk_${Date.now()}`,
      name: 'Nova Competência / Habilidade',
      endorsementsCount: 1
    };
    setFormData(prev => ({ ...prev, skillDetails: [...(prev.skillDetails || []), newSkill] }));
  };

  const removeSkillDetail = (id: string) => {
    setFormData(prev => ({ ...prev, skillDetails: (prev.skillDetails || []).filter(s => s.id !== id) }));
  };

  // Education CRUD
  const addEducation = () => {
    const newEdu: Education = {
      id: `ed_${Date.now()}`,
      university: 'Universidade / Faculdade',
      course: 'Curso / Especialização',
      degree: 'Pós-graduação',
      year: new Date().getFullYear().toString()
    };
    setFormData(prev => ({ ...prev, education: [...(prev.education || []), newEdu] }));
  };

  const removeEducation = (id: string) => {
    setFormData(prev => ({ ...prev, education: (prev.education || []).filter(e => e.id !== id) }));
  };

  // Work Experience CRUD
  const addWorkExperience = () => {
    const newWork: WorkExperience = {
      id: `we_${Date.now()}`,
      company: 'Empresa / Escritório',
      role: 'Cargo / Atuação',
      period: `${new Date().getFullYear() - 2} - Presente`,
      description: 'Descrição das atividades e realizações jurídicas.'
    };
    setFormData(prev => ({ ...prev, workExperience: [...(prev.workExperience || []), newWork] }));
  };

  const removeWorkExperience = (id: string) => {
    setFormData(prev => ({ ...prev, workExperience: (prev.workExperience || []).filter(w => w.id !== id) }));
  };

  // Certificates CRUD
  const addCertificate = () => {
    const newCert: Certificate = {
      id: `cert_${Date.now()}`,
      name: 'Novo Certificado / Cursos de Extensão',
      institution: 'Instituição de Ensino / Órgão',
      year: new Date().getFullYear().toString(),
      fileUrl: '#',
      fileType: 'PDF'
    };
    setFormData(prev => ({ ...prev, certificates: [...(prev.certificates || []), newCert] }));
  };

  const removeCertificate = (id: string) => {
    setFormData(prev => ({ ...prev, certificates: (prev.certificates || []).filter(c => c.id !== id) }));
  };

  // Languages CRUD
  const addLanguage = () => {
    const newLang: Language = {
      id: `lang_${Date.now()}`,
      language: 'Idioma (ex: Inglês)',
      level: 'Avançado'
    };
    setFormData(prev => ({ ...prev, languages: [...(prev.languages || []), newLang] }));
  };

  const removeLanguage = (id: string) => {
    setFormData(prev => ({ ...prev, languages: (prev.languages || []).filter(l => l.id !== id) }));
  };

  // Portfolio CRUD
  const addPortfolio = () => {
    const newItem = {
      id: `port_${Date.now()}`,
      title: 'Novo Projeto / Caso de Sucesso',
      category: 'Parecer Técnico',
      description: 'Breve resumo do caso, resultado obtido e relevância jurídica.',
      date: new Date().getFullYear().toString(),
      fileUrl: '#'
    };
    setFormData(prev => ({ ...prev, portfolio: [...(prev.portfolio || []), newItem] }));
  };

  const removePortfolio = (id: string) => {
    setFormData(prev => ({ ...prev, portfolio: (prev.portfolio || []).filter(p => p.id !== id) }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-foreground w-full">
      
      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>Perfil profissional atualizado com sucesso!</span>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar */}
        <div className="bg-card rounded-3xl border border-border/80 p-3 shadow-xs h-fit space-y-1">
          <button
            type="button"
            onClick={() => setActiveTabSection('pessoal')}
            className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTabSection === 'pessoal' ? 'bg-emerald-600 text-white shadow-xs' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Dados Pessoais & OAB</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSection('bio')}
            className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTabSection === 'bio' ? 'bg-emerald-600 text-white shadow-xs' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>2. Biografia & Resumo</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSection('especialidades')}
            className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTabSection === 'especialidades' ? 'bg-emerald-600 text-white shadow-xs' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>3. Especializações</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSection('competencias')}
            className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTabSection === 'competencias' ? 'bg-emerald-600 text-white shadow-xs' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>4. Competências</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSection('formacao')}
            className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTabSection === 'formacao' ? 'bg-emerald-600 text-white shadow-xs' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>5. Formação Acadêmica</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSection('experiencia')}
            className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTabSection === 'experiencia' ? 'bg-emerald-600 text-white shadow-xs' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>6. Experiência Profissional</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSection('certificados')}
            className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTabSection === 'certificados' ? 'bg-emerald-600 text-white shadow-xs' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>7. Certificados & Cursos</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSection('idiomas')}
            className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTabSection === 'idiomas' ? 'bg-emerald-600 text-white shadow-xs' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>8. Idiomas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSection('portfolio')}
            className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTabSection === 'portfolio' ? 'bg-emerald-600 text-white shadow-xs' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>9. Portfólio & Publicações</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSection('redes')}
            className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTabSection === 'redes' ? 'bg-emerald-600 text-white shadow-xs' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>10. Redes Sociais & Contato</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTabSection('disponibilidade')}
            className={`w-full p-2.5 rounded-xl text-left text-xs font-bold flex items-center gap-2.5 transition-all cursor-pointer ${
              activeTabSection === 'disponibilidade' ? 'bg-emerald-600 text-white shadow-xs' : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>11. Disponibilidade & Valores</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="lg:col-span-3 bg-card rounded-3xl border border-border/80 p-6 sm:p-8 shadow-xs">
          
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* 1. Dados Pessoais & OAB */}
            {activeTabSection === 'pessoal' && (
              <div className="space-y-6 animate-in fade-in">
                
                {/* Onboarding Success Banner */}
                {onboardingSuccessMessage && (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-800 text-xs font-bold animate-in fade-in">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{onboardingSuccessMessage}</span>
                  </div>
                )}

                {/* Verification Status & Homologation Card */}
                <div className="p-5 rounded-2xl bg-muted/40 border border-border/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${
                        formData.verificationStatus === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/50 dark:border-emerald-800'
                          : formData.verificationStatus === 'PENDING'
                          ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/50 dark:border-amber-800'
                          : formData.verificationStatus === 'REJECTED' || formData.verificationStatus === 'SUSPENDED' || formData.verificationStatus === 'EXPIRED'
                          ? 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/50 dark:border-rose-800'
                          : 'bg-muted text-muted-foreground border-border'
                      }`}>
                        {formData.verificationStatus === 'VERIFIED' ? (
                          <ShieldCheck className="w-5 h-5" />
                        ) : formData.verificationStatus === 'PENDING' ? (
                          <AlertCircle className="w-5 h-5" />
                        ) : (
                          <ShieldAlert className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                          Status de Homologação Cadastral
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                            formData.verificationStatus === 'VERIFIED'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                              : formData.verificationStatus === 'PENDING'
                              ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                              : formData.verificationStatus === 'REJECTED' || formData.verificationStatus === 'SUSPENDED' || formData.verificationStatus === 'EXPIRED'
                              ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}>
                            {formData.verificationStatus === 'VERIFIED'
                              ? 'OAB Verificada'
                              : formData.verificationStatus === 'PENDING'
                              ? 'OAB Em Análise'
                              : formData.verificationStatus === 'REJECTED'
                              ? 'Cadastro Rejeitado'
                              : formData.verificationStatus === 'SUSPENDED'
                              ? 'OAB Suspensa'
                              : formData.verificationStatus === 'EXPIRED'
                              ? 'OAB Expirada'
                              : 'Cadastro Incompleto (DRAFT)'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={submittingOnboarding}
                      onClick={handleSubmitVerification}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
                    >
                      <UploadCloud className="w-4 h-4" />
                      {submittingOnboarding ? 'Enviando...' : 'Enviar p/ Homologação OAB'}
                    </button>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {formData.verificationStatus === 'VERIFIED'
                      ? 'Suas credenciais estão ativas e regularizadas. Você está apto a enviar propostas para todas as demandas e executar serviços com garantia Escrow.'
                      : formData.verificationStatus === 'PENDING'
                      ? 'Nossa equipe jurídica está validando seu número de inscrição, certidão de regularidade e estados de jurisdição. O prazo médio de análise é de poucas horas.'
                      : formData.verificationStatus === 'EXPIRED'
                      ? 'A certidão da OAB anexada atingiu o prazo de validade. Atualize a data de expiração e anexe o documento renovado para reativar o envio de propostas.'
                      : 'Preencha o número da OAB, estado principal, data de validade, selecione as UFs de atuação suplementar e anexe a certidão para habilitar o envio de propostas.'}
                  </p>
                </div>

                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider pb-2 border-b border-border/50 flex items-center gap-2">
                  <User className="w-4 h-4 text-emerald-600" />
                  Dados Pessoais e Credenciais da OAB
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Nome Completo</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:bg-card focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Especialização Principal (Título do Cabeçalho)</label>
                    <input
                      type="text"
                      value={formData.primarySpecialty}
                      onChange={(e) => setFormData({ ...formData, primarySpecialty: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:bg-card focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Número de Inscrição da OAB</label>
                    <input
                      type="text"
                      placeholder="Ex: 123456"
                      value={formData.oabNumber}
                      onChange={(e) => setFormData({ ...formData, oabNumber: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:bg-card focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">UF Principal da OAB</label>
                    <select
                      value={formData.oabState}
                      onChange={(e) => {
                        const newUf = e.target.value;
                        const currStates = formData.jurisdictionStates || [];
                        const updated = currStates.includes(newUf) ? currStates : [newUf, ...currStates];
                        setFormData({ ...formData, oabState: newUf, jurisdictionStates: updated });
                      }}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:bg-card focus:outline-none focus:border-emerald-600"
                    >
                      {BRAZILIAN_UFS.map(uf => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Data de Validade / Expiração da Certidão OAB</label>
                    <input
                      type="date"
                      value={formData.oabExpiryDate || ''}
                      onChange={(e) => setFormData({ ...formData, oabExpiryDate: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:bg-card focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Cidade</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:bg-card focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  {/* Estados de Jurisdição Suplementar (Tag Selector) */}
                  <div className="sm:col-span-2 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-muted-foreground">
                        Estados de Atuação & Jurisdição Suplementar (UFs)
                      </label>
                      <span className="text-[11px] text-muted-foreground">
                        {(formData.jurisdictionStates || []).length} UF(s) selecionada(s)
                      </span>
                    </div>
                    <div className="p-3 bg-background border border-border rounded-2xl flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
                      {BRAZILIAN_UFS.map(uf => {
                        const isSelected = (formData.jurisdictionStates || []).includes(uf) || formData.oabState === uf;
                        return (
                          <button
                            type="button"
                            key={uf}
                            onClick={() => toggleJurisdictionState(uf)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-card text-muted-foreground border border-border/80 hover:bg-muted'
                            }`}
                          >
                            {uf}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Document Upload Attachment Path */}
                  <div className="sm:col-span-2 space-y-2">
                    <label className="block text-xs font-semibold text-muted-foreground">
                      Anexo da Certidão / Comprovante de Regularidade da OAB
                    </label>
                    <div className="p-4 bg-background border border-dashed border-border rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
                          <FileBadge2 className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground font-mono">{documentAttachment}</p>
                          <p className="text-[11px] text-muted-foreground">Documento digitalizado em PDF autenticado (máx 15MB)</p>
                        </div>
                      </div>
                      <label className="px-4 py-2 rounded-xl bg-card border border-border text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer flex items-center gap-1.5">
                        <Upload className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Substituir Arquivo</span>
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setDocumentAttachment(e.target.files[0].name);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Estado / País</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground"
                        placeholder="UF"
                      />
                      <input
                        type="text"
                        value={formData.country || 'Brasil'}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground"
                        placeholder="País"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Telefone / WhatsApp Profissional</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">E-mail de Contato</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">URL da Foto de Perfil / Avatar</label>
                    <div className="flex gap-3 items-center">
                      <img src={formData.avatarUrl} alt="Avatar Preview" className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/20" />
                      <input
                        type="text"
                        value={formData.avatarUrl}
                        onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                        className="flex-1 bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Biografia */}
            {activeTabSection === 'bio' && (
              <div className="space-y-5 animate-in fade-in">
                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider pb-2 border-b border-border/50 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  Apresentação & Biografia Completa
                </h3>

                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">
                    Resumo do Perfil e Apresentação para Clientes (Suporta formatação e parágrafos)
                  </label>
                  <textarea
                    rows={12}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full bg-background border border-border rounded-2xl p-4 text-xs text-foreground leading-relaxed focus:bg-card focus:outline-none focus:border-emerald-600 font-sans"
                  />
                </div>
              </div>
            )}

            {/* 3. Especializações (CRUD + Reordenar + Anos de Experiência) */}
            {activeTabSection === 'especialidades' && (
              <div className="space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <div>
                    <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-600" />
                      Especializações Jurídicas
                    </h3>
                    <p className="text-xs text-muted-foreground/90 mt-0.5">Adicione, edite, exclua e reordene suas especialidades e tempo de atuação.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addSpecialtyDetail}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Área
                  </button>
                </div>

                <div className="space-y-3">
                  {(formData.specialtyDetails || []).map((sd, idx) => (
                    <div key={sd.id} className="p-4 rounded-2xl bg-background border border-border/80 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                        <div>
                          <label className="block text-[11px] font-semibold text-muted-foreground/90 mb-1">Área / Especialidade</label>
                          <input
                            type="text"
                            value={sd.name}
                            onChange={(e) => {
                              const newArr = [...(formData.specialtyDetails || [])];
                              newArr[idx].name = e.target.value;
                              setFormData({ ...formData, specialtyDetails: newArr });
                            }}
                            className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-muted-foreground/90 mb-1">Anos de Experiência</label>
                          <input
                            type="number"
                            value={sd.yearsExperience}
                            onChange={(e) => {
                              const newArr = [...(formData.specialtyDetails || [])];
                              newArr[idx].yearsExperience = Number(e.target.value);
                              setFormData({ ...formData, specialtyDetails: newArr });
                            }}
                            className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-muted-foreground/90 mb-1">Nível de Domínio</label>
                          <select
                            value={sd.masteryLevel}
                            onChange={(e) => {
                              const newArr = [...(formData.specialtyDetails || [])];
                              newArr[idx].masteryLevel = e.target.value as any;
                              setFormData({ ...formData, specialtyDetails: newArr });
                            }}
                            className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground"
                          >
                            <option value="Iniciante">Iniciante</option>
                            <option value="Intermediário">Intermediário</option>
                            <option value="Avançado">Avançado</option>
                            <option value="Especialista">Especialista</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-border/60">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              const reordered = moveItem(formData.specialtyDetails || [], idx, 'up');
                              setFormData({ ...formData, specialtyDetails: reordered });
                            }}
                            disabled={idx === 0}
                            className="p-1.5 rounded-lg bg-card border border-border text-muted-foreground/90 hover:bg-muted disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const reordered = moveItem(formData.specialtyDetails || [], idx, 'down');
                              setFormData({ ...formData, specialtyDetails: reordered });
                            }}
                            disabled={idx === (formData.specialtyDetails || []).length - 1}
                            className="p-1.5 rounded-lg bg-card border border-border text-muted-foreground/90 hover:bg-muted disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeSpecialtyDetail(sd.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Competências / Habilidades (CRUD + Reordenar) */}
            {activeTabSection === 'competencias' && (
              <div className="space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <div>
                    <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      Competências & Habilidades Práticas
                    </h3>
                    <p className="text-xs text-muted-foreground/90 mt-0.5">Crie, altere, remova e reordene habilidades específicas exigidas nos projetos.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addSkillDetail}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Habilidade
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(formData.skillDetails || []).map((sk, idx) => (
                    <div key={sk.id} className="p-3.5 rounded-2xl bg-background border border-border flex items-center gap-3 justify-between">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={sk.name}
                          onChange={(e) => {
                            const newArr = [...(formData.skillDetails || [])];
                            newArr[idx].name = e.target.value;
                            setFormData({ ...formData, skillDetails: newArr });
                          }}
                          className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-foreground font-semibold"
                        />
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const reordered = moveItem(formData.skillDetails || [], idx, 'up');
                            setFormData({ ...formData, skillDetails: reordered });
                          }}
                          disabled={idx === 0}
                          className="p-1 rounded-lg bg-card border border-border text-muted-foreground/90 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const reordered = moveItem(formData.skillDetails || [], idx, 'down');
                            setFormData({ ...formData, skillDetails: reordered });
                          }}
                          disabled={idx === (formData.skillDetails || []).length - 1}
                          className="p-1 rounded-lg bg-card border border-border text-muted-foreground/90 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeSkillDetail(sk.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer ml-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Formação Acadêmica */}
            {activeTabSection === 'formacao' && (
              <div className="space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-600" />
                    Formação Acadêmica & Diplomas
                  </h3>
                  <button
                    type="button"
                    onClick={addEducation}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Formação
                  </button>
                </div>

                <div className="space-y-3">
                  {(formData.education || []).map((edu, idx) => (
                    <div key={edu.id} className="p-4 rounded-2xl bg-background border border-border space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-muted-foreground/90 mb-1">Instituição de Ensino</label>
                          <input
                            type="text"
                            value={edu.university}
                            onChange={(e) => {
                              const newArr = [...(formData.education || [])];
                              newArr[idx].university = e.target.value;
                              setFormData({ ...formData, education: newArr });
                            }}
                            className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-muted-foreground/90 mb-1">Curso / Habilitação</label>
                          <input
                            type="text"
                            value={edu.course}
                            onChange={(e) => {
                              const newArr = [...(formData.education || [])];
                              newArr[idx].course = e.target.value;
                              setFormData({ ...formData, education: newArr });
                            }}
                            className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-muted-foreground/90 mb-1">Grau Acadêmico</label>
                          <select
                            value={edu.degree}
                            onChange={(e) => {
                              const newArr = [...(formData.education || [])];
                              newArr[idx].degree = e.target.value;
                              setFormData({ ...formData, education: newArr });
                            }}
                            className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground"
                          >
                            <option value="Bacharelado">Bacharelado</option>
                            <option value="Pós-graduação">Pós-graduação</option>
                            <option value="Mestrado">Mestrado</option>
                            <option value="Doutorado">Doutorado</option>
                            <option value="LL.M.">LL.M.</option>
                            <option value="Especialização">Especialização</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-muted-foreground/90 mb-1">Ano de Conclusão</label>
                          <input
                            type="text"
                            value={edu.year}
                            onChange={(e) => {
                              const newArr = [...(formData.education || [])];
                              newArr[idx].year = e.target.value;
                              setFormData({ ...formData, education: newArr });
                            }}
                            className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => removeEducation(edu.id)}
                          className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remover Formação
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Experiência Profissional */}
            {activeTabSection === 'experiencia' && (
              <div className="space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-emerald-600" />
                    Experiência Profissional & Atuação
                  </h3>
                  <button
                    type="button"
                    onClick={addWorkExperience}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Experiência
                  </button>
                </div>

                <div className="space-y-3">
                  {(formData.workExperience || []).map((we, idx) => (
                    <div key={we.id} className="p-4 rounded-2xl bg-background border border-border space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-muted-foreground/90 mb-1">Empresa / Escritório</label>
                          <input
                            type="text"
                            value={we.company}
                            onChange={(e) => {
                              const newArr = [...(formData.workExperience || [])];
                              newArr[idx].company = e.target.value;
                              setFormData({ ...formData, workExperience: newArr });
                            }}
                            className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-muted-foreground/90 mb-1">Cargo / Função</label>
                          <input
                            type="text"
                            value={we.role}
                            onChange={(e) => {
                              const newArr = [...(formData.workExperience || [])];
                              newArr[idx].role = e.target.value;
                              setFormData({ ...formData, workExperience: newArr });
                            }}
                            className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-muted-foreground/90 mb-1">Período</label>
                          <input
                            type="text"
                            value={we.period}
                            onChange={(e) => {
                              const newArr = [...(formData.workExperience || [])];
                              newArr[idx].period = e.target.value;
                              setFormData({ ...formData, workExperience: newArr });
                            }}
                            className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-muted-foreground/90 mb-1">Descrição das Realizações</label>
                        <textarea
                          rows={2}
                          value={we.description}
                          onChange={(e) => {
                            const newArr = [...(formData.workExperience || [])];
                            newArr[idx].description = e.target.value;
                            setFormData({ ...formData, workExperience: newArr });
                          }}
                          className="w-full bg-card border border-border rounded-xl p-2.5 text-xs text-foreground"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeWorkExperience(we.id)}
                          className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Excluir Experiência
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 7. Certificados */}
            {activeTabSection === 'certificados' && (
              <div className="space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Certificados & Cursos de Extensão
                  </h3>
                  <button
                    type="button"
                    onClick={addCertificate}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Certificado
                  </button>
                </div>

                <div className="space-y-3">
                  {(formData.certificates || []).map((cert, idx) => (
                    <div key={cert.id} className="p-4 rounded-2xl bg-background border border-border space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-muted-foreground/90 mb-1">Nome do Certificado</label>
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => {
                              const newArr = [...(formData.certificates || [])];
                              newArr[idx].name = e.target.value;
                              setFormData({ ...formData, certificates: newArr });
                            }}
                            className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-muted-foreground/90 mb-1">Ano</label>
                          <input
                            type="text"
                            value={cert.year}
                            onChange={(e) => {
                              const newArr = [...(formData.certificates || [])];
                              newArr[idx].year = e.target.value;
                              setFormData({ ...formData, certificates: newArr });
                            }}
                            className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-muted-foreground/90 mb-1">Instituição Emissora</label>
                          <input
                            type="text"
                            value={cert.institution}
                            onChange={(e) => {
                              const newArr = [...(formData.certificates || [])];
                              newArr[idx].institution = e.target.value;
                              setFormData({ ...formData, certificates: newArr });
                            }}
                            className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-muted-foreground/90 mb-1">URL / Link do Comprovante</label>
                          <input
                            type="text"
                            value={cert.fileUrl || '#'}
                            onChange={(e) => {
                              const newArr = [...(formData.certificates || [])];
                              newArr[idx].fileUrl = e.target.value;
                              setFormData({ ...formData, certificates: newArr });
                            }}
                            className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground font-mono"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removeCertificate(cert.id)}
                          className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Excluir Certificado
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. Idiomas */}
            {activeTabSection === 'idiomas' && (
              <div className="space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    Idiomas & Fluência
                  </h3>
                  <button
                    type="button"
                    onClick={addLanguage}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Idioma
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(formData.languages || []).map((lang, idx) => (
                    <div key={lang.id} className="p-3.5 rounded-2xl bg-background border border-border flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={lang.language}
                          onChange={(e) => {
                            const newArr = [...(formData.languages || [])];
                            newArr[idx].language = e.target.value;
                            setFormData({ ...formData, languages: newArr });
                          }}
                          className="w-full bg-card border border-border rounded-xl px-3 py-1.5 text-xs text-foreground font-semibold"
                        />
                      </div>

                      <div className="w-32">
                        <select
                          value={lang.level}
                          onChange={(e) => {
                            const newArr = [...(formData.languages || [])];
                            newArr[idx].level = e.target.value as any;
                            setFormData({ ...formData, languages: newArr });
                          }}
                          className="w-full bg-card border border-border rounded-xl px-2 py-1.5 text-xs text-foreground"
                        >
                          <option value="Básico">Básico</option>
                          <option value="Intermediário">Intermediário</option>
                          <option value="Avançado">Avançado</option>
                          <option value="Fluente">Fluente</option>
                          <option value="Nativo">Nativo</option>
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeLanguage(lang.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 9. Portfólio & Publicações */}
            {activeTabSection === 'portfolio' && (
              <div className="space-y-5 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-emerald-600" />
                    Portfólio Profissional, Pareceres & Artigos
                  </h3>
                  <button
                    type="button"
                    onClick={addPortfolio}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Item
                  </button>
                </div>

                <div className="space-y-3">
                  {(formData.portfolio || []).map((port, idx) => (
                    <div key={port.id} className="p-4 rounded-2xl bg-background border border-border space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-semibold text-muted-foreground/90 mb-1">Título do Trabalho / Artigo / Parecer</label>
                          <input
                            type="text"
                            value={port.title}
                            onChange={(e) => {
                              const newArr = [...(formData.portfolio || [])];
                              newArr[idx].title = e.target.value;
                              setFormData({ ...formData, portfolio: newArr });
                            }}
                            className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-semibold text-muted-foreground/90 mb-1">Categoria</label>
                          <select
                            value={port.category}
                            onChange={(e) => {
                              const newArr = [...(formData.portfolio || [])];
                              newArr[idx].category = e.target.value;
                              setFormData({ ...formData, portfolio: newArr });
                            }}
                            className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground"
                          >
                            <option value="Parecer Técnico">Parecer Técnico</option>
                            <option value="Contrato">Contrato</option>
                            <option value="Artigo">Artigo</option>
                            <option value="Peça Processual">Peça Processual</option>
                            <option value="Caso de Sucesso">Caso de Sucesso</option>
                            <option value="Publicação">Publicação</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-muted-foreground/90 mb-1">Descrição</label>
                        <textarea
                          rows={2}
                          value={port.description}
                          onChange={(e) => {
                            const newArr = [...(formData.portfolio || [])];
                            newArr[idx].description = e.target.value;
                            setFormData({ ...formData, portfolio: newArr });
                          }}
                          className="w-full bg-card border border-border rounded-xl p-2.5 text-xs text-foreground"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => removePortfolio(port.id)}
                          className="text-xs font-semibold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Excluir do Portfólio
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 10. Redes Sociais & Contato */}
            {activeTabSection === 'redes' && (
              <div className="space-y-5 animate-in fade-in">
                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider pb-2 border-b border-border/50 flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-emerald-600" />
                  Redes Sociais & Website do Escritório
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Nome do Escritório / Empresa</label>
                    <input
                      type="text"
                      value={formData.companyName || ''}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">LinkedIn URL</label>
                    <input
                      type="text"
                      value={formData.socialLinks?.linkedin || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialLinks: { ...(formData.socialLinks || {}), linkedin: e.target.value }
                      })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Website Oficial / Site</label>
                    <input
                      type="text"
                      value={formData.socialLinks?.website || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialLinks: { ...(formData.socialLinks || {}), website: e.target.value }
                      })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground"
                      placeholder="https://..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Instagram Profissional</label>
                    <input
                      type="text"
                      value={formData.socialLinks?.instagram || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        socialLinks: { ...(formData.socialLinks || {}), instagram: e.target.value }
                      })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 11. Disponibilidade & Honorários */}
            {activeTabSection === 'disponibilidade' && (
              <div className="space-y-5 animate-in fade-in">
                <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider pb-2 border-b border-border/50 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  Status de Disponibilidade, Honorários & Atendimento
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Status de Disponibilidade</label>
                    <select
                      value={formData.availability}
                      onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground"
                    >
                      <option value="Disponível Imadiatamente">Disponível Imediatamente</option>
                      <option value="Disponível em 24h">Disponível em 24h</option>
                      <option value="Ocupado / Sob Consulta">Ocupado / Sob Consulta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Tempo Médio de Resposta ao Cliente</label>
                    <input
                      type="text"
                      value={formData.avgResponseTime}
                      onChange={(e) => setFormData({ ...formData, avgResponseTime: e.target.value })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground"
                      placeholder="ex: < 25 minutos"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Valor do Honorário por Hora (R$)</label>
                    <input
                      type="number"
                      value={formData.hourlyRate}
                      onChange={(e) => setFormData({ ...formData, hourlyRate: Number(e.target.value) })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Estimativa de Honorário Fixo Médio (R$)</label>
                    <input
                      type="number"
                      value={formData.fixedRateEstimate}
                      onChange={(e) => setFormData({ ...formData, fixedRateEstimate: Number(e.target.value) })}
                      className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-mono font-bold"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-muted-foreground mb-2">Modalidades de Atendimento Aceitas</label>
                    <div className="flex flex-wrap gap-3">
                      {['Atendimento Remoto', 'Atendimento Presencial', 'Híbrido'].map(mod => {
                        const isChecked = (formData.serviceModalities || []).includes(mod);
                        return (
                          <button
                            type="button"
                            key={mod}
                            onClick={() => {
                              const current = formData.serviceModalities || [];
                              const updated = isChecked ? current.filter(m => m !== mod) : [...current, mod];
                              setFormData({ ...formData, serviceModalities: updated });
                            }}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                              isChecked
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-background text-muted-foreground border-border hover:bg-muted'
                            }`}
                          >
                            {isChecked ? <Check className="w-3.5 h-3.5" /> : null}
                            <span>{mod}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Submit Button */}
            <div className="pt-6 border-t border-border/50 flex items-center justify-end gap-3">
              <button
                type="submit"
                className="px-8 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                Salvar Alterações do Perfil Público
              </button>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
};
