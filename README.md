# AI Tutor - Maharashtra Board 7th Grade

An intelligent tutoring platform for 7th Grade students following the Maharashtra State Board curriculum.

## 🎓 What is This?

A web-based AI tutor that:
- **Assesses** student's current knowledge
- **Teaches** concepts using textbook-aligned content
- **Interacts** through AI-powered chat with voice
- **Tests** understanding
- **Tracks** progress automatically

## ✨ Features

### 🔐 User System
- Secure registration and login
- Individual progress tracking
- Personalized dashboard

### 📚 Learning Journey (5 Stages)
1. **Pre-Assessment** - Quick knowledge check (5 questions)
2. **Explanation** - Interactive concept learning
3. **Chat Session** - AI tutor Q&A with voice
4. **Test** - Comprehensive assessment (10 questions)
5. **Revision** - Adaptive review + retake until mastery

### 🎨 Student-Friendly Design
- Colorful, animated UI
- Large emojis and visual elements
- Clear progress indicators
- Real-life examples from India

### 🔊 Voice Integration
- Natural AI voice responses (ElevenLabs)
- Toggle voice ON/OFF
- Indian English accent

### 🤖 AI-Powered
- Google Gemini 2.0-flash-lite
- Context-aware conversations
- Textbook-aligned responses
- Adaptive teaching style

## 📖 Current Content

### Available Now:
- **Science - Chapter 18: Sound** ✅
  - Production and propagation
  - Oscillatory motion and frequency
  - Pitch and intensity
  - Types of sound (audible/infrasonic/ultrasonic)
  - SONAR and applications

### Coming Soon:
- Science - Chapter 19: Light
- Science - Chapter 20: Heat
- Mathematics chapters

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm

### Installation

```bash
# Clone or navigate to project
cd ai-tutor

# Install dependencies
npm install

# Start development server
npm run dev

# Open browser
# Visit: http://localhost:3000
```

### Environment Setup

Create `.env` file in ai-tutor directory:

```env
GEMINI_API_KEY=your_gemini_api_key
ELEVEN_LABS_KEY=your_elevenlabs_key
```

## 📱 How to Use

### For Students

1. **Register** - Create account with username and password
2. **Login** - Access your dashboard
3. **Select Chapter** - Choose from available topics
4. **Complete Journey:**
   - Take pre-assessment quiz
   - Learn concepts through explanations
   - Chat with AI tutor (ask questions!)
   - Take final test
   - Review mistakes
5. **Track Progress** - See which stages are complete

### For Teachers/Parents

- View curriculum structure
- Monitor which chapters are active
- Track student progress (future feature)

## 🏗️ Tech Stack

- **Framework:** Next.js 16 (React 19)
- **Language:** TypeScript
- **Styling:** TailwindCSS
- **Database:** SQLite
- **AI:** Google Gemini
- **Voice:** ElevenLabs TTS
- **Auth:** bcrypt

## 📁 Project Structure

```
ai-tutor/
├── app/                    # Next.js pages and API routes
│   ├── api/               # Backend APIs
│   ├── chapter/[id]/      # Chapter learning pages
│   ├── dashboard/         # Student dashboard
│   ├── login/             # Authentication
│   └── register/
├── lib/                   # Shared code
│   ├── ai/               # Gemini integration
│   └── db/               # Database functions
├── docs/                  # Documentation
├── teaching-material/     # Textbook content
└── database.db           # SQLite database
```

## 📚 Documentation

Comprehensive guides available in `docs/` folder:

- **[PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md)** - High-level overview
- **[DEVELOPMENT_LOG.md](docs/DEVELOPMENT_LOG.md)** - Complete build history
- **[DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)** - Code architecture and patterns
- **[CHAPTER_TEMPLATE.md](docs/CHAPTER_TEMPLATE.md)** - Add new chapters
- **[API_REFERENCE.md](docs/API_REFERENCE.md)** - All API endpoints

## 🎯 For Developers

### Adding New Chapters

See [CHAPTER_TEMPLATE.md](docs/CHAPTER_TEMPLATE.md) for step-by-step guide.

**Quick steps:**
1. Add chapter to curriculum database
2. Create pre-assessment questions (5)
3. Write explanation concepts (5)
4. Create test questions from textbook exercise (10)
5. Test all stages

### Code Guidelines

- Use TypeScript for type safety
- Follow existing component patterns
- Maintain textbook accuracy
- Test on all stages before deploying
- Document new features

See [DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) for details.

## 🗄️ Database

SQLite database with 8 tables:

- `users` - User accounts
- `curriculum` - Subjects and chapters
- `progress` - Learning progress (with 5-stage tracking)
- `sessions` - Chat sessions
- `messages` - Chat history
- `assessments` - Quiz results
- `password_reset_tokens` - Password recovery

**Schema files:**
- `lib/db/schema.sql` (legacy)
- `lib/db/auth-schema.sql` (current)

## 🔑 API Keys Required

### Google Gemini API
1. Go to https://ai.google.dev
2. Create API key
3. Add to `.env` as `GEMINI_API_KEY`

### ElevenLabs (Optional - for voice)
1. Sign up at https://elevenlabs.io
2. Get API key
3. Add to `.env` as `ELEVEN_LABS_KEY`
4. Free tier: 10,000 chars/month

## 🧪 Testing

### Manual Test Flow

1. Register new account
2. Login
3. Go to Dashboard
4. Click "Start" on Sound chapter
5. Complete all 4 stages:
   - Pre-Assessment (5 questions)
   - Explanation (5 concepts)
   - Chat (ask 5+ questions)
   - Test (10 questions)
6. Verify progress saves
7. Log out and log back in
8. Check stages still show as complete

## 🐛 Troubleshooting

### Common Issues

**"params is a Promise" error:**
- Update API route to await params
- See [DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md#common-issues--solutions)

**Progress not saving:**
- Check userId in sessionStorage
- Verify API route returns 200
- Check database has progress row

**Voice not working:**
- Check ELEVEN_LABS_KEY in .env
- Verify TTS API returns audio
- Check browser console for errors

**Database locked:**
- Close other connections
- WAL mode is enabled
- Restart server if needed

## 📊 Current Status

**Implemented:**
- ✅ Authentication system
- ✅ Dashboard with curriculum
- ✅ Sound chapter (ALL 5 stages complete!)
- ✅ Progress tracking with persistence
- ✅ AI chat with voice
- ✅ Adaptive revision cycle

**Pending:**
- ⏳ Additional chapters (Light, Heat, etc.)
- ⏳ Math subjects
- ⏳ Parent dashboard
- ⏳ Analytics
- ⏳ Deployment to production

## 🎯 Target Audience

- **Students:** 7th Grade
- **Curriculum:** Maharashtra State Board
- **Location:** Mumbai, India
- **Subjects:** Science, Mathematics

## 📝 Content Sources

All content is from:
- **Official Maharashtra Board Textbook**
- 7th Standard Science and Mathematics
- Exact page references provided
- Exercise questions converted to MCQ format

## 🤝 Contributing

To add new chapters:
1. Read [CHAPTER_TEMPLATE.md](docs/CHAPTER_TEMPLATE.md)
2. Gather textbook content
3. Follow the template
4. Test thoroughly
5. Document changes

## 📄 License

Educational project for Maharashtra Board students.

## 👥 Credits

Developed for 7th Grade Maharashtra Board students in Mumbai.

---

## 🚀 Quick Commands

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Database operations
cd ai-tutor
sqlite3 database.db
```

## 📞 Support

For questions or issues:
1. Check documentation in `docs/` folder
2. Review [DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md)
3. See [API_REFERENCE.md](docs/API_REFERENCE.md)

---

**Built with ❤️ for Maharashtra Board students**

*Access the app:* http://localhost:3000 (or http://192.168.0.100:3000)
