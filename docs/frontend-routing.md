# CodeStep — Frontend Routing Reference

## Stack

- **Router**: TanStack Router (file-based routes under `src/routes/`)
- **Auth state**: `localStorage` token + `getMe()` API call
- **Guards**: `beforeLoad` hooks on each protected route

---

## Route Map

| Route                            | File                                | Component               | Protected              |
| -------------------------------- | ----------------------------------- | ----------------------- | ---------------------- |
| `/`                              | `index.tsx`                         | Redirect only           | —                      |
| `/login`                         | `login.lazy.tsx`                    | `LoginPage`             | No                     |
| `/signup`                        | `signup.lazy.tsx`                   | `SignUpPage`            | No                     |
| `/languageselection`             | `languageselection.tsx`             | `LanguageSelectionPage` | Partial                |
| `/dashboard`                     | `dashboard.tsx`                     | `DashboardPage`         | ✅ Full                |
| `/practice`                      | `practice.tsx`                      | `PracticePage`          | ✅ Full                |
| `/lesson/$lessonId`              | `lesson.$lessonId.tsx`              | `LessonPage`            | ✅ Full + lesson guard |
| `/practicededicated/$exerciseId` | `practicededicated.$exerciseId.tsx` | `DedicatedPracticePage` | ✅ Full                |

---

## Guard Functions

### `requireAuth` — `src/lib/auth.ts`

Used by: `/dashboard`, `/practice`, `/lesson/$lessonId`, `/practicededicated/$exerciseId`

```
1. Read token from localStorage
   └─ No token → redirect /login

2. Call getMe() API
   └─ API error → clear token → redirect /login

3. Check user.selectedLanguage exists and is non-empty
   └─ No language selected → redirect /languageselection
```

### `checkLanguageSelection` — `src/lib/auth.ts`

Used by: `/languageselection`

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
├─ Yes → /languageselection
│         (languageselection guard then redirects to /dashboard if language set)
└─ No  → /login
```

### `/login` and `/signup`

```
Has localStorage token?
├─ Yes → /languageselection   (avoids double-login; guard handles rest)
└─ No  → render the form
```

These are **lazy routes** — their JS bundle is only loaded when needed, not on initial app load.

### `/languageselection`

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
├─ No language        → /languageselection
└─ OK                 → render DashboardPage
```

Lesson start (roadmap click) → `useStartLesson` → `navigate /lesson/$lessonId`

### `/practice`

```
beforeLoad: requireAuth
├─ No token           → /login
├─ API error          → /login
├─ No language        → /languageselection
└─ OK                 → render PracticePage

Exercise card click   → Link /practicededicated/$exerciseId
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

### `/practicededicated/$exerciseId`

```
beforeLoad: requireAuth
├─ No token           → /login
├─ API error          → /login
├─ No language        → /languageselection
└─ OK                 → render DedicatedPracticePage

Exercise tab click    → navigate /practicededicated/$exerciseId  (different ID)
"Next Exercise" btn   → navigate /practicededicated/$nextExerciseId
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
              navigate → /languageselection
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
Redirect → /languageselection
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
/languageselection → token required; redirect away if language already set
/dashboard      → token + language required
/practice       → token + language required
/lesson/:id     → token + language + lesson not fully locked
/practicededicated/:id → token + language required
```
