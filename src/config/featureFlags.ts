/**
 * Production feature flags.
 *
 * The frontend must never silently simulate business operations. Features that
 * require a backend/provider are opt-in through Vite environment variables.
 */

function envBoolean(name: string, fallback = false): boolean {
  const value = import.meta.env[name];
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

export interface FeatureFlags {
  financials: {
    stripe_enabled: boolean;
  };
  payouts: {
    paypal_enabled: boolean;
  };
  funds: {
    hold_enabled: boolean;
  };
  auto_release_enabled: boolean;
  auth: {
    cookie_session_enabled: boolean;
  };
}

export const FEATURE_FLAGS: FeatureFlags = {
  financials: {
    stripe_enabled: envBoolean('VITE_STRIPE_ENABLED'),
  },
  payouts: {
    paypal_enabled: envBoolean('VITE_PAYPAL_ENABLED'),
  },
  funds: {
    hold_enabled: envBoolean('VITE_ESCROW_ENABLED'),
  },
  auto_release_enabled: envBoolean('VITE_AUTO_RELEASE_ENABLED'),
  auth: {
    // Backend-issued HttpOnly cookies are the preferred production mode.
    cookie_session_enabled: envBoolean('VITE_COOKIE_SESSION_ENABLED', true),
  },
};

export default FEATURE_FLAGS;
