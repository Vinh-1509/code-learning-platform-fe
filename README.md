# CodeStep — Deep Learning Through Teaching

> An AI-powered personalized learning platform that helps absolute beginners master **C++** and **Java** through the **Feynman Technique** — learning by explaining.

🌐 **Live Demo:** [codestep-rito.vercel.app](https://codestep-rito.vercel.app/)

---

## 📖 What is CodeStep?

CodeStep follows the philosophy **"Learning how to think before learning how to code."** Instead of drilling syntax, learners work through sequential learning blocks, complete interactive exercises, and must explain their reasoning to an AI "beginner" chatbot before they can advance. Consistent practice earns coins, which can be used to compete with other learners on a leaderboard.

**Target users:** Absolute beginners and students with weak foundations who rely on rote memorization.

---

## ✨ Core Features

| Feature                   | Description                                                                                                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Block-based Learning**  | Split-screen interface with theory (left) and interactive tasks — drag-and-drop or fill-in-the-blank (right). Blocks unlock sequentially.                                   |
| **AI Error Explanation**  | After submission, Google Gemini (with Groq fallback) explains results in plain language without revealing the answer.                                                       |
| **Feynman Validation**    | Users must explain their reasoning to an AI chatbot (Groq) before the next block unlocks. Failed attempts trigger a follow-up question; repeated failures cause a cooldown. |
| **Weakness Tracking**     | Every attempt updates per-tag stats. A dedicated view surfaces weak tags by failure rate to power a "recommended for you" practice list.                                    |
| **Attacks & Leaderboard** | Spend attack slots to steal coins from opponents; track standings on a global leaderboard ranked by coins.                                                                  |

---

## 🛠️ Tech Stack

| Layer                  | Technology                                                    |
| ---------------------- | ------------------------------------------------------------- |
| **Framework**          | React 19, TypeScript                                          |
| **Build Tool**         | Vite 8                                                        |
| **Styling**            | Tailwind CSS v4, shadcn/ui, Radix UI                          |
| **Routing**            | TanStack Router v1 (file-based)                               |
| **Server State**       | TanStack Query v5                                             |
| **HTTP Client**        | Axios                                                         |
| **Forms / Validation** | Zod v4                                                        |
| **UI Extras**          | Lucide React, Sonner (toasts), canvas-confetti, react-joyride |
| **Package Manager**    | Yarn (Berry)                                                  |
| **Deployment**         | Vercel (SPA rewrites configured)                              |

---

## 🚀 Getting Started

### Prerequisites

- [Yarn](https://yarnpkg.com/getting-started/install) (Berry — see `.yarnrc.yml`)
- Node.js (Latest LTS recommended)

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>
cd code-learning-platform-fe

# 2. Install dependencies
yarn install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your backend URL and any required keys
```

### Development

```bash
yarn dev
```

The app will be available at `http://localhost:5173`. The backend proxy defaults to `localhost:3000` or `https://code-learning-platform-be.onrender.com`.

---

## 📜 Available Scripts

| Command              | Description                                             |
| -------------------- | ------------------------------------------------------- |
| `yarn dev`           | Start the Vite development server                       |
| `yarn build`         | Type-check + production bundle (`tsc -b && vite build`) |
| `yarn preview`       | Serve the production build locally                      |
| `yarn lint`          | Run ESLint across the project                           |
| `yarn format`        | Format all files with Prettier                          |
| `yarn type-check`    | Run TypeScript without emitting (`tsc --noEmit`)        |
| `yarn test`          | Run unit tests with Vitest (watch mode)                 |
| `yarn test:run`      | Run unit tests once                                     |
| `yarn test:coverage` | Run unit tests with V8 coverage report                  |
| `yarn e2e`           | Run Playwright end-to-end tests                         |
| `yarn e2e:ui`        | Open Playwright UI mode                                 |
| `yarn e2e:report`    | Show the last Playwright HTML report                    |

---

## 🗂️ Project Structure

```
src/
├── routes/            # TanStack Router file-based routes
├── features/          # Feature-scoped components & logic
│   ├── auth/
│   ├── dashboard/
│   ├── lesson/
│   ├── practices/
│   ├── dedicated_practice/
│   ├── interview/       # Feynman interview pane
│   ├── leaderboard/
│   ├── language_selection/
│   └── gacha/
├── components/        # Shared/generic components
├── lib/               # Utilities: axios instance, auth guards, etc.
├── types/             # Global TypeScript types
└── assets/            # Static assets

docs/                  # Architecture & design documentation
e2e/                   # Playwright end-to-end test specs
```

---

## 🗺️ Route Map

| Route                             | Protection                          | Description                                                |
| --------------------------------- | ----------------------------------- | ---------------------------------------------------------- |
| `/`                               | —                                   | Redirect: `/login` or `/language-selection`                |
| `/login`                          | Public                              | Login page (lazy-loaded)                                   |
| `/signup`                         | Public                              | Sign-up page (lazy-loaded)                                 |
| `/language-selection`             | Token required                      | Language picker; skips to `/dashboard` if already selected |
| `/dashboard`                      | Auth + language                     | Learning roadmap & lesson entry point                      |
| `/practice`                       | Auth + language                     | Exercise list with search, filter & pagination             |
| `/lesson/:lessonId`               | Auth + language + lesson accessible | Block-based learning environment                           |
| `/practice-dedicated/:exerciseId` | Auth + language                     | Focused single-exercise view                               |

Auth guards (`requireAuth`, `checkLanguageSelection`, `requireAccessibleLesson`) run in `beforeLoad` hooks and redirect automatically on failure.

---

## 🧪 Testing

### Unit / Integration (Vitest + Testing Library + MSW)

```bash
yarn test           # watch mode
yarn test:run       # single run
yarn test:coverage  # with coverage
```

### End-to-End (Playwright)

Specs live in `e2e/` and cover the main user flows:

- `auth.spec.ts` — login / sign-up
- `language-select.spec.ts` — language selection guard
- `dashboard.spec.ts` — roadmap rendering
- `practice.spec.ts` — practice list & filters
- `dedicated.spec.ts` — dedicated exercise view
- `interview.spec.ts` — Feynman interview flow

```bash
yarn e2e          # headless
yarn e2e:ui       # interactive UI mode
```

---

## 🛡️ Code Quality

This project enforces quality automatically via **Husky** pre-commit hooks + **lint-staged**:

- **On every commit**: ESLint auto-fixes `.js/.ts/.jsx/.tsx` files; Prettier formats everything. Commits are blocked if ESLint errors remain.
- **CI-friendly**: `yarn lint` and `yarn type-check` can be run independently in CI pipelines.

Manually:

```bash
yarn lint         # ESLint
yarn format       # Prettier
yarn type-check   # TypeScript strict check
```

---

## 🚢 Deployment

The project is deployed to **Vercel** at **[codestep-rito.vercel.app](https://codestep-rito.vercel.app/)**. `vercel.json` configures a catch-all SPA rewrite so all routes resolve to `index.html`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 📚 Documentation

Detailed design docs live in [`docs/`](./docs/):

| Document                                                            | Description                                                  |
| ------------------------------------------------------------------- | ------------------------------------------------------------ |
| [`platform-overview.md`](./docs/platform-overview.md)               | Product vision, features, user flow, and system architecture |
| [`frontend-routing.md`](./docs/frontend-routing.md)                 | Full route map, guard logic, and auth flows                  |
| [`api-design.md`](./docs/api-design.md)                             | API endpoint catalogue                                       |
| [`database-design.md`](./docs/database-design.md)                   | MongoDB schema and collection relationships                  |
| [`react_query_architecture.md`](./docs/react_query_architecture.md) | TanStack Query patterns used in the project                  |

---

## 👥 Team

- **Vinh Luong**
- **Minh Ngo(FE lead)**
- **An**
- **Quan**
- **Vinh Vu**
