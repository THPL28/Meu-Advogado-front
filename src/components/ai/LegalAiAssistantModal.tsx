import React, { useState } from 'react';
import { X, Sparkles, Send, FileText, CheckCircle2, ShieldAlert, Cpu } from 'lucide-react';
import { useLegalPlatform } from '../../hooks/useLegalPlatform';
import { geminiLegalApi } from '../../services/api';

export const LegalAiAssistantModal: React.FC = () => {
  const { isAiAssistantModalOpen, setIsAiAssistantModalOpen, selectedCaseId, jobs } = useLegalPlatform();

  const selectedJob = jobs.find(j => j.id === selectedCaseId) || jobs[0];

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<{
    summary: string;
    suggestedStrategy: string;
    estimatedSuccessRate: string;
    recommendedMilestones: { title: string; description: string; estDays: number }[];
  } | null>(null);

  if (!isAiAssistantModalOpen) return null;

  const handleRunAnalysis = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      const res = await geminiLegalApi.analyzeProcess(
        selectedJob?.title || 'Demanda Jurídica',
        prompt || selectedJob?.description || 'Análise de minuta e fundamentação de CPC/CC'
      );
      setAnalysis(res);
    } catch (err) {
      console.error('Error running AI legal analysis:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-alt/40 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-card border border-border/80 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-2xl p-6 text-foreground my-auto animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-foreground">Assistente de Inteligência Jurídica LWork</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  Gemini Legal Engine
                </span>
              </div>
              <p className="text-xs text-muted-foreground/90">Análise técnica de teses, elaboração de peças e estratégia de contencioso</p>
            </div>
          </div>
          <button
            onClick={() => setIsAiAssistantModalOpen(false)}
            className="p-2 rounded-xl text-muted-foreground/90 hover:text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4 mt-4">
          
          {/* Case Context Box */}
          <div className="p-3.5 bg-background rounded-2xl border border-border/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <FileText className="w-4 h-4 text-emerald-600" />
              <span className="text-muted-foreground/90">Processo Ativo:</span>
              <span className="font-bold text-foreground max-w-sm truncate">{selectedJob?.title}</span>
            </div>
            {selectedJob?.processNumber && (
              <span className="font-mono text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                {selectedJob.processNumber}
              </span>
            )}
          </div>

          {/* Prompt Input */}
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Instruções ou Tese Jurídica para Análise (Opcional)
            </label>
            <div className="relative">
              <textarea
                rows={3}
                placeholder="Ex: Analise o risco liminar com base na Súmula do STJ e elabore minutas de quesitos para perícia contábil..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full bg-background border border-border rounded-2xl p-3.5 pr-12 text-xs text-foreground/90 placeholder:text-muted-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              />
              <button
                onClick={handleRunAnalysis}
                disabled={loading}
                className="absolute right-3 bottom-3 p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {loading ? <Cpu className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => { setPrompt('Análise de probabilidade de deferimento da tutela provisória de urgência.'); }}
              className="px-3 py-1.5 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            >
              📊 Risco de Tutela Liminar
            </button>
            <button
              onClick={() => { setPrompt('Minuta de aditivo contratual para adequação de cláusula penal e LGPD.'); }}
              className="px-3 py-1.5 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            >
              📝 Aditivo Contratual LGPD
            </button>
            <button
              onClick={() => { setPrompt('Estratégia para audiência de conciliação e minuta de acordo.'); }}
              className="px-3 py-1.5 rounded-xl bg-muted text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer"
            >
              🤝 Termo de Acordo Judicial
            </button>
          </div>

          {/* Analysis Output Box */}
          {loading && (
            <div className="p-8 text-center bg-background/50 rounded-2xl border border-border space-y-3">
              <Cpu className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
              <p className="text-xs font-bold text-foreground/90">Processando jurisprudência do STJ e doutrina atualizada...</p>
            </div>
          )}

          {analysis && !loading && (
            <div className="space-y-3 p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200/80 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Parecer e Estratégia Gerados</h4>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-200">
                  {analysis.estimatedSuccessRate}
                </span>
              </div>

              <div className="text-xs text-muted-foreground space-y-2 leading-relaxed">
                <p className="font-medium bg-card p-3.5 rounded-xl border border-border">
                  {analysis.summary}
                </p>
                <div>
                  <span className="font-bold text-foreground block mb-1">Estratégia Recomendada:</span>
                  <div className="whitespace-pre-line text-muted-foreground bg-card p-3.5 rounded-xl border border-border font-mono text-[11px]">
                    {analysis.suggestedStrategy}
                  </div>
                </div>
              </div>

              <div>
                <span className="font-bold text-xs text-foreground block mb-2">Marcos Sugeridos para o Contrato:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {analysis.recommendedMilestones.map((m, i) => (
                    <div key={i} className="p-3 bg-card rounded-xl border border-border text-xs">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">{m.title}</p>
                      <p className="text-muted-foreground/90 mt-0.5 line-clamp-2">{m.description}</p>
                      <span className="text-[10px] text-muted-foreground/90 font-mono mt-1 block">Prazo: ~{m.estDays} dias</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-4 mt-4 border-t border-border/50 flex items-center justify-end gap-3">
          <button
            onClick={() => setIsAiAssistantModalOpen(false)}
            className="px-5 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-semibold hover:bg-muted/80 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
