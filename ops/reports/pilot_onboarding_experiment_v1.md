# Pilot Onboarding Experiment v1 (Bounded Sub-task)

Date: 2026-02-28
Owner: main

## Assumption
Source non-science textbooks remain unavailable this cycle, so near-term launch lift must come from onboarding + usage instrumentation improvements rather than content replacement.

## Goal (48h)
Increase first-session completion to Memorize and first test submission among early users.

## Segment Definition
- Cohort A: new users created in last 7 days (`cohort=new_7d`)
- Scope: Grade 7, Maharashtra board

## Success Metrics
- `chapter_started`
- `memorize_completed`
- `test_submitted`
- Conversion rates:
  - start_to_memorize = memorize_completed / chapter_started
  - memorize_to_test = test_submitted / memorize_completed

## Experiment Plan
1. Baseline snapshot from `/analytics` filtered by:
   - grade=7
   - board=Maharashtra
   - cohort=new_7d
2. Ops intervention (no code):
   - guide pilot tutors to always direct learners to Exam Mode after explanation.
3. 24h follow-up snapshot using same filters.
4. Compare conversion deltas and decide:
   - keep messaging playbook,
   - or prioritize next code tweak in chapter flow CTA copy/placement.

## Deliverables
- Baseline KPI screenshot/export (T0)
- Follow-up KPI snapshot (T+24h)
- Short decision note with one recommended next action
