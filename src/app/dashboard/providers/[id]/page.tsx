'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Loader2, Plus, Trash2 } from 'lucide-react';

interface Model {
  id: string;
  name: string;
  costPerInputToken: number;
  costPerOutputToken: number;
}

interface ProviderData {
  id: string;
  name: string;
  slug: string;
  description: string;
  baseUrl: string;
  authType: string;
  headers: Record<string, any>;
  bodyTemplate: Record<string, any>;
  customCode: string | null;
  models: Model[];
  type: string;
}

export default function EditProviderPage() {
  const router = useRouter();
  const params = useParams();
  const providerId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'template' | 'custom'>('template');

  const [formData, setFormData] = useState<ProviderData | null>(null);

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const res = await fetch(`/api/providers/${providerId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch provider');
        }
        const data = await res.json();
        setFormData(data.provider);
        setActiveTab(data.provider.customCode ? 'custom' : 'template');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load provider');
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [providerId]);

  const handleAddModel = () => {
    if (!formData) return;
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
    if (!formData) return;
    setFormData({
      ...formData,
      models: formData.models.filter((_, i) => i !== index),
    });
  };

  const handleModelChange = (index: number, field: keyof Model, value: any) => {
    if (!formData) return;
    const updated = [...formData.models];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, models: updated });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setError(null);
    setSaving(true);

    try {
      if (!formData.name.trim()) {
        throw new Error('Provider name is required');
      }

      if (activeTab === 'template' && !formData.baseUrl.trim()) {
        throw new Error('Base URL is required for template providers');
      }

      const payload = {
        name: formData.name,
        description: formData.description,
        type: activeTab === 'custom' ? 'CUSTOM' : 'TEMPLATE',
        baseUrl: formData.baseUrl,
        authType: formData.authType,
        headers: typeof formData.headers === 'string' ? JSON.parse(formData.headers) : formData.headers,
        bodyTemplate: typeof formData.bodyTemplate === 'string' ? JSON.parse(formData.bodyTemplate) : formData.bodyTemplate,
        customCode: activeTab === 'custom' ? formData.customCode : undefined,
        models: formData.models.map((m) => ({
          id: m.id,
          name: m.name,
          costPerInputToken: m.costPerInputToken,
          costPerOutputToken: m.costPerOutputToken,
        })),
      };

      const res = await fetch(`/api/providers/${providerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update provider');
      }

      router.push('/dashboard/providers');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mr-2" />
        <span className="text-zinc-500">Loading provider...</span>
      </div>
    );
  }

  if (!formData) {
    return (
      <div className="w-full">
        <Link
          href="/dashboard/providers"
          className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium mb-4"
        >
          <ArrowLeft size={18} />
          Back to Providers
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Provider not found</p>
        </div>
      </div>
    );
  }

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
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Edit Provider</h1>
        <p className="text-zinc-500">{formData.name}</p>
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
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1">
                Slug
              </label>
              <input
                type="text"
                value={formData.slug}
                readOnly
                className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-zinc-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-900 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1">
                  Authentication Type
                </label>
                <select
                  value={formData.authType}
                  onChange={(e) => setFormData({ ...formData, authType: e.target.value })}
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
                  value={typeof formData.headers === 'string' ? formData.headers : JSON.stringify(formData.headers, null, 2)}
                  onChange={(e) => setFormData({ ...formData, headers: e.target.value as any })}
                  rows={4}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-1">
                  Request Body Template (JSON)
                </label>
                <textarea
                  value={typeof formData.bodyTemplate === 'string' ? formData.bodyTemplate : JSON.stringify(formData.bodyTemplate, null, 2)}
                  onChange={(e) => setFormData({ ...formData, bodyTemplate: e.target.value as any })}
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
                value={formData.customCode || ''}
                onChange={(e) => setFormData({ ...formData, customCode: e.target.value })}
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
            disabled={saving}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-400 text-white rounded-lg px-6 py-3 font-semibold transition-colors active:scale-95"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={20} />}
            {saving ? 'Saving...' : 'Save Changes'}
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
