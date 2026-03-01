# STATUS

Date: 2026-03-01
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
11. Refined History Chapter 6 long-answer set to match textbook-end Exercise prompts (write-in-own-words + give-reasons), replacing generic/generated prompts.
12. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
13. Refined History Chapter 7 long-answer set to match textbook-end Exercise prompts (2 write-in-own-words + 2 give-reasons), replacing generic/generated prompts.
14. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
15. Refined History Chapter 8 long-answer set to match textbook-end Exercise prompts (find-from-chapter + write-in-own-words), replacing generic/generated prompts.
16. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
17. Refined History Chapter 9 long-answer set to match textbook-end Exercise prompts (find-in-text + give-reasons), replacing generic/generated prompts.
18. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
19. Refined History Chapter 10 long-answer set to match textbook-end Exercise prompts (write-in-brief), replacing generic/generated prompts.
20. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
21. Refined History Chapter 11 long-answer set to textbook-end style prompts (write-in-brief focus), replacing generic/generated prompts.
22. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
23. Refined History Chapter 12 long-answer set to textbook-end Exercise prompts (write-briefly + discuss), replacing generic/generated prompts.
24. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
25. Refined History Chapter 13 long-answer set to textbook-end Exercise prompts (social reflection + compare-era note), replacing generic/generated prompts.
26. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
27. Refined Civics Chapter 1 long-answer set to textbook-end Exercise prompts (explain/discuss/answer), replacing generic/generated prompts.
28. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
29. Refined Civics Chapter 2 long-answer set to textbook-end Exercise prompts (answer + explain concepts), replacing generic/generated prompts.
30. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
31. Refined Civics Chapter 3 long-answer set to textbook-end Exercise prompts (federalism/election commission/independent judiciary focus), replacing generic/generated prompts.
32. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
33. Refined Civics Chapter 4 long-answer set to textbook-end Exercise prompts (fundamental-rights brief answers + reasoning), replacing generic/generated prompts.
34. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
35. Refined Civics Chapter 5 long-answer set to textbook-end Exercise prompts (religious-tax neutrality + constitutional remedies + rights reasoning), replacing generic/generated prompts.
36. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
37. Refined Civics Chapter 6 long-answer set to textbook-end Exercise prompts (directive principles + duties + constitutional limits), replacing generic/generated prompts.
38. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
39. Refined Geography Chapter 2 long-answer set to textbook-end Exercise prompts (eclipse reasoning + precautions + anti-superstition), replacing generic/generated prompts.
40. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
41. Refined Geography Chapter 3 long-answer set to textbook-end Exercise prompts (geographical reasons + tide differentiation + effects), replacing generic/generated prompts.
42. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
43. Refined Geography Chapter 4 long-answer set to textbook-end Exercise prompts (air pressure reasons + belts + desert linkage), replacing generic/generated prompts.
44. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
45. Refined Geography Chapter 5 long-answer set to textbook-end Exercise prompts (winds/cyclones reasoning + short answers), replacing generic/generated prompts.
46. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
47. Refined Geography Chapter 6 long-answer set to textbook-end Exercise prompts (natural regions reasons + short answers), replacing generic/generated prompts.
48. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
49. Refined Geography Chapter 7 long-answer set to textbook-end Exercise prompts (soil-formation reasons + conservation/manure notes), replacing generic/generated prompts.
50. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
51. Refined Geography Chapter 8 long-answer set to textbook-end Exercise prompts (seasons mechanics + equinox/polar-day reasoning), replacing generic/generated prompts.
52. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
53. Refined Geography Chapter 9 long-answer set to textbook-end Exercise prompts (irrigation/farming systems/seasonality), replacing generic/generated prompts.
54. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
55. Refined Geography Chapter 10 long-answer set to textbook-end Exercise prompts (settlement types/patterns/factors/evolution), replacing generic/generated prompts.
56. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
57. Refined Geography Chapter 11 long-answer set to textbook-end Exercise prompts (contour interpretation + applied use), replacing generic/generated prompts.
58. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
59. Refined English Chapter 2 (Odd One In) long-answer set to textbook-workshop aligned prompts (character analysis, POV writing, reflection/discussion), replacing generic/generated prompts.
60. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
61. Refined English Chapter 4 (The King’s Choice) long-answer set to textbook-workshop aligned prompts (character sketch, moral interpretation, loyalty discussion, creative turn), replacing generic/generated prompts.
62. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
63. Refined English Chapter 6 (A Collage) long-answer set to textbook-activity aligned prompts (Vivekananda message + quote interpretation + collage project writing), replacing generic/generated prompts.
64. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
65. Refined English Chapter 8 (The Souvenir) long-answer set to textbook-workshop aligned prompts (timetable/diary/discussion + science reasoning), replacing generic/generated prompts.
66. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
67. Refined English Chapter 10 (How doth the little busy bee) long-answer set to textbook-workshop aligned prompts (theme/parody/symbol-tone comparison + creative response), replacing generic/generated prompts.
68. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
69. Refined English Chapter 12 (Chasing The Sea Monster) long-answer set to textbook-workshop aligned prompts (time-event charting, suspense interpretation, machine clues, grammar-in-context), replacing generic/generated prompts.
70. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
71. Refined English Chapter 14 (Tartary) long-answer set to textbook-workshop aligned prompts (daily routine, imagery/comparison analysis, imaginative region writing), replacing generic/generated prompts.
72. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
73. Refined English Chapter 16 (A Crow in the House) long-answer set to textbook-workshop aligned prompts (character actions, humor interpretation, sequencing, imaginative response), replacing generic/generated prompts.
74. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
75. Refined English Chapter 18 (News Analysis) long-answer set to textbook-workshop aligned prompts (news reliability judgment, exam-policy reasoning, issue discussion, formal letter writing), replacing generic/generated prompts.
76. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
77. Refined English Chapter 20 (Under the Greenwood Tree) long-answer set to textbook-workshop aligned prompts (theme/symbolism/language effect + comparative and creative response), replacing generic/generated prompts.
78. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
79. Refined English Chapter 22 (The Red-Headed League) long-answer set to textbook-workshop aligned prompts (clue-based deduction, plan analysis, climax interpretation, modal-verb usage), replacing generic/generated prompts.
80. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
81. Refined English Chapter 24 (Seeing Eyes Helping Hands - Letters) long-answer set to textbook-workshop aligned prompts (formal/informal letter writing, format contrast, value reflection), replacing generic/generated prompts.
82. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
83. Refined English Chapter 13 (Great Scientists) long-answer set to textbook-workshop aligned prompts (implied meaning, mentor-pupil contrast, failure response, scientific impact), replacing generic/generated prompts.
84. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
85. Refined English Chapter 25 (Papa Panov’s Special Christmas) long-answer set to textbook-workshop aligned prompts (character sketch, interpretation, compassion narratives, seasonal hardship reflection), replacing generic/generated prompts.
86. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
87. Refined English Chapter 21 (Unke Munke Timpetoo) long-answer set to textbook-workshop aligned prompts (incident narration, interpretation, character growth, word-formation study), replacing generic/generated prompts.
88. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
89. Refined English Chapter 23 (Home Sweet Home) long-answer set to textbook-workshop aligned prompts (theme/refrain/family-bond interpretation + language study + reflective writing), replacing generic/generated prompts.
90. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
91. Refined English Chapter 9 (Abdul Becomes a Courtier) long-answer set to textbook-workshop aligned prompts (incident context, practical intelligence, moral and reflection), replacing generic/generated prompts.
92. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
93. Refined English Chapter 5 (Seeing Eyes Helping Hands - Invitations) long-answer set to textbook-workshop aligned prompts (invitation/notice distinction, oral invite protocol, punctuation-in-context, value reflection), replacing generic/generated prompts.
94. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
95. Refined English Chapter 3 (In Time of Silver Rain) long-answer set to textbook-workshop aligned prompts (imagery/mood analysis, nature-human connection, alliteration and creative reflection), replacing generic/generated prompts.
96. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).
97. Refined English Chapter 1 (Past, Present, Future) long-answer set to textbook-workshop aligned prompts (time-imagery interpretation, emotion, figure-of-speech study, reflective writing), replacing generic/generated prompts.
98. Re-ran quality gates after content change: `npm run audit:science` (green) and `bash scripts/live-qa.sh` (pass).

## Next
- Refine non-science long-answer extraction to exact textbook-end questions for remaining non-science chapters (History done through Ch13; Civics done through Ch6; Geography done through Ch11; languages in progress — English Ch1, Ch2, Ch3, Ch4, Ch5, Ch6, Ch8, Ch9, Ch10, Ch12, Ch13, Ch14, Ch16, Ch18, Ch20, Ch21, Ch22, Ch23, Ch24 & Ch25 done; others pending).
- Add rubric scoring (coverage + wording similarity) in Long Answer Practice.
