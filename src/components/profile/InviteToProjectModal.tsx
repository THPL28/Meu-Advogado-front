import React, { useState } from 'react';
import { X, Send, Briefcase, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';
import { useLegalPlatform } from '../../hooks/useLegalPlatform';
import { UserAvatar } from '../ui/UserAvatar';

export const InviteToProjectModal: React.FC = () => {
  const {
    isInviteModalOpen,
    closeInviteModal,
    selectedLawyerForInvite,
    jobs,
    sendProjectInvite
  } = useLegalPlatform();

  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [customMessage, setCustomMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);

  if (!isInviteModalOpen || !selectedLawyerForInvite) return null;

  const openJobs = jobs.filter(j => j.status === 'OPEN' || j.status === 'IN_PROGRESS');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJobId) return;
    setSubmitting(true);
    try {
      await sendProjectInvite(selectedJobId, selectedLawyerForInvite.id, customMessage);
      setSentSuccess(true);
      setTimeout(() => {
        setSentSuccess(false);
        closeInviteModal();
        setCustomMessage('');
      }, 1800);
    } catch (err) {
      console.error('Failed to send invite:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-alt/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-card border border-border/80 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl p-6 text-foreground my-auto animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <UserAvatar
              src={selectedLawyerForInvite.avatarUrl}
              name={selectedLawyerForInvite.name}
              size="lg"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-foreground">Convidar para Demanda</h3>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-xs text-muted-foreground/90">{selectedLawyerForInvite.name} • OAB/{selectedLawyerForInvite.oabState} {selectedLawyerForInvite.oabNumber}</p>
            </div>
          </div>
          <button
            onClick={closeInviteModal}
            className="p-2 rounded-xl text-muted-foreground/90 hover:text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {sentSuccess ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-lg font-bold text-foreground">Convite Enviado com Sucesso!</h4>
            <p className="text-xs text-muted-foreground/90 max-w-sm mx-auto">
              O advogado {selectedLawyerForInvite.name} foi notificado e poderá enviar uma proposta formal com prazos e honorários.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            
            {/* Job Selection */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Selecione a Demanda / Processo
              </label>
              {openJobs.length > 0 ? (
                <select
                  required
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
                >
                  <option value="">Escolha uma demanda cadastrada...</option>
                  {openJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} (Orçamento: R$ {j.budgetMin.toLocaleString()} - R$ {j.budgetMax.toLocaleString()})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                  Nenhuma demanda aberta no momento. Cadastre um novo processo para poder convidar o advogado.
                </div>
              )}
            </div>

            {/* Custom Invitation Note */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Mensagem Personalizada ao Advogado (Opcional)
              </label>
              <textarea
                rows={4}
                placeholder="Ex: Olá Dr., gostaríamos de convidá-lo para analisar a tese de defesa da nossa empresa neste processo devido à sua vasta experiência em Direito Empresarial..."
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground/90 placeholder:text-muted-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              />
            </div>

            <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-200/80 flex items-start gap-2 text-xs text-muted-foreground">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>Ao enviar o convite, o advogado receberá um alerta imediato na plataforma com acesso prioritário às especificações do caso.</p>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-border/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeInviteModal}
                className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-semibold hover:bg-muted/80 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedJobId}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {submitting ? 'Enviando Convite...' : 'Enviar Convite Direto'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
