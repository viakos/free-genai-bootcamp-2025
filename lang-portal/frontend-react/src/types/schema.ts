import { z } from "zod";

// Define TypeScript interfaces (API response types)
export interface Word {
  id: number;
  thai: string;
  phonetic: string;
  english: string;
  difficulty: number;
}

export interface Group {
  id: number;
  name: string;
  description?: string;
}

export interface WordGroup {
  wordId: number;
  groupId: number;
}

export interface StudyActivity {
  id: number;
  name: string;
  description: string;
  type: string; // flashcards, quiz, etc.
}

export interface StudySession {
  id: number;
  activityId: number;
  startTime: string; // Use ISO 8601 format (e.g., "2025-02-18T12:00:00Z")
  endTime?: string;
  score?: number;
}

// Define Zod validation schemas for form validation
export const insertWordSchema = z.object({
  thai: z.string().min(1),
  phonetic: z.string().min(1),
  english: z.string().min(1),
  difficulty: z.number().min(1).max(5).default(1),
});

export const insertGroupSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

export const insertStudyActivitySchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  type: z.string(),
});

export const insertStudySessionSchema = z.object({
  activityId: z.number(),
  startTime: z.string(),
  endTime: z.string().optional(),
  score: z.number().optional(),
});

// Define TypeScript types for frontend form submissions
export type InsertWord = z.infer<typeof insertWordSchema>;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type InsertStudyActivity = z.infer<typeof insertStudyActivitySchema>;
export type InsertStudySession = z.infer<typeof insertStudySessionSchema>;
