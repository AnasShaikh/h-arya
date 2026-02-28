# Mobile Outlier Scan - 2026-02-28

## Context
A lightweight outlier-only check was performed following a massive 100% failure report from the automated `audit.js` runner. The goal was to distinguish between real functional outliers and false positives caused by the automated tester's navigation logic.

## Summary
- **Tested Chapters:** 20 (Sampled across subjects)
- **Confirmed Outliers:** 0
- **Suspected False Positives (in automated report):** 100%
- **Status:** The app appears functionally stable on mobile; automated failures are attributed to a mismatch in expected URL patterns and navigation state handling in the `audit.js` script.

## Findings

### 1. Navigation Heuristics
- The automated tester expected `/chapter/[id]/explain` but the actual route is `/chapter/[id]/explanation`. This mismatch caused most of the reported "Explanation page empty" failures.
- The automated tester failed to account for the mandatory pre-assessment step in the "Learning Path" UI. Direct navigation to `/explanation` works, but clicking "Start Learning" on the chapter landing page leads to a pre-assessment, which the tester interpreted as a failure to reach the explanation.

### 2. Core Functional Check (Manual Spotcheck)
| Chapter ID | Subject | Chapter Reachable | Explanation Content | CTA Present | Result |
|------------|---------|-------------------|---------------------|-------------|--------|
| 1462 | Science | Yes | Yes (Non-empty) | Yes | PASS |
| 1457 | Maths | Yes | Yes (Non-empty) | Yes | PASS |
| 1455 | English | Yes | Yes (Non-empty) | Yes | PASS |
| 1458 | Hindi | Yes | Yes (Non-empty) | Yes | PASS |
| 1456 | Geography | Yes | Yes (Non-empty) | Yes | PASS |

*Note: 15 additional chapters were sampled with identical results.*

### 3. Detected Issues (Non-Outliers)
- **Onboarding Flow:** The "Go to my dashboard" button in the onboarding completion screen is unresponsive in some mobile viewports, requiring a manual URL entry or refresh.
- **Accordion Latency:** The subject accordions on the dashboard have a slight delay (approx 500ms) which can lead to race conditions in automated scripts.

## Recommendation
- Update `audit.js` to target `/explanation` instead of `/explain`.
- Update `audit.js` to handle the `onboarding` redirect and `pre-assessment` requirement.
- Do NOT treat the current `mobile-chapter-audit-2026-02-28.json` as a reflection of app health.
