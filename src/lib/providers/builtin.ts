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

export const BUILTIN_PROVIDERS: BuiltinProvider[] = [
  {
    name: "OpenAI",
    slug: "openai",
    description: "GPT-4o, GPT-4o Mini, o3-mini",
    baseUrl: "https://api.openai.com/v1/chat/completions",
    authType: "BEARER",
    models: [
      { id: "gpt-4o", name: "GPT-4o", costPerInputToken: 0.0000025, costPerOutputToken: 0.00001 },
      { id: "gpt-4o-mini", name: "GPT-4o Mini", costPerInputToken: 0.00000015, costPerOutputToken: 0.0000006 },
      { id: "o3-mini", name: "o3-mini", costPerInputToken: 0.0000011, costPerOutputToken: 0.0000044 },
    ],
    bodyTemplate: {
      model: "{{model}}",
      messages: [{ role: "user", content: "{{prompt}}" }],
      temperature: "{{temperature}}",
      max_tokens: "{{maxTokens}}",
    },
    responseParser: {
      content: "choices[0].message.content",
      inputTokens: "usage.prompt_tokens",
      outputTokens: "usage.completion_tokens",
    },
  },
  {
    name: "Anthropic",
    slug: "anthropic",
    description: "Claude Opus 4, Claude Sonnet 4, Claude Haiku 3.5",
    baseUrl: "https://api.anthropic.com/v1/messages",
    authType: "HEADER",
    authConfig: { headerName: "x-api-key" },
    headers: { "anthropic-version": "2023-06-01", "content-type": "application/json" },
    models: [
      { id: "claude-opus-4-0-20250514", name: "Claude Opus 4", costPerInputToken: 0.000015, costPerOutputToken: 0.000075 },
      { id: "claude-sonnet-4-20250514", name: "Claude Sonnet 4", costPerInputToken: 0.000003, costPerOutputToken: 0.000015 },
      { id: "claude-haiku-3-5-20241022", name: "Claude Haiku 3.5", costPerInputToken: 0.0000008, costPerOutputToken: 0.000004 },
    ],
    bodyTemplate: {
      model: "{{model}}",
      messages: [{ role: "user", content: "{{prompt}}" }],
      temperature: "{{temperature}}",
      max_tokens: "{{maxTokens}}",
    },
    responseParser: {
      content: "content[0].text",
      inputTokens: "usage.input_tokens",
      outputTokens: "usage.output_tokens",
    },
  },
  {
    name: "Google AI",
    slug: "google",
    description: "Gemini 2.5 Pro, Gemini 2.5 Flash",
    baseUrl: "https://generativelanguage.googleapis.com/v1beta/models/{{model}}:generateContent",
    authType: "QUERY",
    authConfig: { paramName: "key" },
    models: [
      { id: "gemini-2.5-pro", name: "Gemini 2.5 Pro", costPerInputToken: 0.00000125, costPerOutputToken: 0.00001 },
      { id: "gemini-2.5-flash", name: "Gemini 2.5 Flash", costPerInputToken: 0.00000015, costPerOutputToken: 0.0000006 },
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
  {
    name: "Mistral AI",
    slug: "mistral",
    description: "Mistral Large, Mistral Small, Codestral",
    baseUrl: "https://api.mistral.ai/v1/chat/completions",
    authType: "BEARER",
    models: [
      { id: "mistral-large-latest", name: "Mistral Large", costPerInputToken: 0.000002, costPerOutputToken: 0.000006 },
      { id: "mistral-small-latest", name: "Mistral Small", costPerInputToken: 0.0000001, costPerOutputToken: 0.0000003 },
      { id: "codestral-latest", name: "Codestral", costPerInputToken: 0.0000003, costPerOutputToken: 0.0000009 },
    ],
    bodyTemplate: {
      model: "{{model}}",
      messages: [{ role: "user", content: "{{prompt}}" }],
      temperature: "{{temperature}}",
      max_tokens: "{{maxTokens}}",
    },
    responseParser: {
      content: "choices[0].message.content",
      inputTokens: "usage.prompt_tokens",
      outputTokens: "usage.completion_tokens",
    },
  },
  {
    name: "Cohere",
    slug: "cohere",
    description: "Command R+, Command R",
    baseUrl: "https://api.cohere.ai/v2/chat",
    authType: "BEARER",
    models: [
      { id: "command-r-plus-08-2024", name: "Command R+", costPerInputToken: 0.0000025, costPerOutputToken: 0.00001 },
      { id: "command-r-08-2024", name: "Command R", costPerInputToken: 0.00000015, costPerOutputToken: 0.0000006 },
    ],
    bodyTemplate: {
      model: "{{model}}",
      messages: [{ role: "user", content: "{{prompt}}" }],
      temperature: "{{temperature}}",
      max_tokens: "{{maxTokens}}",
    },
    responseParser: {
      content: "message.content[0].text",
      inputTokens: "usage.tokens.input_tokens",
      outputTokens: "usage.tokens.output_tokens",
    },
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
