# Milestone 3A — CodeStep

---

## Target Flow

signup → language select → roadmap → lesson (theory + 1 exercise type)
→ AI error explanation → Feynman check → unlock next block

---

## CRITICAL (before any code) (I think Quan has done this...?)

Define the JSON shape for two fields.

blocks.content (example):
{
"type": "theory",
"markdown": "...",
"codeExample": "...",
"visualization": { ... }
}

exercises.data (drag-drop example):
{
"type": "drag-drop",
"items": ["item1", "item2", "item3"],
"slots": ["slot1", "slot2", "slot3"]
}

exercises.data (fill-blank example):
{
"type": "fill-blank",
"template": "for (int i = 0; i < \_\_\_; i++)",
"blanks": [{ "id": 1, "answer": "10" }]
}

---

## Phase 1 — Platform Foundation

Due: 18/05

### Backend

Implement auth routes + JWT middleware

- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh
  Implement learning routes
- GET /api/learning/milestones
- GET /api/learning/milestones/:milestoneId
- GET /api/learning/milestones/:milestoneId/lessons
- GET /api/learning/lessons/:lessonId
- POST /api/learning/blocks/:blockId/complete
- GET /api/languages
- GET /api/languages/:languageId
- POST /api/languages/select

Seed lesson data (minimum 2–3 real lessons with real blocks)

### Frontend

- Login / signup pages
- Language selection page (C++ vs Java)
- Dashboard page
- Roadmap page (locked/unlocked nodes)
- Navigation + routing setup
- Lesson click → lesson page (mocked content is fine while BE seeds data)

---

## Integration Checkpoint

Due: 19/05

Before Phase 2 begins, fullstack runs a full smoke test:
signup → language select → roadmap → click lesson (even mocked)

If this flow does not work end-to-end, fix it before starting Phase 2.
Do not let Phase 2 begin on a broken foundation.

---

## Phase 2 — Actual Product Logic

Due: 29/05 (8 days — most important phase)

### Backend

AI integration:

- POST /api/feynman/block/:blockId/chat
  → submit user explanation, invoke AI, update chatHistory,
  set isFeynmanPassed: true if criteria met
- GET /api/feynman/block/:blockId/question
- GET /api/feynman/block/:blockId/stats

Exercise validation:

- POST /api/practice/exercises/:exerciseId/submit
  → validate answer, return correct: true/false, trigger AI error explanation if wrong
- POST /api/practice/exercises/:exerciseId/hint
- GET /api/practice/exercises/:exerciseId/history

Tag stats (for recommendation):

- GET /api/tags/weakness
- GET /api/tags/:tagId/exercises
- Recommendation logic: more failures on a tag = higher priority in exercise list

DB collections to implement: exercise_attempt, user_tag_stats, exercises

### Frontend

- Split-screen learning page (theory left, exercise right)
- Exercise interaction: implement ONE type only for MVP
  → drag-and-drop OR fill-in-the-blank (team decides on Day 1)
- Hint system (static pre-authored hints, manually triggered by user)
- AI response display (error explanation after wrong answer)
- Feynman chatbot UI (AI asks question, user types explanation)
- Block unlock flow after Feynman passes

## Phase 3 — Deploy

29/05 → 31/05 (2 days)

- Full integration test on deployed environment
- Fix critical blockers only — no new features
- Internal demo: team + mentor walks the full target flow
- Should be smooth if skeleton was deployed on 18/05

---

## Scope Boundary

IN 3A (must have):
✓ Auth + onboarding + language selection
✓ Roadmap with locked/unlocked nodes
✓ Split-screen lesson page
✓ Both exercise types
✓ AI error explanation on wrong answer
✓ Block unlock progression
✓ First deployed version

PUSHED TO 3B (do not start during 3A):
× Practice page
× Adaptive recommendation engine
× Mobile responsiveness
× Full conversational Feynman AI

---
