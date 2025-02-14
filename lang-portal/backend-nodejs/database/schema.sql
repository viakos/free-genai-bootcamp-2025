BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "groups" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL,
	"words_count"	INTEGER DEFAULT 0,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "study_activities" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL,
	"url"	TEXT NOT NULL,
	"preview_url"	TEXT,
	PRIMARY KEY("id" AUTOINCREMENT)
);
CREATE TABLE IF NOT EXISTS "study_sessions" (
	"id"	INTEGER,
	"group_id"	INTEGER NOT NULL,
	"study_activity_id"	INTEGER NOT NULL,
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("group_id") REFERENCES "groups"("id"),
	FOREIGN KEY("study_activity_id") REFERENCES "study_activities"("id")
);
CREATE TABLE IF NOT EXISTS "word_groups" (
	"word_id"	INTEGER NOT NULL,
	"group_id"	INTEGER NOT NULL,
	FOREIGN KEY("group_id") REFERENCES "groups"("id"),
	FOREIGN KEY("word_id") REFERENCES "words"("id")
);
CREATE TABLE IF NOT EXISTS "word_review_items" (
	"id"	INTEGER,
	"word_id"	INTEGER NOT NULL,
	"study_session_id"	INTEGER NOT NULL,
	"correct"	BOOLEAN NOT NULL,
	"created_at"	DATETIME DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("study_session_id") REFERENCES "study_sessions"("id"),
	FOREIGN KEY("word_id") REFERENCES "words"("id")
);
CREATE TABLE IF NOT EXISTS "word_reviews" (
	"id"	INTEGER,
	"word_id"	INTEGER NOT NULL,
	"correct_count"	INTEGER DEFAULT 0,
	"wrong_count"	INTEGER DEFAULT 0,
	"last_reviewed"	TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY("id" AUTOINCREMENT),
	FOREIGN KEY("word_id") REFERENCES "words"("id")
);
CREATE TABLE IF NOT EXISTS "words" (
	"id"	INTEGER,
	"kanji"	TEXT NOT NULL,
	"romaji"	TEXT NOT NULL,
	"english"	TEXT NOT NULL,
	"parts"	TEXT NOT NULL,
	PRIMARY KEY("id" AUTOINCREMENT)
);
COMMIT;
