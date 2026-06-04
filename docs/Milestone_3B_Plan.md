# Milestone 3B — CodeStep

Period: 31/05 – 21/06

---

## Target Flow

signup → language select → roadmap → lesson
→ exercise → AI error explanation → Feynman check
→ weakness tracking → personalized practice recommendation
→ practice exercises → progress improvement

---

## Goal of 3B

Carry over unfinished 3A work, then transform the deployed MVP into a
polished, testable product ready for DemoDay.

Two features were not completed in 3A and must be finished before any
3B-specific work begins:

- AI Feynman validation (block unlock depends on it)
- Weakness tag tracking (practice recommendation depends on it)

Do not start Phase 1 until both carryovers are working end-to-end.

---

## Carryover — Finish 3A Incomplete Features

Due: 05/06

### Backend

AI Feynman Validation

- POST /api/feynman/block/:blockId/chat
  → submit user explanation, invoke AI, update chatHistory,
  set isFeynmanPassed: true if criteria met
- GET /api/feynman/block/:blockId/question
- GET /api/feynman/block/:blockId/stats

Weakness Tag Tracking

- On every exercise submission, update user_tag_stats:
  - Increment totalAttempts
  - Increment failAttempts if answer is incorrect
  - Recalculate isWeak based on failure rate threshold
- Collections to confirm populated: exercise_attempt, user_tag_stats

### Frontend

- Feynman chatbot UI (AI asks question, user types explanation)
- Block unlock flow triggers only after isFeynmanPassed: true
- Basic error state if AI service is unavailable

### Carryover Checkpoint

Run the full core learning flow end-to-end before moving on:

lesson → exercise → wrong answer → AI error explanation
→ correct answer → Feynman question → user explanation
→ AI accepts → next block unlocks → user_tag_stats updated

If this flow does not work end-to-end, do not start Phase 1.

---

## Phase 1 — Personalized Practice System

Due: 10/06

### Backend

Recommendation endpoints

- GET /api/tags/weakness
- GET /api/tags/:tagId/info
- GET /api/tags/:tagId/exercises

Recommendation logic

- Sort weak tags by failure rate
- Surface exercises from weakest tags first
- Prioritize exercises not yet passed

Seed additional exercise data

- Minimum 20–30 exercises across multiple tags and difficulty levels

### Frontend

Practice Page

- Recommended exercises section (driven by weakness tags)
- All exercises section
- Difficulty filter
- Tag filter
- Search

Weakness UI

- Display weak tags with failure percentages
- Link weak tags to recommended exercises

Exercise history per exercise

- Previous answer
- Attempt count
- Completion status

---

## Integration Checkpoint

Due: 11/06

Full flow test:

lesson → exercise submission → weakness stats update
→ recommendation refresh → practice page shows updated recommendations

Recommendations must visibly change based on user performance.
Do not start Phase 2 if personalization is not functioning end-to-end.

---

## Phase 2 — AI Improvement & Product Polish

Due: 16/06

### Backend

Improve AI error explanation

- Current: correct / incorrect label only
- Target: what is wrong, why it is wrong, correct reasoning, suggested fix

Improve Feynman validation

- Better prompts and pass criteria
- Better misconception detection
- More targeted follow-up questions
- Timebox AI tuning: if prompts are good enough by 13/06, ship and move on

Improve API error handling

- Invalid IDs
- Missing records
- Unauthorized access
- Expired tokens
- AI service failures (graceful fallback, not a crash)

### Frontend

Learning page

- Better block progress indicators
- Better completion and success states
- Better loading states

Error handling UI

- Loading screens
- Empty states
- Retry actions
- Friendly error messages (no raw error objects shown to user)

Dashboard improvements

- Continue Learning section
- Current progress summary
- Weakness summary
- Recommended Practice shortcut

---

## Phase 3 — Mobile Responsiveness

Due: 19/06

### Frontend

Authentication pages — mobile and tablet support

Dashboard — mobile layout, tablet layout

Roadmap — mobile scrolling, responsive node layout

Lesson page

- Desktop: theory | exercise (split-screen)
- Mobile: Theory tab / Exercise tab (or stacked)

Practice page

- Mobile exercise interaction
- Responsive filters
- Responsive recommendation cards

---

## Phase 4 — Stabilization & Demo Preparation

Due: 21/06

### Backend

Production smoke test

- Authentication
- Learning flow
- Practice flow
- Recommendation flow
- AI integration

Fix critical bugs only — no new features in this phase.

Database validation

- Progress tracking correct
- Weakness tracking correct
- Recommendation accuracy acceptable

### Frontend

Cross-browser testing: Chrome, Edge, Firefox

Responsive testing: Desktop, Tablet, Mobile

UI consistency review: typography, colors, spacing

### Team Demo Rehearsal

Run the full DemoDay scenario without intervention:

signup → language selection → roadmap → lesson
→ exercise → AI explanation → Feynman validation
→ weakness tracking → personalized recommendation
→ practice page

All members must be able to walk through the complete flow independently.

---

## Scope Boundary

IN 3B (must have):
✓ AI Feynman Validation (carryover from 3A)
✓ Weakness Tag Tracking (carryover from 3A)
✓ Dedicated Practice Page
✓ Personalized Exercise Recommendation
✓ Improved AI Error Explanation
✓ Improved Feynman Prompts
✓ Error Handling & Edge Cases
✓ Mobile Responsiveness
✓ Additional Seeded Content (20–30+ exercises)
✓ Production Stability
✓ DemoDay-ready Deployment

NOT IN 3B:
× Daily Review / Spaced Repetition
× Full Conversational AI Tutor
× Additional Programming Languages
× Additional Exercise Types
× Gamification / Badges / Achievements
× Leaderboards or Social Features
× AI-generated Curriculum

---

## Success Criteria

A new user must be able to:

1. Register an account
2. Select a programming language
3. Navigate the roadmap
4. Learn through lesson blocks (theory + exercise)
5. Receive an AI explanation after a wrong answer
6. Pass Feynman validation to unlock the next block
7. Have weakness statistics generated from their attempts
8. See personalized exercise recommendations on the Practice page
9. Complete practice exercises independently of the lesson flow
10. Use the platform smoothly on both desktop and mobile

If all ten steps work reliably on the deployed website, Milestone 3B is complete.
