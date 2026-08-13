import React, { useState } from 'react';
import { X, Scale, FileText, DollarSign, Calendar, MapPin, AlertCircle } from 'lucide-react';
import { useLegalPlatform } from '../../hooks/useLegalPlatform';
import { JobType, UrgencyLevel, ConfidentialityLevel } from '../../types';
import { jobsApi } from '../../services/api';

export const NewCaseModal: React.FC = () => {
  const { isNewCaseModalOpen, setIsNewCaseModalOpen, refreshData, navigateToCaseDetail } = useLegalPlatform();

  const [hiringType, setHiringType] = useState<'FIXED' | 'HOURLY'>('FIXED');
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

  if (!isNewCaseModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const newJob = await jobsApi.createJob({
        title,
        description,
        processNumber: processNumber || undefined,
        specialty,
        type,
        hiringType,
        urgency,
        confidentiality,
        budgetMin: Number(budgetMin),
        budgetMax: Number(budgetMax),
        estimatedDeadlineDays: Number(estimatedDeadlineDays),
        city,
        state
      });

      await refreshData();
      setIsNewCaseModalOpen(false);
      navigateToCaseDetail(newJob.id);
    } catch (err) {
      console.error('Failed to create case:', err);
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
              <Scale className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Publicar Demanda / Novo Processo</h3>
              <p className="text-xs text-muted-foreground/90">Cadastre o caso para receber propostas de advogados verificados</p>
            </div>
          </div>
          <button
            onClick={() => setIsNewCaseModalOpen(false)}
            className="p-2 rounded-xl text-muted-foreground/90 hover:text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">

          {/* Payment Modality Selection (Client Rule) */}
          <div className="bg-background border border-border rounded-2xl p-3.5 space-y-2">
            <label className="block text-xs font-bold text-foreground/90 uppercase tracking-wider">
              1. Modalidade de Pagamento / Contratação
            </label>
            <p className="text-xs text-muted-foreground/90">
              Escolha a forma como os advogados deverão obrigatoriamente enviar as propostas para este caso.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
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
          
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Título da Demanda / Ação</label>
            <input
              type="text"
              required
              placeholder="Ex: Reestruturação Trabalhista e Adequação LGPD Corporativa"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground/90 placeholder:text-muted-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Número do Processo (Opcional)</label>
              <input
                type="text"
                placeholder="Ex: 5024192-45.2023.8.21.0001"
                value={processNumber}
                onChange={(e) => setProcessNumber(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-xs font-mono text-emerald-600 dark:text-emerald-400 font-semibold focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              />
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
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Descrição Detalhada do Objeto</label>
            <textarea
              required
              rows={4}
              placeholder="Descreva o histórico dos fatos, pretensão jurídica, prazos limites e entregáveis esperados..."
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
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Cidade / Estado do Foro</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Cidade"
                  className="w-2/3 bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
                />
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="UF"
                  className="w-1/3 bg-background border border-border rounded-xl px-3 py-2.5 text-xs text-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
                />
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
