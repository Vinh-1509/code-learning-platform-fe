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
| POST   | `/api/auth/refresh`         | No     | LOW      |
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
  "email": "alice@example.com",
  "password": "Secret123!"
}
```

**Response `201`:**

```json
{
  "message": "User registered successfully"
}
```

**Error responses:**

```json
{ "message": "Email and password are required" }   // 400
{ "message": "Email already registered" }          // 409
{ "message": "Internal server error" }             // 500
```

---

### POST `/api/auth/login`

Check if email exists in DB, check hashed password, return tokens to user if all checks pass.

**Request Body:**

```json
{
  "email": "alice@example.com",
  "password": "Secret123!"
}
```

**Response `200`:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error responses:**

```json
{ "message": "Email and password are required" }  // 400
{ "message": "Invalid credentials" }              // 401
```

---

### POST `/api/auth/logout`

Log user out. Server deletes the refresh token from DB.

**Request Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response `200`:**

```json
{
  "message": "Logged out successfully"
}
```

---

### POST `/api/auth/refresh`

Generate a new access token using a valid refresh token.

**Request Body:**

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response `200`:**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error responses:**

```json
{ "message": "Invalid refresh token" } // 401
```

---

### GET `/api/auth/me`

Get current authenticated user info.

**Response `200`:**

```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
  "email": "alice@example.com",
  "username": "alice",
  "fullName": "Alice Nguyen",
  "selectedLanguage": ["C++"],
  "createdAt": "2024-01-15T08:30:00.000Z"
}
```

---

### POST `/api/auth/forgot-password`

Generate a reset token and send it via email. Always returns the same message for security (prevents email enumeration).

**Request Body:**

```json
{
  "email": "alice@example.com"
}
```

**Response `200`:**

```json
{
  "message": "If that email exists, a reset link has been sent"
}
```

---

### POST `/api/auth/reset-password`

Validate the reset token and update the password (hashed).

**Request Body:**

```json
{
  "reset_pw_token": "a1b2c3d4e5f6...",
  "new_password": "NewSecret456!"
}
```

**Response `200`:**

```json
{
  "message": "Password reset successfully"
}
```

**Error responses:**

```json
{ "message": "Invalid or expired token" } // 400
```

---

### POST `/api/auth/verify-email`

Verify user email using the token sent during registration.

**Request Body:**

```json
{
  "verify_token": "a1b2c3d4e5f6..."
}
```

**Response `200`:**

```json
{
  "message": "Email verified successfully"
}
```

**Error responses:**

```json
{ "message": "Invalid or expired token" } // 400
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

| Parameter    | Type   | Description                             |
| ------------ | ------ | --------------------------------------- |
| `q`          | string | Keyword search                          |
| `tagId`      | string | Filter exercises by tag ObjectId        |
| `difficulty` | string | `easy` \| `medium` \| `hard`            |
| `language`   | string | `C++` \| `Java`                         |
| `status`     | string | `locked` \| `active` \| `completed`     |
| `page`       | int    | Page number (default: 1)                |
| `limit`      | int    | Results per page (default: 15, max: 50) |

**Response `200`:**

```json
{
  "total": 2,
  "page": 1,
  "limit": 15,
  "data": [
    {
      "_id": "6a146d34425b3586bbec641e",
      "title": "Declare Student Variables",
      "instruction": "Khai báo các biến để lưu thông tin của một sinh viên: tên (string), tuổi (int), và điểm (double)",
      "language": "C++",
      "type": "fill_blank",
      "level": "easy",
      "tagId": ["your_tag_id"],
      "status": "active",
      "order": 1
    },
    {
      "_id": "6a146d34425b3586bbec641f",
      "title": "Output Variable Values",
      "instruction": "Viết mã để in ra giá trị của các biến: name, age, và score",
      "language": "C++",
      "type": "fill_blank",
      "level": "easy",
      "tagId": ["your_tag_id"],
      "status": "locked",
      "order": 2
    }
  ]
}
```

---

### GET `/api/practice/exercises/:exerciseId`

Get details of a specific exercise. **Does NOT include `correctAnswer` or `explanation`.**

**Response `200`:**

```json
{
  "_id": "6a146d34425b3586bbec641e",
  "title": "Declare Student Variables",
  "instruction": "Khai báo các biến để lưu thông tin của một sinh viên: tên (string), tuổi (int), và điểm (double)",
  "language": "C++",
  "type": "fill_blank",
  "level": "easy",
  "tagId": ["your_tag_id"],
  "status": "active",
  "order": 1,
  "data": {
    "template": [
      "____ ",
      " name = \"John\";\nint ",
      " = 20;\ndouble ",
      " = 95.5;"
    ],
    "placeholders": {
      "input_1": "string",
      "input_2": "age",
      "input_3": "score"
    }
  },
  "hints": {
    "1": "Tên của người dùng nên là một chuỗi ký tự, sử dụng từ khóa gì để khai báo?",
    "2": "Tuổi là một số nguyên, sử dụng int",
    "3": "Điểm có thể có phần thập phân, sử dụng double"
  }
}
```

---

### POST `/api/practice/exercises/:exerciseId/submit`

Submit an answer and get the grading result. The system stores only the latest attempt for each user and exercise, while still increasing `attemptNumber`.

**Request Body:**

```json
{
  "answer": {
    "input_1": "string",
    "input_2": "age",
    "input_3": "score"
  }
}
```

**Response `200`:**

```json
{
  "correct": true,
  "items": [
    {
      "field": "input_1",
      "isCorrect": true
    },
    {
      "field": "input_2",
      "isCorrect": true
    },
    {
      "field": "input_3",
      "isCorrect": true
    }
  ],
  "attemptNumber": 4
}
```

---

### POST `/api/practice/exercises/:exerciseId/hint`

Request a hint. Tracks and increments hint usage level.

**Response `200`:**

```json
{
  "hintLevel": 3,
  "hint": "Điểm có thể có phần thập phân, sử dụng double"
}
```

---

### GET `/api/practice/exercises/:exerciseId/history`

Get the user's latest attempt and answer for a specific exercise. This API returns at most one record because only the latest attempt is stored.

**Response `200`:**

```json
[
  {
    "_id": "6a147424c8468bbce3aff71a",
    "exerciseId": "6a146d34425b3586bbec641e",
    "isPassed": true,
    "items": [
      {
        "field": "input_1",
        "isCorrect": true
      },
      {
        "field": "input_2",
        "isCorrect": true
      },
      {
        "field": "input_3",
        "isCorrect": true
      }
    ],
    "hintLevel": 3,
    "userAnswer": {
      "input_1": "string",
      "input_2": "age",
      "input_3": "score"
    },
    "attemptNumber": 4,
    "attemptedAt": "2026-05-25T16:48:18.345Z"
  }
]
```

---

## 3. AI Feynman

Block Feynman APIs are available when the target block is not `locked` and all required practice exercises inside that block have been passed. If Feynman chat returns `isPassed: true`, the backend marks the block's Feynman as passed, completes the block, unlocks the next block, and recalculates lesson/milestone progress.

| Method | Endpoint                                     | isAuth | Priority |
| ------ | -------------------------------------------- | ------ | -------- |
| GET    | `/api/feynman/block/:blockId/question`       | Yes    | HIGH     |
| POST   | `/api/feynman/block/:blockId/chat`           | Yes    | HIGH     |
| GET    | `/api/feynman/block/:blockId/history`        | Yes    | HIGH     |
| POST   | `/api/feynman/block/:blockId/history/reset`  | Yes    | HIGH     |
| GET    | `/api/feynman/block/:blockId/stats`          | Yes    | HIGH     |
| GET    | `/api/feynman/exercise/:exerciseId/question` | Yes    | HIGH     |
| POST   | `/api/feynman/exercise/:exerciseId/chat`     | Yes    | LOW      |
| GET    | `/api/feynman/exercise/:exerciseId/history`  | Yes    | LOW      |
| GET    | `/api/feynman/exercise/:exerciseId/stats`    | Yes    | LOW      |

---

### GET `/api/feynman/block/:blockId/question`

Fetch the Feynman question for a block that is ready for Feynman. The question comes from `blocks.feynmanQuestion`; if it is missing, the backend returns the default question.

**Response `200`:**

```json
{
  "blockId": "your_block_id",
  "question": "your test question"
}
```

**Error responses:**

```json
{ "message": "Block not found" } // 404
{ "message": "Lesson not found" } // 404
{ "message": "Feynman is not available for a locked block" } // 403
{ "message": "Complete all required exercises before starting Feynman" } // 403
```

---

### POST `/api/feynman/block/:blockId/chat`

Submit a user explanation for a block that is ready for Feynman. Backend invokes Groq and updates `blockProgress.chatHistory`. If the AI returns `isPassed: true`, the backend sets `isFeynmanPassed: true`, completes the block, unlocks the next block, and recalculates lesson/milestone progress.

**Request Body:**

```json
{
  "message": "your test explanation"
}
```

**Response `200`:**

```json
{
  "blockId": "your_block_id",
  "reply": "your test ai reply",
  "isPassed": false
}
```

**Response `200` — when passed:**

```json
{
  "blockId": "your_block_id",
  "reply": "your test ai reply",
  "isPassed": true
}
```

**Error responses:**

```json
{ "message": "Message is required" } // 400
{ "message": "Block not found" } // 404
{ "message": "Lesson not found" } // 404
{ "message": "Feynman is not available for a locked block" } // 403
{ "message": "Complete all required exercises before starting Feynman" } // 403
{ "message": "Failed to process Feynman chat" } // 500
```

---

### GET `/api/feynman/block/:blockId/history`

Fetch the `chatHistory` array for this block from the current user's `UserLessonProgress.blockProgress`.

**Response `200`:**

```json
{
  "blockId": "your_block_id",
  "chatHistory": [
    {
      "role": "assistant",
      "content": "your test question"
    },
    {
      "role": "user",
      "content": "your test explanation"
    },
    {
      "role": "assistant",
      "content": "your test ai reply"
    }
  ]
}
```

**Error responses:**

```json
{ "message": "Block not found" } // 404
{ "message": "Lesson not found" } // 404
{ "message": "Feynman is not available for a locked block" } // 403
{ "message": "Complete all required exercises before starting Feynman" } // 403
{ "message": "Failed to fetch Feynman history" } // 500
```

---

### POST `/api/feynman/block/:blockId/history/reset`

Reset the current user's Feynman chat history for a block back to the first assistant question. This does **not** reset `isFeynmanPassed`.

**Response `200`:**

```json
{
  "blockId": "your_block_id",
  "chatHistory": [
    {
      "role": "assistant",
      "content": "your test question"
    }
  ],
  "isFeynmanPassed": true
}
```

**Error responses:**

```json
{ "message": "Block not found" } // 404
{ "message": "Lesson not found" } // 404
{ "message": "Feynman is not available for a locked block" } // 403
{ "message": "Complete all required exercises before starting Feynman" } // 403
{ "message": "Failed to reset Feynman history" } // 500
```

---

### GET `/api/feynman/block/:blockId/stats`

Check `isFeynmanPassed` for a block in the current user's `UserLessonProgress.blockProgress`.

**Response `200`:**

```json
{
  "blockId": "your_block_id",
  "isFeynmanPassed": true
}
```

**Error responses:**

```json
{ "message": "Block not found" } // 404
{ "message": "Lesson not found" } // 404
{ "message": "Feynman is not available for a locked block" } // 403
{ "message": "Complete all required exercises before starting Feynman" } // 403
{ "message": "Failed to fetch Feynman stats" } // 500
```

---

### GET `/api/feynman/exercise/:exerciseId/question`

Fetch `feynmanQuestion` from the `exercises` table.

**Response `200`:**

```json
{
  "exerciseId": "64f1a2b3c4d5e6f7a8b9c0d2",
  "feynmanQuestion": "Why do we declare a variable type in C++ before using it?"
}
```

---

### POST `/api/feynman/exercise/:exerciseId/chat`

Submit a user message. Backend invokes AI, updates `chatHistory`, and sets `isFeynmanPassed: true` if criteria are met.

**Request Body:**

```json
{
  "message": "Because C++ needs to know how much memory to allocate for the variable."
}
```

**Response `200`:**

```json
{
  "reply": "Exactly right! Memory allocation is the key reason. Can you give an example?",
  "isFeynmanPassed": false
}
```

---

### GET `/api/feynman/exercise/:exerciseId/history`

Fetch the `chatHistory` for this exercise from `exercise_attempt`.

**Response `200`:**

```json
{
  "exerciseId": "64f1a2b3c4d5e6f7a8b9c0d2",
  "chatHistory": [
    {
      "role": "assistant",
      "content": "Why do we declare a variable type in C++?"
    },
    {
      "role": "user",
      "content": "So the compiler knows how much memory to allocate."
    },
    { "role": "assistant", "content": "Perfect! That is exactly correct." }
  ]
}
```

---

### GET `/api/feynman/exercise/:exerciseId/stats`

Check `isFeynmanPassed` in `exercise_attempt` for the current user.

**Response `200`:**

```json
{
  "exerciseId": "64f1a2b3c4d5e6f7a8b9c0d2",
  "isFeynmanPassed": false
}
```

---

## 4. Repetition

| Method | Endpoint                            | isAuth | Priority |
| ------ | ----------------------------------- | ------ | -------- |
| GET    | `/api/repetition/daily-tasks`       | Yes    | LOW      |
| GET    | `/api/repetition/:exerciseId/stats` | Yes    | LOW      |

---

### GET `/api/repetition/daily-tasks`

Fetch exercises where `nextReviewDate <= now()`. Returns count breakdown by status.

**Response `200`:**

```json
{
  "summary": {
    "total": 8,
    "learning": 3,
    "reviewing": 5
  },
  "tasks": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0d2",
      "title": "Fill in the variable type",
      "language": "C++",
      "level": "easy",
      "type": "fill_blank",
      "status": "Learning",
      "nextReviewDate": "2024-03-05T00:00:00.000Z"
    }
  ]
}
```

---

### GET `/api/repetition/:exerciseId/stats`

Retrieve the Spaced Repetition status and next review date for a specific exercise.

**Response `200`:**

```json
{
  "exerciseId": "64f1a2b3c4d5e6f7a8b9c0d2",
  "status": "Reviewing",
  "interval": 4,
  "nextReviewDate": "2024-03-09T00:00:00.000Z",
  "passReviewDate": "2024-03-05T00:00:00.000Z"
}
```

---

## 5. Tag Stats

| Method | Endpoint                | isAuth | Priority |
| ------ | ----------------------- | ------ | -------- |
| GET    | `/api/tags/weakness`    | Yes    | HIGH     |
| GET    | `/api/tags/:tagId/info` | Yes    | HIGH     |

---

### GET `/api/tags/weakness`

Retrieve all tags where `isWeak: true`, with attempt stats. Results are sorted by `failureRate` descending, then by `failAttempts` descending.

**Response `200`:**

```json
[
  {
    "_id": "64f1a2b3c4d5e6f7a8b9c0e1",
    "name": "pointers",
    "description": "Memory address and pointer operations",
    "totalAttempts": 10,
    "failAttempts": 7,
    "failureRate": 70,
    "isWeak": true,
    "updatedAt": "your test updatedAt"
  }
]
```

---

### GET `/api/tags/:tagId/info`

Deep dive into a specific tag with failure rate and performance metrics.

**Response `200`:**

```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0e1",
  "name": "pointers",
  "description": "Memory address and pointer operations",
  "totalAttempts": 10,
  "failAttempts": 7,
  "failureRate": 70,
  "isWeak": true,
  "updatedAt": "your test updatedAt"
}
```

---

### Get exercises by tag

Use the Practice System list API with the `tagId` query parameter.

```http
GET /api/practice/exercises?tagId=your_tag_id
```

Can be combined with other filters:

```http
GET /api/practice/exercises?tagId=your_tag_id&status=active&difficulty=easy
```

---

## 6. Learning System

| Method | Endpoint                                        | isAuth | Priority |
| ------ | ----------------------------------------------- | ------ | -------- |
| GET    | `/api/learning/milestones`                      | Yes    | HIGH     |
| GET    | `/api/learning/milestones/:milestoneId`         | Yes    | HIGH     |
| GET    | `/api/learning/milestones/:milestoneId/lessons` | Yes    | HIGH     |
| GET    | `/api/learning/lessons/:lessonId`               | Yes    | HIGH     |

---

### GET `/api/learning/milestones`

Get list of milestones with user progress attached.

**Response `200`:**

```json
[
  {
    "_id": "64f1a2b3c4d5e6f7a8b9c0a1",
    "title": "C++ Fundamentals",
    "description": "Variables, types, control flow and functions.",
    "order": 1,
    "progress": {
      "status": "active",
      "completionPercentage": 45
    }
  },
  {
    "_id": "64f1a2b3c4d5e6f7a8b9c0a2",
    "title": "Object Oriented Programming",
    "description": "Classes, inheritance, polymorphism.",
    "order": 2,
    "progress": {
      "status": "locked",
      "completionPercentage": 0
    }
  }
]
```

---

### GET `/api/learning/milestones/:milestoneId`

Get details of a specific milestone with user progress.

**Response `200`:**

```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0a1",
  "title": "C++ Fundamentals",
  "description": "Variables, types, control flow and functions.",
  "order": 1,
  "progress": {
    "status": "active",
    "completionPercentage": 45,
    "updatedAt": "2024-03-04T14:00:00.000Z"
  }
}
```

---

### GET `/api/learning/milestones/:milestoneId/lessons`

Get all lessons belonging to the milestone with progress status.

**Response `200`:**

```json
[
  {
    "_id": "64f1a2b3c4d5e6f7a8b9c0c1",
    "title": "Variables and Data Types",
    "order": 1,
    "progress": {
      "status": "completed",
      "isCompleted": true,
      "completionPercentage": 100
    }
  },
  {
    "_id": "64f1a2b3c4d5e6f7a8b9c0c2",
    "title": "Control Flow",
    "order": 2,
    "progress": {
      "status": "active",
      "isCompleted": false,
      "completionPercentage": 50
    }
  }
]
```

> `status` is one of `"completed"` | `"active"` | `"locked"`. A lesson is `active` when the milestone is active and all preceding lessons are completed. It is `locked` when the milestone itself is locked or the previous lesson is not yet completed.

---

### GET `/api/learning/lessons/:lessonId`

Get full lesson content with all blocks embedded. Block status reflects current user progress.

**Response `200`:**

```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0c1",
  "title": "Variables and Data Types",
  "order": 1,
  "blocks": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0b1",
      "title": "What is a Variable?",
      "description": "Data storage and types",
      "content": [
        {
          "type": "theory",
          "data": {
            "order": 1,
            "text": "A variable is a named memory location that stores a value.",
            "image": "https://cdn.example.com/images/variables.png"
          }
        },
        {
          "type": "code",
          "data": {
            "order": 2,
            "code": "int a = 10;\ncout << a;",
            "explanation": "Here we declare an integer variable and print it."
          }
        },
        {
          "type": "practice",
          "data": {
            "order": 3,
            "exerciseId": "64f1a2b3c4d5e6f7a8b9c0d2",
            "required": true
          }
        }
      ],
      "feynmanQuestion": "Can you explain what a variable is in your own words?",
      "status": "completed",
      "isFeynmanPassed": true
    },
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0b2",
      "title": "Variable Types and Memory",
      "description": "Understanding data types",
      "content": [
        {
          "type": "theory",
          "data": {
            "order": 1,
            "text": "C++ supports several data types: int, float, double, char, bool.",
            "image": null
          }
        }
      ],
      "feynmanQuestion": "What is the difference between int and float?",
      "status": "active",
      "isFeynmanPassed": false
    }
  ],
  "progress": {
    "status": "active",
    "completionPercentage": 50,
    "isCompleted": false,
    "lastAccessed": "2024-03-05T09:00:00.000Z"
  }
}
```

---

## 7. Other

| Method | Endpoint                             | isAuth | Priority |
| ------ | ------------------------------------ | ------ | -------- |
| GET    | `/api/languages`                     | No     | HIGH     |
| GET    | `/api/languages/:languageId`         | No     | HIGH     |
| POST   | `/api/languages/select`              | Yes    | HIGH     |
| POST   | `/api/exercises/:exerciseId/explain` | Yes    | HIGH     |
| GET    | `/api/dashboard`                     | Yes    | HIGH     |

---

### GET `/api/languages`

Get all available languages with full details.

**Response `200`:**

```json
[
  {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d9",
    "language": "C++",
    "info": "C++ is a general-purpose programming language created by Bjarne Stroustrup. It supports object-oriented, procedural, and generic programming styles.",
    "strengths": ["Performance", "Memory Control", "Hardware Access"],
    "challenges": ["Manual Memory", "Complex Syntax"],
    "useCases": ["Game Engines", "Operating Systems", "Embedded Systems"]
  },
  {
    "_id": "64f1a2b3c4d5e6f7a8b9c0da",
    "language": "Java",
    "info": "Java is a class-based, object-oriented language designed for portability across platforms.",
    "strengths": [
      "Platform Independence",
      "Strong Ecosystem",
      "Garbage Collection"
    ],
    "challenges": ["Verbose Syntax", "Slower Startup"],
    "useCases": [
      "Enterprise Applications",
      "Android Development",
      "Web Backends"
    ]
  }
]
```

---

### GET `/api/languages/:languageId`

Get full info for a specific language including strengths, challenges, and use cases.

**Response `200`:**

```json
{
  "_id": "64f1a2b3c4d5e6f7a8b9c0d9",
  "language": "C++",
  "info": "C++ is a general-purpose programming language created by Bjarne Stroustrup. It supports object-oriented, procedural, and generic programming styles.",
  "strengths": ["Performance", "Memory Control", "Hardware Access"],
  "challenges": ["Manual Memory", "Complex Syntax"],
  "useCases": ["Game Engines", "Operating Systems", "Embedded Systems"]
}
```

---

### POST `/api/languages/select`

Set the primary learning language for the authenticated user's profile.

**Request Body:**

```json
{
  "language": "C++"
}
```

**Response `200`:**

```json
{
  "message": "Language updated successfully",
  "selectedLanguage": ["C++"]
}
```

---

### POST `/api/exercises/:exerciseId/explain`

Analyze a user's answer for an exercise with AI. The backend grades each placeholder first, then sends the exercise context and grading result to AI to generate feedback.

**Request Body:**

```json
{
  "answer": {
    "input_1": "string",
    "input_2": "age",
    "input_3": "score"
  }
}
```

**Response `200`:**

```json
{
  "exerciseId": "6a146d34425b3586bbec641e",
  "isCorrect": true,
  "feedback": "Chào bạn! Bạn đã hoàn thành bài tập này rất tốt. Tất cả các phần khai báo biến của bạn đều chính xác.",
  "items": [
    {
      "field": "input_1",
      "isCorrect": true,
      "explanation": "Bạn đã sử dụng kiểu dữ liệu \"string\" một cách chính xác để lưu trữ tên. Kiểu \"string\" rất phù hợp cho các chuỗi ký tự như tên người."
    },
    {
      "field": "input_2",
      "isCorrect": true,
      "explanation": "Tên biến \"age\" (tuổi) mà bạn chọn rất rõ ràng và dễ hiểu cho một biến kiểu số nguyên. Nó giúp người đọc dễ dàng nhận biết mục đích của biến."
    },
    {
      "field": "input_3",
      "isCorrect": true,
      "explanation": "Việc đặt tên biến là \"score\" (điểm) là rất hợp lý và dễ đọc. Tên biến này giúp bạn và người khác hiểu ngay biến này dùng để làm gì."
    }
  ],
  "suggestion": "Hãy tiếp tục phát huy những kiến thức bạn đã học nhé!"
}
```

---

### GET `/api/dashboard`

Get general dashboard summary for the authenticated user.

**Response `200`:**

```json
{
  "user": {
    "_id": "64f1a2b3c4d5e6f7a8b9c0d1",
    "email": "alice@example.com",
    "username": "alice",
    "fullName": "Alice Nguyen",
    "selectedLanguage": ["C++"]
  },
  "roadmap": {
    "_id": "64f1a2b3c4d5e6f7a8b9c099",
    "title": "Lo trinh C++",
    "language": "C++"
  },
  "stats": {
    "totalLessons": 10,
    "totalLearnedLessons": 5,
    "totalExercises": 8,
    "totalCompletedExercises": 18,
    "overallProgress": 32,
    "weakTagsCount": 2
  },
  "milestones": [
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0a1",
      "title": "C++ Fundamentals",
      "status": "active",
      "completionPercentage": 45
    },
    {
      "_id": "64f1a2b3c4d5e6f7a8b9c0a2",
      "title": "Object Oriented Programming",
      "status": "locked",
      "completionPercentage": 0
    }
  ],
  "dailyReview": {
    "pendingCount": 0
  }
}
```

> `dailyReview.pendingCount` currently returns `0` until the repetition system is implemented.

**Error responses:**

```json
{ "message": "User not found" } // 404
{ "message": "No language selected" } // 400
{ "message": "Roadmap not found for selected language" } // 404
{ "message": "Failed to fetch dashboard" } // 500
```
