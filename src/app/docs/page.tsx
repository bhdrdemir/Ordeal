'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import {
  Terminal,
  Layers,
  Plug,
  FlaskConical,
  Globe,
  Lock,
  Code,
  BarChart3,
  Copy,
  Check,
  Settings,
  Star,
  Eye,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Docs Page — User-focused usage guide
   "Technical Elegance" design style
   ───────────────────────────────────────────── */

const sections = [
  { id: 'welcome', label: 'Welcome', icon: Terminal },
  { id: 'account', label: 'Account & Login', icon: Lock },
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'providers', label: 'Providers', icon: Plug },
  { id: 'custom-providers', label: 'Custom Providers', icon: Code },
  { id: 'api-keys', label: 'API Keys', icon: Lock },
  { id: 'create-eval', label: 'Create Evaluation', icon: FlaskConical },
  { id: 'run-eval', label: 'Run & Track', icon: Layers },
  { id: 'scoring', label: 'Scoring & Judging', icon: Star },
  { id: 'results', label: 'Results & Compare', icon: Eye },
  { id: 'leaderboard', label: 'Public Leaderboard', icon: Globe },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'security', label: 'Security & Privacy', icon: Lock },
];

function CodeBlock({ code, language = 'text' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group my-4">
      <div className="flex items-center justify-between px-4 py-2 border border-zinc-200 border-b-0 bg-zinc-50">
        <span className="text-[10px] text-zinc-400 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
          {language}
        </span>
        <button onClick={handleCopy} className="text-zinc-400 hover:text-zinc-700 transition-colors">
          {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>
      <pre className="px-4 py-4 bg-zinc-950 text-zinc-300 text-sm overflow-x-auto border border-zinc-200 border-t-0"
           style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: '1.7' }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function DocSection({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 py-12 border-b border-zinc-200 last:border-b-0">
      {children}
    </section>
  );
}

function SectionTitle({ tag, title }: { tag: string; title: string }) {
  return (
    <div className="flex items-baseline gap-4 mb-8">
      <span className="text-orange-500 text-sm" style={{ fontFamily: 'var(--font-mono)' }}>{tag}</span>
      <h2 className="text-3xl md:text-4xl font-semibold text-zinc-900">{title}</h2>
    </div>
  );
}

function StepList({ steps }: { steps: Array<{ num: string; title: string; desc: string }> }) {
  return (
    <div className="space-y-5 my-6">
      {steps.map((step) => (
        <div key={step.num} className="flex gap-4 items-start group">
          <span className="text-zinc-200 text-2xl font-bold group-hover:text-orange-300 transition-colors shrink-0 w-8"
                style={{ fontFamily: 'var(--font-mono)' }}>{step.num}</span>
          <div>
            <h4 className="font-semibold text-zinc-900">{step.title}</h4>
            <p className="text-sm text-zinc-500 mt-0.5">{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="tech-panel my-6">
      <div className="tech-panel-header"><span>{title}</span></div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function KeyValue({ items }: { items: Array<{ key: string; value: string }> }) {
  return (
    <div className="space-y-2" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
      {items.map((item) => (
        <div key={item.key} className="flex items-center gap-3">
          <span className="text-orange-500 shrink-0">{item.key}</span>
          <div className="flex-1 h-px bg-zinc-200" />
          <span className="text-zinc-500">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('welcome');
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-[#fafafa] blueprint-grid relative">
      <div className="fixed inset-0 grid-crosshairs pointer-events-none z-0" />
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-8 pb-20 relative z-10">
        {/* Header */}
        <div className="mb-12">
          <span className="mono-label block mb-3">[ Documentation ]</span>
          <h1 className="text-5xl md:text-7xl font-semibold text-zinc-900 mb-4"
              style={{ fontFamily: "var(--font-slabo), 'Slabo 27px', serif" }}>
            Docs
          </h1>
          <p className="text-lg text-zinc-500 max-w-2xl">
            Learn how to use Ordeal to benchmark LLMs, configure providers, run evaluations, score results, and share your findings with the community.
          </p>
        </div>

        <div className="flex gap-12">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="sticky top-24">
              <span className="mono-label-sm block mb-4">On this page</span>
              <nav className="space-y-0.5">
                {sections.map((s) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.id}
                      onClick={() => scrollTo(s.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-all ${
                        activeSection === s.id
                          ? 'text-orange-600 border-l-2 border-orange-500 bg-orange-50/50'
                          : 'text-zinc-500 hover:text-zinc-900 border-l-2 border-transparent'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '0.03em' }}>
                        {s.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 min-w-0">

            {/* ── Welcome ── */}
            <DocSection id="welcome">
              <SectionTitle tag="/01" title="Welcome to Ordeal" />
              <div className="space-y-4 text-zinc-600 leading-relaxed">
                <p>
                  Ordeal is an open-source LLM benchmarking platform. You can test any language model — from OpenAI's GPT-4o to Anthropic's Claude to your own custom API — using your own prompts, your own scoring criteria, and your own rules.
                </p>
                <p>
                  No need to install anything. Just sign in, add your API keys, and start benchmarking.
                </p>

                <InfoPanel title="What You Can Do">
                  <KeyValue items={[
                    { key: 'COMPARE', value: 'Test multiple models side-by-side' },
                    { key: 'MEASURE', value: 'Quality, latency, cost, format compliance' },
                    { key: 'SCORE', value: 'AI judge + human scoring combined' },
                    { key: 'CUSTOMIZE', value: 'Add any API, write custom handlers' },
                    { key: 'SHARE', value: 'Publish results to public leaderboard' },
                  ]} />
                </InfoPanel>

                <h3 className="text-xl font-semibold text-zinc-900 mt-8">Quick Start</h3>
                <StepList steps={[
                  { num: '01', title: 'Sign in with GitHub or Google', desc: 'Click "Get Started" on the homepage. No password or email signup needed.' },
                  { num: '02', title: 'Add your API keys', desc: 'Go to Dashboard → API Keys. Paste your OpenAI, Anthropic, or other provider keys.' },
                  { num: '03', title: 'Create an evaluation', desc: 'Go to Dashboard → Evaluations → New Evaluation. Write prompts, pick models, run.' },
                  { num: '04', title: 'View results', desc: 'See scores, latency, cost side-by-side. Optionally score responses yourself.' },
                  { num: '05', title: 'Share with the community', desc: 'Publish your evaluation to the public leaderboard.' },
                ]} />
              </div>
            </DocSection>

            {/* ── Account & Login ── */}
            <DocSection id="account">
              <SectionTitle tag="/02" title="Account & Login" />
              <div className="space-y-4 text-zinc-600 leading-relaxed">
                <p>
                  Ordeal uses OAuth authentication — you sign in with your existing GitHub or Google account. There's no separate registration form or password to remember.
                </p>
                <p>
                  When you sign in for the first time, an account is automatically created for you. Your name, email, and profile picture are pulled from your OAuth provider.
                </p>

                <InfoPanel title="Authentication Details">
                  <KeyValue items={[
                    { key: 'METHOD', value: 'OAuth 2.0 (GitHub / Google)' },
                    { key: 'SESSIONS', value: 'JWT-based, secure httpOnly cookies' },
                    { key: 'DATA STORED', value: 'Name, email, avatar from OAuth' },
                    { key: 'PASSWORDS', value: 'None — OAuth only' },
                  ]} />
                </InfoPanel>

                <p>
                  To update your name or profile picture, update it on your GitHub or Google account — changes will reflect next time you sign in.
                </p>
              </div>
            </DocSection>

            {/* ── Dashboard ── */}
            <DocSection id="dashboard">
              <SectionTitle tag="/03" title="Dashboard Overview" />
              <div className="space-y-4 text-zinc-600 leading-relaxed">
                <p>
                  After signing in, you land on the Dashboard. This is your home base showing a summary of all your benchmarking activity.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900">Stats Cards</h3>
                <p>At the top, four stat cards give you a quick overview:</p>
                <InfoPanel title="Dashboard Stats">
                  <KeyValue items={[
                    { key: 'TOTAL EVALS', value: 'Number of evaluations you\'ve created' },
                    { key: 'MODELS TESTED', value: 'How many unique models you\'ve benchmarked' },
                    { key: 'AVG QUALITY', value: 'Average AI judge score across all results' },
                    { key: 'TOTAL COST', value: 'Sum of all API call costs' },
                  ]} />
                </InfoPanel>

                <h3 className="text-xl font-semibold text-zinc-900">Recent Evaluations Table</h3>
                <p>
                  Below the stats, you'll see your most recent evaluations in a table. Each row shows the evaluation name, how many models were tested, the current status, average quality score, and creation date. Click "View" on any row to see full results.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900">Navigation</h3>
                <p>
                  The left sidebar gives you access to all sections: Overview, Providers, Evaluations, API Keys, and Settings. The active page is highlighted in orange.
                </p>
              </div>
            </DocSection>

            {/* ── Providers ── */}
            <DocSection id="providers">
              <SectionTitle tag="/04" title="Providers" />
              <div className="space-y-4 text-zinc-600 leading-relaxed">
                <p>
                  Providers are the LLM APIs that Ordeal sends requests to during evaluations. Go to <strong>Dashboard → Providers</strong> to see and manage them.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900">Built-in Providers</h3>
                <p>
                  Ordeal comes with 5 pre-configured providers ready to use. You just need to add your API key for each one you want to use:
                </p>
                <InfoPanel title="Built-in Providers">
                  <KeyValue items={[
                    { key: 'OPENAI', value: 'GPT-4o, GPT-4o-mini, o1, o3-mini' },
                    { key: 'ANTHROPIC', value: 'Claude Sonnet 4, Claude Haiku 4' },
                    { key: 'GOOGLE AI', value: 'Gemini 2.5 Pro, Gemini 2.5 Flash' },
                    { key: 'MISTRAL', value: 'Mistral Large, Codestral' },
                    { key: 'COHERE', value: 'Command R+, Command R' },
                  ]} />
                </InfoPanel>
                <p>
                  Each built-in provider has its URL, authentication method, request format, and model pricing already configured. You don't need to set anything up beyond your API key.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900">Custom Providers</h3>
                <p>
                  If you want to test a model that isn't built-in — like a fine-tuned model, a local LLM, or a private API — you can create a Custom Provider. Click the "Add Provider" button on the Providers page.
                </p>
              </div>
            </DocSection>

            {/* ── Custom Providers ── */}
            <DocSection id="custom-providers">
              <SectionTitle tag="/05" title="Creating Custom Providers" />
              <div className="space-y-4 text-zinc-600 leading-relaxed">
                <p>
                  Go to <strong>Dashboard → Providers → Add Provider</strong> to create a custom provider. You'll fill out a form with two main sections.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900">Basic Information</h3>
                <p>Give your provider a name (e.g. "My Fine-tuned Model") and an optional description.</p>

                <h3 className="text-xl font-semibold text-zinc-900">Option 1: Template Configuration</h3>
                <p>
                  This is the easier option. You fill in fields and Ordeal builds the API request for you:
                </p>
                <StepList steps={[
                  { num: '01', title: 'Base URL', desc: 'The endpoint URL (e.g. https://api.mymodel.com/v1/chat/completions)' },
                  { num: '02', title: 'Authentication Type', desc: 'Choose Bearer Token, Custom Header, Query Parameter, or None.' },
                  { num: '03', title: 'Headers', desc: 'Optional JSON headers for extra configuration.' },
                  { num: '04', title: 'Body Template', desc: 'JSON template with {{model}} and {{prompt}} placeholders that get filled at runtime.' },
                ]} />

                <p>Example body template:</p>
                <CodeBlock language="json" code={`{
  "model": "{{model}}",
  "messages": [
    { "role": "user", "content": "{{prompt}}" }
  ],
  "max_tokens": 2048
}`} />

                <h3 className="text-xl font-semibold text-zinc-900">Option 2: Custom Code</h3>
                <p>
                  For APIs that need complex logic (custom auth, multi-step calls, response transformation), switch to the "Custom Code" tab and write a JavaScript handler:
                </p>
                <CodeBlock language="javascript" code={`async function handler({ prompt, model, apiKey, config }) {
  const response = await fetch(config.baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${apiKey}\`,
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();

  return {
    content: data.choices[0].message.content,
    usage: {
      inputTokens: data.usage.prompt_tokens,
      outputTokens: data.usage.completion_tokens,
    },
  };
}`} />
                <p>
                  Custom code runs in a sandboxed Web Worker with a 30-second timeout. It can only use <code className="text-orange-600 bg-orange-50 px-1.5 py-0.5 text-sm" style={{ fontFamily: 'var(--font-mono)' }}>fetch</code> — no DOM, localStorage, or other browser APIs.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900">Adding Models</h3>
                <p>
                  After setting up the connection, add the specific models this provider offers. For each model, enter the model name/ID and optionally the cost per input and output token (for cost tracking).
                </p>
              </div>
            </DocSection>

            {/* ── API Keys ── */}
            <DocSection id="api-keys">
              <SectionTitle tag="/06" title="API Keys" />
              <div className="space-y-4 text-zinc-600 leading-relaxed">
                <p>
                  Go to <strong>Dashboard → API Keys</strong> to manage your API keys. You need at least one key for each provider you want to use in evaluations.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900">Adding a Key</h3>
                <StepList steps={[
                  { num: '01', title: 'Click "Add Key"', desc: 'Opens a dialog where you can add a new key.' },
                  { num: '02', title: 'Select a provider', desc: 'Choose from built-in providers or your custom providers.' },
                  { num: '03', title: 'Paste your API key', desc: 'Paste the key from your provider\'s dashboard. It\'s entered in a password field for privacy.' },
                  { num: '04', title: 'Add an optional label', desc: 'e.g. "Production key" or "Testing key" to tell them apart.' },
                  { num: '05', title: 'Click "Add Key"', desc: 'The key is encrypted and saved. You\'ll see a masked version in the table.' },
                ]} />

                <h3 className="text-xl font-semibold text-zinc-900">Managing Keys</h3>
                <p>
                  Your keys table shows the provider name, label, a masked version of the key (e.g. <code style={{ fontFamily: 'var(--font-mono)' }}>sk-****...7f2a</code>), and when it was added. You can copy the masked version or delete a key entirely.
                </p>

                <InfoPanel title="Key Security">
                  <div className="space-y-2 text-sm text-zinc-500">
                    <p>All API keys are encrypted with <strong>AES-256-GCM</strong> before being stored in the database. The raw key is never stored or logged.</p>
                    <p>During an evaluation, keys are decrypted in server memory only for the duration of the API call, then immediately discarded.</p>
                    <p>Keys are scoped to your account — no one else can see or use your keys.</p>
                  </div>
                </InfoPanel>
              </div>
            </DocSection>

            {/* ── Create Evaluation ── */}
            <DocSection id="create-eval">
              <SectionTitle tag="/07" title="Creating an Evaluation" />
              <div className="space-y-4 text-zinc-600 leading-relaxed">
                <p>
                  Go to <strong>Dashboard → Evaluations → New Evaluation</strong>. The creation wizard walks you through 6 steps with a progress indicator at the top.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900">Step 1: Basic Info</h3>
                <p>
                  Give your evaluation a name (e.g. "Python Code Generation Benchmark") and an optional description. The name helps you find it later in your evaluations list.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900">Step 2: Prompts</h3>
                <p>
                  Add the test prompts that will be sent to each model. Click "+ Add Prompt" for each one. You can also assign a category to each prompt: General, Reasoning, Coding, Creative, or Analysis. This helps organize results later.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900">Step 3: Models</h3>
                <p>
                  Select which models to test. Click "+ Add Model", then pick a provider and a specific model from that provider. You can mix built-in and custom providers in the same evaluation.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900">Step 4: Judge Settings</h3>
                <p>
                  Optionally configure an AI judge to automatically score responses. Select which model will act as the judge, write custom judging instructions, and define scoring criteria (e.g. "Accuracy", "Helpfulness", "Code Quality"). Each criterion gets a name and description.
                </p>
                <p>
                  If you skip this step, you can still score results manually later.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900">Step 5: Settings</h3>
                <p>
                  Fine-tune the evaluation parameters:
                </p>
                <InfoPanel title="Evaluation Settings">
                  <KeyValue items={[
                    { key: 'TEMPERATURE', value: 'Controls randomness (0 = deterministic, 2 = creative)' },
                    { key: 'MAX TOKENS', value: 'Maximum response length' },
                    { key: 'RUNS PER PROMPT', value: 'How many times each prompt is sent (for consistency testing)' },
                  ]} />
                </InfoPanel>

                <h3 className="text-xl font-semibold text-zinc-900">Step 6: Review</h3>
                <p>
                  Review all your settings before submitting. You'll see a summary of prompts, models, judge configuration, and parameters. Click "Create Evaluation" to save. The evaluation starts in DRAFT status — you'll run it from the detail page.
                </p>
              </div>
            </DocSection>

            {/* ── Run & Track ── */}
            <DocSection id="run-eval">
              <SectionTitle tag="/08" title="Running & Tracking Evaluations" />
              <div className="space-y-4 text-zinc-600 leading-relaxed">
                <p>
                  After creating an evaluation, open it from the evaluations list. If it's in DRAFT status, you'll see a "Run Evaluation" button.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900">What Happens When You Run</h3>
                <StepList steps={[
                  { num: '01', title: 'Status changes to RUNNING', desc: 'A progress bar appears showing how many models have been completed.' },
                  { num: '02', title: 'Prompts sent in parallel', desc: 'Each prompt is sent to each model concurrently for speed.' },
                  { num: '03', title: 'Results stream in', desc: 'The page auto-refreshes every 5 seconds. You can watch results appear in real-time.' },
                  { num: '04', title: 'Scoring happens automatically', desc: 'If you configured an AI judge, responses are scored as they come in.' },
                  { num: '05', title: 'Status changes to COMPLETED', desc: 'All results are in. You can now view charts and detailed breakdowns.' },
                ]} />

                <h3 className="text-xl font-semibold text-zinc-900">Evaluation Statuses</h3>
                <InfoPanel title="Status Flow">
                  <KeyValue items={[
                    { key: 'DRAFT', value: 'Created but not yet run. You can still edit.' },
                    { key: 'PENDING', value: 'Queued for execution.' },
                    { key: 'RUNNING', value: 'In progress. Progress bar shows completion.' },
                    { key: 'COMPLETED', value: 'All models have been tested. Results ready.' },
                    { key: 'FAILED', value: 'Something went wrong. Check error details.' },
                    { key: 'CANCELLED', value: 'You stopped the evaluation.' },
                  ]} />
                </InfoPanel>

                <h3 className="text-xl font-semibold text-zinc-900">Evaluations List</h3>
                <p>
                  Go to <strong>Dashboard → Evaluations</strong> to see all your evaluations. Use the status filter dropdown to show only specific statuses (e.g. just "Completed" or just "Running"). The table supports pagination if you have many evaluations.
                </p>
              </div>
            </DocSection>

            {/* ── Scoring ── */}
            <DocSection id="scoring">
              <SectionTitle tag="/09" title="Scoring & Judging" />
              <div className="space-y-4 text-zinc-600 leading-relaxed">
                <p>
                  Ordeal supports two scoring methods that can be used independently or together.
                </p>

                <div className="grid md:grid-cols-2 gap-4 my-6">
                  <InfoPanel title="AI Judge Scoring">
                    <div className="space-y-2 text-sm text-zinc-500">
                      <p>Automatic. The AI judge model reads each response and assigns a score based on your criteria.</p>
                      <p>Scores appear in the <code style={{ fontFamily: 'var(--font-mono)' }}>aiScore</code> field (0-10 scale).</p>
                      <p>Configure in Step 4 of evaluation creation.</p>
                    </div>
                  </InfoPanel>
                  <InfoPanel title="Human Scoring">
                    <div className="space-y-2 text-sm text-zinc-500">
                      <p>Manual. You read each response and score it yourself in a blind evaluation mode.</p>
                      <p>Model names are hidden to prevent bias. You see only the prompt and response.</p>
                      <p>Access via the "Score" button on any completed evaluation.</p>
                    </div>
                  </InfoPanel>
                </div>

                <h3 className="text-xl font-semibold text-zinc-900">Human Scoring Walkthrough</h3>
                <p>
                  On a completed evaluation's detail page, click the scoring button. You'll enter a blind scoring interface:
                </p>
                <StepList steps={[
                  { num: '01', title: 'View the prompt', desc: 'See what was asked of the model.' },
                  { num: '02', title: 'Read the response', desc: 'The model\'s response is shown. The model name is hidden.' },
                  { num: '03', title: 'Assign a score', desc: 'Use quick buttons (1-5) or a slider (1-10) to rate quality.' },
                  { num: '04', title: 'Add optional feedback', desc: 'Write notes about why you scored it this way.' },
                  { num: '05', title: 'Save & continue', desc: 'Click "Save & Next" to move to the next response. A progress bar tracks your progress.' },
                ]} />
                <p>
                  You can also see the AI judge's score for reference (shown separately so it doesn't bias your rating).
                </p>
              </div>
            </DocSection>

            {/* ── Results & Compare ── */}
            <DocSection id="results">
              <SectionTitle tag="/10" title="Results & Comparison" />
              <div className="space-y-4 text-zinc-600 leading-relaxed">
                <p>
                  Once an evaluation is completed, the detail page shows rich visualizations and comparison tools across three tabs.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900">Overview Tab</h3>
                <p>
                  Shows aggregated charts for all models: a score comparison bar chart, a latency comparison chart, and a cost breakdown with visual progress bars. Great for getting a bird's-eye view of how models performed.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900">Compare Tab</h3>
                <p>
                  Select any two models from dropdowns and see them side-by-side. Compare their scores, response quality, latency, and cost directly. Useful for making a final decision between top contenders.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900">Detail Tab</h3>
                <p>
                  Shows every model with expandable cards. Search for a specific model by name. Click a model card to expand it and see all individual results: the prompt that was sent, the full response, AI score, human score, latency, and cost for each prompt.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900">Metrics Tracked</h3>
                <InfoPanel title="Per-Result Metrics">
                  <KeyValue items={[
                    { key: 'AI SCORE', value: 'AI judge quality rating (0-10)' },
                    { key: 'HUMAN SCORE', value: 'Your manual rating (0-10)' },
                    { key: 'FORMAT SCORE', value: 'How well the response followed format instructions' },
                    { key: 'LATENCY', value: 'Response time in milliseconds' },
                    { key: 'COST', value: 'API call cost based on token pricing' },
                    { key: 'INPUT TOKENS', value: 'Tokens sent to the model' },
                    { key: 'OUTPUT TOKENS', value: 'Tokens generated by the model' },
                  ]} />
                </InfoPanel>

                <h3 className="text-xl font-semibold text-zinc-900">Sharing & Downloading</h3>
                <p>
                  On the evaluation detail page, use the "Share" button to publish your evaluation to the public leaderboard. Use the "Download" button to export results for offline analysis.
                </p>
              </div>
            </DocSection>

            {/* ── Leaderboard ── */}
            <DocSection id="leaderboard">
              <SectionTitle tag="/11" title="Public Leaderboard" />
              <div className="space-y-4 text-zinc-600 leading-relaxed">
                <p>
                  The public leaderboard at <strong>/leaderboard</strong> shows shared evaluations from the entire Ordeal community. Anyone can view it without signing in.
                </p>
                <p>
                  Each leaderboard entry shows the evaluation name, how many models were tested, the average score, who created it, and when. Click "View" to see the full results of any public evaluation.
                </p>
                <p>
                  To get your evaluation on the leaderboard, open it from your dashboard and click "Share". Your prompts and scoring criteria are shared, but <strong>your API keys are never exposed</strong>.
                </p>
              </div>
            </DocSection>

            {/* ── Settings ── */}
            <DocSection id="settings">
              <SectionTitle tag="/12" title="Settings" />
              <div className="space-y-4 text-zinc-600 leading-relaxed">
                <p>
                  Go to <strong>Dashboard → Settings</strong> to view your profile and manage your account.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900">Profile</h3>
                <p>
                  Your name, email, and avatar come from your OAuth provider (GitHub or Google). To update them, change them on your provider's account settings.
                </p>

                <h3 className="text-xl font-semibold text-zinc-900">Delete Account</h3>
                <p>
                  The Danger Zone section lets you permanently delete your account. This removes all your evaluations, providers, API keys, and scores. This action requires double confirmation and <strong>cannot be undone</strong>.
                </p>
              </div>
            </DocSection>

            {/* ── Security & Privacy ── */}
            <DocSection id="security">
              <SectionTitle tag="/13" title="Security & Privacy" />
              <div className="space-y-4 text-zinc-600 leading-relaxed">
                <p>
                  Ordeal is designed with security as a priority. Here's how your data is protected.
                </p>

                <InfoPanel title="Security Architecture">
                  <KeyValue items={[
                    { key: 'API KEY ENCRYPTION', value: 'AES-256-GCM with unique IV per key' },
                    { key: 'AUTH', value: 'OAuth 2.0 + JWT sessions (no passwords stored)' },
                    { key: 'CUSTOM CODE', value: 'Sandboxed Web Workers with 30s timeout' },
                    { key: 'DATA ISOLATION', value: 'Users can only access their own data' },
                    { key: 'SHARED EVALS', value: 'API keys never included in shared data' },
                    { key: 'KEY DECRYPTION', value: 'In-memory only, during API calls' },
                  ]} />
                </InfoPanel>

                <p>
                  Custom provider code runs in an isolated Web Worker. It has no access to the DOM, cookies, localStorage, or other users' data. If a handler exceeds the 30-second timeout or throws an error, only that model's result is marked as failed — other models in the same evaluation continue running.
                </p>

                <p>
                  When you share an evaluation to the public leaderboard, only the evaluation name, prompts, scores, and metadata are shared. Your API keys, account details, and any private information are never exposed.
                </p>
              </div>
            </DocSection>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
