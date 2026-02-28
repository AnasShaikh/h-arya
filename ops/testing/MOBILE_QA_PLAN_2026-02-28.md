# Mobile QA Plan for H-Arya (Std 7)
**Date:** 2026-02-28
**Author:** QA Lead (Subagent)

## 1. Test Scope
This QA cycle focuses on verifying the visual rendering and basic functionality of Standard 7 chapters on mobile viewports.

**In Scope:**
- Login flow (Happy path)
- Dashboard rendering
- Opening all active Standard 7 chapter links
- Verifying "Chapter Page" and "Explanation Page" rendering
- Detection of critical UI blockers (crashes, 404s, missing CTAs)

**Out of Scope:**
- Deep functional testing of quizzes/interactive elements inside chapters
- Performance profiling
- Cross-browser compatibility (Chrome emulation only)
- Payment/Subscription flows

## 2. Device & Viewport Assumptions
- **Device:** Generic Mobile (iPhone 12/13/14 Pro equivalent)
- **Viewport:** 390 x 844 pixels
- **User Agent:** Standard mobile UA string
- **Touch Emulation:** Enabled

## 3. Chapter Coverage Strategy
Automated traversal of all links identified as "Standard 7" chapters on the user dashboard.
The script will:
1.  Navigate to Dashboard.
2.  Scrape all chapter card URLs.
3.  Visit each URL.
4.  Check for key elements (Title, Content Container, "Next/Start" buttons).

## 4. Pass/Fail Criteria
**Pass:**
- Page loads with HTTP 200.
- Critical DOM elements (`.chapter-content`, `h1`, or equivalent) are visible.
- No console errors indicating a React crash (e.g., "Minified React error").

**Fail:**
- HTTP 404 or 500.
- Blank page (White Screen of Death).
- Missing primary content container.
- Infinite loading spinner (> 10s).

## 5. Bug Severity Rubric
- **Critical:** App crash, white screen, 404 on chapter link, login failure.
- **Major:** Content overlapping, missing navigation buttons, unreadable text.
- **Minor:** CSS misalignment, small padding issues, typo.
