# CodeStep: Deep Learning Through Teaching

An AI-driven educational platform designed to help absolute beginners master **C++** and **Java** using the **Feynman Technique**.

## 🛠 Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
- **Backend Proxy**: Configured to `localhost:3000`

## 🚀 Getting Started

### Prerequisites

- [Yarn](https://yarnpkg.com/getting-started/install) (Preferred package manager)
- Node.js (Latest LTS recommended)

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Create a `.env` file (copy from `.env.example`):
   ```bash
   cp .env.example .env
   ```

### Development

Start the development server:

```bash
yarn dev
```

The app will be available at `http://localhost:5173`.

### Other Commands

- `yarn build`: Build for production
- `yarn lint`: Run ESLint
- `yarn format`: Format all files with Prettier
- `yarn preview`: Preview production build locally

## 🛡️ Code Quality & Workflow

This project uses **Husky**, **Lint-staged**, **ESLint**, and **Prettier** to maintain high code standards automatically.

- **Pre-commit Hook**: Every time you commit code, Husky runs `lint-staged`.
- **Automatic Formatting**: Files are automatically formatted with Prettier before being committed.
- **Static Analysis**: ESLint checks for potential bugs and style issues. If ESLint finds errors that cannot be auto-fixed, the commit will be blocked until you fix them.

To manually format the codebase:

```bash
yarn format
```

To manually check for linting errors:

```bash
yarn lint
```

## 📏 Design Rules

Refer to `.cursor/rules/frontend.mdc` for coding conventions, including:

- No inline JSX logic
- Component extraction rules
- File structure conventions
