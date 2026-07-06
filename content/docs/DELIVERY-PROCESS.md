# Delivery Process

How Devya plans, builds, and ships. Tooling of record: **pm-app** (product delivery — sprints, requirements, releases) and **tasks-app** (internal ops — Eisenhower quadrants). This document defines the process; pm-app's `/process` page maps it to the underlying standards (Scrum Guide 2020, SAFe 6.0, ISO 29148, ISO 25010, CMMI).

## Cadence

- Work is delivered in fixed-length sprints per project (`PmProject.sprintLengthWeeks`, default 1–2 weeks). Sprint length does not change mid-project.
- Every sprint has a written goal (`PmSprint.goal`) and a points budget (`capacityPoints` / `committedPoints` / `completedPoints`).
- Releases are cut from completed sprints (`PmRelease`) and auto-deploy: Vercel git integration on push for frontends, `Deploy (VPS)` workflows for backend + booking-app.

## Ceremonies (solo-adapted)

| Ceremony | How we run it | Where |
|----------|---------------|-------|
| Sprint planning | Select READY backlog items into sprint, set goal + committed points | pm-app /sprints |
| Daily check-in | Async standup note (done / next / blockers) | pm-app PmStandup |
| Sprint review | Demo URL + client feedback captured on sprint (`demoUrl`, `reviewFeedback`) | pm-app /sprints/[id] |
| Retrospective | Went-well / to-improve / actions; actions feed the backlog | pm-app /retros |
| Backlog refinement | Continuous; items must pass the READY gate (`isReady`) before planning | pm-app /backlog |

## Backlog & estimation

- Product backlog lives in pm-app per project; internal/ops work lives in tasks-app (important × deadline quadrants).
- Prioritisation: MoSCoW (`priority`) + business value (1–10) + risk. Requirements link to work items; work items link to PRs (`prUrl`).
- Estimation: story points on every work item. Committed vs completed points are compared at each retro to improve forecast accuracy (velocity).

## Interruptions & dependencies

- Unplanned work entering a sprint is flagged `isUnplanned`; interruption % is reviewed at retro. Urgent-but-unimportant work is triaged via tasks-app quadrants instead of derailing the sprint.
- Dependencies are tracked with `blockedByIds`; a blocked item cannot be started until its blockers complete.

## Definition of Done

A work item is DONE when all of the following hold:

1. Acceptance criteria on the linked requirement are checked off.
2. CI green — blocking lint, `tsc --noEmit`, and tests (backend also depcruise no-circular + build).
3. No new lint warnings introduced; touched code left cleaner than found (Boy Scout rule).
4. AI-assisted code review pass completed (`/code-review`; dual-layer co-review for risky changes).
5. Docs updated where behaviour changed (CLAUDE.md / ADR if architectural).
6. Deployed to preview (Vercel) or staging path verified.

## Refactoring & debt capacity

- ~15% of each sprint's capacity is reserved for refactoring and debt items from docs/TECH-DEBT.md (work item type: debt).
- Debt register is reviewed at every retro; new debt gets an ID the day it is discovered.

## Metrics

Tracked per sprint / continuously:

- Velocity (completed vs committed points) — pm-app /insights
- Interruption % (unplanned items / total) — pm-app /process
- Test coverage (ratcheting floor, raise-only) — CI coverage artifact
- Production errors — Sentry (auto-captured via SentryModule)
- Deployment activity — flow-map /deployments dashboard
