import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";
export * from "./models/chat";

// === API SCHEMAS (Non-Database) ===

export const decodeRequestSchema = z.object({
  language: z.string(),
});

export const decodedResultSchema = z.object({
  docType: z.string(),
  category: z.string(),
  urgency: z.enum(["Low", "Medium", "High"]),
  extractedFields: z.object({
    sender: z.string().nullable().optional(),
    receiver: z.string().nullable().optional(),
    date: z.string().nullable().optional(),
    deadline: z.string().nullable().optional(),
    subject: z.string().nullable().optional(),
    demands: z.array(z.string()).nullable().optional(),
  }),
  summary: z.string(),
  keyPoints: z.array(z.string()),
  actionPlan: z.string(),
  originalText: z.string(),
});

export type DecodedResult = z.infer<typeof decodedResultSchema>;
