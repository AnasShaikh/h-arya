# AI Tutor - API Reference

Complete reference for all backend API endpoints.

---

## 🔐 Authentication APIs

### POST /api/auth/register

Create a new user account.

**Request Body:**
```json
{
  "name": "Anas Shaikh",
  "username": "anas123",
  "email": "anas@example.com",
  "password": "securepass123"
}
```

**Response (Success 200):**
```json
{
  "success": true,
  "userId": 1,
  "message": "Account created successfully"
}
```

**Response (Error 400):**
```json
{
  "error": "Username already taken"
}
```

**Validation:**
- All fields required
- Password min 6 characters
- Username must be unique
- Email must be unique

---

### POST /api/auth/login

Login to existing account.

**Request Body:**
```json
{
  "username": "anas123",
  "password": "securepass123"
}
```

**Response (Success 200):**
```json
{
  "success": true,
  "userId": 1,
  "username": "anas123",
  "name": "Anas Shaikh",
  "email": "anas@example.com",
  "grade": 7,
  "message": "Login successful"
}
```

**Response (Error 401):**
```json
{
  "error": "Invalid username or password"
}
```

---

## 📚 Curriculum APIs

### GET /api/curriculum

Get all subjects and chapters.

**Request:** None

**Response (200):**
```json
{
  "chapters": [
    {
      "id": 1,
      "subject": "Science",
      "chapter_number": 18,
      "chapter_name": "Sound",
      "description": "Production, Propagation, Pitch, Intensity",
      "is_active": 1
    },
    {
      "id": 2,
      "subject": "Science",
      "chapter_number": 19,
      "chapter_name": "Light",
      "description": "Reflection and Refraction",
      "is_active": 0
    }
  ]
}
```

---

## 📖 Chapter APIs

### GET /api/chapter/[id]

Get chapter details and user's progress.

**URL Parameter:**
- `id` - Chapter ID from curriculum table

**Headers:**
- `x-user-id` - User ID (optional, for progress)

**Response (200):**
```json
{
  "chapter": {
    "id": 1,
    "subject": "Science",
    "chapter_number": 18,
    "chapter_name": "Sound",
    "description": "Production, Propagation, Pitch, Intensity"
  },
  "currentStage": 3,
  "completedStages": [1, 2]
}
```

**currentStage:** Which stage student is on (1-5)
**completedStages:** Array of completed stage numbers

---

### POST /api/chapter/[id]/progress

Mark a stage as complete.

**URL Parameter:**
- `id` - Chapter ID

**Request Body:**
```json
{
  "userId": 1,
  "stageCompleted": 1,
  "score": 80.0
}
```

**Response (200):**
```json
{
  "success": true,
  "currentStage": 2,
  "completedStages": [1],
  "message": "Stage 1 completed!"
}
```

**Logic:**
- Adds stage to completedStages array
- Updates current_stage to next incomplete
- Updates status (in_progress or completed)
- Saves score as mastery_level

---

## 📝 Assessment APIs

### GET /api/assessment

Get quiz questions.

**Request:** None

**Response (200):**
```json
{
  "questions": [
    {
      "id": "q1",
      "question": "How is sound produced?",
      "options": ["By vibration", "By light", "By heat", "By magnetic fields"],
      "correctAnswer": "A",
      "difficulty": "easy"
    }
  ]
}
```

**Notes:**
- Currently returns hardcoded Sound questions
- Falls back if AI generation fails
- 5 questions for pre-assessment
- 10 questions for test

---

### POST /api/assessment

Submit quiz answers and get score.

**Request Body:**
```json
{
  "studentId": 1,
  "answers": {
    "q1": "A",
    "q2": "B",
    "q3": "A",
    "q4": "C",
    "q5": "B"
  }
}
```

**Response (200):**
```json
{
  "score": 80,
  "correct": 4,
  "total": 5,
  "level": "Intermediate",
  "message": "Great job! You scored 80%"
}
```

**Scoring Logic:**
- Compares each answer to correctAnswer
- Calculates percentage
- Determines level:
  - >= 80%: Advanced
  - >= 60%: Intermediate
  - < 60%: Beginner

---

## 💬 Chat APIs

### POST /api/chat/session

Create a new chat session.

**Request Body:**
```json
{
  "userId": 1,
  "chapterId": 1,
  "subject": "Science",
  "chapter": "Sound"
}
```

**Response (200):**
```json
{
  "sessionId": 123,
  "message": "Session created successfully"
}
```

**Database:**
Creates row in sessions table with start_time

---

### POST /api/chat

Send message and get AI response.

**Request Body:**
```json
{
  "userId": 1,
  "sessionId": 123,
  "message": "What is frequency?",
  "conversationHistory": [
    {
      "role": "user",
      "content": "Hi"
    },
    {
      "role": "assistant",
      "content": "Hello! I'm here to help."
    }
  ]
}
```

**Response (200):**
```json
{
  "response": "Frequency is the number of oscillations per second, measured in Hertz (Hz)...",
  "messageId": 456,
  "sessionId": 123
}
```

**Process:**
1. Saves user message to database
2. Builds system prompt with chapter context
3. Sends last 10 messages + new message to Gemini
4. Gets AI response
5. Saves AI response to database
6. Returns response

**Context Management:**
- Only last 10 messages sent to AI
- Full history saved in database
- System prompt includes chapter concepts

---

### PATCH /api/chat/session/[id]

End a chat session.

**URL Parameter:**
- `id` - Session ID

**Request:** None

**Response (200):**
```json
{
  "success": true,
  "message": "Session ended successfully"
}
```

**Database:**
Sets end_time to CURRENT_TIMESTAMP

---

## 🔊 Voice API

### POST /api/tts

Convert text to speech using ElevenLabs.

**Request Body:**
```json
{
  "text": "Sound is produced by vibrations."
}
```

**Response:**
- **Content-Type:** audio/mpeg
- **Body:** Audio file (MP3 format)

**ElevenLabs Configuration:**
- Voice ID: pNInz6obpgDQGcFmaJgB (Adam)
- Model: eleven_multilingual_v2
- Stability: 0.5
- Similarity Boost: 0.75
- Speaker Boost: true

**Usage:**
```typescript
const response = await fetch('/api/tts', {
  method: 'POST',
  body: JSON.stringify({ text: 'Hello' })
});
const audioBlob = await response.blob();
const audio = new Audio(URL.createObjectURL(audioBlob));
audio.play();
```

---

## 🗄️ Database Query Reference

### Users

```typescript
// Create user
createUser(username, email, password, name): userId

// Get user
getUserByUsername(username): User | undefined
getUserByEmail(email): User | undefined
getUserById(id): User | undefined

// Verify password
verifyPassword(password, hash): boolean

// Update login
updateLastLogin(userId): void
```

### Progress

```typescript
// Get progress
getUserProgress(userId): Progress[]
getChapterProgress(userId, subject, chapter): Progress | undefined

// Update progress
updateChapterProgress(userId, subject, chapter, status, masteryLevel): void
```

### Sessions & Messages

```typescript
// Create session
createSession(userId, topic): sessionId

// Messages
createMessage(sessionId, role, content): messageId
getSessionMessages(sessionId): Message[]

// End session
endSession(sessionId): void
```

### Curriculum

```typescript
// Get subjects and chapters
getAllSubjects(): Subject[]
getChaptersBySubject(subject): Chapter[]
getChapterById(id): Chapter | undefined
```

---

## 🔄 Progress Tracking

### Database Structure

```sql
progress table:
- id
- user_id
- subject
- chapter
- status (not_started|in_progress|completed)
- mastery_level (score %)
- current_stage (1-5)
- stages_completed (JSON: [1,2,3])
- last_practiced
```

### Update Logic

**When stage completes:**

1. Get current progress
2. Parse stages_completed JSON
3. Add new stage to array
4. Calculate next current_stage
5. Update status if all 5 stages done
6. Save to database

**Example:**
```
Initial: current_stage=1, stages_completed=[]
Complete Stage 1: current_stage=2, stages_completed=[1]
Complete Stage 2: current_stage=3, stages_completed=[1,2]
Complete Stage 5: current_stage=5, stages_completed=[1,2,3,4,5], status=completed
```

---

## 🎨 Frontend Component Patterns

### Fetch Chapter Data

```typescript
const fetchChapterData = async () => {
  const userId = sessionStorage.getItem('userId');
  
  const response = await fetch(`/api/chapter/${chapterId}`, {
    headers: { 'x-user-id': userId || '' }
  });
  
  const data = await response.json();
  setChapter(data.chapter);
  setCurrentStage(data.currentStage);
  setCompletedStages(data.completedStages);
};
```

### Complete Stage

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
};
```

---

## 🔍 Error Handling

### Standard Error Response

```json
{
  "error": "Error message here"
}
```

### Common HTTP Status Codes

- **200** - Success
- **400** - Bad Request (validation failed)
- **401** - Unauthorized (invalid credentials)
- **404** - Not Found
- **500** - Internal Server Error

### Error Handling Pattern

```typescript
try {
  const response = await fetch('/api/endpoint');
  
  if (!response.ok) {
    throw new Error('API call failed');
  }
  
  const data = await response.json();
  // Use data
} catch (error) {
  console.error('Error:', error);
  alert('Something went wrong. Please try again.');
}
```

---

## 🔒 Security Considerations

### API Security

**Headers to include:**
- `Content-Type: application/json`
- `x-user-id` (for user-specific data)

**Validation:**
- Always validate input
- Check required fields
- Sanitize user input
- Use prepared SQL statements

**Session:**
- userId stored in sessionStorage
- Check on every protected route
- No sensitive data in browser storage

---

## 📊 Rate Limits

### External APIs

**Gemini API:**
- Free tier: 15 requests/minute
- Daily limit: Varies by model
- Fallback: Return error message

**ElevenLabs:**
- Free tier: 10,000 characters/month
- Paid: $5/month for 30,000 chars
- Fallback: Disable voice, text only

**Recommendations:**
- Cache common AI responses
- Implement request queuing
- Add rate limiting middleware

---

## 🧪 Testing APIs

### Using cURL

**Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","username":"test1","email":"test@test.com","password":"test123"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test1","password":"test123"}'
```

**Get Curriculum:**
```bash
curl http://localhost:3000/api/curriculum
```

**Get Chapter:**
```bash
curl http://localhost:3000/api/chapter/1 \
  -H "x-user-id: 1"
```

---

## 🎯 Next.js 16 Specific

### Dynamic Routes

**IMPORTANT:** In Next.js 16, params are async!

**Correct:**
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  // ...
}
```

**Incorrect (will error):**
```typescript
{ params }: { params: { id: string } }  // Wrong!
const id = params.id;  // Wrong!
```

---

## 📦 Response Formats

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "error": "Error description",
  "details": "Additional context (optional)"
}
```

### Pagination (Future)

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "pages": 5
  }
}
```

---

## 🔍 Database Access Patterns

### Read Pattern

```typescript
const stmt = db.prepare('SELECT * FROM table WHERE field = ?');
const result = stmt.get(value);  // Single row
const results = stmt.all(value);  // Multiple rows
```

### Write Pattern

```typescript
const stmt = db.prepare('INSERT INTO table (col1, col2) VALUES (?, ?)');
const result = stmt.run(value1, value2);
const insertedId = result.lastInsertRowid;
```

### Update Pattern

```typescript
const stmt = db.prepare('UPDATE table SET col = ? WHERE id = ?');
stmt.run(newValue, id);
```

---

## 🎨 Frontend API Integration

### Standard Fetch Pattern

```typescript
const response = await fetch('/api/endpoint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-user-id': userId
  },
  body: JSON.stringify({ data })
});

if (!response.ok) {
  throw new Error('API Error');
}

const result = await response.json();
```

### With Loading State

```typescript
const [isLoading, setIsLoading] = useState(false);

const callAPI = async () => {
  setIsLoading(true);
  try {
    const response = await fetch('/api/endpoint');
    const data = await response.json();
    // Handle data
  } catch (error) {
    console.error(error);
    alert('Error occurred');
  } finally {
    setIsLoading(false);
  }
};
```

---

## 🔧 Environment Variables

### Required

```env
GEMINI_API_KEY=your_gemini_api_key_here
ELEVEN_LABS_KEY=your_elevenlabs_key_here
```

### Optional

```env
NODE_ENV=development
DATABASE_PATH=./database.db
```

---

## 📊 API Flow Diagrams

### User Registration Flow
```
User fills form
    ↓
POST /api/auth/register
    ↓
Validate input
    ↓
Check username/email unique
    ↓
Hash password (bcrypt)
    ↓
INSERT INTO users
    ↓
Return userId
    ↓
Redirect to /login
```

### Chat Message Flow
```
User types message
    ↓
POST /api/chat
    ↓
Save user message to DB
    ↓
Build system prompt + context
    ↓
Call Gemini API (last 10 messages)
    ↓
Get AI response
    ↓
Save AI message to DB
    ↓
Return response
    ↓
Display in UI
    ↓
(If voice ON) → POST /api/tts → Play audio
```

### Stage Completion Flow
```
User completes stage
    ↓
POST /api/chapter/[id]/progress
    ↓
Get current progress from DB
    ↓
Parse stages_completed JSON
    ↓
Add new stage to array
    ↓
Calculate next current_stage
    ↓
UPDATE progress table
    ↓
Return new progress
    ↓
Frontend reloads chapter page
    ↓
UI shows updated stage status
```

---

## 🛠️ Debugging APIs

### Check if API is running

```bash
curl http://localhost:3000/api/curriculum
```

Should return JSON, not HTML

### Check database connection

```bash
cd ai-tutor
sqlite3 database.db "SELECT COUNT(*) FROM users;"
```

### Check server logs

Look at terminal running `npm run dev` for:
- API route compilation
- Database queries
- Error messages
- Request logs

---

## 📝 Adding New Endpoints

### Template

**File:** `app/api/new-endpoint/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db/connection';

export async function GET(request: NextRequest) {
  try {
    // Implementation
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Implementation
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed' },
      { status: 500 }
    );
  }
}
```

---

## 🎯 Best Practices

### DO:
✅ Always validate input
✅ Use prepared statements for SQL
✅ Return appropriate status codes
✅ Log errors with console.error
✅ Handle edge cases
✅ Add TypeScript types

### DON'T:
❌ Trust user input without validation
❌ Use string concatenation for SQL
❌ Return sensitive data (passwords, tokens)
❌ Leave console.logs in production
❌ Use any type unless necessary

---

**Complete API documentation for AI Tutor platform**

*Version: 1.0*
*Last Updated: December 2, 2024*
