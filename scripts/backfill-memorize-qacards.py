#!/usr/bin/env python3
import json, os

chapters_dir = "/opt/h-arya/content/chapters"
updated = 0

for fn in os.listdir(chapters_dir):
    if not fn.endswith('.json'):
        continue
    p = os.path.join(chapters_dir, fn)
    try:
        with open(p, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except Exception:
        continue

    test = data.get('test', [])
    qa_cards = []
    if isinstance(test, list):
        for q in test:
            if isinstance(q, dict) and q.get('question') and q.get('explanation'):
                qa_cards.append({
                    'question': q['question'],
                    'answer': q['explanation'],
                    'source': 'chapter_test_explanation'
                })

    if not qa_cards:
        continue

    if 'textbookExercise' not in data or not isinstance(data['textbookExercise'], dict):
        data['textbookExercise'] = {
            'chapterName': data.get('metadata', {}).get('title', ''),
            'instructions': 'Memorize these exam-style answers to maximize scoring in textbook-focused assessments.',
            'questions': [],
            'source': 'derived_from_test'
        }

    existing_cards = data['textbookExercise'].get('qaCards', [])
    if not isinstance(existing_cards, list) or len(existing_cards) == 0:
        data['textbookExercise']['qaCards'] = qa_cards[:20]
        updated += 1
        with open(p, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

print(f"Updated {updated} chapter files with memorize qaCards")
