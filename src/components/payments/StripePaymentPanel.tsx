import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

// Stripe publishable key — public, safe to expose in frontend
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
);

// ─── Payment states ──────────────────────────────────────────────────────────
type PaymentState =
  | 'AWAITING_FUNDING'
  | 'REQUIRES_ACTION'
  | 'PROCESSING'
  | 'CONFIRMED'
  | 'FAILED'
  | 'REFUND_PENDING'
  | 'REFUNDED';

// ─── Inner form (inside Elements context) ────────────────────────────────────
function CheckoutForm({
  amount,
  currency,
  onSuccess,
  onError,
}: {
  amount: number;
  currency: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [state, setState] = useState<PaymentState>('AWAITING_FUNDING');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setState('PROCESSING');
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // After payment redirect — backend webhook confirms, NOT this redirect
        return_url: `${window.location.origin}/payments/success`,
      },
    });

    if (error) {
      setState('FAILED');
      const msg = error.message || 'Pagamento falhou. Tente novamente.';
      setErrorMessage(msg);
      onError(msg);
    } else {
      // Payment is processing — webhook will confirm
      setState('REQUIRES_ACTION');
      onSuccess();
    }
  };

  const stateConfig: Record<PaymentState, { label: string; color: string; icon: string }> = {
    AWAITING_FUNDING: { label: 'Aguardando pagamento', color: '#8b6914', icon: '⏳' },
    REQUIRES_ACTION:  { label: 'Processando…',         color: '#1a56db', icon: '🔄' },
    PROCESSING:       { label: 'A confirmar…',          color: '#1a56db', icon: '⏱' },
    CONFIRMED:        { label: 'Pagamento confirmado',  color: '#057a55', icon: '✅' },
    FAILED:           { label: 'Pagamento falhou',      color: '#c81e1e', icon: '❌' },
    REFUND_PENDING:   { label: 'Reembolso em processo', color: '#8b6914', icon: '↩️' },
    REFUNDED:         { label: 'Reembolsado',           color: '#057a55', icon: '✔' },
  };

  const cfg = stateConfig[state];

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* State badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        padding: '0.5rem 0.875rem', borderRadius: '0.5rem',
        background: cfg.color + '18', border: `1px solid ${cfg.color}40`,
        fontSize: '0.85rem', fontWeight: 600, color: cfg.color,
      }}>
        <span>{cfg.icon}</span>
        <span>{cfg.label}</span>
      </div>

      {/* Amount summary */}
      <div style={{
        padding: '0.875rem 1rem',
        background: '#f9fafb', borderRadius: '0.5rem',
        border: '1px solid #e5e7eb', fontSize: '0.9rem', color: '#374151',
        display: 'flex', justifyContent: 'space-between',
      }}>
        <span>Total a pagar</span>
        <strong style={{ color: '#111827' }}>
          {currency.toUpperCase()} {(amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </strong>
      </div>

      {/* Stripe Elements — mounts card/payment UI */}
      <div style={{ padding: '1rem', border: '1px solid #e5e7eb', borderRadius: '0.5rem', background: '#fff' }}>
        <PaymentElement />
      </div>

      {/* Error message */}
      {errorMessage && (
        <div style={{
          padding: '0.75rem 1rem', borderRadius: '0.5rem',
          background: '#fef2f2', border: '1px solid #fecaca',
          color: '#c81e1e', fontSize: '0.85rem',
        }}>
          {errorMessage}
        </div>
      )}

      {/* Security note */}
      <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'center', margin: 0 }}>
        🔒 Pagamento processado com segurança pela Stripe. Os seus dados de cartão nunca passam pelos nossos servidores.
      </p>

      {/* Submit */}
      <button
        type="submit"
        disabled={!stripe || state === 'PROCESSING' || state === 'CONFIRMED'}
        style={{
          padding: '0.875rem',
          background: state === 'CONFIRMED' ? '#057a55' : '#1a56db',
          color: '#fff', border: 'none', borderRadius: '0.5rem',
          fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer',
          opacity: (!stripe || state === 'PROCESSING') ? 0.65 : 1,
          transition: 'all 0.2s',
        }}
      >
        {state === 'PROCESSING' ? 'A processar…' :
         state === 'CONFIRMED'  ? '✅ Pago' :
         `Pagar ${currency.toUpperCase()} ${(amount / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
      </button>
    </form>
  );
}

// ─── Public component ─────────────────────────────────────────────────────────
interface StripePaymentPanelProps {
  /** clientSecret from backend POST /api/payments/create-intent */
  clientSecret: string | null;
  amount: number;         // in cents
  currency?: string;
  onSuccess?: () => void;
  onError?: (msg: string) => void;
  /** When true, Stripe is not yet configured — show informative banner */
  featureDisabled?: boolean;
}

export default function StripePaymentPanel({
  clientSecret,
  amount,
  currency = 'BRL',
  onSuccess,
  onError,
  featureDisabled = false,
}: StripePaymentPanelProps) {
  const panelStyle: React.CSSProperties = {
    border: '1px solid #e5e7eb',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    background: '#fff',
    maxWidth: '480px',
    fontFamily: 'inherit',
  };

  // Feature not yet active
  if (featureDisabled || !import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
    return (
      <div style={panelStyle}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '0.75rem', padding: '1.5rem 0', color: '#6b7280', textAlign: 'center',
        }}>
          <span style={{ fontSize: '2rem' }}>🔐</span>
          <p style={{ margin: 0, fontWeight: 600, color: '#374151' }}>Pagamento via Stripe em breve</p>
          <p style={{ margin: 0, fontSize: '0.85rem' }}>
            A integração de pagamentos está a ser configurada. Será notificado quando estiver disponível.
          </p>
        </div>
      </div>
    );
  }

  // No clientSecret yet (payment intent not created)
  if (!clientSecret) {
    return (
      <div style={panelStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <p style={{ margin: 0, fontWeight: 600, color: '#374151' }}>Iniciar pagamento</p>
          <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280' }}>
            Clique em "Confirmar" no seu contrato para gerar o link de pagamento seguro.
          </p>
        </div>
      </div>
    );
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#1a56db',
      colorBackground: '#ffffff',
      colorText: '#111827',
      borderRadius: '6px',
      fontFamily: 'inherit',
    },
  };

  return (
    <div style={panelStyle}>
      <h3 style={{ margin: '0 0 1.25rem', fontSize: '1rem', fontWeight: 700, color: '#111827' }}>
        Pagamento Seguro
      </h3>
      <Elements stripe={stripePromise} options={{ clientSecret, appearance }}>
        <CheckoutForm
          amount={amount}
          currency={currency}
          onSuccess={onSuccess || (() => {})}
          onError={onError || (() => {})}
        />
      </Elements>
    </div>
  );
}
