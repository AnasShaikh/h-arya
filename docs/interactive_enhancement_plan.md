# H-Arya Interactive Enhancement Plan

**Goal:** Add a unique, topic-specific `interactiveElement` to every chapter JSON in `/opt/h-arya/content/chapters/` to make chapters more visually engaging on mobile.

**Agent:** Coda 🚀
**Started:** 2026-02-28
**Status:** IN PROGRESS

## Subjects Covered
- Science (Grade 7 & 8)
- Mathematics
- Geography
- Civics
- History
- Hindi
- Marathi
- English

## Progress Tracker

| File | Subject | Status |
|------|---------|--------|
| (updated by agent as it goes) | | |

## interactiveElement Schema
Each chapter gets ONE `interactiveElement` added at the top level of its JSON:

```json
"interactiveElement": {
  "type": "one of: drag-drop | timeline | label-diagram | quiz-flashcard | word-scramble | fill-blanks | match-pairs | sorting | map-tap | formula-builder",
  "title": "Short engaging title for the activity",
  "description": "What the student does (1 sentence)",
  "data": { ... type-specific content ... }
}
```

### Type Definitions

**drag-drop**: Student drags items into correct categories
```json
"data": { "items": ["item1","item2"], "categories": ["cat1","cat2"], "answers": {"item1":"cat1"} }
```

**timeline**: Student arranges events in chronological order
```json
"data": { "events": [{"label":"Event","year":"1600","fact":"..."}] }
```

**label-diagram**: Tap on blank labels to reveal names
```json
"data": { "image": "description of diagram", "labels": [{"id":1,"x":50,"y":30,"answer":"Nucleus"}] }
```

**quiz-flashcard**: Flip cards to reveal answers
```json
"data": { "cards": [{"front":"Question?","back":"Answer"}] }
```

**word-scramble**: Unscramble a key vocabulary word
```json
"data": { "words": [{"scrambled":"OAMSMNLESI","answer":"OSMOLESIS","hint":"Movement of water through membrane"}] }
```

**fill-blanks**: Fill in the blanks in a key sentence
```json
"data": { "sentence": "The ___ is the powerhouse of the ___.", "blanks": ["mitochondria","cell"] }
```

**match-pairs**: Match terms to definitions
```json
"data": { "pairs": [{"term":"Photosynthesis","match":"Process by which plants make food"}] }
```

**sorting**: Sort items into correct order (steps, hierarchy, etc.)
```json
"data": { "prompt": "Arrange the steps of digestion in order", "items": ["step A","step B"], "correct": [0,1] }
```

**map-tap**: Tap correct location on a described map
```json
"data": { "prompt": "Where is the Sahara Desert?", "options": ["North Africa","South Asia","Europe"], "correct": 0 }
```

**formula-builder**: Drag components to build a formula
```json
"data": { "formula": "Speed = Distance / Time", "components": ["Speed","=","Distance","/","Time"] }
```

## Rules for Agent
1. Read each JSON file
2. Based on the chapter title and subject, choose the BEST interactive element type
3. Generate meaningful, accurate content for the element
4. Add `interactiveElement` as a top-level field in the JSON (after `aiContext`)
5. Write the updated file back
6. Update this tracking doc's progress table
7. Process ALL 122 files before stopping
8. After all files done: run `npm run audit:science` then `docker compose up -d --build app`
9. Notify: `openclaw system event --text "Done: Added interactive elements to all 122 chapters" --mode now`

