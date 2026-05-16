# Database Design

> **Database:** MongoDB (NoSQL) All primary keys use `ObjectId`. Timestamps use BSON `timestamp` type.

---

## Table of Contents

1. [User & Authentication](#1-user--authentication)
   - [users](#11-users)
   - [verify](#12-verify)
   - [refresh_tokens](#13-refresh_tokens)
   - [language_info](#14-language_info)
2. [Roadmap Structure](#2-roadmap-structure)
   - [roadmaps](#21-roadmaps)
   - [milestone](#22-milestone)
   - [lessons](#23-lessons)
   - [blocks](#24-blocks)
3. [User Progress](#3-user-progress)
   - [user_lesson_progress](#31-user_lesson_progress)
   - [user_milestone_progress](#32-user_milestone_progress)
4. [Exercise System](#4-exercise-system)
   - [exercise_tag](#41-exercise_tag)
   - [exercises](#42-exercises)
   - [exercise_attempt](#43-exercise_attempt)
   - [user_tag_stats](#44-user_tag_stats)
5. [Spaced Repetition](#5-spaced-repetition)
   - [repetition_schedule](#51-repetition_schedule)
6. [Relationships Overview](#6-relationships-overview)

---

## 1. User & Authentication

### 1.1 `users`

Stores core account information for each registered user.

| Field              | Type      | Constraints | Note              |
| ------------------ | --------- | ----------- | ----------------- |
| `_id`              | ObjectId  | PK          |                   |
| `email`            | string    | unique      | Dùng để đăng nhập |
| `password`         | string    |             | Lưu hash password |
| `username`         | string    | unique      |                   |
| `fullName`         | string    |             |                   |
| `selectedLanguage` | string[]  |             | C++ hoặc Java     |
| `createdAt`        | timestamp |             |                   |

---

### 1.2 `verify`

Stores email verification tokens generated during registration.

| Field          | Type      | Constraints               | Note                        |
| -------------- | --------- | ------------------------- | --------------------------- |
| `_id`          | ObjectId  | PK                        |                             |
| `userId`       | ObjectId  | ref: `users._id` (1-to-1) |                             |
| `verifyToken`  | string    |                           | Mã token hoặc OTP           |
| `tokenExpires` | timestamp |                           | Thời gian hết hạn của token |

---

### 1.3 `refresh_tokens`

Stores hashed refresh tokens. MongoDB TTL Index on `expiresAt` auto-deletes expired records.

| Field       | Type      | Constraints      | Note                                                               |
| ----------- | --------- | ---------------- | ------------------------------------------------------------------ |
| `_id`       | ObjectId  | PK               |                                                                    |
| `userId`    | ObjectId  | ref: `users._id` |                                                                    |
| `token`     | string    | unique           | Lưu Refresh Token đã được mã hóa hoặc hash                         |
| `expiresAt` | timestamp |                  | Đúng 24h sau khi login. MongoDB TTL Index sẽ dựa vào đây để tự xóa |
| `createdAt` | timestamp | default: `now()` |                                                                    |

---

### 1.4 `language_info`

Static content describing each supported programming language.

| Field      | Type     | Constraints | Note |
| ---------- | -------- | ----------- | ---- |
| `_id`      | ObjectId | PK          |      |
| `language` | string   |             |      |
| `info`     | text     |             |      |

---

## 2. Roadmap Structure

### 2.1 `roadmaps`

Top-level learning path for each programming language.

| Field         | Type     | Constraints | Note                |
| ------------- | -------- | ----------- | ------------------- |
| `_id`         | ObjectId | PK          |                     |
| `language`    | string   | unique      | C++/Java            |
| `title`       | string   |             | Ví dụ: Lộ trình C++ |
| `description` | text     |             |                     |

---

### 2.2 `milestone`

A major learning chapter within a roadmap.

| Field         | Type     | Constraints         | Note       |
| ------------- | -------- | ------------------- | ---------- |
| `_id`         | ObjectId | PK                  |            |
| `roadmapId`   | ObjectId | ref: `roadmaps._id` |            |
| `title`       | string   |                     |            |
| `order`       | int      |                     | Thứ tự học |
| `description` | text     |                     |            |

---

### 2.3 `lessons`

An individual lesson belonging to a milestone, made up of an ordered array of blocks.

| Field         | Type       | Constraints          | Note            |
| ------------- | ---------- | -------------------- | --------------- |
| `_id`         | ObjectId   | PK                   |                 |
| `milestoneId` | ObjectId   | ref: `milestone._id` |                 |
| `title`       | string     |                      |                 |
| `blocks`      | ObjectId[] | ref: `blocks._id`    | Array of blocks |
| `order`       | int        |                      |                 |

---

### 2.4 `blocks`

Atomic content unit inside a lesson. Supports mixed content types and Feynman questioning.

| Field             | Type     | Constraints                 | Note                |
| ----------------- | -------- | --------------------------- | ------------------- |
| `_id`             | ObjectId | PK                          |                     |
| `lessonId`        | ObjectId | ref: `lessons._id` (1-to-1) |                     |
| `content`         | json     |                             | See structure below |
| `feynmanQuestion` | text     |                             | Câu hỏi sẽ hỏi      |
| `feynmanPrompt`   | text     |                             | Prompt cho AI       |

**`content` structure:**

```json
[
  { "type": "theory", "data": { "order": 1, "text": "...", "image": "..." } },
  {
    "type": "code",
    "data": { "order": 1, "code": "...", "explanation": "..." }
  },
  {
    "type": "practice",
    "data": { "order": 1, "exerciseId": "...", "required": true }
  }
]
```

---

## 3. User Progress

### 3.1 `user_lesson_progress`

Tracks a user's progress through each individual lesson, including per-block state and Feynman chat history.

| Field                  | Type      | Constraints        | Note                                                         |
| ---------------------- | --------- | ------------------ | ------------------------------------------------------------ |
| `_id`                  | ObjectId  | PK                 |                                                              |
| `userId`               | ObjectId  | ref: `users._id`   |                                                              |
| `lessonId`             | ObjectId  | ref: `lessons._id` |                                                              |
| `blockProgress`        | json[]    |                    | See structure below                                          |
| `chatHistory`          | json      |                    | See structure below                                          |
| `completionPercentage` | double    |                    | Tính bằng: (số block isFeynmanPassed / tổng số block) \* 100 |
| `isCompleted`          | boolean   | default: `false`   |                                                              |
| `lastAccessed`         | timestamp |                    |                                                              |

**`blockProgress` item structure:**

```json
{
  "blockId": "ObjectId",
  "isFeynmanPassed": false,
  "state": "locked | active | completed"
}
```

**`chatHistory` structure:**

```json
{
  "chatHistory": [{ "role": "assistant", "content": "..." }]
}
```

---

### 3.2 `user_milestone_progress`

Tracks a user's overall progress through each milestone (large learning unit).

| Field                  | Type      | Constraints          | Note                              |
| ---------------------- | --------- | -------------------- | --------------------------------- |
| `_id`                  | ObjectId  | PK                   |                                   |
| `userId`               | ObjectId  | ref: `users._id`     |                                   |
| `milestoneId`          | ObjectId  | ref: `milestone._id` |                                   |
| `completionPercentage` | double    | default: `0`         | Tỉ lệ % hoàn thành                |
| `status`               | string    |                      | `Locked` / `Active` / `Completed` |
| `updatedAt`            | timestamp |                      |                                   |

---

## 4. Exercise System

### 4.1 `exercise_tag`

Taxonomy tags used to categorise exercises (e.g. hashing, loops, OOP).

| Field         | Type     | Constraints | Note                         |
| ------------- | -------- | ----------- | ---------------------------- |
| `_id`         | ObjectId | PK          |                              |
| `name`        | string   |             | Tag of exercise e.g. hashing |
| `description` | string   |             |                              |

---

### 4.2 `exercises`

Stores exercise definitions. `lessonId` is null for standalone free-practice exercises.

| Field             | Type       | Constraints             | Note                                                   |
| ----------------- | ---------- | ----------------------- | ------------------------------------------------------ |
| `_id`             | ObjectId   | PK                      |                                                        |
| `lessonId`        | ObjectId   | ref: `lessons._id`      | Null nếu là bài tập luyện tập tự do                    |
| `tagId`           | ObjectId[] | ref: `exercise_tag._id` | Mảng chứa nhiều tag                                    |
| `language`        | string     |                         | `C++` \| `Java`                                        |
| `type`            | string     |                         | `fill_blank` \| `drag_drop`                            |
| `level`           | string     |                         | `hard` \| `medium` \| `easy`                           |
| `title`           | string     |                         |                                                        |
| `instruction`     | text       |                         |                                                        |
| `data`            | json       |                         | See structure below                                    |
| `feynmanQuestion` | text       |                         |                                                        |
| `feynmanPrompt`   | text       |                         | Prompt để AI gen                                       |
| `correctAnswer`   | json       |                         | `{ "input_1": "int", "input_2": "10" }`                |
| `explanation`     | text       |                         | Giải thích chi tiết sau khi làm xong                   |
| `hints`           | json       |                         | `{ "1": "Gợi ý về lý thuyết", "2": "Gợi ý về logic" }` |
| `order`           | int        |                         |                                                        |

**`data` structure:**

```json
{
  "template": ["int a = ", " ;", "cout << a;"],
  "placeholders": { "input_1": "type", "input_2": "value" },
  "options": ["10", "int", "float", "string"]
}
```

> `options` is used for `drag_drop` type exercises.

---

### 4.3 `exercise_attempt`

Records every submission a user makes for an exercise, including Feynman chat history per attempt.

| Field             | Type      | Constraints          | Note                                                                     |
| ----------------- | --------- | -------------------- | ------------------------------------------------------------------------ |
| `_id`             | ObjectId  | PK                   |                                                                          |
| `userId`          | ObjectId  | ref: `users._id`     |                                                                          |
| `exerciseId`      | ObjectId  | ref: `exercises._id` |                                                                          |
| `isPassed`        | boolean   |                      | Vượt qua bài tập logic                                                   |
| `isFeynmanPassed` | boolean   |                      | Vượt qua vòng giải thích với AI                                          |
| `hintLevel`       | int       |                      |                                                                          |
| `userAnswer`      | json      |                      | Đáp án user đã nộp: `{ "input_1": "float" }` – Dùng để AI chỉ ra lỗi sai |
| `chatHistory`     | json      |                      | Lưu hội thoại Feynman của riêng bài tập này                              |
| `attemptNumber`   | int       |                      |                                                                          |
| `attemptedAt`     | timestamp | default: `now()`     |                                                                          |

---

### 4.4 `user_tag_stats`

Aggregates per-user performance per tag to surface weak areas.

| Field           | Type      | Constraints             | Note |
| --------------- | --------- | ----------------------- | ---- |
| `_id`           | ObjectId  | PK                      |      |
| `userId`        | ObjectId  | ref: `users._id`        |      |
| `tagId`         | ObjectId  | ref: `exercise_tag._id` |      |
| `totalAttempts` | int       |                         |      |
| `failAttempts`  | int       |                         |      |
| `isWeak`        | boolean   |                         |      |
| `updateAt`      | timestamp |                         |      |

---

## 5. Spaced Repetition

### 5.1 `repetition_schedule`

Drives the spaced-repetition (SM-2-style) review system. Interval doubles on pass, halves on fail.

| Field            | Type      | Constraints          | Note                                  |
| ---------------- | --------- | -------------------- | ------------------------------------- |
| `_id`            | ObjectId  | PK                   |                                       |
| `userId`         | ObjectId  | ref: `users._id`     |                                       |
| `exerciseId`     | ObjectId  | ref: `exercises._id` |                                       |
| `nextReviewDate` | timestamp |                      |                                       |
| `passReviewDate` | timestamp |                      |                                       |
| `interval`       | int       |                      | Số ngày lặp lại                       |
| `step`           | int       |                      | Số ngày + thêm: đúng × 2, sai ÷ 2     |
| `status`         | string    |                      | `Learning` / `Reviewing` / `Mastered` |

---

## 6. Relationships Overview

```
users ──────────────────────────────────────────────────────────────┐
  │  1                                                               │
  ├─── 0..1 ── verify                                               │
  ├─── *    ── refresh_tokens                                        │
  ├─── *    ── user_lesson_progress ──── 1 ── lessons               │
  ├─── *    ── user_milestone_progress ─ 1 ── milestone             │
  ├─── *    ── exercise_attempt ──────── 1 ── exercises             │
  ├─── *    ── user_tag_stats ────────── 1 ── exercise_tag          │
  └─── *    ── repetition_schedule ───── 1 ── exercises             │
                                                                     │
roadmaps ─── * ── milestone ─── * ── lessons ─── * ── blocks        │
                                         │                           │
                                         └─── * ── exercises ────────┘
                                                       │
                                              * ── exercise_tag (many-to-many)
```

**Reference summary:**

| From                                  | Field | To                 |
| ------------------------------------- | ----- | ------------------ |
| `verify.userId`                       | →     | `users._id`        |
| `refresh_tokens.userId`               | →     | `users._id`        |
| `milestone.roadmapId`                 | →     | `roadmaps._id`     |
| `lessons.milestoneId`                 | →     | `milestone._id`    |
| `lessons.blocks[]`                    | →     | `blocks._id`       |
| `blocks.lessonId`                     | →     | `lessons._id`      |
| `exercises.lessonId`                  | →     | `lessons._id`      |
| `exercises.tagId[]`                   | ↔     | `exercise_tag._id` |
| `user_lesson_progress.userId`         | →     | `users._id`        |
| `user_lesson_progress.lessonId`       | →     | `lessons._id`      |
| `user_milestone_progress.userId`      | →     | `users._id`        |
| `user_milestone_progress.milestoneId` | →     | `milestone._id`    |
| `exercise_attempt.userId`             | →     | `users._id`        |
| `exercise_attempt.exerciseId`         | →     | `exercises._id`    |
| `user_tag_stats.userId`               | →     | `users._id`        |
| `user_tag_stats.tagId`                | →     | `exercise_tag._id` |
| `repetition_schedule.userId`          | →     | `users._id`        |
| `repetition_schedule.exerciseId`      | →     | `exercises._id`    |
