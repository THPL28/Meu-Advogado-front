import React, { useState } from 'react';
import { X, Star, ShieldCheck, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import { useLegalPlatform } from '../../hooks/useLegalPlatform';
import { reviewsApi } from '../../services/api';
import { Role } from '../../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  jobTitle: string;
  otherPartyName: string;
  otherPartyRole: Role;
  onSubmitted?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  contractId,
  jobTitle,
  otherPartyName,
  otherPartyRole,
  onSubmitted
}) => {
  const { role, refreshData } = useLegalPlatform();

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Detailed ratings based on role
  // If user is CLIENT evaluating LAWYER:
  const [technicalQuality, setTechnicalQuality] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [deadlineCompliance, setDeadlineCompliance] = useState(5);
  const [professionalism, setProfessionalism] = useState(5);

  // If user is LAWYER evaluating CLIENT:
  const [clarity, setClarity] = useState(5);
  const [responsiveness, setResponsiveness] = useState(5);
  const [organization, setOrganization] = useState(5);
  const [easeOfWork, setEaseOfWork] = useState(5);

  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPublishedImmediately, setIsPublishedImmediately] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const detailedRatings = role === 'CLIENT'
        ? { technicalQuality, communication, deadlineCompliance, professionalism }
        : { clarity, responsiveness: communication, organization, easeOfWork };

      const res = await reviewsApi.submitReview({
        contractId,
        rating,
        comment,
        detailedRatings
      });

      setIsPublishedImmediately(res.published);
      setIsSuccess(true);
      await refreshData();
      if (onSubmitted) onSubmitted();
    } catch (err) {
      console.error('Erro ao enviar avaliação:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (val: number, setVal: (n: number) => void) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setVal(star)}
          className="p-1 hover:scale-110 transition-transform cursor-pointer"
        >
          <Star
            className={`w-5 h-5 ${
              star <= val ? 'text-amber-500 fill-amber-400' : 'text-muted-foreground'
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-alt/40 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-card border border-border/80 w-full max-w-lg rounded-3xl shadow-2xl p-6 sm:p-8 text-foreground animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/50">
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
              Sistema Duplo-Cego
            </span>
            <h3 className="text-xl font-extrabold text-foreground tracking-tight mt-1">
              Avaliar {otherPartyRole === 'LAWYER' ? 'Advogado' : 'Cliente'}
            </h3>
            <p className="text-xs text-muted-foreground/90 font-medium">Demanda: {jobTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted-foreground/90 hover:text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-foreground">Avaliação Registrada com Sucesso!</h4>
            <p className="text-xs text-muted-foreground/90 max-w-sm mx-auto leading-relaxed">
              {isPublishedImmediately
                ? 'Ambas as partes enviaram suas avaliações. Os comentários e notas agora estão visíveis publicamente!'
                : 'Sua avaliação foi mantida em sigilo. Ela será publicada assim que a outra parte enviar a dela ou após o prazo regulamentar.'}
            </p>
            <div className="pt-2">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
              >
                Concluir
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 mt-4">
            
            {/* Double Blind Guarantee Notice */}
            <div className="p-3.5 bg-background border border-border/80 rounded-2xl flex items-start gap-3">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground/90 leading-relaxed">
                <strong>Sigilo Garantido:</strong> A sua nota e comentário permanecerão ocultos até que <strong>{otherPartyName}</strong> também envie a avaliação dele(a).
              </p>
            </div>

            {/* Overall Rating */}
            <div className="bg-background/60 p-4 rounded-2xl border border-border/60 text-center space-y-2">
              <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Nota Geral para {otherPartyName}
              </label>
              <div className="flex justify-center">
                {renderStars(rating, setRating)}
              </div>
            </div>

            {/* Detailed Criteria */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Critérios Detalhados</h4>
              
              {role === 'CLIENT' ? (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground/90 font-medium">Qualidade Técnica & Peça Jurídica</span>
                    {renderStars(technicalQuality, setTechnicalQuality)}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground/90 font-medium">Comunicação & Transparência</span>
                    {renderStars(communication, setCommunication)}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground/90 font-medium">Cumprimento do Prazo</span>
                    {renderStars(deadlineCompliance, setDeadlineCompliance)}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground/90 font-medium">Profissionalismo</span>
                    {renderStars(professionalism, setProfessionalism)}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground/90 font-medium">Clareza nas Instruções da Demanda</span>
                    {renderStars(clarity, setClarity)}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground/90 font-medium">Rapidez na Comunicação</span>
                    {renderStars(responsiveness, setResponsiveness)}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground/90 font-medium">Organização e Pagamentos</span>
                    {renderStars(organization, setOrganization)}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground/90 font-medium">Facilidade no Relacionamento</span>
                    {renderStars(easeOfWork, setEaseOfWork)}
                  </div>
                </>
              )}
            </div>

            {/* Written Comment */}
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1">
                Comentário Construtivo (Feedback Público)
              </label>
              <textarea
                required
                rows={3}
                placeholder="Descreva como foi a experiência de trabalho conjunto..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full bg-background border border-border rounded-xl p-3 text-xs text-foreground/90 placeholder:text-muted-foreground/90 focus:bg-card focus:outline-none focus:border-emerald-600 transition-all"
              />
            </div>

            <div className="pt-3 border-t border-border/50 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-muted text-muted-foreground text-xs font-semibold hover:bg-muted/80 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
              >
                {submitting ? 'Enviando...' : 'Publicar Avaliação'}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
