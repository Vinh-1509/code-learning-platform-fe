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

A split-screen interface that delivers curriculum content through sequential **Learning Blocks**. Each block has a status (Locked → Active → Completed) and auto-unlocks after the previous block is finished.

- **Left pane:** Markdown-rendered theory, sample code, and code flow visualizations
- **Right pane:** Interactive tasks (drag-and-drop or fill-in-the-blank) tied directly to the adjacent theory
- **Hint system:** Progressively revealed, manually triggered hints per exercise
  - Drag-and-drop: Conceptual hint → Positional hint
  - Fill-in-the-blank: Conceptual hint → Constraint hint

### AI Error Explanation

After a user submits an answer, an AI module evaluates the response. If incorrect, it identifies the specific issue and provides a clear, targeted explanation.

### AI Feynman Validation

After completing an exercise, users must explain their reasoning to an AI "beginner" chatbot (e.g., _"Why use a for loop here instead of a while loop?"_). The next block only unlocks when the explanation is accepted.

### Adaptive Learning & Practice

- **Daily Question Page** _(Nice to have)_: Spaced repetition system that re-surfaces past exercises at optimal intervals. Correct answers double the review interval; incorrect answers halve it.
- **Dedicated Practice Page** _(Critical)_: Users choose exercises freely. The system tracks weakness tags across all activity and highlights recommended exercises at the top of the list.

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
5. **Practice / Daily Review** → Weakness-targeted exercises and spaced repetition

---

## System Architecture

| Layer           | Technology                                  |
| --------------- | ------------------------------------------- |
| Frontend        | React 19, TypeScript, Vite, Tailwind CSS v4 |
| Backend         | Node.js, Express 4.19.2, TypeScript         |
| Database        | MongoDB (Atlas M0 Free Tier, AWS Singapore) |
| AI Engine       | Evaluation & Feynman Interview module       |
| Package manager | Yarn                                        |

The system follows a **client-server model**: the React frontend handles UI and user interaction; the Express backend handles logic processing and AI communication; MongoDB stores user data, progress, and roadmaps.

---

## Team

- **Vinh Luong**
- **Minh**
- **An**
- **Quan**
- **Vinh Vu**
