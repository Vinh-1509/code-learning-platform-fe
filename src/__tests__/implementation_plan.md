# Phase 1: Testing Strategy — Code Learning Platform FE

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

### Install Command (for Phase 2 approval)

```bash
yarn add -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom msw
```

---

## Critical Files Identified

### Pure Utility Functions (Highest Priority — Phase 2)

These are pure/near-pure functions with zero React dependencies — easiest to test, highest ROI:

| File                                                                                                                                                                                                                     | Functions                                                                                                              | Why Critical                                                                                        |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [`src/lib/syntax.ts`](file:///c:/Users/ADMIN/OneDrive%20-%20RMIT%20University/MyCodingSpace/DevCamp/project/code-learning-platform-fe/src/lib/syntax.ts)                                                                 | `tokenize()`                                                                                                           | Core syntax highlighter — many regex branches, edge cases (empty string, unknown chars, multi-line) |
| [`src/lib/utils.ts`](file:///c:/Users/ADMIN/OneDrive%20-%20RMIT%20University/MyCodingSpace/DevCamp/project/code-learning-platform-fe/src/lib/utils.ts)                                                                   | `cn()`                                                                                                                 | Used everywhere; test class merging and conditional logic                                           |
| [`src/features/practice/utils/dragDrop.utils.ts`](file:///c:/Users/ADMIN/OneDrive%20-%20RMIT%20University/MyCodingSpace/DevCamp/project/code-learning-platform-fe/src/features/practice/utils/dragDrop.utils.ts)         | `getUsedIds()`, `isAllFilled()`                                                                                        | Drive submit-button enable/disable logic — correctness is critical                                  |
| [`src/features/practice/utils/fillBlank.utils.ts`](file:///c:/Users/ADMIN/OneDrive%20-%20RMIT%20University/MyCodingSpace/DevCamp/project/code-learning-platform-fe/src/features/practice/utils/fillBlank.utils.ts)       | `getInputWidth()`, `getBlankInputClass()`                                                                              | Controls UI sizing and styling of blank inputs                                                      |
| [`src/features/practice/utils/exercise.converter.ts`](file:///c:/Users/ADMIN/OneDrive%20-%20RMIT%20University/MyCodingSpace/DevCamp/project/code-learning-platform-fe/src/features/practice/utils/exercise.converter.ts) | `convertDragDropExercise()`, `convertFillBlankExercise()`, `convertExerciseResponse()`, `prepareAnswerForSubmission()` | API-to-UI data transformation — wrong mapping = broken exercises                                    |
| [`src/features/dashboard/useRoadmap.ts`](file:///c:/Users/ADMIN/OneDrive%20-%20RMIT%20University/MyCodingSpace/DevCamp/project/code-learning-platform-fe/src/features/dashboard/useRoadmap.ts)                           | `getCurrentLesson()`                                                                                                   | Pure function; finds active lesson from module tree                                                 |

### Components / Hooks (Phase 3)

| File                                                                                                                                                                                                             | What to Test                                            |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| [`src/features/auth/LoginForm.tsx`](file:///c:/Users/ADMIN/OneDrive%20-%20RMIT%20University/MyCodingSpace/DevCamp/project/code-learning-platform-fe/src/features/auth/LoginForm.tsx)                             | Form validation, submit handler, loading state          |
| [`src/features/auth/SignUpForm.tsx`](file:///c:/Users/ADMIN/OneDrive%20-%20RMIT%20University/MyCodingSpace/DevCamp/project/code-learning-platform-fe/src/features/auth/SignUpForm.tsx)                           | Password mismatch guard, form validation, error display |
| [`src/features/auth/AuthContextProvider.tsx`](file:///c:/Users/ADMIN/OneDrive%20-%20RMIT%20University/MyCodingSpace/DevCamp/project/code-learning-platform-fe/src/features/auth/AuthContextProvider.tsx)         | login/register/logout flows + error handling            |
| [`src/features/practice/shared/SubmitBar.tsx`](file:///c:/Users/ADMIN/OneDrive%20-%20RMIT%20University/MyCodingSpace/DevCamp/project/code-learning-platform-fe/src/features/practice/shared/SubmitBar.tsx)       | Button enabled/disabled states, submit callback         |
| [`src/features/practice/shared/ResultBanner.tsx`](file:///c:/Users/ADMIN/OneDrive%20-%20RMIT%20University/MyCodingSpace/DevCamp/project/code-learning-platform-fe/src/features/practice/shared/ResultBanner.tsx) | Correct/wrong/null states, AI explanation states        |
| [`src/features/dashboard/LearningRoadmap.tsx`](file:///c:/Users/ADMIN/OneDrive%20-%20RMIT%20University/MyCodingSpace/DevCamp/project/code-learning-platform-fe/src/features/dashboard/LearningRoadmap.tsx)       | Loading skeleton, module expansion, lesson start        |

---

## User Workflows to Test (Phase 3 Integration)

1. **Login Flow** — User fills email + password → clicks "Sign in" → loading state shown → on success, auth token persisted → redirect; on error, error message shown
2. **Sign Up Flow** — User fills all fields → password mismatch check prevents submit → on match, submits → on API success, redirects
3. **Dashboard Roadmap** — Modules load from API → loading state renders → modules are listed → user clicks module to expand → clicks "Start" on a lesson → navigation is triggered
4. **Submit Bar (Practice)** — Submit disabled when blanks unfilled → enabled when all filled → shows "Verifying..." while submitting → disabled again after correct answer (`canResubmit=false`)
5. **Result Banner** — Hidden when `showResult=null` → shows correct banner → shows wrong banner with AI explanation panel in loading/error/success states

---

## Known Testability Concerns (Pre-identified)

> [!WARNING]
> **`AuthContextProvider` uses `useNavigate` from TanStack Router.** Tests will need a `RouterContext` wrapper or a TanStack Router test helper to avoid `useNavigate` throwing outside-context errors.

> [!WARNING]
> **`src/lib/auth.ts` — `requireAuth` and `checkLanguageSelection`** use `throw redirect(...)` from TanStack Router. These are router-lifecycle functions, not component-level. Testing them in isolation requires mocking both `getMe` (from axios) and `redirect`. We'll mock at the module level.

> [!NOTE]
> **`src/lib/axios.ts`** directly accesses `localStorage` and `window.location.href` in interceptors. MSW will intercept axios network calls at the network level cleanly. No source code changes needed.

> [!NOTE]
> **`DashboardPage.tsx` uses hardcoded mock data** (`totalLessons = 45`, `completedLessons = 12`). These are noted as intentional — tests will reflect the current behavior, not flag them as bugs.

---

## Proposed File Structure

```
src/
└── __tests__/
    ├── setup.ts                          # Global test setup (jest-dom matchers)
    ├── unit/
    │   ├── lib/
    │   │   ├── syntax.test.ts            # tokenize() — all token types + edge cases
    │   │   ├── utils.test.ts             # cn() — merging, conditionals, conflicts
    │   │   └── auth.test.ts              # requireAuth, checkLanguageSelection
    │   ├── practice/
    │   │   ├── dragDrop.utils.test.ts    # getUsedIds, isAllFilled
    │   │   ├── fillBlank.utils.test.ts   # getInputWidth, getBlankInputClass
    │   │   └── exercise.converter.test.ts # all 4 converter functions
    │   └── dashboard/
    │       └── useRoadmap.utils.test.ts  # getCurrentLesson pure function
    └── integration/
        ├── mocks/
        │   ├── handlers.ts               # MSW route handlers
        │   └── server.ts                 # MSW node server setup
        ├── auth/
        │   ├── LoginForm.test.tsx         # Login form integration
        │   └── SignUpForm.test.tsx        # Sign up form integration
        ├── practice/
        │   ├── SubmitBar.test.tsx         # Submit bar states
        │   └── ResultBanner.test.tsx      # Result banner states
        └── dashboard/
            └── LearningRoadmap.test.tsx   # Roadmap rendering + interactions
```

---

## Vitest Configuration Plan

`vitest.config.ts` (separate from vite.config.ts to keep dev server proxy unaffected):

```ts
// vitest.config.ts
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

## Open Questions

> [!IMPORTANT]
>
> 1. **TanStack Router context in tests**: `LoginForm` uses `<Link>` from `@tanstack/react-router`. Should I wrap tests with a lightweight `createMemoryHistory` + `RouterProvider` wrapper, or swap `Link` in tests with a mock? I recommend the wrapper approach — no source changes needed.
> 2. **Coverage threshold**: Do you want to enforce a minimum coverage percentage (e.g., 80%)? I'll add `coverage.thresholds` to config if so.
> 3. **Phase 3 scope**: The `PracticePanel.tsx` and `FillBlankPane.tsx` components are large and have complex internal state. Should these be included in Phase 3 or deferred to a Phase 4?

## Answers

Great analysis! Let's proceed with the following decisions:

1. **TanStack Router**: Yes, use the wrapper approach with `createMemoryHistory` + `RouterProvider`. Do not mock `<Link>` directly.
2. **Coverage**: Please configure the testing tool to collect and display coverage reports, but do not set a strict minimum threshold (like 80%) that fails the build yet. We will establish a baseline first.
3. **Phase 3 Scope**: Let's defer `PracticePanel.tsx` and `FillBlankPane.tsx` to a new Phase 4. Focus Phase 3 entirely on the smaller, simpler feature components to ensure our testing foundation and wrappers work perfectly.
