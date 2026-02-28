# RESOURCE REGISTRY (Shared for all models)

Purpose: quick access to textbook/source assets when context is compacted or a lower model takes over.

## Std 7 Textbooks (Primary Source)
Location: `/opt/h-arya/content/textbooks/std7/`

- `science-7-en.pdf`
- `maths-7-en.pdf`
- `history-7-en.pdf` (History + Civics)
- `geography-7-en.pdf`
- `english-7-en.pdf`
- `hindi-7-en.pdf`
- `marathi-7-en.pdf`

Index file: `/opt/h-arya/content/textbooks/std7/INDEX.md`

## Preprocessed Text (fast extraction cache)
Location: `/tmp/std7_txt/`

- `science-7-en.txt`
- `maths-7-en.txt`
- `history-7-en.txt`
- `geography-7-en.txt`
- `english-7-en.txt`
- `hindi-7-en.txt`
- `marathi-7-en.txt`

> Note: `/tmp` can be ephemeral. Rebuild with:

```bash
mkdir -p /tmp/std7_txt
for f in /opt/h-arya/content/textbooks/std7/*.pdf; do
  b=$(basename "$f" .pdf)
  pdftotext "$f" "/tmp/std7_txt/$b.txt"
done
```

## Active Content Store
Chapter JSONs: `/opt/h-arya/content/chapters/`

Key fields used for launch:
- `preAssessment[]`
- `concepts[]`
- `test[]`
- `interactiveElement`
- `textbookExercise` (in progress for long-answer/exam-mode)

## Extraction Scripts
- `/opt/h-arya/scripts/extract-textbook-exercises.py` (Science exercise extraction)
- `/opt/h-arya/scripts/backfill-memorize-qacards.py` (qaCards fallback for all chapters)

## Validation Commands
- `npm run audit:science`
- `bash scripts/live-qa.sh`
- `docker compose up -d --build app`

## Runbook (when lower model takes over)
1. Read this file first.
2. Verify textbooks exist in `/content/textbooks/std7`.
3. Verify chapter JSON coverage in `/content/chapters`.
4. Continue long-answer extraction into `textbookExercise.longAnswers[]`.
5. Run quality + QA + deploy.
