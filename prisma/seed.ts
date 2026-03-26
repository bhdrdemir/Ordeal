import { PrismaClient } from "@prisma/client";

const BUILTIN_PROVIDERS = [
  {
    name: "OpenAI",
    slug: "openai",
    description: "GPT-4o, GPT-4o Mini, o3-mini",
    baseUrl: "https://api.openai.com/v1/chat/completions",
    authType: "BEARER" as const,
    models: [
      { id: "gpt-4o", name: "GPT-4o", costPerInputToken: 0.0000025, costPerOutputToken: 0.00001 },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", costPerInputToken: 0.00000015, costPerOutputToken: 0.0000006 },
      { id: "o3-mini", name: "o3-mini", costPerInputToken: 0.0000011, costPerOutputToken: 0.0000044 },
    ],
    bodyTemplate: { model: "{{model}}", messages: [{ role: "user", content: "{{prompt}}" }], temperature: "{{temperature}}", max_tokens: "{{maxTokens}}" },
    responseParser: { content: "choices[0].message.content", inputTokens: "usage.prompt_tokens", outputTokens: "usage.completion_tokens" },
  },
  {
    name: "Anthropic",
    slug: "anthropic",
    description: "Claude Opus 4, Claude Sonnet 4, Claude Haiku 3.5",
    baseUrl: "https://api.anthropic.com/v1/messages",
    authType: "HEADER" as const,
    authConfig: { headerName: "x-api-key" },
    headers: { "anthropic-version": "2023-06-01", "content-type": "application/json" },
    models: [
      { id: "claude-opus-4-0-20250514", name: "Claude Opus 4", costPerInputToken: 0.000015, costPerOutputToken: 0.000075 },
      { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", costPerInputToken: 0.000003, costPerOutputToken: 0.000015 },
      { id: "claude-haiku-3-5-20241022", name: "Claude Haiku 3.5", costPerInputToken: 0.0000008, costPerOutputToken: 0.000004 },
    ],
    bodyTemplate: { model: "{{model}}", messages: [{ role: "user", content: "{{prompt}}" }], temperature: "{{temperature}}", max_tokens: "{{maxTokens}}" },
    responseParser: { content: "content[0].text", inputTokens: "usage.input_tokens", outputTokens: "usage.output_tokens" },
  },
  {
    name: "Google AI",
    slug: "google",
    description: "Gemini 2.5 Pro, Gemini 2.5 Flash",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models/{{model}}:generateContent",
    authType: "QUERY" as const,
    authConfig: { paramName: "key" },
    models: [
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", costPerInputToken: 0.00000125, costPerOutputToken: 0.00001 },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", costPerInputToken: 0.00000015, costPerOutputToken: 0.0000006 },
    ],
    bodyTemplate: { contents: [{ parts: [{ text: "{{prompt}}" }] }], generationConfig: { temperature: "{{temperature}}", maxOutputTokens: "{{maxTokens}}" } },
    responseParser: { content: "candidates[0].content.parts[0].text", inputTokens: "usageMetadata.promptTokenCount", outputTokens: "usageMetadata.candidatesTokenCount" },
  },
  {
    name: "Mistral AI",
    slug: "mistral",
    description: "Mistral Large, Mistral Small, Codestral",
    baseUrl: "https://api.mistral.ai/v1/chat/completions",
    authType: "BEARER" as const,
    models: [
      { id: "mistral-large-latest", name: "Mistral Large", costPerInputToken: 0.000002, costPerOutputToken: 0.000006 },
      { id: "mistral-small-latest", name: "Mistral Small", costPerInputToken: 0.0000001, costPerOutputToken: 0.0000003 },
      { id: "codestral-latest", name: "Codestral", costPerInputToken: 0.0000003, costPerOutputToken: 0.0000009 },
    ],
    bodyTemplate: { model: "{{model}}", messages: [{ role: "user", content: "{{prompt}}" }], temperature: "{{temperature}}", max_tokens: "{{maxTokens}}" },
    responseParser: { content: "choices[0].message.content", inputTokens: "usage.prompt_tokens", outputTokens: "usage.completion_tokens" },
  },
  {
    name: "Cohere",
    slug: "cohere",
    description: "Command R+, Command R",
    baseUrl: "https://api.cohere.ai/v2/chat",
    authType: "BEARER" as const,
    models: [
      { id: "command-r-plus-08-2024", name: "Command R+", costPerInputToken: 0.0000025, costPerOutputToken: 0.00001 },
      { id: "command-r-08-2024", name: "Command R", costPerInputToken: 0.00000015, costPerOutputToken: 0.0000006 },
    ],
    bodyTemplate: { model: "{{model}}", messages: [{ role: "user", content: "{{prompt}}" }], temperature: "{{temperature}}", max_tokens: "{{maxTokens}}" },
    responseParser: { content: "message.content[0].text", inputTokens: "usage.tokens.input_tokens", outputTokens: "usage.tokens.output_tokens" },
  },
];

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding builtin providers...");

  for (const bp of BUILTIN_PROVIDERS) {
    // Check if already exists by slug (for builtin, userId is null)
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
          headers: bp.headers ?? {},
          authConfig: bp.authConfig ?? {},
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
          headers: bp.headers ?? {},
          authConfig: bp.authConfig ?? {},
          bodyTemplate: bp.bodyTemplate,
          models: bp.models,
          isPublic: true,
          userId: null,
        },
      });
      console.log(`  Created: ${bp.name}`);
    }
  }

  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
