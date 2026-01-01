# Chapter Template - Adding New Chapters to AI Tutor

## 🎯 Overview

This guide provides step-by-step instructions to add a new chapter to the AI Tutor platform. Follow this template to add any chapter from Maharashtra Board 7th Grade curriculum.

---

## 📋 Prerequisites

Before starting, you need:

1. **Textbook content** for the chapter
2. **Exercise questions** from the chapter
3. **Key concepts** to teach
4. **Chapter number** and subject

**Example:** Adding Chapter 19: Light

---

## Step 1: Add to Curriculum Database

### Open database
```bash
cd ai-tutor
sqlite3 database.db
```

### Insert new chapter
```sql
INSERT INTO curriculum (subject, chapter_number, chapter_name, description, is_active)
VALUES ('Science', 19, 'Light', 'Reflection and Refraction', 1);
```

**Get the ID:**
```sql
SELECT id FROM curriculum WHERE chapter_number = 19 AND subject = 'Science';
-- Note this ID (e.g., 2)
```

**Exit:**
```
.quit
```

---

## Step 2: Create Pre-Assessment Questions

### File to modify
The questions are currently in `app/api/assessment/route.ts`

### For chapter-specific questions:
Create `app/api/assessment/[chapterId]/route.ts` (future enhancement)

### Question Format
```typescript
const CHAPTER_19_QUESTIONS = [
  {
    id: 'q1',
    question: '[Question from textbook]',
    options: ['Option A', 'Option B', 'Option C', 'Option D'],
    correctAnswer: 'A',  // A, B, C, or D
    difficulty: 'easy'   // easy, medium, hard
  },
  // Add 4-5 questions
];
```

**Tips:**
- Use textbook terminology
- Cover main concepts
- Mix difficulty levels
- Reference textbook examples

---

## Step 3: Create Explanation Content

### Navigate to
`app/chapter/[id]/explanation/page.tsx`

### For new chapter, copy the pattern:

```typescript
const LIGHT_CONCEPTS = [
  {
    id: 1,
    title: '[Concept Title from Textbook]',
    emoji: '💡',  // Choose relevant emoji
    color: 'from-yellow-400 to-orange-500',  // Unique gradient
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    content: '[EXACT text from textbook]',
    examples: [
      { icon: '🔦', text: 'Torch light' },
      { icon: '🌞', text: 'Sunlight' },
      // Add 3-4 examples
    ],
    keyPoints: [
      '[Key point 1 from textbook]',
      '[Key point 2]',
      // Add 3-5 key points
    ],
    funFact: '[Interesting fact from textbook]',
    textbookRef: 'Pages XX-XX: Section Name'
  },
  // Add 4-5 concepts
];
```

**Color Themes to Use:**
- Concept 1: Blue (from-blue-400 to-cyan-500)
- Concept 2: Purple (from-purple-400 to-pink-500)
- Concept 3: Green (from-green-400 to-emerald-500)
- Concept 4: Orange (from-orange-400 to-red-500)
- Concept 5: Indigo (from-indigo-400 to-purple-500)

---

## Step 4: Update AI System Prompt

### File
`lib/ai/gemini.ts` → `generateTutorPrompt()`

### Add chapter-specific concepts

```typescript
Key Concepts to Cover (${topic}):
${topic === 'Light' ? `
- Light travels in straight lines
- Reflection and laws of reflection
- Types of reflection (regular, diffuse)
- Mirrors (plane, concave, convex)
- Refraction and Snell's law
` : topic === 'Sound' ? `
- Sound is produced by vibrations
- Oscillatory motion, frequency, time period
// ... existing Sound concepts
` : ''}
```

**Or:** Make it dynamic by fetching from database

---

## Step 5: Create Test Questions

### File
`app/chapter/[id]/test/page.tsx`

### Based on textbook Exercise

```typescript
const CHAPTER_19_TEST_QUESTIONS = [
  {
    id: 'q1',
    question: '[Fill in blank question from exercise]',
    options: ['Answer', 'Wrong 1', 'Wrong 2', 'Wrong 3'],
    correctAnswer: 'A',
    explanation: '[From textbook]'
  },
  // Add 8-10 questions from exercise
];
```

**Question Sources:**
1. Fill in the blanks (convert to MCQ)
2. Match the pairs (convert to MCQ)
3. Give scientific reasons (MCQ)
4. Answer questions (MCQ)

**Also update:** `test/results/page.tsx` with same questions

---

## Step 6: Update Chat Context

### Optional: Chapter-Specific Examples

In `app/api/chat/route.ts`, you can add chapter-specific context:

```typescript
const chapterContext = chapterId === 1 ? 
  'Sound chapter context...' :
  chapterId === 2 ?
  'Light chapter context...' :
  '';
```

**Or:** Fetch concepts from database dynamically

---

## Step 7: Test New Chapter

### Testing Checklist

**Dashboard:**
- [ ] New chapter appears in Science section
- [ ] Shows "Start" button
- [ ] Click redirects to chapter page

**Chapter Page:**
- [ ] Shows 5 stages
- [ ] All stages initially locked except stage 1
- [ ] Progress bar shows 0%

**Stage 1: Pre-Assessment**
- [ ] 5 questions load
- [ ] Can answer all questions
- [ ] Submit works
- [ ] Results page shows score
- [ ] "Continue to Explanation" works
- [ ] Stage 2 unlocks

**Stage 2: Explanation**
- [ ] 5 concepts display
- [ ] Textbook content is accurate
- [ ] Examples relevant
- [ ] Can navigate between concepts
- [ ] Completion unlocks stage 3

**Stage 3: Chat**
- [ ] Can send messages
- [ ] AI responds with chapter-relevant answers
- [ ] Voice works (if enabled)
- [ ] After 5+ messages, can end session
- [ ] Stage 4 unlocks

**Stage 4: Test**
- [ ] 10 questions from textbook exercise
- [ ] Can answer all
- [ ] Submit works
- [ ] Results show correct/wrong
- [ ] Explanations display
- [ ] Stage 5 unlocks or chapter completes

---

## 🎨 Styling Consistency

### Follow existing patterns:

**Headers:**
```typescript
<h1 className="text-3xl font-bold text-gray-900 mb-2">
  Chapter {chapter_number}: {chapter_name}
</h1>
```

**Stage Indicator:**
```typescript
<span className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
  Stage X of 5
</span>
```

**Progress Bar:**
```typescript
<div className="w-full bg-gray-200 rounded-full h-2">
  <div 
    className="bg-indigo-600 h-2 rounded-full transition-all"
    style={{ width: `${progress}%` }}
  ></div>
</div>
```

**Buttons:**
```typescript
// Primary action
<button className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
  Next
</button>

// Secondary action
<button className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
  Previous
</button>
```

---

## 📝 Content Guidelines

### Explanation Stage

**Structure for each concept:**
1. **Textbook Definition** - Exact wording
2. **Real-Life Examples** - 3-4 relatable examples
3. **Key Points** - 4-5 bullet points
4. **Fun Fact** - From textbook or related

**Text Content:**
- Use EXACT textbook terminology
- Reference page numbers
- Include formulas as written in book
- Maintain textbook sequence

### Assessment Questions

**Quality Criteria:**
- Directly from textbook exercises
- Clear, unambiguous
- Age-appropriate language
- Mix of difficulty levels

**Avoid:**
- Trick questions
- Ambiguous wording
- Content not in textbook

---

## 🔄 Quick Add Checklist

When adding a new chapter, complete these in order:

### Database Setup
- [ ] Add chapter to curriculum table
- [ ] Note the chapter ID
- [ ] Set is_active = 1 to enable

### Content Creation
- [ ] Create 5 pre-assessment questions
- [ ] Write 5 explanation concepts
- [ ] Create 10 test questions from exercise
- [ ] Add textbook page references

### Code Updates
- [ ] Update assessment questions (if needed)
- [ ] Update explanation concepts
- [ ] Update test questions
- [ ] Update AI prompt with chapter concepts

### Testing
- [ ] Test all 4 stages end-to-end
- [ ] Verify progress saves correctly
- [ ] Check voice works in chat
- [ ] Ensure navigation works

---

## 🚀 Example: Adding Chapter 19 - Light

### 1. Database
```sql
INSERT INTO curriculum (subject, chapter_number, chapter_name, description, is_active)
VALUES ('Science', 19, 'Light', 'Reflection and Refraction', 1);
-- Returns ID: 2
```

### 2. Pre-Assessment Questions (app/api/assessment/route.ts)

```typescript
const fallbackQuestions: Question[] = 
  chapterId === 2 ? LIGHT_QUESTIONS : SOUND_QUESTIONS;

const LIGHT_QUESTIONS = [
  {
    id: 'q1',
    question: 'Light travels in _____ lines.',
    options: ['straight', 'curved', 'zigzag', 'circular'],
    correctAnswer: 'A',
    difficulty: 'easy'
  },
  // Add 4 more
];
```

### 3. Explanation Content

```typescript
const LIGHT_CONCEPTS = [
  {
    id: 1,
    title: 'Nature of Light',
    emoji: '💡',
    color: 'from-yellow-400 to-orange-500',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    content: 'Light is a form of energy that enables us to see objects. It travels in straight lines.',
    examples: [
      { icon: '🔦', text: 'Torch creating beam' },
      { icon: '🌞', text: 'Sunlight rays' }
    ],
    keyPoints: [
      'Light is a form of energy',
      'Travels in straight lines',
      'Reflects off surfaces'
    ],
    funFact: '💡 Light travels at 3 lakh km/second!',
    textbookRef: 'Page XX: Nature of Light'
  },
  // Add 4 more concepts
];
```

### 4. Test Questions

```typescript
const CHAPTER_19_TEST_QUESTIONS = [
  {
    id: 'q1',
    question: 'The phenomenon of light bouncing back is called _____.',
    options: ['Reflection', 'Refraction', 'Diffraction', 'Absorption'],
    correctAnswer: 'A',
    explanation: 'Reflection is when light bounces back from a surface.'
  },
  // Add 9 more from exercise
];
```

### 5. Update Dashboard

No code change needed! New chapter auto-appears from curriculum table.

### 6. Test

Visit `/chapter/2` and complete all stages.

---

## 💡 AI Assistant Instructions

**If you're an AI adding a new chapter, follow this exact sequence:**

1. Ask human for:
   - Chapter number
   - Chapter name
   - Textbook content (pages)
   - Exercise questions

2. Add to curriculum:
   ```sql
   INSERT INTO curriculum VALUES (...);
   ```

3. Create pre-assessment questions (5)

4. Create explanation concepts (5):
   - Use EXACT textbook wording
   - Add page references
   - Include examples
   - Make child-friendly

5. Create test questions (10):
   - From textbook exercise
   - Convert to MCQ format
   - Add explanations

6. Test complete flow

7. Document what you added

---

## 🎨 Design Consistency

### Maintain Visual Style

**Each stage has:**
- Distinct color theme
- Animated emojis
- Progress indicators
- Clear navigation
- Stage indicator badge

**Reuse components:**
- Don't reinvent quiz UI
- Copy progress tracking
- Use same spacing/padding
- Match button styles

---

## 📊 Quality Checklist

Before marking chapter complete:

### Content Quality
- [ ] Textbook content word-for-word accurate
- [ ] Page numbers referenced
- [ ] Examples relevant to India/Mumbai
- [ ] Language appropriate for 7th graders
- [ ] Formulas/definitions match textbook

### Technical Quality
- [ ] All TypeScript types defined
- [ ] No console errors
- [ ] Progress saves correctly
- [ ] All stages navigate properly
- [ ] Database queries optimized

### User Experience
- [ ] Colors high contrast
- [ ] Buttons clearly labeled
- [ ] Loading states shown
- [ ] Error messages helpful
- [ ] Voice works (if applicable)

---

## 🔧 Customization Options

### Per-Chapter Variations

**You can customize:**
- Number of pre-assessment questions (5-10)
- Number of explanation concepts (3-7)
- Number of test questions (8-12)
- Color themes
- Emojis and icons
- Examples and analogies

**Keep consistent:**
- Overall 5-stage structure
- Progress tracking mechanism
- Database schema
- API patterns

---

## 📖 Example: Complete Chapter Addition

### Scenario: Adding Chapter 20 - Heat

#### Step 1: Database
```sql
INSERT INTO curriculum (subject, chapter_number, chapter_name, description, is_active)
VALUES ('Science', 20, 'Heat', 'Temperature and Heat Transfer', 1);
-- ID: 3
```

#### Step 2: Pre-Assessment (Partial)
```typescript
{
  id: 'q1',
  question: 'Temperature is measured using a _____.',
  options: ['Thermometer', 'Barometer', 'Speedometer', 'Ammeter'],
  correctAnswer: 'A',
  difficulty: 'easy'
},
{
  id: 'q2',
  question: 'Heat always flows from _____ to _____ body.',
  options: ['Hot to cold', 'Cold to hot', 'Small to large', 'Large to small'],
  correctAnswer: 'A',
  difficulty: 'easy'
}
// ... 3 more
```

#### Step 3: Explanation Concepts (Partial)
```typescript
{
  id: 1,
  title: 'What is Heat?',
  emoji: '🔥',
  color: 'from-red-400 to-orange-500',
  bgColor: 'bg-red-50',
  borderColor: 'border-red-300',
  content: 'Heat is a form of energy that flows from a hot body to a cold body.',
  examples: [
    { icon: '☕', text: 'Hot tea cooling down' },
    { icon: '🧊', text: 'Ice melting in sun' }
  ],
  keyPoints: [
    'Heat is energy in transfer',
    'Flows from hot to cold',
    'Measured in joules or calories'
  ],
  funFact: '🌡️ Absolute zero is -273.15°C!',
  textbookRef: 'Page XX: Nature of Heat'
}
// ... 4 more concepts
```

#### Step 4: Test Questions (Partial)
```typescript
{
  id: 'q1',
  question: 'The SI unit of heat is _____.',
  options: ['Joule', 'Calorie', 'Celsius', 'Kelvin'],
  correctAnswer: 'A',
  explanation: 'Heat is measured in joules (J) in SI units.'
}
// ... 9 more from textbook exercise
```

#### Step 5: Test All Stages

Visit `http://localhost:3000/chapter/3` and complete journey.

---

## 🎯 Mathematics Chapters

**Same process, different content:**

### Example: Rational Numbers

#### Explanation Concepts
```typescript
{
  id: 1,
  title: 'What are Rational Numbers?',
  emoji: '🔢',
  color: 'from-blue-400 to-purple-500',
  content: 'A rational number is a number that can be expressed as p/q where p and q are integers and q ≠ 0.',
  examples: [
    { icon: '½', text: '1/2' },
    { icon: '¾', text: '3/4' }
  ],
  keyPoints: [
    'Form: p/q where q ≠ 0',
    'Includes integers',
    'Can be positive or negative'
  ]
}
```

#### Pre-Assessment
```typescript
{
  id: 'q1',
  question: 'Which of these is a rational number?',
  options: ['√2', '2/3', 'π', '√5'],
  correctAnswer: 'B',
  difficulty: 'easy'
}
```

---

## 🤖 AI System Prompt Guidelines

### When updating prompts for new chapters:

**Include:**
1. Subject and chapter name
2. Key concepts (4-6 main topics)
3. Important formulas or definitions
4. Common student misconceptions
5. Textbook page references

**Teaching approach:**
- Simple, age-appropriate language
- Indian context examples
- Interactive, not lecture-style
- Socratic method (ask questions)
- Encourage reasoning

**Example for Light:**
```typescript
`Key Concepts to Cover (Light Chapter):
- Light travels in straight lines
- Reflection: angle of incidence = angle of reflection
- Real and virtual images
- Plane mirror properties
- Curved mirrors and their uses
- Refraction and bending of light

Remember to use examples like:
- Looking in mirror
- Periscope in submarines
- Dentist's mirror
- Streetlight reflectors`
```

---

## 📚 Content Sources

### Always use:
1. **Official Maharashtra Board Textbook**
2. **Exercise questions from end of chapter**
3. **Diagrams/illustrations descriptions**
4. **Do you know? boxes**

### Maintain accuracy:
- Don't paraphrase - use exact terminology
- Keep formulas exactly as written
- Reference page numbers
- Match sequence of concepts

---

## 🚀 Future Enhancements

### Easy to Add:
- More pre-assessment questions
- More explanation concepts
- Interactive diagrams
- Practice problems

### Medium Complexity:
- Different voice per subject
- Animations for concepts
- Video integration
- Parent dashboard

### Advanced:
- Handwriting recognition
- Diagram drawing
- Multi-language support
- Adaptive difficulty

---

## 📞 Support

**If you get stuck:**
1. Check DEVELOPER_GUIDE.md for patterns
2. Look at Sound chapter as reference
3. Check database schema
4. Review API patterns
5. Test incrementally

**Common mistakes:**
- Forgetting to await params
- Not adding to curriculum table
- Mixing up chapter IDs
- Incorrect question IDs

---

## ✅ Final Checklist

Before considering chapter complete:

- [ ] Added to curriculum database
- [ ] 5 pre-assessment questions created
- [ ] 5 explanation concepts written
- [ ] 10 test questions from exercise
- [ ] All content textbook-accurate
- [ ] Tested all 4 stages
- [ ] Progress saves correctly
- [ ] Voice works in chat
- [ ] No console errors
- [ ] Documented what was added

---

**You're ready to add new chapters! Use Sound (Chapter 18) as your reference implementation.**

*Template Version: 1.0*
*Last Updated: December 2, 2024*
