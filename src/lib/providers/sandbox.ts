/**
 * Browser-side sandbox for executing custom provider code in a Web Worker.
 * The user's code receives a request object and must return a response.
 */

export interface SandboxRequest {
  apiKey: string;
  prompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  baseUrl: string;
  headers: Record<string, string>;
}

export interface SandboxResponse {
  content: string;
  inputTokens?: number;
  outputTokens?: number;
  cost?: number;
  raw?: unknown;
  error?: string;
}

const SANDBOX_TIMEOUT = 30_000; // 30 seconds

/**
 * Execute custom provider code in a Web Worker sandbox.
 * The user's code should export a default async function that takes SandboxRequest
 * and returns SandboxResponse.
 *
 * Example user code:
 * ```
 * async function execute(req) {
 *   const res = await fetch(req.baseUrl, {
 *     method: "POST",
 *     headers: { ...req.headers, "Authorization": `Bearer ${req.apiKey}` },
 *     body: JSON.stringify({
 *       model: req.model,
 *       messages: [{ role: "user", content: req.prompt }],
 *       temperature: req.temperature,
 *       max_tokens: req.maxTokens,
 *     }),
 *   });
 *   const data = await res.json();
 *   return {
 *     content: data.choices[0].message.content,
 *     inputTokens: data.usage?.prompt_tokens,
 *     outputTokens: data.usage?.completion_tokens,
 *   };
 * }
 * ```
 */
export function executeSandbox(
  userCode: string,
  request: SandboxRequest
): Promise<SandboxResponse> {
  return new Promise((resolve, reject) => {
    const workerCode = `
      ${userCode}

      self.onmessage = async function(e) {
        try {
          const result = await execute(e.data);
          self.postMessage({ success: true, data: result });
        } catch (err) {
          self.postMessage({ success: false, error: err.message || String(err) });
        }
      };
    `;

    const blob = new Blob([workerCode], { type: "application/javascript" });
    const url = URL.createObjectURL(blob);
    const worker = new Worker(url);

    const timeout = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      reject(new Error("Sandbox execution timed out (30s)"));
    }, SANDBOX_TIMEOUT);

    worker.onmessage = (e: MessageEvent) => {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);

      const msg = e.data as { success: boolean; data?: SandboxResponse; error?: string };
      if (msg.success && msg.data) {
        resolve(msg.data);
      } else {
        reject(new Error(msg.error || "Sandbox execution failed"));
      }
    };

    worker.onerror = (err) => {
      clearTimeout(timeout);
      worker.terminate();
      URL.revokeObjectURL(url);
      reject(new Error(`Sandbox error: ${err.message}`));
    };

    worker.postMessage(request);
  });
}

/** Default template code shown when creating a custom provider */
export const DEFAULT_CUSTOM_CODE = `// Custom API Provider
// This function runs in a browser sandbox.
// It receives a request object and must return a response.
//
// Available: fetch(), JSON, standard Web APIs
// NOT available: Node.js APIs, filesystem, process

async function execute(req) {
  // req.apiKey      - Your API key
  // req.prompt      - The prompt text
  // req.model       - Selected model ID
  // req.temperature - Temperature setting
  // req.maxTokens   - Max tokens setting
  // req.baseUrl     - Base URL you configured
  // req.headers     - Headers you configured

  const response = await fetch(req.baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": \`Bearer \${req.apiKey}\`,
      ...req.headers,
    },
    body: JSON.stringify({
      model: req.model,
      messages: [{ role: "user", content: req.prompt }],
      temperature: req.temperature,
      max_tokens: req.maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(\`API error: \${response.status} \${await response.text()}\`);
  }

  const data = await response.json();

  // Return the parsed response
  return {
    content: data.choices[0].message.content,
    inputTokens: data.usage?.prompt_tokens,
    outputTokens: data.usage?.completion_tokens,
  };
}`;
