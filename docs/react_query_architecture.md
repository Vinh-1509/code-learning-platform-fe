# React Query Architecture Audit

### `code-learning-platform-fe` — Senior Frontend Architecture Review

---

## Executive Summary

The codebase is currently in a **transition state to React Query**. TanStack Query v5 is installed, the global `queryClient` and hierarchical `queryKeys` factory have been established, and several high-priority fetches and routes have been successfully migrated. However, some sections still rely on the legacy `useEffect + useState` pattern.

The current implementation status is:

- **Foundational Infrastructure**: ✅ Completed. React Query and Devtools are fully integrated, and the large `lib/axios.ts` file has been split, with TypeScript interfaces moved to dedicated files under `src/types/api/`.
- **Auth and Session caching**: ✅ Completed. `getMe` duplicate call issues are resolved, and route guards now leverage `queryClient.ensureQueryData` to reuse cached profile queries.
- **Core Dashboard & Lesson queries**: ✅ Completed. Core dashboard statistics and single lesson retrieval are converted to query hooks (`useDashboardData` and `useBlockLessons`).
- **Remaining migrations**: ⏳ In Progress. Several components and utility hooks (such as exercise lists, roadmap, language selection, and Feynman chat) still need migration to queries and mutations.

The recommended next steps are to focus on Phase 2 structural improvements—including parallel queries for roadmap and lesson exercises, writing mutations with invalidation rules, and configuring route loaders.

---

## Critical Issues

| #   | Issue                                                                                                                                | Severity    | Status      | File                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------- | ----------- | ---------------------------------------- |
| 1   | `getMe()` called 3+ times on every protected route navigation with no shared cache                                                   | 🔴 Critical | ✅ Resolved | `lib/auth.ts`, `AuthContextProvider.tsx` |
| 2   | `console.log('dashboard payload:', data)` shipped in production code                                                                 | 🔴 Critical | ✅ Resolved | `useDashboard.ts:19`                     |
| 3   | No React Query installed despite `msw` already present                                                                               | 🔴 Critical | ✅ Resolved | `package.json`                           |
| 4   | `useRoadmap` fires N+1 sequential requests (1 milestone fetch → N lesson fetches)                                                    | 🔴 Critical | ⏳ Pending  | `useRoadmap.ts:74–90`                    |
| 5   | `requireAccessibleLesson` fetches the full lesson on every navigation only to throw it away                                          | 🟠 High     | ⏳ Pending  | `lessonGuard.ts`                         |
| 6   | `AuthContextProvider` has `navigate` in the `useEffect` dependency array for language fetch — the effect re-runs on every navigation | 🟠 High     | ✅ Resolved | `useLanguageSelection.ts:33`             |
| 7   | 0% error boundary coverage — any thrown error in a page crashes silently                                                             | 🟠 High     | ⏳ Pending  | All route files                          |
| 8   | No retry logic on any fetch                                                                                                          | 🟡 Medium   | ⏳ Pending  | All hooks                                |
| 9   | No `staleTime` anywhere — would cause infinite refetch loops if React Query is adopted naively                                       | 🟡 Medium   | ✅ Resolved | Future                                   |
| 10  | `lib/axios.ts` is a 467-line god file mixing config, types, and all API functions                                                    | 🟡 Medium   | ✅ Resolved | `lib/axios.ts`                           |

---

## 1. Current State Analysis

### Inventory of All Async Operations

| Hook / Location                          | API Call(s)                                           | Stores in useState                          | Should be useQuery    | Notes                              |
| ---------------------------------------- | ----------------------------------------------------- | ------------------------------------------- | --------------------- | ---------------------------------- |
| `AuthContextProvider` (useEffect)        | `getMe()`                                             | `user`, `loading`                           | ✅ Yes                | Runs on every token change         |
| `requireAuth` (route loader)             | `getMe()`                                             | —                                           | ✅ Yes (prefetch)     | Duplicate call, result discarded   |
| `checkLanguageSelection` (route loader)  | `getMe()`                                             | —                                           | ✅ Yes (prefetch)     | Duplicate call, result discarded   |
| `requireAccessibleLesson` (route loader) | `fetchLessonById()`                                   | —                                           | ✅ Yes (prefetch)     | Fetches and discards               |
| `useDashboard.ts`                        | `fetchDashboardData()`                                | `dashboardData`, `loading`, `error`         | ✅ Yes                | Classic pattern                    |
| `useRoadmap.ts`                          | `fetchMilestones()` + `fetchLessonsByMilestone()` × N | `modules`, `loading`                        | ✅ Yes                | N+1 problem                        |
| `useBlockLessons.ts`                     | `fetchLessonById()`                                   | `currentLesson`                             | ✅ Yes                | Manual `refetchLesson()` callback  |
| `useBlockExercises.ts`                   | `fetchExerciseById()` × N                             | `exercises`, `loading`, `error`             | ✅ Yes                | Parallel fetches via `Promise.all` |
| `useDedicatedPractice.ts`                | `fetchExerciseById()`                                 | `exercise`, `loading`, `error`              | ✅ Yes                | Identical to above, single item    |
| `usePractice.ts`                         | `fetchExercises()` + `fetchWeaknessTags()`            | `exercises`, `weakTags`, `loading`, `error` | ✅ Yes                | Has manual 400ms debounce          |
| `useLanguageSelection.ts`                | `fetchLanguages()`                                    | `languages`, `fetching`                     | ✅ Yes                |                                    |
| `FeynmanInterviewPane` (useEffect)       | `fetchFeynmanHistory()` + `fetchFeynmanQuestion()`    | `messages`, `isInitializing`, `error`       | ✅ Yes (initial load) | Chat send is mutation              |

### What Should Remain Local State

| State                 | Location                      | Reason                               |
| --------------------- | ----------------------------- | ------------------------------------ |
| `activeTab`           | `DashboardPage`, `LessonPage` | Pure UI state                        |
| `isSidebarOpen`       | Multiple pages                | Pure UI state                        |
| `expandedModules`     | `useRoadmap`                  | UI accordion state                   |
| `selectedBlockId`     | `LessonPage`                  | UI selection state                   |
| `activeExerciseIndex` | `LessonPage`                  | UI tab state                         |
| `userInput`           | `FeynmanInterviewPane`        | Controlled input                     |
| `selected` (language) | `useLanguageSelection`        | Pending form selection               |
| `messages`            | `FeynmanInterviewPane`        | Chat conversation (local to session) |
| `exercisePassMap`     | `useBlockExercises`           | Ephemeral in-session pass tracking   |
| `blockCompleted`      | `useBlockExercises`           | Derived from `exercisePassMap`       |

---

## 2. Query Architecture

### Complete Query Key Factory

```typescript
// src/lib/queryKeys.ts
export const queryKeys = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },

  // ── Languages ─────────────────────────────────────────────────────────────
  languages: {
    all: ['languages'] as const,
    list: () => [...queryKeys.languages.all, 'list'] as const,
  },

  // ── Dashboard ─────────────────────────────────────────────────────────────
  dashboard: {
    all: ['dashboard'] as const,
    data: () => [...queryKeys.dashboard.all, 'data'] as const,
  },

  // ── Milestones / Roadmap ──────────────────────────────────────────────────
  milestones: {
    all: ['milestones'] as const,
    list: () => [...queryKeys.milestones.all, 'list'] as const,
    lessons: (milestoneId: string) =>
      [...queryKeys.milestones.all, milestoneId, 'lessons'] as const,
  },

  // ── Lessons ───────────────────────────────────────────────────────────────
  lessons: {
    all: ['lessons'] as const,
    detail: (lessonId: string) => [...queryKeys.lessons.all, lessonId] as const,
  },

  // ── Exercises ─────────────────────────────────────────────────────────────
  exercises: {
    all: ['exercises'] as const,
    // Single exercise detail (used in lesson blocks + dedicated practice)
    detail: (exerciseId: string) =>
      [...queryKeys.exercises.all, exerciseId] as const,
    // Paginated/filtered list (used in Practice library page)
    list: (filters: Record<string, unknown>) =>
      [...queryKeys.exercises.all, 'list', filters] as const,
    // Exercise attempt history
    history: (exerciseId: string) =>
      [...queryKeys.exercises.all, exerciseId, 'history'] as const,
  },

  // ── Weakness Tags ─────────────────────────────────────────────────────────
  tags: {
    all: ['tags'] as const,
    weakness: () => [...queryKeys.tags.all, 'weakness'] as const,
  },

  // ── Feynman ───────────────────────────────────────────────────────────────
  feynman: {
    all: ['feynman'] as const,
    history: (blockId: string) =>
      [...queryKeys.feynman.all, blockId, 'history'] as const,
    question: (blockId: string) =>
      [...queryKeys.feynman.all, blockId, 'question'] as const,
    stats: (blockId: string) =>
      [...queryKeys.feynman.all, blockId, 'stats'] as const,
  },
} as const;
```

**Key design rationale:**

- Arrays allow partial invalidation. `queryClient.invalidateQueries({ queryKey: queryKeys.feynman.all })` clears all Feynman state for a block.
- `filters` objects in `exercises.list` are serialized by TanStack Query automatically — safe for complex filter objects.
- `milestones.lessons(milestoneId)` is nested under milestones, not lessons, because the data lifecycle follows the milestone hierarchy.

---

## 3. Folder Structure

### Current Structure Assessment

The project already uses the `features/` pattern correctly. **Keep it.** The issue is that each feature folder has no internal sub-structure — API functions, hooks, and types are mixed together or dumped into `lib/axios.ts`.

### Recommended Production-Grade Structure

```text
src/
├── app/
│   ├── App.tsx                  # Router provider + QueryClientProvider
│   ├── main.tsx
│   └── queryClient.ts           # Shared QueryClient instance with defaults
│
├── features/
│   ├── auth/
│   │   ├── api/
│   │   │   └── auth.api.ts      # loginUser, registerUser, getMe
│   │   ├── hooks/
│   │   │   ├── useMe.ts         # useQuery wrapper for getMe
│   │   │   ├── useLogin.ts      # useMutation wrapper
│   │   │   ├── useRegister.ts   # useMutation wrapper
│   │   │   └── useLogout.ts     # useMutation wrapper
│   │   ├── context/
│   │   │   ├── AuthContext.ts
│   │   │   └── AuthProvider.tsx # Thin: reads from useMe, no fetch logic
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignUpForm.tsx
│   │   │   └── SignupPage.tsx
│   │   └── index.ts             # Public API barrel
│   │
│   ├── dashboard/
│   │   ├── api/
│   │   │   └── dashboard.api.ts
│   │   ├── hooks/
│   │   │   ├── useDashboardQuery.ts
│   │   │   └── useMilestonesQuery.ts
│   │   ├── components/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── LearningRoadmap.tsx
│   │   │   ├── StatsGrid.tsx
│   │   │   └── CurrentLessonBanner.tsx
│   │   └── index.ts
│   │
│   ├── lesson/
│   │   ├── api/
│   │   │   └── lesson.api.ts
│   │   ├── hooks/
│   │   │   ├── useLessonQuery.ts
│   │   │   └── useExercisesQuery.ts
│   │   ├── mutations/
│   │   │   ├── useSubmitExercise.ts
│   │   │   ├── useGetHint.ts
│   │   │   └── useExplainAnswer.ts
│   │   ├── components/
│   │   │   ├── LessonPage.tsx
│   │   │   ├── LessonSidebar.tsx
│   │   │   ├── TheoryPanel.tsx
│   │   │   └── ExerciseTabBar.tsx
│   │   └── index.ts
│   │
│   ├── interview/
│   │   ├── api/
│   │   │   └── feynman.api.ts
│   │   ├── hooks/
│   │   │   └── useFeynmanHistoryQuery.ts
│   │   ├── mutations/
│   │   │   ├── useSendFeynmanMessage.ts
│   │   │   └── useResetFeynmanHistory.ts
│   │   ├── components/
│   │   │   ├── FeynmanInterviewPane.tsx
│   │   │   └── MessageBubbles.tsx
│   │   └── index.ts
│   │
│   ├── practices/
│   │   ├── api/
│   │   │   └── practice.api.ts
│   │   ├── hooks/
│   │   │   ├── useExercisesListQuery.ts
│   │   │   └── useWeaknessTagsQuery.ts
│   │   ├── components/
│   │   │   ├── PracticePage.tsx
│   │   │   ├── PracticeLibrary.tsx
│   │   │   ├── PracticeFilters.tsx
│   │   │   ├── PracticeHero.tsx
│   │   │   └── ExerciseCard.tsx
│   │   └── index.ts
│   │
│   ├── dedicated_practice/
│   │   ├── hooks/
│   │   │   └── useDedicatedExerciseQuery.ts
│   │   ├── mutations/
│   │   │   └── useSubmitDedicatedExercise.ts
│   │   ├── components/
│   │   │   ├── DedicatedPracticePage.tsx
│   │   │   └── TaskPanel.tsx
│   │   └── index.ts
│   │
│   └── language_selection/
│       ├── api/
│       │   └── languages.api.ts
│       ├── hooks/
│       │   └── useLanguagesQuery.ts
│       ├── mutations/
│       │   └── useSaveLanguage.ts
│       ├── components/
│       │   ├── LanguageSelectionPage.tsx
│       │   ├── LanguageCard.tsx
│       │   └── SkeletonCard.tsx
│       └── index.ts
│
├── lib/
│   ├── axios.ts                 # ONLY: Axios instance + interceptors (slim)
│   ├── queryKeys.ts             # Central query key factory
│   ├── queryClient.ts           # QueryClient with global defaults
│   ├── auth.ts                  # Route guards (updated to use queryClient)
│   ├── lessonGuard.ts
│   ├── syntax.ts
│   └── utils.ts
│
├── components/
│   ├── ui/                      # shadcn components
│   ├── navbar/
│   ├── sidebar/
│   ├── practice_utils/
│   └── error/
│       ├── ErrorBoundary.tsx    # [NEW]
│       └── QueryErrorBoundary.tsx  # [NEW]
│
├── types/
│   ├── auth.ts
│   ├── languageSelection.ts
│   └── api/                    # [NEW] Response DTO types (extracted from axios.ts)
│       ├── learning.types.ts
│       ├── exercise.types.ts
│       ├── feynman.types.ts
│       └── dashboard.types.ts
│
└── routes/
    ├── __root.tsx
    ├── dashboard.tsx
    ├── lesson.$lessonId.tsx
    ├── practice.tsx
    └── ...
```

---

## 4. Query Conversion Opportunities

### All `useEffect` → `useQuery` Conversions

---

#### 4.1 `useDashboard.ts` → `useDashboardQuery.ts`

**Current:**

```typescript
// 39 lines of boilerplate
useEffect(() => {
  async function getDetails() {
    setLoading(true);
    const data = await fetchDashboardData();
    setDashboardData(data);
  }
  void getDetails();
}, []);
```

**After:**

```typescript
export function useDashboardQuery() {
  return useQuery({
    queryKey: queryKeys.dashboard.data(),
    queryFn: fetchDashboardData,
    staleTime: 60_000, // 1 minute — dashboard stats don't change per keystroke
    gcTime: 5 * 60_000,
  });
}
```

- **Benefit:** Automatic background refetch on window focus, built-in loading/error states, zero boilerplate, shared cache across components
- **Pitfall:** None — this is a pure read
- **Complexity:** 🟢 Low

---

#### 4.2 `useRoadmap.ts` → `useMilestonesQuery.ts` (N+1 elimination)

**Current problem:** Fetches all milestones sequentially, then fires one fetch per milestone for lessons — uncoordinated.

**After:**

```typescript
// useMilestonesQuery.ts
export function useMilestonesQuery() {
  return useQuery({
    queryKey: queryKeys.milestones.list(),
    queryFn: fetchMilestones,
    staleTime: 2 * 60_000,
  });
}

// useMilestoneLessonsQuery.ts — enabled dependent query
export function useMilestoneLessonsQuery(milestoneId: string) {
  return useQuery({
    queryKey: queryKeys.milestones.lessons(milestoneId),
    queryFn: () => fetchLessonsByMilestone(milestoneId),
    enabled: Boolean(milestoneId),
    staleTime: 2 * 60_000,
  });
}
```

Or use `useQueries` for parallel fetching once milestones are loaded:

```typescript
export function useAllMilestoneLessons(milestoneIds: string[]) {
  return useQueries({
    queries: milestoneIds.map((id) => ({
      queryKey: queryKeys.milestones.lessons(id),
      queryFn: () => fetchLessonsByMilestone(id),
      staleTime: 2 * 60_000,
    })),
  });
}
```

- **Benefit:** Parallel fetches instead of sequential; each milestone's lessons is independently cached
- **Pitfall:** UI must handle partial loading gracefully (some milestones may load before others)
- **Complexity:** 🟡 Medium

---

#### 4.3 `useBlockLessons.ts` → `useLessonQuery.ts`

**Current problem:** Manual `refetchLesson()` callback, no loading state, error swallowed silently.

**After:**

```typescript
export function useLessonQuery(lessonId: string) {
  return useQuery({
    queryKey: queryKeys.lessons.detail(lessonId),
    queryFn: () => fetchLessonById(lessonId),
    enabled: Boolean(lessonId),
    staleTime: 30_000,
  });
}
```

The `refetchLesson()` callback is replaced by `queryClient.invalidateQueries({ queryKey: queryKeys.lessons.detail(lessonId) })` inside the Feynman `onComplete` mutation.

- **Benefit:** Cache can be pre-populated from route loader; eliminates manual refetch callback
- **Pitfall:** Lesson data changes after Feynman pass — need explicit invalidation (covered in §6)
- **Complexity:** 🟢 Low

---

#### 4.4 `useBlockExercises.ts` (fetch part) → `useExercisesQuery.ts`

**Current problem:** `Promise.all` inside `useEffect`, re-runs on every `blockId` change with no caching.

**After:**

```typescript
export function useBlockExercisesQuery(exerciseIds: string[]) {
  return useQueries({
    queries: exerciseIds.map((id) => ({
      queryKey: queryKeys.exercises.detail(id),
      queryFn: () => fetchExerciseById(id),
      staleTime: Infinity, // Exercise definitions never change mid-session
    })),
    combine: (results) => ({
      data: results.map((r) => r.data).filter(Boolean),
      isLoading: results.some((r) => r.isLoading),
      isError: results.some((r) => r.isError),
    }),
  });
}
```

- **Benefit:** Each exercise is individually cached — switching blocks doesn't refetch exercises already seen
- **Pitfall:** Need to derive `exerciseIds` from the lesson query result — dependent query pattern required
- **Complexity:** 🟡 Medium

---

#### 4.5 `usePractice.ts` → `useExercisesListQuery.ts` + `useWeaknessTagsQuery.ts`

**Current problem:** Manual 400ms debounce, `isMounted` flag, two concurrent fetches, all in one effect.

**After:**

```typescript
// useExercisesListQuery.ts
export function useExercisesListQuery(filters: FetchExercisesParams) {
  return useQuery({
    queryKey: queryKeys.exercises.list(filters),
    queryFn: () => fetchExercises(filters),
    placeholderData: keepPreviousData, // Keeps old list visible while new filters load
    staleTime: 30_000,
  });
}

// useWeaknessTagsQuery.ts
export function useWeaknessTagsQuery() {
  return useQuery({
    queryKey: queryKeys.tags.weakness(),
    queryFn: fetchWeaknessTags,
    staleTime: 5 * 60_000, // Weakness tags are slow to change
  });
}
```

The debounce moves to a `useDebouncedValue` utility that produces the `filters` object, not inside the query.

- **Benefit:** `keepPreviousData` replaces the manual debounce UX; weakness tags cached across page visits
- **Pitfall:** Debounce logic must now live outside the hook — `useDebouncedFilters` utility needed
- **Complexity:** 🟡 Medium

---

#### 4.6 `FeynmanInterviewPane` (useEffect init) → `useFeynmanHistoryQuery`

**Current problem:** `useEffect` + `useCallback` for init, `useState` for messages, manual `isInitializing`, error handling in catch.

**After:**

```typescript
export function useFeynmanHistoryQuery(blockId: string) {
  return useQuery({
    queryKey: queryKeys.feynman.history(blockId),
    queryFn: () => fetchFeynmanHistory(blockId),
    staleTime: 0, // Chat history must always be fresh on mount
    gcTime: 0, // Don't cache between different block visits
    retry: 1,
  });
}
```

The `messages` state is initialized from the query result. `initializeSession` becomes `queryClient.invalidateQueries(queryKeys.feynman.history(blockId))`.

- **Benefit:** Retry built-in, loading state standardized, "Retry" button replaced by query refetch
- **Pitfall:** The `messages` list is partly server state (history) and partly client state (new messages typed this session). Must merge them: seed from query data, append locally on send.
- **Complexity:** 🟠 High (careful merging of server + local chat messages required)

---

#### 4.7 `AuthContextProvider` (useEffect on token) → `useMeQuery`

**Current problem:** Fires a network call on every token change, result stored in context state.

**After:**

```typescript
export function useMeQuery() {
  const token = getAccessToken();
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: getMe,
    enabled: Boolean(token),
    staleTime: 5 * 60_000,
    retry: false, // Don't retry 401s
  });
}
```

AuthProvider becomes thin — just reads from `useMeQuery()`, no effect.

- **Benefit:** Route guards share the same cache entry — `getMe()` fires once per 5 minutes max instead of 3+ times per navigation
- **Pitfall:** The 401 interceptor must call `queryClient.clear()` so the stale `auth.me` cache is purged on session expiry
- **Complexity:** 🟢 Low

---

## 5. Mutation Architecture

### Complete Mutation Catalog

---

#### 5.1 Login

```typescript
export function useLoginMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: AuthPayload) => loginUser(payload),
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token!);
      // Seed the auth cache immediately — no extra network request
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      void navigate({ to: '/language-selection' });
    },
  });
}
```

**Invalidation:** `auth.me` — forces a fresh `getMe` on next use.
**Optimistic update:** Not needed — login is not idempotent.

---

#### 5.2 Register

```typescript
export function useRegisterMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (payload: AuthPayload) => registerUser(payload),
    onSuccess: (data) => {
      if (data.access_token) {
        localStorage.setItem('token', data.access_token);
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
        void navigate({ to: '/language-selection' });
      } else {
        void navigate({ to: '/login' });
      }
    },
  });
}
```

---

#### 5.3 Logout

```typescript
export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem('token');
    },
    onSettled: () => {
      queryClient.clear(); // Wipe all cached data
      void navigate({ to: '/login' });
    },
  });
}
```

**Invalidation:** Full cache clear via `queryClient.clear()`.

---

#### 5.4 Language Selection

```typescript
export function useSaveLanguageMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: (language: Language) => saveLanguage(language),
    onSuccess: () => {
      // User's selectedLanguage has changed — invalidate all dependent data
      void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.milestones.all,
      });
      void navigate({ to: '/dashboard' });
    },
  });
}
```

**Optimistic update:** Could optimistically set `auth.me` with new language to avoid a flash.

---

#### 5.5 Exercise Submit

```typescript
export function useSubmitExerciseMutation(lessonId?: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      exerciseId,
      answer,
    }: {
      exerciseId: string;
      answer: unknown;
    }) => submitExerciseAnswer(exerciseId, answer),
    onSuccess: (_, { exerciseId }) => {
      // Invalidate the exercise history for analytics
      void queryClient.invalidateQueries({
        queryKey: queryKeys.exercises.history(exerciseId),
      });
      // If in lesson context, dashboard stats are stale
      void queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      // Weakness tags may have updated
      void queryClient.invalidateQueries({
        queryKey: queryKeys.tags.weakness(),
      });
    },
  });
}
```

**Optimistic update:** Can optimistically mark exercise as `correct: true` in the pass map before the response — reduces perceived latency.

---

#### 5.6 Hint Request

```typescript
export function useGetHintMutation() {
  return useMutation({
    mutationFn: ({
      exerciseId,
      level,
    }: {
      exerciseId: string;
      level?: number;
    }) => getExerciseHint(exerciseId, level),
    // Hints are not cached — each request generates a context-aware hint
  });
}
```

**Cache strategy:** Do not cache. Each hint call is context-dependent.

---

#### 5.7 Explain Answer (AI)

```typescript
export function useExplainAnswerMutation() {
  return useMutation({
    mutationFn: ({
      exerciseId,
      answer,
    }: {
      exerciseId: string;
      answer: unknown;
    }) => explainExerciseAnswer(exerciseId, answer),
  });
}
```

---

#### 5.8 Feynman Chat Send

```typescript
export function useSendFeynmanMessageMutation(
  blockId: string,
  lessonId: string
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => sendFeynmanMessage(blockId, message),
    onSuccess: (result) => {
      if (result.isPassed) {
        // Block has been completed — lesson structure changed
        void queryClient.invalidateQueries({
          queryKey: queryKeys.lessons.detail(lessonId),
        });
        // Feynman history is now stale
        void queryClient.invalidateQueries({
          queryKey: queryKeys.feynman.history(blockId),
        });
        // Dashboard milestone progress changed
        void queryClient.invalidateQueries({
          queryKey: queryKeys.dashboard.all,
        });
        void queryClient.invalidateQueries({
          queryKey: queryKeys.milestones.all,
        });
      }
    },
  });
}
```

---

## 6. Cache Invalidation Strategy

### Invalidation Matrix

| Trigger                                   | Invalidate                                                                                | Reason                                  |
| ----------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------- |
| **Login success**                         | `auth.me`                                                                                 | Force fresh user fetch                  |
| **Logout**                                | ALL (queryClient.clear())                                                                 | Security: clear all user data           |
| **Register success**                      | `auth.me`                                                                                 | Refresh user profile                    |
| **Language selection save**               | `auth.me`, `dashboard.all`, `milestones.all`                                              | User's language changes all content     |
| **Exercise submit (correct)**             | `exercises.history(id)`, `dashboard.all`, `tags.weakness`                                 | Progress updated, stats change          |
| **Exercise submit (incorrect)**           | `exercises.history(id)`, `tags.weakness`                                                  | Failure rate updated                    |
| **Hint requested**                        | _(none)_                                                                                  | Hints are fire-and-forget               |
| **Feynman message sent + isPassed=true**  | `lessons.detail(lessonId)`, `feynman.history(blockId)`, `dashboard.all`, `milestones.all` | Block unlocked, lesson progress changed |
| **Feynman message sent + isPassed=false** | `feynman.history(blockId)`                                                                | Update conversation history             |
| **Route navigation to lesson**            | _(prefetch, no invalidation)_                                                             | Data may already be valid               |
| **Window focus**                          | _(handled automatically by React Query)_                                                  | Background staleness check              |
| **401 response**                          | ALL (queryClient.clear())                                                                 | Session expired                         |

### Implementation — Global Invalidation on 401

```typescript
// lib/axios.ts
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('token');
      // Lazy import to avoid circular dependency
      import('./queryClient').then(({ queryClient }) => {
        queryClient.clear();
      });
    }
    return Promise.reject(
      error instanceof Error ? error : new Error('Unknown error')
    );
  }
);
```

---

## 7. Authentication Integration

### Current Problems

1. **`getMe()` is called 3 times per protected navigation:**
   - Once in `requireAuth()` (route guard)
   - Once in `checkLanguageSelection()` (route guard)
   - Once in `AuthContextProvider`'s `useEffect`

2. **Auth context stores `user` in local state** — not in React Query cache — so context and cache can diverge.

3. **Route guards call `getMe` and throw the result away** — the `requireAuth` function fetches user data only to check `selectedLanguage`, then discards the response. The component mounts and fetches it again.

### Recommended Architecture

```typescript
// lib/queryClient.ts — shared singleton
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) return false;
        return failureCount < 2;
      },
    },
  },
});

// features/auth/hooks/useMeQuery.ts
export function useMeQuery() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: getMe,
    enabled: Boolean(getAccessToken()),
    staleTime: 5 * 60_000,
    retry: false,
  });
}

// features/auth/context/AuthProvider.tsx — thin wrapper
export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user } = useMeQuery();
  // No useEffect, no manual fetch — reading from cache only
  return (
    <AuthContext.Provider value={{ user: user ?? null }}>
      {children}
    </AuthContext.Provider>
  );
}

// lib/auth.ts — route guards use queryClient directly
export const requireAuth = async () => {
  const token = getAccessToken();
  if (!token) throw redirect({ to: '/login' });

  try {
    // ensureQueryData: returns cached data if fresh, fetches otherwise
    const user = await queryClient.ensureQueryData({
      queryKey: queryKeys.auth.me(),
      queryFn: getMe,
      staleTime: 5 * 60_000,
    });
    if (!user?.selectedLanguage?.length) throw redirect({ to: '/language-selection' });
  } catch (err) {
    if (err instanceof RedirectError) throw err; // Re-throw router redirects
    localStorage.removeItem('token');
    throw redirect({ to: '/login' });
  }
};
```

**Result:** `getMe()` fires at most once per 5 minutes regardless of how many guards or components request it.

---

## 8. Router Integration

### Recommended Loader + Prefetch Strategy

TanStack Router's `loader` function runs before the component mounts and can be integrated with React Query via `queryClient.ensureQueryData`.

```typescript
// routes/dashboard.tsx
export const Route = createFileRoute('/dashboard')({
  beforeLoad: requireAuth,
  loader: async () => {
    // Prefetch in parallel — do not await, let the component render with cached data
    void queryClient.prefetchQuery({
      queryKey: queryKeys.dashboard.data(),
      queryFn: fetchDashboardData,
      staleTime: 60_000,
    });
    void queryClient.prefetchQuery({
      queryKey: queryKeys.milestones.list(),
      queryFn: fetchMilestones,
      staleTime: 2 * 60_000,
    });
  },
  component: DashboardPage,
});
```

```typescript
// routes/lesson.$lessonId.tsx
export const Route = createFileRoute('/lesson/$lessonId')({
  beforeLoad: requireAuth,
  loader: async ({ params }) => {
    // ensureQueryData: blocks navigation until data is ready (used for access check)
    const lesson = await queryClient.ensureQueryData({
      queryKey: queryKeys.lessons.detail(params.lessonId),
      queryFn: () => fetchLessonById(params.lessonId),
      staleTime: 30_000,
    });
    const isBlocked = lesson.blocks?.every((b) => b.status === 'locked');
    if (isBlocked) throw redirect({ to: '/dashboard' });
    // The lesson is now in cache — LessonPage's useQuery returns immediately
  },
  component: LessonPage,
});
```

```typescript
// routes/practice.tsx
export const Route = createFileRoute('/practice')({
  beforeLoad: requireAuth,
  loader: async () => {
    // Prefetch weakness tags — slow to compute on backend
    void queryClient.prefetchQuery({
      queryKey: queryKeys.tags.weakness(),
      queryFn: fetchWeaknessTags,
      staleTime: 5 * 60_000,
    });
  },
  component: PracticePage,
});
```

**Key distinction:** Use `ensureQueryData` when you need the data to render or make a guard decision. Use `prefetchQuery` when you want to warm the cache but not block navigation.

---

## 9. Performance Review

### Identified Issues

| Issue                                                         | Location                             | Impact                                                 |
| ------------------------------------------------------------- | ------------------------------------ | ------------------------------------------------------ |
| N+1 requests: 1 milestone fetch → N sequential lesson fetches | `useRoadmap.ts:74–90`                | 🔴 Each navigation fires 3–5 requests sequentially     |
| `getMe` called 3x per navigation                              | `lib/auth.ts`, `AuthContextProvider` | 🔴 3 duplicate network calls                           |
| Zero caching — every component mount triggers a fetch         | All hooks                            | 🟠 Dashboard re-fetches on every tab switch            |
| `lessonGuard` fetches full lesson and discards it             | `lessonGuard.ts`                     | 🟠 Wasted request on lesson navigation                 |
| `useLanguageSelection` has `navigate` in dep array            | `useLanguageSelection.ts:33`         | 🟡 Potential double-fetch on navigate reference change |
| Weakness tags fetched fresh every time Practice page renders  | `usePractice.ts`                     | 🟡 Slow endpoint, changes infrequently                 |

### Recommended `staleTime` / `gcTime` Configuration

| Query                      | staleTime  | gcTime | Reasoning                                    |
| -------------------------- | ---------- | ------ | -------------------------------------------- |
| `auth.me`                  | 5 min      | 10 min | User profile rarely changes mid-session      |
| `dashboard.data`           | 1 min      | 5 min  | Stats update on exercise complete            |
| `milestones.list`          | 2 min      | 10 min | Milestone structure is stable                |
| `milestones.lessons(id)`   | 2 min      | 10 min | Lesson list stable within session            |
| `lessons.detail(id)`       | 30 sec     | 5 min  | Block status changes after Feynman           |
| `exercises.detail(id)`     | `Infinity` | 30 min | Exercise definitions never change            |
| `exercises.list(filters)`  | 30 sec     | 5 min  | Filter-based list                            |
| `exercises.history(id)`    | 0          | 5 min  | Always need fresh attempt history            |
| `tags.weakness`            | 5 min      | 30 min | Weakness data computed server-side, slow     |
| `feynman.history(blockId)` | 0          | 0      | Fresh on every visit, no cross-session value |
| `languages.list`           | `Infinity` | 60 min | Language options never change                |

### Select Transforms (Memoized Derived State)

```typescript
// Derive current active block from lesson — avoids full re-render on partial updates
export function useLessonQuery(lessonId: string) {
  return useQuery({
    queryKey: queryKeys.lessons.detail(lessonId),
    queryFn: () => fetchLessonById(lessonId),
    select: (data) => ({
      ...data,
      activeBlock:
        data.blocks.find((b) => b.status === 'active') ?? data.blocks[0],
    }),
  });
}
```

---

## 10. Error Handling Strategy

### Responsibility Assignment

| Concern                    | Owner                          | Implementation                                                    |
| -------------------------- | ------------------------------ | ----------------------------------------------------------------- |
| **401 Unauthorized**       | Axios interceptor              | Clear token, call `queryClient.clear()`, let route guard redirect |
| **Query errors (non-401)** | `QueryErrorBoundary` per route | Wrap each route in a boundary with a "Retry" fallback             |
| **Mutation errors**        | Mutation `onError` callback    | Set local error state in the form/component                       |
| **Network errors**         | React Query retry config       | Global: retry 2 times with exponential backoff, skip 401          |
| **Parsing errors**         | Zod validation (future)        | Validate response shape at API layer                              |

### Global Error Configuration

```typescript
// lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401)
          return false;
        if (axios.isAxiosError(error) && error.response?.status === 404)
          return false;
        return failureCount < 2;
      },
      throwOnError: false, // Let QueryErrorBoundary handle it
    },
    mutations: {
      onError: (error) => {
        // Global fallback — feature-level handlers take priority
        if (axios.isAxiosError(error) && error.response?.status !== 401) {
          toast.error('Something went wrong. Please try again.');
        }
      },
    },
  },
});
```

---

## 11. Loading State Strategy

### Principles

- **No full-page spinners.** Use skeleton components for initial loads.
- **Inline loading** for mutations (button `isPending` state).
- **`keepPreviousData`** for paginated/filtered lists (no flash of empty content).
- **Background refetch** is invisible — don't show a loading indicator for background updates.

### Pattern per Context

| Context                         | Pattern                       | Implementation                                                    |
| ------------------------------- | ----------------------------- | ----------------------------------------------------------------- |
| Dashboard initial load          | Skeleton cards                | `isLoading` from `useDashboardQuery` → render `<StatsSkeleton />` |
| Roadmap initial load            | Skeleton accordion rows       | `isLoading` from `useMilestonesQuery`                             |
| Lesson page load                | Content shimmer               | `isLoading` from `useLessonQuery`                                 |
| Exercise list (Practice page)   | Keep old list visible         | `placeholderData: keepPreviousData`                               |
| Exercise detail load            | Skeleton exercise card        | `isLoading` from `useExercisesQuery`                              |
| Feynman init                    | "Loading session…" + spinner  | `isInitializing` from `useFeynmanHistoryQuery`                    |
| Mutations (submit, save, login) | Button `isPending` + disabled | `mutation.isPending` on button                                    |
| Language selection save         | Button spinner                | `useSaveLanguageMutation().isPending`                             |

---

## 12. Advanced React Query Opportunities

| Feature                     | Applicable?             | Rationale                                                                                  |
| --------------------------- | ----------------------- | ------------------------------------------------------------------------------------------ |
| **`useQueries` (Parallel)** | ✅ Yes — High value     | Replace `Promise.all` in `useBlockExercises` and `useRoadmap`                              |
| **Dependent Queries**       | ✅ Yes — High value     | Exercise queries depend on lesson query result; milestone lessons depend on milestone list |
| **`keepPreviousData`**      | ✅ Yes — High value     | Practice page filter changes — prevents flash of empty list                                |
| **Prefetching in loaders**  | ✅ Yes — High value     | Pre-warm cache before component mounts; see §8                                             |
| **`staleTime: Infinity`**   | ✅ Yes — Medium value   | Exercise definitions never change — safe to cache forever                                  |
| **Select transforms**       | ✅ Yes — Medium value   | Derive `activeBlock` from lesson query without extra state                                 |
| **Optimistic updates**      | 🟡 Optional — Low value | Exercise submit could optimistically show "correct" — but the server is fast               |
| **Placeholder data**        | 🟡 Optional — Low value | Could show stale lesson data while refetching; risk of outdated block status shown         |
| **Infinite queries**        | ❌ Not needed           | Exercise list uses simple pagination, not infinite scroll                                  |
| **SSR / Hydration**         | ❌ Not applicable       | CSR-only Vite app                                                                          |
| **Suspense mode**           | 🟡 Future consideration | Requires React Suspense boundaries; deferred to Phase 3                                    |

---

## 13. Missing Infrastructure

### Priority Matrix

#### 🔴 Critical (must have before React Query adoption)

| Item                       | Description                                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------ |
| **TanStack Query install** | `yarn add @tanstack/react-query @tanstack/react-query-devtools`                                  |
| **Shared `QueryClient`**   | Single instance exported from `lib/queryClient.ts`, passed to `QueryClientProvider` in `App.tsx` |
| **Query Key Factory**      | `lib/queryKeys.ts` as designed in §2                                                             |
| **Split `lib/axios.ts`**   | Extract API functions into `features/<name>/api/*.ts`, keep only Axios config in `lib/axios.ts`  |
| **Error Boundaries**       | At minimum, one `<QueryErrorBoundary>` per route-level component                                 |
| **Remove `console.log`**   | `useDashboard.ts:19` — production log leak                                                       |

#### 🟠 Recommended (Phase 2)

| Item                            | Description                                                                      |
| ------------------------------- | -------------------------------------------------------------------------------- |
| **`useDebouncedValue` utility** | Replace the manual 400ms timer in `usePractice`                                  |
| **Response type extraction**    | Move all `interface *Response` types from `lib/axios.ts` to `src/types/api/`     |
| **MSW integration**             | Already installed — wire up handlers for unit tests                              |
| **Auth context slimming**       | Remove `login`, `register`, `logout` from context; expose them as mutation hooks |

#### 🟡 Nice-to-Have (Phase 3)

| Item                                 | Description                                                                   |
| ------------------------------------ | ----------------------------------------------------------------------------- |
| **Zod validation**                   | Validate all API response shapes at runtime                                   |
| **Query hook unit tests**            | Test each `useQuery` hook with `renderHook` + MSW                             |
| **`@tanstack/react-query-devtools`** | Already budgeted — enable behind `import.meta.env.DEV` flag                   |
| **Optimistic updates**               | For exercise submit — immediate feedback before server response               |
| **React Suspense mode**              | Declarative loading with `<Suspense>` — requires React 19 concurrent features |

---

## 14. Final Refactoring Roadmap

### Phase 1 — Quick Wins (Est. 2–3 days, 🟢 Low Risk) — ✅ COMPLETED

> Goal: Install React Query, eliminate the most painful duplicate-fetch and boilerplate problems.

| Task                                                      | Effort | Risk      | Benefit                         | Status  |
| --------------------------------------------------------- | ------ | --------- | ------------------------------- | ------- |
| Install `@tanstack/react-query` and `devtools`            | 30 min | 🟢 None   | Unlocks everything              | ✅ Done |
| Create `lib/queryClient.ts` with global defaults          | 1 hr   | 🟢 None   | Foundation                      | ✅ Done |
| Create `lib/queryKeys.ts` factory                         | 1 hr   | 🟢 None   | Foundation                      | ✅ Done |
| Wrap `App.tsx` in `<QueryClientProvider>`                 | 30 min | 🟢 None   | Foundation                      | ✅ Done |
| Remove `console.log` from `useDashboard.ts`               | 5 min  | 🟢 None   | Production hygiene              | ✅ Done |
| Convert `useDashboard.ts` → `useDashboardQuery`           | 1 hr   | 🟢 Low    | Immediate boilerplate reduction | ✅ Done |
| Convert `useBlockLessons.ts` → `useLessonQuery`           | 1 hr   | 🟢 Low    | Shared cache                    | ✅ Done |
| Convert `AuthContextProvider` useEffect → `useMeQuery`    | 2 hr   | 🟡 Medium | Eliminate 3x duplicate calls    | ✅ Done |
| Update `requireAuth` to use `queryClient.ensureQueryData` | 1 hr   | 🟡 Medium | Kills 2 redundant `getMe` calls | ✅ Done |

**Expected outcome:** `getMe` goes from 3+ calls → 1 call per 5 minutes. Dashboard boilerplate removed. Foundation set. All Phase 1 tasks are fully verified and operational.

---

### Phase 2 — Structural Improvements (Est. 1 week, 🟡 Medium Risk) — ⏳ IN PROGRESS

> Goal: Convert all remaining hooks, implement mutations, set up invalidation.

| Task                                                                     | Effort | Risk      | Benefit                                 | Status  |
| ------------------------------------------------------------------------ | ------ | --------- | --------------------------------------- | ------- |
| Split `lib/axios.ts` — move API fns to feature `api/` dirs               | 3 hr   | 🟡 Medium | Maintainability                         | ✅ Done |
| Convert `useRoadmap` → `useQueries` parallel fetch                       | 2 hr   | 🟡 Medium | Eliminates N+1, roadmap loads 3x faster | ✅ Done |
| Convert `useBlockExercises` fetch → `useQueries`                         | 2 hr   | 🟡 Medium | Exercise caching across blocks          | ✅ Done |
| Convert `useDedicatedPractice` → `useDedicatedExerciseQuery`             | 1 hr   | 🟢 Low    |                                         | ✅ Done |
| Convert `usePractice` → `useExercisesListQuery` + `useWeaknessTagsQuery` | 2 hr   | 🟡 Medium |                                         | ✅ Done |
| Convert `useLanguageSelection` fetch → `useLanguagesQuery`               | 1 hr   | 🟢 Low    |                                         | ✅ Done |
| Implement all 8 mutations (`useLogin`, `useRegister`, etc.)              | 4 hr   | 🟡 Medium | Structured error/success handling       | ✅ Done |
| Implement cache invalidation matrix                                      | 2 hr   | 🟡 Medium | Data consistency after mutations        | ✅ Done |
| Add route loaders with `prefetchQuery`                                   | 2 hr   | 🟡 Medium | Perceived performance improvement       | ✅ Done |
| Update lesson route loader to replace `lessonGuard.ts`                   | 1 hr   | 🟡 Medium | Eliminate redundant lesson fetch        | ✅ Done |
| Add `QueryErrorBoundary` per route                                       | 2 hr   | 🟢 Low    | Error UX                                | ✅ Done |

---

### Phase 3 — Advanced Optimization (Est. 3–5 days, 🟠 Medium-High Risk) — ⏳ IN PROGRESS

> Goal: Performance polish, developer tooling, test infrastructure.

| Task                                                           | Effort | Risk      | Benefit                       | Status     |
| -------------------------------------------------------------- | ------ | --------- | ----------------------------- | ---------- |
| Feynman history → `useFeynmanHistoryQuery` (complex merge)     | 4 hr   | 🟠 High   | Standardized loading + retry  | ✅ Done    |
| Implement `useDebouncedValue` utility + refactor `usePractice` | 2 hr   | 🟡 Medium | Cleaner debounce              | ✅ Done    |
| Extract all response types to `src/types/api/`                 | 2 hr   | 🟢 Low    | Maintainability               | ✅ Done    |
| Slim down `AuthContext` — remove mutation fns                  | 2 hr   | 🟡 Medium | Context is read-only; simpler | ✅ Done    |
| Add Zod schemas for API responses                              | 4 hr   | 🟡 Medium | Runtime safety                | ⏳ Pending |
| Wire up MSW for unit tests                                     | 3 hr   | 🟡 Medium | Test isolation                | ⏳ Pending |
| Write query hook tests with `renderHook` + MSW                 | 4 hr   | 🟡 Medium | Confidence                    | ⏳ Pending |
| Evaluate optimistic updates for exercise submit                | 2 hr   | 🟠 High   | UX (minor — backend is fast)  | ⏳ Pending |
| Enable `@tanstack/react-query-devtools` behind `DEV` flag      | 30 min | 🟢 None   | DX                            | ✅ Done    |

---

## Architecture Recommendations Summary

### Folder Structure Verdict

**Keep `features/`** — it's the right foundation. Add `api/`, `hooks/`, and `mutations/` subdirectories per feature. Do **not** flatten everything into a global `hooks/` directory; that pattern loses co-location benefits.

### Query Key Verdict

Use the **factory pattern** in §2 — typed, hierarchical, tree-shakeable, and supports partial invalidation cleanly.

### Cache Invalidation Verdict

**Rule of thumb:** Always invalidate the narrowest possible key. Only escalate to `dashboard.all` or `milestones.all` when user-visible progress metrics have changed. Never use `queryClient.clear()` except on logout or 401.

### Auth Verdict

The current dual-system (AuthContext + route guards both calling `getMe`) is the biggest performance and consistency bug. **Fix this first.** Move to `useMeQuery` + `queryClient.ensureQueryData` in guards.

### Router Verdict

Use `loader` for prefetching and **replace** `lessonGuard.ts` with `queryClient.ensureQueryData` inside the route loader — both the guard check and the data fetch become one cached operation.

---

## Prioritized Action List

| Priority | Action                                       | Effort | Impact                                         | Status     |
| -------- | -------------------------------------------- | ------ | ---------------------------------------------- | ---------- |
| 1        | Install `@tanstack/react-query`              | 30 min | 🔴 Blocking all other work                     | ✅ Done    |
| 2        | Create `queryClient.ts` + `queryKeys.ts`     | 1.5 hr | 🔴 Foundation                                  | ✅ Done    |
| 3        | Wrap app in `<QueryClientProvider>`          | 30 min | 🔴 Blocking all other work                     | ✅ Done    |
| 4        | Remove `console.log` in `useDashboard`       | 5 min  | 🟠 Production hygiene                          | ✅ Done    |
| 5        | Convert `AuthContextProvider` → `useMeQuery` | 2 hr   | 🔴 3x duplicate call elimination               | ✅ Done    |
| 6        | Update route guards to `ensureQueryData`     | 1 hr   | 🔴 Eliminates 2 more duplicate calls           | ✅ Done    |
| 7        | Convert `useDashboard` → `useDashboardQuery` | 1 hr   | 🟠 Boilerplate + caching                       | ✅ Done    |
| 8        | Convert `useBlockLessons` → `useLessonQuery` | 1 hr   | 🟠 Lesson cache for route preload              | ✅ Done    |
| 9        | Update lesson route loader                   | 1 hr   | 🟠 Data already in cache when component mounts | ✅ Done    |
| 10       | Convert `useRoadmap` → `useQueries` parallel | 2 hr   | 🟠 N+1 elimination                             | ✅ Done    |
| 11       | Implement all 8 mutations with invalidation  | 4 hr   | 🟠 Data consistency                            | ✅ Done    |
| 12       | Convert remaining 4 hooks to `useQuery`      | 4 hr   | 🟡 Consistency                                 | ✅ Done    |
| 13       | Add error boundaries per route               | 2 hr   | 🟡 Error UX                                    | ✅ Done    |
| 15       | Extract types from `lib/axios.ts`            | 2 hr   | 🟡 Maintainability                             | ✅ Done    |
| 16       | Add Zod + MSW + query hook tests             | 8 hr   | 🟡 Confidence                                  | ⏳ Pending |
