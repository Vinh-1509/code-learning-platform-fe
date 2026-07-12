# CodeStep — Platform Overview

## What is CodeStep?

CodeStep is an AI-powered personalized learning platform designed to help beginners master programming fundamentals through conceptual understanding rather than rote memorization. The platform's philosophy is **"Learning how to think" before "Learning how to code."**

It currently supports **C++** and **Java**, chosen to build strong foundations in programming thinking and data structures.

---

## Target Users

- **Beginners** — individuals with no prior programming experience who are overwhelmed by the complexity of low-level languages.
- **Students with weak foundations** — learners who rely on rote memorization and need to rebuild core programming thinking from scratch.

---

## Problem Being Solved

| Pain Point                  | Description                                                                         |
| --------------------------- | ----------------------------------------------------------------------------------- |
| Technical barriers          | Setting up compilers and IDEs discourages learners before they even start           |
| The syntax trap             | Beginners waste energy on semicolons and brackets instead of problem-solving        |
| Lack of practical exercises | Difficulty translating theory into structured, logical code                         |
| Logic-to-Code gap           | Struggling to understand a problem, translate it to code, and develop coding reflex |
| Forgetting quickly          | Abstract concepts are forgotten within 48 hours without active review               |

---

## Core Features

### Block-based Learning System

A split-screen interface that delivers curriculum content through sequential **Learning Blocks**. Each block has a status (`locked` -> `active` -> `completed`) and auto-unlocks after the previous block is finished.

- **Left pane:** Markdown-rendered theory, sample code, and code flow visualizations
- **Right pane:** Interactive tasks (drag-and-drop or fill-in-the-blank) tied directly to the adjacent theory
- **Hint system:** Progressively revealed, manually triggered hints per exercise, tracked per user

### AI Error Explanation

After a user submits an answer, the backend grades it first (the deterministic source of truth), then an AI module explains the result in plain language. If incorrect, it identifies the specific issue and gives a targeted, encouraging explanation without revealing the answer outright. Google Gemini is the primary provider, with an automatic fallback to Groq if Gemini is unavailable or returns an invalid response.

### AI Feynman Validation

After completing an exercise, users must explain their reasoning to an AI "beginner" chatbot (e.g., _"Why use a for loop here instead of a while loop?"_). The next block only unlocks when the explanation is accepted. A failed attempt earns one short follow-up question; repeated failures trigger a temporary cooldown before the user can retry. Powered by Groq.

### Weakness Tracking & Practice

- Every exercise attempt updates per-tag statistics for the user (total attempts, failures, and a computed "weak" flag once failure rate crosses a threshold with enough attempts).
- A dedicated weakness endpoint surfaces the user's weak tags sorted by failure rate, and a per-tag detail endpoint gives the full stat breakdown.
- The general practice/exercise list supports search, filtering (language, difficulty, tag, status), and pagination, so a client can combine the weakness data with the filtered list to build a "recommended for you" view.
- **Daily Question Page** _(Nice to have, not yet implemented)_: a spaced repetition system re-surfacing past exercises at optimal intervals — correct answers would double the review interval, incorrect answers would halve it.

### Gamification — Attacks & Leaderboard

A lightweight competitive layer sitting on top of the core learning loop:

- Users can view a handful of random opponents who share their selected language and have coins to steal.
- Spending an "attack slot" lets a user steal coins from a chosen target; the target is notified and the attack is recorded.
- A leaderboard ranks all users by coins (with the caller's own rank always included), rewarding consistent practice with in-app currency and status.

---

## How It Differentiates

| Feature      | Traditional Platforms       | CodeStep                         |
| ------------ | --------------------------- | -------------------------------- |
| Primary goal | Solving problems / Syntax   | Explaining logic / Mental models |
| Verification | Passing test cases (output) | Exercise + Explanation           |
| Approach     | Coding immediately          | Constructing logic first         |

---

## User Flow Summary

1. **Sign Up** → Language Selection (C++ or Java)
2. **Roadmap Generated** → Structured learning path displayed on Dashboard
3. **Environment Setup Guide** → Walkthrough of IDE setup, structured as a standard lesson
4. **Learning Environment** → Sequential Learning Blocks with theory, interactive tasks, AI feedback, and Feynman validation
5. **Practice** → Weakness-targeted exercises via the tag-stats and practice-list endpoints
6. **Compete** → Attack other learners for coins and track standing on the leaderboard

---

## System Architecture

| Layer           | Technology                                                                                                                                   |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend        | React 19, TypeScript, Vite, Tailwind CSS v4                                                                                                  |
| Backend         | Node.js, Express 5, TypeScript                                                                                                               |
| Database        | MongoDB (Atlas M0 Free Tier, AWS Singapore)                                                                                                  |
| AI Engine       | Google Gemini (primary — exercise explanations), Groq (fallback for explanations; primary for the Feynman interview and question generation) |
| Package manager | Yarn                                                                                                                                         |

The system follows a **client-server model**: the React frontend handles UI and user interaction; the Express backend handles logic processing and AI communication; MongoDB stores user data, progress, and roadmaps.

---

## Team

- **Vinh Luong**
- **Minh**
- **An**
- **Quan**
- **Vinh Vu**
