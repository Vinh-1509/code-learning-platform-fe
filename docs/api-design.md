# API Design

> **Base URL:** `/api` `isAuth: Yes` — requires a valid `Authorization: Bearer <access_token>` header. Priority levels: **HIGH** | **LOW**

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Practice System](#2-practice-system)
3. [AI Feynman](#3-ai-feynman)
4. [Repetition](#4-repetition)
5. [Tag Stats](#5-tag-stats)
6. [Learning System](#6-learning-system)
7. [Other](#7-other)

---

## 1. Authentication

> Login, Register, Password Reset, Logout

| Method | Endpoint                    | isAuth | Priority |
| ------ | --------------------------- | ------ | -------- |
| POST   | `/api/auth/register`        | No     | HIGH     |
| POST   | `/api/auth/login`           | No     | HIGH     |
| POST   | `/api/auth/logout`          | Yes    | HIGH     |
| POST   | `/api/auth/refresh`         | No     | HIGH     |
| GET    | `/api/auth/me`              | Yes    | LOW      |
| POST   | `/api/auth/forgot-password` | No     | LOW      |
| POST   | `/api/auth/reset-password`  | No     | LOW      |
| POST   | `/api/auth/verify-email`    | No     | LOW      |

---

### POST `/api/auth/register`

Create a new user. Email must be unique. Password is hashed before storing.

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "message": "string"
}
```

---

### POST `/api/auth/login`

Check if email exists in DB, check hashed password, return tokens to user if all checks pass.

**Request Body:**

```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "access_token": "string"
}
```

---

### POST `/api/auth/logout`

Log user out. Client deletes token or server invalidates it (if implemented).

**Response:**

```json
{
  "message": "string"
}
```

---

### POST `/api/auth/refresh`

Generate a new access token using a valid refresh token.

**Request Body:**

```json
{
  "refresh_token": "string"
}
```

**Response:**

```json
{
  "access_token": "string"
}
```

---

### GET `/api/auth/me`

Get current authenticated user info.

**Response:**

```json
{
  "id": "string",
  "email": "string"
}
```

---

### POST `/api/auth/forgot-password`

Generate a reset token and send it via email. Always returns the same message for security (prevent email enumeration).

**Request Body:**

```json
{
  "email": "string"
}
```

**Response:**

```json
{
  "message": "string"
}
```

---

### POST `/api/auth/reset-password`

Validate the reset token and update the password (hashed).

**Request Body:**

```json
{
  "reset_pw_token": "string",
  "new_password": "string"
}
```

**Response:**

```json
{
  "message": "string"
}
```

---

### POST `/api/auth/verify-email`

Verify user email using the token sent during registration.

**Request Body:**

```json
{
  "verify_token": "string"
}
```

**Response:**

```json
{
  "message": "string"
}
```

---

## 2. Practice System

| Method | Endpoint                                      | isAuth | Priority |
| ------ | --------------------------------------------- | ------ | -------- |
| GET    | `/api/practice/exercises`                     | Yes    | HIGH     |
| GET    | `/api/practice/exercises/:exerciseId`         | Yes    | HIGH     |
| POST   | `/api/practice/exercises/:exerciseId/submit`  | Yes    | HIGH     |
| POST   | `/api/practice/exercises/:exerciseId/hint`    | Yes    | HIGH     |
| GET    | `/api/practice/exercises/:exerciseId/history` | Yes    | HIGH     |

---

### GET `/api/practice/exercises`

Get a list of exercises. Supports searching, filtering, and pagination via query parameters.

**Query Parameters:**

| Parameter    | Type   | Description                                   |
| ------------ | ------ | --------------------------------------------- |
| `q`          | string | Keyword search                                |
| `topic`      | string | Filter by tag/topic (e.g. `hashing`)          |
| `difficulty` | string | Filter by level: `easy` \| `medium` \| `hard` |
| `language`   | string | Filter by language: `c++` \| `java`           |
| `page`       | int    | Page number (pagination)                      |
| `limit`      | int    | Results per page                              |

---

### GET `/api/practice/exercises/:exerciseId`

Get details of a specific exercise. **Does NOT include the correct answer.**

---

### POST `/api/practice/exercises/:exerciseId/submit`

Submit an answer and get a result.

**Request Body:**

```json
{
  "answer": "any"
}
```

**Response:**

```json
{
  "correct": true
}
```

---

### POST `/api/practice/exercises/:exerciseId/hint`

Request a hint. Tracks hint usage level.

**Response:**

```json
{
  "hintLevel": "int",
  "hint": "string"
}
```

---

### GET `/api/practice/exercises/:exerciseId/history`

Get the user's past attempts and answers for a specific exercise.

---

## 3. AI Feynman

| Method | Endpoint                                     | isAuth | Priority |
| ------ | -------------------------------------------- | ------ | -------- |
| GET    | `/api/feynman/block/:blockId/question`       | Yes    | HIGH     |
| POST   | `/api/feynman/block/:blockId/chat`           | Yes    | HIGH     |
| GET    | `/api/feynman/block/:blockId/history`        | Yes    | HIGH     |
| GET    | `/api/feynman/block/:blockId/stats`          | Yes    | HIGH     |
| GET    | `/api/feynman/exercise/:exerciseId/question` | Yes    | HIGH     |
| POST   | `/api/feynman/exercise/:exerciseId/chat`     | Yes    | LOW      |
| GET    | `/api/feynman/exercise/:exerciseId/history`  | Yes    | LOW      |
| GET    | `/api/feynman/exercise/:exerciseId/stats`    | Yes    | LOW      |

---

### GET `/api/feynman/block/:blockId/question`

Fetch `feynmanQuestion` from the `blocks` table.

---

### POST `/api/feynman/block/:blockId/chat`

Submit a user message. Backend invokes AI, updates `chatHistory`, and sets `isFeynmanPassed: true` if criteria are met.

---

### GET `/api/feynman/block/:blockId/history`

Fetch the specific `chatHistory` array for this block from the user's progress record.

---

### GET `/api/feynman/block/:blockId/stats`

Check `isFeynmanPassed` in `user_lesson_progress` for the current user.

---

### GET `/api/feynman/exercise/:exerciseId/question`

Fetch `feynmanQuestion` from the `exercises` table.

---

### POST `/api/feynman/exercise/:exerciseId/chat`

Submit a user message. Backend invokes AI, updates `chatHistory`, and sets `isFeynmanPassed: true` if criteria are met.

---

### GET `/api/feynman/exercise/:exerciseId/history`

Fetch the specific `chatHistory` array for this exercise from the user's progress record.

---

### GET `/api/feynman/exercise/:exerciseId/stats`

Check `isFeynmanPassed` in `exercise_attempt` for the current user.

---

## 4. Repetition

| Method | Endpoint                            | isAuth | Priority |
| ------ | ----------------------------------- | ------ | -------- |
| GET    | `/api/repetition/daily-tasks`       | Yes    | LOW      |
| GET    | `/api/repetition/:exerciseId/stats` | Yes    | LOW      |

---

### GET `/api/repetition/daily-tasks`

Fetch exercises where `nextReviewDate <= now()`. Also returns a count of total tasks, number of tasks in Learning status, and number in Reviewing status.

---

### GET `/api/repetition/:exerciseId/stats`

Retrieve the Spaced Repetition status (`Mastered`, `Reviewing`, or `Learning`) and the scheduled next review date for a specific exercise.

---

## 5. Tag Stats

| Method | Endpoint                     | isAuth | Priority |
| ------ | ---------------------------- | ------ | -------- |
| GET    | `/api/tags/weakness`         | Yes    | HIGH     |
| GET    | `/api/tags/:tagId/info`      | Yes    | HIGH     |
| GET    | `/api/tags/:tagId/exercises` | Yes    | HIGH     |

---

### GET `/api/tags/weakness`

Retrieve all tags where `isWeak: true`, along with `failAttempts` and `totalAttempts`.

---

### GET `/api/tags/:tagId/info`

Provide a deep dive into a specific tag. Calculates the failure rate and returns the latest performance metrics.

---

### GET `/api/tags/:tagId/exercises`

Retrieve a list of exercises associated with a specific tag. Supports query parameters for limiting results and custom sorting.

---

## 6. Learning System

| Method | Endpoint                                        | isAuth | Priority |
| ------ | ----------------------------------------------- | ------ | -------- |
| GET    | `/api/learning/milestones`                      | Yes    | HIGH     |
| GET    | `/api/learning/milestones/:milestoneId`         | Yes    | HIGH     |
| GET    | `/api/learning/milestones/:milestoneId/lessons` | Yes    | HIGH     |
| GET    | `/api/learning/lessons/:lessonId`               | Yes    | HIGH     |
| POST   | `/api/learning/blocks/:blockId/complete`        | Yes    | HIGH     |

---

### GET `/api/learning/milestones`

Get list of milestones.

---

### GET `/api/learning/milestones/:milestoneId`

Get details of a specific milestone.

---

### GET `/api/learning/milestones/:milestoneId/lessons`

Get all lessons belonging to the specified milestone.

---

### GET `/api/learning/lessons/:lessonId`

Get full lesson content (all blocks of content).

---

### POST `/api/learning/blocks/:blockId/complete`

Mark a specific block as completed.

---

## 7. Other

| Method | Endpoint                     | isAuth | Priority |
| ------ | ---------------------------- | ------ | -------- |
| GET    | `/api/languages`             | Yes    | HIGH     |
| GET    | `/api/languages/:languageId` | Yes    | HIGH     |
| POST   | `/api/languages/select`      | Yes    | HIGH     |
| GET    | `/api/dashboard`             | Yes    | HIGH     |

---

### GET `/api/languages`

Get all available languages.

---

### GET `/api/languages/:languageId`

Get language info for `c-plus-plus` or `java`.

---

### POST `/api/languages/select`

Set the primary learning language for the authenticated user's profile.

---

### GET `/api/dashboard`

Get general dashboard info including roadmap, progress, `totalLearnedLessons`, `totalCompletedExercises`, and more.
