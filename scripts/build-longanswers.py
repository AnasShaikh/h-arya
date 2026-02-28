#!/usr/bin/env python3
import json, os, re
from collections import Counter

CHAPTERS_DIR = "/opt/h-arya/content/chapters"


def tokenize(s: str):
    return re.findall(r"[a-zA-Z]{3,}", s.lower())


def best_context(prompt: str, concepts: list, tests: list):
    """Pick the most relevant concept+test snippets for a prompt."""
    p_tokens = set(tokenize(prompt))
    scored = []

    for c in concepts or []:
        text = " ".join([
            str(c.get("title", "")),
            str(c.get("content", "")),
            " ".join(k.get("text", k) if isinstance(k, dict) else str(k) for k in c.get("keyPoints", []) if k),
        ])
        c_tokens = set(tokenize(text))
        score = len(p_tokens & c_tokens)
        if score > 0:
            scored.append((score, text))

    for t in tests or []:
        text = " ".join([str(t.get("question", "")), str(t.get("explanation", ""))])
        t_tokens = set(tokenize(text))
        score = len(p_tokens & t_tokens)
        if score > 0:
            scored.append((score, text))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [s[1] for s in scored[:3]]


def summarize_to_bullets(snippets, max_points=4):
    if not snippets:
        return ["Define the concept in textbook terms.", "Explain with key characteristics.", "Add one relevant example."]

    words = []
    for s in snippets:
        words.extend(tokenize(s))
    common = [w for w, _ in Counter(words).most_common(12)]

    bullets = []
    if common:
        bullets.append(f"Start with a clear definition of the concept.")
        bullets.append(f"Explain key points: {', '.join(common[:4])}.")
        bullets.append("Include a textbook-style explanation in 3–5 lines.")
        bullets.append("Conclude with one simple real-life/example-based line.")
    return bullets[:max_points]


def build_model_answer(prompt, snippets):
    bullets = summarize_to_bullets(snippets)
    intro = f"{prompt.strip()}\n\n"
    body = "\n".join([f"- {b}" for b in bullets])
    return intro + body


def derive_long_questions_from_textbook_exercise(te):
    out = []
    if not isinstance(te, dict):
        return out

    for q in te.get("questions", []) or []:
        q_type = (q.get("type") or "").lower()
        q_text = (q.get("question") or "").strip()

        # Use open-ended buckets + subquestions
        if q_type in {"short_answer", "give_reasons"} and q_text:
            out.append(q_text)

        for sq in q.get("subQuestions", []) or []:
            s = str(sq).strip()
            if len(s) > 12:
                out.append(s)

    # de-dup while preserving order
    seen = set(); dedup = []
    for x in out:
        key = x.lower()
        if key not in seen:
            seen.add(key); dedup.append(x)
    return dedup[:8]


def derive_long_questions_from_test(test):
    out = []
    for q in test or []:
        text = str(q.get("question", "")).strip()
        if not text:
            continue
        if any(k in text.lower() for k in ["why", "explain", "what", "how", "give reason", "describe"]):
            out.append(text)
    # fallback first few
    if not out:
        out = [str(q.get("question", "")).strip() for q in (test or []) if q.get("question")][:5]
    # dedup
    seen=set(); d=[]
    for x in out:
        if x and x.lower() not in seen:
            seen.add(x.lower()); d.append(x)
    return d[:6]


def main():
    updated = 0
    total = 0
    for fn in sorted(os.listdir(CHAPTERS_DIR)):
        if not fn.endswith('.json'):
            continue
        path = os.path.join(CHAPTERS_DIR, fn)
        try:
            data = json.load(open(path, encoding='utf-8'))
        except Exception:
            continue

        total += 1
        concepts = data.get("concepts", [])
        tests = data.get("test", [])
        te = data.get("textbookExercise") if isinstance(data.get("textbookExercise"), dict) else {}

        prompts = derive_long_questions_from_textbook_exercise(te)
        if not prompts:
            prompts = derive_long_questions_from_test(tests)

        if not prompts:
            continue

        long_answers = []
        for i, p in enumerate(prompts, start=1):
            ctx = best_context(p, concepts, tests)
            model = build_model_answer(p, ctx)
            key_points = summarize_to_bullets(ctx)
            long_answers.append({
                "id": f"la{i}",
                "question": p,
                "modelAnswer": model,
                "keyPoints": key_points,
                "marks": 3 if i <= 3 else 5,
            })

        if not isinstance(data.get("textbookExercise"), dict):
            data["textbookExercise"] = {
                "chapterName": data.get("metadata", {}).get("title", ""),
                "instructions": "Textbook-style long answer practice",
            }

        prev = data["textbookExercise"].get("longAnswers", [])
        if len(prev) != len(long_answers):
            data["textbookExercise"]["longAnswers"] = long_answers
            with open(path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            updated += 1

    print(f"Updated {updated}/{total} chapters with textbookExercise.longAnswers")


if __name__ == "__main__":
    main()
