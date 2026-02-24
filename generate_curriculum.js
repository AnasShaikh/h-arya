const fs = require('fs');
const path = require('path');

const chaptersDir = '/opt/h-arya/content/chapters/';
const files = fs.readdirSync(chaptersDir);

const curriculumMap = new Map();

files.forEach(file => {
  if (!file.endsWith('.json')) return;
  
  try {
    const content = JSON.parse(fs.readFileSync(path.join(chaptersDir, file), 'utf8'));
    const metadata = content.metadata;
    
    if (metadata && metadata.subject && metadata.chapterNumber && metadata.title) {
      const grade = metadata.grade || 7;
      const key = `${grade}-${metadata.subject}-${metadata.chapterNumber}`;
      
      // If conflict, prefer specific names over "Unit X"
      if (curriculumMap.has(key)) {
        const existing = curriculumMap.get(key);
        if (existing.chapterName.toLowerCase().startsWith('unit ')) {
           curriculumMap.set(key, {
            grade: grade,
            subject: metadata.subject,
            chapterNumber: metadata.chapterNumber,
            chapterName: metadata.title,
            description: metadata.description || '',
            isActive: true
          });
        }
      } else {
        curriculumMap.set(key, {
          grade: grade,
          subject: metadata.subject,
          chapterNumber: metadata.chapterNumber,
          chapterName: metadata.title,
          description: metadata.description || '',
          isActive: true
        });
      }
    }
  } catch (e) {}
});

const curriculum = Array.from(curriculumMap.values());

// Generate SQL
console.log('DELETE FROM "curriculum";');
console.log('INSERT INTO "curriculum" ("grade", "subject", "chapter_number", "chapter_name", "description", "is_active") VALUES');

const values = curriculum.map(c => 
  `(${c.grade}, '${c.subject}', ${c.chapterNumber}, '${c.chapterName.replace(/'/g, "''")}', '${c.description.replace(/'/g, "''")}', true)`
);

console.log(values.join(',\n') + ';');
