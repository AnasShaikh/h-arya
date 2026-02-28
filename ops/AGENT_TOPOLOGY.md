# AGENT_TOPOLOGY

## Primary Pattern
- `main` (Conductor): mission planning, prioritization, integration, final decisions.
- `coding-agent` (Builder): bounded implementation tasks with acceptance criteria.
- `tester` (Live QA): browser + API validation on the running app.
- `reporter` (Ops Reporter): concise progress and blocker summaries.
- `watchdog` (Reliability): uptime/deploy freshness + safe recovery actions.

## Execution Rules
- One authoritative codebase: `/opt/h-arya`.
- Each run must yield either material progress or a high-signal failure report.
- No repeated clarification loops. Use one explicit assumption and continue.
- Every material change updates:
  - `ops/STATUS.md`
  - `ops/TASK_QUEUE.md`
  - `ops/CHANGELOG.md`
  - `ops/daily/YYYY-MM-DD.md`

## Model Routing
- `main`: strong planner model.
- `coding-agent`: strong/medium coding model.
- `tester`, `reporter`, `watchdog`: fast low-cost models.
