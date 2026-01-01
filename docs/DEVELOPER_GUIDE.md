# AI Tutor - Developer Guide

## 🎯 Purpose

This guide helps developers (human or AI) understand the codebase and add new chapters or features.

---

## 📚 Code Architecture

### Frontend Structure

```
app/
├── (auth)/              # Authentication pages
│   ├── login/
│   ├── register/
│   └── forgot-password/ (future)
├── dashboard/           # Main hub
├── chapter/[id]/        # Dynamic chapter routes
│   ├── page.tsx        # Progress overview
│   ├── pre-assessment/ # Stage 1
│   ├── explanation/    # Stage 2
│   ├── chat/           # Stage 3
│   ├── test/           # Stage 4
│   └── revision/       # Stage 5 (future)
└── api/                # Backend routes
```

### Backend Structure

```
app/api/
├── auth/               # Authentication
│   ├── register/
│   └── login/
├── chapter/[id]/       # Chapter operations
│   ├── route.ts       # GET chapter details
│   └── progress/      # POST stage completion
├── chat/              # AI conversations
│   ├── route.ts       # POST message
│   └── session/       # Session management
├── curriculum/        # GET all subjects/chapters
├── assessment/        # Quiz operations
└── tts/              # Text-to-speech
```

### Shared Libraries

```
lib/
├── ai/
│   ├── gemini.ts         # Gemini AI integration
│   └── gemini-audio.ts   # Audio experiments
├── db/
│   ├── connection.ts     # SQLite connection
│   ├── init.ts          # DB initialization
│   ├── queries.ts       # Legacy queries
│   ├── auth-queries.ts  # Auth queries
│   └── schema files
└── types.ts             # TypeScript interfaces
```

---

## 🗄️ Database Schema Explained

### Core Tables

#### users
```sql
id              INTEGER PRIMARY KEY
username        TEXT UNIQUE NOT NULL
email           TEXT UNIQUE NOT NULL
password_hash   TEXT NOT NULL
name            TEXT NOT NULL
grade           INTEGER DEFAULT 7
board           TEXT DEFAULT 'Maharashtra'
created_at      DATETIME
last_login      DATETIME
```

**Purpose:** Store user accounts
**Key Fields:** 
- username: Login identifier
- password_hash: bcrypt hashed password
- grade: Student's current grade (7)

#### curriculum
```sql
id              INTEGER PRIMARY KEY
subject         TEXT NOT NULL
chapter_number  INTEGER NOT NULL
chapter_name    TEXT NOT NULL
description     TEXT
is_active       INTEGER DEFAULT 1
```

**Purpose:** Define available subjects and chapters
**is_active:** 1 = available to students, 0 = coming soon

**Example Rows:**
```sql
(1, 'Science', 18, 'Sound', 'Production, Propagation, Pitch', 1)
(2, 'Science', 19, 'Light', 'Reflection and Refraction', 0)
```

#### progress
```sql
id                INTEGER PRIMARY KEY
user_id           INTEGER
subject           TEXT
chapter           TEXT
status            TEXT (not_started|in_progress|completed)
mastery_level     REAL (score percentage)
current_stage     INTEGER (1-5)
stages_completed  TEXT (JSON array [1,2,3])
last_practiced    DATETIME
```

**Purpose:** Track learning progress
**Key Logic:**
- current_stage: Which stage student is on
- stages_completed: JSON array of completed stages
- Auto-updates when stage completes

#### sessions
```sql
id          INTEGER PRIMARY KEY
user_id     INTEGER
subject     TEXT
chapter     TEXT
start_time  DATETIME
end_time    DATETIME
```

**Purpose:** Track chat sessions
**One session per chat stage**

#### messages
```sql
id          INTEGER PRIMARY KEY
session_id  INTEGER
role        TEXT (user|assistant)
content     TEXT
timestamp   DATETIME
```

**Purpose:** Store chat history
**Used for:** Context in future messages, learning analytics

#### assessments
```sql
id          INTEGER PRIMARY KEY
user_id     INTEGER
subject     TEXT
chapter     TEXT
questions   TEXT (JSON)
answers     TEXT (JSON)
score       REAL
total       INTEGER
timestamp   DATETIME
```

**Purpose:** Store quiz results
**questions/answers:** JSON stringified arrays

---

## 🔌 API Patterns

### GET Pattern (Fetch Data)

```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // MUST be Promise in Next.js 16
) {
  try {
    const resolvedParams = await params;  // MUST await
    const id = parseInt(resolvedParams.id);
    
    // Fetch from database
    const stmt = db.prepare('SELECT * FROM table WHERE id = ?');
    const data = stmt.get(id);
    
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

### POST Pattern (Save Data)

```typescript
export async function POST(request: NextRequest) {
  try {
    const { field1, field2 } = await request.json();
    
    // Validate
    if (!field1 || !field2) {
      return NextResponse.json(
        { error: 'Missing fields' },
        { status: 400 }
      );
    }
    
    // Insert to database
    const stmt = db.prepare('INSERT INTO table (col1, col2) VALUES (?, ?)');
    const result = stmt.run(field1, field2);
    
    return NextResponse.json({ 
      success: true,
      id: result.lastInsertRowid 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
```

---

## 🎨 Component Patterns

### Protected Page Component

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProtectedPage() {
  const router = useRouter();
  
  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    if (!userId) {
      router.push('/login');
      return;
    }
    // Load page data...
  }, [router]);
  
  return (
    // Page content
  );
}
```

### Quiz Component Pattern

```typescript
const [currentQuestion, setCurrentQuestion] = useState(0);
const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

const handleAnswer = (questionId: string, answer: string) => {
  setSelectedAnswers(prev => ({
    ...prev,
    [questionId]: answer
  }));
};

const handleSubmit = async () => {
  // Calculate score
  let correct = 0;
  questions.forEach(q => {
    if (selectedAnswers[q.id] === q.correctAnswer) correct++;
  });
  const score = (correct / questions.length) * 100;
  
  // Save to database via API
  // Navigate to results
};
```

### Stage Completion Pattern

```typescript
const completeStage = async (stageNumber: number, score: number) => {
  const userId = sessionStorage.getItem('userId');
  
  await fetch(`/api/chapter/${chapterId}/progress`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: parseInt(userId || '0'),
      stageCompleted: stageNumber,
      score
    })
  });
  
  // Navigate to next stage or chapter overview
};
```

---

## 🤖 AI Integration

### Gemini Setup

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });
```

### System Prompt Template

```typescript
`You are an AI tutor for a 7th grade student from Maharashtra State Board.

Student Profile:
- Name: ${studentName}
- Topic: ${topic}
- Knowledge Level: ${level}

Teaching Guidelines:
1. Simple language for 7th graders
2. Use Indian/Mumbai context examples
3. Reference textbook concepts
4. Interactive, conversational tone

Key Concepts:
[List main concepts from chapter]

Previous Conversation:
${conversationHistory}

Remember: Guide, don't give direct answers.`
```

### Context Management

**Strategy:** Sliding window
- Keep full history in database
- Send only last 10 messages to AI
- Include system prompt each time

**Token Budget:**
- System Prompt: ~2000 tokens
- History (10 messages): ~3000 tokens
- User Query: ~500 tokens
- Response: ~2000 tokens
- **Total: ~7500 tokens** (well within 30k limit)

---

## 🔊 Voice Integration

### ElevenLabs TTS

**API Route:** `app/api/tts/route.ts`

```typescript
const elevenlabs = new ElevenLabsClient({
  apiKey: process.env.ELEVEN_LABS_KEY
});

const audio = await elevenlabs.textToSpeech.convert(
  'pNInz6obpgDQGcFmaJgB',  // Voice ID (Adam)
  {
    text: messageText,
    modelId: 'eleven_multilingual_v2',
    voiceSettings: {
      stability: 0.5,
      similarityBoost: 0.75,
      useSpeakerBoost: true
    }
  }
);
```

### Frontend Audio Playback

```typescript
const speakText = async (text: string) => {
  const response = await fetch('/api/tts', {
    method: 'POST',
    body: JSON.stringify({ text })
  });
  
  const audioBlob = await response.blob();
  const audioUrl = URL.createObjectURL(audioBlob);
  
  const audio = new Audio(audioUrl);
  audio.play();
};
```

---

## 📊 Progress Tracking Logic

### Stage Completion Flow

1. Student completes a stage (e.g., pre-assessment)
2. Frontend calls progress API
3. Backend:
   - Gets current progress from DB
   - Parses stages_completed JSON
   - Adds new stage to array
   - Calculates next current_stage
   - Updates database
4. Returns new progress state
5. Frontend reloads chapter page
6. Shows updated stage status

### Stage Status Logic

```typescript
const getStageStatus = (stageId: number) => {
  if (completedStages.includes(stageId)) return 'completed';
  if (stageId === currentStage) return 'current';
  if (stageId < currentStage) return 'available';
  return 'locked';
};
```

**Rules:**
- Completed stages: Show ✅
- Current stage: Highlighted, clickable
- Future stages: Locked 🔒

---

## 🎨 UI/UX Guidelines

### Color Scheme

**Primary:** Indigo-600 (main actions, branding)
**Success:** Green-600 (completions, correct answers)
**Warning:** Orange-600 (tests, important items)
**Danger:** Red-600 (errors, wrong answers)

### Text Contrast

**Always use:**
- Headings: text-gray-900
- Body: text-gray-800
- Secondary: text-gray-700
- Placeholders: text-gray-500 or text-gray-600

**Never use on light backgrounds:**
- text-gray-400 or lighter (poor contrast)

### Component Spacing

**Standard padding:**
- Cards: p-8
- Sections: p-6
- Small items: p-4

**Spacing between elements:**
- Large gaps: space-y-6
- Medium: space-y-4
- Small: space-y-2

### Stage-Specific Colors

1. Pre-Assessment: Indigo theme
2. Explanation: Multi-color (blue, purple, green, orange, indigo)
3. Chat: Indigo theme
4. Test: Orange theme
5. Revision: Purple theme (planned)

---

## 🔐 Security Best Practices

### Password Handling

```typescript
import bcrypt from 'bcryptjs';

// Hashing
const hash = bcrypt.hashSync(password, 10);

// Verification
const isValid = bcrypt.compareSync(password, hash);
```

### SQL Injection Protection

**Always use prepared statements:**
```typescript
// GOOD
const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
stmt.get(username);

// BAD - vulnerable to injection
db.exec(`SELECT * FROM users WHERE username = '${username}'`);
```

### Session Management

**Store minimal data in sessionStorage:**
- userId
- username
- name

**Never store:**
- Password
- Sensitive personal data
- API keys

---

## 🚀 Performance Optimization

### Database
- WAL mode enabled for better concurrency
- Prepared statements (compiled once, reused)
- Indexes on frequently queried fields

### Frontend
- Lazy loading for long message history
- Auto-scroll optimization
- Debounce user input
- Cancel pending requests

### AI API
- Context window management (last 10 messages)
- Fallback responses for errors
- Retry logic with exponential backoff

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot read properties of null"
**Cause:** Accessing DOM element before it exists
**Fix:** Add null checks, use optional chaining

### Issue: "params is a Promise"
**Cause:** Next.js 16 change
**Fix:** Always await params in dynamic routes

### Issue: "Database locked"
**Cause:** Concurrent writes
**Fix:** WAL mode enabled, use transactions

### Issue: "Gemini API 403 Forbidden"
**Cause:** Model name wrong or API key invalid
**Fix:** Use current model name (gemini-2.0-flash-lite)

### Issue: Progress not saving
**Cause:** userId not sent to API
**Fix:** Include userId in headers or body

---

## 📝 Code Style Guide

### TypeScript

**Always type function params:**
```typescript
function createUser(name: string, email: string): number {
  // Implementation
}
```

**Use interfaces for objects:**
```typescript
interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}
```

### React Components

**Use functional components:**
```typescript
export default function ComponentName() {
  // Hooks
  // Functions
  // Return JSX
}
```

**State naming:**
```typescript
const [data, setData] = useState();  // data, not datas
const [isLoading, setIsLoading] = useState(false);  // is/has prefix for booleans
```

### Database Queries

**Naming convention:**
```typescript
createUser()    // INSERT
getUser()       // SELECT single
getAllUsers()   // SELECT multiple
updateUser()    // UPDATE
deleteUser()    // DELETE
```

---

## 🧪 Testing Strategy

### Manual Testing Checklist

**Authentication:**
- [ ] Register new user
- [ ] Login with correct credentials
- [ ] Login with wrong credentials (should fail)
- [ ] Logout
- [ ] Try accessing protected page when logged out

**Learning Flow:**
- [ ] Complete pre-assessment
- [ ] See explanation unlock
- [ ] Complete explanation
- [ ] See chat unlock
- [ ] Complete chat (5+ messages)
- [ ] See test unlock
- [ ] Complete test
- [ ] See results with correct/wrong answers

**Progress Persistence:**
- [ ] Complete a stage
- [ ] Close browser
- [ ] Reopen and login
- [ ] Verify stage still marked complete

**Voice:**
- [ ] Toggle voice ON
- [ ] Ask question
- [ ] Hear AI response
- [ ] Toggle voice OFF
- [ ] Ask question
- [ ] Verify no audio plays

---

## 📦 Dependencies

### Production Dependencies
```json
{
  "next": "^16.0.5",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "better-sqlite3": "^12.4.6",
  "@google/generative-ai": "latest",
  "@elevenlabs/elevenlabs-js": "latest",
  "bcryptjs": "^2.4.3"
}
```

### Dev Dependencies
```json
{
  "typescript": "^5.x",
  "@types/node": "^20.x",
  "@types/react": "^19.x",
  "@types/better-sqlite3": "latest",
  "@types/bcryptjs": "^2.4.x",
  "tailwindcss": "^3.x",
  "eslint": "^9.x"
}
```

---

## 🔄 State Management

### Session Storage

**Used for:**
- userId (persist across page navigation)
- username, name (display purposes)

**Why sessionStorage, not localStorage:**
- Auto-clears on browser close
- More secure (temporary)

### React State

**Per-component state:**
- Form inputs
- Loading states
- UI toggles

**Fetched data:**
- Messages
- Chapter details
- Progress

**No global state management** (Redux, Zustand) - not needed for current scale

---

## 🌐 Routing

### Static Routes
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration
- `/dashboard` - Main dashboard

### Dynamic Routes
- `/chapter/[id]` - Chapter overview
- `/chapter/[id]/pre-assessment` - Stage 1
- `/chapter/[id]/explanation` - Stage 2
- `/chapter/[id]/chat` - Stage 3
- `/chapter/[id]/test` - Stage 4

**Important:** [id] must match curriculum.id from database

---

## 📚 Adding New Content

See `CHAPTER_TEMPLATE.md` for step-by-step guide to add new chapters.

**Quick version:**
1. Add to curriculum table
2. Create content arrays (questions, concepts)
3. Reference textbook pages
4. Test all 5 stages
5. Update AI system prompt

---

## 🔍 Debugging Tips

### Check Database
```bash
cd ai-tutor
sqlite3 database.db
.tables
SELECT * FROM progress;
.quit
```

### Check API Logs
Look at terminal running `npm run dev` for server-side errors

### Check Browser Console
F12 → Console tab for client-side errors

### Common Debug Points
1. Is userId in sessionStorage?
2. Is progress API returning data?
3. Is Gemini API key valid?
4. Are params being awaited?

---

## 📖 Resources

### Official Docs
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- TailwindCSS: https://tailwindcss.com
- Gemini API: https://ai.google.dev
- ElevenLabs: https://elevenlabs.io/docs

### Our Textbook
- Maharashtra Board 7th Grade Science
- Chapter 18: Sound (Pages 118-125)

---

*For adding new chapters, see CHAPTER_TEMPLATE.md*
*For API reference, see API_REFERENCE.md*
