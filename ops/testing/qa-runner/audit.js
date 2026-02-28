const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Config
const BASE_URL = 'http://localhost:3000';
const VIEWPORT = { width: 390, height: 844 };
const LOGS_DIR = '/opt/h-arya/ops/testing';
const CREDENTIALS = {
    email: 'testuser1504', // The username field might be an email input
    password: 'Test@1234'
};

async function runAudit() {
    console.log('Starting Mobile QA Audit...');
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: VIEWPORT,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
    });
    const page = await context.newPage();

    const results = {
        meta: {
            timestamp: new Date().toISOString(),
            device: 'iPhone 12/13 Pro (390x844)',
            user: CREDENTIALS.email
        },
        summary: {
            total: 0,
            passed: 0,
            failed: 0
        },
        details: []
    };

    const bugs = [];

    try {
        // 1. Login
        console.log(`Navigating to ${BASE_URL}/login...`);
        await page.goto(`${BASE_URL}/login`);
        
        // Handle potentially different input selectors
        const emailSelector = await page.isVisible('input[type="email"]') ? 'input[type="email"]' : 'input[name="email"]';
        // Fallback for username if email not found
        const userSelector = await page.isVisible(emailSelector) ? emailSelector : 'input[name="username"]';

        await page.fill(userSelector, CREDENTIALS.email);
        await page.fill('input[type="password"]', CREDENTIALS.password);
        await page.click('button[type="submit"]');

        console.log('Logging in...');
        try {
            await page.waitForURL(/dashboard|onboarding/, { timeout: 15000 });
        } catch (e) {
             console.log('Wait for dashboard/onboarding URL timeout, checking content...');
        }
        
        // Handle Onboarding
        if (page.url().includes('onboarding')) {
            console.log('Redirected to onboarding. Attempting to navigate to dashboard...');
            // Try forcing navigation to dashboard
            await page.goto(`${BASE_URL}/dashboard`);
            await page.waitForTimeout(2000);
        }

        // Verify dashboard
        if (!page.url().includes('dashboard')) {
             throw new Error(`Login failed or did not redirect to dashboard. Current URL: ${page.url()}`);
        }
        console.log('Login successful.');

        // 2. Discover Chapters
        // The dashboard uses accordions (buttons) for subjects. We need to click them to reveal chapters.
        await page.waitForLoadState('networkidle');
        
        // Find all subject buttons
        const subjectButtons = await page.$$('button.w-full.p-6');
        console.log(`Found ${subjectButtons.length} subject buttons. Expanding them...`);

        for (const button of subjectButtons) {
            try {
                // Scroll into view and click
                await button.scrollIntoViewIfNeeded();
                await button.click();
                // Wait for animation/expansion
                await page.waitForTimeout(500); 
            } catch (e) {
                console.log('Error clicking subject button:', e.message);
            }
        }
        
        // Now capture all links that look like chapters
        // Assuming the expanded content contains <a> tags to /chapter/ or similar
        const chapterLinks = await page.$$eval('a', anchors => 
            anchors
                .map(a => a.href)
                .filter(href => href.includes('/chapter/') || href.includes('/std7/'))
                .filter((v, i, a) => a.indexOf(v) === i) // Unique
        );

        console.log(`Found ${chapterLinks.length} potential chapter links.`);
        results.summary.total = chapterLinks.length;

        // 3. Iterate and Audit
        for (const link of chapterLinks) {
            console.log(`Auditing: ${link}`);
            const auditEntry = { url: link, status: 'pending', issues: [] };
            
            try {
                const response = await page.goto(link, { waitUntil: 'domcontentloaded' });
                const status = response.status();

                if (status >= 400) {
                    throw new Error(`HTTP ${status}`);
                }

                // Check for Critical UI elements
                // Wait a bit for React to render
                await page.waitForTimeout(2000);

                // Check for "White Screen" / Crash
                // Heuristic: Body is empty or only contains scripts/hidden divs
                const bodyText = await page.innerText('body');
                if (!bodyText || bodyText.trim().length < 50) {
                     auditEntry.issues.push({ severity: 'Critical', msg: 'Page appears blank or empty' });
                     bugs.push({ url: link, issue: 'White Screen of Death', severity: 'Critical' });
                }

                // Check for Error Boundaries
                if (bodyText.includes('Minified React error') || bodyText.includes('Something went wrong')) {
                    auditEntry.issues.push({ severity: 'Critical', msg: 'React Crash detected' });
                    bugs.push({ url: link, issue: 'React Crash detected', severity: 'Critical' });
                }

                // Check for basic content containers
                // Common selectors: main, article, .container, h1
                const hasContent = await page.evaluate(() => {
                    return !!(document.querySelector('main') || document.querySelector('h1') || document.querySelector('.chapter-content'));
                });

                if (!hasContent) {
                     auditEntry.issues.push({ severity: 'Major', msg: 'No main content container detected (main, h1, .chapter-content)' });
                     bugs.push({ url: link, issue: 'Missing Main Content', severity: 'Major' });
                }

                // Check for Explanation Page (Requirement: verify explanation page renders)
                // Look for "Start Learning" or primary CTA
                const startButton = await page.$('a:has-text("Start Learning"), button:has-text("Start Learning"), a:has-text("Start Chapter"), button:has-text("Start Chapter")');
                
                if (startButton) {
                    // If it's a link, get href. If button, click.
                    const href = await startButton.getAttribute('href');
                    if (href) {
                        const explainUrl = href.startsWith('http') ? href : BASE_URL + href;
                        console.log(`  -> Navigating to Explanation: ${explainUrl}`);
                        
                        try {
                            const explResponse = await page.goto(explainUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
                            if (explResponse.status() >= 400) throw new Error(`HTTP ${explResponse.status()}`);
                            
                            // Check for explanation content
                            const explContent = await page.evaluate(() => {
                                return !!(document.querySelector('.prose') || document.querySelector('article') || document.querySelector('.explanation-content'));
                            });
                            
                            if (!explContent) {
                                auditEntry.issues.push({ severity: 'Major', msg: 'Explanation page missing content (.prose, article)' });
                                bugs.push({ url: explainUrl, issue: 'Missing Explanation Content', severity: 'Major' });
                            }
                        } catch (explErr) {
                             auditEntry.issues.push({ severity: 'Critical', msg: `Explanation page crash: ${explErr.message}` });
                             bugs.push({ url: explainUrl || link + '/explain', issue: 'Explanation Page Crash', severity: 'Critical' });
                        }
                    } else {
                        // Try clicking
                        console.log('  -> Clicking "Start Learning"...');
                        await startButton.click();
                        try {
                            await page.waitForNavigation({ timeout: 5000 });
                            // Basic check
                            const explContent = await page.evaluate(() => !!document.body.innerText.length > 50);
                             if (!explContent) {
                                auditEntry.issues.push({ severity: 'Major', msg: 'Explanation page empty after click' });
                            }
                        } catch (navErr) {
                             auditEntry.issues.push({ severity: 'Major', msg: 'Start Learning button navigation failed/timeout' });
                        }
                    }
                } else {
                    // Try iterating common explanation URL patterns if button not found
                    // Or just log it
                    // auditEntry.issues.push({ severity: 'Minor', msg: 'Start Learning button not found' });
                }

                if (auditEntry.issues.length === 0) {
                    auditEntry.status = 'PASS';
                    results.summary.passed++;
                } else {
                    auditEntry.status = 'FAIL';
                    results.summary.failed++;
                }

            } catch (err) {
                console.error(`Error visiting ${link}: ${err.message}`);
                auditEntry.status = 'FAIL';
                auditEntry.error = err.message;
                auditEntry.issues.push({ severity: 'Critical', msg: `Navigation error: ${err.message}` });
                results.summary.failed++;
                bugs.push({ url: link, issue: `Navigation Error: ${err.message}`, severity: 'Critical' });
            }
            
            results.details.push(auditEntry);
        }

    } catch (error) {
        console.error('Fatal Audit Error:', error);
        results.fatalError = error.message;
    } finally {
        await browser.close();
        
        // 4. Save Logs
        const jsonPath = path.join(LOGS_DIR, 'mobile-chapter-audit-2026-02-28.json');
        fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));
        console.log(`Saved JSON report to ${jsonPath}`);

        const mdPath = path.join(LOGS_DIR, 'mobile-chapter-audit-2026-02-28.md');
        const mdContent = `
# Mobile Chapter Audit Report
**Date:** ${results.meta.timestamp}
**User:** ${results.meta.user}

## Summary
- **Total Chapters:** ${results.summary.total}
- **Passed:** ${results.summary.passed}
- **Failed:** ${results.summary.failed}

## Details
${results.details.map(d => `
### ${d.url}
- **Status:** ${d.status}
${d.issues.length ? d.issues.map(i => `- [${i.severity}] ${i.msg}`).join('\n') : '- No obvious issues found.'}
`).join('\n')}
        `;
        fs.writeFileSync(mdPath, mdContent);
        console.log(`Saved MD report to ${mdPath}`);

        // 5. Bug List
        const bugsPath = path.join(LOGS_DIR, 'mobile-obvious-bugs-2026-02-28.md');
        const bugsContent = `
# Obvious Bugs List (Mobile)
**Date:** ${results.meta.timestamp}

${bugs.length === 0 ? "No obvious bugs found." : bugs.map((b, i) => `
## Bug ${i+1}: ${b.issue}
- **Severity:** ${b.severity}
- **URL:** ${b.url}
- **Steps to Reproduce:**
  1. Login as test user.
  2. Set mobile viewport (390x844).
  3. Navigate to URL.
  4. Observe issue.
`).join('\n')}
        `;
        fs.writeFileSync(bugsPath, bugsContent);
        console.log(`Saved Bug list to ${bugsPath}`);
    }
}

runAudit();
