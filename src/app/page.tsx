'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import {
  BarChart3,
  Shield,
  Globe,
  ArrowRight,
  Github,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export default function Home() {
  const [animatedCounters, setAnimatedCounters] = useState({
    providers: 0,
    metrics: 0,
    results: 0,
  });
  const [visibleSections, setVisibleSections] = useState<string[]>([]);
  const [heroVisible, setHeroVisible] = useState(false);
  const [typedText, setTypedText] = useState('');
  const typingTexts = [
    'Test Any LLM API',
    'Compare Model Performance',
    'Your Prompts, Your Rules',
  ];
  const [typingIndex, setTypingIndex] = useState(0);
  const [isTypingForward, setIsTypingForward] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);

  // Typing effect
  useEffect(() => {
    const currentText = typingTexts[typingIndex];
    let timer: NodeJS.Timeout;

    if (isTypingForward) {
      if (typedText.length < currentText.length) {
        timer = setTimeout(() => {
          setTypedText(currentText.slice(0, typedText.length + 1));
        }, 80);
      } else {
        timer = setTimeout(() => {
          setIsTypingForward(false);
        }, 2000);
      }
    } else {
      if (typedText.length > 0) {
        timer = setTimeout(() => {
          setTypedText(typedText.slice(0, typedText.length - 1));
        }, 40);
      } else {
        setTypingIndex((typingIndex + 1) % typingTexts.length);
        setIsTypingForward(true);
      }
    }

    return () => clearTimeout(timer);
  }, [typedText, typingIndex, isTypingForward, typingTexts]);

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !visibleSections.includes(entry.target.id)) {
            setVisibleSections((prev) => [...prev, entry.target.id]);

            // Trigger counter animation
            if (entry.target.id === 'stats-section') {
              animateCounters();
            }
          }
        });
      },
      { threshold: 0.3 }
    );

    const sections = containerRef.current?.querySelectorAll('[data-animate]');
    sections?.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [visibleSections]);

  const animateCounters = () => {
    let current = { providers: 0, metrics: 0, results: 0 };
    const targets = { providers: 10, metrics: 15, results: 100 };
    const increment = { providers: 0.5, metrics: 0.8, results: 5 };

    const timer = setInterval(() => {
      current.providers += increment.providers;
      current.metrics += increment.metrics;
      current.results += increment.results;

      if (current.providers >= targets.providers) current.providers = targets.providers;
      if (current.metrics >= targets.metrics) current.metrics = targets.metrics;
      if (current.results >= targets.results) current.results = targets.results;

      setAnimatedCounters({
        providers: Math.floor(current.providers),
        metrics: Math.floor(current.metrics),
        results: Math.floor(current.results),
      });

      if (
        current.providers >= targets.providers &&
        current.metrics >= targets.metrics &&
        current.results >= targets.results
      ) {
        clearInterval(timer);
      }
    }, 30);
  };

  // Floating particles — generated client-side only to avoid hydration mismatch
  const [particles, setParticles] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 2,
        duration: 15 + Math.random() * 10,
      }))
    );
    // Show hero immediately on mount with a tiny delay for smooth entrance
    requestAnimationFrame(() => setHeroVisible(true));
  }, []);

  const Particles = () => (
    <>
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-orange-400 rounded-full opacity-60"
          style={{
            left: `${particle.left}%`,
            bottom: '-10px',
            animation: `float-up ${particle.duration}s linear infinite`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </>
  );

  const features = [
    {
      icon: Shield,
      title: 'Custom APIs',
      description: 'Bring your own providers or add custom API endpoints for proprietary models.',
    },
    {
      icon: BarChart3,
      title: 'Multi-Metric Scoring',
      description: 'Grade models on quality, latency, cost, and any custom metrics you define.',
    },
    {
      icon: Sparkles,
      title: 'Human + AI Judges',
      description: 'Combine automatic scoring with human feedback for comprehensive evaluation.',
    },
    {
      icon: Globe,
      title: 'Public Leaderboard',
      description: 'Share results with the community and see how your evals compare.',
    },
  ];

  const providers = [
    'OpenAI',
    'Anthropic',
    'Google',
    'Mistral',
    'Cohere',
    'Custom API',
  ];

  const steps = [
    {
      number: '1',
      title: 'Configure Providers',
      description: 'Add your API keys securely. They stay on your device.',
    },
    {
      number: '2',
      title: 'Run Evaluations',
      description: 'Write test prompts and run them against multiple models in parallel.',
    },
    {
      number: '3',
      title: 'Compare Results',
      description: 'View side-by-side metrics, charts, and detailed analysis.',
    },
  ];

  const isVisible = (sectionId: string) => visibleSections.includes(sectionId);

  return (
    <div ref={containerRef} className="min-h-screen bg-white">
      <Navbar />

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative px-6 py-20 md:py-40 overflow-hidden bg-gradient-to-br from-white via-orange-50/50 to-white">
        {/* Animated gradient background */}
        <div className="absolute inset-0 animate-gradient-shift opacity-40 -z-10" style={{
          background: 'linear-gradient(-45deg, #fff7ed, #fed7aa, #fef3c7, #fff7ed)',
          backgroundSize: '400% 400%',
        }} />

        {/* Floating particles */}
        <div className="absolute inset-0 overflow-hidden -z-5 h-screen">
          <Particles />
        </div>

        {/* Blur circles */}
        <div className="absolute top-20 right-0 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-orange-100/20 rounded-full blur-3xl -z-10" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Main heading with glow effect */}
          <h1 className={`text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight transition-all duration-500 ordeal-glow ${
            heroVisible ? 'animate-fade-in-up' : 'opacity-0'
          }`} style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}>
            Ordeal
          </h1>

          {/* Typing effect subtitle */}
          <div className={`min-h-24 md:min-h-20 flex items-center justify-center mb-8 transition-all duration-500 ${
            heroVisible ? 'animate-fade-in-up' : 'opacity-0'
          }`}>
            <span className="gradient-text text-3xl md:text-4xl font-bold">
              {typedText}
              <span className="animate-typing ml-1">|</span>
            </span>
          </div>

          {/* Description */}
          <p className={`text-lg md:text-xl text-slate-600 mb-12 max-w-2xl mx-auto leading-relaxed transition-all duration-700 ${
            heroVisible ? 'animate-fade-in-up' : 'opacity-0'
          }`}>
            Build benchmarks that matter. Compare any model with custom metrics, automated scoring, and shareable results.
          </p>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-700 ${
            heroVisible ? 'animate-fade-in-up' : 'opacity-0'
          }`}>
            <Link
              href="/login"
              className="group inline-flex items-center justify-center px-8 py-4 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-all hover:shadow-2xl hover:shadow-orange-500/40 active:scale-95 animate-pulse-glow-landing"
            >
              Get Started Free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg border-2 border-orange-500 text-orange-500 font-semibold hover:bg-orange-50 transition-all active:scale-95"
            >
              View Public Leaderboard
            </Link>
          </div>

          {/* Stats */}
          <div
            id="stats-section"
            data-animate
            className={`flex flex-wrap justify-center gap-8 md:gap-16 pt-12 border-t border-orange-200 transition-all duration-500 ${
              isVisible('stats-section') ? 'animate-fade-in-up' : 'opacity-0'
            }`}
          >
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-orange-500">{animatedCounters.providers}+</p>
              <p className="text-sm text-slate-600 mt-2">Providers Supported</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-orange-500">{animatedCounters.metrics}+</p>
              <p className="text-sm text-slate-600 mt-2">Metrics Available</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-bold text-orange-500">∞</p>
              <p className="text-sm text-slate-600 mt-2">Evals & Results</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURES ═══════════════ */}
      <section id="features-section" data-animate className="px-6 py-20 md:py-32 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-500 ${
            isVisible('features-section') ? 'animate-fade-in-up' : 'opacity-0'
          }`}>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-950 mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Professional tools for rigorous LLM evaluation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className={`group p-8 rounded-xl border border-slate-200 hover:border-orange-400 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-500 bg-white hover-lift gradient-border ${
                    isVisible('features-section') ? 'animate-fade-in-up' : 'opacity-0'
                  }`}
                  style={{
                    animationDelay: isVisible('features-section') ? `${i * 100}ms` : '0',
                  }}
                >
                  <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                    <Icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-950 mb-2">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section id="steps-section" data-animate className="px-6 py-20 md:py-32 bg-orange-50/30">
        <div className="max-w-4xl mx-auto">
          <div className={`text-center mb-16 transition-all duration-500 ${
            isVisible('steps-section') ? 'animate-fade-in-up' : 'opacity-0'
          }`}>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-950 mb-4">
              Simple workflow
            </h2>
            <p className="text-lg text-slate-600">
              Three steps to comprehensive benchmarking
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex gap-6 items-start transition-all duration-500 ${
                  isVisible('steps-section') ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{
                  animationDelay: isVisible('steps-section') ? `${i * 150}ms` : '0',
                }}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-white font-bold flex items-center justify-center text-lg shadow-lg shadow-orange-500/30">
                    {step.number}
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-semibold text-slate-950 mb-2">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ SUPPORTED PROVIDERS ═══════════════ */}
      <section id="providers-section" data-animate className="px-6 py-20 md:py-32 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className={`text-center mb-12 transition-all duration-500 ${
            isVisible('providers-section') ? 'animate-fade-in-up' : 'opacity-0'
          }`}>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-950 mb-4">
              Integrations
            </h2>
            <p className="text-lg text-slate-600">
              Works with all major providers
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {providers.map((provider, i) => (
              <div
                key={i}
                className={`p-6 rounded-lg border border-slate-200 bg-white text-center hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 cursor-default hover-lift ${
                  isVisible('providers-section') ? 'animate-fade-in-up' : 'opacity-0'
                }`}
                style={{
                  animationDelay: isVisible('providers-section') ? `${i * 80}ms` : '0',
                }}
              >
                <CheckCircle2 className="w-6 h-6 text-orange-500 mx-auto mb-3" />
                <p className="font-semibold text-slate-900">{provider}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ CTA ═══════════════ */}
      <section id="cta-section" data-animate className="relative px-6 py-20 md:py-32 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0 animate-gradient-shift opacity-30 -z-10" style={{
          background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.1), rgba(249, 115, 22, 0.05))',
          backgroundSize: '200% 200%',
        }} />
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl -z-10" />

        <div className={`max-w-3xl mx-auto text-center transition-all duration-500 ${
          isVisible('cta-section') ? 'animate-fade-in-up' : 'opacity-0'
        }`}>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Start benchmarking today
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
            Build benchmarks, run evals, share results. Free forever. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="group inline-flex items-center justify-center px-8 py-4 rounded-lg bg-orange-500 text-white font-semibold hover:bg-orange-600 transition-all hover:shadow-2xl hover:shadow-orange-500/50"
            >
              Get Started
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="https://github.com/bhdrdemir/Ordeal"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 rounded-lg border-2 border-orange-500 text-orange-400 font-semibold hover:bg-orange-500/10 transition-all"
            >
              <Github className="mr-2 w-5 h-5" />
              GitHub
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
