import React, { useState } from 'react';
import { X, Wallet, QrCode, CreditCard, Copy, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useLegalPlatform } from '../../hooks/useLegalPlatform';

export const AddBalanceModal: React.FC = () => {
  const { isAddBalanceModalOpen, setIsAddBalanceModalOpen, role, depositClientBalance, depositLawyerInternalBalance } = useLegalPlatform();

  const [amount, setAmount] = useState('500');
  const [method, setMethod] = useState<'PIX' | 'CARTAO_CREDITO'>('PIX');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isAddBalanceModalOpen) return null;

  const handleCopyPix = () => {
    navigator.clipboard.writeText('00020126580014br.gov.bcb.pix0136lwork-financeiro-f29a8128479a08125204000053039865405500.005802BR5920LWork Plataforma6009Sao Paulo62070503***6304D1A2');
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleConfirmDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (role === 'CLIENT') {
        await depositClientBalance(Number(amount), method);
      } else {
        await depositLawyerInternalBalance(Number(amount), method);
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsAddBalanceModalOpen(false);
      }, 1800);
    } catch (err) {
      console.error('Erro ao adicionar saldo:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const titleText = role === 'CLIENT' ? 'Adicionar Saldo à Carteira Digital' : 'Adicionar Saldo Interno (Assinaturas & Recursos)';
  const subtitleText = role === 'CLIENT'
    ? 'Aporte fundos para contratar advogados e gerenciar garantias em custódia (Escrow)'
    : 'Aporte saldo para contratante de planos Pro/Premium, destaques e ferramentas jurídicas';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-alt/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-card border border-border/80 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl p-6 text-foreground my-auto animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground">{titleText}</h3>
              <p className="text-[11px] text-muted-foreground/90">{subtitleText}</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddBalanceModalOpen(false)}
            className="p-2 rounded-xl text-muted-foreground/90 hover:text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-lg font-bold text-foreground">Aporte Confirmado!</h4>
            <p className="text-xs text-muted-foreground/90">
              O saldo de R$ {Number(amount).toLocaleString('pt-BR')} foi adicionado à sua conta na LWork com sucesso.
            </p>
          </div>
        ) : (
          <form onSubmit={handleConfirmDeposit} className="space-y-4 mt-4">
            
            {/* Amount input */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Valor do Aporte (R$)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/90 font-bold text-sm">R$</span>
                <input
                  type="number"
                  required
                  min="50"
                  step="50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-base font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 mt-2">
                {['100', '250', '500', '1000'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border ${
                      amount === preset
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-background text-muted-foreground/90 border-border hover:bg-muted'
                    }`}
                  >
                    +R$ {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Forma de Pagamento</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('PIX')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer text-left transition-all ${
                    method === 'PIX'
                      ? 'bg-emerald-50 border-emerald-600 text-foreground shadow-xs'
                      : 'bg-card border-border text-muted-foreground/90 hover:border-border-strong'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">PIX Instantâneo</p>
                    <p className="text-[10px] text-muted-foreground/90">Aprovação imediata</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('CARTAO_CREDITO')}
                  className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer text-left transition-all ${
                    method === 'CARTAO_CREDITO'
                      ? 'bg-emerald-50 border-emerald-600 text-foreground shadow-xs'
                      : 'bg-card border-border text-muted-foreground/90 hover:border-border-strong'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold">Cartão de Crédito</p>
                    <p className="text-[10px] text-muted-foreground/90">Até 12x</p>
                  </div>
                </button>
              </div>
            </div>

            {/* PIX QR Code UI */}
            {method === 'PIX' && (
              <div className="p-4 bg-background border border-border rounded-2xl space-y-3 text-center">
                <div className="bg-card p-3 rounded-xl inline-block border border-border shadow-xs">
                  {/* Mock QR Code visual */}
                  <div className="w-32 h-32 bg-alt rounded-lg flex items-center justify-center p-2 text-alt-foreground font-mono text-[9px] text-center">
                    [PIX QR CODE LWORK R$ {Number(amount).toLocaleString('pt-BR')}]
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-foreground/90">Chave PIX Copia e Cola:</p>
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="w-full py-2 px-3 bg-card border border-border rounded-xl flex items-center justify-between text-xs text-muted-foreground/90 hover:border-emerald-500 transition-all cursor-pointer font-mono text-[10px]"
                  >
                    <span className="truncate pr-2">00020126580014br.gov.bcb.pix0136lwork...</span>
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <Copy className="w-4 h-4 text-muted-foreground/90 shrink-0" />}
                  </button>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Transação protegida por criptografia de ponta a ponta e custodia de valor.</span>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-border/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAddBalanceModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-semibold hover:bg-muted/80 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer flex items-center gap-2"
              >
                {submitting ? 'Confirmando...' : 'Confirmar e Creditar Saldo'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
