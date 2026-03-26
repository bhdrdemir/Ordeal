# Ordeal Web — Site Redesign Plan

## Design System

### Color Palette (Light/White + Orange)
- **Background:** `#ffffff` (white), `#fafafa` (off-white sections)
- **Surface:** `#f4f4f5` (zinc-100), `#ffffff` cards with subtle shadow
- **Primary:** `#f97316` (orange-500) — buttons, accents, highlights
- **Primary Hover:** `#ea580c` (orange-600)
- **Primary Light:** `#fff7ed` (orange-50) — light orange backgrounds
- **Text Primary:** `#18181b` (zinc-900)
- **Text Secondary:** `#71717a` (zinc-500)
- **Text Muted:** `#a1a1aa` (zinc-400)
- **Border:** `#e4e4e7` (zinc-200)
- **Dark Accent:** `#18181b` (zinc-900) — navbar, footer, dark sections

### Typography
- Font: Inter (already loaded)
- H1: 56px/bold, H2: 40px/bold, H3: 24px/semibold
- Body: 16px, Small: 14px

### Components
- **Cards:** White bg, rounded-xl, border zinc-200, shadow-sm, hover:shadow-md
- **Buttons Primary:** bg-orange-500, text-white, rounded-lg, hover:bg-orange-600
- **Buttons Secondary:** bg-white, border zinc-200, text-zinc-700, hover:bg-zinc-50
- **Inputs:** bg-white, border zinc-300, rounded-lg, focus:ring-orange-500
- **Badges:** Inline pill shapes with colored backgrounds

---

## Pages

### 1. Landing Page `/`
```
┌─────────────────────────────────────────┐
│  NAVBAR (white bg, sticky)              │
│  [Logo] ordeal    Features Pricing  [Login] [Get Started] │
├─────────────────────────────────────────┤
│  HERO (white bg, centered)              │
│                                         │
│  [Ordeal Logo - SVG]                    │
│                                         │
│  "Find the best LLM for your use case" │
│  Subtitle description text              │
│                                         │
│  [Get Started Free]  [View Demo]        │
│                                         │
│  Trusted by X developers                │
│  [Provider logos: OpenAI, Anthropic...] │
├─────────────────────────────────────────┤
│  DEMO PREVIEW (light gray bg)           │
│  [Screenshot/mockup of the dashboard]   │
│  Showing actual eval results UI         │
├─────────────────────────────────────────┤
│  FEATURES (white bg)                    │
│  3-column grid:                         │
│  - Side-by-Side Comparison              │
│  - Real Metrics (Quality, Speed, Cost)  │
│  - Share Results with Team              │
│  - Multi-Provider Support               │
│  - AI-Powered Scoring                   │
│  - Export & Reports                     │
├─────────────────────────────────────────┤
│  HOW IT WORKS (light bg)                │
│  3 steps with icons:                    │
│  1. Connect → 2. Evaluate → 3. Compare  │
├─────────────────────────────────────────┤
│  SUPPORTED MODELS (white bg)            │
│  Grid of provider cards:                │
│  OpenAI | Anthropic | Google | Groq     │
│  Mistral | Together | Fireworks | Ollama│
├─────────────────────────────────────────┤
│  PRICING (light bg)                     │
│  Free tier | Pro tier | Enterprise      │
├─────────────────────────────────────────┤
│  CTA SECTION (dark bg - zinc-900)       │
│  "Start evaluating today"               │
│  [Get Started] button                   │
├─────────────────────────────────────────┤
│  FOOTER (zinc-900 dark)                 │
│  [Logo] ordeal                          │
│  Product | Company | Legal links        │
│  © 2024 Ordeal. All rights reserved.    │
└─────────────────────────────────────────┘
```

### 2. Login Page `/login`
```
┌─────────────────────────────────────────┐
│  Split layout:                          │
│  LEFT (60%): White bg                   │
│    [Ordeal Logo]                        │
│    "Welcome back"                       │
│    [Continue with GitHub] button        │
│    [Continue with Google] button        │
│    ─── or ───                           │
│    Email input + Continue button        │
│    "Don't have an account? Sign up"     │
│                                         │
│  RIGHT (40%): Orange gradient bg        │
│    Testimonial or product screenshot    │
│    "Used by 1000+ developers"           │
└─────────────────────────────────────────┘
```

### 3. Dashboard `/dashboard`
```
┌─────────────────────────────────────────┐
│  SIDEBAR (white, fixed left)            │
│  [Logo]                                 │
│  ─────                                  │
│  Dashboard (active)                     │
│  New Evaluation                         │
│  History                                │
│  API Keys                               │
│  Settings                               │
│  ─────                                  │
│  [User avatar + name]                   │
│                                         │
│  MAIN CONTENT (light gray bg)           │
│  ┌─────────────────────────────────┐    │
│  │ Welcome back, [Name]            │    │
│  │ Quick Stats:                    │    │
│  │ [Total Evals] [Models] [Score]  │    │
│  └─────────────────────────────────┘    │
│                                         │
│  [+ New Evaluation] button              │
│                                         │
│  Recent Evaluations (table/cards)       │
│  ┌──────┬──────┬──────┬──────┬────┐    │
│  │ Name │Models│Score │Date  │View│    │
│  ├──────┼──────┼──────┼──────┼────┤    │
│  │ ...  │ ...  │ ...  │ ...  │ →  │    │
│  └──────┴──────┴──────┴──────┴────┘    │
└─────────────────────────────────────────┘
```

### 4. New Evaluation `/eval/new`
```
┌─────────────────────────────────────────┐
│  SIDEBAR (same as dashboard)            │
│                                         │
│  MAIN CONTENT                           │
│  "New Evaluation"                       │
│                                         │
│  Step 1: Name your evaluation           │
│  [Input field]                          │
│                                         │
│  Step 2: Select Models                  │
│  Provider tabs: [OpenAI] [Anthropic]... │
│  Model cards with checkboxes            │
│                                         │
│  Step 3: Enter Prompts                  │
│  [Textarea] + [Add More] button         │
│  Prompt templates dropdown              │
│                                         │
│  Step 4: Configure                      │
│  Samples per prompt: [dropdown]         │
│  Judge model: [dropdown]                │
│                                         │
│  [Run Evaluation ⚔] big orange button  │
└─────────────────────────────────────────┘
```

### 5. Results `/eval/[id]`
```
┌─────────────────────────────────────────┐
│  SIDEBAR                                │
│                                         │
│  MAIN CONTENT                           │
│  [← Back] "Eval Name" [Share] [Export]  │
│                                         │
│  Summary Cards Row:                     │
│  [Best Model] [Avg Quality] [Speed] [$] │
│                                         │
│  Tab Navigation:                        │
│  [Overview] [Responses] [Raw Data]      │
│                                         │
│  Overview Tab:                          │
│  ┌──────────────────────────────────┐   │
│  │ Quality Comparison (Bar Chart)    │   │
│  └──────────────────────────────────┘   │
│  ┌────────────┐ ┌────────────┐          │
│  │ Latency    │ │ Cost       │          │
│  │ (Bar Chart)│ │ (Bar Chart)│          │
│  └────────────┘ └────────────┘          │
│                                         │
│  Results Table (sortable)               │
│  Model | Quality | Latency | Cost | OPS │
└─────────────────────────────────────────┘
```

### 6. Share Page `/share/[slug]` (Public, no auth)
```
┌─────────────────────────────────────────┐
│  MINIMAL NAVBAR                         │
│  [Ordeal Logo]        [Try Ordeal Free] │
├─────────────────────────────────────────┤
│  "Evaluation Results"                   │
│  Shared by [user] on [date]             │
│                                         │
│  (Same charts and table as Results)     │
│  (Read-only, no edit controls)          │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ CTA: "Want to run your own?"     │   │
│  │ [Get Started Free]               │   │
│  └──────────────────────────────────┘   │
├─────────────────────────────────────────┤
│  FOOTER                                 │
└─────────────────────────────────────────┘
```

### 7. API Keys `/dashboard/keys`
```
┌─────────────────────────────────────────┐
│  SIDEBAR                                │
│                                         │
│  MAIN CONTENT                           │
│  "API Keys"                             │
│  "Your keys are encrypted and stored    │
│   securely. We never share them."       │
│                                         │
│  Provider Cards:                        │
│  ┌─────────────────────────────────┐    │
│  │ [OpenAI logo] OpenAI            │    │
│  │ Status: ✓ Connected / Not set   │    │
│  │ [Add Key] / [Remove]           │    │
│  └─────────────────────────────────┘    │
│  (repeat for each provider)             │
└─────────────────────────────────────────┘
```

### 8. Pricing `/pricing`
```
┌─────────────────────────────────────────┐
│  NAVBAR                                 │
├─────────────────────────────────────────┤
│  "Simple, transparent pricing"          │
│                                         │
│  ┌─────────┐ ┌──────────┐ ┌─────────┐  │
│  │  Free   │ │   Pro    │ │Enterprise│  │
│  │  $0/mo  │ │ $19/mo   │ │ Custom   │  │
│  │         │ │ POPULAR  │ │          │  │
│  │ 5 evals │ │Unlimited │ │ Team     │  │
│  │ 3 models│ │All models│ │ SSO      │  │
│  │ Share   │ │ Priority │ │ SLA      │  │
│  │[Start]  │ │[Upgrade] │ │[Contact] │  │
│  └─────────┘ └──────────┘ └─────────┘  │
├─────────────────────────────────────────┤
│  FAQ Section                            │
│  FOOTER                                 │
└─────────────────────────────────────────┘
```

---

## Asset Usage
- **Logo (full):** Navbar, Login page, Footer → `ordeal-logo-full.svg` (light bg)
- **Logo (dark):** Dark sections, CTA → `ordeal-logo-dark.svg`
- **Icon:** Favicon, mobile, loading → `ordeal-icon.svg`, PNGs
- **Favicon:** `ordeal-favicon.svg`, `ordeal-favicon-16.png`, `ordeal-favicon-32.png`

## Key Design Decisions
1. **White/light theme** for main UI — professional, clean, trust-building
2. **Orange accents** — buttons, highlights, charts, active states
3. **Dark sections** — CTA blocks, footer, navbar optional dark variant
4. **Sidebar layout** — for authenticated pages (dashboard, eval, results)
5. **No sidebar** — for public pages (landing, pricing, login, share)
6. **Real logos** — SVG logos from assets, no emoji placeholders
7. **Provider logos** — Use provider brand colors, not emojis
