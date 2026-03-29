export interface ModelDef {
  id: string;
  name: string;
  costPerInputToken: number;
  costPerOutputToken: number;
}

export interface ResponseParser {
  content: string;
  inputTokens: string;
  outputTokens: string;
}

export interface BuiltinProvider {
  name: string;
  slug: string;
  description: string;
  baseUrl: string;
  authType: "BEARER" | "HEADER" | "QUERY";
  authConfig?: Record<string, string>;
  headers?: Record<string, string>;
  models: ModelDef[];
  bodyTemplate: Record<string, unknown>;
  responseParser: ResponseParser;
}

// ─── Shared response parsers ───────────────────────────────────────────────────

/** OpenAI-compatible response format (used by OpenAI, xAI, DeepSeek, Groq, Mistral) */
const OPENAI_PARSER: ResponseParser = {
  content: "choices[0].message.content",
  inputTokens: "usage.prompt_tokens",
  outputTokens: "usage.completion_tokens",
};

/** Standard OpenAI-compatible request body */
const OPENAI_BODY = {
  model: "{{model}}",
  messages: [{ role: "user", content: "{{prompt}}" }],
  temperature: "{{temperature}}",
  max_tokens: "{{maxTokens}}",
};

// ─── Provider definitions ──────────────────────────────────────────────────────

export const BUILTIN_PROVIDERS: BuiltinProvider[] = [
  // ── OpenAI ──────────────────────────────────────────────────────────────────
  {
    name: "OpenAI",
    slug: "openai",
    description: "GPT-4.1, o3, o4-mini, GPT-4o — flagship and reasoning models",
    baseUrl: "https://api.openai.com/v1/chat/completions",
    authType: "BEARER",
    models: [
      // GPT-4.1 series (April 2025)
      { id: "gpt-4.1",      name: "GPT-4.1",      costPerInputToken: 0.000002,   costPerOutputToken: 0.000008 },
      { id: "gpt-4.1-mini", name: "GPT-4.1 Mini",  costPerInputToken: 0.0000004,  costPerOutputToken: 0.0000016 },
      { id: "gpt-4.1-nano", name: "GPT-4.1 Nano",  costPerInputToken: 0.0000001,  costPerOutputToken: 0.0000004 },
      // o-series reasoning models
      { id: "o3",           name: "o3",            costPerInputToken: 0.000002,   costPerOutputToken: 0.000008 },
      { id: "o4-mini",      name: "o4-mini",       costPerInputToken: 0.0000011,  costPerOutputToken: 0.0000044 },
      // GPT-4o (kept for compatibility)
      { id: "gpt-4o",       name: "GPT-4o",        costPerInputToken: 0.0000025,  costPerOutputToken: 0.00001 },
      { id: "gpt-4o-mini",  name: "GPT-4o Mini",   costPerInputToken: 0.00000015, costPerOutputToken: 0.0000006 },
    ],
    bodyTemplate: OPENAI_BODY,
    responseParser: OPENAI_PARSER,
  },

  // ── Anthropic ────────────────────────────────────────────────────────────────
  {
    name: "Anthropic",
    slug: "anthropic",
    description: "Claude Opus 4.6, Claude Sonnet 4.6, Claude Haiku 4.5",
    baseUrl: "https://api.anthropic.com/v1/messages",
    authType: "HEADER",
    authConfig: { headerName: "x-api-key" },
    headers: { "anthropic-version": "2023-06-01", "content-type": "application/json" },
    models: [
      { id: "claude-opus-4-6",          name: "Claude Opus 4.6",   costPerInputToken: 0.000005,   costPerOutputToken: 0.000025 },
      { id: "claude-sonnet-4-6",        name: "Claude Sonnet 4.6", costPerInputToken: 0.000003,   costPerOutputToken: 0.000015 },
      { id: "claude-haiku-4-5-20251001",name: "Claude Haiku 4.5",  costPerInputToken: 0.000001,   costPerOutputToken: 0.000005 },
    ],
    bodyTemplate: OPENAI_BODY,
    responseParser: {
      content: "content[0].text",
      inputTokens: "usage.input_tokens",
      outputTokens: "usage.output_tokens",
    },
  },

  // ── Google AI ────────────────────────────────────────────────────────────────
  {
    name: "Google AI",
    slug: "google",
    description: "Gemini 2.5 Pro, Gemini 2.5 Flash — Google's frontier models",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models/{{model}}:generateContent",
    authType: "QUERY",
    authConfig: { paramName: "key" },
    models: [
      { id: "gemini-2.5-pro",   name: "Gemini 2.5 Pro",   costPerInputToken: 0.00000125, costPerOutputToken: 0.00001 },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash",  costPerInputToken: 0.0000003,  costPerOutputToken: 0.0000025 },
      { id: "gemini-2.0-flash", name: "Gemini 2.0 Flash",  costPerInputToken: 0.0000001,  costPerOutputToken: 0.0000004 },
    ],
    bodyTemplate: {
      contents: [{ parts: [{ text: "{{prompt}}" }] }],
      generationConfig: { temperature: "{{temperature}}", maxOutputTokens: "{{maxTokens}}" },
    },
    responseParser: {
      content: "candidates[0].content.parts[0].text",
      inputTokens: "usageMetadata.promptTokenCount",
      outputTokens: "usageMetadata.candidatesTokenCount",
    },
  },

  // ── Mistral AI ───────────────────────────────────────────────────────────────
  {
    name: "Mistral AI",
    slug: "mistral",
    description: "Mistral Large, Mistral Medium, Mistral Small, Codestral",
    baseUrl: "https://api.mistral.ai/v1/chat/completions",
    authType: "BEARER",
    models: [
      { id: "mistral-large-latest",  name: "Mistral Large",  costPerInputToken: 0.0000005,  costPerOutputToken: 0.0000015 },
      { id: "mistral-medium-latest", name: "Mistral Medium",  costPerInputToken: 0.0000004,  costPerOutputToken: 0.000002 },
      { id: "mistral-small-latest",  name: "Mistral Small",   costPerInputToken: 0.0000001,  costPerOutputToken: 0.0000003 },
      { id: "codestral-latest",      name: "Codestral",       costPerInputToken: 0.0000003,  costPerOutputToken: 0.0000009 },
    ],
    bodyTemplate: OPENAI_BODY,
    responseParser: OPENAI_PARSER,
  },

  // ── Cohere ───────────────────────────────────────────────────────────────────
  {
    name: "Cohere",
    slug: "cohere",
    description: "Command A, Command R+, Command R, Command R7B",
    baseUrl: "https://api.cohere.ai/v2/chat",
    authType: "BEARER",
    models: [
      { id: "command-a-03-2025",       name: "Command A",    costPerInputToken: 0.0000025,  costPerOutputToken: 0.00001 },
      { id: "command-r-plus-08-2024",  name: "Command R+",   costPerInputToken: 0.0000025,  costPerOutputToken: 0.00001 },
      { id: "command-r-08-2024",       name: "Command R",    costPerInputToken: 0.00000015, costPerOutputToken: 0.0000006 },
      { id: "command-r7b-12-2024",     name: "Command R7B",  costPerInputToken: 0.00000004, costPerOutputToken: 0.00000015 },
    ],
    bodyTemplate: OPENAI_BODY,
    responseParser: {
      content: "message.content[0].text",
      inputTokens: "usage.tokens.input_tokens",
      outputTokens: "usage.tokens.output_tokens",
    },
  },

  // ── xAI (Grok) ───────────────────────────────────────────────────────────────
  {
    name: "xAI (Grok)",
    slug: "xai",
    description: "Grok 3, Grok 3 Mini — xAI's frontier reasoning models",
    baseUrl: "https://api.x.ai/v1/chat/completions",
    authType: "BEARER",
    models: [
      { id: "grok-3",      name: "Grok 3",      costPerInputToken: 0.000003,   costPerOutputToken: 0.000015 },
      { id: "grok-3-mini", name: "Grok 3 Mini", costPerInputToken: 0.0000003,  costPerOutputToken: 0.0000005 },
    ],
    bodyTemplate: OPENAI_BODY,
    responseParser: OPENAI_PARSER,
  },

  // ── DeepSeek ─────────────────────────────────────────────────────────────────
  {
    name: "DeepSeek",
    slug: "deepseek",
    description: "DeepSeek V3.2, DeepSeek R1 — ultra-affordable frontier models",
    baseUrl: "https://api.deepseek.com/chat/completions",
    authType: "BEARER",
    models: [
      { id: "deepseek-chat",     name: "DeepSeek V3.2", costPerInputToken: 0.00000028, costPerOutputToken: 0.00000042 },
      { id: "deepseek-reasoner", name: "DeepSeek R1",   costPerInputToken: 0.00000055, costPerOutputToken: 0.00000219 },
    ],
    bodyTemplate: OPENAI_BODY,
    responseParser: OPENAI_PARSER,
  },

  // ── Groq ─────────────────────────────────────────────────────────────────────
  {
    name: "Groq",
    slug: "groq",
    description: "Llama 3.3 70B, Llama 3.1 8B — ultra-fast LPU inference",
    baseUrl: "https://api.groq.com/openai/v1/chat/completions",
    authType: "BEARER",
    models: [
      { id: "llama-3.3-70b-versatile", name: "Llama 3.3 70B", costPerInputToken: 0.00000059, costPerOutputToken: 0.00000079 },
      { id: "llama-3.1-8b-instant",    name: "Llama 3.1 8B",  costPerInputToken: 0.00000005, costPerOutputToken: 0.00000008 },
    ],
    bodyTemplate: OPENAI_BODY,
    responseParser: OPENAI_PARSER,
  },
];

/** Resolve a dot-path like "choices[0].message.content" from a JSON object */
export function resolvePath(obj: unknown, path: string): unknown {
  const parts = path.replace(/\[(\d+)\]/g, ".$1").split(".");
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

/** Fill template variables like {{model}}, {{prompt}}, etc. */
export function fillTemplate(
  template: Record<string, unknown>,
  vars: Record<string, string | number>
): Record<string, unknown> {
  const json = JSON.stringify(template);
  const filled = json.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const val = vars[key];
    return val !== undefined ? String(val) : "";
  });
  return JSON.parse(filled);
}

/** Find a builtin provider by slug */
export function getBuiltinProvider(slug: string): BuiltinProvider | undefined {
  return BUILTIN_PROVIDERS.find((p) => p.slug === slug);
}
