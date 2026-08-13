import React from 'react';
import { X, Zap, Check, Star, ShieldCheck } from 'lucide-react';
import { useLegalPlatform } from '../../hooks/useLegalPlatform';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  reason?: string;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, reason }) => {
  const { setActiveTab } = useLegalPlatform();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-alt/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-card border border-border/80 w-full max-w-xl rounded-3xl shadow-2xl p-6 sm:p-8 text-foreground animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/80">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Limite de Consumo Atingido</h3>
              <p className="text-xs text-muted-foreground/90 font-medium">Faça upgrade do seu plano para continuar avançando</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground/90 hover:text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6 mt-4">
          
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl text-xs text-amber-900 leading-relaxed font-medium">
            {reason || 'Você atingiu o limite máximo de propostas permitidas no seu plano atual. Faça upgrade para enviar propostas ilimitadas e ter destaque nas buscas.'}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Pro Card */}
            <div className="p-5 bg-alt text-alt-foreground rounded-2xl border border-border-alt space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Mais Popular</span>
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                </div>
                <h4 className="text-base font-extrabold mt-1">Plano Pro</h4>
                <p className="text-2xl font-extrabold font-mono mt-2">R$ 99<span className="text-xs font-normal text-muted-foreground/90">/mês</span></p>
                <ul className="text-xs space-y-2 mt-4 text-muted-foreground">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> 25 propostas mensais</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Destaque nas buscas</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-400" /> Selo Premium</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  onClose();
                  setActiveTab('subscription');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs transition-all cursor-pointer shadow-md"
              >
                Assinar Plano Pro
              </button>
            </div>

            {/* Premium Card */}
            <div className="p-5 bg-card text-foreground rounded-2xl border border-border space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Ilimitado</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <h4 className="text-base font-extrabold mt-1">Plano Premium</h4>
                <p className="text-2xl font-extrabold font-mono mt-2">R$ 249<span className="text-xs font-normal text-muted-foreground/90">/mês</span></p>
                <ul className="text-xs space-y-2 mt-4 text-muted-foreground/90">
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Propostas Ilimitadas</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Prioridade máxima</li>
                  <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Relatórios de conversão</li>
                </ul>
              </div>

              <button
                onClick={() => {
                  onClose();
                  setActiveTab('subscription');
                }}
                className="w-full py-2.5 rounded-xl bg-alt hover:bg-alt/90 text-alt-foreground font-bold text-xs transition-all cursor-pointer"
              >
                Assinar Premium
              </button>
            </div>

          </div>

          <div className="text-center pt-2">
            <button
              onClick={onClose}
              className="text-xs font-semibold text-muted-foreground/90 hover:text-muted-foreground underline cursor-pointer"
            >
              Continuar com limitações por enquanto
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
