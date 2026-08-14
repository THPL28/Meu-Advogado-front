import React, { useState } from 'react';
import {
  CreditCard,
  Check,
  Zap,
  Star,
  ShieldCheck,
  TrendingUp,
  History,
  Download,
  X,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ArrowRight,
  Shield
} from 'lucide-react';
import { useLegalPlatform } from '../hooks/useLegalPlatform';
import { authApi } from '../services/api';

export const SubscriptionPage: React.FC = () => {
  const { role, user, refreshData, paySubscriptionWithBalance, setIsAddBalanceModalOpen, proposals } = useLegalPlatform();
  
  const [activeTab, setActiveTab] = useState<'plans' | 'billing'>('plans');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [cardName, setCardName] = useState(user?.name || '');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 8812');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('491');
  const [updating, setUpdating] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [insufficientBalanceModal, setInsufficientBalanceModal] = useState<{ open: boolean; plan: 'Pro' | 'Premium'; price: number } | null>(null);

  if (role !== 'LAWYER') {
    return (
      <div className="flex items-center justify-center h-full p-8 text-center">
        <p className="text-muted-foreground/90 font-medium">Apenas advogados possuem planos de assinatura e controle de consumo de propostas.</p>
      </div>
    );
  }

  const currentPlan = user?.subscriptionPlan || 'Pro';
  const lawyerInternalBalance = user?.lawyerWallet?.internalBalance || 0;

  // Consumption statistics computed dynamically
  const lawyerProposals = proposals.filter(p => !p.lawyerId || p.lawyerId === user?.id);
  const weeklyLimit = currentPlan === 'Basic' ? 2 : currentPlan === 'Pro' ? 8 : 999;
  const weeklyUsed = Math.min(lawyerProposals.length, weeklyLimit);

  const monthlyLimit = currentPlan === 'Basic' ? 5 : currentPlan === 'Pro' ? 25 : 999;
  const monthlyUsed = lawyerProposals.length;

  const concurrentLimit = currentPlan === 'Basic' ? 2 : currentPlan === 'Pro' ? 5 : 999;
  const concurrentUsed = lawyerProposals.filter(p => p.status === 'PENDING' || p.status === 'UNDER_REVIEW').length;

  const isNearLimit = (monthlyUsed / monthlyLimit) >= 0.8 && currentPlan !== 'Premium';

  const handleChangePlan = async (plan: 'Basic' | 'Pro' | 'Premium') => {
    if (plan === 'Basic') {
      setUpdating(true);
      try {
        await authApi.updateProfile({ subscriptionPlan: 'Basic' });
        await refreshData();
        setSuccessMessage('Plano alterado para Básico com sucesso.');
        setTimeout(() => setSuccessMessage(''), 4000);
      } catch (err) {
        console.error('Erro ao mudar para Básico:', err);
      } finally {
        setUpdating(false);
      }
      return;
    }

    const price = plan === 'Pro' ? 99 : 249;

    // Check if lawyer has enough internal balance
    if (lawyerInternalBalance >= price) {
      setUpdating(true);
      try {
        await paySubscriptionWithBalance(plan, price);
        setSuccessMessage(`Plano ${plan} ativado com sucesso pagando R$ ${price} com Saldo Interno da Carteira!`);
        setTimeout(() => setSuccessMessage(''), 5000);
      } catch (err: any) {
        setInsufficientBalanceModal({ open: true, plan, price });
      } finally {
        setUpdating(false);
      }
    } else {
      setInsufficientBalanceModal({ open: true, plan, price });
    }
  };

  const handleUpdatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPaymentModalOpen(false);
    setSuccessMessage('Método de pagamento atualizado com sucesso!');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleConfirmCancel = async () => {
    await handleChangePlan('Basic');
    setIsCancelModalOpen(false);
    setSuccessMessage('Assinatura cancelada. Seu plano voltará ao nível Básico ao fim do ciclo atual.');
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  const handleDownloadInvoice = (invId: string) => {
    alert(`Download da Fatura #${invId} iniciado (Arquivo PDF).`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">Gestão da Assinatura</h1>
          <p className="text-sm text-muted-foreground/90 mt-1">
            Controle seu consumo de propostas, altere seu plano e gerencie o histórico de faturamento.
          </p>
        </div>
        <div className="flex bg-muted rounded-2xl p-1">
          <button
            onClick={() => setActiveTab('plans')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'plans' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground/90 hover:text-foreground'
            }`}
          >
            Meu Plano & Consumo
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'billing' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground/90 hover:text-foreground'
            }`}
          >
            Faturamento & Cartão
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-2xl animate-in fade-in duration-150 flex items-center justify-between">
          <span>{successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="p-1 hover:bg-emerald-100 rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {activeTab === 'plans' && (
        <div className="space-y-8">
          
          {/* Warning Banner if >= 80% */}
          {isNearLimit && (
            <div className="p-4 sm:p-5 bg-amber-50 border border-amber-200/80 rounded-3xl flex items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Atenção ao Limite de Consumo</h4>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                    Você já utilizou {monthlyUsed} das {monthlyLimit} propostas disponíveis neste mês ({Math.round((monthlyUsed / monthlyLimit) * 100)}%). Faça upgrade para evitar bloqueios.
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleChangePlan('Premium')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 cursor-pointer"
              >
                Upgrade Premium
              </button>
            </div>
          )}

          {/* Pricing Plans Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            
            {/* Basic Plan */}
            <div className={`bg-card rounded-3xl border p-8 shadow-xs flex flex-col justify-between relative transition-all ${
              currentPlan === 'Basic' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-border/80'
            }`}>
              {currentPlan === 'Basic' && (
                <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 bg-alt text-alt-foreground text-[10px] font-bold uppercase tracking-wider rounded-full">
                  Seu Plano Atual
                </div>
              )}
              
              <div>
                <h3 className="text-xl font-extrabold text-foreground mb-2">Plano Básico</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-foreground font-mono">Grátis</span>
                </div>
                
                <ul className="space-y-3.5 text-xs text-muted-foreground/90 mb-8">
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 5 propostas mensais</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 2 propostas simultâneas</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> 2 convites diretos por mês</li>
                  <li className="flex items-center gap-2 text-alt-foreground/50"><X className="w-4 h-4 text-muted-foreground shrink-0" /> Sem destaque nas buscas</li>
                  <li className="flex items-center gap-2 text-alt-foreground/50"><X className="w-4 h-4 text-muted-foreground shrink-0" /> Sem selo Premium</li>
                </ul>
              </div>

              <button
                disabled={currentPlan === 'Basic' || updating}
                onClick={() => handleChangePlan('Basic')}
                className={`w-full py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                  currentPlan === 'Basic'
                    ? 'bg-muted text-alt-foreground/50 cursor-not-allowed'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {currentPlan === 'Basic' ? 'Plano Atual' : 'Mudar para Básico'}
              </button>
            </div>

            {/* Pro Plan */}
            <div className={`bg-alt text-alt-foreground rounded-3xl border p-8 shadow-xl flex flex-col justify-between relative transform lg:-translate-y-2 transition-all ${
              currentPlan === 'Pro' ? 'border-emerald-500 ring-4 ring-emerald-500/20' : 'border-border-alt'
            }`}>
              {currentPlan === 'Pro' && (
                <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md">
                  Seu Plano Atual
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Plano Pro
                  </h3>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    Recomendado
                  </span>
                </div>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-xs text-alt-foreground/50">R$</span>
                  <span className="text-4xl font-extrabold font-mono text-white">99</span>
                  <span className="text-xs text-alt-foreground/50">/mês</span>
                </div>
                
                <ul className="space-y-3.5 text-xs text-muted-foreground mb-8">
                  <li className="flex items-center gap-2 font-semibold text-white"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 25 propostas mensais</li>
                  <li className="flex items-center gap-2 font-semibold text-white"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 5 propostas simultâneas</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> 10 convites diretos por mês</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Destaque nas buscas públicas</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> Selo Advogado Verificado Pro</li>
                </ul>
              </div>

              <button
                disabled={currentPlan === 'Pro' || updating}
                onClick={() => handleChangePlan('Pro')}
                className={`w-full py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                  currentPlan === 'Pro'
                    ? 'bg-alt/90 text-alt-foreground/50 cursor-not-allowed border border-border-alt'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                }`}
              >
                {currentPlan === 'Pro' ? 'Plano Atual' : 'Fazer Upgrade Pro'}
              </button>
            </div>

            {/* Premium Plan */}
            <div className={`bg-card rounded-3xl border p-8 shadow-xs flex flex-col justify-between relative transition-all ${
              currentPlan === 'Premium' ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-border/80'
            }`}>
              {currentPlan === 'Premium' && (
                <div className="absolute top-0 right-8 -translate-y-1/2 px-3 py-1 bg-alt text-alt-foreground text-[10px] font-bold uppercase tracking-wider rounded-full">
                  Seu Plano Atual
                </div>
              )}

              <div>
                <h3 className="text-xl font-extrabold text-foreground mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" /> Plano Premium
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-xs text-alt-foreground/50">R$</span>
                  <span className="text-3xl font-extrabold font-mono text-foreground">249</span>
                  <span className="text-xs text-alt-foreground/50">/mês</span>
                </div>
                
                <ul className="space-y-3.5 text-xs text-muted-foreground/90 mb-8">
                  <li className="flex items-center gap-2 font-bold text-foreground"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Propostas Ilimitadas</li>
                  <li className="flex items-center gap-2 font-bold text-foreground"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Convites Ilimitados</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Prioridade máxima em buscas</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Selo Exclusive no Perfil</li>
                  <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 shrink-0" /> Relatórios de taxa de conversão</li>
                </ul>
              </div>

              <button
                disabled={currentPlan === 'Premium' || updating}
                onClick={() => handleChangePlan('Premium')}
                className={`w-full py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                  currentPlan === 'Premium'
                    ? 'bg-muted text-alt-foreground/50 cursor-not-allowed'
                    : 'bg-alt hover:bg-alt/90 text-alt-foreground shadow-md'
                }`}
              >
                {currentPlan === 'Premium' ? 'Plano Atual' : 'Mudar para Premium'}
              </button>
            </div>

          </div>

          {currentPlan !== 'Basic' && (
            <div className="text-center pt-4">
              <button
                onClick={() => setIsCancelModalOpen(true)}
                className="text-xs text-rose-600 hover:text-rose-600 dark:text-rose-400 font-semibold underline cursor-pointer"
              >
                Cancelar assinatura recorrente
              </button>
            </div>
          )}

        </div>
      )}

      {activeTab === 'billing' && (
        <div className="space-y-6">
          
          <div className="bg-card p-8 rounded-3xl border border-border/80 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Cartão de Crédito Cadastrado</h3>
                <p className="text-xs text-muted-foreground/90 mt-1">{cardNumber} • Expira em {cardExp} ({cardName})</p>
              </div>
            </div>
            <button
              onClick={() => setIsPaymentModalOpen(true)}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground/90 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Atualizar Cartão
            </button>
          </div>

          <div className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-alt-foreground/50" />
                <h3 className="text-sm font-bold text-foreground">Histórico de Faturas & Recibos</h3>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-background/50">
                    <th className="p-4 text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">Data</th>
                    <th className="p-4 text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">Descrição</th>
                    <th className="p-4 text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">Valor</th>
                    <th className="p-4 text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">Status</th>
                    <th className="p-4 text-xs font-bold text-muted-foreground/90 uppercase tracking-wider text-right">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-xs text-muted-foreground/90 font-medium">
                      Nenhuma fatura anterior registrada.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      )}

      {/* Payment Method Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-alt/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-card border border-border/80 w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 text-foreground">
            <div className="flex items-center justify-between pb-4 border-b border-border/50">
              <h3 className="text-base font-bold text-foreground">Atualizar Dados do Cartão</h3>
              <button onClick={() => setIsPaymentModalOpen(false)} className="p-1 text-alt-foreground/50 hover:text-muted-foreground/90 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdatePayment} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Nome no Cartão</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground/90"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1">Número do Cartão</label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl p-2.5 text-xs font-mono text-foreground/90"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">Validade</label>
                  <input
                    type="text"
                    required
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl p-2.5 text-xs font-mono text-foreground/90"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1">CVC</label>
                  <input
                    type="text"
                    required
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl p-2.5 text-xs font-mono text-foreground/90"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-border/50 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-muted text-xs font-semibold text-muted-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                >
                  Salvar Cartão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Insufficient / Internal Balance Payment Modal */}
      {insufficientBalanceModal?.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-alt/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-card border border-border/80 w-full max-w-md rounded-3xl shadow-2xl p-6 text-foreground space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <h3 className="text-base font-extrabold text-foreground">Ativação do Plano {insufficientBalanceModal.plan}</h3>
              <button
                onClick={() => setInsufficientBalanceModal(null)}
                className="p-1.5 rounded-xl text-alt-foreground/50 hover:text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-muted-foreground/90">
              <div className="p-3.5 bg-background border border-border rounded-2xl flex items-center justify-between font-mono">
                <span>Valor do Plano:</span>
                <span className="font-extrabold text-foreground text-sm">R$ {insufficientBalanceModal.price},00 / mês</span>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200/80 rounded-2xl space-y-1 text-amber-900">
                <p className="font-bold">Saldo Interno Disponível: R$ {lawyerInternalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="text-[11px] text-amber-600 dark:text-amber-400">
                  {lawyerInternalBalance < insufficientBalanceModal.price
                    ? `Faltam R$ ${(insufficientBalanceModal.price - lawyerInternalBalance).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} para pagar com Saldo Interno.`
                    : 'Você possui saldo interno suficiente.'}
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setInsufficientBalanceModal(null);
                    setIsAddBalanceModalOpen(true);
                  }}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Adicionar Saldo Interno com PIX
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    setUpdating(true);
                    try {
                      await authApi.updateProfile({ subscriptionPlan: insufficientBalanceModal.plan });
                      await refreshData();
                      setSuccessMessage(`Plano ${insufficientBalanceModal.plan} ativado via Cartão de Crédito!`);
                      setInsufficientBalanceModal(null);
                      setTimeout(() => setSuccessMessage(''), 4000);
                    } catch (err) {
                      console.error('Erro ao pagar via cartão:', err);
                    } finally {
                      setUpdating(false);
                    }
                  }}
                  className="w-full py-3 bg-muted hover:bg-muted/80 text-foreground/90 font-bold rounded-xl text-xs transition-all cursor-pointer border border-border"
                >
                  Pagar com Cartão de Crédito Salvo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-alt/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-card border border-border/80 w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 text-foreground space-y-4">
            <h3 className="text-base font-bold text-foreground">Cancelar Assinatura?</h3>
            <p className="text-xs text-muted-foreground/90 leading-relaxed">
              Ao cancelar, você perderá o selo de verificação no seu perfil, o destaque nas buscas de clientes e o limite estendido de propostas.
            </p>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">Motivo do cancelamento (opcional)</label>
              <textarea
                rows={2}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Conte-nos o motivo..."
                className="w-full bg-background border border-border rounded-xl p-2.5 text-xs text-foreground/90"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-muted text-xs font-semibold text-muted-foreground cursor-pointer"
              >
                Manter Assinatura
              </button>
              <button
                onClick={handleConfirmCancel}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
              >
                Confirmar Cancelamento
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
