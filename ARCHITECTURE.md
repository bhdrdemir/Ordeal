# Ordeal v2 — Complete Redesign Architecture

## Vision
LLM benchmark platform where users can test ANY API (built-in or custom), write custom request code, score with AI + human judges, and share results on a public leaderboard.

## Tech Stack
- Next.js 16 (App Router) + TypeScript strict
- Prisma v6 + PostgreSQL
- NextAuth v5 (JWT strategy)
- Tailwind CSS v4
- Recharts (interactive charts)
- Monaco Editor (code editing for custom APIs)
- Web Workers (browser sandbox for custom code)

## Database Schema (PostgreSQL)

### Core Models
- **User** — Auth, profile
- **Provider** — API provider definitions (built-in + custom per user)
- **ProviderPreset** — Pre-built configs (OpenAI, Anthropic, Google, etc.)
- **Evaluation** — A benchmark run config
- **EvalPrompt** — Individual prompts within an eval
- **EvalResult** — Per-model, per-prompt result
- **HumanScore** — Human ratings for results
- **Leaderboard** — Public benchmark entries
- **ApiKey** — Encrypted user API keys

### Provider Model
```
Provider {
  id, userId?, name, type (BUILTIN|CUSTOM|TEMPLATE),
  baseUrl, headers (JSON), bodyTemplate (JSON),
  customCode (text), models (JSON array),
  authType (BEARER|HEADER|QUERY|CUSTOM),
  isPublic
}
```

## Page Structure

### Public Pages
- `/` — Landing page (what is Ordeal, features, CTA)
- `/login` — OAuth login
- `/leaderboard` — Public leaderboard (filterable, sortable)
- `/leaderboard/[id]` — Single benchmark detail (shared eval)

### Dashboard (Auth Required)
- `/dashboard` — Overview (recent evals, quick stats)
- `/dashboard/providers` — Manage API providers
- `/dashboard/providers/new` — Create custom provider (with code editor)
- `/dashboard/providers/[id]` — Edit provider
- `/dashboard/evals` — Evaluation history (paginated, filterable)
- `/dashboard/evals/new` — Create new evaluation
- `/dashboard/evals/[id]` — Eval results (interactive, Aider-inspired)
- `/dashboard/evals/[id]/score` — Human scoring interface
- `/dashboard/keys` — API key management
- `/dashboard/settings` — Account settings

## Key Features

### 1. Custom API Provider System
Users define how to talk to any API:
- **Template mode**: URL + headers + body JSON template with variables
- **Code mode**: JavaScript function in Monaco Editor, runs in Web Worker sandbox
- **Built-in presets**: OpenAI, Anthropic, Google, Mistral, Cohere, etc.

### 2. Multi-Metric Evaluation
- AI Judge score (configurable judge model)
- Human score (1-10 scale with optional criteria)
- Latency (ms)
- Cost ($)
- Token counts (input/output)
- Format compliance (regex-based)
- Consistency (variance across runs)

### 3. Interactive Results (Aider-inspired)
- 3 view modes: Overview / Compare / Detail
- Table-chart synchronization
- Expandable rows with per-prompt breakdown
- Real-time search and filter
- Cost visualization bars
- Radar chart for multi-metric comparison

### 4. Human Scoring
- Side-by-side response comparison
- Blind scoring (model names hidden)
- Per-criteria rating (accuracy, coherence, creativity, etc.)
- Aggregated human vs AI scores

### 5. Public Leaderboard
- Community benchmark results
- Filter by category, model, provider, date
- Global rankings
- Trending benchmarks

### 6. Async Evaluation Engine
- Queue-based evaluation (not synchronous)
- SSE/polling for progress updates
- Parallel model execution
- Error recovery per-model (one failure doesn't kill the eval)
