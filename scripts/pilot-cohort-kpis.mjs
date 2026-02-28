import fs from 'node:fs/promises';
import path from 'node:path';

async function main() {
  const apiUrl = 'http://127.0.0.1:3000/api/analytics/cohort?grade=7&board=Maharashtra&cohort=new_7d';
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error(`Failed to fetch cohort KPIs: HTTP ${res.status}`);

  const data = await res.json();
  const kpis = data?.kpis || {};

  const chapterStarted = Number(kpis.chapter_started || 0);
  const memorizeCompleted = Number(kpis.memorize_completed || 0);
  const testSubmitted = Number(kpis.test_submitted || 0);

  const startToMemorize = chapterStarted ? (memorizeCompleted / chapterStarted) * 100 : 0;
  const memorizeToTest = memorizeCompleted ? (testSubmitted / memorizeCompleted) * 100 : 0;

  const report = {
    generated_at_utc: new Date().toISOString(),
    source: apiUrl,
    segment: {
      cohort: 'new_7d',
      grade: 7,
      board: 'Maharashtra',
    },
    counts: {
      chapter_started: chapterStarted,
      memorize_completed: memorizeCompleted,
      test_submitted: testSubmitted,
      active_learners: Number(kpis.active_learners || 0),
    },
    conversion: {
      start_to_memorize_pct: Number(startToMemorize.toFixed(2)),
      memorize_to_test_pct: Number(memorizeToTest.toFixed(2)),
    },
    score: {
      avg_all_time_pct: Number(kpis.score_avg_all_time || 0),
      avg_24h_pct: Number(kpis.score_avg_24h || 0),
    },
  };

  const outPath = path.resolve('/opt/h-arya/ops/reports/pilot_onboarding_baseline_new_7d.json');
  await fs.writeFile(outPath, JSON.stringify(report, null, 2));
  console.log(`wrote: ${outPath}`);
  console.log(JSON.stringify(report, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
