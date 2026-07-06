# Requirement Specification Template

Drafting aid for new requirements. **pm-app is the source of record** — this template mirrors the `PmRequirement` model; once agreed, the content is entered there (fields in parentheses). Aligned to ISO/IEC/IEEE 29148; NFR categories follow ISO 25010:2023.

---

## REQ-<code>: <title>

| Field | Value |
|-------|-------|
| Type (`type`) | Functional / Non-Functional |
| NFR category (`nfrCategory`) | — or ISO 25010 category (performance efficiency, security, usability, reliability, maintainability, portability, compatibility, safety) |
| Priority (`priority`) | Must / Should / Could / Won't (MoSCoW) |
| Business value (`businessValue`) | 1–10 |
| Risk (`risk`) | Low / Medium / High |
| Source (`source`) | Where this came from: client meeting, feedback-app entry, support issue, internal |
| Stakeholder (`stakeholderId`) | Who asked / who is affected (from the project stakeholder register) |

### User story (`story`)

As a `<role>`, I want `<capability>`, so that `<benefit>`.

### Context & description (`description`)

What problem this solves, current behaviour, constraints. Link related requirements and ADRs.

### Acceptance criteria (`acceptanceCriteria`)

Every requirement needs at least one measurable criterion. Given/When/Then preferred:

- [ ] Given `<precondition>`, when `<action>`, then `<observable outcome>`.
- [ ] Given …, when …, then ….

### Non-functional constraints

Performance targets, security requirements, accessibility, i18n (EN/AR), data-privacy implications (GDPR module) — even for functional requirements.

### Out of scope

Explicitly excluded, to prevent scope creep.

### Dependencies

Blocking requirements/work items (`blockedByIds` on the work item), external services, DNS/env prerequisites.

---

## Lifecycle gates (enforced in pm-app)

1. **READY** (`isReady`) — story + AC complete, prioritised, estimated → eligible for sprint planning.
2. **Reviewed** (`reviewedAt`) — walkthrough done (AI-assisted review + client confirmation where applicable).
3. **Validated** (`validatedAt`) — confirmed to represent the real need before development starts.
4. **Changes** — any post-validation change goes through a `PmChangeRequest` with rationale + impact analysis; every edit produces a `PmRequirementRevision` (version, change summary, rationale, impact).
