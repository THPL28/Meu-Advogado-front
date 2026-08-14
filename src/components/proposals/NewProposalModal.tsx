import React, { useState, useEffect } from 'react';
import { X, FileCheck2, DollarSign, Calendar, Clock, Plus, Trash2, Lock, AlertCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { useLegalPlatform } from '../../hooks/useLegalPlatform';
import { proposalsApi } from '../../services/api';

export const NewProposalModal: React.FC = () => {
  const {
    isNewProposalModalOpen,
    setIsNewProposalModalOpen,
    selectedCaseId,
    jobs,
    proposals,
    user,
    role,
    verificationStatus,
    isVerifiedLawyer,
    setActiveTab,
    refreshData
  } = useLegalPlatform();

  const selectedJob = jobs.find(j => j.id === selectedCaseId) || jobs[0];

  // Modality logic from job requirement
  const isHourlyJob = selectedJob?.hiringType === 'HOURLY' || selectedJob?.hiringType === 'Hora';
  const hiringModalityLabel = isHourlyJob ? 'Modelo B — Honorários por Hora' : 'Modelo A — Preço Fixo (Projeto)';

  // Form states
  const [fixedValue, setFixedValue] = useState(selectedJob?.budgetMin ? String(selectedJob.budgetMin) : '8000');
  const [hourlyRate, setHourlyRate] = useState('350');
  const [estimatedHours, setEstimatedHours] = useState('20');

  const calculatedTotalValue = isHourlyJob
    ? Number(hourlyRate || 0) * Number(estimatedHours || 0)
    : Number(fixedValue || 0);

  const [deliveryDays, setDeliveryDays] = useState(selectedJob?.estimatedDeadlineDays ? String(selectedJob.estimatedDeadlineDays) : '30');
  const [coverLetter, setCoverLetter] = useState('');
  const [milestones, setMilestones] = useState<{ title: string; description: string; value: number }[]>([
    { title: 'Marco 1: Auditoria Inicial e Análise de Documentos', description: 'Revisão das peças e emissão de relatório prévio', value: 3000 },
    { title: 'Marco 2: Redação de Peça / Minutas Contratuais', description: 'Peticionamento ou minuta final consolidada', value: 5000 }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isUnverifiedLawyer = role === 'LAWYER' && verificationStatus !== 'VERIFIED';

  // Check if lawyer has already sent a proposal for this job
  const hasAlreadySubmitted = user && selectedJob && proposals.some(
    p => p.jobId === selectedJob.id && (p.lawyerId === user.id || p.lawyerOab === user.oabNumber)
  );

  useEffect(() => {
    if (selectedJob?.budgetMin && !isHourlyJob) {
      setFixedValue(String(selectedJob.budgetMin));
    }
  }, [selectedJob, isHourlyJob]);

  if (!isNewProposalModalOpen) return null;

  const handleAddMilestone = () => {
    setMilestones([
      ...milestones,
      { title: `Marco ${milestones.length + 1}: Nova Etapa`, description: 'Descrição das entregas', value: 2000 }
    ]);
  };

  const handleRemoveMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, field: string, val: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [field]: val };
    setMilestones(updated);
  };

  const totalMilestonesValue = milestones.reduce((sum, m) => sum + Number(m.value || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUnverifiedLawyer || hasAlreadySubmitted) return;

    setSubmitting(true);
    setErrorMessage('');
    try {
      await proposalsApi.createProposal({
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        processNumber: selectedJob.processNumber,
        value: calculatedTotalValue,
        deliveryDays: Number(deliveryDays),
        coverLetter: isHourlyJob
          ? `[Modalidade Por Hora: R$ ${hourlyRate}/h × ${estimatedHours}h = R$ ${calculatedTotalValue.toLocaleString('pt-BR')}]\n\n${coverLetter}`
          : coverLetter,
        proposedMilestones: milestones
      });

      await refreshData();
      setIsNewProposalModalOpen(false);
    } catch (err: any) {
      console.error('Failed to submit proposal:', err);
      setErrorMessage(err.message || 'Erro ao enviar proposta. Verifique os dados e tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-alt/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-card border border-border/80 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl p-6 text-foreground my-auto animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Enviar Proposta de Honorários</h3>
              <p className="text-xs text-muted-foreground/90 max-w-md truncate">
                Demanda: {selectedJob?.title}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsNewProposalModalOpen(false)}
            className="p-2 rounded-xl text-muted-foreground/90 hover:text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Blocking Screen for Non-Verified Lawyers */}
        {isUnverifiedLawyer ? (
          <div className="mt-6 p-6 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-extrabold text-foreground">
                {verificationStatus === 'PENDING'
                  ? 'Inscrição OAB em Análise'
                  : verificationStatus === 'REJECTED'
                  ? 'Cadastro OAB Não Aprovado'
                  : verificationStatus === 'SUSPENDED'
                  ? 'Inscrição OAB Suspensa'
                  : verificationStatus === 'EXPIRED'
                  ? 'Certidão OAB Expirada'
                  : 'Validação de OAB Obrigatória'}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
                {verificationStatus === 'PENDING'
                  ? 'Seu cadastro e certidão da OAB estão sob validação pela nossa equipe de compliance. Assim que a análise for concluída, você poderá submeter propostas para qualquer demanda pública.'
                  : 'Por exigência regulatória e segurança das partes, advogados precisam cadastrar seu número de OAB, estados de jurisdição e anexar a certidão da OAB antes de enviar propostas de honorários.'}
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => setIsNewProposalModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 bg-muted text-muted-foreground text-xs font-bold rounded-xl cursor-pointer hover:bg-muted/80"
              >
                Fechar
              </button>
              <button
                onClick={() => {
                  setIsNewProposalModalOpen(false);
                  setActiveTab('edit-profile');
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer transition-all"
              >
                {verificationStatus === 'PENDING' ? 'Ver Status no Perfil' : 'Cadastrar Dados da OAB no Perfil'}
              </button>
            </div>
          </div>
        ) : hasAlreadySubmitted ? (
          <div className="mt-6 p-6 bg-amber-50 border border-amber-200 rounded-2xl space-y-3 text-center">
            <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
            <h4 className="text-sm font-extrabold text-amber-600 dark:text-amber-400">Você já enviou uma proposta para esta demanda</h4>
            <p className="text-xs text-amber-600 dark:text-amber-400 leading-relaxed max-w-md mx-auto">
              Cada advogado pode enviar apenas uma proposta por projeto. Acompanhe o status e converse com o cliente através da página "Propostas Enviadas".
            </p>
            <button
              onClick={() => setIsNewProposalModalOpen(false)}
              className="px-5 py-2.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Fechar
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            
            {/* Mandatory Modality Information Notice */}
            <div className="p-3.5 bg-background border border-border rounded-2xl flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold text-foreground/90">Modalidade Exigida pelo Cliente: </span>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{hiringModalityLabel}</span>
                  <p className="text-[11px] text-muted-foreground/90">
                    O formato de contratação é definido pelo cliente e não pode ser alterado.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px] shrink-0 uppercase tracking-wider">
                Exigência do Cliente
              </span>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
                {errorMessage}
              </div>
            )}
            
            {/* Value Fields depending on Modality */}
            {isHourlyJob ? (
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Valor da Hora (R$/h)</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/90 font-bold text-sm">R$</span>
                      <input
                        type="number"
                        required
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        className="w-full bg-card border border-border rounded-xl pl-10 pr-3 py-2.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">Horas Estimadas</label>
                    <input
                      type="number"
                      required
                      value={estimatedHours}
                      onChange={(e) => setEstimatedHours(e.target.value)}
                      className="w-full bg-card border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground/90 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-xs">
                  <span className="font-bold text-muted-foreground/90">Total Calculado:</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    R$ {calculatedTotalValue.toLocaleString('pt-BR')} ({estimatedHours}h × R$ {hourlyRate}/h)
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Valor Total dos Honorários (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/90 font-bold text-sm">R$</span>
                    <input
                      type="number"
                      required
                      value={fixedValue}
                      onChange={(e) => setFixedValue(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Prazo de Execução (Dias Úteis)</label>
                  <input
                    type="number"
                    required
                    value={deliveryDays}
                    onChange={(e) => setDeliveryDays(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Carta de Apresentação & Tese Jurídica</label>
              <textarea
                required
                rows={4}
                placeholder="Explique sua experiência prévia na matéria, estratégia proposta e razões para contratação..."
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-3.5 text-xs text-foreground/90 placeholder:text-muted-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              />
            </div>

            {/* Milestones Breakdown */}
            <div className="space-y-2 pt-3 border-t border-border/50">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground uppercase tracking-wider">Cronograma de Marcos (Escrow)</label>
                <button
                  type="button"
                  onClick={handleAddMilestone}
                  className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Marco
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {milestones.map((m, idx) => (
                  <div key={idx} className="p-3 bg-background rounded-xl border border-border flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={m.title}
                        onChange={(e) => handleMilestoneChange(idx, 'title', e.target.value)}
                        placeholder="Nome do Marco"
                        className="bg-card border border-border rounded-lg px-2.5 py-1 text-xs font-bold text-foreground flex-1 focus:outline-none focus:border-emerald-600"
                      />
                      <div className="w-32 relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground/90 text-xs">R$</span>
                        <input
                          type="number"
                          value={m.value}
                          onChange={(e) => handleMilestoneChange(idx, 'value', Number(e.target.value))}
                          className="bg-card border border-border rounded-lg pl-7 pr-2 py-1 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold w-full focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                      {milestones.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMilestone(idx)}
                          className="p-1 text-rose-600 hover:text-rose-600 dark:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsNewProposalModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-semibold hover:bg-muted/80 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                {submitting ? 'Enviando...' : 'Enviar Proposta ao Cliente'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
