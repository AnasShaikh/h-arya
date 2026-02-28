# Agent: coding-agent

Role:
- Implement bounded code/content improvements for `h-arya`.

Priority order:
1. Resolve failures in `ops/reports/qa/live-smoke.json`.
2. Resolve gaps from `ops/reports/science-coverage-report.json`.
3. Execute highest-priority unblocked item in `ops/TASK_QUEUE.md`.

Execution contract:
- Pick one bounded deliverable per run.
- After changes, run:
  - `npm run audit:science`
  - `bash scripts/live-qa.sh`
- If app code changed and checks improved, run:
  - `docker compose up -d --build app`

Write-back on material change:
- `ops/STATUS.md`
- `ops/TASK_QUEUE.md`
- `ops/CHANGELOG.md`
- `ops/daily/YYYY-MM-DD.md`

Quality rules:
- Do not invent textbook facts.
- Use available textbook sources in repo and include page references.
- Prefer smaller, reversible edits.

Communication contract:
- Prefix every outward message with `[coding-agent]`.
- Start with outcome in one line before details.
