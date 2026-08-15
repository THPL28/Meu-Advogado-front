import React, { useState } from 'react';
import {
  X,
  Wallet,
  QrCode,
  CreditCard,
  Copy,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Lock,
  Sparkles,
  FileText,
  Loader2,
  Check,
} from 'lucide-react';
import { useLegalPlatform } from '../../hooks/useLegalPlatform';

export const AddBalanceModal: React.FC = () => {
  const {
    isAddBalanceModalOpen,
    setIsAddBalanceModalOpen,
    role,
    depositClientBalance,
    depositLawyerInternalBalance,
    user,
  } = useLegalPlatform();

  const [amount, setAmount] = useState('500');
  const [method, setMethod] = useState<'PIX' | 'CARTAO_CREDITO' | 'BOLETO'>('PIX');
  const [submitting, setSubmitting] = useState(false);
  const [submittingStatus, setSubmittingStatus] = useState<string>('');
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedBoleto, setCopiedBoleto] = useState(false);
  const [success, setSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string>('');

  // Stripe Card Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.name || '');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [installments, setInstallments] = useState('1');

  if (!isAddBalanceModalOpen) return null;

  const numAmount = Math.max(10, Number(amount) || 0);

  // Format Card Number (0000 0000 0000 0000)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  // Format Card Expiry (MM/AA)
  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Format CVC
  const handleCardCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardCvc(raw);
  };

  // Generate mock PIX payload
  const pixPayload = `00020126580014br.gov.bcb.pix0136lwork-financeiro-${numAmount.toFixed(2)}-${Date.now()}520400005303986540${numAmount.toFixed(2)}5802BR5920LWork Plataforma6009Sao Paulo62070503***6304`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 3000);
  };

  const boletoCode = '34191.79001 01043.510047 91020.150008 5 912300000' + String(numAmount).padStart(4, '0');

  const handleCopyBoleto = () => {
    navigator.clipboard.writeText(boletoCode);
    setCopiedBoleto(true);
    setTimeout(() => setCopiedBoleto(false), 3000);
  };

  const handleConfirmDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (method === 'CARTAO_CREDITO') {
        setSubmittingStatus('Conectando com o Stripe Gateway Seguro...');
        await new Promise((r) => setTimeout(r, 600));
        setSubmittingStatus('Validando com 3D Secure / Antifraude...');
        await new Promise((r) => setTimeout(r, 600));
      } else {
        setSubmittingStatus('Processando aporte financeiro...');
        await new Promise((r) => setTimeout(r, 400));
      }

      if (role === 'CLIENT') {
        await depositClientBalance(numAmount, method === 'BOLETO' ? 'BOLETO' : method === 'CARTAO_CREDITO' ? 'CARTAO_CREDITO' : 'PIX');
      } else {
        await depositLawyerInternalBalance(numAmount, method === 'BOLETO' ? 'BOLETO' : method === 'CARTAO_CREDITO' ? 'CARTAO_CREDITO' : 'PIX');
      }

      const txId = 'tx_stripe_' + Math.random().toString(36).substring(2, 9).toUpperCase();
      setTransactionId(txId);
      setSuccess(true);

      setTimeout(() => {
        setSuccess(false);
        setIsAddBalanceModalOpen(false);
      }, 2500);
    } catch (err) {
      console.error('Erro ao adicionar saldo:', err);
    } finally {
      setSubmitting(false);
      setSubmittingStatus('');
    }
  };

  const titleText = role === 'CLIENT' ? 'Adicionar Saldo à Carteira Digital' : 'Adicionar Saldo Interno';
  const subtitleText = role === 'CLIENT'
    ? 'Aporte fundos via Pix ou Cartão Stripe para contratar advogados e garantir custódia (Escrow)'
    : 'Aporte saldo para contratação de planos Pro/Premium e recursos jurídicos';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-alt/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-card border border-border/80 w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-6 sm:p-7 text-foreground my-auto animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground">{titleText}</h3>
              <p className="text-[11px] text-muted-foreground">{subtitleText}</p>
            </div>
          </div>
          <button
            onClick={() => setIsAddBalanceModalOpen(false)}
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="py-8 px-4 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-extrabold text-foreground">Aporte Confirmado com Sucesso!</h4>
              <p className="text-xs text-muted-foreground">
                O valor de <strong className="text-emerald-600 font-mono font-bold">R$ {numAmount.toLocaleString('pt-BR')}</strong> foi creditado na sua conta instantaneamente.
              </p>
            </div>
            <div className="p-3 bg-muted/60 rounded-xl border border-border text-[11px] font-mono text-muted-foreground flex items-center justify-between">
              <span>Recibo Transação:</span>
              <strong className="text-foreground">{transactionId}</strong>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmDeposit} className="space-y-4 mt-4">
            
            {/* Amount input */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Valor do Aporte (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">
                  R$
                </span>
                <input
                  type="number"
                  required
                  min="20"
                  step="10"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl pl-10 pr-3 py-2.5 text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
                />
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {['100', '250', '500', '1000', '2500'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmount(preset)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                      amount === preset
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-background text-muted-foreground border-border hover:bg-muted'
                    }`}
                  >
                    +R$ {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Forma de Pagamento
              </label>
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setMethod('PIX')}
                  className={`p-3 rounded-xl border flex flex-col items-center sm:items-start gap-1 cursor-pointer transition-all ${
                    method === 'PIX'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-600 text-foreground shadow-xs'
                      : 'bg-card border-border text-muted-foreground hover:border-border-strong'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-emerald-600" />
                  <p className="text-xs font-bold">PIX</p>
                  <p className="text-[10px] text-muted-foreground hidden sm:block">Aprovação imediata</p>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('CARTAO_CREDITO')}
                  className={`p-3 rounded-xl border flex flex-col items-center sm:items-start gap-1 cursor-pointer transition-all ${
                    method === 'CARTAO_CREDITO'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-600 text-foreground shadow-xs'
                      : 'bg-card border-border text-muted-foreground hover:border-border-strong'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                  <p className="text-xs font-bold">Stripe Cartão</p>
                  <p className="text-[10px] text-muted-foreground hidden sm:block">Até 12x sem juros</p>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('BOLETO')}
                  className={`p-3 rounded-xl border flex flex-col items-center sm:items-start gap-1 cursor-pointer transition-all ${
                    method === 'BOLETO'
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-600 text-foreground shadow-xs'
                      : 'bg-card border-border text-muted-foreground hover:border-border-strong'
                  }`}
                >
                  <FileText className="w-5 h-5 text-emerald-600" />
                  <p className="text-xs font-bold">Boleto Bancário</p>
                  <p className="text-[10px] text-muted-foreground hidden sm:block">Compensação D+1</p>
                </button>
              </div>
            </div>

            {/* PIX UI */}
            {method === 'PIX' && (
              <div className="p-4 bg-background border border-border rounded-2xl space-y-3 text-center animate-in fade-in">
                <div className="bg-card p-3 rounded-xl inline-block border border-border shadow-xs">
                  <div className="w-36 h-36 bg-alt rounded-lg flex flex-col items-center justify-center p-2 text-alt-foreground font-mono text-[10px] text-center space-y-1">
                    <QrCode className="w-16 h-16 opacity-80" />
                    <span className="font-bold">PIX R$ {numAmount.toLocaleString('pt-BR')}</span>
                  </div>
                </div>
                <div className="space-y-1 text-left">
                  <p className="text-xs font-bold text-foreground">Chave PIX Copia e Cola:</p>
                  <button
                    type="button"
                    onClick={handleCopyPix}
                    className="w-full py-2.5 px-3 bg-card border border-border rounded-xl flex items-center justify-between text-xs text-muted-foreground hover:border-emerald-500 transition-all cursor-pointer font-mono text-[11px]"
                  >
                    <span className="truncate pr-2">{pixPayload.slice(0, 38)}...</span>
                    {copiedPix ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-bold shrink-0">
                        <Check className="w-4 h-4" /> Copiado!
                      </span>
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STRIPE CREDIT CARD UI */}
            {method === 'CARTAO_CREDITO' && (
              <div className="p-4 bg-background border border-border rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <span className="text-xs font-extrabold text-foreground flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-emerald-600" /> Dados do Cartão (Stripe Elements)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Powered by Stripe
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Número do Cartão
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-mono font-bold text-foreground focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Nome Impresso no Cartão
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="NOME COMO NO CARTAO"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-bold text-foreground uppercase focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      Validade (MM/AA)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="MM/AA"
                      value={cardExpiry}
                      onChange={handleCardExpiryChange}
                      maxLength={5}
                      className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                      CVC / CVV
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="123"
                      value={cardCvc}
                      onChange={handleCardCvcChange}
                      maxLength={4}
                      className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs font-mono text-foreground focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                    Parcelamento
                  </label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(e.target.value)}
                    className="w-full bg-card border border-border rounded-xl px-3 py-2 text-xs text-foreground font-semibold focus:outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="1">1x de R$ {numAmount.toLocaleString('pt-BR')} (À vista)</option>
                    <option value="2">2x de R$ {(numAmount / 2).toLocaleString('pt-BR')} sem juros</option>
                    <option value="3">3x de R$ {(numAmount / 3).toLocaleString('pt-BR')} sem juros</option>
                    <option value="6">6x de R$ {(numAmount / 6).toLocaleString('pt-BR')} sem juros</option>
                    <option value="12">12x de R$ {(numAmount / 12).toLocaleString('pt-BR')} sem juros</option>
                  </select>
                </div>
              </div>
            )}

            {/* BOLETO UI */}
            {method === 'BOLETO' && (
              <div className="p-4 bg-background border border-border rounded-2xl space-y-3 text-left animate-in fade-in">
                <div className="flex items-center justify-between pb-2 border-b border-border/50">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-600" /> Boleto Bancário LWork
                  </span>
                  <span className="text-[10px] text-muted-foreground">Vencimento em 3 dias</span>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-semibold text-muted-foreground">Linha Digitável:</p>
                  <button
                    type="button"
                    onClick={handleCopyBoleto}
                    className="w-full py-2.5 px-3 bg-card border border-border rounded-xl flex items-center justify-between text-xs text-muted-foreground hover:border-emerald-500 transition-all cursor-pointer font-mono text-[11px]"
                  >
                    <span className="truncate pr-2">{boletoCode}</span>
                    {copiedBoleto ? (
                      <span className="flex items-center gap-1 text-emerald-600 font-bold shrink-0">
                        <Check className="w-4 h-4" /> Copiado!
                      </span>
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>
                Transação protegida por criptografia de 256-bit e custódia segura de garantia (Escrow).
              </span>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIsAddBalanceModalOpen(false)}
                disabled={submitting}
                className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-semibold hover:bg-muted/80 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{submittingStatus || 'Processando...'}</span>
                  </>
                ) : (
                  <>
                    <span>Confirmar e Creditar R$ {numAmount.toLocaleString('pt-BR')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
