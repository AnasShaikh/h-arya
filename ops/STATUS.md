# STATUS

Date: 2026-02-28
Mission: Launch H-Arya for Maharashtra Board Std 7 with exam-score-first outcomes.

## Current Truth
- All Std 7 textbooks are stored under `/opt/h-arya/content/textbooks/std7/`.
- Memorize mode is live in Explanation and unlocked when cards are available.
- New long-answer pipeline shipped:
  - `textbookExercise.longAnswers[]` generated for all chapter JSONs.
  - Long Answer Practice tab added in Memorize UI.
- Science quality audit green: missing=0, weak=0.
- Live smoke green: pass.
- App deployed healthy.

## What changed in this run
1. Generated long answers for all chapters via `/opt/h-arya/scripts/build-longanswers.py`.
2. Updated explanation page to load and display long-answer practice.
3. Added UI for student-written answer + model textbook-style answer + must-include points.
4. Refined long-answer extraction for History Chapter 1 using exact textbook-end Q&A from history-7-en.pdf; updated chapter JSON.
5. Extended refinement to History Chapter 2 with exact exercises from history-7-en.pdf; updated chapter-2 JSON.
6. Extended refinement to History Chapter 3 with exact exercises from history-7-en.pdf; updated chapter-3 JSON.
7. Extended refinement to History Chapter 4 with exact exercises from history-7-en.pdf; updated chapter-4 JSON.
8. Extended refinement to History Chapter 5 with exact exercises from history-7-en.pdf; updated chapter-5 JSON.
9. Added Razorpay-compliance pages: `/pricing`, `/privacy-policy`, `/terms`, `/refund-policy`, `/contact` with support contact + effective-date text.
10. Updated landing footer links to include all new compliance/support routes; build passed and app redeployed.

## Next
- Improve long-answer extraction fidelity from exact textbook-end questions for non-science books (currently mixed: textbook-derived + chapter-derived).
- Add rubric scoring (coverage + wording similarity) in Long Answer Practice.
