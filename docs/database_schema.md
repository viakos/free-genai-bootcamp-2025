# Database Schema Documentation

## Overview
This document describes the database schema used for managing study activities, study sessions, vocabulary words, and their associations within a structured learning system.

## Tables

### 1. `groups`
Manages word groups used for categorizing vocabulary.

| Column       | Type    | Constraints                 | Description                         |
|-------------|--------|----------------------------|-------------------------------------|
| `id`        | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier for the group.   |
| `name`      | TEXT    | NOT NULL                   | Name of the group.                 |
| `words_count` | INTEGER | DEFAULT 0                | Number of words in the group.      |

---
### 2. `study_activities`
Stores different study activities available for learning.

| Column       | Type    | Constraints                 | Description                          |
|-------------|--------|----------------------------|--------------------------------------|
| `id`        | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier for the activity. |
| `name`      | TEXT    | NOT NULL                   | Name of the activity.               |
| `url`       | TEXT    | NOT NULL                   | URL to access the activity.         |
| `preview_url` | TEXT  | NULLABLE                   | URL for preview (if available).     |

---
### 3. `study_sessions`
Tracks individual study sessions, linking them to groups and activities.

| Column             | Type     | Constraints                      | Description                                  |
|-------------------|---------|---------------------------------|----------------------------------------------|
| `id`              | INTEGER | PRIMARY KEY AUTOINCREMENT      | Unique identifier for the session.         |
| `group_id`        | INTEGER | NOT NULL, FOREIGN KEY to `groups(id)` | Associated word group.                     |
| `study_activity_id` | INTEGER | NOT NULL, FOREIGN KEY to `study_activities(id)` | Associated study activity.         |
| `created_at`      | DATETIME | DEFAULT CURRENT_TIMESTAMP       | Timestamp of when session was created.      |

---
### 4. `word_groups`
Many-to-many relationship table between `words` and `groups`.

| Column     | Type    | Constraints                   | Description                              |
|-----------|--------|------------------------------|------------------------------------------|
| `word_id` | INTEGER | NOT NULL, FOREIGN KEY to `words(id)` | Associated word.                        |
| `group_id` | INTEGER | NOT NULL, FOREIGN KEY to `groups(id)` | Associated group.                       |

---
### 5. `word_review_items`
Tracks individual word reviews during study sessions.

| Column          | Type     | Constraints                          | Description                                      |
|---------------|---------|-------------------------------------|--------------------------------------------------|
| `id`          | INTEGER | PRIMARY KEY AUTOINCREMENT         | Unique identifier for the review item.          |
| `word_id`     | INTEGER | NOT NULL, FOREIGN KEY to `words(id)` | Reviewed word.                                  |
| `study_session_id` | INTEGER | NOT NULL, FOREIGN KEY to `study_sessions(id)` | Related study session.              |
| `correct`     | BOOLEAN | NOT NULL                            | Whether the answer was correct.                 |
| `created_at`  | DATETIME | DEFAULT CURRENT_TIMESTAMP          | Timestamp when the review occurred.            |

---
### 6. `word_reviews`
Stores cumulative review data for each word.

| Column         | Type     | Constraints                         | Description                              |
|--------------|---------|----------------------------------|------------------------------------------|
| `id`        | INTEGER | PRIMARY KEY AUTOINCREMENT       | Unique identifier for the review.      |
| `word_id`   | INTEGER | NOT NULL, FOREIGN KEY to `words(id)` | Associated word.                       |
| `correct_count` | INTEGER | DEFAULT 0                    | Number of correct attempts.            |
| `wrong_count`   | INTEGER | DEFAULT 0                    | Number of incorrect attempts.          |
| `last_reviewed` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP    | Last review timestamp.                 |

---
### 7. `words`
Stores vocabulary words with associated translations and representations.

| Column     | Type    | Constraints                 | Description                                   |
|-----------|--------|----------------------------|-----------------------------------------------|
| `id`      | INTEGER | PRIMARY KEY AUTOINCREMENT | Unique identifier for the word.              |
| `kanji`   | TEXT    | NOT NULL                   | Kanji representation of the word.            |
| `romaji`  | TEXT    | NOT NULL                   | Romanized pronunciation of the word.         |
| `english` | TEXT    | NOT NULL                   | English translation of the word.             |
| `parts`   | TEXT    | NOT NULL                   | Components or breakdown of the word.         |

## Relationships
- `study_sessions` links `groups` with `study_activities`.
- `word_groups` establishes a many-to-many relationship between `words` and `groups`.
- `word_review_items` tracks word review history within study sessions.
- `word_reviews` aggregates statistics on word reviews.

---
## Transactions
All changes to the database are wrapped in transactions to ensure data integrity.

```sql
BEGIN TRANSACTION;
-- Table creation statements here...
COMMIT;
```

This ensures that operations are atomic and prevent partial updates in case of failure.

## Summary
This schema organizes the learning process into structured tables, ensuring efficient tracking of vocabulary groups, study activities, and user progress through study sessions and word reviews.
