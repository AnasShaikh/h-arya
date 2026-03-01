# H-Arya: Magical UI Interactions
> Design Philosophy Document v1.0 — Sonnet, 2026-02-28

---

## Vision

Every tap, swipe, answer, and completion should feel **alive**.
Not loud. Not gamey. Just *satisfying* — like the UI understands you.

The goal: a student opens H-Arya and feels like something is happening *for them*.

---

## 1. Micro-interactions (Every tap feels responsive)

### Button press feedback
Every button press should have:
- Scale down on press: `active:scale-95 transition-transform duration-100`
- Subtle bounce back: `ease-out` spring feel
- Optional: brief color brightening on release

### Input focus
When student taps a text field:
- Border animates from gray → violet with a soft glow ring
- Label slides up (floating label pattern)
- Keyboard opens and field scrolls into view without jarring jump

### Card hover/tap (mobile: tap-highlight)
- Cards lift `translateY(-2px)` with shadow deepening
- Background tint shifts very slightly (violet-50 → violet-100)
- Duration: 150ms ease-out

---

## 2. Page Transitions (Moving between screens feels fluid)

### Route change animation
Currently: instant swap. Should feel like:
- **Dashboard → Chapter:** slide in from right (`translateX(100% → 0)`)
- **Chapter → Pre-assessment:** zoom in slightly (`scale(0.97 → 1)`)
- **Results → Next step:** fade up (`translateY(20px → 0) + opacity 0 → 1`)

### Implementation approach
- Use Framer Motion `AnimatePresence` wrapper at layout level
- Each page exports `variants` for entry/exit
- Duration: 200–300ms max (fast enough to not feel sluggish)

---

## 3. Answer Selection (Test/Pre-assessment feel punchy)

### Option tap sequence
1. Tap: card scales to 0.97, border flashes violet
2. Selected state: card border violet-600, bg violet-50, left bar accent appears
3. Correct reveal: card turns green, ✅ icon animates in (pop scale 0 → 1.2 → 1)
4. Wrong reveal: card shakes horizontally (2–3px wiggle, 300ms), turns red

### Confetti on perfect score
If student gets 100%:
- Canvas confetti burst (lightweight, 1.5s, then clears)
- Score animates counting up to 100%
- "🎉 Perfect!" badge scales in

---

## 4. Progress & Completion (Every milestone celebrated)

### Chapter stage completion
When a stage dot fills:
- Dot scales up (1 → 1.4 → 1) with a violet glow pulse
- Thin connecting line between dots fills progressively
- Sound: optional soft chime (only if user enabled it)

### Chapter completion ceremony
When student finishes a chapter:
- Full-screen overlay: dark violet gradient, white text
- Big ✅ animation (draw stroke, like a checkmark being drawn)
- Score card slides up from bottom
- "Continue" button fades in after 1.5s

### Progress bar fill animation
- Never snap — always animate from previous value to new value
- Duration: 600ms ease-out
- Bar has a subtle shimmer sweep after it fills (white gradient moving right)

---

## 5. Flashcard Flip (Memorize section)

### 3D flip effect
- CSS `perspective` + `rotateY` transform
- Front face: question card
- Back face: answer card
- Flip duration: 400ms ease-in-out
- Shadow deepens mid-flip (card appears to lift off screen)
- Card back has slightly different bg (violet-50 vs white)

### Swipe to navigate
- Drag card left/right to navigate between flashcards
- Card follows finger with slight resistance
- Release: card snaps to next/prev with spring physics
- Swipe threshold: 40% of card width

---

## 6. Loading States (Nothing feels frozen)

### Page loading (replace spinner)
```
Three violet dots bouncing with staggered timing:
● ● ●  (each delayed 150ms)
```

### Content loading (skeleton screens)
Instead of spinner on dashboard:
- Subject cards show shimmer skeleton (gray wave animation)
- Chapters appear staggered (each 60ms delay) once loaded

### AI chat response loading
- Three pulsing dots in a chat bubble (like iMessage typing indicator)
- Bubble scales in from 0 when response arrives
- Text appears character by character (typewriter, but fast — 15ms/char)

---

## 7. Subject Card Expansion (Dashboard)

### Expand animation
- Card header: chevron rotates 180° smoothly
- Chapter list: slides down with `max-height` animation (0 → content height)
- Chapters stagger in: each row fades + slides from left, 40ms delay between each

### Subject emoji pulse on hover
- Emoji does a gentle scale bounce: `1 → 1.15 → 1`
- Duration: 300ms

---

## 8. Onboarding (First impression is magic)

### Subject pill selection
- Tap: pill flips with a 3D rotation (like a coin flip, Y-axis, 300ms)
- Selected: violet fill + white text + scale-up
- Deselect: reverse flip

### Step transitions
- Steps don't just change — the content slides out left, new content slides in right
- Progress bar fills with a smooth animation, not a snap

### Step 3 (You're all set)
- Rocket emoji animates: bounces up 10px and back, 3 times
- Background gets subtle animated gradient shift (violet → indigo pulsing slowly)

---

## 9. Chat (AI tutor feels alive)

### Message send animation
- User message: slides up from input bar into chat thread
- Input bar clears with a sweep
- Typing indicator appears immediately (3 dots)

### Response appears
- Bubble scales in from left
- Text streams in (typewriter effect at readable speed ~30ms/char)
- Each line/bullet fades in sequentially if response has structure

### Emoji reactions
- If AI response includes an emoji, it briefly scales up (1 → 1.3 → 1) on appear

---

## 10. Achievement / Reward Moments

### Stage unlocked
- Memorize tab: when unlocked, the tab does a glow pulse (violet ring radiates out)
- "🧠 Memorize" text briefly scales up

### Streak indicator (future)
- 🔥 icon animates: flicker effect (slight opacity oscillation)
- On increment: scale burst (1 → 1.3 → 1)

### Long answer submitted
- "Reveal model answer" button: after tap, card unfolds from top (like paper unfolding)
- Key points appear one by one with checkmark draws

---

## 11. Sound Design (Optional, opt-in)

### Sound events (very subtle, student-optional)
- Correct answer: soft piano note (C major, 200ms)
- Wrong answer: soft low tone (200ms)
- Stage complete: gentle chime sequence (3 notes, 600ms total)
- Chapter complete: short celebration fanfare (1.5s)
- Flashcard flip: soft whoosh (100ms)

### Implementation
- All sounds < 50KB
- Respect `prefers-reduced-motion` and system mute
- User toggle in profile settings

---

## 12. Implementation Stack

| Effect | Recommended Tool |
|---|---|
| Page transitions | Framer Motion `AnimatePresence` |
| Micro-interactions | Tailwind + CSS transitions |
| Flashcard flip | CSS `transform-style: preserve-3d` |
| Confetti | `canvas-confetti` (2KB) |
| Swipe gestures | `use-gesture` or Framer Motion drag |
| Typewriter text | Custom hook with `setInterval` |
| Skeleton loaders | Tailwind `animate-pulse` |
| Sound | HTML5 `Audio` API |

---

## 13. Performance Guardrails

- **Reduce motion:** check `prefers-reduced-motion` — if set, skip all animations
- **GPU compositing only:** stick to `transform` and `opacity` animations (never `width`/`height`/`margin`)
- **Animation budget:** no more than 3 concurrent animations on mobile
- **Lazy load Framer Motion** (dynamic import, only load on first interactive page)

---

## Priority Execution Order

| Priority | Effect | Impact | Effort |
|---|---|---|---|
| P0 | Answer option tap → correct/wrong animation | Very high | Low |
| P0 | Page transition (slide/fade) | High | Medium |
| P0 | Flashcard 3D flip | Very high | Medium |
| P1 | Confetti on perfect score | High | Low |
| P1 | Skeleton loaders on dashboard | Medium | Low |
| P1 | AI chat typewriter text | High | Medium |
| P2 | Subject card expansion stagger | Medium | Medium |
| P2 | Onboarding pill 3D flip | Medium | Medium |
| P3 | Sound design (opt-in) | Medium | Medium |
| P3 | Chapter completion ceremony | High | High |

---

*This document is the canonical reference for H-Arya interaction design. Implement P0 items first for maximum launch impact.*
