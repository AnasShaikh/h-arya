import db from './connection';
import fs from 'fs';
import path from 'path';

// Initialize database with schema
export function initializeDatabase() {
  const schemaPath = path.join(process.cwd(), 'lib', 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  
  // Execute schema
  db.exec(schema);
  
  console.log('Database initialized successfully');
}

// Call this when the app starts
if (process.env.NODE_ENV !== 'production') {
  initializeDatabase();
}
