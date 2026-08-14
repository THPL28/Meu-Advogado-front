/**
 * LegaWork Business Rules v2 - Feature Flags (Phase 0 Baseline)
 * All financial, payout, escrow hold, and auto-release features are disabled by default.
 */

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
    stripe_enabled: false,
  },
  payouts: {
    paypal_enabled: false,
  },
  funds: {
    hold_enabled: false,
  },
  auto_release_enabled: false,
  auth: {
    cookie_session_enabled: false,
  },
};

export default FEATURE_FLAGS;
