'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plug, Plus, ExternalLink, Loader2 } from 'lucide-react';

interface Provider {
  id: string;
  name: string;
  slug: string;
  description: string;
  type: string;
  models: string[];
  createdAt: string;
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [builtinProviders, setBuiltinProviders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        setLoading(true);
        const [customRes, builtinRes] = await Promise.all([
          fetch('/api/providers'),
          fetch('/api/providers/builtin'),
        ]);

        if (!customRes.ok || !builtinRes.ok) {
          throw new Error('Failed to fetch providers');
        }

        const customData = await customRes.json();
        const builtinData = await builtinRes.json();

        // API returns { custom: [...], builtin: [...] }
        setProviders(customData.custom || []);
        // Builtin endpoint returns a plain array
        setBuiltinProviders(Array.isArray(builtinData) ? builtinData : builtinData.providers || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load providers');
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  if (loading) {
    return (
      <div className="w-full">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Providers</h1>
          <p className="text-zinc-500">Manage your API providers and integrations</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mr-2" />
          <span className="text-zinc-500">Loading providers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Providers</h1>
          <p className="text-zinc-500">Manage your API providers and integrations</p>
        </div>
        <Link
          href="/dashboard/providers/new"
          className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-2 font-semibold transition-colors active:scale-95"
        >
          <Plus size={20} />
          Add Provider
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Custom Providers */}
      {providers.length > 0 && (
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Custom Providers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {providers.map((provider) => {
              const models = Array.isArray(provider.models) ? provider.models : [];
              return (
                <Link
                  key={provider.id}
                  href={`/dashboard/providers/${provider.id}`}
                  className="group relative bg-white rounded-lg border border-zinc-200 p-6 hover:border-orange-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Plug className="w-5 h-5 text-orange-500" />
                    </div>
                    <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 opacity-0 group-hover:opacity-100 transition-all" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-1">{provider.name}</h3>
                  <p className="text-sm text-zinc-500 mb-4 line-clamp-2">{provider.description || 'No description'}</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-block px-2 py-1 bg-zinc-100 text-zinc-700 text-xs font-medium rounded">
                      {models.length} models
                    </span>
                    <span className="text-xs text-zinc-400 capitalize">{provider.type}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Built-in Providers */}
      {builtinProviders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 mb-4">Built-in Providers</h2>
          <p className="text-sm text-zinc-500 mb-4">Add your API keys to use these providers</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {builtinProviders.map((provider) => {
              const models = Array.isArray(provider.models) ? provider.models : [];
              return (
                <div
                  key={provider.id}
                  className="bg-white rounded-lg border border-zinc-200 p-6 hover:border-orange-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center flex-shrink-0">
                      <Plug className="w-5 h-5 text-orange-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 mb-1">{provider.name}</h3>
                  <p className="text-sm text-zinc-500 mb-4 line-clamp-2">{provider.description || 'No description'}</p>
                  <div className="flex flex-col gap-2">
                    <span className="inline-block px-2 py-1 bg-zinc-100 text-zinc-700 text-xs font-medium rounded w-fit">
                      {models.length} models
                    </span>
                    <Link
                      href="/dashboard/keys"
                      className="text-sm text-orange-500 hover:text-orange-600 font-medium"
                    >
                      Add API Key →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {providers.length === 0 && builtinProviders.length === 0 && (
        <div className="bg-white rounded-lg border border-zinc-200 p-12 text-center">
          <Plug className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">No providers found</h3>
          <p className="text-zinc-500 mb-6">Get started by adding your first provider</p>
          <Link
            href="/dashboard/providers/new"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-4 py-2 font-semibold transition-colors active:scale-95"
          >
            <Plus size={20} />
            Create Custom Provider
          </Link>
        </div>
      )}
    </div>
  );
}
