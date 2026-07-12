# CodeStep — Frontend Routing Reference

## Stack

- **Router**: TanStack Router (file-based routes under `src/routes/`)
- **Auth state**: `localStorage` token + `queryClient.ensureQueryData(getMe)` (5-min stale time)
- **Guards**: `beforeLoad` hooks on each protected route
- **Data prefetching**: fire-and-forget `queryClient.prefetchQuery` calls in route `loader`s

---

## Route Map

| Route                             | File                                 | Component               | Protected              |
| --------------------------------- | ------------------------------------ | ----------------------- | ---------------------- |
| `/`                               | `index.tsx`                          | Redirect only           | —                      |
| `/login`                          | `login.lazy.tsx`                     | `LoginPage`             | No                     |
| `/signup`                         | `signup.lazy.tsx`                    | `SignUpPage`            | No                     |
| `/language-selection`             | `language-selection.tsx`             | `LanguageSelectionPage` | Partial                |
| `/dashboard`                      | `dashboard.tsx`                      | `DashboardPage`         | ✅ Full                |
| `/practice`                       | `practice.tsx`                       | `PracticePage`          | ✅ Full                |
| `/leaderboard`                    | `leaderboard.tsx`                    | `LeaderboardPage`       | ✅ Full                |
| `/lesson/$lessonId`               | `lesson.$lessonId.tsx`               | `LessonPage`            | ✅ Full + lesson guard |
| `/practice-dedicated/$exerciseId` | `practice-dedicated.$exerciseId.tsx` | `DedicatedPracticePage` | ✅ Full                |

---

## Guard Functions

### `requireAuth` — `src/lib/auth.ts`

Used by: `/dashboard`, `/practice`, `/leaderboard`, `/lesson/$lessonId`, `/practice-dedicated/$exerciseId`

```
1. Read token from localStorage
   └─ No token → redirect /login

2. queryClient.ensureQueryData(getMe, staleTime: 5 min)
   └─ API error / throws → clear token → redirect /login

3. Check user.selectedLanguage exists and is non-empty
   └─ No language selected → redirect /language-selection
```

### `checkLanguageSelection` — `src/lib/auth.ts`

Used by: `/language-selection`

```
1. Read token from localStorage
   └─ No token → redirect /login

2. queryClient.ensureQueryData(getMe, staleTime: 5 min)
   └─ API error / throws → clear token → redirect /login

3. Check if user already has selectedLanguage
   └─ Language already set → redirect /dashboard
      (prevents going back to selection after it's done)
```

### `requireAccessibleLesson` — `src/lib/lessonGuard.ts`

Used by: `/lesson/$lessonId` — runs in the route `loader` (after `requireAuth` in `beforeLoad`)

```
1. queryClient.ensureQueryData(fetchLessonById, staleTime: 30s)
2. Check if every block in the lesson has status === 'locked'
   └─ All blocks locked → redirect /dashboard
      (user hasn't unlocked this lesson yet)

Returns the lesson data so the component can consume it immediately.
```

---

## Route Loaders (Data Prefetching)

These fire-and-forget prefetches run after auth guards pass, warming the cache before the page component renders:

| Route               | Prefetched data                               | Stale time  |
| ------------------- | --------------------------------------------- | ----------- |
| `/dashboard`        | `dashboardData`, `milestones`                 | 60 s, 2 min |
| `/practice`         | `weaknessTags`                                | 5 min       |
| `/leaderboard`      | `leaderboard`                                 | 60 s        |
| `/lesson/$lessonId` | lesson detail (via `requireAccessibleLesson`) | 30 s        |

---

## Redirect Logic by Route

### `/` (index)

```
Has localStorage token?
├─ Yes → /dashboard
└─ No  → /login
```

> **Note:** The index route now goes directly to `/dashboard` and lets the `requireAuth` guard redirect to `/language-selection` if the user has no language set.

### `/login` and `/signup`

```
Has localStorage token?
├─ Yes → /language-selection   (guard then redirects to /dashboard if language set)
└─ No  → render the form
```

These are **lazy routes** — their JS bundle is only loaded when needed, not on initial app load.

### `/language-selection`

```
beforeLoad: checkLanguageSelection
├─ No token           → /login
├─ API error          → /login  (token cleared)
├─ Language set       → /dashboard  (skip selection)
└─ No language yet    → render LanguageSelectionPage

On confirm → POST /api/languages/select → navigate /dashboard
```

### `/dashboard`

```
beforeLoad: requireAuth
├─ No token           → /login
├─ API error          → /login
├─ No language        → /language-selection
└─ OK                 → prefetch dashboardData + milestones → render DashboardPage
```

Lesson start (roadmap click) → `useStartLesson` → `navigate /lesson/$lessonId`

### `/practice`

```
beforeLoad: requireAuth
├─ No token           → /login
├─ API error          → /login
├─ No language        → /language-selection
└─ OK                 → prefetch weaknessTags → render PracticePage

Exercise card click   → Link /practice-dedicated/$exerciseId
```

### `/leaderboard`

```
beforeLoad: requireAuth
├─ No token           → /login
├─ API error          → /login
├─ No language        → /language-selection
└─ OK                 → prefetch leaderboard → render LeaderboardPage
```

### `/lesson/$lessonId`

```
beforeLoad: requireAuth  (same checks as above)
loader:     requireAccessibleLesson
            └─ All blocks locked → /dashboard

└─ OK → render LessonPage

Inside LessonPage:
  Block navigation   → setSelectedBlockId (local state, no route change)
  Block completed + Feynman not passed → show FeynmanInterviewPane
  Feynman passed     → refetchLesson, unlock next block
  "Back" button      → /dashboard (via Navbar)
```

### `/practice-dedicated/$exerciseId`

```
beforeLoad: requireAuth
├─ No token           → /login
├─ API error          → /login
├─ No language        → /language-selection
└─ OK                 → render DedicatedPracticePage

Exercise tab click    → navigate /practice-dedicated/$exerciseId  (different ID)
"Next Exercise" btn   → navigate /practice-dedicated/$nextExerciseId
"Back" button         → /practice (via Navbar)
```

---

## Full Auth Flow (First Visit)

```
User visits /
    │
    ▼
No token in localStorage
    │
    ▼
Redirect → /login
    │
    ▼
User submits credentials
POST /api/auth/login
    │
    ├─ Error → show error message, stay on /login
    │
    └─ Success → store token in localStorage
                     │
                     ▼
              navigate → /language-selection
                     │
                     ▼
              checkLanguageSelection guard
                     │
                     ├─ Language already set → /dashboard  (returning user)
                     │
                     └─ No language yet → render LanguageSelectionPage
                                              │
                                              ▼
                                    User selects C++ or Java
                                    POST /api/languages/select
                                              │
                                              ▼
                                    navigate → /dashboard
```

## Full Auth Flow (Returning Visit)

```
User visits /
    │
    ▼
Token found in localStorage
    │
    ▼
Redirect → /dashboard
    │
    ▼
requireAuth guard calls queryClient.ensureQueryData(getMe)
    │
    ├─ 401 / error → clear token → /login
    │
    └─ Language set → render DashboardPage
```

## Logout Flow

```
User clicks Sign Out (Navbar or Sidebar)
    │
    ▼
logout() in AuthContextProvider
    │
    ├─ Remove token from localStorage
    ├─ setToken(null)
    │
    ▼
navigate → /login
```

Session also auto-expires:

```
Any API call returns 401
    │
    ▼
Axios response interceptor (src/lib/axios.ts)
    │
    ├─ localStorage.removeItem('token')
    ├─ queryClient.clear()          ← clears all cached server state
    │
    └─ Promise.reject(error)        ← the calling guard/query re-throws
                                       and TanStack Router redirects to /login
```

> **Note:** The interceptor does **not** do a hard `window.location.href` redirect. It clears the token and query cache, then lets the TanStack Router `beforeLoad` / `ensureQueryData` error path handle the redirect naturally.

---

## In-App Navigation (No Route Change)

These interactions update local component state without touching the router:

| Interaction                                  | State updated                                                   |
| -------------------------------------------- | --------------------------------------------------------------- |
| Click a lesson block in `LessonSidebar`      | `selectedBlockId` in `LessonPage`                               |
| Switch exercise tab in `ExerciseTabBar`      | `activeExerciseIndex` in `LessonPage` / `DedicatedPracticePage` |
| Toggle module accordion in `LearningRoadmap` | `expandedModules` in `useRoadmap`                               |
| Open/close mobile sidebar                    | `isSidebarOpen` in page component                               |
| Switch theory/practice tab on mobile         | `activeTab` in page component                                   |
| Feynman interview complete                   | `feynmanPassedBlockId`, then `refetchLesson()`                  |

---

## Route Protection Summary

```
/login                     → open (redirect to /language-selection if already authed)
/signup                    → open (redirect to /language-selection if already authed)
/language-selection        → token required; redirect to /dashboard if language already set
/dashboard                 → token + language required
/practice                  → token + language required
/leaderboard               → token + language required
/lesson/:id                → token + language + lesson not fully locked
/practice-dedicated/:id    → token + language required
```

---

## Route Map

| Route                             | File                                 | Component               | Protected              |
| --------------------------------- | ------------------------------------ | ----------------------- | ---------------------- |
| `/`                               | `index.tsx`                          | Redirect only           | —                      |
| `/login`                          | `login.lazy.tsx`                     | `LoginPage`             | No                     |
| `/signup`                         | `signup.lazy.tsx`                    | `SignUpPage`            | No                     |
| `/language-selection`             | `languageselection.tsx`              | `LanguageSelectionPage` | Partial                |
| `/dashboard`                      | `dashboard.tsx`                      | `DashboardPage`         | ✅ Full                |
| `/practice`                       | `practice.tsx`                       | `PracticePage`          | ✅ Full                |
| `/lesson/$lessonId`               | `lesson.$lessonId.tsx`               | `LessonPage`            | ✅ Full + lesson guard |
| `/practice-dedicated/$exerciseId` | `practice-dedicated.$exerciseId.tsx` | `DedicatedPracticePage` | ✅ Full                |

---

## Guard Functions

### `requireAuth` — `src/lib/auth.ts`

Used by: `/dashboard`, `/practice`, `/lesson/$lessonId`, `/practice-dedicated/$exerciseId`

```
1. Read token from localStorage
   └─ No token → redirect /login

2. Call getMe() API
   └─ API error → clear token → redirect /login

3. Check user.selectedLanguage exists and is non-empty
   └─ No language selected → redirect /language-selection
```

### `checkLanguageSelection` — `src/lib/auth.ts`

Used by: `/language-selection`

```
1. Read token from localStorage
   └─ No token → redirect /login

2. Call getMe() API
   └─ API error → clear token → redirect /login

3. Check if user already has selectedLanguage
   └─ Language already set → redirect /dashboard
      (prevents going back to selection after it's done)
```

### `requireAccessibleLesson` — `src/lib/lessonGuard.ts`

Used by: `/lesson/$lessonId` (runs after `requireAuth`)

```
1. Call fetchLessonById(lessonId) API
2. Check if every block in the lesson has status === 'locked'
   └─ All blocks locked → redirect /dashboard
      (user hasn't unlocked this lesson yet)
```

---

## Redirect Logic by Route

### `/` (index)

```
Has localStorage token?
├─ Yes → /language-selection
│         (languageselection guard then redirects to /dashboard if language set)
└─ No  → /login
```

### `/login` and `/signup`

```
Has localStorage token?
├─ Yes → /language-selection   (avoids double-login; guard handles rest)
└─ No  → render the form
```

These are **lazy routes** — their JS bundle is only loaded when needed, not on initial app load.

### `/language-selection`

```
beforeLoad: checkLanguageSelection
├─ No token           → /login
├─ API error          → /login  (token cleared)
├─ Language set       → /dashboard  (skip selection)
└─ No language yet    → render LanguageSelectionPage

On confirm → POST /api/languages/select → navigate /dashboard
```

### `/dashboard`

```
beforeLoad: requireAuth
├─ No token           → /login
├─ API error          → /login
├─ No language        → /language-selection
└─ OK                 → render DashboardPage
```

Lesson start (roadmap click) → `useStartLesson` → `navigate /lesson/$lessonId`

### `/practice`

```
beforeLoad: requireAuth
├─ No token           → /login
├─ API error          → /login
├─ No language        → /language-selection
└─ OK                 → render PracticePage

Exercise card click   → Link /practice-dedicated/$exerciseId
```

### `/lesson/$lessonId`

```
beforeLoad:
  1. requireAuth (same checks as above)
  2. requireAccessibleLesson
     └─ All blocks locked → /dashboard

└─ OK → render LessonPage

Inside LessonPage:
  Block navigation   → setSelectedBlockId (local state, no route change)
  Block completed + Feynman not passed → show FeynmanInterviewPane
  Feynman passed     → refetchLesson, unlock next block
  "Back" button      → /dashboard (via Navbar)
```

### `/practice-dedicated/$exerciseId`

```
beforeLoad: requireAuth
├─ No token           → /login
├─ API error          → /login
├─ No language        → /language-selection
└─ OK                 → render DedicatedPracticePage

Exercise tab click    → navigate /practice-dedicated/$exerciseId  (different ID)
"Next Exercise" btn   → navigate /practice-dedicated/$nextExerciseId
"Back" button         → /practice (via Navbar)
```

---

## Full Auth Flow (First Visit)

```
User visits /
    │
    ▼
No token in localStorage
    │
    ▼
Redirect → /login
    │
    ▼
User submits credentials
POST /api/auth/login
    │
    ├─ Error → show error message, stay on /login
    │
    └─ Success → store token in localStorage
                     │
                     ▼
              navigate → /language-selection
                     │
                     ▼
              checkLanguageSelection guard
                     │
                     ├─ Language already set → /dashboard  (returning user)
                     │
                     └─ No language yet → render LanguageSelectionPage
                                              │
                                              ▼
                                    User selects C++ or Java
                                    POST /api/languages/select
                                              │
                                              ▼
                                    navigate → /dashboard
```

## Full Auth Flow (Returning Visit)

```
User visits /
    │
    ▼
Token found in localStorage
    │
    ▼
Redirect → /language-selection
    │
    ▼
checkLanguageSelection guard calls getMe()
    │
    ├─ 401 / error → clear token → /login
    │
    └─ Language set → /dashboard  (skips selection)
```

## Logout Flow

```
User clicks Sign Out (Navbar or Sidebar)
    │
    ▼
logout() in AuthContextProvider
    │
    ├─ Remove token from localStorage
    ├─ setToken(null)
    │
    ▼
navigate → /login
```

Session also auto-expires:

```
Any API call returns 401
    │
    ▼
Axios response interceptor (src/lib/axios.ts)
    │
    ├─ Check if token exists in localStorage
    ├─ Remove token
    │
    ▼
window.location.href = '/login'   (hard redirect, clears all React state)
```

---

## In-App Navigation (No Route Change)

These interactions update local component state without touching the router:

| Interaction                                  | State updated                                                   |
| -------------------------------------------- | --------------------------------------------------------------- |
| Click a lesson block in `LessonSidebar`      | `selectedBlockId` in `LessonPage`                               |
| Switch exercise tab in `ExerciseTabBar`      | `activeExerciseIndex` in `LessonPage` / `DedicatedPracticePage` |
| Toggle module accordion in `LearningRoadmap` | `expandedModules` in `useRoadmap`                               |
| Open/close mobile sidebar                    | `isSidebarOpen` in page component                               |
| Switch theory/practice tab on mobile         | `activeTab` in page component                                   |
| Feynman interview complete                   | `feynmanPassedBlockId`, then `refetchLesson()`                  |

---

## Route Protection Summary

```
/login          → open (redirect away if already authed)
/signup         → open (redirect away if already authed)
/language-selection → token required; redirect away if language already set
/dashboard      → token + language required
/practice       → token + language required
/lesson/:id     → token + language + lesson not fully locked
/practice-dedicated/:id → token + language required
```
