import React, { useState } from 'react';
import { X, CreditCard, CheckCircle2, DollarSign } from 'lucide-react';
import { useLegalPlatform } from '../../hooks/useLegalPlatform';
import { paymentsApi } from '../../services/api';

export const PayoutModal: React.FC = () => {
  const { isPayoutModalOpen, setIsPayoutModalOpen, payments, refreshData } = useLegalPlatform();

  const [amount, setAmount] = useState('14850');
  const [pixKey, setPixKey] = useState('rodrigo.silveira@adv.oabsp.org.br');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isPayoutModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await paymentsApi.requestPayout(Number(amount), pixKey);
      await refreshData();
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setIsPayoutModalOpen(false);
      }, 1500);
    } catch (err) {
      console.error('Failed to request payout:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-alt/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-card border border-border/80 w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl p-6 text-foreground my-auto animate-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Solicitar Resgate PIX</h3>
              <p className="text-xs text-muted-foreground/90">Transferência imediata do saldo disponível</p>
            </div>
          </div>
          <button
            onClick={() => setIsPayoutModalOpen(false)}
            className="p-2 rounded-xl text-muted-foreground/90 hover:text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h4 className="text-lg font-bold text-foreground">Transferência Executada!</h4>
            <p className="text-xs text-muted-foreground/90">O montante de R$ {Number(amount).toLocaleString('pt-BR')} foi transferido para {pixKey}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Valor do Resgate (R$)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/90 font-bold text-sm">R$</span>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-base font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
                />
              </div>
              <p className="text-xs text-muted-foreground/90 mt-1">Saldo Total Disponível: R$ 14.850,00</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Chave PIX Cadastrada (CPF/CNPJ/Email)</label>
              <input
                type="text"
                required
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              />
            </div>

            <div className="p-3.5 bg-background rounded-xl border border-border text-xs text-muted-foreground/90 space-y-1">
              <p className="font-semibold text-foreground">Informações da Operação:</p>
              <p>• Liberação Instantânea via Banco Central (PIX)</p>
              <p>• Isento de taxas administrativas para advogados parceiros</p>
            </div>

            <div className="pt-4 border-t border-border/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsPayoutModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-semibold hover:bg-muted/80 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                {submitting ? 'Transferindo...' : 'Confirmar Resgate PIX'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
