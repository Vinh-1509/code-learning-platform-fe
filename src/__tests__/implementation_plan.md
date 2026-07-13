````markdown
# Testing Strategy — Code Learning Platform FE

---

## Tech Stack Findings

| Layer              | Technology                                        |
| ------------------ | ------------------------------------------------- |
| Framework          | **React 19** with TypeScript                      |
| Build Tool         | **Vite 8** (`@vitejs/plugin-react`)               |
| Routing            | **TanStack Router v1** (file-based)               |
| HTTP Client        | **Axios** (custom instance in `src/lib/axios.ts`) |
| Styling            | **Tailwind CSS v4** + shadcn/radix-ui             |
| Auth               | Custom Context + `localStorage` JWT token         |
| Linting/Formatting | ESLint + Prettier + Husky (lint-staged)           |

---

## Existing Testing Setup

> [!CAUTION]
> **Zero testing infrastructure exists.** There are no test libraries, no test scripts, no `__tests__` directories, and no test configuration files anywhere in the project.

---

## Proposed Tools to Install

### Core Testing Framework

- **Vitest** — The natural choice for a Vite project. Shares the same config and transformation pipeline; no babel needed. Replaces Jest.

### Component & DOM Testing

- **`@testing-library/react`** — The React Testing Library; pairs with Vitest perfectly.
- **`@testing-library/user-event`** (v14) — Realistic browser-event simulation (required by your guardrails — never `fireEvent`).
- **`@testing-library/jest-dom`** — Accessible `expect` matchers (e.g., `toBeInTheDocument`, `toBeDisabled`).
- **`jsdom`** — Browser DOM environment for Vitest (configured via `environment: 'jsdom'`).

### API Mocking

- **MSW (Mock Service Worker) v2** — Industry standard for mocking `fetch`/`axios` requests. Works perfectly in both test and browser contexts. We'll use the `http` + `HttpResponse` API (MSW v2 style).

### Supporting

- **`@types/node`** — Already installed ✓

### Install Command

```bash
yarn add -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom msw
```
````

---

## Vitest Configuration

`vitest.config.ts` (separate from `vite.config.ts` to keep dev server proxy unaffected):

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```

`package.json` scripts to add:

```json
"test": "vitest",
"test:run": "vitest run",
"test:coverage": "vitest run --coverage"

```

---

## Known Testability Concerns

> [!WARNING]
> **`AuthContextProvider` uses `useNavigate` from TanStack Router.** Tests will need a `RouterContext` wrapper or a TanStack Router test helper to avoid `useNavigate` throwing outside-context errors. **Resolved:** use `createMemoryHistory` + `RouterProvider` wrapper. No source changes needed.

> [!WARNING]
> **`src/lib/auth.ts` — `requireAuth` and `checkLanguageSelection**`use`throw redirect(...)`from TanStack Router. These are router-lifecycle functions, not component-level. Testing them in isolation requires mocking both`getMe`(from axios) and`redirect`. We'll mock at the module level.

> [!NOTE]
> **`src/lib/axios.ts`** directly accesses `localStorage` and `window.location.href` in interceptors. MSW will intercept axios network calls at the network level cleanly. No source code changes needed.

---

## Decisions

1. **TanStack Router context in tests:** Use the wrapper approach with `createMemoryHistory` + `RouterProvider`. Do not mock `<Link>` directly.
2. **Coverage threshold:** Collect and display coverage reports, but do not set a strict minimum threshold yet. Establish a baseline first.

---

## Critical Files — Phase Map

> [!WARNING]
> **PATH CORRECTION.** The practice utils live at
> `src/components/practice_utils/utils/` — **not** `src/features/practice/utils/`.
> All written test files already use the correct path. The table below reflects the real locations.

> [!CAUTION]
> **2024-XX status refresh.** A code audit found several rows below marked ❌ already have tests written in the repo (just not reflected here). Statuses corrected below; see also the new "Backend Sync Issue" section for a real bug uncovered during the audit.

| File                                                                    | Phase | Functions / What to Test                                                                                               | Status                                                                                                                                                               |
| ----------------------------------------------------------------------- | ----- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/lib/syntax.ts`                                                     | 2     | `tokenize()`                                                                                                           | ✅ Done                                                                                                                                                              |
| `src/lib/utils.ts`                                                      | 2     | `cn()`                                                                                                                 | ✅ Done                                                                                                                                                              |
| `src/lib/auth.ts`                                                       | 2     | `requireAuth`, `checkLanguageSelection`                                                                                | ✅ Done (`unit/lib/auth.test.ts`)                                                                                                                                    |
| `src/lib/lessonGuard.ts`                                                | 2 🆕  | `requireAccessibleLesson` redirect logic                                                                               | ❌ To write                                                                                                                                                          |
| `src/components/practice_utils/utils/dragDrop.utils.ts`                 | 2     | `getUsedIds()`, `isAllFilled()`                                                                                        | ✅ Done                                                                                                                                                              |
| `src/components/practice_utils/utils/fillBlank.utils.ts`                | 2     | `getInputWidth()`, `getBlankInputClass()`                                                                              | ✅ Done                                                                                                                                                              |
| `src/components/practice_utils/utils/exercise.converter.ts`             | 2     | `convertDragDropExercise()`, `convertFillBlankExercise()`, `convertExerciseResponse()`, `prepareAnswerForSubmission()` | ✅ Done                                                                                                                                                              |
| `src/features/dashboard/useRoadmap.ts`                                  | 2     | `getCurrentLesson()`                                                                                                   | ✅ Done                                                                                                                                                              |
| `src/features/auth/LoginForm.tsx`                                       | 3     | Form validation, submit handler, loading state                                                                         | ✅ Done (`integrations/features/auth/LoginForm.test.tsx`)                                                                                                            |
| `src/features/auth/SignupForm.tsx`                                      | 3     | Password mismatch guard, form validation, error display                                                                | ✅ Done (`integrations/features/auth/SignupForm.test.tsx`)                                                                                                           |
| `src/features/auth/AuthContextProvider.tsx`                             | 3     | login/register/logout flows + error handling                                                                           | ✅ Done — written twice (`integration/auth/...` mocked-axios version and `integrations/features/auth/...` MSW version); **dedupe, see Folder Structure Issue below** |
| `src/components/practice_utils/shared/SubmitBar.tsx`                    | 3     | Button enabled/disabled states, submit callback                                                                        | ✅ Done (`integrations/components/practice_utils/SubmitBar.test.tsx`)                                                                                                |
| `src/components/practice_utils/shared/ResultBanner.tsx`                 | 3     | Correct/wrong/null states, AI explanation states                                                                       | ✅ Done (`integrations/components/practice_utils/ResultBanner.test.tsx`)                                                                                             |
| `src/features/dashboard/LearningRoadmap.tsx`                            | 3     | Loading skeleton, module expansion, lesson start                                                                       | ✅ Done (`integrations/features/dashboard/LearningRoadmap.test.tsx`)                                                                                                 |
| `src/features/dashboard/CurrentLessonBanner.tsx`                        | 3 🆕  | `onStartLesson` button click                                                                                           | ❌ To write                                                                                                                                                          |
| `src/components/practice_utils/shared/HintStrip.tsx`                    | 3 🆕  | Button label cycling, hint visibility, callback routing                                                                | ✅ Done (`integration/practice/HintStrip.test.tsx`)                                                                                                                  |
| `src/features/lesson/ExerciseTabBar.tsx`                                | 3 🆕  | Tab pass state, block-complete badge, tab click                                                                        | ✅ Done (`integration/lesson/ExerciseTabBar.test.tsx`)                                                                                                               |
| `src/features/lesson/LessonSidebar.tsx`                                 | 3 🆕  | Locking logic (`prevBlock.isFeynmanPassed`)                                                                            | ❌ To write                                                                                                                                                          |
| `src/components/practice_utils/components/drag_drop/AvailableBlock.tsx` | 3 🆕  | Drag state, click handler, used/unused styling                                                                         | ✅ Done (`integration/practice/AvailableBlock.test.tsx`)                                                                                                             |
| `src/components/practice_utils/components/drag_drop/DropSlot.tsx`       | 3 🆕  | Drag-from-slot, remove button, hover state                                                                             | ❌ To write                                                                                                                                                          |
| `src/components/practice_utils/components/fill_blank/BlankInput.tsx`    | 3 🆕  | Input width calculation, input classes, onAnswerChange wiring                                                          | ❌ To write                                                                                                                                                          |
| `src/features/practices/ExerciseCard.tsx`                               | 3 🆕  | Visual/behavioral states, conditional routing                                                                          | ❌ To write                                                                                                                                                          |
| `src/features/lesson/useBlockExercises.ts`                              | 4 🆕  | Block completion, pass map, Feynman gate                                                                               | ❌ To write — **fix dead `completeBlock()` call first, see below**                                                                                                   |
| `src/features/lesson/useBlockLessons.ts`                                | 4 🆕  | Fetch lesson by ID, refetchLesson path                                                                                 | ❌ To write                                                                                                                                                          |
| `src/features/practices/usePractice.ts`                                 | 4 🆕  | Debounce, language guard, difficulty filtering                                                                         | ❌ To write                                                                                                                                                          |
| `src/features/dedicated_practice/useDedicatedPractice.ts`               | 4 🆕  | Fetch, convert, submit, hint, explain flows                                                                            | ❌ To write                                                                                                                                                          |
| `src/features/dashboard/useDashboard.ts`                                | 4 🆕  | Fetch stats, loading/error/success states                                                                              | ❌ To write                                                                                                                                                          |
| `src/features/language_selection/useLanguageSelection.ts`               | 4 🆕  | fetchLanguages, saveLanguage, navigate                                                                                 | ❌ To write                                                                                                                                                          |
| `src/components/practice_utils/PracticePanel.tsx`                       | 4     | —                                                                                                                      | ✅ Done                                                                                                                                                              |
| `src/components/practice_utils/FillBlankPane.tsx`                       | 4     | —                                                                                                                      | ✅ Done                                                                                                                                                              |

---

**Action before writing the hook test:**

1. Remove the `completeBlock` import and the `void completeBlock(...)` call from `useBlockExercises.ts` (keep `setBlockCompleted(true)` — that's local UI state that still correctly triggers the Feynman pane in `LessonPage.tsx`).
2. Remove `completeBlock()` and `BlockCompleteResponse` from `src/lib/axios.ts`.
3. Then write `integration/hooks/useBlockExercises.test.ts` against the corrected hook — this also matches the test case already specified below ("Under any condition | `completeBlock` is never called"), which was written against the _intended_ behavior, not the current buggy one.

---

## File Structure

> [!CAUTION]
> Tree below reflects **actual current paths**, which differ from earlier drafts of this plan (e.g. `unit/practice/` is really `unit/components/practice_utils/`, and there are two parallel integration roots — `integration/` and `integrations/` — that need consolidating; see Folder Structure Issue above).

```
src/
└── __tests__/
    ├── setup.ts
    ├── fixtures/
    │   └── practiceExercises.ts
    ├── helpers/
    │   ├── renderWithAuth.tsx
    │   └── renderWithRouter.tsx
    ├── mocks/
    │   ├── handlers.ts                           ✅
    │   └── server.ts
    ├── unit/
    │   ├── lib/
    │   │   ├── syntax.test.ts                    ✅
    │   │   ├── utils.test.ts                     ✅
    │   │   ├── auth.test.ts                      ✅
    │   │   └── lessonGuard.test.ts               ✅
    │   ├── components/practice_utils/
    │   │   ├── dragDrop.utils.test.ts            ✅
    │   │   ├── fillBlank.utils.test.ts           ✅
    │   │   └── exercise.converter.test.ts        ✅
    │   └── features/dashboard/
    │       └── getCurrentLesson.test.ts          ✅
    └── integrations/
        ├── components/practice_utils/
        │   ├── PracticePanel.test.tsx            ✅
        │   ├── FillBlankPane.test.tsx            ✅
        │   ├── SubmitBar.test.tsx                ✅
        │   ├── ResultBanner.test.tsx             ✅
        │   ├── DropSlot.test.tsx                 ✅
        │   └── BlankInput.test.tsx               ✅
        ├── components/lessons/
        │   ├── ExerciseTabBar.test.tsx           ✅
        │   └── LessonSidebar.test.tsx            ✅
        ├── components/practices/
        │   └── ExerciseCard.test.tsx             ✅
        ├── features/auth/
        │   ├── LoginForm.test.tsx                ✅
        │   ├── SignupForm.test.tsx               ✅
        │   └── AuthContextProvider.test.tsx      ✅
        ├── features/dashboard/
        │   ├── LearningRoadmap.test.tsx          ✅
        │   ├── CurrentLessonBanner.test.tsx      ✅
        │   └── useStartLesson.test.tsx           ✅
        ├── features/interview/
        │   └── FeynmanInterviewPane.test.tsx     ✅
        └── hooks/
            ├── useBlockExercises.test.ts         ✅
            ├── useBlockLessons.test.ts           ✅
            ├── usePractice.test.ts               ✅
            ├── useDedicatedPractice.test.ts      ✅
            ├── useDashboard.test.ts              ✅
            ├── useLanguageSelection.test.ts      ✅
            ├── useRoadmap.test.ts                ✅
            └── useSidebarLanguage.test.ts        ✅

```

---

## User Workflows to Test (Phase 3 Integration)

1. **Login Flow** — User fills email + password → clicks "Sign in" → loading state shown → on success, auth token persisted → redirect; on error, error message shown
2. **Sign Up Flow** — User fills all fields → password mismatch check prevents submit → on match, submits → on API success, redirects
3. **Dashboard Roadmap** — Modules load from API → loading state renders → modules are listed → user clicks module to expand → clicks "Start" on a lesson → navigation is triggered
4. **Submit Bar (Practice)** — Submit disabled when blanks unfilled → enabled when all filled → shows "Verifying..." while submitting → disabled again after correct answer (`canResubmit=false`)
5. **Result Banner** — Hidden when `showResult=null` → shows correct banner → shows wrong banner with AI explanation panel in loading/error/success states
6. **Hint Strip** 🆕 — Button label cycles through Get/Next/Hide → hints revealed on open → `onRequestHint` vs `onToggleHint` called correctly
7. **Exercise Tab Bar** 🆕 — Tabs reflect pass state → block-complete badge appears → tab click fires index setter
8. **Block Completion (`useBlockExercises`)** 🆕 — All required exercises passed → `blockCompleted` becomes true (local UI state only — triggers the Feynman pane). Non-required passing does not set it. **Do not** assert a `completeBlock` API call succeeds; that endpoint no longer exists server-side — see "Backend Sync Issue" above.

---

## Phase 2: Unit Test Cases

### `unit/lib/auth.test.ts` (written)

File: `src/lib/auth.ts` exports `requireAuth` and `checkLanguageSelection`. Both use `throw redirect(...)` from TanStack Router and call `getMe()` from axios.

**Mocking strategy:** mock `@tanstack/react-router` to capture `redirect` calls; mock `@/lib/axios` at the module level for `getMe`.

```ts
// Skeleton for auth.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock TanStack redirect so it throws a trackable object, not a real navigation
vi.mock('@tanstack/react-router', () => ({
  redirect: (opts: { to: string }) => ({ __redirect: true, to: opts.to }),
}));

// Mock getMe so we control what the "server" returns
vi.mock('@/lib/axios', () => ({
  getMe: vi.fn(),
}));

import { requireAuth, checkLanguageSelection } from '@/lib/auth';
import { getMe } from '@/lib/axios';
```

**Test cases for `requireAuth()`:**

| Scenario                                               | Expected                                                     |
| ------------------------------------------------------ | ------------------------------------------------------------ |
| No token in localStorage                               | throws redirect to `/login`                                  |
| Token present, `getMe()` throws (expired)              | clears token from localStorage + throws redirect to `/login` |
| Token present, user has no `selectedLanguage`          | throws redirect to `/language-selection`                     |
| Token present, user has empty `selectedLanguage` array | throws redirect to `/language-selection`                     |
| Token present, user has valid `selectedLanguage`       | resolves without throwing                                    |

**Test cases for `checkLanguageSelection()`:**

| Scenario                                               | Expected                                                |
| ------------------------------------------------------ | ------------------------------------------------------- |
| No token in localStorage                               | throws redirect to `/login`                             |
| Token present, `getMe()` throws                        | clears token + throws redirect to `/login`              |
| Token present, user has `selectedLanguage` already set | throws redirect to `/dashboard`                         |
| Token present, user has no `selectedLanguage`          | resolves without throwing (stays on language selection) |

---

## Phase 3: Integration Test Cases

### `integration/auth/AuthContextProvider.test.tsx`

File: `src/features/auth/AuthContextProvider.tsx`

**Test wrapper:** needs `createMemoryHistory` + `RouterProvider` per the agreed TanStack Router approach.

| Scenario                                               | Expected                                              |
| ------------------------------------------------------ | ----------------------------------------------------- |
| `login()` success → token stored                       | `localStorage.getItem('token')` equals returned token |
| `login()` success → navigate called                    | router history moves to `/language-selection`         |
| `login()` API error with message                       | `error` state is set to the API message string        |
| `login()` network failure (no message)                 | `error` state is set to fallback string               |
| `login()` sets `loading` true during call, false after | `loading` transitions correctly                       |
| `register()` success with token                        | stores token + navigates to `/language-selection`     |
| `register()` success without token in response         | navigates to `/login` without storing token           |
| `register()` API error                                 | `error` state set correctly                           |
| `logout()` clears token from localStorage              | `localStorage.getItem('token')` is null               |
| `logout()` navigates to `/login`                       | router history moves to `/login`                      |
| `useAuth()` outside provider                           | throws `"useAuth must be used within AuthProvider"`   |

---

### `integration/practice/HintStrip.test.tsx`

File: `src/components/practice_utils/shared/HintStrip.tsx`

Small, self-contained component — very testable. All props are callbacks or primitives.

| Scenario                                          | Expected                                                      |
| ------------------------------------------------- | ------------------------------------------------------------- |
| `hints=[]`, `isOpen=false`                        | button label is "Get Hint"                                    |
| `hints=['hint1']`, `isOpen=false`                 | button label is "Next Hint"; hint count shows `(1)` in header |
| `hints=['hint1']`, `isOpen=true`                  | button label is "Hide Hint"; hint text is visible in DOM      |
| `hints=[]`, `isOpen=false` — button clicked       | calls `onRequestHint`, does NOT call `onToggleHint`           |
| `hints=['hint1']`, `isOpen=true` — button clicked | calls `onToggleHint` (hide), does NOT call `onRequestHint`    |
| Header row clicked when `isOpen=false`            | calls `onToggleHint`                                          |
| Multiple hints visible when `isOpen=true`         | all hint strings are in the document                          |

---

### `integration/lesson/ExerciseTabBar.test.tsx`

File: `src/features/lesson/ExerciseTabBar.tsx`

Drives the tab strip at the top of the practice panel — important for navigation and completion visibility.

| Scenario                                      | Expected                                                 |
| --------------------------------------------- | -------------------------------------------------------- |
| `loading=true`                                | renders "Loading exercises..." text                      |
| `error="some error"`                          | renders "Failed to load exercises" text                  |
| `exercises=[]`, no loading/error              | renders "No practice available" text                     |
| Renders one button per exercise               | button count equals `exercises.length`                   |
| Active exercise button is visually distinct   | active button has blue class; others don't               |
| Passed exercise shows ✓ prefix                | exercise with `exercisePassMap[id]=true` shows checkmark |
| Passed + active exercise                      | shows green variant (passed wins over default blue)      |
| Clicking a tab calls `setActiveExerciseIndex` | callback invoked with correct index                      |

---

### `integration/practice/AvailableBlock.test.tsx`

File: `src/components/practice_utils/components/drag_drop/AvailableBlock.tsx`

| Scenario                    | Expected                                                       |
| --------------------------- | -------------------------------------------------------------- |
| `isUsed=false`              | block is draggable; has active border classes                  |
| `isUsed=true`               | block has `opacity-20` / cursor-not-allowed classes            |
| `isUsed=false`, user clicks | calls `onClick`                                                |
| `isUsed=true`, user clicks  | `onDragStart` is NOT called when drag begins (draggable=false) |
| Block code text is rendered | `block.code` string is visible in DOM                          |

---

### Phase 3 MSW Handler Additions

```ts
// handlers.ts additions needed

// 1. Exercise explanation (AI)
http.post('/api/exercises/:exerciseId/explain', () =>
  HttpResponse.json({
    exerciseId: 'ex-001',
    isCorrect: false,
    feedback: 'Your answer was close but incorrect.',
    items: [{ field: '1', isCorrect: false, explanation: 'Expected b1 first' }],
    suggestion: 'Review the for loop structure.',
  })
),

// 2. Exercise attempt history
http.get('/api/practice/exercises/:exerciseId/history', () =>
  HttpResponse.json([
    {
      _id: 'attempt-1',
      exerciseId: 'ex-001',
      isPassed: false,
      items: [],
      hintLevel: 1,
      attemptNumber: 1,
      attemptedAt: '2025-01-01T00:00:00Z',
    },
  ])
),

```

---

## Phase 4: Hook Test Cases

### `integration/hooks/useBlockExercises.test.ts`

File: `src/features/lesson/useBlockExercises.ts`

> [!CAUTION]
> **Prerequisite:** remove the dead `completeBlock()` call from this hook (and the now-unused `completeBlock`/`BlockCompleteResponse` exports from `lib/axios.ts`) before writing these tests — see "Backend Sync Issue" earlier in this doc. The endpoint it calls was removed server-side; block completion is driven by the Feynman chat pass instead.

This is the most critical untested hook — it drives block completion, the pass map, and the Feynman interview gate. Requires MSW + `renderHook`.

| Scenario                                               | Expected                                                           |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| `block=undefined`                                      | `exercises` is empty array, `loading` stays false                  |
| Block has no `practice` content items                  | `exercises` is empty, no API calls made                            |
| Block has 2 exercise IDs                               | fetches both in parallel; `exercises` has 2 items                  |
| API fetch throws                                       | `error` state is set; `exercises` is empty                         |
| All required exercises are passed                      | `blockCompleted` becomes true                                      |
| A non-required exercise is the only one passed         | `blockCompleted` remains false                                     |
| Under any condition                                    | `completeBlock` is never called                                    |
| `submitAnswer()` incorrect                             | `exercisePassMap[id]` is NOT set; `blockCompleted` stays false     |
| Block changes (new `blockId`)                          | `exercisePassMap` resets to `{}`; `blockCompleted` resets to false |
| `getHint()` delegates to `getExerciseHint`             | MSW hint handler called with correct exercise ID                   |
| `explainAnswer()` delegates to `explainExerciseAnswer` | MSW explain handler called                                         |

---

### `integration/hooks/usePractice.test.ts`

File: `src/features/practices/usePractice.ts`

Notable behaviors to test beyond the basic fetch: the 400ms debounce on search/filter changes, the language sourced from `useAuth`, and the skip-if-no-language guard.

| Scenario                             | Expected                                                        |
| ------------------------------------ | --------------------------------------------------------------- |
| `user.selectedLanguage` is undefined | no API call is made; `exercises` stays empty                    |
| Normal fetch                         | MSW handler returns exercises; `exercises` is populated         |
| `q` changes                          | after debounce delay (advance timers by 400ms), new fetch fires |
| `q` changes twice rapidly            | only ONE fetch fires (second cancels first timer)               |
| `difficulty='All Levels'`            | `difficulty` param is NOT sent to API                           |
| `difficulty='Easy'`                  | `difficulty: 'easy'` (lowercase) is sent to API                 |
| API throws                           | `error` state is set                                            |
| Unmount during fetch                 | no state update after unmount (no React warning)                |

---

## Open Questions

> [!IMPORTANT]
>
> 1. **TanStack Router context in tests:** ✅ Resolved — use `createMemoryHistory` + `RouterProvider` wrapper. No source changes needed.
> 2. **Coverage threshold:** ✅ Resolved — collect and display coverage, no strict minimum yet. Establish baseline first.
> 3. **Phase 3 scope:** ✅ Resolved — `PracticePanel.tsx` and `FillBlankPane.tsx` deferred to Phase 4.
> 4. **✅ Resolved — `usePractice` debounce:** Uses `setTimeout(400ms)`. Tests must call `vi.useFakeTimers()` and `vi.advanceTimersByTime(400)` to trigger the fetch without waiting real time.
> 5. **✅ Resolved — `AuthContextProvider` `useEffect` on token change:** The effect calls `getMe()` on mount when a token exists in localStorage. Tests that check the user state should pre-seed localStorage before rendering and use `waitFor` to resolve the effect.
