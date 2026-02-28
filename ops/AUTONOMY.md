# AUTONOMY POLICY

## Purpose
Enable overnight autonomous progress with measurable outcomes and low-noise updates.

## Always-on Loop
- `main` decides what to do next from queue + reports.
- `coding-agent` executes one bounded implementation slice.
- `tester` verifies live app behavior and content mapping.
- `reporter` summarizes progress and blockers.

## Guardrails
- No repeated clarification loops.
- Make one explicit assumption when blocked, document it, continue.
- Every run must produce either:
  - a material improvement, or
  - a high-signal failure report with next action.

## Quality Gates
- Content mapping must match subject/chapter.
- Active curriculum chapters must have corresponding content files.
- Chapter payload quality floor:
  - preAssessment >= 5
  - test >= 8
  - concepts >= 3
- Live smoke must pass.

## Long-Term Expansion Path
1. Fully complete Std 7 Maharashtra Board with quality gates green.
2. Replicate the same pipeline for higher standards.
3. Generalize for other state and national boards using the same gates and reporting loop.
