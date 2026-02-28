# LOWER-MODEL HANDOFF: Std 7 Launch Sprint

## Mission
Launch H-Arya for Maharashtra Std 7 with exam-score-first experience.

## Current Priority
Build textbook-aligned long-answer practice.

## Immediate TODO
1. Extract chapter-end long-answer questions from textbooks.
2. Populate `textbookExercise.longAnswers[]` in chapter JSONs.
3. Use textbook-like wording from chapter content for `modelAnswer`.
4. Add/verify Long Answer tab in Memorize UI.

## Sources
Use `/opt/h-arya/docs/RESOURCE_REGISTRY.md`.

## Guardrails
- Do not change Grade scope beyond Std 7 unless asked.
- Keep wording exam-oriented and close to textbook style.
- Preserve existing schema compatibility.

## Completion Checks
- At least Science + History/Civics long answers extracted.
- UI shows Long Answer practice for updated chapters.
- `npm run audit:science` passes.
- `bash scripts/live-qa.sh` passes.
