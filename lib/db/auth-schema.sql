-- Drop the old students table and create a proper users table
DROP TABLE IF EXISTS students;

-- Users table with authentication
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  grade INTEGER DEFAULT 7,
  board TEXT DEFAULT 'Maharashtra',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME
);

-- Update sessions table to use user_id
DROP TABLE IF EXISTS sessions;
CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  subject TEXT,
  chapter TEXT,
  start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_time DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Update messages table
DROP TABLE IF EXISTS messages;
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER,
  role TEXT CHECK(role IN ('user', 'assistant')),
  content TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id)
);

-- Update assessments table
DROP TABLE IF EXISTS assessments;
CREATE TABLE IF NOT EXISTS assessments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  subject TEXT,
  chapter TEXT,
  questions TEXT,
  answers TEXT,
  score REAL,
  total INTEGER,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Update progress table
DROP TABLE IF EXISTS progress;
CREATE TABLE IF NOT EXISTS progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  subject TEXT,
  chapter TEXT,
  status TEXT CHECK(status IN ('not_started', 'in_progress', 'completed')),
  mastery_level REAL,
  last_practiced DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(user_id, subject, chapter)
);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  token TEXT UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Curriculum table (for managing subjects and chapters)
CREATE TABLE IF NOT EXISTS curriculum (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  subject TEXT NOT NULL,
  chapter_number INTEGER NOT NULL,
  chapter_name TEXT NOT NULL,
  description TEXT,
  is_active INTEGER DEFAULT 1,
  UNIQUE(subject, chapter_number)
);

-- Insert sample curriculum data
INSERT OR IGNORE INTO curriculum (subject, chapter_number, chapter_name, description, is_active) VALUES
('Science', 18, 'Sound', 'Production, Propagation, Pitch, Intensity', 1),
('Science', 19, 'Light', 'Reflection and Refraction', 0),
('Science', 20, 'Heat', 'Temperature and Energy', 0),
('Mathematics', 1, 'Rational Numbers', 'Operations on Rational Numbers', 0),
('Mathematics', 2, 'Algebra', 'Expressions and Equations', 0);
