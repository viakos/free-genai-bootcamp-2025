# Backend Technical Specification

## Introduction
### **Purpose**
This document outlines the **Backend Technical Specification** for the **Thai Language Learning Web Application**. It defines the technologies, UI structure, state management, API integration, validation, and user interactions.

## Technology Stack
| Feature | Technology |
|---------|------------|
| **Programming Language** | TypeScript (Node.js) |
| **Framework** | Fastify (High-performance web framework) |
| **Database** | SQLite (for now) → PostgreSQL (future migration) |
| **ORM** | Prisma (for database management) |
| **Authentication** | None (Single-user system) |
| **Validation** | Zod (Type-safe validation) |
| **API Documentation** | Swagger (fastify-swagger) |
| **Logging** | Pino (Fastify's built-in logger) |

---

## Project structure
backend-nodejs/
├── src/
│   ├── config/
│   │   ├── app.ts           # Fastify app configuration
│   │   └── swagger.ts       # Swagger/OpenAPI configuration
│   │
│   ├── controllers/
│   │   ├── dashboardController.ts
│   │   ├── studyActivityController.ts
│   │   ├── wordController.ts
│   │   ├── groupController.ts
│   │   ├── studySessionController.ts
│   │   └── systemController.ts
│   │
│   ├── plugins/
│   │   ├── swagger.ts       # Fastify Swagger plugin setup
│   │   └── prisma.ts        # Prisma plugin for Fastify
│   │
│   ├── routes/
│   │   ├── dashboard.ts
│   │   ├── studyActivities.ts
│   │   ├── words.ts
│   │   ├── groups.ts
│   │   ├── studySessions.ts
│   │   └── system.ts
│   │
│   ├── services/
│   │   ├── dashboardService.ts
│   │   ├── studyActivityService.ts
│   │   ├── wordService.ts
│   │   ├── groupService.ts
│   │   ├── studySessionService.ts
│   │   └── systemService.ts
│   │
│   ├── schemas/
│   │   ├── dashboard.ts     # Zod schemas for dashboard
│   │   ├── studyActivity.ts # Zod schemas for study activities
│   │   ├── word.ts         # Zod schemas for words
│   │   ├── group.ts        # Zod schemas for groups
│   │   ├── studySession.ts # Zod schemas for study sessions
│   │   └── system.ts       # Zod schemas for system operations
│   │
│   ├── types/
│   │   └── index.ts        # TypeScript type definitions
│   │
│   └── app.ts              # Main application entry point
│
├── prisma/
│   ├── migrations/         # Prisma migration files
│   │   └── ...
│   ├── schema.prisma      # Prisma schema
│   └── seed.ts           # Prisma seed script
│
├── database/
│   └── thai-frequency-list.csv  # Initial word data
│
├── scripts/
│   └── setup.ts          # Setup script for first-time installation
│
├── .env                  # Environment variables
├── .env.example         # Environment variables template
├── .eslintrc.js         # ESLint configuration
├── .prettierrc          # Prettier configuration
├── nodemon.json         # Nodemon configuration
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
└── README.md           # Project documentation

### **API Endpoints**

## Details of endpoints:
- GET /api/dashboard/last_study_session
  Fetch the last study session
```json
{
  "id": 123,
  "group_id":456,
  "created_at":"2025-02-08T17:20:23-05:00",
  "study_activity_id": 789,
  "group_id":456,
  "group_name": "Basic Greetings"
}
```

- GET /api/dashboard/study_progress
Returns study progress statistics.
Mastery progress bar will be calculated in the frontend using total words studied and total available words.
```json
{
  "total_words_studied": 3,
  "total_available_words": 124,
}
```json

- GET /api/dashboard/quick-stats
```json
{
  "success_rate": 80,
  "total_study_sessions": 15,
  "total__active_groups": 3,
  "study_streak_days": 5
}
```

- GET /api/study_activities/:id
```json
{
"id": 1,
"name": "Vovabulary quiz",
"thumbnail_url": "https://example.com/thumbnail.jpg",
"description": "Practice your vocabulary with flashcards"
}
```

-  GET /api/study_activities/:id/study_sessions
 Get study sessions for a specific activity 
```json
{
    "study_sessions":[
      {
        "id": 14,
        "activity_name": "vocabulary quiz",
        "group_name": "Common Words",
        "start_time": "2024-02-11T09:00:00Z",
        "end_time": "2024-02-11T09:05:00Z",
        "review_items_count":20
      }
],
"pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items":100,
    "items_per_page": 20
}
}
```

- POST /api/study_activities
```json
required params:
{
  "group_id": 2,
  "study_activity_id": 3
}
```

example response:
```json
{
  "session_id": 15,
  "group_id": 123
}
```

- GET /api/words/
```json
{
    "words": [
        {
            "thai": "สวัสดี",
            "romanized": "sawasdi",
            "english":"hello",
            "correct_count": 5,
            "wrong_count": 2
        }
    ],
     "pagination": {
         "current_page": 1,
         "total_pages": 5,
         "total_items": 500,
         "items_per_page": 100
      }
}
```

- GET /api/words/:id
```json
{
  "thai": "สวัสดี",
  "romanized": "sawasdee",
  "english": "hello",
  "stats": {
    "correct_count": 5,
    "wrong_count": 2
   },
   "groups": [
        {
             "id":1,
              "name": "basic greetings"
        }
     ]
}

- GET /api/groups
```json
{
  "items": [
    {"id": 1, "name": "Common Words", "words_count": 50},
    {"id": 2, "name": "Food & Drinks", "words_count": 30}
  ],
  "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 10,
     "items_per_page": 100
   }
}
```

- /api/groups/:id
```json
{
     "id":1,
     "name": "basic greetings",
     "stats": {
         "total_word_count": 20
      }
}
```

- GET /api/groups/:id/words
```json
{
    "items": [
  {"thai": "ข้าว", "romanized": "khao", "english": "rice","correct_count": 5, "wrong_count":2}
],
  "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 20,
     "items_per_page": 100
   }
}
```
- GET /api/groups/:id/study_sessions
```json
{
    "items": [
        {
            "id": 123,
            "activity_name": "vocabulary quiz",
            "group_name": "basic greetings",
            "start_time": "2024-02-08T17:20:23-05:00",
            "end_time": "2024-02-08T17:20:29-05:00"
         }
      ],
      "pagination": {
           "current_page": 1,
           "total_pages": 1,
           "total_items": 5,
          "items_per_page": 100
       }
}
```

- GET /api/study_sessions
```json
{
    "items": [
        {
            "id": 123,
            "activity_name": "vocabulary quiz",
            "group_name": "basic greetings",
            "start_time": "2024-02-08T17:20:23-05:00",
            "end_time": "2024-02-08T17:20:29-05:00"
         }
      ],
      "pagination": {
           "current_page": 1,
           "total_pages": 1,
           "total_items": 5,
          "items_per_page": 100
       }
}
```

- /api/study_sessions/:id
```json
{
  "id": 12,
  "activity_name": "Typing Tutor",
  "group_name": "Common Words",
  "start_time": "2024-02-12T10:00:00Z",
  "end_time": "2024-02-12T10:05:00Z",
  "review_items_count": 8
}
```

- /api/study_sessions/:id/words
```json
{ 
    "items": [
     {"thai": "ข้าว", "romanized": "khao", "english": "rice","correct_count": 5, "wrong_count":2}
],
  "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 20,
     "items_per_page": 100
  }
}
```

 POST /api/study_sessions/:id/words/:word_id/review
 Review words
request params:

  - id (study_session_id)
  - word_id
  - correct

request payload:
```json
{"correct": true
}
```

response:
```json
{
    "success": true,
    "word_id": 1,
    "study_session_id": 123,
    "correct": true,
    "created_at": "2025-02-08T17:33:07-05:00"
}
```

- POST /api/reset_history
```json
{
    "success": true,
    "message": "Study history has been reset"
}
```

- POST /api/full_reset
```json
{
    "success": true,
    "message": "System has been fully reset"
}
```

-
### Security & Authentication
- This application is **a single-user system**.
- **No authentication or authorization** is implemented.
- **All API endpoints are publicly accessible**, assuming a trusted environment.
- If authentication is required in the future, **JWT or API key-based authentication** can be integrated.

---
## Database
sqlite database in a single file "words.db" in the root of the project folder backend-nodejs.

### Tables

#### 1. `Group`
Manages word groups used for categorizing vocabulary.

| Column       | Type    | Constraints                 | Description                         |
|-------------|--------|----------------------------|-------------------------------------|
| `id`        | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier for the group.   |
| `name`      | TEXT    | NOT NULL                   | Name of the group.                 |
| `wordsCount` | INTEGER | DEFAULT 0                | Number of words in the group.      |

---
#### 2. `StudyActivity`
Stores different study activities available for learning.

| Column       | Type    | Constraints                 | Description                          |
|-------------|--------|----------------------------|--------------------------------------|
| `id`        | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier for the activity. |
| `name`      | TEXT    | NOT NULL                   | Name of the activity.               |
| `url`       | TEXT    | NOT NULL                   | URL to access the activity.         |
| `previewUrl` | TEXT  | NULLABLE                   | URL for preview (if available).     |

---
#### 3. `studySession`
Tracks individual study sessions, linking them to groups and activities.

| Column             | Type     | Constraints                      | Description                                  |
|-------------------|---------|---------------------------------|----------------------------------------------|
| `id`              | INTEGER | PRIMARY KEY AUTOINCREMENT      | Unique identifier for the session.         |
| `groupId`        | INTEGER | NOT NULL, FOREIGN KEY to `groups(id)` | Associated word group.                     |
| `studyActivityId` | INTEGER | NOT NULL, FOREIGN KEY to `study_activities(id)` | Associated study activity.         |
| `created_at`      | DATETIME | DEFAULT CURRENT_TIMESTAMP       | Timestamp of when session was created.      |

---
#### 4. `wordsInGroups`
Many-to-many relationship table between `words` and `groups`.

| Column     | Type    | Constraints                   | Description                              |
|-----------|--------|------------------------------|------------------------------------------|
| `word_id` | INTEGER | NOT NULL, FOREIGN KEY to `words(id)` | Associated word.                        |
| `group_id` | INTEGER | NOT NULL, FOREIGN KEY to `groups(id)` | Associated group.                       |

---
#### 5. StudyResult (word_review_items)
Tracks individual word reviews during study sessions.

| Column          | Type     | Constraints                          | Description                                      |
|---------------|---------|-------------------------------------|--------------------------------------------------|
| `id`          | INTEGER | PRIMARY KEY AUTOINCREMENT         | Unique identifier for the review item.          |
| `wordId`     | INTEGER | NOT NULL, FOREIGN KEY to `words(id)` | Reviewed word.                                  |
| `studySessionId` | INTEGER | NOT NULL, FOREIGN KEY to `study_sessions(id)` | Related study session.              |
| `correct`     | BOOLEAN | NOT NULL                            | Whether the answer was correct.                 |
| `created_at`  | DATETIME | DEFAULT CURRENT_TIMESTAMP          | Timestamp when the review occurred.            |

---
#### 6. `wordReview`
Stores cumulative review data for each word.

| Column         | Type     | Constraints                         | Description                              |
|--------------|---------|----------------------------------|------------------------------------------|
| `id`        | INTEGER | PRIMARY KEY AUTOINCREMENT       | Unique identifier for the review.      |
| `wordId`   | INTEGER | NOT NULL, FOREIGN KEY to `words(id)` | Associated word.                       |
| `correctCount` | INTEGER | DEFAULT 0                    | Number of correct attempts.            |
| `wrongCount`   | INTEGER | DEFAULT 0                    | Number of incorrect attempts.          |
| `lastReviewed` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP    | Last review timestamp.                 |

---
#### 7. `word`
Stores vocabulary words with associated translations and representations.

| Column     | Type    | Constraints                 | Description                                   |
|-----------|--------|----------------------------|-----------------------------------------------|
| `id`      | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier for the word.              |
| `thai`   | TEXT    | NOT NULL                   | Kanji representation of the word.            |
| `romanized`  | TEXT    | NOT NULL                   | Romanized pronunciation of the word.         |
| `english` | TEXT    | NOT NULL                   | English translation of the word.             |

#### Relationships
- `study_sessions` links `groups` with `study_activities`.
- `word_groups` establishes a many-to-many relationship between `words` and `groups`.
- `word_review_items` tracks word review history within study sessions.
- `word_reviews` aggregates statistics on word reviews.

---


## Future Considerations
- **Multi-user support:** Not implemented in this version but may be added later.
- **Additional study activities:** Only **Typing Tutor** is implemented for now; new activities may be introduced.
- **Group renaming & deletion:** Not currently available but could be added in the future.
- **Study history reset is irreversible** (requires confirmation before execution).
- **No animations or UI transitions planned.**

## Testing Requirements
- **Framework**: Jest
- **Coverage**: Unit tests only
- **Test Location**: Tests should be placed in `__tests__` directories adjacent to the files they test
- **Naming Convention**: Files should be named `*.test.ts`
- **Required Coverage**: 
  - Controllers: 100%
  - Services: 100%
  - Schemas: 100%
  - Routes: 80%
- **Test Types**:
  - Input validation
  - Error handling
  - Business logic
  - Edge cases
- **Mocking**: Use Jest's built-in mocking capabilities for external dependencies

---

## npm Scripts and sqlite CLI (tasks)
use of npm and SQlite CLI to initialize and populate database

### Initialize database
script database/schema.sql

Scripts example in package.json:

{
  "scripts": {
    "init-db": "sqlite3 database.db < scripts/schema.sql"
  }
}

### Seed data
import csv file database/thai-frequency-list.csv and transform them into target data for our database. 
Only use Thai,English and Romanization columns.

#### csv file format
Thai,English,Romanization,ipa,Exemple sentence
ที่,at,thi,tʰîː,เขาได้รับรางวัลที่ 1 ในการประกวดวาดภาพ
ได้,can,dai,dâj,นักท่องเที่ยวได้ข้อมูลนี้จากหนังสือนำเที่ยว
จะ,will,cha,tɕàʔ,การอนุรักษ์สิ่งแวดล้อมจะสัมฤทธิ์ผลได้ถ้าทุกคนร่วมมือกัน
นี้,this,ni,níː,ศาลมีคำพิพากษาถึงที่สุดว่าการสมรสของบุคคลคู่นี้ เป็นโมฆะแล้ว
