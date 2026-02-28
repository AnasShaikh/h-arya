import json
import os
import sys

def get_questions_to_refine(file_path):
    try:
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        if 'textbookExercise' not in data:
            return None
        
        # Pull questions from 'longAnswers' or 'questions' with 'give_reasons' type
        # Focus on "why", "how", "explain", "describe" questions
        questions = []
        seen = set()
        
        # 1. Take from existing longAnswers if they look valid
        for item in data['textbookExercise'].get('longAnswers', []):
            q = item.get('question', '').strip()
            if len(q) > 15 and q not in seen:
                questions.append(q)
                seen.add(q)
        
        # 2. Take from questions subQuestions if longAnswers is empty or sparse
        if len(questions) < 4:
            for q_obj in data['textbookExercise'].get('questions', []):
                if q_obj.get('type') in ['give_reasons', 'short_answer', 'long_answer', 'answer_following']:
                    for sq in q_obj.get('subQuestions', []):
                        sq_strip = sq.strip()
                        if len(sq_strip) > 20 and sq_strip not in seen:
                            questions.append(sq_strip)
                            seen.add(sq_strip)
        
        return questions[:10] # Return up to 10 for the LLM to choose 4-8 from
    except Exception as e:
        return None

if __name__ == "__main__":
    for path in sys.argv[1:]:
        qs = get_questions_to_refine(path)
        if qs:
            print(f"FILE: {path}")
            for q in qs:
                print(f"Q: {q}")
            print("-" * 20)
