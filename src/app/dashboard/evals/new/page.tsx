'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, ChevronRight, ChevronLeft, Save, Loader2 } from 'lucide-react';

interface Prompt {
  id: string;
  content: string;
  category: string;
}

interface ModelSelection {
  providerId: string;
  modelId: string;
  label: string;
}

interface Criteria {
  id: string;
  name: string;
  description: string;
}

export default function NewEvalPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [providers, setProviders] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    prompts: [] as Prompt[],
    models: [] as ModelSelection[],
    judgeProviderId: '',
    judgeModel: '',
    judgePrompt: '',
    criteria: [] as Criteria[],
    temperature: 0.7,
    maxTokens: 2048,
    runsPerPrompt: 1,
  });

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const [customRes, builtinRes] = await Promise.all([
          fetch('/api/providers'),
          fetch('/api/providers/builtin'),
        ]);

        const customData = await customRes.json();
        const builtinData = await builtinRes.json();

        const allProviders = [
          ...(customData.providers || []),
          ...(builtinData.providers || []),
        ];
        setProviders(allProviders);
      } catch (err) {
        console.error('Failed to fetch providers:', err);
      }
    };

    fetchProviders();
  }, []);

  const handleAddPrompt = () => {
    setFormData({
      ...formData,
      prompts: [
        ...formData.prompts,
        {
          id: crypto.randomUUID?.() || Date.now().toString(),
          content: '',
          category: 'general',
        },
      ],
    });
  };

  const handleRemovePrompt = (index: number) => {
    setFormData({
      ...formData,
      prompts: formData.prompts.filter((_, i) => i !== index),
    });
  };

  const handlePromptChange = (index: number, field: keyof Prompt, value: string) => {
    const updated = [...formData.prompts];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, prompts: updated });
  };

  const handleAddModel = () => {
    setFormData({
      ...formData,
      models: [
        ...formData.models,
        {
          providerId: '',
          modelId: '',
          label: '',
        },
      ],
    });
  };

  const handleRemoveModel = (index: number) => {
    setFormData({
      ...formData,
      models: formData.models.filter((_, i) => i !== index),
    });
  };

  const handleModelChange = (index: number, field: keyof ModelSelection, value: string) => {
    const updated = [...formData.models];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, models: updated });
  };

  const handleAddCriteria = () => {
    setFormData({
      ...formData,
      criteria: [
        ...formData.criteria,
        {
          id: crypto.randomUUID?.() || Date.now().toString(),
          name: '',
          description: '',
        },
      ],
    });
  };

  const handleRemoveCriteria = (index: number) => {
    setFormData({
      ...formData,
      criteria: formData.criteria.filter((_, i) => i !== index),
    });
  };

  const handleCriteriaChange = (index: number, field: keyof Criteria, value: string) => {
    const updated = [...formData.criteria];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, criteria: updated });
  };

  const isStepValid = (): boolean => {
    switch (currentStep) {
      case 1:
        return formData.name.trim() !== '';
      case 2:
        return formData.prompts.length > 0 && formData.prompts.every((p) => p.content.trim() !== '');
      case 3:
        return formData.models.length > 0 && formData.models.every((m) => m.providerId && m.modelId);
      case 4:
        return true; // Judge settings are optional
      case 5:
        return true; // Settings have defaults
      case 6:
        return true; // Review step
      default:
        return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        throw new Error('Evaluation name is required');
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        prompts: formData.prompts.map((p) => ({
          content: p.content,
          category: p.category,
        })),
        models: formData.models,
        judgeProviderId: formData.judgeProviderId || undefined,
        judgeModel: formData.judgeModel || undefined,
        judgePrompt: formData.judgePrompt || undefined,
        criteria: formData.criteria,
        temperature: formData.temperature,
        maxTokens: formData.maxTokens,
        runsPerPrompt: formData.runsPerPrompt,
      };

      const res = await fetch('/api/evals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create evaluation');
      }

      const { evaluation } = await res.json();
      router.push(`/dashboard/evals/${evaluation.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const stepTitles = [
    'Basic Info',
    'Prompts',
    'Models',
    'Judge Settings',
    'Settings',
    'Review',
  ];

  return (
    <div className="w-full max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/evals"
          className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium mb-4"
        >
          <ArrowLeft size={18} />
          Back to Evaluations
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Create New Evaluation</h1>
        <p className="text-zinc-500">Set up a new benchmark for your models</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="mb-8 bg-white rounded-lg border border-zinc-200 p-6">
        <div className="flex items-center justify-between mb-4">
          {stepTitles.map((_, index) => (
            <div key={index} className="flex items-center">
              <button
                type="button"
                onClick={() => setCurrentStep(index + 1)}
                disabled={index + 1 > currentStep && !isStepValid()}
                className={`w-8 h-8 rounded-full font-semibold text-sm flex items-center justify-center transition-all ${
                  index + 1 <= currentStep
                    ? 'bg-orange-500 text-white'
                    : 'bg-zinc-200 text-zinc-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {index + 1}
              </button>
              {index < stepTitles.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    index + 1 < currentStep ? 'bg-orange-500' : 'bg-zinc-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <p className="text-sm text-zinc-600">
          Step {currentStep} of {stepTitles.length}: {stepTitles[currentStep - 1]}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg border border-zinc-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                Evaluation Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Claude vs GPT-4 on Analysis"
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                Description (optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the purpose of this evaluation..."
                rows={3}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
              />
            </div>
          </div>
        )}

        {/* Step 2: Prompts */}
        {currentStep === 2 && (
          <div className="bg-white rounded-lg border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900">Test Prompts</h2>
              <button
                type="button"
                onClick={handleAddPrompt}
                className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium"
              >
                <Plus size={18} />
                Add Prompt
              </button>
            </div>

            {formData.prompts.length === 0 ? (
              <p className="text-zinc-500">No prompts added yet. Add your first prompt to get started.</p>
            ) : (
              <div className="space-y-4">
                {formData.prompts.map((prompt, index) => (
                  <div key={prompt.id} className="p-4 border border-zinc-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-600">Prompt {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePrompt(index)}
                        className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <textarea
                      value={prompt.content}
                      onChange={(e) => handlePromptChange(index, 'content', e.target.value)}
                      placeholder="Enter your test prompt here..."
                      rows={3}
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                    />

                    <select
                      value={prompt.category}
                      onChange={(e) => handlePromptChange(index, 'category', e.target.value)}
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    >
                      <option value="general">General</option>
                      <option value="reasoning">Reasoning</option>
                      <option value="coding">Coding</option>
                      <option value="creative">Creative</option>
                      <option value="analysis">Analysis</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Models */}
        {currentStep === 3 && (
          <div className="bg-white rounded-lg border border-zinc-200 p-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-900">Select Models</h2>
              <button
                type="button"
                onClick={handleAddModel}
                className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium"
              >
                <Plus size={18} />
                Add Model
              </button>
            </div>

            {formData.models.length === 0 ? (
              <p className="text-zinc-500">No models selected yet. Add at least one model.</p>
            ) : (
              <div className="space-y-4">
                {formData.models.map((model, index) => (
                  <div key={index} className="p-4 border border-zinc-200 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-600">Model {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveModel(index)}
                        className="p-1 hover:bg-red-50 rounded text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-zinc-900 mb-1">
                          Provider
                        </label>
                        <select
                          value={model.providerId}
                          onChange={(e) => handleModelChange(index, 'providerId', e.target.value)}
                          className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                        >
                          <option value="">Select provider...</option>
                          {providers.map((provider) => (
                            <option key={provider.id} value={provider.id}>
                              {provider.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-zinc-900 mb-1">
                          Model ID
                        </label>
                        <select
                          value={model.modelId}
                          onChange={(e) => handleModelChange(index, 'modelId', e.target.value)}
                          disabled={!model.providerId}
                          className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent disabled:bg-zinc-50"
                        >
                          <option value="">Select model...</option>
                          {model.providerId &&
                            providers
                              .find((p) => p.id === model.providerId)
                              ?.models?.map((m: any) => (
                                <option key={m.id} value={m.id}>
                                  {m.name}
                                </option>
                              ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-900 mb-1">
                        Label (optional)
                      </label>
                      <input
                        type="text"
                        value={model.label}
                        onChange={(e) => handleModelChange(index, 'label', e.target.value)}
                        placeholder="e.g., Claude 3 Opus"
                        className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Judge Settings */}
        {currentStep === 4 && (
          <div className="bg-white rounded-lg border border-zinc-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Judge Settings (Optional)</h2>

            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                Judge Provider
              </label>
              <select
                value={formData.judgeProviderId}
                onChange={(e) => setFormData({ ...formData, judgeProviderId: e.target.value })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              >
                <option value="">None (skip AI judging)</option>
                {providers.map((provider) => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name}
                  </option>
                ))}
              </select>
            </div>

            {formData.judgeProviderId && (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-2">
                    Judge Model
                  </label>
                  <select
                    value={formData.judgeModel}
                    onChange={(e) => setFormData({ ...formData, judgeModel: e.target.value })}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                  >
                    <option value="">Select model...</option>
                    {providers
                      .find((p) => p.id === formData.judgeProviderId)
                      ?.models?.map((m: any) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-900 mb-2">
                    Judge Prompt
                  </label>
                  <textarea
                    value={formData.judgePrompt}
                    onChange={(e) => setFormData({ ...formData, judgePrompt: e.target.value })}
                    placeholder="Instructions for the judge model..."
                    rows={4}
                    className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                  />
                </div>
              </>
            )}

            <div className="mt-6 pt-4 border-t border-zinc-200">
              <h3 className="text-lg font-semibold text-zinc-900 mb-4">Scoring Criteria</h3>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-zinc-600">Define custom criteria for evaluation</p>
                <button
                  type="button"
                  onClick={handleAddCriteria}
                  className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium"
                >
                  <Plus size={18} />
                  Add Criteria
                </button>
              </div>

              {formData.criteria.length === 0 ? (
                <p className="text-sm text-zinc-500">No criteria added yet.</p>
              ) : (
                <div className="space-y-3">
                  {formData.criteria.map((criterion, index) => (
                    <div key={criterion.id} className="p-3 border border-zinc-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={criterion.name}
                          onChange={(e) => handleCriteriaChange(index, 'name', e.target.value)}
                          placeholder="Criterion name (e.g., Accuracy)"
                          className="flex-1 px-3 py-1 border border-zinc-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveCriteria(index)}
                          className="p-1 hover:bg-red-50 rounded text-red-600 ml-2 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <textarea
                        value={criterion.description}
                        onChange={(e) => handleCriteriaChange(index, 'description', e.target.value)}
                        placeholder="Describe how this criterion should be evaluated..."
                        rows={2}
                        className="w-full px-3 py-1 border border-zinc-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 5: Settings */}
        {currentStep === 5 && (
          <div className="bg-white rounded-lg border border-zinc-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-zinc-900 mb-4">Evaluation Settings</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-2">
                  Temperature
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={formData.temperature}
                  onChange={(e) => setFormData({ ...formData, temperature: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
                <p className="text-xs text-zinc-500 mt-1">Range: 0-2 (higher = more creative)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-2">
                  Max Tokens
                </label>
                <input
                  type="number"
                  step="100"
                  min="1"
                  value={formData.maxTokens}
                  onChange={(e) => setFormData({ ...formData, maxTokens: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                Runs Per Prompt
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={formData.runsPerPrompt}
                onChange={(e) => setFormData({ ...formData, runsPerPrompt: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
              <p className="text-xs text-zinc-500 mt-1">Number of times to run each prompt</p>
            </div>
          </div>
        )}

        {/* Step 6: Review */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-zinc-200 p-6">
              <h2 className="text-lg font-semibold text-zinc-900 mb-4">Review Your Evaluation</h2>

              <div className="space-y-4">
                <div className="pb-4 border-b border-zinc-200">
                  <p className="text-sm text-zinc-600">Name</p>
                  <p className="text-lg font-semibold text-zinc-900">{formData.name}</p>
                </div>

                <div className="pb-4 border-b border-zinc-200">
                  <p className="text-sm text-zinc-600">Prompts</p>
                  <p className="text-lg font-semibold text-zinc-900">{formData.prompts.length} prompts</p>
                </div>

                <div className="pb-4 border-b border-zinc-200">
                  <p className="text-sm text-zinc-600">Models</p>
                  <p className="text-lg font-semibold text-zinc-900">{formData.models.length} models</p>
                </div>

                <div className="pb-4 border-b border-zinc-200">
                  <p className="text-sm text-zinc-600">Settings</p>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    <div>
                      <p className="text-xs text-zinc-500">Temperature</p>
                      <p className="font-semibold text-zinc-900">{formData.temperature}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Max Tokens</p>
                      <p className="font-semibold text-zinc-900">{formData.maxTokens}</p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500">Runs Per Prompt</p>
                      <p className="font-semibold text-zinc-900">{formData.runsPerPrompt}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-900">
                You are ready to create this evaluation. Click the Create button to get started.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-zinc-200">
          <button
            type="button"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-2 border border-zinc-300 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 rounded-lg px-6 py-2 font-semibold transition-colors"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <div className="flex gap-4">
            {currentStep < 6 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!isStepValid()}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-400 text-white rounded-lg px-6 py-2 font-semibold transition-colors disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight size={18} />
              </button>
            )}

            {currentStep === 6 && (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-zinc-400 text-white rounded-lg px-6 py-2 font-semibold transition-colors disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
                {loading ? 'Creating...' : 'Create Evaluation'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
