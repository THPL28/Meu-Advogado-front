import React, { useState } from 'react';
import {
  X,
  Scale,
  DollarSign,
  Calendar,
  MapPin,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Lock,
  Globe,
  FileCheck2,
  Sparkles,
  Info
} from 'lucide-react';
import { useLegalPlatform } from '../../hooks/useLegalPlatform';
import { JobType, UrgencyLevel, ConfidentialityLevel, VisibilityLevel, SensitivityLevel } from '../../types';
import { jobsApi } from '../../services/api';

export const NewCaseModal: React.FC = () => {
  const { isNewCaseModalOpen, setIsNewCaseModalOpen, refreshData, navigateToCaseDetail } = useLegalPlatform();

  const [hiringType, setHiringType] = useState<'FIXED' | 'HOURLY'>('FIXED');
  const [visibility, setVisibility] = useState<VisibilityLevel>('DISCOVERY_SANITIZED');
  const [sensitivity, setSensitivity] = useState<SensitivityLevel>('STANDARD');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [processNumber, setProcessNumber] = useState('');
  const [specialty, setSpecialty] = useState('Compliance & LGPD');
  const [type, setType] = useState<JobType>('COMPLIANCE');
  const [urgency, setUrgency] = useState<UrgencyLevel>('HIGH');
  const [confidentiality, setConfidentiality] = useState<ConfidentialityLevel>('CONFIDENTIAL');
  const [budgetMin, setBudgetMin] = useState('5000');
  const [budgetMax, setBudgetMax] = useState('12000');
  const [estimatedDeadlineDays, setEstimatedDeadlineDays] = useState('30');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isNewCaseModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMessage('');
    try {
      const newJob = await jobsApi.createJob({
        title,
        description,
        processNumber: processNumber.trim() || undefined,
        specialty,
        type,
        hiringType,
        urgency,
        confidentiality,
        visibility,
        sensitivity,
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        estimatedDeadlineDays: Number(estimatedDeadlineDays),
        city,
        state
      });

      await refreshData();
      setIsNewCaseModalOpen(false);
      navigateToCaseDetail(newJob.id);
    } catch (err: any) {
      console.error('Failed to create case:', err);
      if (err?.status === 422 || err?.isUnprocessable) {
        setErrorMessage(
          err.message ||
          'Violação de Moderação: O título ou descrição contém dados restritos (número de processo CNJ, CPF/CNPJ, e-mail, telefone ou links externos). Remova esses dados para prosseguir.'
        );
      } else {
        setErrorMessage(err.message || 'Erro ao publicar demanda. Verifique os dados e tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-alt/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-card border border-border/80 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl p-6 text-foreground my-auto animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Cadastrar Demanda Jurídica</h3>
              <p className="text-xs text-muted-foreground/90">Configure visibilidade, sigilo e receba propostas de advogados qualificados</p>
            </div>
          </div>
          <button
            onClick={() => setIsNewCaseModalOpen(false)}
            className="p-2 rounded-xl text-muted-foreground/90 hover:text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Moderation Notice */}
        <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-1.5 text-xs">
          <div className="flex items-center gap-2 font-bold">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Regras de Moderação Automática & Proteção de Dados (Fase 2)</span>
          </div>
          <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
            Para garantir a privacidade e conformidade da plataforma, <strong>não inclua</strong> números de processos CNJ, CPF/CNPJ, telefones, e-mails ou links externos no título ou na descrição pública. Casos com dados de contato serão recusados automaticamente pelo motor de moderação (HTTP 422).
          </p>
        </div>

        {errorMessage && (
          <div className="mt-3 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">Aviso do Sistema:</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-5 mt-4">

          {/* Visibility & Privacy Selector */}
          <div className="bg-background border border-border rounded-2xl p-4 space-y-3">
            <label className="block text-xs font-bold text-foreground/90 uppercase tracking-wider">
              1. Nível de Visibilidade da Demanda
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVisibility('DISCOVERY_SANITIZED')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  visibility === 'DISCOVERY_SANITIZED'
                    ? 'bg-emerald-50/80 border-emerald-600 text-foreground shadow-xs'
                    : 'bg-card border-border text-muted-foreground/90 hover:border-border-strong'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-emerald-600" /> Descoberta Sanitizada
                    </span>
                    {visibility === 'DISCOVERY_SANITIZED' && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground/90 mt-1 leading-relaxed">
                    Publicada no catálogo de descoberta com resumo higienizado (sem CNJ ou dados de contato), atraindo propostas de advogados verificados.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setVisibility('PRIVATE')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  visibility === 'PRIVATE'
                    ? 'bg-emerald-50/80 border-emerald-600 text-foreground shadow-xs'
                    : 'bg-card border-border text-muted-foreground/90 hover:border-border-strong'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-emerald-600" /> Demanda 100% Privada
                    </span>
                    {visibility === 'PRIVATE' && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground/90 mt-1 leading-relaxed">
                    Invisível no catálogo público. Apenas advogados convidados diretamente pelo cliente poderão visualizar e submeter propostas.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Payment Modality Selection */}
          <div className="bg-background border border-border rounded-2xl p-4 space-y-3">
            <label className="block text-xs font-bold text-foreground/90 uppercase tracking-wider">
              2. Modalidade de Pagamento / Contratação
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setHiringType('FIXED')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  hiringType === 'FIXED'
                    ? 'bg-emerald-50/80 border-emerald-600 text-foreground shadow-xs'
                    : 'bg-card border-border text-muted-foreground/90 hover:border-border-strong'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Modelo A — Preço Fixo</span>
                    {hiringType === 'FIXED' && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground/90 mt-1 leading-relaxed">
                    Advogados enviarão valor total do projeto, prazo e marcos de entrega. Ideal para escopos fechados.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setHiringType('HOURLY')}
                className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                  hiringType === 'HOURLY'
                    ? 'bg-emerald-50/80 border-emerald-600 text-foreground shadow-xs'
                    : 'bg-card border-border text-muted-foreground/90 hover:border-border-strong'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Modelo B — Honorários por Hora</span>
                    {hiringType === 'HOURLY' && <span className="w-2 h-2 rounded-full bg-emerald-600"></span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground/90 mt-1 leading-relaxed">
                    Advogados enviarão valor por hora (R$/h) e estimativa de horas. Ideal para consultoria contínua.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Sensitivity Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Nível de Sigilo / Sensibilidade</label>
              <select
                value={sensitivity}
                onChange={(e) => setSensitivity(e.target.value as SensitivityLevel)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              >
                <option value="STANDARD">Padrão (Casos Ordinários)</option>
                <option value="CONFIDENTIAL">Confidencial (Dados Corporativos / Trabalhista)</option>
                <option value="STRICTLY_CONFIDENTIAL">Estritamente Confidencial (Segredo de Justiça / M&A)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Especialidade Jurídica</label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              >
                <option value="Direito Empresarial">Direito Empresarial</option>
                <option value="Compliance & LGPD">Compliance & LGPD</option>
                <option value="Direito Trabalhista">Direito Trabalhista</option>
                <option value="Direito Tributário">Direito Tributário</option>
                <option value="Propriedade Intelectual">Propriedade Intelectual</option>
                <option value="Direito Cível & Imobiliário">Direito Cível & Imobiliário</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Título da Demanda <span className="text-muted-foreground/70 font-normal">(sem dados pessoais ou CNJ)</span>
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Auditoria Trabalhista e Adequação às Normas de Privacidade Corporativa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground/90 placeholder:text-muted-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Número do Processo <span className="text-muted-foreground/70 font-normal">(armazenado em sigilo para o contratado)</span>
              </label>
              <input
                type="text"
                placeholder="Ex: 5024192-45.2023.8.21.0001"
                value={processNumber}
                onChange={(e) => setProcessNumber(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Nível de Urgência</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              >
                <option value="LOW">Baixa Urgência</option>
                <option value="MEDIUM">Média Urgência</option>
                <option value="HIGH">Alta Urgência</option>
                <option value="CRITICAL">Urgente / Risco Liminar</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Descrição do Objeto <span className="text-muted-foreground/70 font-normal">(não inclua telefones, e-mails ou CPF)</span>
            </label>
            <textarea
              required
              rows={4}
              placeholder="Descreva o contexto do caso, pretensão jurídica e entregáveis esperados..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-background border border-border rounded-xl p-3.5 text-xs text-foreground/90 placeholder:text-muted-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Orçamento Mínimo (R$)</label>
              <input
                type="number"
                required
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Orçamento Máximo (R$)</label>
              <input
                type="number"
                required
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Prazo Estimado (Dias)</label>
              <input
                type="number"
                required
                value={estimatedDeadlineDays}
                onChange={(e) => setEstimatedDeadlineDays(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Cidade do Foro</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: São Paulo"
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Estado (UF)</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="Ex: SP"
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              />
            </div>
          </div>

          {/* Live Preview Card: Public Sanitized Discovery Card */}
          <div className="p-4 bg-muted/50 rounded-2xl border border-border/80 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>Pré-visualização do Catálogo Público (Como os Advogados Verão)</span>
            </div>

            <div className="p-4 bg-card rounded-xl border border-border space-y-2 shadow-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold uppercase">
                  {specialty}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Demanda Higienizada
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase">
                  {urgency === 'CRITICAL' ? 'Urgente' : urgency === 'HIGH' ? 'Alta Urgência' : 'Ordinária'}
                </span>
              </div>

              <h4 className="text-sm font-extrabold text-foreground">
                {title || 'Título da Demanda Jurídica'}
              </h4>

              <p className="text-xs text-muted-foreground line-clamp-2">
                {description || 'Descrição sumária do objeto e pretensão jurídica...'}
              </p>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50 text-muted-foreground">
                <span className="font-mono font-bold text-foreground">
                  R$ {Number(budgetMin || 0).toLocaleString('pt-BR')} - R$ {Number(budgetMax || 0).toLocaleString('pt-BR')}
                </span>
                <span>{city}, {state}</span>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="pt-4 border-t border-border/50 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsNewCaseModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-semibold hover:bg-muted/80 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              {submitting ? 'Cadastrando...' : 'Publicar Demanda na Plataforma'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
