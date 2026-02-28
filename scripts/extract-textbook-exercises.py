#!/usr/bin/env python3
"""
Extract textbook exercises from science PDF and inject into chapter JSON files.
Maps PDF exercise line numbers to chapter JSON files.
"""
import json, os, re

PDF_TEXT = '/tmp/science7.txt'
CHAPTERS_DIR = '/opt/h-arya/content/chapters'

# Map: (pdf_exercise_line, next_exercise_line) -> chapter json filename
CHAPTER_MAP = [
    (856,  1269, 'chapter-1-science-7-living-world.json',      'The Living World'),
    (1269, 1918, 'chapter-2-science-7-plants.json',            'Plants: Structure and Function'),
    (1918, 2435, 'chapter-3-science-7-natural-resources.json', 'Properties of Natural Resources'),
    (2435, 2915, 'chapter-4-science-7-nutrition.json',         'Nutrition in Living Organisms'),
    (2915, 3309, 'chapter-5-science-7-food-safety.json',       'Food Safety'),
    (3309, 3675, 'chapter-6-science-7-measurement.json',       'Measurement of Physical Quantities'),
    (3675, 4232, 'chapter-7-science-7-motion-force-work.json', 'Motion, Force and Work'),
    (4232, 4596, 'chapter-8-science-7-static-electricity.json','Static Electricity'),
    (4596, 5036, 'chapter-9-science-7-heat.json',              'Heat'),
    (5036, 5684, 'chapter-10-disasters.json',                  'Disasters'),
    (5684, 6180, 'chapter-11-cell-structure-micro-organisms.json', 'Cell Structure'),
    (6180, 6454, 'chapter-12-muscular-digestive-system.json',  'Muscular and Digestive System'),
    (6454, 6969, 'chapter-13-physical-chemical-changes.json',  'Physical and Chemical Changes'),
    (6969, 7218, 'chapter-14-elements-compounds-and-mixtures.json', 'Elements, Compounds and Mixtures'),
    (7218, 7838, 'chapter-15-materials-we-use.json',           'Materials We Use'),
    (7838, 8181, 'chapter-16-natural-resources.json',          'Natural Resources'),
    (8181, 8697, 'chapter-17-effects-of-light.json',           'Effects of Light'),
    (8697, 9018, 'chapter-18-sound.json',                      'Sound'),
    (9018, 9476, 'chapter-19-properties-of-magnetic-field.json','Properties of Magnetic Field'),
    (9476, 9515, 'chapter-20-in-the-world-of-stars.json',      'In the World of Stars'),
]

def clean_text(text):
    """Clean extracted PDF text."""
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r' +', ' ', text)
    return text.strip()

def parse_questions(raw_text):
    """Parse raw exercise text into structured Q&A format."""
    questions = []
    
    # Split into numbered sections
    # Match patterns like: "1.", "2.", "3." at start of line or after newline
    sections = re.split(r'\n(?=\d+\.)', raw_text)
    
    for section in sections:
        section = section.strip()
        if not section:
            continue
        
        # Get question number
        num_match = re.match(r'^(\d+)\.\s*', section)
        if not num_match:
            continue
        
        q_num = int(num_match.group(1))
        content = section[num_match.end():].strip()
        
        if not content or len(content) < 5:
            continue
        
        # Determine question type
        content_lower = content.lower()
        
        if any(x in content_lower for x in ['fill in the blank', 'fill appropriate', 'fill the blank', 'write appropriate']):
            q_type = 'fill_blanks'
        elif any(x in content_lower for x in ['match the pair', 'match the column', 'who are my companion', 'find my match', 'with whom should']):
            q_type = 'match_pairs'
        elif any(x in content_lower for x in ['true or false', 'state whether']):
            q_type = 'true_false'
        elif any(x in content_lower for x in ['give reason', 'why is', 'explain']):
            q_type = 'give_reasons'
        elif any(x in content_lower for x in ['answer the following', 'write answer', 'answer in your own', 'describe', 'what is', 'what are', 'how']):
            q_type = 'short_answer'
        elif any(x in content_lower for x in ['classify', 'find the odd', 'odd man out', 'complete the']):
            q_type = 'activity'
        else:
            q_type = 'short_answer'
        
        # Extract sub-questions (a), (b), (c)...
        sub_questions = re.findall(r'\([a-z]\)\s*([^\n\(]+(?:\n(?!\([a-z]\))[^\n]+)*)', content)
        sub_questions = [sq.strip() for sq in sub_questions if len(sq.strip()) > 5]
        
        questions.append({
            'number': q_num,
            'type': q_type,
            'question': clean_text(content[:300]),  # First 300 chars as question
            'subQuestions': sub_questions[:8],  # Max 8 sub-questions
        })
    
    return questions[:10]  # Max 10 questions per chapter

def extract_exercise(lines, start_line, end_line):
    """Extract exercise text between line numbers."""
    # Lines are 1-indexed in our map, 0-indexed in list
    raw = ''.join(lines[start_line - 1:end_line - 1])
    # Remove "Exercise" header
    raw = re.sub(r'^Exercise\s*\n', '', raw)
    # Stop at "Project :" or "ttt" or next chapter
    raw = re.split(r'\nProject\s*:', raw)[0]
    raw = re.split(r'\nttt\n', raw)[0]
    return clean_text(raw)

def main():
    with open(PDF_TEXT) as f:
        lines = f.readlines()
    
    for start, end, filename, chapter_name in CHAPTER_MAP:
        filepath = os.path.join(CHAPTERS_DIR, filename)
        if not os.path.exists(filepath):
            print(f'  SKIP (file not found): {filename}')
            continue
        
        with open(filepath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        if 'textbookExercise' in data:
            print(f'  SKIP (already has textbookExercise): {filename}')
            continue
        
        # Extract raw exercise text
        raw = extract_exercise(lines, start, end)
        questions = parse_questions(raw)
        
        if not questions:
            print(f'  WARNING (no questions parsed): {filename}')
            continue
        
        data['textbookExercise'] = {
            'chapterName': chapter_name,
            'instructions': 'These are the exact questions from your textbook exercise. Memorize the answers — these appear in school exams!',
            'questions': questions,
            'rawText': raw[:2000],  # Store raw for reference
        }
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        
        print(f'  ✓ {filename}: {len(questions)} questions extracted')

if __name__ == '__main__':
    main()
