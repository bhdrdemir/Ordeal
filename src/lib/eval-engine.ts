/**
 * Server-side evaluation engine for built-in providers.
 * Sends requests to LLM APIs, measures latency, parses responses.
 */

import { resolvePath, fillTemplate } from "./providers/builtin";

export interface EvalTask {
  promptId: string;
  promptContent: string;
  evalModelId: string;
  modelId: string;
  provider: {
    baseUrl: string;
    authType: string;
    authConfig: Record<string, string>;
    headers: Record<string, string>;
    bodyTemplate: Record<string, unknown>;
    responseParser: { content: string; inputTokens: string; outputTokens: string };
    models: Array<{ id: string; costPerInputToken: number; costPerOutputToken: number }>;
  };
  apiKey: string;
  temperature: number;
  maxTokens: number;
  runIndex: number;
}

export interface EvalTaskResult {
  promptId: string;
  evalModelId: string;
  runIndex: number;
  response: string;
  latency: number;
  cost: number | null;
  inputTokens: number | null;
  outputTokens: number | null;
  error: string | null;
}

export type ProgressCallback = (completed: number, total: number, result: EvalTaskResult) => void;

/** Build the fetch URL with auth query params if needed */
function buildUrl(baseUrl: string, modelId: string, authType: string, authConfig: Record<string, string>, apiKey: string): string {
  let url = baseUrl.replace("{{model}}", modelId);
  if (authType === "QUERY" && authConfig.paramName) {
    const sep = url.includes("?") ? "&" : "?";
    url = `${url}${sep}${authConfig.paramName}=${apiKey}`;
  }
  return url;
}

/** Build headers with auth */
function buildHeaders(
  headers: Record<string, string>,
  authType: string,
  authConfig: Record<string, string>,
  apiKey: string
): Record<string, string> {
  const result: Record<string, string> = { "content-type": "application/json", ...headers };
  if (authType === "BEARER") {
    result["authorization"] = `Bearer ${apiKey}`;
  } else if (authType === "HEADER" && authConfig.headerName) {
    result[authConfig.headerName] = apiKey;
  }
  return result;
}

/** Execute a single eval task */
export async function executeTask(task: EvalTask): Promise<EvalTaskResult> {
  const startTime = Date.now();

  try {
    const url = buildUrl(task.provider.baseUrl, task.modelId, task.provider.authType, task.provider.authConfig, task.apiKey);
    const headers = buildHeaders(task.provider.headers, task.provider.authType, task.provider.authConfig, task.apiKey);
    const body = fillTemplate(task.provider.bodyTemplate, {
      model: task.modelId,
      prompt: task.promptContent,
      temperature: task.temperature,
      maxTokens: task.maxTokens,
    });

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60_000),
    });

    const latency = Date.now() - startTime;

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      return {
        promptId: task.promptId,
        evalModelId: task.evalModelId,
        runIndex: task.runIndex,
        response: "",
        latency,
        cost: null,
        inputTokens: null,
        outputTokens: null,
        error: `HTTP ${res.status}: ${errorText.slice(0, 500)}`,
      };
    }

    const data = await res.json();
    const parser = task.provider.responseParser;

    const content = String(resolvePath(data, parser.content) ?? "");
    const inputTokens = Number(resolvePath(data, parser.inputTokens)) || null;
    const outputTokens = Number(resolvePath(data, parser.outputTokens)) || null;

    // Calculate cost
    let cost: number | null = null;
    const modelDef = task.provider.models.find((m) => m.id === task.modelId);
    if (modelDef && inputTokens && outputTokens) {
      cost =
        inputTokens * modelDef.costPerInputToken +
        outputTokens * modelDef.costPerOutputToken;
    }

    return {
      promptId: task.promptId,
      evalModelId: task.evalModelId,
      runIndex: task.runIndex,
      response: content,
      latency,
      cost,
      inputTokens,
      outputTokens,
      error: null,
    };
  } catch (err) {
    return {
      promptId: task.promptId,
      evalModelId: task.evalModelId,
      runIndex: task.runIndex,
      response: "",
      latency: Date.now() - startTime,
      cost: null,
      inputTokens: null,
      outputTokens: null,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Run all tasks with concurrency control */
export async function runEvaluation(
  tasks: EvalTask[],
  concurrency: number = 3,
  onProgress?: ProgressCallback
): Promise<EvalTaskResult[]> {
  const results: EvalTaskResult[] = [];
  let completed = 0;
  const total = tasks.length;
  const queue = [...tasks];

  async function worker() {
    while (queue.length > 0) {
      const task = queue.shift();
      if (!task) break;
      const result = await executeTask(task);
      results.push(result);
      completed++;
      onProgress?.(completed, total, result);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, () => worker());
  await Promise.all(workers);
  return results;
}
