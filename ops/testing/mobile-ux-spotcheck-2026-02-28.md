# Mobile UX Spot Check - 2026-02-28

## Metadata
- **Date**: 2026-02-28
- **Tester**: AI Subagent
- **Viewport**: 390x844 (iPhone 12/13/14 equivalent)
- **Target**: Localhost H-Arya (Static Analysis & Code Review)

## Executive Summary
The application demonstrates a mobile-first approach with responsive utility classes (`w-full`, `flex-col`, `grid-cols-1`). However, inconsistent padding on cards and large typography sizes on mobile viewports may cause content cramping or excessive scrolling. The dashboard header consumes significant vertical space on mobile due to stacking.

## Detailed Findings

### Landing Page (/)
- **Typography**: The main title uses `text-4xl` and `text-5xl` for the emoji. On a 390px width, this may wrap excessively or push the CTA below the fold.
- **Layout**: `p-8` padding on the main card reduces effective content width to ~294px.

### Auth Pages (/login, /register)
- **Card Padding**: Uses `p-8` internal padding + `p-4` container padding. On mobile, this leaves minimal horizontal space for input fields and labels.
- **Touch Targets**: Inputs (`py-3.5`) and buttons (`py-4`) are sized well for touch interaction (>44px).

### Onboarding (/onboarding)
- **Subject Selection**: The flex wrap container for subjects might look crowded or unevenly spaced on narrow screens depending on the length of subject names (e.g., "Mathematics" vs "Hindi").

### Dashboard (/dashboard)
- **Header**: The header uses `flex-col gap-4` on mobile. This stacks the logo/title and the "Menu" button vertically, consuming approx. 120px of height before the main content starts.
- **Subject Cards**: The badge "Focus area" is inside the flex container with `shrink-0`, which is good, but might force the title to truncate early on very narrow devices.

### Chapter Details (/chapter/[id])
- **Learning Path**: The list items have significant horizontal consumption (icon + margins + padding = ~140px). This leaves <250px for the stage title and description, likely causing truncation on "Pre-Assessment" or "Interactive Practice".

## Recommendations
1.  **Reduce Mobile Padding**: Switch from `p-8` to `p-5` or `p-6` on mobile (using `p-5 sm:p-8`).
2.  **Optimize Typography**: Use `text-3xl sm:text-4xl` for main headings to reduce wrapping.
3.  **Compact Header**: Use `flex-row justify-between` on mobile for the Dashboard header to keep it on one line (Logo left, Menu right).
4.  **Sticky Header**: Ensure the sticky header doesn't consume more than 10-12% of the viewport height.
