import React, { useState, useEffect } from 'react';
import { 
  FileText, ShieldCheck, CheckCircle2, Clock, Star, 
  AlertCircle, ChevronRight, ChevronDown, ChevronUp, Lock, Check, Send, 
  MessageSquare, XCircle, Sparkles, AlertTriangle
} from 'lucide-react';
import { useLegalPlatform } from '../hooks/useLegalPlatform';
import { contractsApi, reviewsApi } from '../services/api';
import { Contract, Milestone } from '../types';

const RatingRow = ({ label, value, onChange }: { label: string, value: number, onChange: (val: number) => void }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm font-semibold text-muted-foreground">{label}</span>
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => onChange(star)}
          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
            value >= star
              ? 'bg-amber-50 border-amber-300 text-amber-500'
              : 'bg-background border-border text-muted-foreground hover:bg-muted'
          }`}
        >
          <Star className="w-5 h-5 fill-current" />
        </button>
      ))}
    </div>
  </div>
);

export const ContractsPage: React.FC = () => {
  const { contracts, role, verificationStatus, setActiveTab, refreshData } = useLegalPlatform();

  const [collapsedContracts, setCollapsedContracts] = useState<Record<string, boolean>>({});

  const toggleCollapse = (contractId: string) => {
    setCollapsedContracts(prev => ({
      ...prev,
      [contractId]: !prev[contractId]
    }));
  };

  // Fullscreen Review State
  const [reviewModalContractId, setReviewModalContractId] = useState<string | null>(null);
  const [reviewStep, setReviewStep] = useState<number>(1);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewResult, setReviewResult] = useState<{ message: string; published: boolean } | null>(null);

  // Ratings State
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [detailedRatings, setDetailedRatings] = useState({
    r1: 5, r2: 5, r3: 5, r4: 5
  });
  const [platformRating, setPlatformRating] = useState<number>(5);

  const handleUpdateMilestone = async (contractId: string, milestoneId: string, status: string) => {
    try {
      await contractsApi.updateMilestoneStatus(contractId, milestoneId, status as import('../types').MilestoneStatus);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReleaseMilestone = async (contractId: string, milestoneId: string) => {
    try {
      await contractsApi.releaseMilestone(contractId, milestoneId);
      await refreshData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFinishProjectClick = (contractId: string) => {
    setReviewModalContractId(contractId);
    setReviewStep(1);
    setReviewResult(null);
    setRating(5);
    setComment('');
    setPlatformRating(5);
    setDetailedRatings({ r1: 5, r2: 5, r3: 5, r4: 5 });
  };

  const handleSubmitReview = async () => {
    if (!reviewModalContractId) return;
    setSubmittingReview(true);
    try {
      // First, mark the contract as completed
      await contractsApi.finishContract(reviewModalContractId);

      const res = await reviewsApi.submitReview({
        contractId: reviewModalContractId,
        rating,
        comment,
        detailedRatings: role === 'CLIENT' ? {
          technicalQuality: detailedRatings.r1,
          communication: detailedRatings.r2,
          deadlineCompliance: detailedRatings.r3,
          professionalism: detailedRatings.r4
        } : {
          clarity: detailedRatings.r1,
          responsiveness: detailedRatings.r2,
          organization: detailedRatings.r3,
          easeOfWork: detailedRatings.r4
        }
      });

      setReviewResult({
        published: res.published,
        message: res.published
          ? 'Avaliações de ambas as partes recebidas! A nota já está visível no perfil público.'
          : 'Sua avaliação foi registrada com sigilo duplo-cego.'
      });
      setReviewStep(5);
      await refreshData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Status Badge Mapper
  const getMilestoneBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-muted text-muted-foreground/90 border border-border">Pendente</span>;
      case 'IN_PROGRESS': return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">Em Andamento</span>;
      case 'SUBMITTED': return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">Aguardando Aprovação</span>;
      case 'REJECTED': return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">Rejeitado/Ajustes</span>;
      case 'PAID': return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Liberado</span>;
      default: return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-muted text-muted-foreground/90 border border-border">{status}</span>;
    }
  };

  const renderMilestoneActions = (contractId: string, m: Milestone) => {
    if (role === 'LAWYER') {
      if (m.status === 'PENDING' || m.status === 'IN_PROGRESS' || m.status === 'REJECTED') {
        return (
          <button onClick={() => handleUpdateMilestone(contractId, m.id, 'SUBMITTED')} className="w-full sm:w-auto px-4 py-2 bg-alt hover:bg-alt/90 text-alt-foreground font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer">
            Solicitar Aprovação do Cliente
          </button>
        );
      }
      if (m.status === 'SUBMITTED') {
        return <p className="text-xs font-semibold text-muted-foreground/90 italic">Aguardando cliente revisar...</p>;
      }
    } else {
      // CLIENT
      if (m.status === 'SUBMITTED') {
        return (
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <button onClick={() => handleUpdateMilestone(contractId, m.id, 'REJECTED')} className="w-full sm:w-auto px-4 py-2 bg-card hover:bg-background text-muted-foreground font-semibold text-xs rounded-xl border border-border transition-all cursor-pointer">
              Rejeitar & Solicitar Ajuste
            </button>
            <button onClick={() => handleReleaseMilestone(contractId, m.id)} className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <CheckCircle2 className="w-4 h-4" /> Aprovar & Liberar Valor
            </button>
          </div>
        );
      }
      if (m.status === 'IN_PROGRESS' || m.status === 'PENDING') {
        return (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
            <p className="text-xs font-semibold text-muted-foreground/90 italic">O advogado está trabalhando neste marco...</p>
            <button onClick={() => handleReleaseMilestone(contractId, m.id)} className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer">
              <CheckCircle2 className="w-4 h-4" /> Liberar Valor Diretamente
            </button>
          </div>
        );
      }
    }
    if (m.status === 'PAID') {
      return <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Valor Liberado com Sucesso</p>;
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Informative Status Banner for Pending or Unverified Lawyer */}
      {role === 'LAWYER' && verificationStatus !== 'VERIFIED' && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-extrabold text-amber-900 dark:text-amber-200">
                {verificationStatus === 'PENDING'
                  ? 'Status da Conta: Inscrição OAB em Análise'
                  : verificationStatus === 'REJECTED'
                  ? 'Status da Conta: Cadastro Rejeitado'
                  : verificationStatus === 'SUSPENDED'
                  ? 'Status da Conta: Inscrição Suspensa'
                  : verificationStatus === 'EXPIRED'
                  ? 'Status da Conta: Certidão Expirada'
                  : 'Status da Conta: Verificação OAB Pendente'}
              </h4>
              <p className="text-xs text-amber-800/90 dark:text-amber-300/90 mt-0.5">
                {verificationStatus === 'PENDING'
                  ? 'Seus contratos em andamento permanecem operacionais. A validação do seu perfil está sendo processada.'
                  : 'Para formalizar novos contratos e receber liberações de honorários, é necessário validar suas credenciais da OAB.'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('edit-profile')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs shrink-0 transition-all cursor-pointer"
          >
            {verificationStatus === 'PENDING' ? 'Ver Status Cadastral' : 'Regularizar Cadastro'}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="pb-6 border-b border-border/80">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
          <FileText className="w-7 h-7 text-emerald-600" />
          Gestão de Custódia (Escrow)
        </h1>
        <p className="text-sm text-muted-foreground/90 mt-2">
          Gerencie marcos de entrega, aprove etapas e libere o pagamento com segurança total.
        </p>
      </div>

      {/* Contracts List */}
      <div className="space-y-8">
        {contracts.length === 0 ? (
          <div className="p-12 text-center bg-card rounded-2xl border border-border/80 shadow-xs">
            <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-bold text-muted-foreground">Nenhum contrato ativo no momento.</p>
          </div>
        ) : (
          contracts.map((contract) => {
            const allPaid = contract.milestones.every(m => m.status === 'PAID');

            return (
              <div key={contract.id} className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-xs">
                
                {/* Contract Header */}
                <div className="p-6 sm:p-8 border-b border-border/50 bg-background/50">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4" /> Escrow Ativo
                        </span>
                        {contract.status === 'COMPLETED' && (
                          <span className="px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200/60">
                            Finalizado
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight">{contract.jobTitle}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground/90 font-medium">
                        <p>{role === 'CLIENT' ? 'Advogado: ' : 'Cliente: '} <span className="text-foreground font-bold">{role === 'CLIENT' ? contract.lawyerName : contract.clientName}</span></p>
                        {contract.processNumber && <p className="font-mono text-emerald-600 dark:text-emerald-400">Ref: {contract.processNumber}</p>}
                      </div>
                    </div>
                    
                    <div className="bg-card p-4 rounded-2xl border border-border/60 min-w-[200px] text-right shadow-sm">
                      <p className="text-xs font-bold text-muted-foreground/90 uppercase tracking-wider">Valor do Contrato</p>
                      <p className="text-2xl font-extrabold text-foreground font-mono tracking-tight mt-1">
                        R$ {contract.totalValue.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 flex items-center justify-between">
                      <span className="text-sm font-bold text-amber-600 dark:text-amber-400">Retido em Custódia</span>
                      <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400 font-mono">R$ {contract.escrowBalance.toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/60 flex items-center justify-between">
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Já Liberado</span>
                      <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">R$ {contract.releasedBalance.toLocaleString('pt-BR')}</span>
                    </div>
                  </div>
                </div>

                {/* Milestones Stepper */}
                <div className="p-6 sm:p-8">
                  <div 
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() => toggleCollapse(contract.id)}
                  >
                    <h4 className="text-sm font-extrabold text-foreground uppercase tracking-wider group-hover:text-emerald-600 transition-colors">
                      Marcos de Entrega
                    </h4>
                    <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                      {collapsedContracts[contract.id] ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronUp className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  
                  {!collapsedContracts[contract.id] && (
                    <div className="mt-6 space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                      {contract.milestones.map((m, index) => (
                        <div key={m.id} className="relative flex flex-col md:flex-row items-start justify-between md:odd:flex-row-reverse group is-active gap-4">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-muted text-muted-foreground/90 shadow-sm shrink-0 absolute left-0 md:relative md:order-1 md:left-auto md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-colors">
                            {m.status === 'PAID' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <span className="font-bold text-sm">{index + 1}</span>}
                          </div>
                          <div className="w-full ml-14 md:ml-0 md:w-[calc(50%-2.5rem)] p-5 bg-card border border-border/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                              {getMilestoneBadge(m.status)}
                              <span className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400">R$ {m.value.toLocaleString('pt-BR')}</span>
                            </div>
                            <h5 className="font-bold text-foreground mb-1.5">{m.title}</h5>
                            <p className="text-sm text-muted-foreground/90 leading-relaxed mb-4">{m.description}</p>
                            <div className="pt-4 border-t border-border/50">
                              {renderMilestoneActions(contract.id, m)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Finalize Button */}
                {allPaid && contract.status !== 'COMPLETED' && (
                  <div className="p-6 sm:p-8 bg-emerald-50 border-t border-emerald-100 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">Todos os marcos concluídos!</h4>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">O projeto foi entregue com sucesso e todos os valores foram liberados.</p>
                      </div>
                      <button 
                        onClick={() => handleFinishProjectClick(contract.id)}
                        className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all cursor-pointer"
                      >
                        Finalizar Projeto & Avaliar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* FULLSCREEN REVIEW MODAL (Workana Style) */}
      {reviewModalContractId && (
        <div className="fixed inset-0 z-[100] bg-card flex flex-col animate-in slide-in-from-bottom-8 duration-300">
          
          {/* Top Navbar */}
          <div className="h-16 border-b border-border/50 flex items-center justify-between px-6 sm:px-10 shrink-0">
            <span className="font-extrabold text-lg tracking-tighter flex items-center gap-2 text-foreground">
              <div className="w-6 h-6 bg-emerald-600 rounded text-white flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              LWork
            </span>
            {reviewStep < 5 && (
              <button onClick={() => setReviewModalContractId(null)} className="text-muted-foreground/90 hover:text-muted-foreground text-sm font-bold transition-colors cursor-pointer">
                Cancelar e sair
              </button>
            )}
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto bg-background flex flex-col p-4 sm:p-8">
            <div className="w-full max-w-2xl mx-auto my-auto p-4 sm:p-0">
              
              {/* STEP 1: Intro */}
              {reviewStep === 1 && (
                <div className="bg-card p-8 sm:p-12 rounded-3xl border border-border shadow-xl text-center space-y-6 animate-in zoom-in-95">
                  <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Sparkles className="w-12 h-12" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-extrabold text-foreground mb-3">Projeto Finalizado! 🎉</h2>
                    <p className="text-muted-foreground/90 text-lg leading-relaxed max-w-lg mx-auto">Parabéns por concluir mais uma etapa. Agora é o momento de avaliar a experiência e fortalecer sua reputação na plataforma.</p>
                  </div>
                  <button onClick={() => setReviewStep(2)} className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-xl transition-all shadow-md w-full sm:w-auto cursor-pointer">
                    Começar Avaliação
                  </button>
                </div>
              )}

              {/* STEP 2: Public Review */}
              {reviewStep === 2 && (
                <div className="bg-card p-6 sm:p-10 rounded-3xl border border-border shadow-xl space-y-8 animate-in slide-in-from-right-8">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground/90 tracking-widest uppercase block mb-2">Etapa 1 de 3 • Perfil Público</span>
                    <h2 className="text-2xl font-extrabold text-foreground">Como foi trabalhar com {role === 'CLIENT' ? 'este advogado' : 'este cliente'}?</h2>
                    <p className="text-sm text-muted-foreground/90 mt-2">Esta nota geral e comentário aparecerão publicamente no perfil da outra parte após o sigilo duplo-cego.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-bold text-muted-foreground block mb-3">Nota Geral</label>
                      <div className="flex items-center justify-center gap-3 bg-background p-6 rounded-2xl border border-border/50">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            className={`p-2 transition-all cursor-pointer ${
                              rating >= star ? 'text-amber-400 scale-110' : 'text-muted-foreground hover:text-muted-foreground'
                            }`}
                          >
                            <Star className="w-12 h-12 fill-current" />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold text-muted-foreground block mb-3">Como foi a experiência? (Opcional)</label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="O que você mais gostou durante o projeto?"
                        className="w-full bg-background border border-border rounded-2xl p-4 text-sm text-foreground/90 placeholder:text-muted-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 transition-all min-h-[120px]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-border/50">
                    <button onClick={() => setReviewStep(1)} className="text-muted-foreground/90 hover:text-muted-foreground font-bold text-sm px-4 py-2 cursor-pointer">Voltar</button>
                    <button onClick={() => setReviewStep(3)} className="px-6 py-3 bg-alt hover:bg-alt/90 text-alt-foreground font-bold text-sm rounded-xl transition-all cursor-pointer">
                      Continuar <ChevronRight className="w-4 h-4 inline" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Internal Review */}
              {reviewStep === 3 && (
                <div className="bg-card p-6 sm:p-10 rounded-3xl border border-border shadow-xl space-y-8 animate-in slide-in-from-right-8">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground/90 tracking-widest uppercase block mb-2">Etapa 2 de 3 • Feedback Interno</span>
                    <h2 className="text-2xl font-extrabold text-foreground">Como foi sua experiência técnica?</h2>
                    <p className="text-sm text-muted-foreground/90 mt-2">Esses dados são apenas para o algoritmo da plataforma LWork e não ficarão visíveis para a outra parte.</p>
                  </div>

                  <div className="space-y-5 bg-background p-6 rounded-2xl border border-border/50">
                    {role === 'CLIENT' ? (
                      <>
                        <RatingRow label="Qualidade Técnica" value={detailedRatings.r1} onChange={(val) => setDetailedRatings(prev => ({...prev, r1: val}))} />
                        <RatingRow label="Clareza na Comunicação" value={detailedRatings.r2} onChange={(val) => setDetailedRatings(prev => ({...prev, r2: val}))} />
                        <RatingRow label="Cumprimento de Prazos" value={detailedRatings.r3} onChange={(val) => setDetailedRatings(prev => ({...prev, r3: val}))} />
                        <RatingRow label="Profissionalismo" value={detailedRatings.r4} onChange={(val) => setDetailedRatings(prev => ({...prev, r4: val}))} />
                      </>
                    ) : (
                      <>
                        <RatingRow label="Clareza do Escopo" value={detailedRatings.r1} onChange={(val) => setDetailedRatings(prev => ({...prev, r1: val}))} />
                        <RatingRow label="Comunicação do Cliente" value={detailedRatings.r2} onChange={(val) => setDetailedRatings(prev => ({...prev, r2: val}))} />
                        <RatingRow label="Rapidez nas Respostas" value={detailedRatings.r3} onChange={(val) => setDetailedRatings(prev => ({...prev, r3: val}))} />
                        <RatingRow label="Organização & Facilidade" value={detailedRatings.r4} onChange={(val) => setDetailedRatings(prev => ({...prev, r4: val}))} />
                      </>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-border/50">
                    <button onClick={() => setReviewStep(2)} className="text-muted-foreground/90 hover:text-muted-foreground font-bold text-sm px-4 py-2 cursor-pointer">Voltar</button>
                    <button onClick={() => setReviewStep(4)} className="px-6 py-3 bg-alt hover:bg-alt/90 text-alt-foreground font-bold text-sm rounded-xl transition-all cursor-pointer">
                      Continuar <ChevronRight className="w-4 h-4 inline" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Platform Review & Final Submission */}
              {reviewStep === 4 && (
                <div className="bg-card p-6 sm:p-10 rounded-3xl border border-border shadow-xl space-y-8 animate-in slide-in-from-right-8">
                  <div>
                    <span className="text-xs font-bold text-muted-foreground/90 tracking-widest uppercase block mb-2">Etapa 3 de 3 • A Plataforma</span>
                    <h2 className="text-2xl font-extrabold text-foreground">Como foi usar a LWork?</h2>
                    <p className="text-sm text-muted-foreground/90 mt-2">Sua opinião sobre a ferramenta de custódia e mensagens.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-center gap-3 bg-background p-6 rounded-2xl border border-border/50">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setPlatformRating(star)}
                            className={`p-2 transition-all cursor-pointer ${
                              platformRating >= star ? 'text-blue-500 scale-110' : 'text-muted-foreground hover:text-muted-foreground'
                            }`}
                          >
                            <Star className="w-10 h-10 fill-current" />
                          </button>
                        ))}
                    </div>

                    <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-amber-600 dark:text-amber-400">Atenção</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Sua avaliação é permanente e não poderá ser alterada após o envio.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-6 border-t border-border/50">
                    <button onClick={() => setReviewStep(3)} className="text-muted-foreground/90 hover:text-muted-foreground font-bold text-sm px-4 py-2 cursor-pointer" disabled={submittingReview}>Voltar</button>
                    <button 
                      onClick={handleSubmitReview} 
                      disabled={submittingReview}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {submittingReview ? 'Enviando...' : <><Send className="w-4 h-4" /> Enviar Avaliação Definitiva</>}
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: Success Confirmation */}
              {reviewStep === 5 && reviewResult && (
                <div className="bg-card p-8 sm:p-12 rounded-3xl border border-border shadow-xl text-center space-y-6 animate-in zoom-in-95">
                  <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-12 h-12" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-foreground mb-3">Avaliação Registrada</h2>
                    <p className="text-muted-foreground/90 text-base leading-relaxed">{reviewResult.message}</p>
                  </div>
                  <button onClick={() => { setReviewModalContractId(null); refreshData(); }} className="px-8 py-3.5 bg-alt hover:bg-alt/90 text-alt-foreground font-bold text-base rounded-xl transition-all shadow-md w-full sm:w-auto cursor-pointer">
                    Concluir e Voltar ao Painel
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
