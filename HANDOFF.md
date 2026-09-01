# Meu Advogado — Technical Handoff

## 1. Purpose

This document explains the current state of `Meu-Advogado-front`, the work already performed, the architectural decisions that must be preserved, and the remaining work required to make the product fully production-functional.

Repository: `THPL28/Meu-Advogado-front`

## 2. Current architecture

The application is a React 19 + Vite frontend with an Express server layer. The frontend centralizes backend communication in `src/services/api/index.ts` rather than allowing pages/components to call `fetch()` directly.

Main layers:

- UI/pages/components: presentation and user interactions.
- `src/services/api`: single source of truth for business-data requests.
- `src/config/api.ts`: API base URL and runtime configuration.
- `src/config/featureFlags.ts`: production feature switches.
- `server.ts`: Express server, health endpoint, SPA serving and server-side Gemini integration.
- `src/types`: domain models and DTOs.

Do not bypass the API service layer when adding features.

## 3. What has already been implemented/refined

### API service layer

A centralized HTTP client exists with:

- `credentials: include` for cookie-based sessions.
- optional Bearer-token authentication for legacy/token mode.
- automatic refresh handling for expired sessions when a refresh token/session exists.
- normalized backend response handling (`data` wrapper or direct entity).
- structured handling for HTTP 409 and 422.
- backend-to-frontend role mapping.
- backend entity mappers for frontend domain types.

### Authentication

Production is designed to prefer backend-issued HttpOnly cookies. The frontend does not need to persist the access token in localStorage when cookie-session mode is enabled.

Roles are mapped as:

- `ROLE_LAWYER` / `ROLE_FREELANCER` → `LAWYER`
- `ROLE_CLIENT` → `CLIENT`
- `ROLE_ADMIN` → `ADMIN`

Session expiration is surfaced to the user instead of silently continuing with stale authentication.

### Feature flags

Backend-dependent capabilities are opt-in through environment variables instead of being silently simulated. Current flags include Stripe, PayPal, escrow/hold, automatic release and cookie sessions.

### AI legal analysis

The Gemini key is kept on the server. The frontend calls `/api/ai/legal-analyze`; the server calls Gemini.

The AI endpoint was hardened so that missing configuration or provider failures produce explicit errors instead of fabricated legal analysis. The response is requested as JSON and must not invent a reliable success probability from insufficient case data.

## 4. Product capabilities represented by the frontend

The application contains domain structures/services for a legal marketplace workflow, including:

- client and lawyer profiles;
- legal demands/jobs;
- lawyer discovery;
- proposals;
- proposal negotiation;
- contracts;
- contract acceptance/signature flow;
- milestones;
- payments and wallet information;
- escrow/held funds;
- withdrawals/payouts;
- documents and secure documents;
- document access logs;
- moderation/classification states;
- conflict checking;
- chat conversations and messages;
- notifications;
- reviews/evaluations;
- dashboards and metrics;
- contract timeline/events;
- legal AI analysis.

These capabilities are represented in the frontend API/domain model, but representation in the frontend does **not** mean every production backend flow has already been verified end-to-end.

## 5. Critical principle for continuation

The fork must not reintroduce fake business operations.

A button must only report success after the backend confirms the operation.

Do not use localStorage as the source of truth for:

- wallet balances;
- payments;
- contracts;
- proposals;
- demand status;
- signatures;
- withdrawals;
- reviews;
- document state;
- authorization.

localStorage may be used for non-authoritative UI preferences or transitional session data where explicitly required, but business state belongs to the backend/database.

## 6. Known areas requiring validation/further work

The existing service layer still contains compatibility/fallback paths in parts of the application. These must be reviewed one by one.

Priority checks:

1. Remove or disable any mock/fake success path in financial operations.
2. Ensure proposal creation/update is always persisted by the backend.
3. Ensure demand creation/edit/cancel/status transitions are backend-confirmed.
4. Ensure contracts are created from real proposal acceptance and never fabricated locally.
5. Ensure signature state is authoritative on the backend.
6. Ensure wallet balances come exclusively from backend financial records.
7. Ensure PIX/PayPal/Stripe operations are real provider-backed flows or clearly unavailable.
8. Ensure escrow release is authorized and persisted server-side.
9. Ensure document upload reaches real storage and has real scan/classification status.
10. Ensure chat messages are persisted and synchronized rather than merely displayed locally.
11. Ensure notifications reflect backend state.
12. Ensure reviews reference the authenticated user and the correct reviewed party; never hard-code IDs.
13. Ensure role/profile switching is a real backend-authorized operation, not a demo shortcut.
14. Ensure all protected endpoints enforce authorization server-side.
15. Ensure all error states are visible instead of being converted into empty arrays/null values that look like successful empty results.

## 7. Recommended end-to-end acceptance flows

### Client

1. Register.
2. Login.
3. Complete profile.
4. Create legal demand.
5. See demand in own dashboard.
6. Receive proposals.
7. Open proposal.
8. Negotiate.
9. Accept proposal.
10. Create/activate contract.
11. Fund required payment/escrow.
12. Follow milestones.
13. Receive documents/messages.
14. Complete case.
15. Release funds when rules allow.
16. Review lawyer.

### Lawyer

1. Register.
2. Complete OAB/profile verification data.
3. Discover eligible demands.
4. Submit proposal.
5. Negotiate.
6. Accept contract.
7. Execute milestones.
8. Upload required documents.
9. Communicate through chat.
10. Complete work.
11. Receive released funds.
12. Withdraw funds through the configured payout provider.
13. Review client when permitted.

### Admin

1. Authenticate as admin.
2. Review users.
3. Review verification/moderation queues.
4. Inspect demands/contracts/payments.
5. Inspect conflicts and audit information.
6. Manage moderation decisions.
7. Verify that financial and authorization actions cannot be performed by unauthorized roles.

## 8. API integration contract

The frontend should receive a stable backend API contract. Prefer responses in the form:

```json
{
  "success": true,
  "data": {},
  "error": null
}
```

Errors should provide an HTTP status and useful machine-readable/message information.

Important statuses already considered by the frontend:

- `401`: authentication/session problem.
- `409`: business conflict, such as duplicate active proposal.
- `422`: validation/moderation/business-rule rejection.
- `5xx`: backend/provider failure.

Do not turn a backend `5xx` into a successful empty list.

## 9. Environment configuration

The project uses Vite environment variables for frontend configuration. The API base URL is read from `VITE_API_URL`.

Important configuration areas include:

- `VITE_API_URL`
- `VITE_STRIPE_ENABLED`
- `VITE_PAYPAL_ENABLED`
- `VITE_ESCROW_ENABLED`
- `VITE_AUTO_RELEASE_ENABLED`
- `VITE_COOKIE_SESSION_ENABLED`
- server-side `GEMINI_API_KEY`

Secrets must remain server-side. Never expose provider secret keys through `VITE_*` variables.

## 10. AI safety/product behavior

The legal AI feature is an assistant, not a legal decision engine. It should provide preliminary technical analysis and clearly communicate uncertainty.

Never present an invented percentage probability of winning a case. The current server prompt explicitly requires the model to state when a reliable probability cannot be estimated from the supplied information.

## 11. Build/runtime

Current package scripts include:

- `npm run dev` — development server through `tsx server.ts`.
- `npm run build` — Vite frontend build plus bundled Express server.
- `npm start` — production server.
- `npm run lint` — TypeScript type-check (`tsc --noEmit`).

Before considering a change complete:

1. Run type-check.
2. Run production build.
3. Start production server.
4. Check `/api/health`.
5. Verify authentication against the real backend.
6. Test the affected flow with real backend data.

## 12. Technical debt / cleanup

The repository was originally scaffolded from an AI Studio/Vite template. The README still contains generic AI Studio wording and should be rewritten for the actual Meu Advogado product.

The package name is also still generic (`react-example`) and should be renamed to a meaningful project identifier.

Any demo/mock terminology, hard-coded IDs, fake fallbacks or compatibility code should be identified and either removed or explicitly isolated behind development-only configuration.

## 13. Suggested implementation order

### Phase 1 — Foundation

- Confirm backend base URL and API contract.
- Confirm authentication/cookie behavior.
- Run type-check/build.
- Replace generic documentation.
- Establish environment configuration for local/staging/production.

### Phase 2 — Core marketplace

- Authentication/profile.
- Demands.
- Lawyer discovery.
- Proposals.
- Negotiation.

### Phase 3 — Contract lifecycle

- Acceptance.
- Contract creation.
- Signatures.
- Milestones.
- Contract timeline.

### Phase 4 — Financial lifecycle

- Payment creation.
- Escrow/hold.
- Release.
- Wallet ledger.
- Payout/withdrawal.
- Provider webhook reconciliation.

### Phase 5 — Collaboration/documents

- Chat persistence/realtime.
- Notifications.
- Secure document upload/storage.
- Virus scanning/classification.
- Access logging.

### Phase 6 — Governance/security

- Role authorization.
- OAB verification.
- Moderation.
- Conflict checks.
- Auditability.
- Rate limiting and abuse protection.

### Phase 7 — Production QA

- E2E tests for client/lawyer/admin.
- Failure-path tests.
- Expired-session tests.
- Duplicate-operation tests.
- Concurrent-operation tests.
- Payment webhook/reconciliation tests.
- Mobile/responsive tests.
- Production build/deployment validation.

## 14. Definition of Done

A feature is considered complete only when:

- the UI works;
- the API call is real;
- the backend persists the state;
- authorization is enforced server-side;
- refresh/reload preserves the correct state;
- failures are surfaced correctly;
- duplicate submissions are handled safely;
- the mobile layout works when applicable;
- type-check passes;
- production build passes;
- the flow has been tested with real backend data.

## 15. Handoff message

The work in this repository should be treated as the frontend foundation and integration layer for Meu Advogado. Significant effort has already been invested in centralizing API communication, mapping backend domain objects, handling authentication and preparing production-oriented feature flags. The next developer should preserve that architecture and focus on closing the remaining backend integrations and eliminating any simulated business behavior.

Do not rewrite the architecture merely to make a screen appear functional. Complete the real data flow from UI → API → backend → database/provider → API → UI.
