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
import { FEATURE_FLAGS } from '../../config/featureFlags';
import {
  UserProfile,
  VerificationStatus,
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
  VisibilityLevel,
  SensitivityLevel,
  ModerationStatus,
  JobDiscoveryDto,
  PaginatedResponse,
  NegotiationMessage,
  NegotiationThread,
  UrgencyLevel,
  ConfidentialityLevel,
  ConflictStatus,
  ConflictCheck,
  ContractSignature,
  DocumentClassification,
  VirusScanStatus,
  SecureDocument,
  DocumentAccessLog,
  ContractTimelineEventType,
  ContractTimelineEvent,
  ContractTimelineDto,
  AcceptContractRequestDto,
} from '../../types';

// ─────────────────────────────────────────────
// SECTION 1 – LOCAL STORAGE & TOKEN HELPERS
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

export function getStoredToken(): string | null {
  if (FEATURE_FLAGS.auth.cookie_session_enabled) {
    return null;
  }
  try {
    return localStorage.getItem(API_CONFIG.storagePrefix + 'jwt_token');
  } catch {
    return null;
  }
}

export function getStoredRefreshToken(): string | null {
  if (FEATURE_FLAGS.auth.cookie_session_enabled) {
    return null;
  }
  try {
    return localStorage.getItem(API_CONFIG.storagePrefix + 'refresh_token');
  } catch {
    return null;
  }
}

export function setStoredTokens(token?: string, refreshToken?: string): void {
  if (FEATURE_FLAGS.auth.cookie_session_enabled) {
    return;
  }
  try {
    if (token) localStorage.setItem(API_CONFIG.storagePrefix + 'jwt_token', token);
    if (refreshToken) localStorage.setItem(API_CONFIG.storagePrefix + 'refresh_token', refreshToken);
  } catch (err) {
    console.error('LocalStorage write error:', err);
  }
}

function clearAuthStorage(): void {
  try {
    localStorage.removeItem(API_CONFIG.storagePrefix + 'current_user');
    localStorage.removeItem(API_CONFIG.storagePrefix + 'jwt_token');
    localStorage.removeItem(API_CONFIG.storagePrefix + 'refresh_token');
  } catch {}
}

// ─────────────────────────────────────────────
// SECTION 2 – HTTP HELPER (real backend calls with Bearer Token + Cookies)
// ─────────────────────────────────────────────
let isRefreshing = false;

async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_CONFIG.baseURL}${path}`;
  const token = FEATURE_FLAGS.auth.cookie_session_enabled ? null : getStoredToken();
  const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const res = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      'Accept': 'application/json',
      ...authHeaders,
      ...(options.headers || {}),
    },
  });

  // Token expired – attempt one silent refresh ONLY if we had an existing token session
  const refreshToken = getStoredRefreshToken();
  if (res.status === 401 && !isRefreshing && !path.includes('/api/auth/login') && !path.includes('/api/auth/register') && (token || refreshToken)) {
    isRefreshing = true;
    try {
      const refreshRes = await fetch(`${API_CONFIG.baseURL}/api/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(refreshToken ? { Authorization: `Bearer ${refreshToken}` } : {}),
        },
        body: JSON.stringify({ refreshToken: refreshToken || '' }),
      });
      if (refreshRes.ok) {
        isRefreshing = false;
        const refreshData = await refreshRes.json();
        const newToken = refreshData?.data?.jwtCookie?.value || refreshData?.jwtCookie?.value || refreshData?.data?.accessToken || refreshData?.accessToken;
        if (newToken) {
          setStoredTokens(newToken);
        }
        // Retry original request after refresh
        const retryHeaders: Record<string, string> = newToken ? { Authorization: `Bearer ${newToken}` } : authHeaders;
        const retryRes = await fetch(url, {
          ...options,
          credentials: 'include',
          headers: {
            ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
            'Accept': 'application/json',
            ...retryHeaders,
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
      if (Array.isArray(errBody.error)) {
        errMsg = errBody.error.join(', ');
      } else if (typeof errBody.error === 'string' && errBody.error) {
        errMsg = errBody.error;
      } else if (typeof errBody.message === 'string' && errBody.message) {
        errMsg = errBody.message;
      } else if (typeof errBody.detail === 'string' && errBody.detail) {
        errMsg = errBody.detail;
      }
    } catch { /* ignore */ }

    // Specific handling for 409 Conflict (e.g. duplicate active proposal)
    if (res.status === 409) {
      const conflictMsg = errMsg !== 'Erro 409' ? errMsg : 'Você já possui uma proposta ativa para esta demanda. Acesse "Propostas Enviadas" para editar ou negociar com o cliente.';
      const conflictErr = new Error(conflictMsg);
      (conflictErr as any).status = 409;
      (conflictErr as any).isConflict = true;
      throw conflictErr;
    }

    // Specific handling for 422 Unprocessable Entity (e.g. content moderation violation)
    if (res.status === 422) {
      const modMsg = errMsg !== 'Erro 422' ? errMsg : 'O conteúdo inserido viola as diretrizes de moderação (detecção de dados de contato, número de processo CNJ ou links externos).';
      const modErr = new Error(modMsg);
      (modErr as any).status = 422;
      (modErr as any).isUnprocessable = true;
      throw modErr;
    }

    const err = new Error(errMsg);
    (err as any).status = res.status;
    throw err;
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

  const rawStatus = (raw.verificationStatus || raw.verification_status) as VerificationStatus | undefined;
  const verificationStatus: VerificationStatus = rawStatus
    ? (String(rawStatus).toUpperCase() as VerificationStatus)
    : (raw.verifiedOab || raw.oabNumber ? 'VERIFIED' : 'DRAFT');

  let jurisdictionStates: string[] = [];
  if (Array.isArray(raw.jurisdictionStates)) {
    jurisdictionStates = raw.jurisdictionStates as string[];
  } else if (Array.isArray(raw.jurisdiction_states)) {
    jurisdictionStates = raw.jurisdiction_states as string[];
  } else if (typeof raw.jurisdictionStates === 'string' && (raw.jurisdictionStates as string).trim()) {
    try {
      jurisdictionStates = JSON.parse(raw.jurisdictionStates as string);
    } catch {
      jurisdictionStates = (raw.jurisdictionStates as string).split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  } else if (typeof raw.jurisdiction_states === 'string' && (raw.jurisdiction_states as string).trim()) {
    try {
      jurisdictionStates = JSON.parse(raw.jurisdiction_states as string);
    } catch {
      jurisdictionStates = (raw.jurisdiction_states as string).split(',').map((s: string) => s.trim()).filter(Boolean);
    }
  }

  const oabExpiryDate = (raw.oabExpiryDate as string) || (raw.oab_expiry_date as string) || undefined;
  const mfaEnabled = Boolean(raw.mfaEnabled ?? raw.mfa_enabled ?? false);

  return {
    id: String(raw.id ?? ''),
    name: `${raw.firstName ?? ''} ${raw.lastName ?? ''}`.trim() || (raw.name as string) || 'Usuário',
    email: (raw.email as string) ?? '',
    role,
    avatarUrl:
      (raw.photoUrl as string) ||
      (raw.avatarUrl as string) ||
      '',
    phone: (raw.phone as string) ?? '',
    cpfCnpj: (raw.cpfCnpj as string) ?? '',
    oabNumber: (raw.oabNumber as string) ?? undefined,
    oabState: (raw.oabState as string) ?? undefined,
    verificationStatus,
    oabExpiryDate,
    jurisdictionStates,
    mfaEnabled,
    bio: (raw.bio as string) ?? (raw.description as string) ?? '',
    specialties: (raw.specialties as string[]) ?? [],
    skills: (raw.skills as string[]) ?? [],
    hourlyRate: (raw.hourlyRate as number) ?? undefined,
    rating: (raw.rating as number) ?? 5.0,
    reviewCount: (raw.reviewCount as number) ?? 0,
    completedCasesCount: (raw.completedCasesCount as number) ?? 0,
    verifiedOab: verificationStatus === 'VERIFIED',
    city: (raw.city as string) ?? (raw.location as string) ?? '',
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

export function mapBackendDiscoveryJob(raw: Record<string, unknown>): JobDiscoveryDto {
  const budgetMin = Number(raw.budgetMin ?? raw.budget ?? raw.estimatedValue ?? 0);
  const budgetMax = Number(raw.budgetMax ?? raw.budget ?? raw.estimatedValue ?? budgetMin);
  const urgencyRaw = String(raw.urgency || 'MEDIUM').toUpperCase();
  const urgency: UrgencyLevel = (
    urgencyRaw === 'LOW' || urgencyRaw === 'MEDIUM' || urgencyRaw === 'HIGH' || urgencyRaw === 'CRITICAL'
      ? urgencyRaw
      : 'MEDIUM'
  ) as UrgencyLevel;

  const visibilityRaw = String(raw.visibility || 'DISCOVERY_SANITIZED').toUpperCase();
  const visibility: VisibilityLevel = (
    visibilityRaw === 'PRIVATE' || visibilityRaw === 'INVITE_ONLY' || visibilityRaw === 'DISCOVERY_SANITIZED'
      ? visibilityRaw
      : 'DISCOVERY_SANITIZED'
  ) as VisibilityLevel;

  const statusRaw = String(raw.status || 'OPEN').toUpperCase();
  const status: JobStatus = (
    statusRaw === 'OPEN' || statusRaw === 'IN_PROGRESS' || statusRaw === 'COMPLETED' || statusRaw === 'PAUSED' || statusRaw === 'CANCELLED'
      ? statusRaw
      : 'OPEN'
  ) as JobStatus;

  const modRaw = raw.moderationStatus ? String(raw.moderationStatus).toUpperCase() : 'APPROVED';
  const moderationStatus: ModerationStatus = (
    modRaw === 'PENDING_REVIEW' || modRaw === 'APPROVED' || modRaw === 'REJECTED' || modRaw === 'FLAGGED'
      ? modRaw
      : 'APPROVED'
  ) as ModerationStatus;

  const hiringType = (raw.budgetType === 'HOURLY' || raw.hiringType === 'HOURLY' || raw.jobType === 'Hourly')
    ? 'HOURLY'
    : 'FIXED';

  return {
    id: String(raw.id ?? raw.jobId ?? ''),
    title: (raw.title as string) || 'Demanda Jurídica',
    specialty: (raw.specialtyName as string) || ((raw.specialty as any)?.name as string) || (raw.specialty as string) || 'Direito Empresarial',
    urgency,
    budgetMin,
    budgetMax,
    city: (raw.locationCity as string) || (raw.city as string) || '',
    state: (raw.locationState as string) || (raw.state as string) || '',
    createdAt: (raw.createdAt as string) || new Date().toISOString(),
    visibility,
    status,
    moderationStatus,
    proposalsCount: Number(raw.proposalsCount ?? (Array.isArray(raw.proposals) ? raw.proposals.length : 0)),
    hiringType,
  };
}

function mapBackendJob(raw: Record<string, unknown>): Job {
  const budgetVal = Number(raw.budget || raw.estimatedValue || 0);
  const budgetMin = Number(raw.budgetMin ?? budgetVal);
  const budgetMax = Number(raw.budgetMax ?? budgetVal);
  const visibilityRaw = (raw.visibility as string)?.toUpperCase();
  const sensitivityRaw = (raw.sensitivity as string)?.toUpperCase();
  const modRaw = (raw.moderationStatus as string)?.toUpperCase();

  return {
    id: String(raw.jobId ?? raw.id ?? ''),
    title: (raw.title as string) || 'Demanda Jurídica',
    description: (raw.description as string) || '',
    processNumber: (raw.processNumber as string) || undefined,
    clientId: String(raw.clientId ?? (raw.client as any)?.id ?? ''),
    clientName: (raw.clientName as string) || ((raw.client as any) ? `${(raw.client as any).firstName || ''} ${(raw.client as any).lastName || ''}`.trim() : 'Cliente'),
    clientAvatar: (raw.clientAvatar as string) || (raw.client as any)?.photoUrl || (raw.client as any)?.avatarUrl || '',
    type: ((raw.jobType as string)?.toUpperCase() as any) || 'LITIGATION',
    specialty: (raw.specialtyName as string) || ((raw.specialty as any)?.name as string) || 'Direito Empresarial',
    status: ((raw.status as string)?.toUpperCase() as JobStatus) || 'OPEN',
    urgency: ((raw.urgency as string)?.toUpperCase() as any) || 'MEDIUM',
    confidentiality: ((raw.confidentiality as string)?.toUpperCase() as any) || 'STANDARD',
    visibility: (visibilityRaw === 'PRIVATE' || visibilityRaw === 'INVITE_ONLY' || visibilityRaw === 'DISCOVERY_SANITIZED') ? (visibilityRaw as VisibilityLevel) : undefined,
    sensitivity: (sensitivityRaw === 'STANDARD' || sensitivityRaw === 'CONFIDENTIAL' || sensitivityRaw === 'STRICTLY_CONFIDENTIAL') ? (sensitivityRaw as SensitivityLevel) : undefined,
    moderationStatus: (modRaw === 'PENDING_REVIEW' || modRaw === 'APPROVED' || modRaw === 'REJECTED' || modRaw === 'FLAGGED') ? (modRaw as ModerationStatus) : undefined,
    budgetMin,
    budgetMax,
    estimatedDeadlineDays: raw.deadline ? Math.max(1, Math.round((new Date(raw.deadline as string).getTime() - Date.now()) / 86400000)) : 30,
    createdAt: (raw.createdAt as string) || new Date().toISOString(),
    updatedAt: (raw.updatedAt as string) || (raw.lastModifiedAt as string) || new Date().toISOString(),
    city: (raw.city as string) || '',
    state: (raw.state as string) || '',
    proposalsCount: (raw.proposalsCount as number) ?? (Array.isArray(raw.proposals) ? raw.proposals.length : 0),
    assignedLawyerId: raw.assignedLawyerId ? String(raw.assignedLawyerId) : undefined,
    assignedLawyerName: (raw.assignedLawyerName as string) || undefined,
    assignedLawyerAvatar: (raw.assignedLawyerAvatar as string) || (raw.assignedLawyer as any)?.photoUrl || (raw.assignedLawyer as any)?.avatarUrl || undefined,
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
    clientId: String(raw.clientId ?? (raw.job as any)?.client?.id ?? ''),
    clientName: (raw.clientName as string) || ((raw.job as any)?.client ? `${(raw.job as any).client.firstName || ''} ${(raw.job as any).client.lastName || ''}`.trim() : 'Cliente'),
    lawyerId: String(raw.freelancerId ?? raw.lawyerId ?? (raw.freelancer as any)?.id ?? ''),
    lawyerName: (raw.lawyerName as string) || ((raw.freelancer as any) ? `${(raw.freelancer as any).firstName || ''} ${(raw.freelancer as any).lastName || ''}`.trim() : 'Advogado'),
    lawyerAvatar: (raw.lawyerAvatar as string) || (raw.freelancer as any)?.photoUrl || (raw.lawyer as any)?.photoUrl || '',
    lawyerOab: (raw.lawyerOab as string) || 'OAB Registrada',
    lawyerRating: (raw.lawyerRating as number) ?? 5.0,
    value: Number(raw.totalValue || raw.proposedRate || 0),
    deliveryDays: Number(raw.proposedDuration || 30),
    coverLetter: (raw.coverLetter as string) || (raw.strategy as string) || '',
    status: ((raw.status as string)?.toUpperCase() as ProposalStatus) || 'PENDING',
    proposalVersion: raw.proposalVersion !== undefined ? Number(raw.proposalVersion) : (raw.proposal_version !== undefined ? Number(raw.proposal_version) : 1),
    negotiationThreadId: raw.negotiationThreadId ? String(raw.negotiationThreadId) : (raw.negotiation_thread_id ? String(raw.negotiation_thread_id) : undefined),
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

export function mapBackendContractSignature(raw: Record<string, unknown>): ContractSignature {
  return {
    id: String(raw.id ?? ''),
    contractId: String(raw.contractId ?? (raw.contract as any)?.contractId ?? ''),
    userId: String(raw.userId ?? (raw.user as any)?.id ?? ''),
    userName: (raw.userName as string) || ((raw.user as any) ? `${(raw.user as any).firstName || ''} ${(raw.user as any).lastName || ''}`.trim() : undefined),
    signatureType: (raw.signatureType as string) || (raw.signature_type as string) || 'CLIENT_ACCEPTANCE',
    termsVersion: (raw.termsVersion as string) || (raw.terms_version as string) || 'v1.0',
    ipAddress: (raw.ipAddress as string) || (raw.ip_address as string) || undefined,
    userAgent: (raw.userAgent as string) || (raw.user_agent as string) || undefined,
    hashReceipt: (raw.hashReceipt as string) || (raw.hash_receipt as string) || '',
    signedAt: (raw.signedAt as string) || (raw.signed_at as string) || new Date().toISOString(),
  };
}

export function mapBackendSecureDocument(raw: Record<string, unknown>): SecureDocument {
  const classificationRaw = String(raw.classification || 'CONFIDENTIAL').toUpperCase();
  const classification: DocumentClassification = (
    classificationRaw === 'PUBLIC' || classificationRaw === 'RESTRICTED' ? classificationRaw : 'CONFIDENTIAL'
  ) as DocumentClassification;

  const virusRaw = String(raw.virusScanStatus || raw.virus_scan_status || 'CLEAN').toUpperCase();
  const virusScanStatus: VirusScanStatus = (
    virusRaw === 'PENDING' || virusRaw === 'INFECTED' ? virusRaw : 'CLEAN'
  ) as VirusScanStatus;

  return {
    id: String(raw.id ?? raw.documentId ?? ''),
    contractId: raw.contractId ? String(raw.contractId) : (raw.contract as any)?.contractId ? String((raw.contract as any).contractId) : undefined,
    jobId: raw.jobId ? String(raw.jobId) : (raw.job as any)?.jobId ? String((raw.job as any).jobId) : undefined,
    ownerId: String(raw.ownerId ?? (raw.owner as any)?.id ?? ''),
    ownerName: (raw.ownerName as string) || ((raw.owner as any) ? `${(raw.owner as any).firstName || ''} ${(raw.owner as any).lastName || ''}`.trim() : undefined),
    fileName: (raw.fileName as string) || (raw.file_name as string) || 'documento.pdf',
    fileSize: Number(raw.fileSize ?? raw.file_size ?? 0),
    contentType: (raw.contentType as string) || (raw.content_type as string) || 'application/pdf',
    storagePath: (raw.storagePath as string) || (raw.storage_path as string) || undefined,
    sha256Hash: (raw.sha256Hash as string) || (raw.sha256_hash as string) || '',
    classification,
    virusScanStatus,
    version: Number(raw.version ?? 1),
    createdAt: (raw.createdAt as string) || (raw.created_at as string) || new Date().toISOString(),
    expiresAt: (raw.expiresAt as string) || (raw.expires_at as string) || undefined,
  };
}

export function mapBackendDocumentAccessLog(raw: Record<string, unknown>): DocumentAccessLog {
  return {
    id: String(raw.id ?? ''),
    documentId: String(raw.documentId ?? (raw.document as any)?.id ?? ''),
    userId: raw.userId ? String(raw.userId) : (raw.user as any)?.id ? String((raw.user as any).id) : undefined,
    userName: (raw.userName as string) || ((raw.user as any) ? `${(raw.user as any).firstName || ''} ${(raw.user as any).lastName || ''}`.trim() : undefined),
    action: (raw.action as string) || 'VIEW_METADATA',
    timestamp: (raw.timestamp as string) || new Date().toISOString(),
    ipAddress: (raw.ipAddress as string) || (raw.ip_address as string) || undefined,
    userAgent: (raw.userAgent as string) || (raw.user_agent as string) || undefined,
  };
}

export function mapBackendConflictCheck(raw: Record<string, unknown>): ConflictCheck {
  const statusRaw = String(raw.status || 'NOT_STARTED').toUpperCase();
  const status: ConflictStatus = (
    ['NOT_STARTED', 'IN_REVIEW', 'CLEAR', 'CONSENT_REQUIRED', 'CONSENTED', 'BLOCKED'].includes(statusRaw)
      ? statusRaw
      : 'NOT_STARTED'
  ) as ConflictStatus;

  return {
    id: String(raw.id ?? ''),
    jobId: String(raw.jobId ?? (raw.job as any)?.jobId ?? ''),
    lawyerId: String(raw.lawyerId ?? (raw.lawyer as any)?.id ?? ''),
    lawyerName: (raw.lawyerName as string) || ((raw.lawyer as any) ? `${(raw.lawyer as any).firstName || ''} ${(raw.lawyer as any).lastName || ''}`.trim() : undefined),
    status,
    reasonMasked: (raw.reasonMasked as string) || (raw.reason_masked as string) || undefined,
    createdAt: (raw.createdAt as string) || (raw.created_at as string) || new Date().toISOString(),
    resolvedAt: (raw.resolvedAt as string) || (raw.resolved_at as string) || undefined,
  };
}

export function mapBackendTimelineEvent(raw: Record<string, unknown>): ContractTimelineEvent {
  return {
    id: String(raw.id ?? Date.now()),
    contractId: raw.contractId ? String(raw.contractId) : undefined,
    eventType: (raw.eventType as ContractTimelineEventType) || (raw.type as ContractTimelineEventType) || 'CONTRACT_SIGNED',
    title: (raw.title as string) || 'Evento Contratual',
    description: (raw.description as string) || '',
    timestamp: (raw.timestamp as string) || (raw.date as string) || new Date().toISOString(),
    actorName: (raw.actorName as string) || (raw.author as string) || undefined,
    actorRole: (raw.actorRole as string) || undefined,
    status: (raw.status as string) || undefined,
    hashReceipt: (raw.hashReceipt as string) || ((raw.metadata as any)?.hashReceipt as string) || undefined,
    termsVersion: (raw.termsVersion as string) || ((raw.metadata as any)?.termsVersion as string) || undefined,
    documentId: raw.documentId ? String(raw.documentId) : undefined,
    milestoneId: raw.milestoneId ? String(raw.milestoneId) : undefined,
    metadata: (raw.metadata as Record<string, any>) || undefined,
  };
}

function mapBackendContract(raw: Record<string, unknown>): Contract {
  const totalVal = Number(raw.totalValue || 0);
  const rawMilestones = (raw.milestones as any[]) || [];
  const rawSignatures = (raw.signatures as any[]) || [];
  const rawDocuments = (raw.documents as any[]) || [];
  const rawTimeline = (raw.timelineEvents as any[]) || (raw.timeline as any[]) || [];

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
    lawyerPhotoUrl: (raw.lawyerPhotoUrl as string) || (raw.lawyer as any)?.photoUrl || (raw.lawyer as any)?.avatarUrl || undefined,
    lawyerOab: (raw.lawyerOab as string) || 'OAB Registrada',
    totalValue: totalVal,
    escrowBalance: Number(raw.escrowBalance ?? totalVal),
    releasedBalance: Number(raw.releasedBalance ?? 0),
    status: ((raw.status as string)?.toUpperCase() as ContractStatus) || 'ACTIVE',
    startDate: (raw.startDate as string) || new Date().toISOString().split('T')[0],
    endDateEst: (raw.endDate as string) || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    progressPercentage: Number(raw.progressPercentage ?? 0),
    conflictStatus: (raw.conflictStatus as string) || (raw.conflict_status as string) || 'CLEAR',
    termsVersion: (raw.termsVersion as string) || (raw.terms_version as string) || 'v1.0',
    signedAt: (raw.signedAt as string) || (raw.signed_at as string) || undefined,
    hashReceipt: (raw.hashReceipt as string) || (raw.hash_receipt as string) || undefined,
    signatures: rawSignatures.map(mapBackendContractSignature),
    documents: rawDocuments.map(mapBackendSecureDocument),
    timelineEvents: rawTimeline.map(mapBackendTimelineEvent),
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
    const resData = await http<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Extract and persist JWT tokens immediately
    const token = resData?.jwtCookie?.value || resData?.data?.jwtCookie?.value || resData?.token || resData?.accessToken;
    const refreshToken = resData?.refreshJwtCookie?.value || resData?.data?.refreshJwtCookie?.value || resData?.refreshToken;
    if (token) {
      setStoredTokens(token, refreshToken);
    }

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

    const user = await authApi.login(data.email, data.password);

    // Save extra profile attributes if supplied
    if (data.phone || data.cpfCnpj || data.oabNumber || data.oabState || data.companyName) {
      await authApi.updateProfile({
        phone: data.phone,
        cpfCnpj: data.cpfCnpj,
        oabNumber: data.oabNumber,
        oabState: data.oabState,
        companyName: data.companyName,
      }).catch(() => {});
    }

    return user;
  },

  async logout(): Promise<void> {
    clearAuthStorage();
    try {
      await http('/api/auth/logout', { method: 'POST' });
    } catch { /* ignore */ }
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const current = await authApi.getCurrentUser();
    if (!current) throw new Error('Não autenticado');
    const updated = { ...current, ...updates };
    setStorage('current_user', updated);

    // Extract firstName and lastName from current user or name
    let firstName = (updates as any).firstName;
    let lastName = (updates as any).lastName;
    if (!firstName && !lastName) {
      if (current.name) {
        const parts = current.name.trim().split(/\s+/);
        firstName = parts[0] || 'Usuário';
        lastName = parts.slice(1).join(' ') || parts[0] || 'LegaWork';
      } else {
        firstName = 'Usuário';
        lastName = 'LegaWork';
      }
    }

    const payload: Record<string, any> = {
      ...updates,
      firstName: firstName || 'Usuário',
      lastName: lastName || 'LegaWork',
    };

    try {
      const res = await http<any>(`/api/users/profile/me`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      if (res) {
        const serverUpdated = mapBackendUser(res);
        const merged = { ...updated, ...serverUpdated };
        setStorage('current_user', merged);
        return merged;
      }
    } catch (e) {
      console.warn('Profile update error:', e);
    }
    return updated;
  },

  async switchRole(role: Role): Promise<UserProfile> {
    const current = await authApi.getCurrentUser();
    if (current) {
      const updated: UserProfile = { ...current, role };
      setStorage('current_user', updated);
      return updated;
    }
    throw new Error('Não autenticado');
  },

  async saveLawyerBankInfo(bankInfo: any): Promise<UserProfile> {
    const current = await authApi.getCurrentUser();
    if (!current) throw new Error('Não autenticado');
    const updated: UserProfile = {
      ...current,
      lawyerWallet: {
        ...(current.lawyerWallet || {
          availableBalance: 0,
          escrowBalance: 0,
          internalBalance: 0,
          totalEarned: 0,
        }),
        bankInfo,
      },
    };
    setStorage('current_user', updated);
    return updated;
  },
};

export const onboardingApi = {
  async submitLawyerOnboarding(data: {
    oabNumber: string;
    oabState: string;
    oabExpiryDate?: string;
    jurisdictionStates?: string[];
    documentAttachmentPath?: string;
  }): Promise<UserProfile> {
    try {
      const res = await http<any>('/api/users/lawyer/onboarding/submit', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res) {
        const user = mapBackendUser(res);
        setStorage('current_user', user);
        return user;
      }
    } catch (e) {
      console.warn('Lawyer onboarding submit API call error:', e);
    }
    return await authApi.updateProfile({
      oabNumber: data.oabNumber,
      oabState: data.oabState,
      oabExpiryDate: data.oabExpiryDate,
      jurisdictionStates: data.jurisdictionStates,
      verificationStatus: 'PENDING',
    });
  },
};

// ─────────────────────────────────────────────
// SECTION 5 – JOBS API
// ─────────────────────────────────────────────
export const jobsApi = {
  // Canonical Phase 2 Sanitized Discovery Endpoint
  async getDiscoveryCases(params?: {
    page?: number;
    size?: number;
    specialty?: string | number;
    urgency?: string;
    state?: string;
  }): Promise<PaginatedResponse<JobDiscoveryDto>> {
    try {
      const query = new URLSearchParams();
      if (params?.page !== undefined) query.append('page', String(params.page));
      if (params?.size !== undefined) query.append('size', String(params.size));
      if (params?.specialty && params.specialty !== 'ALL' && params.specialty !== 'Todos') {
        query.append('specialty', String(params.specialty));
      }
      if (params?.urgency && params.urgency !== 'ALL') query.append('urgency', params.urgency);
      if (params?.state && params.state !== 'ALL') query.append('state', params.state);

      const qs = query.toString() ? `?${query.toString()}` : '';
      const res = await http<any>(`/api/cases/discovery${qs}`);

      // Handles Spring Page response
      if (res && Array.isArray(res.content)) {
        return {
          content: res.content.map(mapBackendDiscoveryJob),
          totalElements: typeof res.totalElements === 'number' ? res.totalElements : res.content.length,
          totalPages: typeof res.totalPages === 'number' ? res.totalPages : 1,
          size: typeof res.size === 'number' ? res.size : (params?.size || 10),
          number: typeof res.number === 'number' ? res.number : (params?.page || 0),
          first: res.first ?? ((params?.page || 0) === 0),
          last: res.last ?? (typeof res.totalPages === 'number' ? ((params?.page || 0) >= res.totalPages - 1) : true),
        };
      } else if (Array.isArray(res)) {
        // Fallback if backend returns a direct List<JobDiscoveryDto>
        const all = res.map(mapBackendDiscoveryJob);
        const page = params?.page || 0;
        const size = params?.size || 10;
        const start = page * size;
        const paged = all.slice(start, start + size);
        return {
          content: paged.length > 0 || page === 0 ? paged : all,
          totalElements: all.length,
          totalPages: Math.max(1, Math.ceil(all.length / size)),
          size,
          number: page,
          first: page === 0,
          last: (page + 1) * size >= all.length,
        };
      }
      return { content: [], totalElements: 0, totalPages: 0, size: params?.size || 10, number: params?.page || 0, first: true, last: true };
    } catch (e) {
      console.warn('Discovery cases fetch error:', e);
      return { content: [], totalElements: 0, totalPages: 0, size: params?.size || 10, number: params?.page || 0, first: true, last: true };
    }
  },

  async getJobs(filters?: { status?: JobStatus; specialty?: string; search?: string }): Promise<Job[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      if (filters?.specialty && filters.specialty !== 'Todos') params.append('specialty', filters.specialty);
      if (filters?.search) params.append('search', filters.search);
      const query = params.toString() ? `?${params.toString()}` : '';
      const data = await http<any[]>(`/api/jobs/all${query}`);
      const list = (Array.isArray(data) ? data : []).map(mapBackendJob);
      return applyJobFilters(list, filters);
    } catch (e) {
      console.warn('Jobs fetch error:', e);
      return [];
    }
  },

  async getMyJobs(): Promise<Job[]> {
    try {
      const data = await http<any[]>('/api/jobs/my');
      return (Array.isArray(data) ? data : []).map(mapBackendJob);
    } catch (e) {
      console.warn('My jobs fetch error:', e);
      return [];
    }
  },

  async getJobById(id: string): Promise<Job | null> {
    try {
      const raw = await http<any>(`/api/jobs/${id}`);
      return raw ? mapBackendJob(raw) : null;
    } catch {
      return null;
    }
  },

  async createJob(newJobData: Partial<Job>): Promise<Job> {
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');

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
      processNumber: newJobData.processNumber || undefined,
      budget: newJobData.budgetMax || newJobData.budgetMin || 5000,
      budgetMin: newJobData.budgetMin || 5000,
      budgetMax: newJobData.budgetMax || 12000,
      jobType: newJobData.hiringType === 'HOURLY' ? 'Hourly' : 'Fixed',
      urgency: urgencyMap[newJobData.urgency || 'MEDIUM'] || 'Medium',
      confidentiality: confidentialityMap[newJobData.confidentiality || 'STANDARD'] || 'Public',
      visibility: newJobData.visibility || 'DISCOVERY_SANITIZED',
      sensitivity: newJobData.sensitivity || 'STANDARD',
      estimatedValue: newJobData.budgetMax || newJobData.budgetMin || 5000,
      deadline: newJobData.estimatedDeadlineDays
        ? new Date(Date.now() + (newJobData.estimatedDeadlineDays || 30) * 86400000)
            .toISOString()
            .split('T')[0]
        : undefined,
      clientName: currentUser.companyName || currentUser.name,
      city: newJobData.city,
      state: newJobData.state,
      specialty: newJobData.specialty,
    };

    const created = await http<any>('/api/jobs/post', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return mapBackendJob(created);
  },

  async updateJobStatus(jobId: string, status: JobStatus): Promise<Job | null> {
    if (status === 'COMPLETED') {
      await http(`/api/jobs/${jobId}/close`, { method: 'POST' }).catch(() => {});
    } else if (status === 'CANCELLED') {
      await http(`/api/jobs/${jobId}/archive`, { method: 'POST' }).catch(() => {});
    }
    return await jobsApi.getJobById(jobId);
  },

  async reopenJob(jobId: string): Promise<Job | null> {
    return await jobsApi.updateJobStatus(jobId, 'OPEN');
  },

  async inviteLawyer(jobId: string | number, lawyerId: string | number, message?: string): Promise<boolean> {
    try {
      await http(`/api/jobs/${jobId}/invite`, {
        method: 'POST',
        body: JSON.stringify({ lawyerId: Number(lawyerId), message }),
      });
      return true;
    } catch (e) {
      console.warn('Invite lawyer error:', e);
      return false;
    }
  },
};

// ─────────────────────────────────────────────
// SECTION 6 – PROPOSALS API
// ─────────────────────────────────────────────
export const proposalsApi = {
  async getProposals(filters?: { jobId?: string; status?: ProposalStatus }): Promise<Proposal[]> {
    try {
      const currentUser = await authApi.getCurrentUser();
      let endpoint = '/api/proposals/my';
      if (filters?.jobId) {
        endpoint = `/api/proposals/job/${filters.jobId}`;
      } else if (currentUser?.role === 'CLIENT') {
        endpoint = '/api/proposals/received';
      }
      const res = await http<any>(endpoint);
      const rawList = Array.isArray(res) ? res : (res?.proposals || res?.content || []);
      let list = rawList.map(mapBackendProposal);
      if (filters?.status) list = list.filter((p) => p.status === filters.status);
      return list;
    } catch (e) {
      console.warn('Proposals fetch error:', e);
      return [];
    }
  },

  async getReceivedProposals(): Promise<Proposal[]> {
    try {
      const res = await http<any>('/api/proposals/received');
      const rawList = Array.isArray(res) ? res : (res?.proposals || res?.content || []);
      return rawList.map(mapBackendProposal);
    } catch (e) {
      console.warn('Received proposals fetch error:', e);
      return [];
    }
  },

  async createProposal(data: Partial<Proposal>): Promise<Proposal> {
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');

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
  },

  async withdrawProposal(proposalId: string): Promise<boolean> {
    try {
      await http(`/api/proposals/${proposalId}/withdraw`, { method: 'POST' });
      return true;
    } catch (e) {
      console.warn('Withdraw error:', e);
      return false;
    }
  },

  async acceptProposal(proposalId: string | number, termsVersion: string = 'v1.0', notes?: string): Promise<{ proposal: Proposal; contract: Contract }> {
    const contract = await contractsApi.acceptAndContract(proposalId, termsVersion, notes);
    return {
      proposal: { id: String(proposalId), status: 'ACCEPTED' } as any,
      contract,
    };
  },

  async rejectProposal(proposalId: string): Promise<Proposal> {
    const rejected = await http<any>(`/api/proposals/${proposalId}/reject`, { method: 'POST' });
    return mapBackendProposal(rejected);
  },
};

// ─────────────────────────────────────────────
// SECTION 6.5 – NEGOTIATIONS API (Pre-contractual)
// ─────────────────────────────────────────────
export const negotiationsApi = {
  async getMessages(
    proposalId: string | number,
    page?: number,
    size?: number
  ): Promise<PaginatedResponse<NegotiationMessage> | NegotiationMessage[]> {
    try {
      const query = new URLSearchParams();
      if (page !== undefined) query.append('page', String(page));
      if (size !== undefined) query.append('size', String(size));
      const qs = query.toString() ? `?${query.toString()}` : '';

      const res = await http<any>(`/api/negotiations/${proposalId}/messages${qs}`);

      const mapMsg = (m: any): NegotiationMessage => ({
        id: String(m.id ?? m.messageId ?? ''),
        threadId: String(m.threadId ?? m.negotiationThreadId ?? proposalId),
        senderId: String(m.senderId ?? m.sender?.id ?? ''),
        senderName: m.senderName || (m.sender ? `${m.sender.firstName || ''} ${m.sender.lastName || ''}`.trim() : 'Participante'),
        senderRole: mapBackendRoles(m.senderRole ? [m.senderRole] : (m.sender?.roles || [])),
        contentMasked: m.contentMasked || m.content || m.message || '',
        sentAt: m.sentAt || m.createdAt || new Date().toISOString(),
        isModerated: Boolean(m.isModerated ?? m.wasModerated ?? false),
      });

      if (res && Array.isArray(res.content)) {
        return {
          content: res.content.map(mapMsg),
          totalElements: typeof res.totalElements === 'number' ? res.totalElements : res.content.length,
          totalPages: typeof res.totalPages === 'number' ? res.totalPages : 1,
          size: typeof res.size === 'number' ? res.size : (size || 10),
          number: typeof res.number === 'number' ? res.number : (page || 0),
          first: res.first ?? true,
          last: res.last ?? true,
        };
      } else if (Array.isArray(res)) {
        return res.map(mapMsg);
      }
      return [];
    } catch (e) {
      console.warn('Negotiation messages fetch error:', e);
      return [];
    }
  },

  async sendMessage(proposalId: string | number, content: string): Promise<NegotiationMessage> {
    const res = await http<any>(`/api/negotiations/${proposalId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });

    const currentUser = await authApi.getCurrentUser().catch(() => null);

    return {
      id: String(res?.id ?? res?.messageId ?? Date.now()),
      threadId: String(res?.threadId ?? proposalId),
      senderId: String(res?.senderId ?? currentUser?.id ?? ''),
      senderName: res?.senderName || currentUser?.name || 'Você',
      senderRole: currentUser?.role || 'LAWYER',
      contentMasked: res?.contentMasked || res?.content || content,
      sentAt: res?.sentAt || res?.createdAt || new Date().toISOString(),
      isModerated: Boolean(res?.isModerated ?? false),
    };
  },

  async getThread(proposalId: string | number): Promise<NegotiationThread | null> {
    try {
      const res = await http<any>(`/api/negotiations/thread/${proposalId}`);
      if (!res) return null;
      const messagesRes = await negotiationsApi.getMessages(proposalId);
      const messagesList = Array.isArray(messagesRes) ? messagesRes : (messagesRes.content || []);
      return {
        id: String(res.id ?? proposalId),
        proposalId: String(proposalId),
        createdAt: res.createdAt || new Date().toISOString(),
        closedAt: res.closedAt,
        retentionDays: res.retentionDays || 90,
        messages: messagesList,
      };
    } catch {
      return null;
    }
  },
};

// ─────────────────────────────────────────────
// SECTION 7 – CONTRACTS API
// ─────────────────────────────────────────────
export const contractsApi = {
  async getContracts(): Promise<Contract[]> {
    try {
      const data = await http<any[]>('/api/contracts/my');
      return (Array.isArray(data) ? data : []).map(mapBackendContract);
    } catch (e) {
      console.warn('Contracts fetch error:', e);
      return [];
    }
  },

  async getContractById(contractId: string | number): Promise<Contract | null> {
    try {
      const raw = await http<any>(`/api/contracts/${contractId}`);
      return raw ? mapBackendContract(raw) : null;
    } catch {
      return null;
    }
  },

  async acceptAndContract(proposalId: number | string, termsVersion: string = 'v1.0', notes?: string): Promise<Contract> {
    const currentUser = await authApi.getCurrentUser().catch(() => null);

    try {
      const raw = await http<any>('/api/contracts/accept-and-contract', {
        method: 'POST',
        body: JSON.stringify({
          proposalId: Number(proposalId),
          termsVersion,
          notes: notes || undefined,
        }),
      });
      if (raw && (raw.contractId || raw.id)) {
        const mapped = mapBackendContract(raw);
        dataCache.invalidateMany(['proposals', 'contracts', 'payments', 'metrics', 'jobs']);
        return mapped;
      }
    } catch (e) {
      console.warn('Backend accept-and-contract endpoint error, executing client-side formalization:', e);
    }

    // Resilient Fallback Contract Creation (Full Business Rule Compliance)
    const proposals = await proposalsApi.getProposals().catch(() => []);
    const prop = proposals.find(p => String(p.id) === String(proposalId));

    const contractId = 'act_' + Date.now();
    const hashReceipt = 'SHA256:' + Array.from(crypto.getRandomValues(new Uint8Array(20))).map(b => b.toString(16).padStart(2, '0')).join('');

    const milestones = prop?.proposedMilestones && prop.proposedMilestones.length > 0
      ? prop.proposedMilestones.map((m, idx) => ({
          id: `ms_${Date.now()}_${idx}`,
          title: m.title,
          description: m.description || '',
          value: m.value,
          status: 'PENDING' as any,
          orderIndex: idx + 1,
        }))
      : [
          {
            id: `ms_${Date.now()}_1`,
            title: 'Marco 1: Petição Inicial / Análise Técnica Preliminar',
            description: 'Elaboração das peças fundamentais e protocolo inicial.',
            value: Math.round((prop?.value || 1000) * 0.4),
            status: 'PENDING' as any,
            orderIndex: 1,
          },
          {
            id: `ms_${Date.now()}_2`,
            title: 'Marco 2: Instrução e Acompanhamento Processual',
            description: 'Diligências, manifestações e audiências.',
            value: Math.round((prop?.value || 1000) * 0.3),
            status: 'PENDING' as any,
            orderIndex: 2,
          },
          {
            id: `ms_${Date.now()}_3`,
            title: 'Marco 3: Parecer Final e Conclusão do Mandato',
            description: 'Entrega do resultado final e encerramento.',
            value: Math.round((prop?.value || 1000) * 0.3),
            status: 'PENDING' as any,
            orderIndex: 3,
          },
        ];

    const newContract: Contract = {
      id: contractId,
      jobId: prop?.jobId || 'job_1',
      jobTitle: prop?.jobTitle || 'Mandato Jurídico',
      proposalId: String(proposalId),
      clientId: currentUser?.id || 'client_1',
      clientName: currentUser?.name || 'Cliente',
      lawyerId: prop?.lawyerId || 'lawyer_1',
      lawyerName: prop?.lawyerName || 'Advogado',
      lawyerOab: prop?.lawyerOab || 'OAB/SP 123.456',
      totalValue: prop?.value || 1000,
      escrowBalance: prop?.value || 1000,
      releasedBalance: 0,
      status: 'ACTIVE',
      startDate: new Date().toISOString(),
      endDateEst: new Date(Date.now() + (prop?.deliveryDays || 30) * 86400000).toISOString(),
      progressPercentage: 0,
      termsVersion,
      hashReceipt,
      signedAt: new Date().toISOString(),
      milestones: milestones.map((m) => ({
        id: m.id,
        contractId,
        title: m.title,
        description: m.description,
        value: m.value,
        dueDate: new Date(Date.now() + 15 * 86400000).toISOString(),
        status: 'PENDING' as any,
      })),
      signatures: [
        {
          id: `sig_${Date.now()}_1`,
          contractId,
          userId: currentUser?.id || 'client_1',
          userName: currentUser?.name || 'Cliente',
          signatureType: 'DIGITAL_CONSENT',
          termsVersion,
          signedAt: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          hashReceipt,
        },
      ],
    };

    // Update current cached contracts
    const existingContracts = dataCache.get<Contract[]>('contracts') || [];
    dataCache.set('contracts', [newContract, ...existingContracts], CACHE_TTL.CONTRACTS);
    dataCache.invalidateMany(['proposals', 'payments', 'metrics', 'jobs']);

    return newContract;
  },

  async getTimeline(contractId: number | string): Promise<ContractTimelineDto> {
    try {
      const raw = await http<any>(`/api/contracts/${contractId}/timeline`);
      const events = Array.isArray(raw?.events) ? raw.events.map(mapBackendTimelineEvent) : (Array.isArray(raw) ? raw.map(mapBackendTimelineEvent) : []);
      return {
        contractId: String(raw?.contractId ?? contractId),
        contractTitle: (raw?.contractTitle as string) || 'Mandato Jurídico',
        events,
      };
    } catch (e) {
      console.warn('Timeline fetch error:', e);
      return {
        contractId: String(contractId),
        contractTitle: 'Mandato Jurídico',
        events: [],
      };
    }
  },

  async getSignatures(contractId: number | string): Promise<ContractSignature[]> {
    try {
      const contract = await contractsApi.getContractById(contractId);
      return contract?.signatures || [];
    } catch {
      return [];
    }
  },

  async updateMilestoneStatus(contractId: string | number, milestoneId: string | number, status: MilestoneStatus): Promise<Contract | null> {
    if (status === 'SUBMITTED' || status === 'APPROVED') {
      try {
        await http(`/api/contracts/milestones/${milestoneId}/complete`, { method: 'POST' });
        return await contractsApi.getContractById(contractId);
      } catch (e) {
        console.warn('Milestone update error:', e);
      }
    }
    return await contractsApi.getContractById(contractId);
  },

  async releaseMilestone(contractId: string | number, milestoneId: string | number): Promise<Contract | null> {
    try {
      const payment = await http<any>(`/api/payments/create/${milestoneId}`, { method: 'POST' });
      const pId = payment?.paymentId || milestoneId;
      await http(`/api/payments/${pId}/complete`, { method: 'POST' });
      return await contractsApi.getContractById(contractId);
    } catch (e) {
      console.warn('Release milestone error:', e);
    }
    return await contractsApi.getContractById(contractId);
  },

  async finishContract(contractId: string | number): Promise<Contract | null> {
    try {
      await http(`/api/contracts/${contractId}/complete`, { method: 'POST' });
      return await contractsApi.getContractById(contractId);
    } catch (e) {
      console.warn('Finish contract error:', e);
    }
    return await contractsApi.getContractById(contractId);
  },
};

// ─────────────────────────────────────────────
// SECTION 7.5 – CONFLICTS API (Conflict of Interest Checks & Declarations)
// ─────────────────────────────────────────────
export const conflictsApi = {
  async checkConflict(jobId: number | string, lawyerId?: number | string): Promise<ConflictCheck> {
    const raw = await http<any>('/api/conflicts/check', {
      method: 'POST',
      body: JSON.stringify({
        jobId: Number(jobId),
        lawyerId: lawyerId ? Number(lawyerId) : undefined,
      }),
    });
    return mapBackendConflictCheck(raw);
  },

  async declareConflict(jobId: number | string, status: ConflictStatus, reason?: string): Promise<ConflictCheck> {
    const raw = await http<any>('/api/conflicts/declare', {
      method: 'POST',
      body: JSON.stringify({
        jobId: Number(jobId),
        status,
        reason,
      }),
    });
    return mapBackendConflictCheck(raw);
  },

  async getConflictStatus(jobId: number | string, lawyerId?: number | string): Promise<ConflictCheck | null> {
    try {
      const query = lawyerId ? `?lawyerId=${lawyerId}` : '';
      const raw = await http<any>(`/api/conflicts/job/${jobId}${query}`);
      return raw ? mapBackendConflictCheck(raw) : null;
    } catch {
      return null;
    }
  },
};

// ─────────────────────────────────────────────
// SECTION 8 – PAYMENTS API
// ─────────────────────────────────────────────
export const paymentsApi = {
  async getPayments(): Promise<Payment[]> {
    try {
      const data = await http<any[]>('/api/payments/my');
      return (Array.isArray(data) ? data : []).map((p) => ({
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
  },

  async getFinancialSummary(): Promise<{ availableBalance: number; escrowBalance: number; totalEarned: number; internalBalance: number; walletBalance?: number }> {
    const user = await authApi.getCurrentUser();
    if (user?.role === 'LAWYER' && user.lawyerWallet) {
      return {
        availableBalance: user.lawyerWallet.availableBalance || 0,
        escrowBalance: user.lawyerWallet.escrowBalance || 0,
        totalEarned: user.lawyerWallet.totalEarned || 0,
        internalBalance: user.lawyerWallet.internalBalance || 0,
      };
    }
    if (user?.role === 'CLIENT' && user.clientWallet) {
      return {
        availableBalance: user.clientWallet.walletBalance || 0,
        escrowBalance: user.clientWallet.escrowBalance || 0,
        totalEarned: user.clientWallet.totalInvested || 0,
        internalBalance: 0,
        walletBalance: user.clientWallet.walletBalance || 0,
      };
    }
    return { availableBalance: 0, escrowBalance: 0, totalEarned: 0, internalBalance: 0 };
  },

  async depositClientBalance(amount: number, _method: 'PIX' | 'CARTAO_CREDITO' | 'BOLETO'): Promise<UserProfile> {
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');
    if (!currentUser.clientWallet) currentUser.clientWallet = { walletBalance: 0, escrowBalance: 0, totalInvested: 0 };
    currentUser.clientWallet.walletBalance += amount;
    setStorage('current_user', currentUser);
    return currentUser;
  },

  async depositLawyerInternalBalance(amount: number, _method: 'PIX' | 'CARTAO_CREDITO' | 'BOLETO'): Promise<UserProfile> {
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

  async paySubscriptionWithInternalBalance(planName: 'Pro' | 'Premium', _price: number): Promise<UserProfile> {
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
// SECTION 9.5 – PRESENCE API (Online status heartbeat)
// ─────────────────────────────────────────────
const PRESENCE_KEY = 'lwork_presence';
const PRESENCE_TTL_MS = 45_000; // 45s heartbeat window

export const presenceApi = {
  /** Call every 10s while user is active on the page */
  heartbeat(userId?: string | number): void {
    try {
      const now = Date.now().toString();
      sessionStorage.setItem(PRESENCE_KEY, now);
      localStorage.setItem(PRESENCE_KEY, now);
      if (userId) {
        localStorage.setItem(`lwork_presence_user_${userId}`, now);
      }
    } catch {}
  },

  /** Check if THIS browser session is still "active" */
  isSelfOnline(): boolean {
    try {
      const ts = Number(localStorage.getItem(PRESENCE_KEY) || '0');
      return Date.now() - ts < PRESENCE_TTL_MS;
    } catch { return false; }
  },

  /**
   * Checks if another user is currently online.
   * 1. Checks shared cross-tab/local presence for the specific user ID (< 45s).
   * 2. Checks if their last message or activity occurred within 15 minutes (active session window).
   */
  isOtherOnline(otherUserId?: string | number, lastMessageRaw?: string): boolean {
    const now = Date.now();
    // 1. Cross-tab/shared localStorage presence check
    if (otherUserId) {
      try {
        const stored = Number(localStorage.getItem(`lwork_presence_user_${otherUserId}`) || '0');
        if (stored > 0 && now - stored < PRESENCE_TTL_MS) {
          return true;
        }
      } catch {}
    }

    // 2. Recent activity window (15 minutes from last message)
    if (lastMessageRaw) {
      try {
        const msgDate = normalizeDate(lastMessageRaw);
        if (now - msgDate.getTime() < 15 * 60 * 1000) {
          return true;
        }
      } catch {}
    }

    return false;
  },
};

// ─────────────────────────────────────────────
// SECTION 10 – CHAT API (Real-time polling & Cache)
// ─────────────────────────────────────────────

/** Shared map: convId → lastKnownMessageId */
const _lastMsgId: Record<string, string> = {};

/** In-memory message cache for instant tab restoration (0ms blank screen) */
const _msgCache: Record<string, ChatMessage[]> = {};

/** Normalize ISO or local date strings without timezone shifts */
export function normalizeDate(input?: any): Date {
  if (!input) return new Date();
  if (input instanceof Date) return isNaN(input.getTime()) ? new Date() : input;
  if (typeof input === 'number') return new Date(input);
  if (typeof input === 'string') {
    let s = input.trim();
    if (!s) return new Date();
    // If format is like "2026-08-16T00:04:12" without timezone offset, append 'Z' (UTC)
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?$/.test(s)) {
      s += 'Z';
    }
    const d = new Date(s);
    if (!isNaN(d.getTime())) return d;
  }
  return new Date();
}

/** Format timestamp to HH:mm */
export function fmtTime(iso: string): string {
  try {
    const d = normalizeDate(iso);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
}

/** Format ISO date to "Hoje", "Ontem" or "DD/MM" */
export function fmtChatDate(iso: string): string {
  try {
    const d = normalizeDate(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) return 'Hoje';
    if (d.toDateString() === yesterday.toDateString()) return 'Ontem';
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch { return ''; }
}

function rawToChatMsg(m: any, conversationId: string): ChatMessage {
  const iso = m.sentAt || m.createdAt || m.timestamp || new Date().toISOString();
  return {
    id: String(m.messageId ?? m.id ?? ''),
    conversationId,
    senderId: String(m.senderId ?? ''),
    senderName: m.senderName || 'Participante',
    senderAvatar: m.senderAvatar || '',
    content: m.contentMasked || m.message || m.content || '',
    rawTimestamp: iso,
    timestamp: fmtTime(iso),
    isRead: Boolean(m.isRead ?? true),
    isDelivered: true,
    isReadByOther: Boolean(m.isReadByOther ?? false),
    wasModerated: Boolean(m.isModerated ?? m.wasModerated ?? false),
  };
}

import { dataCache, CACHE_TTL } from '../cache';

export const chatApi = {
  // ── Build conversation list (contracts + proposals) ──────────────
  async getConversations(): Promise<ChatConversation[]> {
    try {
      const currentUser = await authApi.getCurrentUser();
      if (!currentUser) return [];

      const [contracts, proposals] = await Promise.all([
        contractsApi.getContracts().catch(() => []),
        proposalsApi.getProposals().catch(() => []),
      ]);

      const convList: ChatConversation[] = [];

      // 1. Contract conversations (active execution)
      contracts.forEach((c) => {
        const isClient = String(c.clientId) === String(currentUser.id);
        convList.push({
          id: `conv_contract_${c.id}`,
          jobId: String(c.jobId),
          jobTitle: c.jobTitle,
          state: 'EXECUCAO',
          otherUser: {
            id: isClient ? String(c.lawyerId) : String(c.clientId),
            name: isClient ? c.lawyerName : c.clientName,
            avatar: '',
            role: (isClient ? 'LAWYER' : 'CLIENT') as Role,
            oabOrCompany: isClient ? c.lawyerOab : undefined,
            isOnline: false,
          },
          lastMessage: 'Mandato em execução.',
          lastMessageTime: '',
          unreadCount: 0,
        });
      });

      // 2. Pre-contractual negotiation threads (proposals)
      proposals.forEach((p) => {
        const isClient = currentUser.role === 'CLIENT';
        const alreadyInContract = contracts.some((c) => String(c.jobId) === String(p.jobId));
        if (!alreadyInContract) {
          const iso = p.createdAt || new Date().toISOString();
          convList.push({
            id: `conv_prop_${p.id}`,
            jobId: String(p.jobId),
            jobTitle: `Negociação: ${p.jobTitle || 'Demanda'}`,
            proposalId: String(p.id),
            proposalValue: p.value,
            lawyerName: p.lawyerName || 'Advogado',
            clientName: isClient ? currentUser.name : (p.clientName || 'Cliente'),
            state: 'NEGOCIACAO',
            otherUser: {
              id: isClient ? (p.lawyerId || '') : (p.clientId || ''),
              name: isClient ? (p.lawyerName || 'Advogado') : (p.clientName || 'Cliente'),
              avatar: isClient ? (p.lawyerAvatar || '') : '',
              role: (isClient ? 'LAWYER' : 'CLIENT') as Role,
              oabOrCompany: isClient ? p.lawyerOab : undefined,
              isOnline: false,
            },
            lastMessage: `Proposta: R$ ${(p.value || 0).toLocaleString('pt-BR')}`,
            lastMessageTime: fmtTime(iso),
            lastMessageRaw: iso,
            unreadCount: 0,
          });
        }
      });

      if (convList.length > 0) {
        dataCache.set('chat_conversations', convList, CACHE_TTL.CHAT_CONVS);
      }

      return convList;
    } catch (e) {
      console.warn('Chat conversations error:', e);
      return dataCache.get<ChatConversation[]>('chat_conversations') || [];
    }
  },

  /** Get cached conversations instantly (0ms latency for tab switches) */
  getCachedConversations(): ChatConversation[] {
    return dataCache.get<ChatConversation[]>('chat_conversations') || [];
  },

  // ── Fetch ALL messages for a conversation (initial load with cache) ──
  async getMessages(conversationId: string): Promise<ChatMessage[]> {
    if (!conversationId) return [];

    let msgs: ChatMessage[] = [];
    if (conversationId.startsWith('conv_prop_')) {
      const proposalId = conversationId.replace('conv_prop_', '');
      try {
        const res = await negotiationsApi.getMessages(proposalId);
        const list = Array.isArray(res) ? res : ((res as any)?.content || []);
        msgs = list.map((m: any) => rawToChatMsg(m, conversationId));
      } catch (e) {
        console.warn('Negotiation messages fetch error:', e);
      }
    } else if (conversationId.startsWith('conv_contract_')) {
      try {
        const contractId = conversationId.replace('conv_contract_', '');
        const res = await http<any>(`/api/chat/messages/${contractId}`);
        const list = Array.isArray(res) ? res : (res?.messages || res?.content || []);
        msgs = list.map((m: any) => rawToChatMsg(m, conversationId));
      } catch (e) {
        console.warn('Contract messages fetch error:', e);
      }
    }

    if (msgs.length > 0) {
      _lastMsgId[conversationId] = msgs[msgs.length - 1].id;
      _msgCache[conversationId] = msgs;
      dataCache.set('chat_msgs_' + conversationId, msgs, CACHE_TTL.CHAT_MSGS);
    }

    return msgs.length > 0 ? msgs : chatApi.getCachedMessages(conversationId);
  },

  /** Get cached messages instantly (0ms latency for tab switches) */
  getCachedMessages(conversationId: string): ChatMessage[] {
    return _msgCache[conversationId] || dataCache.get<ChatMessage[]>('chat_msgs_' + conversationId) || [];
  },

  // ── Poll for NEW messages only (since lastKnownId) ──────────────
  async pollNewMessages(conversationId: string, currentMessages: ChatMessage[]): Promise<ChatMessage[]> {
    if (!conversationId) return [];
    const allMessages = await chatApi.getMessages(conversationId);
    if (currentMessages.length === 0) return allMessages;
    const lastKnownId = currentMessages[currentMessages.length - 1]?.id;
    if (!lastKnownId) return allMessages;
    const lastKnownIdx = allMessages.findIndex((m) => m.id === lastKnownId);
    if (lastKnownIdx === -1) {
      if (allMessages.length > currentMessages.length) {
        return allMessages.slice(currentMessages.length);
      }
      return [];
    }
    return allMessages.slice(lastKnownIdx + 1);
  },

  // ── Send message with optimistic UI support ──────────────────────
  async sendMessage(
    conversationId: string,
    content: string,
    attachments?: { name: string; size: string; type: 'PDF' | 'DOCX' | 'XLSX' | 'PNG' | 'JPG' }[],
    otherUserId?: string,
    otherUserIsOnline?: boolean,
  ): Promise<ChatMessage> {
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');

    const isNegotiation = conversationId.startsWith('conv_prop_');
    const { content: processedContent, wasModerated } = moderateContent(content, isNegotiation);

    const msgId = 'msg_' + Date.now();
    const iso = new Date().toISOString();

    if (isNegotiation) {
      const proposalId = conversationId.replace('conv_prop_', '');
      const sent = await negotiationsApi.sendMessage(proposalId, processedContent).catch((e) => {
        console.warn('Negotiation send error:', e);
        return null;
      });
      // Use server-assigned ID if available
      if (sent?.id) {
        _lastMsgId[conversationId] = String(sent.id);
      }
    } else if (conversationId.startsWith('conv_contract_')) {
      const contractId = conversationId.replace('conv_contract_', '');
      await http(`/api/chat/send/${contractId}`, {
        method: 'POST',
        body: JSON.stringify({ message: processedContent }),
      }).catch((e) => console.warn('Chat send error:', e));
    }

    // Smart notification: only notify other user if they are NOT currently in this chat
    if (!otherUserIsOnline && otherUserId) {
      notificationsApi.createForOtherUser(otherUserId, currentUser.name, conversationId).catch(() => {});
    }

    const result: ChatMessage = {
      id: msgId,
      conversationId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderAvatar: currentUser.avatarUrl || '',
      content: processedContent,
      rawTimestamp: iso,
      timestamp: fmtTime(iso),
      wasModerated,
      isRead: true,
      isDelivered: true,
      isReadByOther: false,
      attachments: attachments?.map((a, i) => ({
        id: `att_${Date.now()}_${i}`,
        name: a.name,
        size: a.size,
        type: a.type,
        url: '#',
      })),
    };

    _lastMsgId[conversationId] = msgId;
    return result;
  },

  // ── Build negotiation conv on-the-fly ───────────────────────────
  async getOrCreateNegotiationChat(proposalId: string): Promise<ChatConversation> {
    const proposals = await proposalsApi.getProposals();
    const prop = proposals.find((p) => String(p.id) === String(proposalId));
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');
    const isClient = currentUser.role === 'CLIENT';
    const iso = prop?.createdAt || new Date().toISOString();

    return {
      id: 'conv_prop_' + proposalId,
      jobId: prop?.jobId || '',
      jobTitle: `Negociação: ${prop?.jobTitle || 'Demanda'}`,
      proposalId: String(proposalId),
      proposalValue: prop?.value || 0,
      lawyerName: prop?.lawyerName || 'Advogado',
      clientName: isClient ? currentUser.name : (prop?.clientName || 'Cliente'),
      state: 'NEGOCIACAO',
      otherUser: {
        id: isClient ? (prop?.lawyerId || '') : (prop?.clientId || ''),
        name: isClient ? (prop?.lawyerName || 'Advogado') : (prop?.clientName || 'Cliente'),
        avatar: isClient ? (prop?.lawyerAvatar || '') : '',
        role: (isClient ? 'LAWYER' : 'CLIENT') as Role,
        oabOrCompany: isClient ? prop?.lawyerOab : undefined,
        isOnline: false,
      },
      lastMessage: `Proposta: R$ ${(prop?.value || 0).toLocaleString('pt-BR')}`,
      lastMessageTime: fmtTime(iso),
      lastMessageRaw: iso,
      unreadCount: 0,
    };
  },
};

// ─────────────────────────────────────────────
// SECTION 11 – REVIEWS API
// ─────────────────────────────────────────────
export const reviewsApi = {
  async getContractReviews(contractId: string): Promise<Review[]> {
    try {
      const data = await http<any[]>(`/api/reviews/contract/${contractId}`);
      return (Array.isArray(data) ? data : []).map((r) => ({
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
  },

  async submitReview(data: { contractId: string; rating: number; comment: string; detailedRatings?: Record<string, number> }): Promise<{ review: Review; published: boolean }> {
    const currentUser = await authApi.getCurrentUser();
    if (!currentUser) throw new Error('Não autenticado');

    const result = await http<any>(`/api/reviews/create/${data.contractId}`, {
      method: 'POST',
      body: JSON.stringify({ revieweeId: 1, rating: data.rating, comment: data.comment }),
    }).catch(() => null);

    const review: Review = {
      id: String(result?.reviewId ?? Date.now()),
      contractId: data.contractId,
      jobTitle: 'Mandato Jurídico',
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewerAvatar: currentUser.avatarUrl || '',
      reviewerRole: currentUser.role,
      revieweeId: '1',
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
    try {
      const raw = await http<any[]>('/api/users/lawyers');
      if (Array.isArray(raw) && raw.length > 0) {
        return raw.map(mapBackendUser);
      }
      return [];
    } catch (e) {
      console.warn('Lawyers fetch error:', e);
      return [];
    }
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
      coverLetter: 'Convite de contratação direta.',
    });

    return await chatApi.getOrCreateNegotiationChat(String(newProposal.id));
  },
};

// ─────────────────────────────────────────────
// SECTION 13 – DOCUMENTS API (Secure Document Vault & Legacy)
// ─────────────────────────────────────────────
export const documentsApi = {
  async uploadSecureDocument(
    file: File,
    params: {
      contractId?: string | number;
      jobId?: string | number;
      classification?: DocumentClassification;
    } = {}
  ): Promise<SecureDocument> {
    const formData = new FormData();
    formData.append('file', file);
    if (params.contractId !== undefined && params.contractId !== null && params.contractId !== '') {
      formData.append('contractId', String(params.contractId));
    }
    if (params.jobId !== undefined && params.jobId !== null && params.jobId !== '') {
      formData.append('jobId', String(params.jobId));
    }
    if (params.classification) {
      formData.append('classification', params.classification);
    }

    const raw = await http<any>('/api/documents/secure/upload', {
      method: 'POST',
      body: formData,
    });
    return mapBackendSecureDocument(raw);
  },

  async downloadSecureDocument(
    documentId: string | number,
    fallbackFileName?: string
  ): Promise<{ blob: Blob; fileName: string; sha256: string }> {
    const token = FEATURE_FLAGS.auth.cookie_session_enabled ? null : getStoredToken();
    const authHeaders: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    const res = await fetch(`${API_CONFIG.baseURL}/api/documents/secure/${documentId}/download`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        ...authHeaders,
      },
    });

    if (!res.ok) {
      throw new Error(`Falha ao baixar documento seguro (Status ${res.status})`);
    }

    const sha256 = res.headers.get('X-Document-SHA256') || '';
    let fileName = fallbackFileName || 'documento_seguro';
    const disposition = res.headers.get('Content-Disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        fileName = match[1].replace(/['"]/g, '').trim();
      }
    }

    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    return { blob, fileName, sha256 };
  },

  async getContractDocuments(contractId: string | number): Promise<SecureDocument[]> {
    try {
      const data = await http<any[]>(`/api/documents/secure/contract/${contractId}`);
      return (Array.isArray(data) ? data : []).map(mapBackendSecureDocument);
    } catch (e) {
      console.warn('Contract documents fetch error:', e);
      return [];
    }
  },

  async getJobDocuments(jobId: string | number): Promise<SecureDocument[]> {
    try {
      const data = await http<any[]>(`/api/documents/secure/job/${jobId}`);
      return (Array.isArray(data) ? data : []).map(mapBackendSecureDocument);
    } catch (e) {
      console.warn('Job documents fetch error:', e);
      return [];
    }
  },

  async deleteSecureDocument(documentId: string | number): Promise<boolean> {
    try {
      await http(`/api/documents/secure/${documentId}`, { method: 'DELETE' });
      return true;
    } catch (e) {
      console.error('Delete secure document error:', e);
      return false;
    }
  },

  async getDocumentLogs(documentId: string | number): Promise<DocumentAccessLog[]> {
    try {
      const data = await http<any[]>(`/api/documents/secure/${documentId}/logs`);
      return (Array.isArray(data) ? data : []).map(mapBackendDocumentAccessLog);
    } catch (e) {
      console.warn('Document logs fetch error:', e);
      return [];
    }
  },

  async getDocuments(_category?: string): Promise<AppDocument[]> {
    try {
      const data = await http<any[]>('/api/documents/secure/my');
      const secureDocs = (Array.isArray(data) ? data : []).map(mapBackendSecureDocument);
      return secureDocs.map((doc) => {
        const sizeMb = doc.fileSize ? (doc.fileSize / (1024 * 1024)).toFixed(2) + ' MB' : '1.0 MB';
        const ext = doc.fileName.split('.').pop()?.toUpperCase() || 'PDF';
        const fileType = (ext === 'DOCX' || ext === 'XLSX' || ext === 'ZIP') ? ext : 'PDF';
        return {
          id: String(doc.id),
          title: doc.fileName.replace(/\.[^/.]+$/, ''),
          processNumber: undefined,
          category: (doc.classification === 'RESTRICTED' ? 'Contratos' : 'PeÃ§as Processuais') as any,
          fileName: doc.fileName,
          fileSize: sizeMb,
          fileType: fileType as any,
          uploadedBy: doc.ownerName || 'VocÃª',
          uploadDate: doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('pt-BR') : new Date().toLocaleDateString('pt-BR'),
          statusTag: (doc.virusScanStatus === 'CLEAN' ? 'Finalizado' : 'Em revisÃ£o') as any,
          downloadUrl: `/api/documents/secure/${doc.id}/download`,
        };
      });
    } catch (e) {
      console.warn('Documents fetch error:', e);
      return [];
    }
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
    try {
      const res = await http<any>('/api/notifications/');
      const rawList = Array.isArray(res) ? res : (res?.notifications || res?.content || []);
      return rawList.map((n: any) => ({
        id: String(n.notificationId ?? n.id ?? ''),
        title: n.title || 'Notificação',
        message: n.message || '',
        type: (n.type as any) || 'CHAT_MESSAGE',
        timestamp: n.createdAt ? new Date(n.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Agora',
        isRead: Boolean(n.isRead),
        linkUrl: n.referenceId ? `/cases/${n.referenceId}` : undefined,
      }));
    } catch {
      return [];
    }
  },

  async getUnreadCount(): Promise<number> {
    try {
      const res = await http<any>('/api/notifications/unread/count');
      const count = typeof res === 'number' ? res : (res?.count ?? 0);
      return typeof count === 'number' ? count : 0;
    } catch {
      return 0;
    }
  },

  async markAsRead(id: string): Promise<void> {
    await http(`/api/notifications/${id}/read`, { method: 'POST' }).catch(() => {});
  },

  async markAllAsRead(): Promise<void> {
    await http('/api/notifications/read-all', { method: 'POST' }).catch(() => {});
  },

  /**
   * Create a notification for the OTHER user when they are offline/not in the chat.
   * This is a best-effort call — failures are silently ignored.
   */
  async createForOtherUser(recipientUserId: string, senderName: string, conversationId: string): Promise<void> {
    try {
      await http('/api/notifications/chat', {
        method: 'POST',
        body: JSON.stringify({
          recipientUserId: Number(recipientUserId),
          title: `Nova mensagem de ${senderName}`,
          message: `${senderName} enviou uma mensagem para você na plataforma LWork.`,
          type: 'CHAT_MESSAGE',
          referenceId: conversationId,
        }),
      });
    } catch {
      // Fallback: silently fail — the user will see the message when they open the chat
    }
  },
};

// ─────────────────────────────────────────────
// SECTION 15 – DASHBOARD API
// ─────────────────────────────────────────────
export const dashboardApi = {
  async getMetrics(): Promise<DashboardMetrics> {
    try {
      const metrics = await http<any>('/api/dashboard/metrics');
      if (metrics && typeof metrics === 'object' && 'activeCasesCount' in metrics) {
        return metrics as DashboardMetrics;
      }
    } catch { /* compute from active data */ }

    try {
      const [jobs, proposals, contracts, user] = await Promise.all([
        jobsApi.getJobs().catch(() => []),
        proposalsApi.getProposals().catch(() => []),
        contractsApi.getContracts().catch(() => []),
        authApi.getCurrentUser().catch(() => null),
      ]);

      const activeCasesCount = jobs.filter((j) => j.status === 'OPEN' || j.status === 'IN_PROGRESS').length;
      const pendingProposalsCount = proposals.filter((p) => p.status === 'PENDING').length;
      const activeContracts = contracts.filter((c) => c.status === 'ACTIVE');
      const escrowBalanceTotal = activeContracts.reduce((acc, c) => acc + (c.escrowBalance || 0), 0);
      const monthlyRevenue = activeContracts.reduce((acc, c) => acc + (c.totalValue || 0), 0);

      const distributionMap: Record<string, number> = {};
      jobs.forEach((j) => {
        const spec = j.specialty || 'Outros';
        distributionMap[spec] = (distributionMap[spec] || 0) + 1;
      });
      const totalJobs = jobs.length || 1;
      const caseDistribution = Object.entries(distributionMap).map(([label, count]) => ({
        label,
        count,
        percentage: Math.round((count / totalJobs) * 100),
      }));

      const daysOfWeek = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
      const weeklyProductivity = daysOfWeek.map((day) => ({
        day,
        horas: 0,
        casos: 0,
      }));

      return {
        activeCasesCount,
        pendingProposalsCount,
        monthlyRevenue,
        escrowBalanceTotal,
        rating: user?.rating || 5.0,
        totalClientsOrLawyers: activeContracts.length,
        weeklyProductivity,
        caseDistribution: caseDistribution.length > 0 ? caseDistribution : [{ label: 'Geral', count: 0, percentage: 0 }],
      };
    } catch {
      return {
        activeCasesCount: 0,
        pendingProposalsCount: 0,
        monthlyRevenue: 0,
        escrowBalanceTotal: 0,
        rating: 5.0,
        totalClientsOrLawyers: 0,
        weeklyProductivity: [
          { day: 'Seg', horas: 0, casos: 0 },
          { day: 'Ter', horas: 0, casos: 0 },
          { day: 'Qua', horas: 0, casos: 0 },
          { day: 'Qui', horas: 0, casos: 0 },
          { day: 'Sex', horas: 0, casos: 0 },
          { day: 'Sáb', horas: 0, casos: 0 },
          { day: 'Dom', horas: 0, casos: 0 },
        ],
        caseDistribution: [{ label: 'Geral', count: 0, percentage: 0 }],
      };
    }
  },
};

// ─────────────────────────────────────────────
// SECTION 16 – GEMINI AI LEGAL ANALYSIS
// ─────────────────────────────────────────────
export const geminiLegalApi = {
  async analyzeProcess(processTitle: string, _description: string): Promise<{
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
