-- Students table
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  grade INTEGER DEFAULT 7,
  board TEXT DEFAULT 'Maharashtra',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table (chat sessions)
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER,
  topic TEXT,
  start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_time DATETIME,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Messages table (chat history)
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER,
  role TEXT CHECK(role IN ('user', 'assistant')),
  content TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER,
  topic TEXT,
  questions TEXT,
  answers TEXT,
  score REAL,
  total INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);

-- Progress table
CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  student_id INTEGER,
  topic TEXT,
  subtopic TEXT,
  mastery_level REAL,
  last_practiced DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id)
);
