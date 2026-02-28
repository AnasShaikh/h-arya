import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const CHAPTER_IDS = [
  1454, 1455, 1456, 1457, 1458, 1459, 1460, 1462, 1464, 1465, 1466, 1467, 1468, 1469, 1470,
  1471, 1472, 1473, 1474, 1475, 1476, 1477, 1478, 1479, 1480, 1481, 1482, 1483, 1484, 1485,
  1486, 1487, 1488, 1489, 1490, 1491, 1492, 1493, 1494, 1495, 1496, 1497, 1498, 1499, 1500,
  1501, 1502, 1503, 1504, 1505, 1506, 1507, 1508, 1509, 1510, 1511, 1512, 1513, 1514, 1515,
  1516, 1517, 1518, 1519, 1520, 1521, 1522, 1523, 1524, 1525, 1526, 1527, 1528, 1529, 1530,
  1531, 1532, 1533, 1534, 1535, 1536, 1537, 1538, 1539, 1540, 1541, 1542, 1543, 1544, 1545,
  1546, 1547, 1548, 1549, 1550, 1551, 1552, 1553, 1554, 1555, 1556, 1557, 1558, 1559, 1560,
  1561, 1562, 1563, 1564, 1565, 1566, 1567, 1568, 1569, 1570, 1571, 1572, 1573, 1574
];

async function runAudit() {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const results = [];

  console.log(`Starting audit for ${CHAPTER_IDS.length} chapters...`);

  for (const id of CHAPTER_IDS) {
    const routes = [
      `/chapter/${id}/pre-assessment`,
      `/chapter/${id}/explanation`
    ];

    for (const route of routes) {
      const url = `${BASE_URL}${route}`;
      const page = await context.newPage();
      let error = null;
      let status = 0;

      try {
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
        status = response.status();

        if (status >= 400) {
          error = `HTTP ${status}`;
        } else {
          const content = await page.content();
          const lowerContent = content.toLowerCase();

          // Runtime crash indicators
          if (lowerContent.includes('runtime error') || lowerContent.includes('application error') || lowerContent.includes('something went wrong')) {
            error = 'Runtime Crash Indicator Found';
          } 
          // Empty core content markers (tutor-specific)
          else if (lowerContent.includes('no content available') || lowerContent.includes('content not found')) {
            error = 'Empty Core Content';
          }
          // Missing primary CTA (assuming 'Continue' or 'Start' is expected)
          else if (!content.includes('Continue') && !content.includes('Start') && !content.includes('Next')) {
            // Check if it's actually empty or just different CTA
            const textContent = await page.evaluate(() => document.body.innerText);
            if (textContent.trim().length < 100) {
              error = 'Minimal Content / Missing CTA';
            }
          }
        }
      } catch (e) {
        error = `Navigation Timeout/Failed: ${e.message}`;
      }

      if (error) {
        results.push({ id, route, url, status, error });
        console.log(`[FAIL] ${url}: ${error}`);
      } else {
        console.log(`[OK] ${url}`);
      }
      await page.close();
    }
  }

  await browser.close();

  // Output JSON
  const jsonPath = '/opt/h-arya/ops/testing/fast-audit-pre-exp.json';
  fs.writeFileSync(jsonPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    total_chapters: CHAPTER_IDS.length,
    failed_routes: results
  }, null, 2));

  // Output MD (outliers only)
  const mdPath = '/opt/h-arya/ops/testing/fast-audit-pre-exp.md';
  let mdContent = `# Fast Audit Report: Grade 7 Pre-Assessment & Explanation\n\n`;
  mdContent += `**Timestamp:** ${new Date().toISOString()}\n`;
  mdContent += `**Total Chapters Checked:** ${CHAPTER_IDS.length}\n`;
  mdContent += `**Failed Routes:** ${results.length}\n\n`;
  
  if (results.length > 0) {
    mdContent += `| Chapter ID | Route | Status | Error |\n`;
    mdContent += `|------------|-------|--------|-------|\n`;
    results.forEach(r => {
      mdContent += `| ${r.id} | ${r.route} | ${r.status} | ${r.error} |\n`;
    });
  } else {
    mdContent += `No major outliers detected. All checked routes responded correctly.\n`;
  }

  fs.writeFileSync(mdPath, mdContent);
  
  console.log(`\nAudit complete.`);
  console.log(`Summary: ${results.length} issues found across ${CHAPTER_IDS.length} chapters.`);
  console.log(`Results saved to ${jsonPath} and ${mdPath}`);
}

runAudit().catch(console.error);
