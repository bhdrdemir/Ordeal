import { PrismaClient } from "@prisma/client";

// ─── Shared templates ──────────────────────────────────────────────────────────

const OPENAI_BODY = {
  model: "{{model}}",
  messages: [{ role: "user", content: "{{prompt}}" }],
  temperature: "{{temperature}}",
  max_tokens: "{{maxTokens}}",
};

const BUILTIN_PROVIDERS = [
  // ── OpenAI ──────────────────────────────────────────────────────────────────
  {
    name: "OpenAI",
    slug: "openai",
    description: "GPT-4.1, o3, o4-mini, GPT-4o — flagship and reasoning models",
    baseUrl: "https://api.openai.com/v1/chat/completions",
    authType: "BEARER" as const,
    authConfig: {},
    headers: {},
    models: [
      { id: "gpt-4.1",      name: "GPT-4.1",      costPerInputToken: 0.000002,   costPerOutputToken: 0.000008 },
      { id: "gpt-4.1-mini", name: "GPT-4.1 Mini",  costPerInputToken: 0.0000004,  costPerOutputToken: 0.0000016 },
      { id: "gpt-4.1-nano", name: "GPT-4.1 Nano",  costPerInputToken: 0.0000001,  costPerOutputToken: 0.0000004 },
      { id: "o3",           name: "o3",            costPerInputToken: 0.000002,   costPerOutputToken: 0.000008 },
      { id: "o4-mini",      name: "o4-mini",       costPerInputToken: 0.0000011,  costPerOutputToken: 0.0000044 },
      { id: "gpt-4o",       name: "GPT-4o",        costPerInputToken: 0.0000025,  costPerOutputToken: 0.00001 },
      { id: "gpt-4o-mini",  name: "GPT-4o Mini",   costPerInputToken: 0.00000015, costPerOutputToken: 0.0000006 },
    ],
    bodyTemplate: OPENAI_BODY,
  },

  // ── Anthropic ────────────────────────────────────────────────────────────────
  {
    name: "Anthropic",
    slug: "anthropic",
    description: "Claude Opus 4.6, Claude Sonnet 4.6, Claude Haiku 4.5",
    baseUrl: "https://api.anthropic.com/v1/messages",
    authType: "HEADER" as const,
    authConfig: { headerName: "x-api-key" },
    headers: { "anthropic-version": "2023-06-01", "content-type": "application/json" },
    models: [
      { id: "claude-opus-4-6",           name: "Claude Opus 4.6",   costPerInputToken: 0.000005,   costPerOutputToken: 0.000025 },
      { id: "claude-sonnet-4-6",         name: "Claude Sonnet 4.6", costPerInputToken: 0.000003,   costPerOutputToken: 0.000015 },
      { id: "claude-haiku-4-5-20251001", name: "Claude Haiku 4.5",  costPerInputToken: 0.000001,   costPerOutputToken: 0.000005 },
    ],
    bodyTemplate: OPENAI_BODY,
  },

  // ── Google AI ────────────────────────────────────────────────────────────────
  {
    name: "Google AI",
    slug: "google",
    description: "Gemini 2.5 Pro, Gemini 2.5 Flash — Google's frontier models",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models/{{model}}:generateContent",
    authType: "QUERY" as const,
    authConfig: { paramName: "key" },
    headers: {},
    models: [
      { id: "gemini-2.5-pro",   name: "Gemini 2.5 Pro",  costPerInputToken: 0.00000125, costPerOutputToken: 0.00001 },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", costPerInputToken: 0.0000003,  costPerOutputToken: 0.0000025 },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash", costPerInputToken: 0.0000001,  costPerOutputToken: 0.0000004 },
    ],
    bodyTemplate: {
      contents: [{ parts: [{ text: "{{prompt}}" }] }],
      generationConfig: { temperature: "{{temperature}}", maxOutputTokens: "{{maxTokens}}" },
    },
  },

  // ── Mistral AI ───────────────────────────────────────────────────────────────
  {
    name: "Mistral AI",
    slug: "mistral",
    description: "Mistral Large, Mistral Medium, Mistral Small, Codestral",
    baseUrl: "https://api.mistral.ai/v1/chat/completions",
    authType: "BEARER" as const,
    authConfig: {},
    headers: {},
    models: [
      { id: "mistral-large-latest",  name: "Mistral Large",  costPerInputToken: 0.0000005,  costPerOutputToken: 0.0000015 },
      { id: "mistral-medium-latest", name: "Mistral Medium",  costPerInputToken: 0.0000004,  costPerOutputToken: 0.000002 },
      { id: "mistral-small-latest",  name: "Mistral Small",   costPerInputToken: 0.0000001,  costPerOutputToken: 0.0000003 },
      { id: "codestral-latest",      name: "Codestral",       costPerInputToken: 0.0000003,  costPerOutputToken: 0.0000009 },
    ],
    bodyTemplate: OPENAI_BODY,
  },

  // ── Cohere ───────────────────────────────────────────────────────────────────
  {
    name: "Cohere",
    slug: "cohere",
    description: "Command A, Command R+, Command R, Command R7B",
    baseUrl: "https://api.cohere.ai/v2/chat",
    authType: "BEARER" as const,
    authConfig: {},
    headers: {},
    models: [
      { id: "command-a-03-2025",      name: "Command A",   costPerInputToken: 0.0000025,  costPerOutputToken: 0.00001 },
      { id: "command-r-plus-08-2024", name: "Command R+",  costPerInputToken: 0.0000025,  costPerOutputToken: 0.00001 },
      { id: "command-r-08-2024",      name: "Command R",   costPerInputToken: 0.00000015, costPerOutputToken: 0.0000006 },
      { id: "command-r7b-12-2024",    name: "Command R7B", costPerInputToken: 0.00000004, costPerOutputToken: 0.00000015 },
    ],
    bodyTemplate: OPENAI_BODY,
  },

  // ── xAI (Grok) ───────────────────────────────────────────────────────────────
  {
    name: "xAI (Grok)",
    slug: "xai",
    description: "Grok 3, Grok 3 Mini — xAI's frontier reasoning models",
    baseUrl: "https://api.x.ai/v1/chat/completions",
    authType: "BEARER" as const,
    authConfig: {},
    headers: {},
    models: [
      { id: "grok-3",      name: "Grok 3",      costPerInputToken: 0.000003,  costPerOutputToken: 0.000015 },
      { id: "grok-3-mini", name: "Grok 3 Mini", costPerInputToken: 0.0000003, costPerOutputToken: 0.0000005 },
    ],
    bodyTemplate: OPENAI_BODY,
  },

  // ── DeepSeek ─────────────────────────────────────────────────────────────────
  {
    name: "DeepSeek",
    slug: "deepseek",
    description: "DeepSeek V3.2, DeepSeek R1 — ultra-affordable frontier models",
    baseUrl: "https://api.deepseek.com/chat/completions",
    authType: "BEARER" as const,
    authConfig: {},
    headers: {},
    models: [
      { id: "deepseek-chat",     name: "DeepSeek V3.2", costPerInputToken: 0.00000028, costPerOutputToken: 0.00000042 },
      { id: "deepseek-reasoner", name: "DeepSeek R1",   costPerInputToken: 0.00000055, costPerOutputToken: 0.00000219 },
    ],
    bodyTemplate: OPENAI_BODY,
  },

  // ── Groq ─────────────────────────────────────────────────────────────────────
  {
    name: "Groq",
    slug: "groq",
    description: "Llama 3.3 70B, Llama 3.1 8B — ultra-fast LPU inference",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    authType: "BEARER" as const,
    authConfig: {},
    headers: {},
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", costPerInputToken: 0.00000059, costPerOutputToken: 0.00000079 },
      { id: "llama-3.1-8b-instant",    name: "Llama 3.1 8B",  costPerInputToken: 0.00000005, costPerOutputToken: 0.00000008 },
    ],
    bodyTemplate: OPENAI_BODY,
  },
];

// ─── Seed ──────────────────────────────────────────────────────────────────────

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding builtin providers...");

  for (const bp of BUILTIN_PROVIDERS) {
    const existing = await prisma.provider.findFirst({
      where: { slug: bp.slug, type: "BUILTIN" },
    });

    if (existing) {
      await prisma.provider.update({
        where: { id: existing.id },
        data: {
          name: bp.name,
          description: bp.description,
          baseUrl: bp.baseUrl,
          authType: bp.authType,
          authConfig: bp.authConfig,
          headers: bp.headers,
          bodyTemplate: bp.bodyTemplate,
          models: bp.models,
        },
      });
      console.log(`  Updated: ${bp.name}`);
    } else {
      await prisma.provider.create({
        data: {
          name: bp.name,
          slug: bp.slug,
          description: bp.description,
          type: "BUILTIN",
          baseUrl: bp.baseUrl,
          authType: bp.authType,
          authConfig: bp.authConfig,
          headers: bp.headers,
          bodyTemplate: bp.bodyTemplate,
          models: bp.models,
          isPublic: true,
          userId: null,
        },
      });
      console.log(`  Created: ${bp.name}`);
    }
  }

  console.log(`Seed complete! ${BUILTIN_PROVIDERS.length} providers processed.`);
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
