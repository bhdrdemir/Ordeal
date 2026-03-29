'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import {
  ArrowRight,
  ArrowUpRight,
  Github,
  Shield,
  BarChart3,
  Sparkles,
  Globe,
  ChevronRight,
} from 'lucide-react';

/* ─────────────────────────────────────────────
   Sutéra × Ordeal — "Technical Elegance" Landing
   ───────────────────────────────────────────── */

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleSections, setVisibleSections] = useState<string[]>([]);
  const [heroVisible, setHeroVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Typing effect
  const typingTexts = [
    'Test Any LLM API',
    'Compare Model Performance',
    'Your Prompts, Your Rules',
  ];
  const [typedText, setTypedText] = useState('');
  const [typingIndex, setTypingIndex] = useState(0);
  const [isTypingForward, setIsTypingForward] = useState(true);

  useEffect(() => {
    const currentText = typingTexts[typingIndex];
    let timer: NodeJS.Timeout;
    if (isTypingForward) {
      if (typedText.length < currentText.length) {
        timer = setTimeout(() => setTypedText(currentText.slice(0, typedText.length + 1)), 70);
      } else {
        timer = setTimeout(() => setIsTypingForward(false), 2200);
      }
    } else {
      if (typedText.length > 0) {
        timer = setTimeout(() => setTypedText(typedText.slice(0, typedText.length - 1)), 35);
      } else {
        setTypingIndex((typingIndex + 1) % typingTexts.length);
        setIsTypingForward(true);
      }
    }
    return () => clearTimeout(timer);
  }, [typedText, typingIndex, isTypingForward, typingTexts]);

  // Live clock (Sutéra-style)
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !visibleSections.includes(entry.target.id)) {
            setVisibleSections((prev) => [...prev, entry.target.id]);
          }
        });
      },
      { threshold: 0.15 }
    );
    const sections = containerRef.current?.querySelectorAll('[data-animate]');
    sections?.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [visibleSections]);

  // Counter animation
  const [counters, setCounters] = useState({ providers: 0, metrics: 0, evals: 0 });
  const countersStarted = useRef(false);

  const animateCounters = useCallback(() => {
    if (countersStarted.current) return;
    countersStarted.current = true;
    const targets = { providers: 10, metrics: 15, evals: 100 };
    const current = { providers: 0, metrics: 0, evals: 0 };
    const inc = { providers: 0.5, metrics: 0.7, evals: 5 };
    const timer = setInterval(() => {
      current.providers = Math.min(current.providers + inc.providers, targets.providers);
      current.metrics = Math.min(current.metrics + inc.metrics, targets.metrics);
      current.evals = Math.min(current.evals + inc.evals, targets.evals);
      setCounters({ providers: Math.floor(current.providers), metrics: Math.floor(current.metrics), evals: Math.floor(current.evals) });
      if (current.providers >= targets.providers && current.metrics >= targets.metrics && current.evals >= targets.evals) clearInterval(timer);
    }, 30);
  }, []);

  useEffect(() => {
    if (visibleSections.includes('stats-strip')) animateCounters();
  }, [visibleSections, animateCounters]);

  // Hero entrance
  useEffect(() => {
    requestAnimationFrame(() => setHeroVisible(true));
  }, []);

  const isVisible = (id: string) => visibleSections.includes(id);

  // Floating particles (client-side only)
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; duration: number; size: number }>>([]);
  useEffect(() => {
    setParticles(
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 3,
        duration: 18 + Math.random() * 12,
        size: 2 + Math.random() * 3,
      }))
    );
  }, []);

  const features = [
    {
      icon: Shield,
      tag: '01',
      title: 'Custom APIs',
      description: 'Bring your own providers or define custom API endpoints. Write JavaScript handlers for proprietary models.',
      accent: 'border-orange-400',
    },
    {
      icon: BarChart3,
      tag: '02',
      title: 'Multi-Metric Scoring',
      description: 'Grade models on quality, latency, cost, and any custom metrics you define. Full flexibility.',
      accent: 'border-orange-500',
    },
    {
      icon: Sparkles,
      tag: '03',
      title: 'Human + AI Judges',
      description: 'Combine automated scoring with human evaluation for comprehensive, trustworthy results.',
      accent: 'border-orange-600',
    },
    {
      icon: Globe,
      tag: '04',
      title: 'Public Leaderboard',
      description: 'Share your benchmarks with the community. See how your evals compare globally.',
      accent: 'border-orange-400',
    },
  ];

  const providers = [
    { name: 'OpenAI', tag: 'GPT-4o, o1, o3' },
    { name: 'Anthropic', tag: 'Claude 4, Sonnet' },
    { name: 'Google', tag: 'Gemini 2.5' },
    { name: 'Mistral', tag: 'Large, Codestral' },
    { name: 'Cohere', tag: 'Command R+' },
    { name: 'Custom API', tag: 'Any endpoint' },
  ];

  const steps = [
    { num: '01', title: 'Configure Providers', desc: 'Add API keys securely. They stay encrypted on your device.' },
    { num: '02', title: 'Run Evaluations', desc: 'Write prompts, run them against multiple models in parallel.' },
    { num: '03', title: 'Compare Results', desc: 'View side-by-side metrics, charts, and detailed analysis.' },
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-[#fafafa] blueprint-grid relative">
      {/* Grid crosshair overlay */}
      <div className="fixed inset-0 grid-crosshairs pointer-events-none z-0" />

      <Navbar />

      {/* ══════════ HERO ══════════ */}
      <section className="relative px-6 pt-8 pb-20 md:pt-16 md:pb-32 overflow-hidden min-h-[90vh] flex items-center">
        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute rounded-full bg-orange-400/50"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.left}%`,
                bottom: '-10px',
                animation: `float-up ${p.duration}s linear infinite`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Orb glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-orange-400/15 via-orange-300/10 to-transparent blur-3xl animate-orb-pulse pointer-events-none z-0" />

        <div className="max-w-7xl mx-auto w-full relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

            {/* Left column — Main heading (Sutéra-style massive type) */}
            <div className="lg:col-span-8">
              {/* Mono label */}
              <div className={`mono-label mb-6 transition-all duration-500 ${heroVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
                [ LLM Benchmark Platform ]
              </div>

              {/* Giant heading */}
              <div className="overflow-hidden mb-6">
                <h1
                  className={`text-[clamp(52px,8vw,140px)] font-normal leading-[0.95] tracking-tight transition-all duration-700 ordeal-glow-hero ${
                    heroVisible ? 'animate-line-reveal' : 'opacity-0 translate-y-full'
                  }`}
                  style={{ fontFamily: "var(--font-slabo), 'Slabo 27px', serif" }}
                >
                  Ordeal
                </h1>
              </div>

              {/* Typing subtitle — large */}
              <div className={`min-h-16 md:min-h-20 mb-8 transition-all duration-600 ${heroVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                   style={{ animationDelay: '0.3s' }}>
                <span className="text-3xl md:text-5xl lg:text-6xl font-semibold text-zinc-900 leading-tight">
                  {typedText}
                  <span className="animate-typing text-orange-500 ml-1">|</span>
                </span>
              </div>

              {/* Description */}
              <p className={`text-lg md:text-xl text-zinc-500 max-w-xl leading-relaxed mb-10 transition-all duration-700 ${heroVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                 style={{ animationDelay: '0.5s' }}>
                Build benchmarks that matter. Compare any model with custom metrics,
                automated scoring, and shareable results.
              </p>

              {/* CTA Row */}
              <div className={`flex flex-wrap gap-4 transition-all duration-700 ${heroVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
                   style={{ animationDelay: '0.6s' }}>
                <Link
                  href="/login"
                  className="group inline-flex items-center gap-2 px-7 py-3.5 bg-zinc-950 text-white text-sm font-medium hover:bg-zinc-800 transition-all active:scale-[0.97]"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center gap-2 px-7 py-3.5 border border-zinc-300 text-zinc-700 text-sm font-medium hover:border-orange-400 hover:text-orange-600 transition-all active:scale-[0.97]"
                >
                  View Leaderboard
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Right column — Tech panels (Sutéra-style info windows) */}
            <div className="lg:col-span-4 space-y-4 hidden lg:block">
              {/* Panel: About */}
              <div className={`tech-panel transition-all duration-600 ${heroVisible ? 'animate-slide-in-right' : 'opacity-0'}`}
                   style={{ animationDelay: '0.4s' }}>
                <div className="tech-panel-header">
                  <span>Ordeal /v1</span>
                </div>
                <div className="p-4 space-y-3">
                  <p className="text-sm text-zinc-600 leading-relaxed" style={{ fontFamily: 'var(--font-mono)', fontSize: '11px' }}>
                    OPEN-SOURCE LLM BENCHMARKING.
                    TEST ANY MODEL WITH YOUR PROMPTS
                    AND YOUR RULES. COMPARE QUALITY,
                    SPEED, AND COST.
                  </p>
                  <div className="flex gap-2">
                    <span className="inline-block px-2 py-0.5 text-[9px] font-medium border border-orange-300 text-orange-600 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
                      Free
                    </span>
                    <span className="inline-block px-2 py-0.5 text-[9px] font-medium border border-zinc-300 text-zinc-500 uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
                      Open Source
                    </span>
                  </div>
                </div>
              </div>

              {/* Panel: Core Threads */}
              <div className={`tech-panel transition-all duration-600 ${heroVisible ? 'animate-slide-in-right' : 'opacity-0'}`}
                   style={{ animationDelay: '0.6s' }}>
                <div className="tech-panel-header">
                  <span>Core Threads</span>
                </div>
                <div className="p-4 space-y-2.5">
                  {[
                    { tag: '01', label: 'CUSTOM PROVIDERS' },
                    { tag: '02', label: 'MULTI-METRIC EVAL' },
                    { tag: '03', label: 'HUMAN + AI SCORING' },
                    { tag: '04', label: 'PUBLIC LEADERBOARD' },
                  ].map((item) => (
                    <div key={item.tag} className="flex items-center gap-3">
                      <span className="text-[10px] text-orange-500 font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                        {item.tag}.
                      </span>
                      <div className="flex-1 h-px bg-zinc-200" />
                      <span className="text-[10px] text-zinc-600 tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Panel: Clock */}
              <div className={`tech-panel transition-all duration-600 ${heroVisible ? 'animate-slide-in-right' : 'opacity-0'}`}
                   style={{ animationDelay: '0.8s' }}>
                <div className="p-3 flex items-center justify-between">
                  <span className="mono-label-sm">Local Time</span>
                  <span className="text-sm text-zinc-800 tabular-nums" style={{ fontFamily: 'var(--font-mono)' }}>
                    {currentTime}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ STATS STRIP ══════════ */}
      <section id="stats-strip" data-animate className="relative border-y border-zinc-200 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className={`flex flex-wrap justify-between items-center gap-8 transition-all duration-500 ${isVisible('stats-strip') ? 'animate-fade-in-up' : 'opacity-0'}`}>
            {[
              { value: `${counters.providers}+`, label: 'Providers' },
              { value: `${counters.metrics}+`, label: 'Metrics' },
              { value: '\u221E', label: 'Evaluations' },
            ].map((stat, i) => (
              <div key={i} className="flex items-baseline gap-3">
                <span className="text-3xl md:text-4xl font-bold text-orange-500 tabular-nums">{stat.value}</span>
                <span className="mono-label">{stat.label}</span>
              </div>
            ))}
            <Link
              href="https://github.com/bhdrdemir/Ordeal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 border border-zinc-300 text-zinc-600 text-xs hover:border-zinc-500 transition-all"
              style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}
            >
              <Github className="w-4 h-4" />
              GITHUB
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════ MARQUEE SEPARATOR ══════════ */}
      <div className="overflow-hidden border-b border-zinc-200 bg-white/40 py-3">
        <div className="marquee-track">
          {Array.from({ length: 8 }).map((_, i) => (
            <span key={i} className="mono-label-sm whitespace-nowrap mx-8 text-zinc-300">
              BENCHMARK \u2026 EVALUATE \u2026 COMPARE \u2026 ITERATE \u2026
            </span>
          ))}
        </div>
      </div>

      {/* ══════════ ABOUT / MISSION (Sutéra-style large text) ══════════ */}
      <section id="about-section" data-animate className="px-6 py-24 md:py-36">
        <div className="max-w-7xl mx-auto">
          <div className={`transition-all duration-700 ${isVisible('about-section') ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <p className="text-[clamp(28px,4.5vw,72px)] font-semibold leading-[1.15] text-zinc-900 max-w-5xl">
              We believe benchmarks should be{' '}
              <span className="text-orange-500">transparent</span>,{' '}
              <span className="text-orange-500">customizable</span>,
              and owned by the{' '}
              <span className="inline-flex items-baseline">
                community
                <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-orange-400 ml-2 animate-float-slow" />
              </span>
            </p>
          </div>

          {/* Tech panel aside */}
          <div className={`mt-12 max-w-md transition-all duration-700 ${isVisible('about-section') ? 'animate-slide-in-left' : 'opacity-0'}`}
               style={{ animationDelay: '0.3s' }}>
            <div className="tech-panel">
              <div className="tech-panel-header"><span>Essentially</span></div>
              <div className="p-4 text-xs text-zinc-500 leading-relaxed" style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
                EVERY API SENDS AND RECEIVES DATA
                DIFFERENTLY. ORDEAL LETS YOU DEFINE
                HOW REQUESTS ARE BUILT AND RESPONSES
                ARE PARSED — FOR ANY MODEL, ANY
                PROVIDER.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FEATURES (Sutéra-style numbered grid) ══════════ */}
      <section id="features-section" data-animate className="px-6 py-20 md:py-32 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto">
          <div className={`flex items-end justify-between mb-16 transition-all duration-500 ${isVisible('features-section') ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <div>
              <span className="mono-label block mb-3">[ Capabilities ]</span>
              <h2 className="text-4xl md:text-6xl font-semibold text-zinc-900">
                Everything you need
              </h2>
            </div>
            <span className="mono-label-sm hidden md:block">/ {features.length.toString().padStart(2, '0')} features</span>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className={`group relative p-8 bg-white border border-zinc-200 hover:border-orange-400 transition-all duration-500 scan-line-container ${
                    isVisible('features-section') ? 'animate-fade-in-up' : 'opacity-0'
                  }`}
                  style={{ animationDelay: isVisible('features-section') ? `${i * 120}ms` : '0' }}
                >
                  {/* Tag number */}
                  <span className="absolute top-4 right-4 text-[10px] text-zinc-300" style={{ fontFamily: 'var(--font-mono)' }}>
                    {feature.tag}.
                  </span>

                  <div className={`w-10 h-10 flex items-center justify-center border-l-2 ${feature.accent} mb-5`}>
                    <Icon className="w-5 h-5 text-zinc-700 group-hover:text-orange-500 transition-colors" />
                  </div>

                  <h3 className="text-xl font-semibold text-zinc-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-zinc-500 leading-relaxed">{feature.description}</p>

                  {/* Bottom connector line */}
                  <div className="absolute bottom-0 left-8 right-8 h-px bg-zinc-100 group-hover:bg-orange-300 transition-colors" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════ HOW IT WORKS (Editorial timeline) ══════════ */}
      <section id="steps-section" data-animate className="px-6 py-20 md:py-32 bg-white/50 border-t border-zinc-200">
        <div className="max-w-5xl mx-auto">
          <div className={`mb-16 transition-all duration-500 ${isVisible('steps-section') ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <span className="mono-label block mb-3">[ Workflow ]</span>
            <h2 className="text-4xl md:text-6xl font-semibold text-zinc-900">
              Simple workflow
            </h2>
          </div>

          <div className="space-y-0">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`group flex gap-8 items-start py-10 border-b border-zinc-200 last:border-b-0 transition-all duration-500 ${
                  isVisible('steps-section') ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{ animationDelay: isVisible('steps-section') ? `${i * 150}ms` : '0' }}
              >
                {/* Step number */}
                <span
                  className="text-5xl md:text-7xl font-bold text-zinc-100 group-hover:text-orange-200 transition-colors leading-none select-none"
                  style={{ fontFamily: 'var(--font-mono)' }}
                >
                  {step.num}
                </span>

                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-semibold text-zinc-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-zinc-500 leading-relaxed max-w-lg">{step.desc}</p>
                </div>

                <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-orange-400 group-hover:translate-x-1 transition-all mt-4 hidden md:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PROVIDERS (Scattered Sutéra-style) ══════════ */}
      <section id="providers-section" data-animate className="px-6 py-20 md:py-32 border-t border-zinc-200">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-500 ${isVisible('providers-section') ? 'animate-fade-in-up' : 'opacity-0'}`}>
            <span className="mono-label block mb-3">[ Integrations ]</span>
            <h2 className="text-4xl md:text-6xl font-semibold text-zinc-900 mb-4">
              Works with all major providers
            </h2>
            <p className="mono-label-sm">(Have fun exploring)</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {providers.map((provider, i) => (
              <div
                key={i}
                className={`group relative p-6 bg-white border border-zinc-200 hover:border-orange-400 transition-all duration-300 ${
                  isVisible('providers-section') ? 'animate-scale-in' : 'opacity-0'
                }`}
                style={{ animationDelay: isVisible('providers-section') ? `${i * 80}ms` : '0' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-semibold text-zinc-900 group-hover:text-orange-600 transition-colors">
                    {provider.name}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-zinc-300 group-hover:text-orange-400 transition-colors" />
                </div>
                <span className="text-[10px] text-zinc-400 tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
                  {provider.tag.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA (Dark section with grid) ══════════ */}
      <section id="cta-section" data-animate className="relative px-6 py-24 md:py-36 bg-zinc-950 text-white overflow-hidden">
        {/* Grid overlay on dark */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
          backgroundSize: '120px 120px',
        }} />

        {/* Orange glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

        <div className={`max-w-4xl mx-auto text-center relative z-10 transition-all duration-500 ${isVisible('cta-section') ? 'animate-fade-in-up' : 'opacity-0'}`}>
          <span className="inline-block mono-label-sm text-zinc-500 mb-6">[ Get Started ]</span>

          <h2 className="text-4xl md:text-6xl font-semibold mb-6 leading-tight">
            Start benchmarking<br />
            <span className="text-orange-500">today</span>
          </h2>

          <p className="text-zinc-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Build benchmarks, run evals, share results. Free forever. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-orange-500 text-white font-medium hover:bg-orange-600 transition-all active:scale-[0.97]"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="https://github.com/bhdrdemir/Ordeal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-zinc-700 text-zinc-300 font-medium hover:border-orange-500 hover:text-orange-400 transition-all active:scale-[0.97]"
            >
              <Github className="w-4 h-4" />
              GitHub
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
