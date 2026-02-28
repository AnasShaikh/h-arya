import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const repoRoot = process.cwd();
const chaptersDir = path.join(repoRoot, 'content', 'chapters');
const reportDir = path.join(repoRoot, 'ops', 'reports');
const reportFile = path.join(reportDir, 'science-coverage-report.json');
const maxChapter = Number(process.env.SCIENCE_MAX_CHAPTER || 20);

function run(cmd) {
  return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function parseJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function listScienceChapterFiles() {
  const files = fs.readdirSync(chaptersDir).filter(f => f.endsWith('.json'));
  return files
    .map(file => {
      const fullPath = path.join(chaptersDir, file);
      const json = parseJson(fullPath);
      if (!json) return null;
      const metadata = json.metadata || {};
      if (metadata.subject !== 'Science') return null;
      return {
        file,
        chapterNumber: Number(metadata.chapterNumber),
        grade: metadata.grade ?? null,
        preAssessmentCount: Array.isArray(json.preAssessment) ? json.preAssessment.length : 0,
        testCount: Array.isArray(json.test) ? json.test.length : 0,
        conceptsCount: Array.isArray(json.concepts) ? json.concepts.length : 0,
      };
    })
    .filter(Boolean);
}

function loadActiveScienceCurriculum() {
  const password = process.env.POSTGRES_PASSWORD;
  if (!password) {
    throw new Error('POSTGRES_PASSWORD is missing in .env; cannot audit curriculum table.');
  }

  const sql = "SELECT id, chapter_number, chapter_name, is_active FROM curriculum WHERE grade=7 AND subject='Science' AND is_active=true ORDER BY chapter_number;";
  const cmd = `docker exec -e PGPASSWORD=\"${password}\" h-arya-db psql -U postgres -d h_arya -Atc \"${sql}\"`;
  const output = run(cmd);
  if (!output) return [];

  return output
    .split('\n')
    .map(line => {
      const [id, chapterNumber, chapterName, isActive] = line.split('|');
      return {
        id: Number(id),
        chapterNumber: Number(chapterNumber),
        chapterName,
        isActive: isActive === 't',
      };
    });
}

function main() {
  if (!fs.existsSync(chaptersDir)) {
    throw new Error(`Missing chapters directory: ${chaptersDir}`);
  }

  const curriculum = loadActiveScienceCurriculum();
  const scienceFiles = listScienceChapterFiles();

  const filesByChapter = new Map();
  for (const entry of scienceFiles) {
    if (!filesByChapter.has(entry.chapterNumber)) filesByChapter.set(entry.chapterNumber, []);
    filesByChapter.get(entry.chapterNumber).push(entry);
  }

  const missingContentForActiveCurriculum = [];
  const weakQualityFiles = [];
  const fileCoverage = [];

  for (const row of curriculum) {
    const candidates = filesByChapter.get(row.chapterNumber) || [];
    if (candidates.length === 0) {
      missingContentForActiveCurriculum.push(row);
      continue;
    }

    const preferred =
      candidates.find(c => c.grade === 7) ||
      candidates.find(c => c.grade === null) ||
      candidates[0];

    const issues = [];
    if (preferred.preAssessmentCount < 5) issues.push(`preAssessment<5 (${preferred.preAssessmentCount})`);
    if (preferred.testCount < 8) issues.push(`test<8 (${preferred.testCount})`);
    if (preferred.conceptsCount < 3) issues.push(`concepts<3 (${preferred.conceptsCount})`);

    if (issues.length > 0) {
      weakQualityFiles.push({
        chapterNumber: row.chapterNumber,
        chapterName: row.chapterName,
        file: preferred.file,
        issues,
      });
    }

    fileCoverage.push({
      chapterNumber: row.chapterNumber,
      chapterName: row.chapterName,
      file: preferred.file,
      gradeInFile: preferred.grade,
      preAssessmentCount: preferred.preAssessmentCount,
      testCount: preferred.testCount,
      conceptsCount: preferred.conceptsCount,
    });
  }

  const expectedChapterNumbers = Array.from({ length: maxChapter }, (_, i) => i + 1);
  const curriculumChapterSet = new Set(curriculum.map(c => c.chapterNumber));
  const missingInCurriculum = expectedChapterNumbers.filter(n => !curriculumChapterSet.has(n));

  const report = {
    generatedAtUtc: new Date().toISOString(),
    summary: {
      activeCurriculumRows: curriculum.length,
      scienceContentFiles: scienceFiles.length,
      missingContentForActiveCurriculum: missingContentForActiveCurriculum.length,
      weakQualityFiles: weakQualityFiles.length,
      missingInCurriculum: missingInCurriculum.length,
    },
    missingInCurriculum,
    missingContentForActiveCurriculum,
    weakQualityFiles,
    fileCoverage,
  };

  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

  console.log(`Wrote report: ${reportFile}`);
  console.log(JSON.stringify(report.summary, null, 2));

  if (
    report.summary.missingContentForActiveCurriculum > 0 ||
    report.summary.weakQualityFiles > 0 ||
    report.summary.missingInCurriculum > 0
  ) {
    process.exit(2);
  }
}

main();
