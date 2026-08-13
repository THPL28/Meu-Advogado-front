/**
 * ============================================================
 * LWork – API Service Layer (Hybrid: Real Backend + Mock)
 * ============================================================
 * This is the SINGLE source of truth for all data operations.
 * Pages and components MUST NOT call fetch() directly.
 *
 * STRATEGY:
 *   - When API_CONFIG.useMock === false → calls real Spring Boot
 *     REST API at /api/* (proxied by Vite in dev).
 *   - When API_CONFIG.useMock === true OR a network error occurs
 *     → falls back to localStorage-persisted mock data.
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
/**
 * Wraps fetch with:
 *  - credentials: 'include' for HttpOnly JWT cookies
 *  - auto-retry with refresh token on 401
 *  - throws on non-ok responses with backend error message
 */
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
  if (res.status === 401 && !isRefreshing) {
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
        return retryData.data ?? retryData;
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
  // Backend always wraps data in { success, data, error }
  return (json.data !== undefined ? json.data : json) as T;
}

// ─────────────────────────────────────────────
// SECTION 3 – ROLE MAPPER
// ─────────────────────────────────────────────
/**
 * Maps Spring Security roles (e.g. ROLE_LAWYER, ROLE_FREELANCER)
 * to the frontend Role type (LAWYER | CLIENT | ADMIN).
 */
function mapBackendRoles(roles: string[]): Role {
  if (!roles || roles.length === 0) return 'CLIENT';
  const normalized = roles.map((r) => r.replace('ROLE_', '').toUpperCase());
  if (normalized.includes('ADMIN')) return 'ADMIN';
  if (normalized.includes('LAWYER') || normalized.includes('FREELANCER')) return 'LAWYER';
  return 'CLIENT';
}

/**
 * Converts a backend CurrentUserDto / UserProfileDto into the
 * frontend UserProfile interface.
 */
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
    rating: (raw.rating as number) ?? 0,
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

// ─────────────────────────────────────────────
// SECTION 4 – AUTH API
// ─────────────────────────────────────────────
export const authApi = {
  /**
   * Returns the currently logged-in user.
   * - Real mode: GET /api/auth/me  (JWT cookie auto-sent)
   * - Mock mode: reads localStorage
   */
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
      // If backend is unreachable, fall back to cached user
      const cached = localStorage.getItem(API_CONFIG.storagePrefix + 'current_user');
      return cached ? (JSON.parse(cached) as UserProfile) : null;
    }
  },

  /**
   * Login: POST /api/auth/login
   * Backend sets HttpOnly JWT cookies on success.
   */
  async login(email: string, password: string): Promise<UserProfile> {
    if (API_CONFIG.useMock) {
      // Mock: pick role from email pattern for demo convenience
      const role: Role = email.includes('adv') || email.includes('oab') || email.includes('lawyer') ? 'LAWYER' : 'CLIENT';
      const user: UserProfile = {
        ...(role === 'LAWYER' ? INITIAL_LAWYER_USER : INITIAL_CLIENT_USER),
        email,
      };
      setStorage('current_user', user);
      return user;
    }
    const raw = await http<Record<string, unknown>>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    // After login the backend may return the user or just a success flag
    // Then we call /me to get the full profile
    const user = await authApi.getCurrentUser();
    if (!user) throw new Error('Falha ao obter perfil após login.');
    setStorage('current_user', user);
    return user;
  },

  /**
   * Register: POST /api/auth/register
   * roles array must match backend: ["ROLE_LAWYER"] or ["ROLE_CLIENT"]
   */
  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: Role;
    // extra profile fields saved after registration
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
        rating: 0,
        reviewCount: 0,
        completedCasesCount: 0,
        joinedDate: 'Recente',
        specialties: [],
        skills: [],
      };
      setStorage('current_user', newUser);
      return newUser;
    }

    // Map frontend Role → backend role name
    const backendRole = data.role === 'LAWYER' ? 'ROLE_FREELANCER' : 'ROLE_CLIENT';

    await http('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        roles: [backendRole],
      }),
    });

    // Registration done → login automatically
    return await authApi.login(data.email, data.password);
  },

  /** Logout: POST /api/auth/logout — clears JWT cookies server-side */
  async logout(): Promise<void> {
    clearAuthStorage();
    if (!API_CONFIG.useMock) {
      try {
        await http('/api/auth/logout', { method: 'POST' });
      } catch { /* ignore errors on logout */ }
    }
  },

  /** Update current user's profile */
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
        console.warn('Profile update on backend failed, saved locally:', e);
      }
    }
    return updated;
  },

  /** Switch role (demo / mock only) */
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
        const data = await http<Job[]>(`/api/jobs/all${query}`);
        // Cache for offline fallback
        setStorage('jobs', data);
        return applyJobFilters(data, filters);
      } catch (e) {
        console.warn('Jobs fetch failed, using local cache:', e);
      }
    }
    return applyJobFilters(getStorage<Job[]>('jobs', INITIAL_JOBS), filters);
  },

  async getMyJobs(): Promise<Job[]> {
    if (!API_CONFIG.useMock) {
      try {
        const data = await http<Job[]>('/api/jobs/my');
        return data;
      } catch (e) {
        console.warn('My jobs fetch failed:', e);
      }
    }
    const user = await authApi.getCurrentUser();
    const all = getStorage<Job[]>('jobs', INITIAL_JOBS);
    return all.filter((j) => String(j.clientId) === String(user?.id));
  },

  async getJobById(id: string): Promise<Job | null> {
    if (!API_CONFIG.useMock) {
      try {
        return await http<Job>(`/api/jobs/${id}`);
      } catch { /* fall through to local */ }
    }
    const jobs = getStorage<Job[]>('jobs', INITIAL_JOBS);
    return jobs.find((j) => String(j.id) === String(id)) || null;
  },

  async createJob(newJobData: Partial<Job>): Promise<Job> {
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');

    if (!API_CONFIG.useMock) {
      try {
        const payload = {
          title: newJobData.title,
          description: newJobData.description,
          budget: newJobData.budgetMax,
          jobType: newJobData.type,
          urgency: newJobData.urgency,
          confidentiality: newJobData.confidentiality,
          estimatedValue: newJobData.budgetMax,
          deadline: newJobData.estimatedDeadlineDays
            ? new Date(Date.now() + (newJobData.estimatedDeadlineDays || 30) * 86400000)
                .toISOString()
                .split('T')[0]
            : undefined,
          specialtyId: null,
          clientName: currentUser.companyName || currentUser.name,
        };
        const created = await http<Job>('/api/jobs/post', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        // Also persist locally for UI consistency
        const jobs = getStorage<Job[]>('jobs', INITIAL_JOBS);
        setStorage('jobs', [created, ...jobs]);
        return created;
      } catch (e) {
        console.warn('Create job on backend failed, saving locally:', e);
      }
    }

    // Mock fallback
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
    const jobs = getStorage<Job[]>('jobs', INITIAL_JOBS);
    const idx = jobs.findIndex((j) => String(j.id) === String(jobId));
    if (idx === -1) return null;
    jobs[idx].status = status;
    jobs[idx].updatedAt = new Date().toISOString();
    setStorage('jobs', jobs);
    return jobs[idx];
  },

  async reopenJob(jobId: string): Promise<Job | null> {
    const jobs = getStorage<Job[]>('jobs', INITIAL_JOBS);
    const idx = jobs.findIndex((j) => String(j.id) === String(jobId));
    if (idx === -1) return null;
    jobs[idx].status = 'OPEN';
    jobs[idx].assignedLawyerId = undefined;
    jobs[idx].assignedLawyerName = undefined;
    jobs[idx].assignedLawyerAvatar = undefined;
    jobs[idx].updatedAt = new Date().toISOString();
    if (!jobs[idx].timeline) jobs[idx].timeline = [];
    jobs[idx].timeline!.unshift({
      id: 'tl_reopen_' + Date.now(),
      title: 'Demanda Reaberta pelo Cliente',
      date: new Date().toLocaleDateString('pt-BR'),
      author: jobs[idx].clientName,
      description: 'Reaberta para novas propostas de honorários.',
      type: 'ANDAMENTO_PROCESSUAL',
    });
    setStorage('jobs', jobs);
    return jobs[idx];
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
        const data = await http<Proposal[]>(endpoint);
        setStorage('proposals', data);
        return data;
      } catch (e) {
        console.warn('Proposals fetch failed:', e);
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
        return await http<Proposal[]>('/api/proposals/received');
      } catch (e) {
        console.warn('Received proposals fetch failed:', e);
      }
    }
    return getStorage<Proposal[]>('proposals', INITIAL_PROPOSALS);
  },

  async createProposal(data: Partial<Proposal>): Promise<Proposal> {
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');

    if (!API_CONFIG.useMock) {
      try {
        const payload = {
          jobId: data.jobId,
          coverLetter: data.coverLetter,
          proposedRate: data.value,
          totalValue: data.value,
          proposedDuration: data.deliveryDays,
          strategy: data.coverLetter,
          lawyerOab: currentUser.oabNumber
            ? `OAB/${currentUser.oabState || 'SP'} ${currentUser.oabNumber}`
            : undefined,
        };
        const created = await http<Proposal>('/api/proposals/', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        const proposals = getStorage<Proposal[]>('proposals', INITIAL_PROPOSALS);
        setStorage('proposals', [created, ...proposals]);
        return created;
      } catch (e) {
        console.warn('Create proposal on backend failed, saving locally:', e);
      }
    }

    // Check duplicate
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
      lawyerRating: currentUser.rating || 0,
      value: data.value || 0,
      deliveryDays: data.deliveryDays || 30,
      coverLetter: data.coverLetter || '',
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      proposedMilestones: data.proposedMilestones || [],
      hiringType: data.hiringType,
    };
    setStorage('proposals', [newProposal, ...proposals]);

    // Update job proposal count
    const jobs = getStorage<Job[]>('jobs', INITIAL_JOBS);
    const jIdx = jobs.findIndex((j) => String(j.id) === String(data.jobId));
    if (jIdx !== -1) { jobs[jIdx].proposalsCount += 1; setStorage('jobs', jobs); }

    // Auto-create negotiation chat
    await chatApi.getOrCreateNegotiationChat(newProposal.id);
    return newProposal;
  },

  async withdrawProposal(proposalId: string): Promise<boolean> {
    if (!API_CONFIG.useMock) {
      try {
        await http(`/api/proposals/${proposalId}/withdraw`, { method: 'POST' });
      } catch (e) {
        console.warn('Withdraw on backend failed:', e);
      }
    }
    const proposals = getStorage<Proposal[]>('proposals', INITIAL_PROPOSALS);
    const idx = proposals.findIndex((p) => String(p.id) === String(proposalId));
    if (idx === -1) return false;
    const jobId = proposals[idx].jobId;
    const updated = proposals.filter((p) => String(p.id) !== String(proposalId));
    setStorage('proposals', updated);
    const jobs = getStorage<Job[]>('jobs', INITIAL_JOBS);
    const jIdx = jobs.findIndex((j) => String(j.id) === String(jobId));
    if (jIdx !== -1) { jobs[jIdx].proposalsCount = Math.max(0, jobs[jIdx].proposalsCount - 1); setStorage('jobs', jobs); }
    return true;
  },

  async acceptProposal(proposalId: string): Promise<{ proposal: Proposal; contract: Contract }> {
    if (!API_CONFIG.useMock) {
      try {
        await http(`/api/proposals/${proposalId}/accept`, { method: 'POST' });
      } catch (e) {
        console.warn('Accept proposal on backend failed, applying locally:', e);
      }
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
      milestones: prop.proposedMilestones.map((m, i) => ({
        id: `ms_${Date.now()}_${i}`,
        contractId: 'cnt_' + Date.now(),
        title: m.title,
        description: m.description,
        value: m.value,
        dueDate: new Date(Date.now() + (i + 1) * 15 * 86400000).toISOString().split('T')[0],
        status: i === 0 ? 'IN_PROGRESS' : ('PENDING' as MilestoneStatus),
      })),
    };
    setStorage('contracts', [newContract, ...contracts]);

    // Update job status to IN_PROGRESS
    const jobs = getStorage<Job[]>('jobs', INITIAL_JOBS);
    const jIdx = jobs.findIndex((j) => String(j.id) === String(prop.jobId));
    if (jIdx !== -1) {
      jobs[jIdx].status = 'IN_PROGRESS';
      jobs[jIdx].assignedLawyerId = prop.lawyerId;
      jobs[jIdx].assignedLawyerName = prop.lawyerName;
      jobs[jIdx].assignedLawyerAvatar = prop.lawyerAvatar;
      setStorage('jobs', jobs);
    }

    // Transition chats: winning → EXECUCAO, others → READ_ONLY
    const conversations = getStorage<ChatConversation[]>('chat_conversations', INITIAL_CHAT_CONVERSATIONS);
    const allMsgs = getStorage<Record<string, ChatMessage[]>>('chat_messages', INITIAL_CHAT_MESSAGES);
    const updatedConvs = conversations.map((c) => {
      if (String(c.jobId) === String(prop.jobId)) {
        const isWinner = String(c.proposalId) === String(prop.id) || String(c.otherUser.id) === String(prop.lawyerId);
        const newState = isWinner ? 'EXECUCAO' : 'READ_ONLY';
        const sysMsg: ChatMessage = {
          id: 'msg_sys_' + Date.now() + Math.random(),
          conversationId: c.id,
          senderId: 'system',
          senderName: 'LWork Plataforma',
          senderAvatar: '',
          content: isWinner
            ? '✅ Proposta aceita! O depósito de custódia (Escrow) foi confirmado. Chat em modo EXECUÇÃO – envio de arquivos e contatos liberado.'
            : '⚠️ O cliente selecionou outro advogado. Esta negociação foi encerrada.',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          isRead: true,
        };
        allMsgs[c.id] = [...(allMsgs[c.id] || []), sysMsg];
        return { ...c, state: newState as 'EXECUCAO' | 'READ_ONLY' };
      }
      return c;
    });
    setStorage('chat_conversations', updatedConvs);
    setStorage('chat_messages', allMsgs);

    return { proposal: prop, contract: newContract };
  },

  async rejectProposal(proposalId: string): Promise<Proposal> {
    if (!API_CONFIG.useMock) {
      try {
        return await http<Proposal>(`/api/proposals/${proposalId}/reject`, { method: 'POST' });
      } catch (e) {
        console.warn('Reject proposal on backend failed:', e);
      }
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
        const data = await http<Contract[]>('/api/contracts/my');
        setStorage('contracts', data);
        return data;
      } catch (e) {
        console.warn('Contracts fetch failed:', e);
      }
    }
    return getStorage<Contract[]>('contracts', INITIAL_CONTRACTS);
  },

  async getContractById(contractId: string): Promise<Contract | null> {
    if (!API_CONFIG.useMock) {
      try {
        return await http<Contract>(`/api/contracts/${contractId}`);
      } catch { /* fall through */ }
    }
    const all = getStorage<Contract[]>('contracts', INITIAL_CONTRACTS);
    return all.find((c) => String(c.id) === String(contractId)) || null;
  },

  async updateMilestoneStatus(contractId: string, milestoneId: string, status: MilestoneStatus): Promise<Contract | null> {
    if (!API_CONFIG.useMock && status === 'SUBMITTED') {
      try {
        await http(`/api/contracts/milestones/${milestoneId}/complete`, { method: 'POST' });
      } catch (e) {
        console.warn('Milestone submit on backend failed:', e);
      }
    }
    const contracts = getStorage<Contract[]>('contracts', INITIAL_CONTRACTS);
    const cIdx = contracts.findIndex((c) => String(c.id) === String(contractId));
    if (cIdx === -1) return null;
    const mIdx = contracts[cIdx].milestones.findIndex((m) => String(m.id) === String(milestoneId));
    if (mIdx === -1) return null;
    contracts[cIdx].milestones[mIdx].status = status;
    if (status === 'SUBMITTED') contracts[cIdx].milestones[mIdx].submittedAt = new Date().toISOString();
    setStorage('contracts', contracts);
    return contracts[cIdx];
  },

  async releaseMilestone(contractId: string, milestoneId: string): Promise<Contract | null> {
    if (!API_CONFIG.useMock) {
      try {
        const payment = await http<unknown>(`/api/payments/create/${milestoneId}`, { method: 'POST' });
        await http(`/api/payments/${(payment as Record<string, unknown>).paymentId || milestoneId}/complete`, { method: 'POST' });
      } catch (e) {
        console.warn('Release milestone on backend failed, applying locally:', e);
      }
    }
    const contracts = getStorage<Contract[]>('contracts', INITIAL_CONTRACTS);
    const cIdx = contracts.findIndex((c) => String(c.id) === String(contractId));
    if (cIdx === -1) return null;
    const contract = contracts[cIdx];
    const mIdx = contract.milestones.findIndex((m) => String(m.id) === String(milestoneId));
    if (mIdx === -1) return null;
    const ms = contract.milestones[mIdx];
    ms.status = 'PAID';
    ms.approvedAt = new Date().toISOString();
    contract.escrowBalance = Math.max(0, contract.escrowBalance - ms.value);
    contract.releasedBalance += ms.value;
    const paid = contract.milestones.filter((m) => m.status === 'PAID').length;
    contract.progressPercentage = Math.round((paid / contract.milestones.length) * 100);
    contracts[cIdx] = contract;
    setStorage('contracts', contracts);

    // Update wallets locally
    const currentUser = await authApi.getCurrentUser();
    if (currentUser) {
      const netAmount = ms.value * 0.95;
      if (currentUser.role === 'CLIENT' && currentUser.clientWallet) {
        currentUser.clientWallet.escrowBalance = Math.max(0, currentUser.clientWallet.escrowBalance - ms.value);
        currentUser.clientWallet.totalInvested += ms.value;
        setStorage('current_user', currentUser);
      } else if (currentUser.role === 'LAWYER' && currentUser.lawyerWallet) {
        currentUser.lawyerWallet.escrowBalance = Math.max(0, currentUser.lawyerWallet.escrowBalance - ms.value);
        currentUser.lawyerWallet.availableBalance += netAmount;
        currentUser.lawyerWallet.totalEarned += netAmount;
        setStorage('current_user', currentUser);
      }
      // Record payment
      const payments = getStorage<Payment[]>('payments', INITIAL_PAYMENTS);
      const newPayment: Payment = {
        id: 'pay_' + Date.now(),
        contractId: contract.id,
        jobTitle: contract.jobTitle,
        processNumber: contract.processNumber,
        payerName: contract.clientName,
        receiverName: contract.lawyerName,
        amount: ms.value,
        feeAmount: ms.value * 0.05,
        netAmount: ms.value * 0.95,
        type: 'MILESTONE_RELEASE',
        payerRole: 'CLIENT',
        receiverRole: 'LAWYER',
        status: 'RELEASED',
        paymentMethod: 'PIX',
        createdAt: new Date().toISOString(),
        releasedAt: new Date().toISOString(),
        invoiceNumber: `NF-e 2025/${Math.floor(10000 + Math.random() * 90000)}`,
      };
      setStorage('payments', [newPayment, ...payments]);
    }
    return contract;
  },

  async finishContract(contractId: string): Promise<Contract | null> {
    if (!API_CONFIG.useMock) {
      try {
        await http(`/api/contracts/${contractId}/complete`, { method: 'POST' });
      } catch (e) {
        console.warn('Finish contract on backend failed:', e);
      }
    }
    const contracts = getStorage<Contract[]>('contracts', INITIAL_CONTRACTS);
    const cIdx = contracts.findIndex((c) => String(c.id) === String(contractId));
    if (cIdx === -1) return null;
    contracts[cIdx].status = 'COMPLETED';
    setStorage('contracts', contracts);
    return contracts[cIdx];
  },
};

// ─────────────────────────────────────────────
// SECTION 8 – PAYMENTS API
// ─────────────────────────────────────────────
export const paymentsApi = {
  async getPayments(): Promise<Payment[]> {
    if (!API_CONFIG.useMock) {
      try {
        const data = await http<Payment[]>('/api/payments/my');
        setStorage('payments', data);
        return data;
      } catch (e) {
        console.warn('Payments fetch failed:', e);
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
    const payments = getStorage<Payment[]>('payments', INITIAL_PAYMENTS);
    setStorage('payments', [
      {
        id: 'pay_dep_' + Date.now(),
        contractId: 'client_deposit',
        jobTitle: 'Aporte de Saldo na Carteira',
        payerName: currentUser.name,
        receiverName: 'Carteira LWork',
        amount,
        feeAmount: 0,
        netAmount: amount,
        type: 'CLIENT_DEPOSIT',
        payerRole: 'CLIENT',
        receiverRole: 'CLIENT',
        status: 'RELEASED',
        paymentMethod: method,
        createdAt: new Date().toISOString(),
        releasedAt: new Date().toISOString(),
      } as Payment,
      ...payments,
    ]);
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
    if (currentUser.lawyerWallet) {
      if (currentUser.lawyerWallet.availableBalance < amount) {
        throw new Error('Saldo disponível insuficiente para o resgate solicitado.');
      }
      currentUser.lawyerWallet.availableBalance -= amount;
      setStorage('current_user', currentUser);
    }
    const payments = getStorage<Payment[]>('payments', INITIAL_PAYMENTS);
    const payout: Payment = {
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
    setStorage('payments', [payout, ...payments]);
    return payout;
  },

  async paySubscriptionWithInternalBalance(planName: 'Pro' | 'Premium', price: number): Promise<UserProfile> {
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');
    if (!currentUser.lawyerWallet || currentUser.lawyerWallet.internalBalance < price) {
      throw new Error('Saldo interno insuficiente. Adicione saldo para ativar o plano.');
    }
    currentUser.lawyerWallet.internalBalance -= price;
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
        // Backend chat is contract-scoped; build conversation list from contracts
        const contracts = await contractsApi.getContracts();
        const currentUser = await authApi.getCurrentUser();
        if (contracts.length > 0 && currentUser) {
          const convs: ChatConversation[] = contracts.map((c) => {
            const isClient = String(c.clientId) === String(currentUser.id);
            return {
              id: `conv_contract_${c.id}`,
              jobId: String(c.jobId),
              jobTitle: c.jobTitle,
              state: 'EXECUCAO' as const,
              otherUser: {
                id: isClient ? String(c.lawyerId) : String(c.clientId),
                name: isClient ? c.lawyerName : c.clientName,
                avatar: '',
                role: (isClient ? 'LAWYER' : 'CLIENT') as Role,
                oabOrCompany: isClient ? c.lawyerOab : undefined,
                isOnline: false,
              },
              lastMessage: 'Contrato ativo',
              lastMessageTime: '',
              unreadCount: 0,
            };
          });
          // Merge with local negotiation chats
          const localConvs = getStorage<ChatConversation[]>('chat_conversations', INITIAL_CHAT_CONVERSATIONS);
          const contractIds = new Set(convs.map((c) => c.id));
          const negotiationOnly = localConvs.filter((c) => !contractIds.has(c.id));
          const merged = [...convs, ...negotiationOnly];
          setStorage('chat_conversations', merged);
          return merged;
        }
      } catch (e) {
        console.warn('Chat conversations fetch failed:', e);
      }
    }
    return getStorage<ChatConversation[]>('chat_conversations', INITIAL_CHAT_CONVERSATIONS);
  },

  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    if (!API_CONFIG.useMock && conversationId.startsWith('conv_contract_')) {
      try {
        const contractId = conversationId.replace('conv_contract_', '');
        const msgs = await http<ChatMessage[]>(`/api/chat/messages/${contractId}`);
        const allMsgs = getStorage<Record<string, ChatMessage[]>>('chat_messages', INITIAL_CHAT_MESSAGES);
        allMsgs[conversationId] = msgs;
        setStorage('chat_messages', allMsgs);
        return msgs;
      } catch (e) {
        console.warn('Messages fetch failed:', e);
      }
    }
    const allMsgs = getStorage<Record<string, ChatMessage[]>>('chat_messages', INITIAL_CHAT_MESSAGES);
    return allMsgs[conversationId] || [];
  },

  async sendMessage(conversationId: string, content: string, attachments?: { name: string; size: string; type: 'PDF' | 'DOCX' | 'XLSX' | 'PNG' | 'JPG' }[]): Promise<ChatMessage> {
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');
    const conversations = getStorage<ChatConversation[]>('chat_conversations', INITIAL_CHAT_CONVERSATIONS);
    const conv = conversations.find((c) => c.id === conversationId);
    const isNegotiation = conv?.state === 'NEGOCIACAO' || !conv?.state;
    const { content: processedContent, wasModerated } = moderateContent(content, isNegotiation);

    if (!API_CONFIG.useMock && conversationId.startsWith('conv_contract_')) {
      try {
        const contractId = conversationId.replace('conv_contract_', '');
        await http(`/api/chat/send/${contractId}`, {
          method: 'POST',
          body: JSON.stringify({ message: processedContent }),
        });
      } catch (e) {
        console.warn('Send message to backend failed, saving locally:', e);
      }
    }

    const newMsg: ChatMessage = {
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

    const allMsgs = getStorage<Record<string, ChatMessage[]>>('chat_messages', INITIAL_CHAT_MESSAGES);
    allMsgs[conversationId] = [...(allMsgs[conversationId] || []), newMsg];
    setStorage('chat_messages', allMsgs);

    const convIdx = conversations.findIndex((c) => c.id === conversationId);
    if (convIdx !== -1) {
      conversations[convIdx].lastMessage = processedContent || `[Anexo: ${attachments?.[0]?.name}]`;
      conversations[convIdx].lastMessageTime = newMsg.timestamp;
      setStorage('chat_conversations', conversations);
    }
    return newMsg;
  },

  async getOrCreateNegotiationChat(proposalId: string): Promise<ChatConversation> {
    const proposals = getStorage<Proposal[]>('proposals', INITIAL_PROPOSALS);
    const prop = proposals.find((p) => String(p.id) === String(proposalId));
    if (!prop) throw new Error('Proposta não encontrada');
    const conversations = getStorage<ChatConversation[]>('chat_conversations', INITIAL_CHAT_CONVERSATIONS);
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');

    const existing = conversations.find(
      (c) => String(c.proposalId) === String(proposalId) || (String(c.jobId) === String(prop.jobId) && String(c.otherUser.id) === String(prop.lawyerId))
    );
    if (existing) return existing;

    const isClient = currentUser.role === 'CLIENT';
    const newConv: ChatConversation = {
      id: 'conv_' + Date.now(),
      jobId: String(prop.jobId),
      jobTitle: `Negociação: ${prop.jobTitle}`,
      proposalId: String(prop.id),
      proposalValue: prop.value,
      lawyerName: prop.lawyerName,
      clientName: isClient ? currentUser.name : 'Cliente',
      state: 'NEGOCIACAO',
      otherUser: {
        id: isClient ? prop.lawyerId : currentUser.id,
        name: isClient ? prop.lawyerName : currentUser.companyName || currentUser.name,
        avatar: isClient ? prop.lawyerAvatar : currentUser.avatarUrl,
        role: (isClient ? 'LAWYER' : 'CLIENT') as Role,
        oabOrCompany: isClient ? prop.lawyerOab : undefined,
        isOnline: true,
      },
      lastMessage: `Proposta enviada: R$ ${prop.value.toLocaleString('pt-BR')}`,
      lastMessageTime: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      unreadCount: 1,
    };
    setStorage('chat_conversations', [newConv, ...conversations]);

    const allMsgs = getStorage<Record<string, ChatMessage[]>>('chat_messages', INITIAL_CHAT_MESSAGES);
    allMsgs[newConv.id] = [
      {
        id: 'msg_init_' + Date.now(),
        conversationId: newConv.id,
        senderId: prop.lawyerId,
        senderName: prop.lawyerName,
        senderAvatar: prop.lawyerAvatar,
        content: `Olá! Enviei proposta de honorários de R$ ${prop.value.toLocaleString('pt-BR')} (prazo: ${prop.deliveryDays} dias). Estou disponível para alinhar os detalhes antes da assinatura do contrato.`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        isRead: false,
      },
    ];
    setStorage('chat_messages', allMsgs);
    return newConv;
  },
};

// ─────────────────────────────────────────────
// SECTION 11 – REVIEWS API
// ─────────────────────────────────────────────
export const reviewsApi = {
  async getContractReviews(contractId: string): Promise<Review[]> {
    if (!API_CONFIG.useMock) {
      try {
        return await http<Review[]>(`/api/reviews/contract/${contractId}`);
      } catch { /* fall through */ }
    }
    const reviews = getStorage<Review[]>('reviews', []);
    return reviews.filter((r) => String(r.contractId) === String(contractId));
  },

  async submitReview(data: { contractId: string; rating: number; comment: string; detailedRatings?: Record<string, number> }): Promise<{ review: Review; published: boolean }> {
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');

    if (!API_CONFIG.useMock) {
      try {
        const result = await http<Review>(`/api/reviews/create/${data.contractId}`, {
          method: 'POST',
          body: JSON.stringify({ rating: data.rating, comment: data.comment }),
        });
        return { review: result, published: true };
      } catch (e) {
        console.warn('Submit review on backend failed:', e);
      }
    }

    const contracts = getStorage<Contract[]>('contracts', INITIAL_CONTRACTS);
    const contract = contracts.find((c) => String(c.id) === String(data.contractId));
    if (!contract) throw new Error('Contrato não encontrado');
    const isClient = currentUser.role === 'CLIENT';
    const reviews = getStorage<Review[]>('reviews', []);
    const otherIdx = reviews.findIndex((r) => String(r.contractId) === String(data.contractId) && String(r.reviewerId) !== String(currentUser.id));
    const bothReviewed = otherIdx !== -1;
    const newReview: Review = {
      id: 'rev_' + Date.now(),
      contractId: data.contractId,
      jobTitle: contract.jobTitle,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewerAvatar: currentUser.avatarUrl,
      reviewerRole: currentUser.role,
      revieweeId: isClient ? contract.lawyerId : contract.clientId,
      rating: data.rating,
      comment: data.comment,
      detailedRatings: data.detailedRatings,
      createdAt: new Date().toISOString(),
      status: bothReviewed ? 'PUBLISHED' : 'PENDING_OTHER',
    };
    const updated = [newReview, ...reviews];
    if (bothReviewed) updated[otherIdx + 1].status = 'PUBLISHED';
    setStorage('reviews', updated);
    return { review: newReview, published: bothReviewed };
  },
};

// ─────────────────────────────────────────────
// SECTION 12 – LAWYERS DIRECTORY
// ─────────────────────────────────────────────
export const lawyersApi = {
  async getLawyers(): Promise<UserProfile[]> {
    if (!API_CONFIG.useMock) {
      try {
        return await http<UserProfile[]>('/api/users/?role=LAWYER');
      } catch { /* fall through */ }
    }
    return getStorage<UserProfile[]>('lawyers_directory', [INITIAL_LAWYER_USER]);
  },

  async sendDirectInvite(lawyerId: string, caseTitle: string, description: string, value: number): Promise<ChatConversation> {
    const lawyers = await lawyersApi.getLawyers();
    const lawyer = lawyers.find((l) => String(l.id) === String(lawyerId)) || INITIAL_LAWYER_USER;
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');

    const newJob = await jobsApi.createJob({
      title: caseTitle || `Consulta Direta com ${lawyer.name}`,
      description: description || 'Solicitação de consulta direta.',
      type: 'CONSULTING',
      specialty: lawyer.specialties[0] || 'Direito Empresarial',
      urgency: 'HIGH',
      confidentiality: 'STRICTLY_CONFIDENTIAL',
      budgetMin: value,
      budgetMax: value,
      estimatedDeadlineDays: 15,
    });

    const newProposal = await proposalsApi.createProposal({
      jobId: newJob.id,
      jobTitle: newJob.title,
      lawyerId: lawyer.id,
      lawyerName: lawyer.name,
      lawyerAvatar: lawyer.avatarUrl,
      lawyerOab: `OAB/${lawyer.oabState || 'SP'} ${lawyer.oabNumber || '000.000'}`,
      lawyerRating: lawyer.rating,
      value,
      deliveryDays: 15,
      coverLetter: `Convite de contratação direta enviado por ${currentUser.name}.`,
      proposedMilestones: [
        { title: 'Marco 1: Atendimento e Parecer Inicial', description: 'Fase inicial da contratação', value: value * 0.5 },
        { title: 'Marco 2: Conclusão', description: 'Entregáveis finais', value: value * 0.5 },
      ],
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
      try {
        // Backend documents are contract-scoped; try to get all visible
        return await http<AppDocument[]>('/api/documents/list/all');
      } catch { /* fall through */ }
    }
    let docs = getStorage<AppDocument[]>('documents', INITIAL_DOCUMENTS);
    if (category && category !== 'Todos') docs = docs.filter((d) => d.category === category);
    return docs;
  },

  async uploadDocument(docData: Partial<AppDocument>): Promise<AppDocument> {
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');
    const docs = getStorage<AppDocument[]>('documents', INITIAL_DOCUMENTS);
    const newDoc: AppDocument = {
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
    setStorage('documents', [newDoc, ...docs]);
    return newDoc;
  },
};

// ─────────────────────────────────────────────
// SECTION 14 – NOTIFICATIONS API
// ─────────────────────────────────────────────
export const notificationsApi = {
  async getNotifications(): Promise<Notification[]> {
    if (!API_CONFIG.useMock) {
      try {
        return await http<Notification[]>('/api/notifications/');
      } catch { /* fall through */ }
    }
    return getStorage<Notification[]>('notifications', INITIAL_NOTIFICATIONS);
  },

  async getUnreadCount(): Promise<number> {
    if (!API_CONFIG.useMock) {
      try {
        return await http<number>('/api/notifications/unread/count');
      } catch { /* fall through */ }
    }
    const notifs = getStorage<Notification[]>('notifications', INITIAL_NOTIFICATIONS);
    return notifs.filter((n) => !n.isRead).length;
  },

  async markAsRead(id: string): Promise<void> {
    if (!API_CONFIG.useMock) {
      try {
        await http(`/api/notifications/${id}/read`, { method: 'POST' });
      } catch { /* fall through */ }
    }
    const notifs = getStorage<Notification[]>('notifications', INITIAL_NOTIFICATIONS);
    setStorage('notifications', notifs.map((n) => (String(n.id) === String(id) ? { ...n, isRead: true } : n)));
  },

  async markAllAsRead(): Promise<void> {
    if (!API_CONFIG.useMock) {
      try {
        await http('/api/notifications/read-all', { method: 'POST' });
      } catch { /* fall through */ }
    }
    const notifs = getStorage<Notification[]>('notifications', INITIAL_NOTIFICATIONS);
    setStorage('notifications', notifs.map((n) => ({ ...n, isRead: true })));
  },
};

// ─────────────────────────────────────────────
// SECTION 15 – DASHBOARD API
// ─────────────────────────────────────────────
export const dashboardApi = {
  async getMetrics(): Promise<DashboardMetrics> {
    if (!API_CONFIG.useMock) {
      try {
        return await http<DashboardMetrics>('/api/dashboard/metrics');
      } catch { /* fall through */ }
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
    try {
      const response = await fetch('/api/ai/legal-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ processTitle, description }),
      });
      if (response.ok) return await response.json();
    } catch { /* use fallback */ }
    return {
      summary: `Análise técnica preliminar para a demanda "${processTitle}": Identificado risco contencioso moderado com tese fundamentada na jurisprudência do STJ/TJSP.`,
      suggestedStrategy: '1. Pedido de tutela provisória de urgência (Art. 300 CPC).\n2. Produção antecipada de prova pericial financeira.\n3. Proposta de transação judicial.',
      estimatedSuccessRate: '78% de probabilidade de êxito em sede liminar',
      recommendedMilestones: [
        { title: 'Marco 1: Petição Inicial e Tutela de Urgência', description: 'Fundamentação e protocolo emergencial.', estDays: 10 },
        { title: 'Marco 2: Réplica e Audiência de Saneamento', description: 'Impugnação e quesitos periciais.', estDays: 20 },
        { title: 'Marco 3: Parecer Final e Sustentação', description: 'Petição final e sustentação oral.', estDays: 30 },
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
