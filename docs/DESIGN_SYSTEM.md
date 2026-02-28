# H-Arya Design System v1.0
> Written by Coda (main agent) after live UI audit — 2026-02-28

---

## 1. Design Philosophy

**"Confident & Warm"** — H-Arya should feel like a brilliant older sibling helping you study, not a corporate SaaS tool or a kindergarten app. Our students are 12–13 year old Maharashtra Board students who want to score marks. They need to feel capable, motivated, and in control.

### Core Principles
1. **Warmth over coldness** — Avoid flat, cool grays. Use warm off-whites, rich gradients, amber accents.
2. **Depth over flatness** — Layered shadows, subtle textures, real gradients. Nothing should look pasted on.
3. **Energy over boredom** — Generous use of emoji, color, and motion. This is for teenagers.
4. **Clarity over cleverness** — Information hierarchy must be obvious. Students shouldn't have to think about the UI.
5. **Indian identity** — Saffron accent, warm tones, the board's gravitas. Not generic Western EdTech.

---

## 2. Color System

### Brand Palette
```
Primary:    #6D28D9  (violet-700) — deep, rich, trustworthy
Primary Light: #7C3AED (violet-600) — buttons, CTAs
Primary Glow:  #8B5CF6 (violet-500) — hover states, gradients
Accent:     #F59E0B  (amber-500) — saffron, India-inspired, rewards
Success:    #10B981  (emerald-500) — completions, correct answers
Danger:     #EF4444  (red-500) — errors, wrong answers
```

### Background System
```
Page BG:    bg-[#F5F3FF] — very faint violet tint (NOT pure white, NOT gray)
Card BG:    bg-white
Elevated:   bg-white with shadow-[0_4px_24px_rgba(109,40,217,0.08)]
```

### Gradient Library (use these, don't invent new ones)
```
Primary:    from-violet-700 to-indigo-600
Warm:       from-amber-500 to-orange-500
Success:    from-emerald-500 to-teal-500
Energy:     from-violet-600 via-purple-600 to-pink-500
```

### Subject Colors (rich, not flat)
```
Science:    from-teal-500 to-cyan-500      — cool, precise
Math:       from-blue-600 to-indigo-500    — deep, logical
English:    from-rose-500 to-pink-500      — warm, expressive
Marathi:    from-orange-500 to-amber-500   — saffron, cultural
History:    from-amber-600 to-yellow-500   — golden, ancient
Civics:     from-purple-600 to-violet-500  — official, serious
Geography:  from-emerald-500 to-green-500  — earth, nature
Hindi:      from-red-500 to-rose-500       — vibrant, national
```

---

## 3. Typography

### Font Stack
```css
font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
```
(Import via Google Fonts in layout.tsx)

### Scale
```
Hero heading:   text-4xl font-black tracking-tight  (900 weight)
Page heading:   text-3xl font-extrabold              (800 weight)
Section title:  text-xl font-bold                   (700 weight)
Card title:     text-lg font-semibold               (600 weight)
Body:           text-base font-medium text-gray-800  (500 weight)
Caption/label:  text-sm font-medium text-gray-500   (500 weight)
Micro:          text-xs font-semibold uppercase tracking-widest text-gray-400
```

### Rules
- **Never** use `font-normal` for anything the student reads — always at least `font-medium`
- Headings: `text-gray-900` (almost black, never pure black #000)
- Body: `text-gray-700` or `text-gray-800`
- Captions: `text-gray-500`
- **Never** `text-gray-400` for real content — only decorative labels

---

## 4. Spacing & Layout

### Page Layout
```
Max width: max-w-4xl mx-auto (content), max-w-7xl (dashboard)
Page padding: px-4 py-8 sm:px-6
Section gap: space-y-6 or gap-6
```

### Card Anatomy
```
Border radius: rounded-2xl (standard), rounded-3xl (featured/hero cards)
Padding: p-5 (compact), p-6 (standard), p-8 (hero)
Border: border border-violet-100 (subtle definition)
Shadow: shadow-[0_2px_16px_rgba(109,40,217,0.07)] (branded glow shadow)
```

### Interactive States
```
Hover: hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200
Active: active:scale-95 transition-transform duration-100
Focus: focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 outline-none
```

---

## 5. Component Patterns

### Primary Button
```tsx
className="bg-gradient-to-r from-violet-700 to-violet-600 text-white 
  px-6 py-3.5 rounded-2xl font-bold text-base 
  hover:opacity-90 hover:-translate-y-0.5 
  active:scale-95 transition-all duration-200 
  shadow-lg shadow-violet-200"
```

### Secondary Button
```tsx
className="bg-white border-2 border-violet-200 text-violet-700 
  px-6 py-3.5 rounded-2xl font-bold text-base 
  hover:bg-violet-50 hover:border-violet-400 
  active:scale-95 transition-all duration-200"
```

### Input Field
```tsx
className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 
  focus:border-violet-500 focus:outline-none 
  focus:ring-2 focus:ring-violet-100
  text-gray-900 font-medium placeholder:text-gray-400
  transition-all duration-200 bg-white"
```

### Card
```tsx
className="bg-white rounded-2xl border border-violet-100 
  shadow-[0_2px_16px_rgba(109,40,217,0.07)] 
  hover:-translate-y-0.5 hover:shadow-[0_4px_24px_rgba(109,40,217,0.12)]
  transition-all duration-200 overflow-hidden"
```

### Progress Bar
```tsx
// Track
className="w-full bg-gray-100 rounded-full h-2.5"
// Fill
className="bg-gradient-to-r from-violet-600 to-indigo-500 h-2.5 rounded-full 
  transition-all duration-500 
  shadow-[0_0_8px_rgba(109,40,217,0.4)]"
```

### Badge/Pill
```tsx
// Primary
className="bg-violet-100 text-violet-700 text-xs font-bold px-3 py-1 rounded-full border border-violet-200"
// Amber/Reward
className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full border border-amber-200"
// Success
className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200"
```

### Subject Card Header (gradient)
```tsx
// Use subject-specific gradient, always white text, large emoji
className={`bg-gradient-to-r ${subjectGradient} p-5`}
// Inner layout: emoji (text-5xl) + name (text-2xl font-extrabold text-white) + subtitle (text-white/70 text-sm)
```

### Completion/Success State
```tsx
className="text-center py-8"
// Big emoji: text-6xl mb-3 (🎉 or ✅)
// Score: text-4xl font-black text-gray-900
// Message: text-gray-600 font-medium
// Sub-badges: use green/amber pills
```

---

## 6. Page-specific Patterns

### Auth Pages (login/register/onboarding)
- Centered card, max-w-md
- Background: `min-h-screen bg-[#F5F3FF] flex items-center justify-center p-4`
- Card: `bg-white rounded-3xl shadow-2xl shadow-violet-100 p-8`
- Logo: gradient badge top-center, not inline

### Dashboard
- Subject cards: full-width, gradient header, white chevron
- Chapter rows: left-border accent (3px solid subject color), not full-bg tint
- Progress dots: subject-colored, sized by completion

### Explanation / Learning
- Concept header: full-width gradient band
- Content sections: distinct bg tints (indigo-50, amber-50, pink-50) to visually separate
- Navigation: sticky-bottom feel (border-t on bottom nav)

### Test / Pre-assessment
- Question: large text, generous spacing
- Options: card-style (not radio buttons), full-width, hover lift
- Selected: violet border + violet-50 bg
- Correct: green border + green-50 bg with ✅ icon
- Wrong: red border + red-50 bg with ❌ icon

---

## 7. Animation & Motion

### Principles
- **Fast in, fast out**: 150–200ms for micro-interactions
- **Ease out**: for elements entering, `ease-out`
- **Spring-like**: buttons feel tactile with `active:scale-95`
- **No spinning loaders**: use skeleton screens or pulsing dots

### Loading State
```tsx
// Page loading
<div className="flex gap-1 justify-center py-12">
  {[0,1,2].map(i => (
    <div key={i} className="w-2 h-2 bg-violet-500 rounded-full animate-bounce" 
      style={{animationDelay: `${i*150}ms`}} />
  ))}
</div>
```

---

## 8. Gamification Elements

### XP / Progress language
- Use "🔥 Streak", "⭐ Mastery", "✅ Completed" — not plain percentages alone
- Chapter completion: always celebrate with a banner/toast, never silent
- Show stages as `Stage 2 of 5` with filled dots, not just a number

### Micro-rewards
- Correct answer: instant green flash + "✅ Correct!" badge
- Chapter complete: 🎉 confetti emoji + big score display
- All concepts done: unlock animation on Memorize tab

---

## 9. What to Avoid

❌ `text-gray-400` for content — always too light on white
❌ `bg-gray-50` backgrounds for section cards — too cold, use subject-tinted bg
❌ Flat single-color buttons (e.g. `bg-violet-600` without gradient) — use gradient
❌ `rounded-lg` for cards — use `rounded-2xl` minimum
❌ `shadow-sm` alone — use branded glow shadows
❌ Borders without color: `border-gray-200` only on inputs; cards use `border-violet-100`
❌ `font-normal` or `font-light` for student-facing text
❌ Pure white `#FFFFFF` page backgrounds — use `bg-[#F5F3FF]`
❌ Inline emoji as decorations without sizing context — always wrap in sized span

---

## 10. Implementation Notes

- Tailwind config: no custom theme needed — all values use Tailwind defaults + a few arbitrary values (`bg-[#F5F3FF]`, `shadow-[...]`)
- Google Font: add `Plus Jakarta Sans` import to `app/layout.tsx`
- All `shadow-violet-*` classes work with Tailwind's shadow color utilities
- For the glowing progress bar shadow: use inline `style={{ boxShadow: '0 0 8px rgba(109,40,217,0.4)' }}` if Tailwind arbitrary doesn't compile

---
*This document is the canonical design reference for H-Arya. All new UI additions must follow these patterns.*
