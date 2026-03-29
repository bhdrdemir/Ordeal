import { z } from "zod";

/**
 * Validation schemas using Zod for type-safe runtime validation
 */

// Common field schemas
const temperature = z.number().min(0).max(2).default(0.7);
const maxTokens = z.number().int().min(1).max(128000).default(2048);

// Provider creation schema
export const providerCreateSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
  description: z.string().max(500).default(""),
  baseUrl: z.string().url().default(""),
  authType: z.enum(["BEARER", "HEADER", "QUERY", "CUSTOM", "NONE"]).default("BEARER"),
  authConfig: z.record(z.string(), z.unknown()).default({}),
  headers: z.record(z.string(), z.string()).default({}),
  bodyTemplate: z.record(z.string(), z.unknown()).default({}),
  models: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        costPerInputToken: z.number().min(0).default(0),
        costPerOutputToken: z.number().min(0).default(0),
      })
    )
    .default([]),
});

export type ProviderCreate = z.infer<typeof providerCreateSchema>;

// Evaluation creation schema
export const evaluationCreateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(1000).default(""),
  temperature,
  maxTokens,
  runsPerPrompt: z.number().int().min(1).max(10).default(1),
  prompts: z
    .object({
      content: z.string().min(1).max(10000),
      category: z.string().max(50).default("general"),
    })
    .array()
    .min(1)
    .max(50),
  models: z
    .object({
      providerId: z.string(),
      modelId: z.string(),
      label: z.string().default(""),
    })
    .array()
    .min(1)
    .max(10),
  judgeProviderId: z.string().optional(),
  judgeModel: z.string().optional(),
  judgePrompt: z.string().max(10000).optional(),
  criteria: z
    .array(
      z.object({
        name: z.string(),
        description: z.string().optional(),
        scale: z.number().min(1).max(10).default(5),
      })
    )
    .default([] as any),
});

export type EvaluationCreate = z.infer<typeof evaluationCreateSchema>;

// Prompt creation schema
export const promptCreateSchema = z.object({
  evalId: z.string(),
  content: z.string().min(1).max(10000),
  category: z.string().max(50).default("general"),
  order: z.number().int().min(0).default(0),
});

export type PromptCreate = z.infer<typeof promptCreateSchema>;

// Human score submission schema
export const humanScoreSchema = z.object({
  resultId: z.string(),
  score: z.number().min(0).max(10),
  breakdown: z.record(z.string(), z.number()).default({} as any),
  comment: z.string().max(1000).optional(),
});

export type HumanScore = z.infer<typeof humanScoreSchema>;

// API key creation schema
export const apiKeyCreateSchema = z.object({
  providerId: z.string(),
  key: z.string().min(10).max(500),
  label: z.string().max(100).default(""),
});

export type ApiKeyCreate = z.infer<typeof apiKeyCreateSchema>;

// Safe parse helper
export function safeParse<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    errors[path] = issue.message;
  }
  return { success: false, errors };
}
