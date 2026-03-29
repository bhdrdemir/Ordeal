'use client';

import { useEffect, useState } from 'react';
import { Key, Plus, Trash2, Copy, Loader2, X } from 'lucide-react';

interface ApiKeyData {
  id: string;
  providerId: string;
  providerName: string;
  label: string;
  encryptedKey: string;
  createdAt: string;
}

interface Provider {
  id: string;
  name: string;
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKeyData[]>([]);
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [keyValue, setKeyValue] = useState('');
  const [keyLabel, setKeyLabel] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [keysRes, builtinRes, customRes] = await Promise.all([
          fetch('/api/keys'),
          fetch('/api/providers/builtin'),
          fetch('/api/providers'),
        ]);

        if (!keysRes.ok) throw new Error('Failed to fetch keys');

        const keysData = await keysRes.json();
        setKeys(Array.isArray(keysData) ? keysData : keysData.keys || []);

        // Merge builtin + custom providers for the selector
        const allProviders: Provider[] = [];

        if (builtinRes.ok) {
          const builtinData = await builtinRes.json();
          const builtins = Array.isArray(builtinData) ? builtinData : builtinData.providers || [];
          allProviders.push(...builtins.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name })));
        }

        if (customRes.ok) {
          const customData = await customRes.json();
          // API returns { custom: [...], builtin: [...] }
          const customs = Array.isArray(customData) ? customData : customData.custom || [];
          // Filter out builtins (already added) and add custom ones
          const customOnly = customs.filter((p: { type: string }) => p.type === 'CUSTOM' || p.type === 'TEMPLATE');
          allProviders.push(...customOnly.map((p: { id: string; name: string }) => ({ id: p.id, name: `${p.name} (Custom)` })));
        }

        setProviders(allProviders);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load API keys');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProvider || !keyValue.trim()) {
      setError('Provider and API key are required');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          providerId: selectedProvider,
          key: keyValue,
          label: keyLabel || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add API key');
      }

      const data = await res.json();
      setKeys([...keys, data]);
      setShowAddModal(false);
      setKeyValue('');
      setKeyLabel('');
      setSelectedProvider('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add API key');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!window.confirm('Are you sure you want to delete this API key?')) {
      return;
    }

    setDeleting(keyId);
    try {
      const res = await fetch(`/api/keys/${keyId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete API key');
      }

      setKeys(keys.filter((k) => k.id !== keyId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete API key');
    } finally {
      setDeleting(null);
    }
  };

  const handleCopy = (keyId: string) => {
    setCopiedId(keyId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">API Keys</h1>
          <p className="text-zinc-500">Manage your API keys for providers</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mr-2" />
          <span className="text-zinc-500">Loading API keys...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">API Keys</h1>
          <p className="text-zinc-500">Securely manage your API keys for LLM providers</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-2 font-semibold transition-colors active:scale-95"
        >
          <Plus size={20} />
          Add Key
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg border border-zinc-200 p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-zinc-900">Add API Key</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 hover:bg-zinc-100 rounded"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddKey} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-2">
                  Provider
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                >
                  <option value="">Select a provider...</option>
                  {providers.map((provider) => (
                    <option key={provider.id} value={provider.id}>
                      {provider.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-2">
                  API Key
                </label>
                <input
                  type="password"
                  value={keyValue}
                  onChange={(e) => setKeyValue(e.target.value)}
                  placeholder="Paste your API key here"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-900 mb-2">
                  Label (optional)
                </label>
                <input
                  type="text"
                  value={keyLabel}
                  onChange={(e) => setKeyLabel(e.target.value)}
                  placeholder="e.g., Production, Testing"
                  className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-400 text-white rounded-lg px-4 py-2 font-semibold transition-colors"
                >
                  {submitting ? 'Adding...' : 'Add Key'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 border border-zinc-300 hover:bg-zinc-50 text-zinc-900 rounded-lg px-4 py-2 font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {keys.length === 0 ? (
        <div className="bg-white rounded-lg border border-zinc-200 p-12 text-center">
          <Key className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">No API Keys</h3>
          <p className="text-zinc-500 mb-6">
            Add your first API key to start using providers in evaluations
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-2 font-semibold transition-colors active:scale-95"
          >
            <Plus size={20} />
            Add Key
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                    Provider
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                    Label
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                    Key (Masked)
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-zinc-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {keys.map((key) => {
                  const createdDate = new Date(key.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  const maskedKey = `${key.encryptedKey.substring(0, 4)}...${key.encryptedKey.substring(
                    key.encryptedKey.length - 4
                  )}`;

                  return (
                    <tr key={key.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium text-zinc-900">{key.providerName}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-zinc-600">{key.label || '—'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-sm text-zinc-600 font-mono bg-zinc-50 px-2 py-1 rounded">
                            {maskedKey}
                          </code>
                          <button
                            onClick={() => handleCopy(key.id)}
                            className="p-1 hover:bg-zinc-100 rounded transition-colors"
                            title="Copy"
                          >
                            <Copy size={16} className="text-zinc-500" />
                          </button>
                          {copiedId === key.id && (
                            <span className="text-xs text-green-600">Copied</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-zinc-600">{createdDate}</span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteKey(key.id)}
                          disabled={deleting === key.id}
                          className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                        >
                          {deleting === key.id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 size={16} />
                              Delete
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Security:</strong> Your API keys are encrypted and never stored in plain text. They are only
          transmitted directly to their respective providers.
        </p>
      </div>
    </div>
  );
}
