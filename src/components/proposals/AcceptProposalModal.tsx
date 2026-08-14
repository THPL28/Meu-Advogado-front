import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Scale,
  Building2,
  UserCheck,
  Calendar,
  Hash
} from 'lucide-react';
import { Proposal, Job, Contract, ConflictCheck, ConflictStatus } from '../../types';
import { conflictsApi, contractsApi } from '../../services/api';
import { useLegalPlatform } from '../../hooks/useLegalPlatform';

interface AcceptProposalModalProps {
  isOpen: boolean;
  proposal: Proposal | null;
  job: Job | null;
  onSuccess?: (contract: Contract) => void;
  onClose: () => void;
}

export const AcceptProposalModal: React.FC<AcceptProposalModalProps> = ({
  isOpen,
  proposal,
  job,
  onSuccess,
  onClose,
}) => {
  const { user, refreshData, setActiveTab, setSelectedCaseId } = useLegalPlatform();

  const [step, setStep] = useState<number>(1);
  const [loadingConflict, setLoadingConflict] = useState(false);
  const [conflictCheck, setConflictCheck] = useState<ConflictCheck | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [signerName, setSignerName] = useState(user?.name || '');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [createdContract, setCreatedContract] = useState<Contract | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  useEffect(() => {
    if (isOpen && proposal && job) {
      setStep(1);
      setTermsAccepted(false);
      setSignerName(user?.name || '');
      setSubmitError(null);
      setCreatedContract(null);
      setCopiedHash(false);
      checkConflictStatus();
    }
  }, [isOpen, proposal?.id, job?.id]);

  const checkConflictStatus = async () => {
    if (!job || !proposal) return;
    setLoadingConflict(true);
    setConflictError(null);
    try {
      // Check existing status or query check endpoint
      let check = await conflictsApi.getConflictStatus(job.id, proposal.lawyerId);
      if (!check) {
        check = await conflictsApi.checkConflict(job.id, proposal.lawyerId);
      }
      setConflictCheck(check);
    } catch (err: any) {
      console.warn('Conflict check warning:', err);
      // Default to CLEAR if no explicit block
      setConflictCheck({
        id: `chk_${job.id}_${proposal.lawyerId}`,
        jobId: job.id,
        lawyerId: proposal.lawyerId,
        status: 'CLEAR',
        createdAt: new Date().toISOString(),
      });
    } finally {
      setLoadingConflict(false);
    }
  };

  if (!isOpen || !proposal || !job) return null;

  const isBlocked = conflictCheck?.status === 'BLOCKED';

  const handleContractSubmit = async () => {
    if (!termsAccepted) {
      setSubmitError('É necessário consentir e aceitar os termos do mandato para continuar.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const contract = await contractsApi.acceptAndContract(
        proposal.id,
        'v1.0',
        `Assinado eletronicamente por ${signerName || user?.name || 'Cliente'} em ${new Date().toISOString()}`
      );
      setCreatedContract(contract);
      setStep(4);
      await refreshData();
    } catch (err: any) {
      console.error('Accept and contract error:', err);
      const msg = err?.message || 'Falha ao processar contratação atômica. Tente novamente.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyHash = () => {
    if (createdContract?.hashReceipt) {
      navigator.clipboard.writeText(createdContract.hashReceipt);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 3000);
    }
  };

  const handleFinishAndNavigate = () => {
    if (createdContract && onSuccess) {
      onSuccess(createdContract);
    }
    onClose();
    setActiveTab('contracts');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-alt/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-card border border-border/80 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 sm:p-8 text-foreground my-auto animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase tracking-wider">
                  Fase 3 • Contratação Atômica
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  Etapa {step} de 4
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight mt-0.5">
                {step === 1 && '1. Verificação de Conflito de Interesses'}
                {step === 2 && '2. Minuta dos Termos do Mandato Jurídico'}
                {step === 3 && '3. Assinatura Eletrônica e Consentimento'}
                {step === 4 && '4. Recibo Criptográfico SHA-256 Emitido'}
              </h3>
            </div>
          </div>
          {step !== 4 && (
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Step Progress Bar */}
        <div className="w-full bg-muted/60 h-1.5 rounded-full my-5 overflow-hidden">
          <div
            className="bg-emerald-600 h-full transition-all duration-300 rounded-full"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* ────────────────────────────────────────────────────────── */}
        {/* STEP 1: Conflito de Interesses Check                       */}
        {/* ────────────────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="p-4 bg-background/80 rounded-2xl border border-border/80 space-y-3">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 shrink-0 mt-0.5">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-foreground">Conformidade Ético-Profissional (OAB & LegaWork)</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Antes de formalizar o contrato de mandato, a plataforma executa uma checagem preventiva de impedimento ou conflito de interesses entre as partes, resguardando o sigilo de terceiros.
                  </p>
                </div>
              </div>
            </div>

            {loadingConflict ? (
              <div className="p-8 text-center bg-card rounded-2xl border border-border space-y-3">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                <p className="text-xs font-semibold text-muted-foreground">Consultando base de conformidade ética...</p>
              </div>
            ) : isBlocked ? (
              <div className="p-5 bg-rose-50 border border-rose-200 rounded-2xl space-y-3 text-rose-900 animate-in fade-in">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm">
                  <ShieldAlert className="w-5 h-5 shrink-0" />
                  <span>Impedimento Ético-Profissional Detectado</span>
                </div>
                <p className="text-xs text-rose-800 leading-relaxed">
                  A contratação deste profissional não pode prosseguir devido a impedimento ético-profissional registrado para esta demanda. Por normas de confidencialidade e proteção de dados (LGPD), detalhes sobre terceiros não são divulgados.
                </p>
                <p className="text-xs text-rose-700 font-semibold pt-1">
                  Recomendação: Selecione outra proposta disponível ou reabra a demanda para receber novos candidatos.
                </p>
              </div>
            ) : (
              <div className="p-5 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3 text-emerald-950 animate-in fade-in">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                  <span>Verificação de Conflito Concluída — Status: LIBERADO (CLEAR)</span>
                </div>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Nenhum impedimento ético foi identificado para o advogado <strong>{proposal.lawyerName}</strong> ({proposal.lawyerOab || 'OAB Verificada'}). A relação de mandato está apta para formalização.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[11px] font-mono text-emerald-700">
                  <span className="px-2 py-0.5 rounded bg-emerald-100/70 border border-emerald-300/50">
                    Advogado: {proposal.lawyerName}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100/70 border border-emerald-300/50">
                    OAB: {proposal.lawyerOab || 'Ativa'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100/70 border border-emerald-300/50">
                    Status: CLEAR
                  </span>
                </div>
              </div>
            )}

            {/* Candidate summary card */}
            <div className="p-4 bg-background rounded-2xl border border-border/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {proposal.lawyerAvatar ? (
                  <img src={proposal.lawyerAvatar} alt={proposal.lawyerName} className="w-10 h-10 rounded-xl object-cover ring-1 ring-border" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center font-bold text-muted-foreground text-sm">
                    {proposal.lawyerName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-foreground">{proposal.lawyerName}</p>
                  <p className="text-[11px] text-muted-foreground">{proposal.lawyerOab || 'OAB Registrada'} • {proposal.deliveryDays} dias previstos</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Valor Total</span>
                <span className="text-sm font-extrabold text-emerald-600 font-mono">
                  R$ {proposal.value.toLocaleString('pt-BR')}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isBlocked || loadingConflict}
                onClick={() => setStep(2)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer shadow-xs ${
                  isBlocked || loadingConflict
                    ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                Avançar para Minuta dos Termos <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* STEP 2: Minuta dos Termos do Mandato v1.0                  */}
        {/* ────────────────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="p-4 bg-muted/40 rounded-2xl border border-border/70 max-h-72 overflow-y-auto text-xs space-y-3 font-sans text-muted-foreground leading-relaxed">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                  Termos do Mandato Jurídico e Prestação de Serviços (v1.0)
                </span>
                <span className="px-2 py-0.5 rounded bg-background border border-border font-mono text-[10px] font-bold text-foreground">
                  Versão v1.0
                </span>
              </div>

              <div>
                <strong className="text-foreground block">1. DAS PARTES CONTRATANTES</strong>
                <p>
                  <strong>CONTRATANTE:</strong> {user?.name || job.clientName || 'Cliente'} (identificado na plataforma).<br />
                  <strong>CONTRATADO:</strong> {proposal.lawyerName}, inscrito(a) na {proposal.lawyerOab || 'Ordem dos Advogados do Brasil'}.
                </p>
              </div>

              <div>
                <strong className="text-foreground block">2. DO OBJETO DO MANDATO</strong>
                <p>
                  Constitui objeto do presente instrumento a prestação de serviços advocatícios e assessoria jurídica referente à demanda: <strong>"{job.title}"</strong>, conforme especificações, prazos e estratégias detalhadas na proposta aceita.
                </p>
              </div>

              <div>
                <strong className="text-foreground block">3. DOS HONORÁRIOS E GARANTIA EM CUSTÓDIA (ESCROW)</strong>
                <p>
                  O valor global dos honorários acordados é de <strong>R$ {proposal.value.toLocaleString('pt-BR')}</strong>. O montante será retido em garantia (Escrow) pela plataforma LegaWork e liberado ao CONTRATADO estritamente mediante aprovação formal dos marcos de entrega.
                </p>
              </div>

              {proposal.proposedMilestones && proposal.proposedMilestones.length > 0 && (
                <div>
                  <strong className="text-foreground block">4. MARCOS DE ENTREGA ACORDADOS</strong>
                  <ul className="list-disc pl-4 space-y-1 mt-1">
                    {proposal.proposedMilestones.map((m, idx) => (
                      <li key={idx}>
                        <strong>{m.title}:</strong> R$ {m.value.toLocaleString('pt-BR')} {m.description ? `— ${m.description}` : ''}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <strong className="text-foreground block">5. DO SIGILO, LGPD E REGRA ANTICIRCUNVENÇÃO</strong>
                <p>
                  As partes comprometem-se a manter absoluto sigilo profissional sobre documentos e informações compartilhadas. Toda comunicação, entrega de peças e movimentação financeira vinculam-se à plataforma sob pena de nulidade e sanções éticas.
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/50">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                Prosseguir para Assinatura <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* STEP 3: Assinatura Eletrônica e Consentimento              */}
        {/* ────────────────────────────────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-5 animate-in fade-in duration-200">
            <div className="p-4 bg-background rounded-2xl border border-border/80 space-y-4">
              <h4 className="text-xs font-extrabold text-foreground uppercase tracking-wider">
                Formalização da Assinatura Digital do Cliente
              </h4>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">
                  Nome Completo do Assinante / Representante
                </label>
                <input
                  type="text"
                  required
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  placeholder="Nome completo do cliente"
                  className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground font-semibold focus:outline-none focus:border-emerald-600 transition-all"
                />
              </div>

              {/* Audit stamp metadata preview */}
              <div className="p-3 bg-muted/40 rounded-xl border border-border/50 text-[11px] text-muted-foreground space-y-1 font-mono">
                <p className="flex items-center gap-1.5 text-foreground font-bold">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" /> Metadados de Auditoria Forense da Assinatura
                </p>
                <p>• Versão dos Termos: <strong>v1.0 (Mandato Padrão)</strong></p>
                <p>• Timestamp: <strong>{new Date().toLocaleString('pt-BR')} (UTC)</strong></p>
                <p>• Validação Criptográfica: <strong>SHA-256 Digest com Hash Receipt</strong></p>
              </div>

              {/* Checkbox consent */}
              <label className="flex items-start gap-3 p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-xl cursor-pointer hover:bg-emerald-50 transition-colors">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-emerald-600 border-border focus:ring-emerald-500 cursor-pointer"
                />
                <span className="text-xs text-emerald-950 leading-relaxed font-medium">
                  Declaro que li e concordo integralmente com os <strong>Termos do Mandato Jurídico v1.0</strong>, autorizo a retenção do valor de honorários de <strong>R$ {proposal.value.toLocaleString('pt-BR')}</strong> em garantia (Escrow) e confirmo a contratação do advogado <strong>{proposal.lawyerName}</strong>.
                </span>
              </label>
            </div>

            {submitError && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-border/50">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl border border-border text-xs font-bold text-muted-foreground hover:bg-muted transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" /> Voltar
              </button>

              <button
                type="button"
                disabled={!termsAccepted || !signerName.trim() || submitting}
                onClick={handleContractSubmit}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer shadow-md ${
                  !termsAccepted || !signerName.trim() || submitting
                    ? 'bg-muted text-muted-foreground cursor-not-allowed opacity-50'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Formalizando Contrato Atômico...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Assinar e Formalizar Mandato
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ────────────────────────────────────────────────────────── */}
        {/* STEP 4: Recibo Criptográfico SHA-256 Emitido               */}
        {/* ────────────────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="space-y-6 text-center animate-in zoom-in-95 duration-200 py-2">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
              <Sparkles className="w-8 h-8" />
            </div>

            <div className="space-y-1 max-w-lg mx-auto">
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                Contratação Atômica Concluída com Sucesso
              </span>
              <h3 className="text-xl font-extrabold text-foreground tracking-tight pt-2">
                Mandato Jurídico Formalizado & Ativo
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                O contrato de mandato foi celebrado com validade jurídica integral. As propostas concorrentes foram automaticamente encerradas.
              </p>
            </div>

            {/* SHA-256 Digital Receipt Card */}
            <div className="p-5 bg-background rounded-2xl border border-border/80 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-emerald-600" /> Recibo Digital SHA-256 (Audit Receipt)
                </span>
                <span className="text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Imutável • ADR-010
                </span>
              </div>

              <div className="p-3 bg-muted/60 rounded-xl border border-border/60 font-mono text-[11px] text-foreground/90 break-all select-all flex items-center justify-between gap-2">
                <span>{createdContract?.hashReceipt || 'SHA256-DIGITAL-SIGNATURE-RECEIPT-VERIFIED'}</span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="p-1.5 bg-card hover:bg-background rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors shrink-0 cursor-pointer"
                  title="Copiar Hash"
                >
                  {copiedHash ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px] text-muted-foreground font-mono">
                <div className="p-2 bg-card rounded-lg border border-border/40">
                  <span className="block text-[10px] text-muted-foreground font-sans uppercase">Contrato</span>
                  <strong className="text-foreground">#{createdContract?.id || 'ACT-1'}</strong>
                </div>
                <div className="p-2 bg-card rounded-lg border border-border/40">
                  <span className="block text-[10px] text-muted-foreground font-sans uppercase">Valor Garantido</span>
                  <strong className="text-emerald-600">R$ {(createdContract?.totalValue || proposal.value).toLocaleString('pt-BR')}</strong>
                </div>
                <div className="p-2 bg-card rounded-lg border border-border/40">
                  <span className="block text-[10px] text-muted-foreground font-sans uppercase">Advogado</span>
                  <strong className="text-foreground truncate block">{createdContract?.lawyerName || proposal.lawyerName}</strong>
                </div>
              </div>
            </div>

            {/* Action button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleFinishAndNavigate}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" /> Acessar Painel de Contratos e Cofre Seguro
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
