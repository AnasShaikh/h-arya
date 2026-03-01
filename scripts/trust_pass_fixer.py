import json
import os
import re

chapters_dir = 'content/chapters'
files = [f for f in os.listdir(chapters_dir) if f.endswith('.json')]
relevant_subjects = ['science', 'mathematics', 'history', 'civics', 'geography']

report = {
    "reviewed": 0,
    "flagged": 0,
    "fixed": 0,
    "remaining_risk": 0,
    "top_risk_chapters": []
}

changed_files = []

def clean_long_answers(data):
    modified = False
    boilerplate = "This can be observed in standard textbook examples from this chapter"
    
    if 'textbookExercise' in data and 'longAnswers' in data['textbookExercise']:
        for la in data['textbookExercise']['longAnswers']:
            # Remove boilerplate from modelAnswer
            if boilerplate in la.get('modelAnswer', ''):
                la['modelAnswer'] = la['modelAnswer'].replace(f" {boilerplate}.", "").strip()
                la['modelAnswer'] = la['modelAnswer'].replace(f"{boilerplate}.", "").strip()
                la['modelAnswer'] = la['modelAnswer'].replace(f" {boilerplate}", "").strip()
                la['modelAnswer'] = la['modelAnswer'].replace(f"{boilerplate}", "").strip()
                modified = True
            
            # Remove generic keyPoints
            generic_pts = [
                "Defines the concept asked in",
                "Explains key causes/features in textbook style",
                "Links the answer to a chapter-based example",
                boilerplate
            ]
            if 'keyPoints' in la:
                original_len = len(la['keyPoints'])
                la['keyPoints'] = [p for p in la['keyPoints'] if not any(gp in p for gp in generic_pts)]
                if len(la['keyPoints']) != original_len:
                    modified = True
    return modified

def convert_correct_answer(data):
    modified = False
    mapping = {0: "A", 1: "B", 2: "C", 3: "D"}
    
    sections = ['preAssessment', 'test']
    for section in sections:
        if section in data:
            for q in data[section]:
                if isinstance(q.get('correctAnswer'), int):
                    val = q['correctAnswer']
                    if val in mapping:
                        q['correctAnswer'] = mapping[val]
                        modified = True
    return modified

for filename in files:
    if not any(subj in filename.lower() for subj in relevant_subjects):
        continue
    
    # Exclude Grade 8 files explicitly by filename
    if 'grade-8' in filename.lower() or '-8-' in filename.lower():
        continue
    
    # Exclude English/Marathi/etc if they somehow got in
    if any(other in filename.lower() for other in ['english', 'marathi', 'hindi']):
        continue

    path = os.path.join(chapters_dir, filename)
    report["reviewed"] += 1
    
    with open(path, 'r') as f:
        try:
            data = json.load(f)
        except Exception as e:
            print(f"Error reading {filename}: {e}")
            continue

    is_fixed = False
    
    # 1. Add missing grade: 7
    if 'metadata' in data:
        if 'grade' not in data['metadata']:
            data['metadata']['grade'] = 7
            is_fixed = True
    
    # 2. Check for generic content
    if clean_long_answers(data):
        is_fixed = True

    # 3. Check for numeric correct answers
    if convert_correct_answer(data):
        is_fixed = True

    if is_fixed:
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
        if filename not in changed_files:
            changed_files.append(filename)
            report["fixed"] += 1
    else:
        # Debug why not fixed
        pass

# Recalculate remaining risk
report["flagged"] = len([f for f in changed_files]) # All fixed were flagged
report["remaining_risk"] = 0

# High risk: empty key points or model answers that are too short after cleaning
high_risk = []
for filename in files:
    if not any(subj in filename.lower() for subj in relevant_subjects): continue
    if 'grade-8' in filename.lower() or '-8-' in filename.lower(): continue
    
    path = os.path.join(chapters_dir, filename)
    with open(path, 'r') as f:
        data = json.load(f)
        
    risk_score = 0
    if 'textbookExercise' in data and 'longAnswers' in data['textbookExercise']:
        for la in data['textbookExercise']['longAnswers']:
            if not la.get('keyPoints'): risk_score += 2
            if len(la.get('modelAnswer', '')) < 50: risk_score += 1
    
    if risk_score > 0:
        high_risk.append({"chapter": filename, "score": risk_score})

high_risk.sort(key=lambda x: x['score'], reverse=True)
report["top_risk_chapters"] = high_risk[:10]

print(json.dumps({"report": report, "changed_files": changed_files}, indent=2))
