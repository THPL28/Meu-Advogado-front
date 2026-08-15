import React from 'react';
import {
  CreditCard,
  ArrowUpRight,
  ShieldCheck,
  Download,
  PlusCircle,
  Building2,
  Wallet,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Lock,
  Key
} from 'lucide-react';
import { useLegalPlatform } from '../hooks/useLegalPlatform';

export const PaymentsPage: React.FC = () => {
  const {
    role,
    user,
    payments,
    contracts,
    setIsPayoutModalOpen,
    setIsAddBalanceModalOpen,
    setIsBankDetailsModalOpen,
    setActiveTab,
    setSelectedCaseId
  } = useLegalPlatform();

  // Lawyer balances
  const lawyerWallet = user?.lawyerWallet || {
    availableBalance: 0,
    escrowBalance: 0,
    internalBalance: 0,
    totalEarned: 0,
    bankInfo: {
      pixKeyType: 'CPF',
      pixKey: user?.cpfCnpj || '',
      bankName: '',
      accountType: 'CORRENTE',
      agency: '',
      accountNumber: ''
    }
  };

  // Client balances
  const clientWallet = user?.clientWallet || {
    walletBalance: 0,
    escrowBalance: 0,
    totalInvested: 0
  };

  const handleOpenContractDetails = (caseId: string) => {
    setSelectedCaseId(caseId);
    setActiveTab('case-detail');
  };

  if (role === 'CLIENT') {
    return (
      <div className="space-y-8 animate-in fade-in duration-200">
        
        {/* Client Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
              <Wallet className="w-7 h-7 text-emerald-600" />
              Carteira Digital
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Gestão de saldos, depósitos em garantia e extrato consolidado de transações.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddBalanceModalOpen(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 shrink-0"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.5]" />
              Adicionar Saldo à Carteira
            </button>
          </div>
        </div>

        {/* Client Balance KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="p-6 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-2 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Saldo da Carteira Digital</p>
              <Wallet className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              R$ {clientWallet.walletBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">Saldo livre para contratações rápidas</p>
          </div>

          <div className="p-6 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Retido em Custódia (Escrow)</p>
              <Lock className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tracking-tight">
              R$ {clientWallet.escrowBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">Garantia bloqueada de projetos ativos</p>
          </div>

          <div className="p-6 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Investido na Plataforma</p>
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl lg:text-3xl font-extrabold text-foreground font-mono tracking-tight">
              R$ {clientWallet.totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-muted-foreground">Total pago por serviços concluídos</p>
          </div>

          <div className="p-6 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Contratos em Andamento</p>
              <FileCheck2 className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl lg:text-3xl font-extrabold text-foreground font-mono tracking-tight">
              {clientContracts.filter(c => c.status === 'ACTIVE').length}
            </p>
            <p className="text-xs text-muted-foreground">Projetos com custódia garantida</p>
          </div>

        </div>

        {/* Active Escrow Contracts Section */}
        <div className="p-6 sm:p-8 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-foreground">Garantias e Custódias Ativas em Projetos</h3>
              <p className="text-xs text-muted-foreground/90">Projetos em execução com saldo reservado no sistema de Escrow</p>
            </div>
            <button
              onClick={() => setActiveTab('contracts')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Ver Todos Contratos
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {contracts.filter(c => c.status === 'ACTIVE').length === 0 ? (
            <div className="p-8 text-center text-xs text-muted-foreground/90 font-medium bg-background rounded-2xl border border-border">
              Nenhum projeto ativo com saldo em custódia.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contracts.filter(c => c.status === 'ACTIVE').map((contract) => (
                <div key={contract.id} className="p-4 bg-background border border-border rounded-2xl space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase">
                        Em Custódia
                      </span>
                      <h4 className="text-sm font-extrabold text-foreground mt-1">{contract.jobTitle}</h4>
                      <p className="text-xs text-muted-foreground/90">Advogado: {contract.lawyerName}</p>
                    </div>
                    <span className="text-sm font-extrabold font-mono text-amber-600 dark:text-amber-400 shrink-0">
                      R$ {contract.escrowBalance.toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground/90 font-medium">Progresso de Entregas: {contract.progressPercentage}%</span>
                    <button
                      onClick={() => handleOpenContractDetails(contract.jobId)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-[11px] transition-all cursor-pointer flex items-center gap-1"
                    >
                      Ver Marcos & Liberar
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Client Transactions Extrato */}
        <div className="p-6 sm:p-8 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-foreground">Extrato Financeiro do Cliente</h3>
            <button className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1.5 cursor-pointer">
              <Download className="w-4 h-4" /> Exportar Extrato (PDF)
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-xs font-semibold text-muted-foreground/90 uppercase tracking-wider">
                  <th className="py-3.5 px-3">Data</th>
                  <th className="py-3.5 px-3">Lançamento / Demanda</th>
                  <th className="py-3.5 px-3">Favorecido / Destino</th>
                  <th className="py-3.5 px-3">Método</th>
                  <th className="py-3.5 px-3 text-right">Valor</th>
                  <th className="py-3.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 text-xs text-muted-foreground">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground/90 font-medium">
                      Nenhum lançamento financeiro registrado até o momento.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr key={p.id} className="hover:bg-background/80 transition-colors">
                      <td className="py-4 px-3 font-mono text-muted-foreground/90">
                        {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-4 px-3 font-semibold text-foreground">
                        {p.jobTitle}
                      </td>
                      <td className="py-4 px-3 text-muted-foreground/90">
                        {p.receiverName}
                      </td>
                      <td className="py-4 px-3 text-muted-foreground/90 font-mono">
                        {p.paymentMethod}
                      </td>
                      <td className="py-4 px-3 text-right font-mono font-bold text-foreground">
                        R$ {p.amount.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-4 px-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          p.status === 'RELEASED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {p.status === 'RELEASED' ? 'Pago / Liberado' : 'Em Custódia Escrow'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    );
  }

  // LAWYER VIEW
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Lawyer Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3 mt-1">
            <CreditCard className="w-8 h-8 text-emerald-600" />
            Carteira Digital do Advogado
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsBankDetailsModalOpen(true)}
            className="px-4 py-2.5 bg-muted hover:bg-muted/80 text-muted-foreground font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 border border-border"
          >
            <Building2 className="w-4 h-4 text-muted-foreground/90" />
            Dados Bancários / PIX
          </button>

          <button
            onClick={() => setIsAddBalanceModalOpen(true)}
            className="px-4 py-2.5 bg-alt hover:bg-alt/90 text-alt-foreground font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 shrink-0"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            Adicionar Saldo Interno
          </button>

          <button
            onClick={() => setIsPayoutModalOpen(true)}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 shrink-0"
          >
            <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            Solicitar Resgate PIX
          </button>
        </div>
      </div>

      {/* Lawyer Balance KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="p-6 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">Saldo Disponível para Saque</p>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <p className="text-2xl lg:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
            R$ {lawyerWallet.availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-6 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">Saldo em Custódia (Escrow)</p>
            <Lock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl lg:text-3xl font-extrabold text-amber-600 dark:text-amber-400 font-mono tracking-tight">
            R$ {lawyerWallet.escrowBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-6 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">Saldo Interno (Assinaturas)</p>
            <Sparkles className="w-4 h-4 text-muted-foreground" />
          </div>
          <p className="text-2xl lg:text-3xl font-extrabold text-foreground font-mono tracking-tight">
            R$ {lawyerWallet.internalBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="p-6 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-2 shadow-xs">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">Faturamento Total Liberado</p>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl lg:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
            R$ {lawyerWallet.totalEarned.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

      </div>

      {/* Lawyer Bank Info & Pix Key Overview Card */}
      <div className="p-6 bg-background border border-border/90 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-card border border-border rounded-2xl text-emerald-600 shrink-0 shadow-2xs">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-foreground mt-0.5">
              Chave PIX ({lawyerWallet.bankInfo?.pixKeyType}): <span className="font-mono text-emerald-600 dark:text-emerald-400">{lawyerWallet.bankInfo?.pixKey}</span>
            </p>
            <p className="text-xs text-muted-foreground/90 mt-0.5">
              {lawyerWallet.bankInfo?.bankName} • Agência {lawyerWallet.bankInfo?.agency} • Conta {lawyerWallet.bankInfo?.accountNumber}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsBankDetailsModalOpen(true)}
          className="px-4 py-2 bg-card hover:bg-muted text-foreground/90 font-bold text-xs rounded-xl border border-border transition-all cursor-pointer shrink-0"
        >
          Editar Conta e Chave PIX
        </button>
      </div>

      {/* Lawyer Transactions Extrato */}
      <div className="p-6 sm:p-8 bg-card border border-border/80 rounded-2xl sm:rounded-3xl space-y-5 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-foreground">Extrato de Honorários e Resgates do Advogado</h3>
          <button className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1.5 cursor-pointer">
            <Download className="w-4 h-4" /> Exportar Demonstrativo (PDF)
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 text-xs font-semibold text-muted-foreground/90 uppercase tracking-wider">
                <th className="py-3.5 px-3">Data/Hora</th>
                <th className="py-3.5 px-3">Descrição do Lançamento</th>
                <th className="py-3.5 px-3">Pagador → Recebedor</th>
                <th className="py-3.5 px-3">Método</th>
                <th className="py-3.5 px-3 text-right">Valor Líquido</th>
                <th className="py-3.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 text-xs text-muted-foreground">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-muted-foreground/90 font-medium">
                    Nenhum lançamento financeiro registrado até o momento.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p.id} className="hover:bg-background/80 transition-colors">
                    <td className="py-4 px-3 font-mono text-muted-foreground/90">
                      {new Date(p.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-4 px-3 font-semibold text-foreground">
                      {p.jobTitle}
                    </td>
                    <td className="py-4 px-3 text-muted-foreground/90">
                      {p.payerName}
                    </td>
                    <td className="py-4 px-3 text-muted-foreground/90 font-mono">
                      {p.paymentMethod}
                    </td>
                    <td className="py-4 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      R$ {p.netAmount.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-4 px-3 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        p.status === 'RELEASED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {p.status === 'RELEASED' ? 'Liberado / Recebido' : 'Em Custódia Escrow'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
