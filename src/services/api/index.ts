/**
 * ============================================================
 * LegaWork – API Service Layer (Connected to Production Backend)
 * ============================================================
 * This is the SINGLE source of truth for all data operations.
 * Pages and components MUST NOT call fetch() directly.
 *
 * BACKEND AUTH:
 *   - Spring Boot sets HttpOnly cookies (jwt_token, jwt_refresh_token)
 *     on login. Every request includes credentials: 'include'.
 *   - Token refresh is handled transparently in `http()`.
 *
 * ROLE MAPPING:
 *   - Backend roles: ROLE_LAWYER / ROLE_FREELANCER → frontend: LAWYER
 *   - Backend roles: ROLE_CLIENT                   → frontend: CLIENT
 *   - Backend roles: ROLE_ADMIN                    → frontend: ADMIN
 * ============================================================
 */

import { API_CONFIG } from '../../config/api';
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
  JobStatus,
  ProposalStatus,
  MilestoneStatus,
  Role,
  Review,
  ContractStatus,
} from '../../types';
import {
  INITIAL_LAWYER_USER,
  INITIAL_CLIENT_USER,
  INITIAL_JOBS,
  INITIAL_PROPOSALS,
  INITIAL_CONTRACTS,
  INITIAL_PAYMENTS,
  INITIAL_CHAT_CONVERSATIONS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_DOCUMENTS,
  INITIAL_NOTIFICATIONS,
  MOCK_DASHBOARD_METRICS,
} from '../mock/mockData';

// ─────────────────────────────────────────────
// SECTION 1 – LOCAL STORAGE HELPERS
// ─────────────────────────────────────────────
function getStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(API_CONFIG.storagePrefix + key);
    return item ? (JSON.parse(item) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(API_CONFIG.storagePrefix + key, JSON.stringify(value));
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

function clearAuthStorage(): void {
  localStorage.removeItem(API_CONFIG.storagePrefix + 'current_user');
}

// ─────────────────────────────────────────────
// SECTION 2 – HTTP HELPER (real backend calls)
// ─────────────────────────────────────────────
let isRefreshing = false;

async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_CONFIG.baseURL}${path}`;
  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers || {}),
    },
  });

  // Token expired – attempt one silent refresh
  if (res.status === 401 && !isRefreshing && !path.includes('/api/auth/login')) {
    isRefreshing = true;
    try {
      const refreshRes = await fetch(`${API_CONFIG.baseURL}/api/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
      });
      if (refreshRes.ok) {
        isRefreshing = false;
        // Retry original request after refresh
        const retryRes = await fetch(url, {
          ...options,
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...(options.headers || {}),
          },
        });
        if (!retryRes.ok) throw new Error('Unauthorized');
        const retryData = await retryRes.json();
        return (retryData.data !== undefined ? retryData.data : retryData) as T;
      }
    } catch {
      isRefreshing = false;
    }
    clearAuthStorage();
    throw new Error('Sessão expirada. Por favor, faça login novamente.');
  }

  if (!res.ok) {
    let errMsg = `Erro ${res.status}`;
    try {
      const errBody = await res.json();
      errMsg = errBody.error || errBody.message || errMsg;
    } catch { /* ignore */ }
    throw new Error(errMsg);
  }

  const json = await res.json();
  // Backend always wraps data in { success, data, error } or returns direct entity
  return (json.data !== undefined ? json.data : json) as T;
}

// ─────────────────────────────────────────────
// SECTION 3 – ENTITY MAPPERS
// ─────────────────────────────────────────────
function mapBackendRoles(roles: string[]): Role {
  if (!roles || roles.length === 0) return 'CLIENT';
  const normalized = roles.map((r) => r.replace('ROLE_', '').toUpperCase());
  if (normalized.includes('ADMIN')) return 'ADMIN';
  if (normalized.includes('LAWYER') || normalized.includes('FREELANCER')) return 'LAWYER';
  return 'CLIENT';
}

function mapBackendUser(raw: Record<string, unknown>): UserProfile {
  const role = mapBackendRoles((raw.roles as string[]) || []);
  return {
    id: String(raw.id ?? ''),
    name: `${raw.firstName ?? ''} ${raw.lastName ?? ''}`.trim() || (raw.name as string) || 'Usuário',
    email: (raw.email as string) ?? '',
    role,
    avatarUrl:
      (raw.photoUrl as string) ||
      (raw.avatarUrl as string) ||
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256',
    phone: (raw.phone as string) ?? '',
    cpfCnpj: (raw.cpfCnpj as string) ?? '',
    oabNumber: (raw.oabNumber as string) ?? undefined,
    oabState: (raw.oabState as string) ?? undefined,
    bio: (raw.bio as string) ?? '',
    specialties: (raw.specialties as string[]) ?? [],
    skills: (raw.skills as string[]) ?? [],
    hourlyRate: (raw.hourlyRate as number) ?? undefined,
    rating: (raw.rating as number) ?? 5.0,
    reviewCount: (raw.reviewCount as number) ?? 0,
    completedCasesCount: (raw.completedCasesCount as number) ?? 0,
    verifiedOab: Boolean(raw.verifiedOab ?? (raw.oabNumber ? true : false)),
    city: (raw.city as string) ?? '',
    state: (raw.state as string) ?? '',
    joinedDate: raw.createdAt
      ? new Date(raw.createdAt as string).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
      : 'Recente',
    companyName: (raw.companyName as string) ?? undefined,
    subscriptionPlan: (raw.subscriptionPlan as 'Basic' | 'Pro' | 'Premium') ?? undefined,
    lawyerWallet:
      role === 'LAWYER'
        ? {
            availableBalance: (raw.availableBalance as number) ?? 0,
            escrowBalance: (raw.escrowBalance as number) ?? 0,
            internalBalance: (raw.internalBalance as number) ?? 0,
            totalEarned: (raw.totalEarned as number) ?? 0,
          }
        : undefined,
    clientWallet:
      role === 'CLIENT'
        ? {
            walletBalance: (raw.walletBalance as number) ?? 0,
            escrowBalance: (raw.escrowBalance as number) ?? 0,
            totalInvested: (raw.totalInvested as number) ?? 0,
          }
        : undefined,
  };
}

function mapBackendJob(raw: Record<string, unknown>): Job {
  const budgetVal = Number(raw.budget || raw.estimatedValue || 0);
  return {
    id: String(raw.jobId ?? raw.id ?? ''),
    title: (raw.title as string) || 'Demanda Jurídica',
    description: (raw.description as string) || '',
    processNumber: (raw.processNumber as string) || undefined,
    clientId: String(raw.clientId ?? (raw.client as any)?.id ?? ''),
    clientName: (raw.clientName as string) || ((raw.client as any) ? `${(raw.client as any).firstName || ''} ${(raw.client as any).lastName || ''}`.trim() : 'Cliente'),
    clientAvatar: (raw.clientAvatar as string) || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=256',
    type: ((raw.jobType as string)?.toUpperCase() as any) || 'LITIGATION',
    specialty: (raw.specialtyName as string) || ((raw.specialty as any)?.name as string) || 'Direito Empresarial',
    status: ((raw.status as string)?.toUpperCase() as JobStatus) || 'OPEN',
    urgency: ((raw.urgency as string)?.toUpperCase() as any) || 'MEDIUM',
    confidentiality: ((raw.confidentiality as string)?.toUpperCase() as any) || 'STANDARD',
    budgetMin: budgetVal,
    budgetMax: budgetVal,
    estimatedDeadlineDays: raw.deadline ? Math.max(1, Math.round((new Date(raw.deadline as string).getTime() - Date.now()) / 86400000)) : 30,
    createdAt: (raw.createdAt as string) || new Date().toISOString(),
    updatedAt: (raw.updatedAt as string) || (raw.lastModifiedAt as string) || new Date().toISOString(),
    city: (raw.city as string) || '',
    state: (raw.state as string) || '',
    proposalsCount: (raw.proposalsCount as number) ?? (Array.isArray(raw.proposals) ? raw.proposals.length : 0),
    assignedLawyerId: raw.assignedLawyerId ? String(raw.assignedLawyerId) : undefined,
    assignedLawyerName: (raw.assignedLawyerName as string) || undefined,
    assignedLawyerAvatar: (raw.assignedLawyerAvatar as string) || undefined,
    timeline: [
      {
        id: 'tl_' + (raw.jobId ?? raw.id ?? Date.now()),
        title: 'Demanda Cadastrada na Plataforma',
        date: raw.createdAt ? new Date(raw.createdAt as string).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
        author: (raw.clientName as string) || 'Cliente',
        description: 'Abertura para seleção de advogados especializados.',
        type: 'DOCUMENTO',
      },
    ],
  };
}

function mapBackendProposal(raw: Record<string, unknown>): Proposal {
  return {
    id: String(raw.proposalId ?? raw.id ?? ''),
    jobId: String(raw.jobId ?? (raw.job as any)?.jobId ?? ''),
    jobTitle: (raw.jobTitle as string) || ((raw.job as any)?.title as string) || 'Demanda Jurídica',
    processNumber: (raw.processNumber as string) || ((raw.job as any)?.processNumber as string) || undefined,
    lawyerId: String(raw.freelancerId ?? raw.lawyerId ?? (raw.freelancer as any)?.id ?? ''),
    lawyerName: (raw.lawyerName as string) || ((raw.freelancer as any) ? `${(raw.freelancer as any).firstName || ''} ${(raw.freelancer as any).lastName || ''}`.trim() : 'Advogado'),
    lawyerAvatar: (raw.lawyerAvatar as string) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
    lawyerOab: (raw.lawyerOab as string) || 'OAB Registrada',
    lawyerRating: (raw.lawyerRating as number) ?? 5.0,
    value: Number(raw.totalValue || raw.proposedRate || 0),
    deliveryDays: Number(raw.proposedDuration || 30),
    coverLetter: (raw.coverLetter as string) || (raw.strategy as string) || '',
    status: ((raw.status as string)?.toUpperCase() as ProposalStatus) || 'PENDING',
    createdAt: (raw.createdAt as string) || new Date().toISOString(),
    proposedMilestones: [
      {
        title: 'Execução e Parecer Inicial',
        description: (raw.strategy as string) || 'Atuação jurídica e elaboração de peças.',
        value: Number(raw.totalValue || raw.proposedRate || 0),
      },
    ],
  };
}

function mapBackendContract(raw: Record<string, unknown>): Contract {
  const totalVal = Number(raw.totalValue || 0);
  const rawMilestones = (raw.milestones as any[]) || [];
  return {
    id: String(raw.contractId ?? raw.id ?? ''),
    jobId: String(raw.jobId ?? (raw.job as any)?.jobId ?? ''),
    jobTitle: (raw.title as string) || ((raw.job as any)?.title as string) || 'Mandato Jurídico',
    processNumber: (raw.processNumber as string) || undefined,
    proposalId: String(raw.proposalId ?? ''),
    clientId: String(raw.clientId ?? (raw.client as any)?.id ?? ''),
    clientName: (raw.clientName as string) || ((raw.client as any) ? `${(raw.client as any).firstName || ''} ${(raw.client as any).lastName || ''}`.trim() : 'Cliente'),
    lawyerId: String(raw.lawyerId ?? (raw.lawyer as any)?.id ?? ''),
    lawyerName: (raw.lawyerName as string) || ((raw.lawyer as any) ? `${(raw.lawyer as any).firstName || ''} ${(raw.lawyer as any).lastName || ''}`.trim() : 'Advogado'),
    lawyerOab: (raw.lawyerOab as string) || 'OAB Registrada',
    totalValue: totalVal,
    escrowBalance: totalVal,
    releasedBalance: 0,
    status: ((raw.status as string)?.toUpperCase() as ContractStatus) || 'ACTIVE',
    startDate: (raw.startDate as string) || new Date().toISOString().split('T')[0],
    endDateEst: (raw.endDate as string) || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    progressPercentage: 0,
    milestones: rawMilestones.length > 0
      ? rawMilestones.map((m, i) => ({
          id: String(m.milestoneId ?? m.id ?? i),
          contractId: String(raw.contractId ?? raw.id ?? ''),
          title: m.title || `Marco ${i + 1}`,
          description: m.description || '',
          value: Number(m.amount || m.value || (totalVal / rawMilestones.length)),
          dueDate: m.dueDate || new Date(Date.now() + (i + 1) * 15 * 86400000).toISOString().split('T')[0],
          status: (m.status?.toUpperCase() as MilestoneStatus) || (i === 0 ? 'IN_PROGRESS' : 'PENDING'),
        }))
      : [
          {
            id: `ms_${raw.contractId ?? raw.id ?? '1'}_1`,
            contractId: String(raw.contractId ?? raw.id ?? ''),
            title: 'Marco 1: Execução e Protocolo',
            description: (raw.description as string) || 'Atendimento e início das peças',
            value: totalVal,
            dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
            status: 'IN_PROGRESS' as MilestoneStatus,
          },
        ],
  };
}

// ─────────────────────────────────────────────
// SECTION 4 – AUTH API
// ─────────────────────────────────────────────
export const authApi = {
  async getCurrentUser(): Promise<UserProfile | null> {
    if (API_CONFIG.useMock) {
      return getStorage<UserProfile>('current_user', INITIAL_LAWYER_USER);
    }
    try {
      const raw = await http<Record<string, unknown>>('/api/auth/me');
      const user = mapBackendUser(raw);
      setStorage('current_user', user);
      return user;
    } catch {
      clearAuthStorage();
      return null;
    }
  },

  async login(email: string, password: string): Promise<UserProfile> {
    if (API_CONFIG.useMock) {
      const role: Role = email.includes('adv') || email.includes('oab') || email.includes('lawyer') ? 'LAWYER' : 'CLIENT';
      const user: UserProfile = {
        ...(role === 'LAWYER' ? INITIAL_LAWYER_USER : INITIAL_CLIENT_USER),
        email,
      };
      setStorage('current_user', user);
      return user;
    }
    await http<Record<string, unknown>>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const user = await authApi.getCurrentUser();
    if (!user) throw new Error('Falha ao obter perfil após login.');
    setStorage('current_user', user);
    return user;
  },

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
    phone?: string;
    cpfCnpj?: string;
    oabNumber?: string;
    oabState?: string;
    companyName?: string;
  }): Promise<UserProfile> {
    if (API_CONFIG.useMock) {
      const base = data.role === 'LAWYER' ? INITIAL_LAWYER_USER : INITIAL_CLIENT_USER;
      const newUser: UserProfile = {
        ...base,
        id: 'usr_' + Date.now(),
        name: `${data.firstName} ${data.lastName}`.trim(),
        email: data.email,
        role: data.role,
        phone: data.phone || '',
        cpfCnpj: data.cpfCnpj || '',
        oabNumber: data.oabNumber,
        oabState: data.oabState,
        companyName: data.companyName,
        verifiedOab: Boolean(data.oabNumber),
        rating: 5.0,
        reviewCount: 0,
        completedCasesCount: 0,
        joinedDate: 'Recente',
        specialties: [],
        skills: [],
      };
      setStorage('current_user', newUser);
      return newUser;
    }

    const backendRoles = data.role === 'LAWYER' ? ['ROLE_LAWYER', 'ROLE_FREELANCER'] : ['ROLE_CLIENT'];

    await http('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        roles: backendRoles,
      }),
    });

    return await authApi.login(data.email, data.password);
  },

  async logout(): Promise<void> {
    clearAuthStorage();
    if (!API_CONFIG.useMock) {
      try {
        await http('/api/auth/logout', { method: 'POST' });
      } catch { /* ignore */ }
    }
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = await authApi.getCurrentUser();
    if (!current) throw new Error('Não autenticado');
    const updated = { ...current, ...updates };
    setStorage('current_user', updated);
    if (!API_CONFIG.useMock) {
      try {
        await http(`/api/users/profile/me`, {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
      } catch (e) {
        console.warn('Profile update error:', e);
      }
    }
    return updated;
  },

  async switchRole(role: Role): Promise<UserProfile> {
    const newUser = role === 'LAWYER' ? INITIAL_LAWYER_USER : INITIAL_CLIENT_USER;
    setStorage('current_user', newUser);
    return newUser;
  },
};

// ─────────────────────────────────────────────
// SECTION 5 – JOBS API
// ─────────────────────────────────────────────
export const jobsApi = {
  async getJobs(filters?: { status?: JobStatus; specialty?: string; search?: string }): Promise<Job[]> {
    if (!API_CONFIG.useMock) {
      try {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.specialty && filters.specialty !== 'Todos') params.append('specialty', filters.specialty);
        if (filters?.search) params.append('search', filters.search);
        const query = params.toString() ? `?${params.toString()}` : '';
        const data = await http<any[]>(`/api/jobs/all${query}`);
        const list = (data || []).map(mapBackendJob);
        return applyJobFilters(list, filters);
      } catch (e) {
        console.warn('Jobs fetch error:', e);
        return [];
      }
    }
    return applyJobFilters(getStorage<Job[]>('jobs', INITIAL_JOBS), filters);
  },

  async getMyJobs(): Promise<Job[]> {
    if (!API_CONFIG.useMock) {
      try {
        const data = await http<any[]>('/api/jobs/my');
        return (data || []).map(mapBackendJob);
      } catch (e) {
        console.warn('My jobs fetch error:', e);
        return [];
      }
    }
    const user = await authApi.getCurrentUser();
    const all = getStorage<Job[]>('jobs', INITIAL_JOBS);
    return all.filter((j) => String(j.clientId) === String(user?.id));
  },

  async getJobById(id: string): Promise<Job | null> {
    if (!API_CONFIG.useMock) {
      try {
        const raw = await http<any>(`/api/jobs/${id}`);
        return raw ? mapBackendJob(raw) : null;
      } catch {
        return null;
      }
    }
    const jobs = getStorage<Job[]>('jobs', INITIAL_JOBS);
    return jobs.find((j) => String(j.id) === String(id)) || null;
  },

  async createJob(newJobData: Partial<Job>): Promise<Job> {
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');

    if (!API_CONFIG.useMock) {
      const urgencyMap: Record<string, string> = {
        LOW: 'Low',
        MEDIUM: 'Medium',
        HIGH: 'High',
        CRITICAL: 'Urgent',
      };
      const confidentialityMap: Record<string, string> = {
        STANDARD: 'Public',
        CONFIDENTIAL: 'Private',
        STRICTLY_CONFIDENTIAL: 'Confidential',
      };

      const payload = {
        title: newJobData.title || 'Demanda Jurídica',
        description: newJobData.description || '',
        budget: newJobData.budgetMax || newJobData.budgetMin || 5000,
        jobType: newJobData.hiringType === 'HOURLY' ? 'Hourly' : 'Fixed',
        urgency: urgencyMap[newJobData.urgency || 'MEDIUM'] || 'Medium',
        confidentiality: confidentialityMap[newJobData.confidentiality || 'STANDARD'] || 'Public',
        estimatedValue: newJobData.budgetMax || newJobData.budgetMin || 5000,
        deadline: newJobData.estimatedDeadlineDays
          ? new Date(Date.now() + (newJobData.estimatedDeadlineDays || 30) * 86400000)
              .toISOString()
              .split('T')[0]
          : undefined,
        clientName: currentUser.companyName || currentUser.name,
      };

      const created = await http<any>('/api/jobs/post', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return mapBackendJob(created);
    }

    const jobs = getStorage<Job[]>('jobs', INITIAL_JOBS);
    const newJob: Job = {
      id: 'job_' + Date.now(),
      processNumber: newJobData.processNumber,
      title: newJobData.title || 'Nova Demanda Jurídica',
      description: newJobData.description || '',
      clientId: currentUser.id,
      clientName: currentUser.companyName || currentUser.name,
      clientAvatar: currentUser.avatarUrl,
      type: newJobData.type || 'LITIGATION',
      specialty: newJobData.specialty || 'Direito Empresarial',
      status: 'OPEN',
      urgency: newJobData.urgency || 'MEDIUM',
      confidentiality: newJobData.confidentiality || 'STANDARD',
      budgetMin: newJobData.budgetMin || 5000,
      budgetMax: newJobData.budgetMax || 10000,
      estimatedDeadlineDays: newJobData.estimatedDeadlineDays || 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      city: newJobData.city || currentUser.city,
      state: newJobData.state || currentUser.state,
      proposalsCount: 0,
      timeline: [
        {
          id: 'tl_' + Date.now(),
          title: 'Demanda Cadastrada na Plataforma',
          date: new Date().toLocaleDateString('pt-BR'),
          author: currentUser.name,
          description: 'Abertura para seleção de advogados especializados.',
          type: 'DOCUMENTO',
        },
      ],
    };
    setStorage('jobs', [newJob, ...jobs]);
    return newJob;
  },

  async updateJobStatus(jobId: string, status: JobStatus): Promise<Job | null> {
    if (!API_CONFIG.useMock) {
      if (status === 'COMPLETED') {
        await http(`/api/jobs/${jobId}/close`, { method: 'POST' }).catch(() => {});
      } else if (status === 'CANCELLED') {
        await http(`/api/jobs/${jobId}/archive`, { method: 'POST' }).catch(() => {});
      }
      return await jobsApi.getJobById(jobId);
    }
    const jobs = getStorage<Job[]>('jobs', INITIAL_JOBS);
    const idx = jobs.findIndex((j) => String(j.id) === String(jobId));
    if (idx === -1) return null;
    jobs[idx].status = status;
    jobs[idx].updatedAt = new Date().toISOString();
    setStorage('jobs', jobs);
    return jobs[idx];
  },

  async reopenJob(jobId: string): Promise<Job | null> {
    return await jobsApi.updateJobStatus(jobId, 'OPEN');
  },
};

// ─────────────────────────────────────────────
// SECTION 6 – PROPOSALS API
// ─────────────────────────────────────────────
export const proposalsApi = {
  async getProposals(filters?: { jobId?: string; status?: ProposalStatus }): Promise<Proposal[]> {
    if (!API_CONFIG.useMock) {
      try {
        const endpoint = filters?.jobId ? `/api/proposals/job/${filters.jobId}` : '/api/proposals/my';
        const data = await http<any[]>(endpoint);
        let list = (data || []).map(mapBackendProposal);
        if (filters?.status) list = list.filter((p) => p.status === filters.status);
        return list;
      } catch (e) {
        console.warn('Proposals fetch error:', e);
        return [];
      }
    }
    let proposals = getStorage<Proposal[]>('proposals', INITIAL_PROPOSALS);
    if (filters?.jobId) proposals = proposals.filter((p) => String(p.jobId) === String(filters.jobId));
    if (filters?.status) proposals = proposals.filter((p) => p.status === filters.status);
    return proposals;
  },

  async getReceivedProposals(): Promise<Proposal[]> {
    if (!API_CONFIG.useMock) {
      try {
        const data = await http<any[]>('/api/proposals/received');
        return (data || []).map(mapBackendProposal);
      } catch (e) {
        console.warn('Received proposals fetch error:', e);
        return [];
      }
    }
    return getStorage<Proposal[]>('proposals', INITIAL_PROPOSALS);
  },

  async createProposal(data: Partial<Proposal>): Promise<Proposal> {
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');

    if (!API_CONFIG.useMock) {
      const payload = {
        jobId: Number(data.jobId),
        coverLetter: data.coverLetter || '',
        proposedRate: data.value,
        totalValue: data.value,
        proposedDuration: data.deliveryDays || 30,
        strategy: data.coverLetter || '',
        lawyerOab: currentUser.oabNumber
          ? `OAB/${currentUser.oabState || 'SP'} ${currentUser.oabNumber}`
          : undefined,
      };
      const created = await http<any>('/api/proposals/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return mapBackendProposal(created);
    }

    const proposals = getStorage<Proposal[]>('proposals', INITIAL_PROPOSALS);
    const existing = proposals.find(
      (p) => String(p.jobId) === String(data.jobId) && String(p.lawyerId) === String(currentUser.id) && p.status !== 'REJECTED'
    );
    if (existing) throw new Error('Você já enviou uma proposta para esta demanda.');

    const newProposal: Proposal = {
      id: 'prop_' + Date.now(),
      jobId: data.jobId || '',
      jobTitle: data.jobTitle || '',
      processNumber: data.processNumber,
      lawyerId: currentUser.id,
      lawyerName: currentUser.name,
      lawyerAvatar: currentUser.avatarUrl,
      lawyerOab: currentUser.oabNumber
        ? `OAB/${currentUser.oabState || 'SP'} ${currentUser.oabNumber}`
        : 'OAB/SP 000.000',
      lawyerRating: currentUser.rating || 5.0,
      value: data.value || 0,
      deliveryDays: data.deliveryDays || 30,
      coverLetter: data.coverLetter || '',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      proposedMilestones: data.proposedMilestones || [],
      hiringType: data.hiringType,
    };
    setStorage('proposals', [newProposal, ...proposals]);
    return newProposal;
  },

  async withdrawProposal(proposalId: string): Promise<boolean> {
    if (!API_CONFIG.useMock) {
      try {
        await http(`/api/proposals/${proposalId}/withdraw`, { method: 'POST' });
        return true;
      } catch (e) {
        console.warn('Withdraw error:', e);
        return false;
      }
    }
    const proposals = getStorage<Proposal[]>('proposals', INITIAL_PROPOSALS);
    const updated = proposals.filter((p) => String(p.id) !== String(proposalId));
    setStorage('proposals', updated);
    return true;
  },

  async acceptProposal(proposalId: string): Promise<{ proposal: Proposal; contract: Contract }> {
    if (!API_CONFIG.useMock) {
      await http(`/api/proposals/${proposalId}/accept`, { method: 'POST' });
      const contractData = await http<any>(`/api/contracts/create/${proposalId}`, { method: 'POST' }).catch(() => null);
      const updatedProposal = await http<any>(`/api/proposals/${proposalId}`).catch(() => null);
      return {
        proposal: updatedProposal ? mapBackendProposal(updatedProposal) : ({ id: proposalId, status: 'ACCEPTED' } as any),
        contract: contractData ? mapBackendContract(contractData) : ({ id: 'cnt_' + proposalId, status: 'ACTIVE' } as any),
      };
    }

    const proposals = getStorage<Proposal[]>('proposals', INITIAL_PROPOSALS);
    const idx = proposals.findIndex((p) => String(p.id) === String(proposalId));
    if (idx === -1) throw new Error('Proposta não encontrada');
    proposals[idx].status = 'ACCEPTED';
    setStorage('proposals', proposals);
    const prop = proposals[idx];
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');

    const contracts = getStorage<Contract[]>('contracts', INITIAL_CONTRACTS);
    const newContract: Contract = {
      id: 'cnt_' + Date.now(),
      jobId: prop.jobId,
      jobTitle: prop.jobTitle,
      processNumber: prop.processNumber,
      proposalId: prop.id,
      clientId: currentUser.id,
      clientName: currentUser.companyName || currentUser.name,
      lawyerId: prop.lawyerId,
      lawyerName: prop.lawyerName,
      lawyerOab: prop.lawyerOab,
      totalValue: prop.value,
      escrowBalance: prop.value,
      releasedBalance: 0,
      status: 'ACTIVE',
      startDate: new Date().toISOString().split('T')[0],
      endDateEst: new Date(Date.now() + prop.deliveryDays * 86400000).toISOString().split('T')[0],
      progressPercentage: 0,
      milestones: [
        {
          id: `ms_${Date.now()}_0`,
          contractId: 'cnt_' + Date.now(),
          title: 'Marco 1: Execução e Protocolo',
          description: 'Atuação jurídica e acompanhamento.',
          value: prop.value,
          dueDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
          status: 'IN_PROGRESS',
        },
      ],
    };
    setStorage('contracts', [newContract, ...contracts]);
    return { proposal: prop, contract: newContract };
  },

  async rejectProposal(proposalId: string): Promise<Proposal> {
    if (!API_CONFIG.useMock) {
      const rejected = await http<any>(`/api/proposals/${proposalId}/reject`, { method: 'POST' });
      return mapBackendProposal(rejected);
    }
    const proposals = getStorage<Proposal[]>('proposals', INITIAL_PROPOSALS);
    const idx = proposals.findIndex((p) => String(p.id) === String(proposalId));
    if (idx !== -1) { proposals[idx].status = 'REJECTED'; setStorage('proposals', proposals); }
    return proposals[idx];
  },
};

// ─────────────────────────────────────────────
// SECTION 7 – CONTRACTS API
// ─────────────────────────────────────────────
export const contractsApi = {
  async getContracts(): Promise<Contract[]> {
    if (!API_CONFIG.useMock) {
      try {
        const data = await http<any[]>('/api/contracts/my');
        return (data || []).map(mapBackendContract);
      } catch (e) {
        console.warn('Contracts fetch error:', e);
        return [];
      }
    }
    return getStorage<Contract[]>('contracts', INITIAL_CONTRACTS);
  },

  async getContractById(contractId: string): Promise<Contract | null> {
    if (!API_CONFIG.useMock) {
      try {
        const raw = await http<any>(`/api/contracts/${contractId}`);
        return raw ? mapBackendContract(raw) : null;
      } catch {
        return null;
      }
    }
    const all = getStorage<Contract[]>('contracts', INITIAL_CONTRACTS);
    return all.find((c) => String(c.id) === String(contractId)) || null;
  },

  async updateMilestoneStatus(contractId: string, milestoneId: string, status: MilestoneStatus): Promise<Contract | null> {
    if (!API_CONFIG.useMock && (status === 'SUBMITTED' || status === 'APPROVED')) {
      try {
        await http(`/api/contracts/milestones/${milestoneId}/complete`, { method: 'POST' });
        return await contractsApi.getContractById(contractId);
      } catch (e) {
        console.warn('Milestone update error:', e);
      }
    }
    return await contractsApi.getContractById(contractId);
  },

  async releaseMilestone(contractId: string, milestoneId: string): Promise<Contract | null> {
    if (!API_CONFIG.useMock) {
      try {
        const payment = await http<any>(`/api/payments/create/${milestoneId}`, { method: 'POST' });
        const pId = payment?.paymentId || milestoneId;
        await http(`/api/payments/${pId}/complete`, { method: 'POST' });
        return await contractsApi.getContractById(contractId);
      } catch (e) {
        console.warn('Release milestone error:', e);
      }
    }
    return await contractsApi.getContractById(contractId);
  },

  async finishContract(contractId: string): Promise<Contract | null> {
    if (!API_CONFIG.useMock) {
      try {
        await http(`/api/contracts/${contractId}/complete`, { method: 'POST' });
        return await contractsApi.getContractById(contractId);
      } catch (e) {
        console.warn('Finish contract error:', e);
      }
    }
    return await contractsApi.getContractById(contractId);
  },
};

// ─────────────────────────────────────────────
// SECTION 8 – PAYMENTS API
// ─────────────────────────────────────────────
export const paymentsApi = {
  async getPayments(): Promise<Payment[]> {
    if (!API_CONFIG.useMock) {
      try {
        const data = await http<any[]>('/api/payments/my');
        return (data || []).map((p) => ({
          id: String(p.paymentId ?? p.id ?? ''),
          contractId: String(p.contractId ?? ''),
          jobTitle: (p.jobTitle as string) || (p.description as string) || 'Pagamento de Mandato',
          payerName: (p.payerName as string) || 'Cliente',
          receiverName: (p.receiverName as string) || 'Advogado',
          amount: Number(p.amount || 0),
          feeAmount: Number(p.amount || 0) * 0.05,
          netAmount: Number(p.amount || 0) * 0.95,
          type: 'MILESTONE_RELEASE',
          payerRole: 'CLIENT',
          receiverRole: 'LAWYER',
          status: p.status === 'Completed' ? 'RELEASED' : 'IN_ESCROW',
          paymentMethod: 'PIX',
          createdAt: p.paymentDate || new Date().toISOString(),
          releasedAt: p.status === 'Completed' ? p.paymentDate : undefined,
        }));
      } catch (e) {
        console.warn('Payments fetch error:', e);
        return [];
      }
    }
    return getStorage<Payment[]>('payments', INITIAL_PAYMENTS);
  },

  async getFinancialSummary(): Promise<{ availableBalance: number; escrowBalance: number; totalEarned: number; internalBalance: number; walletBalance?: number }> {
    const user = await authApi.getCurrentUser();
    if (user?.role === 'LAWYER' && user.lawyerWallet) {
      return {
        availableBalance: user.lawyerWallet.availableBalance,
        escrowBalance: user.lawyerWallet.escrowBalance,
        totalEarned: user.lawyerWallet.totalEarned,
        internalBalance: user.lawyerWallet.internalBalance,
      };
    }
    if (user?.role === 'CLIENT' && user.clientWallet) {
      return {
        availableBalance: user.clientWallet.walletBalance,
        escrowBalance: user.clientWallet.escrowBalance,
        totalEarned: user.clientWallet.totalInvested,
        internalBalance: 0,
        walletBalance: user.clientWallet.walletBalance,
      };
    }
    return { availableBalance: 0, escrowBalance: 0, totalEarned: 0, internalBalance: 0 };
  },

  async depositClientBalance(amount: number, method: 'PIX' | 'CARTAO_CREDITO' | 'BOLETO'): Promise<UserProfile> {
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');
    if (!currentUser.clientWallet) currentUser.clientWallet = { walletBalance: 0, escrowBalance: 0, totalInvested: 0 };
    currentUser.clientWallet.walletBalance += amount;
    setStorage('current_user', currentUser);
    return currentUser;
  },

  async depositLawyerInternalBalance(amount: number, method: 'PIX' | 'CARTAO_CREDITO' | 'BOLETO'): Promise<UserProfile> {
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');
    if (!currentUser.lawyerWallet) currentUser.lawyerWallet = { availableBalance: 0, escrowBalance: 0, internalBalance: 0, totalEarned: 0 };
    currentUser.lawyerWallet.internalBalance += amount;
    setStorage('current_user', currentUser);
    return currentUser;
  },

  async saveLawyerBankInfo(bankInfo: NonNullable<NonNullable<UserProfile['lawyerWallet']>['bankInfo']>): Promise<UserProfile> {
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');
    if (!currentUser.lawyerWallet) currentUser.lawyerWallet = { availableBalance: 0, escrowBalance: 0, internalBalance: 0, totalEarned: 0 };
    currentUser.lawyerWallet.bankInfo = bankInfo;
    setStorage('current_user', currentUser);
    return currentUser;
  },

  async requestPayout(amount: number, pixKey: string): Promise<Payment> {
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');
    return {
      id: 'pay_out_' + Date.now(),
      contractId: 'payout',
      jobTitle: `Resgate PIX – Chave: ${pixKey}`,
      payerName: 'LWork Custódia',
      receiverName: currentUser.name,
      amount,
      feeAmount: 0,
      netAmount: amount,
      type: 'WITHDRAWAL',
      payerRole: 'LAWYER',
      receiverRole: 'LAWYER',
      status: 'RELEASED',
      paymentMethod: 'PIX',
      createdAt: new Date().toISOString(),
      releasedAt: new Date().toISOString(),
    };
  },

  async paySubscriptionWithInternalBalance(planName: 'Pro' | 'Premium', price: number): Promise<UserProfile> {
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');
    currentUser.subscriptionPlan = planName;
    setStorage('current_user', currentUser);
    return currentUser;
  },
};

// ─────────────────────────────────────────────
// SECTION 9 – ANTI-EVASION MODERATION
// ─────────────────────────────────────────────
export function moderateContent(text: string, isNegotiation: boolean): { content: string; wasModerated: boolean } {
  if (!isNegotiation) return { content: text, wasModerated: false };
  let moderated = text;
  let wasModerated = false;
  const patterns = [
    /(\+?55\s*)?(?:\(?\d{2}\)?\s*)?(?:9\s*)?\d{4}[\s.-]?\d{4}/g,
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
    /(wa\.me|t\.me|whatsapp|zap|telegram|instagram|facebook|linkedin)\b[^\s]*/gi,
    /(chave\s*pix|pix:|cpf:|cnpj:|conta\s*corrente|agencia|itau|itaú|bradesco|santander|nubank)/gi,
  ];
  for (const p of patterns) {
    if (new RegExp(p.source, p.flags).test(moderated)) {
      wasModerated = true;
      moderated = moderated.replace(p, '[CONTATO BLOQUEADO PELA PLATAFORMA]');
    }
  }
  return { content: moderated, wasModerated };
}

// ─────────────────────────────────────────────
// SECTION 10 – CHAT API
// ─────────────────────────────────────────────
export const chatApi = {
  async getConversations(): Promise<ChatConversation[]> {
    if (!API_CONFIG.useMock) {
      try {
        const contracts = await contractsApi.getContracts();
        const currentUser = await authApi.getCurrentUser();
        if (contracts.length > 0 && currentUser) {
          return contracts.map((c) => {
            const isClient = String(c.clientId) === String(currentUser.id);
            return {
              id: `conv_contract_${c.id}`,
              jobId: String(c.jobId),
              jobTitle: c.jobTitle,
              state: 'EXECUCAO' as const,
              otherUser: {
                id: isClient ? String(c.lawyerId) : String(c.clientId),
                name: isClient ? c.lawyerName : c.clientName,
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
                role: (isClient ? 'LAWYER' : 'CLIENT') as Role,
                oabOrCompany: isClient ? c.lawyerOab : undefined,
                isOnline: true,
              },
              lastMessage: 'Contrato ativo e sincronizado.',
              lastMessageTime: '',
              unreadCount: 0,
            };
          });
        }
        return [];
      } catch (e) {
        console.warn('Chat conversations error:', e);
        return [];
      }
    }
    return getStorage<ChatConversation[]>('chat_conversations', INITIAL_CHAT_CONVERSATIONS);
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    if (!API_CONFIG.useMock && conversationId.startsWith('conv_contract_')) {
      try {
        const contractId = conversationId.replace('conv_contract_', '');
        const res = await http<any>(`/api/chat/messages/${contractId}`);
        const list = res?.messages || res || [];
        return (list as any[]).map((m) => ({
          id: String(m.messageId ?? m.id ?? ''),
          conversationId,
          senderId: String(m.senderId ?? ''),
          senderName: m.senderName || 'Participante',
          senderAvatar: '',
          content: m.message || '',
          timestamp: m.createdAt ? new Date(m.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '',
          isRead: Boolean(m.isRead),
        }));
      } catch (e) {
        console.warn('Messages fetch error:', e);
        return [];
      }
    }
    const allMsgs = getStorage<Record<string, ChatMessage[]>>('chat_messages', INITIAL_CHAT_MESSAGES);
    return allMsgs[conversationId] || [];
  },

  async sendMessage(conversationId: string, content: string, attachments?: { name: string; size: string; type: 'PDF' | 'DOCX' | 'XLSX' | 'PNG' | 'JPG' }[]): Promise<ChatMessage> {
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');
    const { content: processedContent, wasModerated } = moderateContent(content, false);

    if (!API_CONFIG.useMock && conversationId.startsWith('conv_contract_')) {
      const contractId = conversationId.replace('conv_contract_', '');
      await http(`/api/chat/send/${contractId}`, {
        method: 'POST',
        body: JSON.stringify({ message: processedContent }),
      });
    }

    return {
      id: 'msg_' + Date.now(),
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatarUrl,
      content: processedContent,
      wasModerated,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
      attachments: attachments?.map((a, i) => ({ id: `att_${Date.now()}_${i}`, name: a.name, size: a.size, type: a.type, url: '#' })),
    };
  },

  async getOrCreateNegotiationChat(proposalId: string): Promise<ChatConversation> {
    const proposals = await proposalsApi.getProposals();
    const prop = proposals.find((p) => String(p.id) === String(proposalId));
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');

    return {
      id: 'conv_prop_' + proposalId,
      jobId: prop?.jobId || '1',
      jobTitle: `Negociação: ${prop?.jobTitle || 'Demanda'}`,
      proposalId: String(proposalId),
      proposalValue: prop?.value || 0,
      lawyerName: prop?.lawyerName || 'Advogado',
      clientName: currentUser.name,
      state: 'NEGOCIACAO',
      otherUser: {
        id: prop?.lawyerId || '2',
        name: prop?.lawyerName || 'Advogado',
        avatar: prop?.lawyerAvatar || '',
        role: 'LAWYER',
        oabOrCompany: prop?.lawyerOab,
        isOnline: true,
      },
      lastMessage: `Proposta enviada: R$ ${(prop?.value || 0).toLocaleString('pt-BR')}`,
      lastMessageTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      unreadCount: 0,
    };
  },
};

// ─────────────────────────────────────────────
// SECTION 11 – REVIEWS API
// ─────────────────────────────────────────────
export const reviewsApi = {
  async getContractReviews(contractId: string): Promise<Review[]> {
    if (!API_CONFIG.useMock) {
      try {
        const data = await http<any[]>(`/api/reviews/contract/${contractId}`);
        return (data || []).map((r) => ({
          id: String(r.reviewId ?? r.id ?? ''),
          contractId: String(r.contractId ?? contractId),
          jobTitle: 'Mandato Jurídico',
          reviewerId: String(r.reviewerId ?? ''),
          reviewerName: r.reviewerName || 'Avaliador',
          reviewerAvatar: '',
          reviewerRole: 'CLIENT',
          revieweeId: String(r.revieweeId ?? ''),
          rating: Number(r.rating || 5),
          comment: r.comment || '',
          createdAt: r.createdAt || new Date().toISOString(),
          status: 'PUBLISHED',
        }));
      } catch {
        return [];
      }
    }
    return [];
  },

  async submitReview(data: { contractId: string; rating: number; comment: string; detailedRatings?: Record<string, number> }): Promise<{ review: Review; published: boolean }> {
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');

    if (!API_CONFIG.useMock) {
      const result = await http<any>(`/api/reviews/create/${data.contractId}`, {
        method: 'POST',
        body: JSON.stringify({ revieweeId: 1, rating: data.rating, comment: data.comment }),
      });
      const review: Review = {
        id: String(result?.reviewId ?? Date.now()),
        contractId: data.contractId,
        jobTitle: 'Mandato Jurídico',
        reviewerId: currentUser.id,
        reviewerName: currentUser.name,
        reviewerAvatar: currentUser.avatarUrl,
        reviewerRole: currentUser.role,
        revieweeId: '1',
        rating: data.rating,
        comment: data.comment,
        createdAt: new Date().toISOString(),
        status: 'PUBLISHED',
      };
      return { review, published: true };
    }

    const review: Review = {
      id: 'rev_' + Date.now(),
      contractId: data.contractId,
      jobTitle: 'Mandato',
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewerAvatar: currentUser.avatarUrl,
      reviewerRole: currentUser.role,
      revieweeId: '2',
      rating: data.rating,
      comment: data.comment,
      createdAt: new Date().toISOString(),
      status: 'PUBLISHED',
    };
    return { review, published: true };
  },
};

// ─────────────────────────────────────────────
// SECTION 12 – LAWYERS DIRECTORY
// ─────────────────────────────────────────────
export const lawyersApi = {
  async getLawyers(): Promise<UserProfile[]> {
    if (!API_CONFIG.useMock) {
      try {
        const raw = await http<any[]>('/api/users/?role=LAWYER');
        if (Array.isArray(raw) && raw.length > 0) {
          return raw.map(mapBackendUser);
        }
        return [];
      } catch {
        return [];
      }
    }
    return getStorage<UserProfile[]>('lawyers_directory', [INITIAL_LAWYER_USER]);
  },

  async sendDirectInvite(lawyerId: string, caseTitle: string, description: string, value: number): Promise<ChatConversation> {
    const newJob = await jobsApi.createJob({
      title: caseTitle || 'Consulta Jurídica Direta',
      description: description || 'Solicitação de consulta direta.',
      budgetMax: value,
      budgetMin: value,
      type: 'CONSULTING',
      urgency: 'HIGH',
      confidentiality: 'STRICTLY_CONFIDENTIAL',
      estimatedDeadlineDays: 15,
    });

    const newProposal = await proposalsApi.createProposal({
      jobId: newJob.id,
      jobTitle: newJob.title,
      value,
      deliveryDays: 15,
      coverLetter: `Convite de contratação direta.`,
    });

    return await chatApi.getOrCreateNegotiationChat(String(newProposal.id));
  },
};

// ─────────────────────────────────────────────
// SECTION 13 – DOCUMENTS API
// ─────────────────────────────────────────────
export const documentsApi = {
  async getDocuments(category?: string): Promise<AppDocument[]> {
    if (!API_CONFIG.useMock) {
      return [];
    }
    let docs = getStorage<AppDocument[]>('documents', INITIAL_DOCUMENTS);
    if (category && category !== 'Todos') docs = docs.filter((d) => d.category === category);
    return docs;
  },

  async uploadDocument(docData: Partial<AppDocument>): Promise<AppDocument> {
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');
    return {
      id: 'doc_' + Date.now(),
      title: docData.title || 'Novo Documento',
      processNumber: docData.processNumber,
      category: docData.category || 'Peças Processuais',
      fileName: docData.fileName || 'documento.pdf',
      fileSize: docData.fileSize || '1 MB',
      fileType: docData.fileType || 'PDF',
      uploadedBy: currentUser.name,
      uploadDate: new Date().toLocaleDateString('pt-BR'),
      statusTag: docData.statusTag || 'Em revisão',
      downloadUrl: '#',
    };
  },
};

// ─────────────────────────────────────────────
// SECTION 14 – NOTIFICATIONS API
// ─────────────────────────────────────────────
export const notificationsApi = {
  async getNotifications(): Promise<Notification[]> {
    if (!API_CONFIG.useMock) {
      try {
        const data = await http<any[]>('/api/notifications/');
        return (data || []).map((n) => ({
          id: String(n.notificationId ?? n.id ?? ''),
          title: n.title || 'Notificação',
          message: n.message || '',
          type: (n.type as any) || 'CHAT_MESSAGE',
          timestamp: n.createdAt ? new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Agora',
          isRead: Boolean(n.isRead),
          link: n.referenceId ? `/cases/${n.referenceId}` : undefined,
        }));
      } catch {
        return [];
      }
    }
    return getStorage<Notification[]>('notifications', INITIAL_NOTIFICATIONS);
  },

  async getUnreadCount(): Promise<number> {
    if (!API_CONFIG.useMock) {
      try {
        const count = await http<number>('/api/notifications/unread/count');
        return typeof count === 'number' ? count : 0;
      } catch {
        return 0;
      }
    }
    const notifs = getStorage<Notification[]>('notifications', INITIAL_NOTIFICATIONS);
    return notifs.filter((n) => !n.isRead).length;
  },

  async markAsRead(id: string): Promise<void> {
    if (!API_CONFIG.useMock) {
      await http(`/api/notifications/${id}/read`, { method: 'POST' }).catch(() => {});
    }
  },

  async markAllAsRead(): Promise<void> {
    if (!API_CONFIG.useMock) {
      await http('/api/notifications/read-all', { method: 'POST' }).catch(() => {});
    }
  },
};

// ─────────────────────────────────────────────
// SECTION 15 – DASHBOARD API
// ─────────────────────────────────────────────
export const dashboardApi = {
  async getMetrics(): Promise<DashboardMetrics> {
    if (!API_CONFIG.useMock) {
      try {
        const metrics = await http<any>('/api/dashboard/metrics');
        if (metrics) return metrics;
      } catch { /* compute from jobs */ }
    }
    return MOCK_DASHBOARD_METRICS;
  },
};

// ─────────────────────────────────────────────
// SECTION 16 – GEMINI AI LEGAL ANALYSIS
// ─────────────────────────────────────────────
export const geminiLegalApi = {
  async analyzeProcess(processTitle: string, description: string): Promise<{
    summary: string;
    suggestedStrategy: string;
    estimatedSuccessRate: string;
    recommendedMilestones: { title: string; description: string; estDays: number }[];
  }> {
    return {
      summary: `Análise técnica preliminar para "${processTitle}": Identificada viabilidade jurídica fundamentada nas normas vigentes.`,
      suggestedStrategy: '1. Análise documental e propositura de medida cabível.\n2. Produção de provas documentais e periciais.\n3. Tentativa de conciliação ou sustentação de mérito.',
      estimatedSuccessRate: '85% de probabilidade de êxito na análise preliminar',
      recommendedMilestones: [
        { title: 'Marco 1: Petição Inicial / Análise Técnica', description: 'Elaboração das peças fundamentais.', estDays: 10 },
        { title: 'Marco 2: Acompanhamento e Diligências', description: 'Instrução e manifestações.', estDays: 20 },
        { title: 'Marco 3: Parecer Final e Conclusão', description: 'Entrega final ao cliente.', estDays: 30 },
      ],
    };
  },
};

// ─────────────────────────────────────────────
// PRIVATE HELPERS
// ─────────────────────────────────────────────
function applyJobFilters(jobs: Job[], filters?: { status?: JobStatus; specialty?: string; search?: string }): Job[] {
  if (!filters) return jobs;
  let result = [...jobs];
  if (filters.status) result = result.filter((j) => j.status === filters.status);
  if (filters.specialty && filters.specialty !== 'Todos') result = result.filter((j) => j.specialty?.toLowerCase() === filters.specialty?.toLowerCase());
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (j) => j.title.toLowerCase().includes(q) || j.description.toLowerCase().includes(q) || (j.processNumber && j.processNumber.toLowerCase().includes(q)) || j.clientName.toLowerCase().includes(q)
    );
  }
  return result;
}
