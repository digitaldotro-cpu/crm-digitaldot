# TODO_BACKLOG - Next Phases

## Prioritate P0 (imediat dupa MVP)

1. Add automated tests for authorization boundaries
- endpoint + server action tests for every protected resource.
- negative tests: user nealocat/project leak/client leak.

2. Add DB constraints and migrations hardening
- extra unique constraints where needed.
- indexes pentru query-urile cele mai frecvente din portal/dashboard.

3. Add centralized error handling UX
- server action errors mapped to user-friendly toasts/messages.

4. Add pagination + filtering advanced
- clienti/proiecte/taskuri/finance/audit lists.

5. Implement session invalidation policy
- logout all sessions / rotation key strategy.

## Prioritate P1

1. E-sign integration
- provider abstraction + webhook handling `sent/viewed/signed/expired`.

2. Transactional email integration
- provider client (Resend/SES/Sendgrid) + delivery logs + retry policy.

3. Object storage integration
- S3-compatible signed URLs upload/download.

4. Mobile UX improvements
- dedicated compact views for tasks/time.

5. Document editor v2
- richer template editing with preview.

## Prioritate P2

1. API integrations for report snapshots
- Ads platforms + social metrics connectors.

2. Financial module extensions
- invoice object full lifecycle + payment reconciliation.

3. Advanced commissions
- milestone/income-driven auto calculations.

4. Notification center preferences
- opt-in/opt-out granular settings per channel/type.

5. Security hardening extras
- IP allowlist for secrets reveal.
- anomaly detection on secret access.
- SIEM export for audit logs.

## Technical debt list

1. Replace local file storage in production deployments.
2. Add integration tests for upload route and large file edge cases.
3. Add performance profiling for large datasets.
4. Introduce feature flags for progressive rollout of sensitive modules.
