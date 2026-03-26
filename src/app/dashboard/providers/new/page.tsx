'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  costPerInputToken: number;
  costPerOutputToken: number;
}

export default function NewProviderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'template' | 'custom'>('template');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    baseUrl: '',
    authType: 'BEARER' as const,
    headers: '{}',
    bodyTemplate: '{}',
    customCode: '',
    models: [] as Model[],
  });

  const handleAddModel = () => {
    setFormData({
      ...formData,
      models: [
        ...formData.models,
        {
          id: crypto.randomUUID?.() || Date.now().toString(),
          name: '',
          costPerInputToken: 0,
          costPerOutputToken: 0,
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

  const handleModelChange = (index: number, field: keyof Model, value: any) => {
    const updated = [...formData.models];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, models: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.name.trim()) {
        throw new Error('Provider name is required');
      }

      if (activeTab === 'template' && !formData.baseUrl.trim()) {
        throw new Error('Base URL is required for template providers');
      }

      // Validate JSON fields
      try {
        JSON.parse(formData.headers);
        JSON.parse(formData.bodyTemplate);
      } catch {
        throw new Error('Invalid JSON in headers or body template');
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        type: activeTab === 'custom' ? 'CUSTOM' : 'TEMPLATE',
        baseUrl: formData.baseUrl,
        authType: formData.authType,
        headers: JSON.parse(formData.headers),
        bodyTemplate: JSON.parse(formData.bodyTemplate),
        customCode: activeTab === 'custom' ? formData.customCode : undefined,
        models: formData.models.map((m) => ({
          id: m.id,
          name: m.name,
          costPerInputToken: m.costPerInputToken,
          costPerOutputToken: m.costPerOutputToken,
        })),
      };

      const res = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create provider');
      }

      const { provider } = await res.json();
      router.push(`/dashboard/providers/${provider.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/providers"
          className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium mb-4"
        >
          <ArrowLeft size={18} />
          Back to Providers
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Create New Provider</h1>
        <p className="text-zinc-500">Set up a custom API provider for your evaluations</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1">
                Provider Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., My Custom LLM API"
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this provider does..."
                rows={2}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        {/* Configuration Tabs */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6">
          <div className="flex gap-4 mb-6 border-b border-zinc-200">
            <button
              type="button"
              onClick={() => setActiveTab('template')}
              className={`pb-3 px-4 font-medium border-b-2 transition-all ${
                activeTab === 'template'
                  ? 'text-orange-500 border-orange-500'
                  : 'text-zinc-600 border-transparent hover:text-zinc-900'
              }`}
            >
              Template Configuration
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('custom')}
              className={`pb-3 px-4 font-medium border-b-2 transition-all ${
                activeTab === 'custom'
                  ? 'text-orange-500 border-orange-500'
                  : 'text-zinc-600 border-transparent hover:text-zinc-900'
              }`}
            >
              Custom Code
            </button>
          </div>

          {activeTab === 'template' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1">
                  Base URL
                </label>
                <input
                  type="url"
                  value={formData.baseUrl}
                  onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
                  placeholder="https://api.example.com/v1"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1">
                  Authentication Type
                </label>
                <select
                  value={formData.authType}
                  onChange={(e) => setFormData({ ...formData, authType: e.target.value as any })}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                >
                  <option value="BEARER">Bearer Token</option>
                  <option value="HEADER">Custom Header</option>
                  <option value="QUERY">Query Parameter</option>
                  <option value="CUSTOM">Custom</option>
                  <option value="NONE">None</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1">
                  Headers (JSON)
                </label>
                <textarea
                  value={formData.headers}
                  onChange={(e) => setFormData({ ...formData, headers: e.target.value })}
                  placeholder='{"Content-Type": "application/json"}'
                  rows={4}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1">
                  Request Body Template (JSON)
                </label>
                <textarea
                  value={formData.bodyTemplate}
                  onChange={(e) => setFormData({ ...formData, bodyTemplate: e.target.value })}
                  placeholder='{"messages": [{"role": "user", "content": "{{prompt}}"}]}'
                  rows={4}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                />
              </div>
            </div>
          )}

          {activeTab === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-2">
                Custom JavaScript Code
              </label>
              <p className="text-sm text-zinc-500 mb-3">
                Write custom logic to handle requests/responses. This runs in a secure sandbox.
              </p>
              <textarea
                value={formData.customCode}
                onChange={(e) => setFormData({ ...formData, customCode: e.target.value })}
                placeholder="// Your custom code here&#10;// async function makeRequest(prompt, model) { ... }"
                rows={10}
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
              />
            </div>
          )}
        </div>

        {/* Models */}
        <div className="bg-white rounded-lg border border-zinc-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-900">Models</h2>
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
            <p className="text-zinc-500">No models added yet. Add your first model to get started.</p>
          ) : (
            <div className="space-y-4">
              {formData.models.map((model, index) => (
                <div key={model.id} className="p-4 border border-zinc-200 rounded-lg space-y-3">
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-zinc-900 mb-1">
                        Model ID
                      </label>
                      <input
                        type="text"
                        value={model.id}
                        readOnly
                        className="w-full px-3 py-2 border border-zinc-200 rounded bg-zinc-50 text-sm text-zinc-600"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveModel(index)}
                      className="p-2 hover:bg-red-50 rounded text-red-600 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-900 mb-1">
                      Model Name
                    </label>
                    <input
                      type="text"
                      value={model.name}
                      onChange={(e) => handleModelChange(index, 'name', e.target.value)}
                      placeholder="e.g., gpt-4, claude-3-opus"
                      className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-zinc-900 mb-1">
                        Cost per Input Token ($)
                      </label>
                      <input
                        type="number"
                        step="0.0000001"
                        value={model.costPerInputToken}
                        onChange={(e) =>
                          handleModelChange(index, 'costPerInputToken', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-zinc-900 mb-1">
                        Cost per Output Token ($)
                      </label>
                      <input
                        type="number"
                        step="0.0000001"
                        value={model.costPerOutputToken}
                        onChange={(e) =>
                          handleModelChange(index, 'costPerOutputToken', parseFloat(e.target.value) || 0)
                        }
                        className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-400 text-white rounded-lg px-6 py-3 font-semibold transition-colors active:scale-95"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
            {loading ? 'Creating...' : 'Create Provider'}
          </button>
          <Link
            href="/dashboard/providers"
            className="flex items-center gap-2 border border-zinc-300 hover:bg-zinc-50 text-zinc-900 rounded-lg px-6 py-3 font-semibold transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
