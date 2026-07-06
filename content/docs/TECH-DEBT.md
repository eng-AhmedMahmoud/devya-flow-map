# Technical Debt Register

Visible, prioritised register of known technical debt across the Devya repos (per DAPP practice "Technical Debt Register"). Reviewed at each sprint retrospective in pm-app; items graduate into PmWorkItems (type: debt) when scheduled.

Priority: P1 = schedule next sprint · P2 = schedule this quarter · P3 = opportunistic (Boy Scout).
Effort: S < 2h · M < 1d · L > 1d.

| ID | Item | Area | Impact | Effort | Priority |
|----|------|------|--------|--------|----------|
| TD-001 | Backend jest unit suite leaks a timer (worker teardown warning on exit) | backend | Noise in CI logs; masks real leaks | S | P3 |
| TD-002 | Backend `lint` script still passes `--fix` (mutating lint masks errors locally) | backend | Lint results not reproducible | S | P2 |
| TD-003 | copyforge vitest runs with `--passWithNoTests` — zero unit tests | copyforge | No safety net for refactors | M | P2 |
| TD-004 | ~50 react-hooks v6 compiler findings parked as warnings across frontends | all frontends | Real correctness findings deferred | M | P2 |
| TD-005 | Shared-code drift: 8/9 duplicate groups drifted from canonicals (canonicals: tasks-app ui+i18n, booking-app locale-toggle, devya-contracts rate-limit) — see docs/shared-code-policy.md | cross-repo | Divergent bug fixes | M | P2 |
| TD-006 | Backend line coverage ~12% (ratchet floor 8/5/5/8, raise-only) | backend | Refactoring safety net thin | L | P2 |
| TD-007 | Frontend unit-test coverage near zero across 15 apps | frontends | UI regressions caught only manually/Playwright | L | P3 |
| TD-008 | No code-complexity metrics in CI (cyclomatic/cognitive) | all repos | Refactoring hotspots picked by feel, not data | S | P2 |
| TD-009 | copyforge dependabot major bumps failing CI (ai 4→7, tailwind 3→4, TS 6) — manual migrations required | copyforge | Blocked dependency updates | M | P2 |
| TD-010 | No automated performance/load testing (k6 smoke against backend is the candidate) | backend | No latency/throughput baseline | M | P3 |
| TD-011 | Historical credentials remain in git history (rotated/disabled 2026-07-06); history purge not yet done | backend, scripts | Low — secrets already revoked/rotated | M | P3 |

## Process

- New debt is added here with an ID; do not track debt only in heads or chat logs.
- Each sprint reserves ~15% capacity for debt/refactoring (see docs/DELIVERY-PROCESS.md).
- Closed items move to the Retired section below with the closing commit/PR.

## Retired

| ID | Item | Closed |
|----|------|--------|
| — | (none yet) | — |
