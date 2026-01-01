# AI Tutor - Project Overview

## 🎓 What is This?

An interactive AI-powered tutoring application for 7th Grade Maharashtra State Board students. Currently teaches Science - Sound (Chapter 18) using a structured 5-stage learning approach.

## 🎯 Purpose

- Assess student's current knowledge
- Teach concepts using textbook-aligned content
- Provide interactive chat with AI tutor
- Test understanding
- Track progress and adapt teaching

## 🏗️ Tech Stack

### Frontend
- **Framework:** Next.js 16 (React 19)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **State:** React Hooks (useState, useEffect)

### Backend
- **Runtime:** Node.js 20.19.5
- **API Routes:** Next.js API Routes
- **Database:** SQLite (better-sqlite3)

### AI & Voice
- **AI Model:** Google Gemini 2.0-flash
- **Voice Output:** ElevenLabs TTS (natural voice)
- **Voice Input:** Gemini multimodal (speech-to-text)
- **Reading Practice:** Audio transcription and assessment

### Authentication
- **Method:** Custom (bcrypt password hashing)
- **Storage:** SQLite database
- **Session:** sessionStorage

## 📱 Features

### User Management
- Registration with username, email, password
- Secure login
- Dashboard showing subjects and chapters
- Progress tracking per chapter

### Learning System
- **5-Stage Approach:**
  1. Pre-Assessment - Gauge current knowledge
  2. Explanation - Teach concepts (with reading practice)
  3. Chat Session - Interactive Q&A
  4. Test - Assess understanding
  5. Revision - Review mistakes
- **Reading Practice:** Students read textbook definitions aloud, AI provides feedback

### Current Implementation
- **Subject:** Science (Physics)
- **Chapter:** Sound (Chapter 18)
- **Textbook:** Maharashtra Board 7th Grade
- **Stages:** ALL 5 COMPLETE (Pre-Assessment, Explanation, Chat, Test, Revision)

## 🗄️ Database Schema

### Tables
1. **users** - User accounts
2. **sessions** - Chat sessions
3. **messages** - Chat message history
4. **assessments** - Quiz results
5. **progress** - Learning progress and stage tracking
6. **curriculum** - Subjects and chapters
7. **password_reset_tokens** - Password recovery

## 🌐 Access

- **Local:** http://localhost:3000
- **Network:** http://192.168.0.100:3000

## 📁 Project Structure

```
ai-tutor/
├── app/                      # Next.js App Router
│   ├── api/                 # Backend API routes
│   ├── chapter/[id]/        # Dynamic chapter routes
│   ├── dashboard/           # Main dashboard
│   ├── login/               # Login page
│   └── register/            # Registration page
├── lib/                     # Shared libraries
│   ├── ai/                  # AI integrations
│   └── db/                  # Database functions
├── teaching-material/       # Textbook content
└── database.db              # SQLite database
```

## 🚀 Quick Start

```bash
cd ai-tutor
npm install
npm run dev
# Open http://localhost:3000
```

## 📊 Current Status

**Completed:**
- ✅ Authentication system
- ✅ Dashboard with curriculum
- ✅ Sound Chapter (ALL 5 stages!)
- ✅ Progress tracking with persistence
- ✅ AI chat with voice output (ElevenLabs TTS)
- ✅ Reading practice with voice input (Gemini transcription)
- ✅ Adaptive revision with retake cycle

**Pending:**
- ⏳ Additional chapters (Light, Heat, etc.)
- ⏳ Additional subjects (Mathematics)
- ⏳ Parent dashboard
- ⏳ Deployment to production

## 🎯 Target Audience

- **Students:** 7th Grade (Maharashtra Board)
- **Subject:** Science, Mathematics
- **Language:** English (with Hinglish support)
- **Location:** Mumbai, India

## 💡 Key Differentiators

1. **Textbook-aligned:** Uses exact Maharashtra Board content
2. **Multi-modal:** Text, voice input/output, interactive elements
3. **Adaptive:** Adjusts based on student performance
4. **Progressive:** 5-stage structured learning
5. **Voice-enabled:** Natural AI voice responses + reading practice with feedback
6. **Reading Assessment:** Helps students master textbook terminology for exams

---

*Created: November 2024 - December 2024*
*For: 7th Grade Maharashtra Board Students*
