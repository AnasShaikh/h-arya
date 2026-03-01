import json
import os

chapters_dir = 'content/chapters'
relevant_subjects = ['science', 'mathematics', 'history', 'civics', 'geography']

report = {
    "reviewed": 0,
    "fixed": 0,
    "changed_files": []
}

def clean_data(data):
    modified = False
    
    # Add grade 7
    if 'metadata' in data and 'grade' not in data['metadata']:
        data['metadata']['grade'] = 7
        modified = True
        
    # Fix numeric correctAnswer
    mapping = {0: "A", 1: "B", 2: "C", 3: "D"}
    for section in ['preAssessment', 'test']:
        if section in data:
            for q in data[section]:
                if isinstance(q.get('correctAnswer'), int):
                    if q['correctAnswer'] in mapping:
                        q['correctAnswer'] = mapping[q['correctAnswer']]
                        modified = True

    # Clean boilerplate
    boilerplate = "This can be observed in standard textbook examples from this chapter"
    if 'textbookExercise' in data and 'longAnswers' in data['textbookExercise']:
        for la in data['textbookExercise']['longAnswers']:
            if boilerplate in la.get('modelAnswer', ''):
                la['modelAnswer'] = la['modelAnswer'].replace(boilerplate, "").strip().strip(".")
                modified = True
            if 'keyPoints' in la:
                old_pts = la['keyPoints']
                la['keyPoints'] = [p for p in old_pts if boilerplate not in p and "Defines the concept" not in p and "Explains key" not in p and "Links the answer" not in p]
                if len(la['keyPoints']) != len(old_pts):
                    modified = True
                    
    return modified

for filename in os.listdir(chapters_dir):
    if not filename.endswith('.json'): continue
    if not any(s in filename.lower() for s in relevant_subjects): continue
    if 'grade-8' in filename.lower(): continue
    if '-grade-8' in filename.lower(): continue
    if filename.endswith('-8.json'): continue
    
    print(f"Checking {filename}")
    report["reviewed"] += 1
    path = os.path.join(chapters_dir, filename)
    
    with open(path, 'r') as f:
        try:
            data = json.load(f)
        except:
            continue
            
    if clean_data(data):
        with open(path, 'w') as f:
            json.dump(data, f, indent=2)
        report["fixed"] += 1
        report["changed_files"].append(filename)

print(json.dumps(report, indent=2))
