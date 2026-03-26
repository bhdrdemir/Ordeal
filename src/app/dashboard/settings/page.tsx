'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { User, Trash2, AlertTriangle, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (status === 'loading') {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mr-2" />
          <span className="text-zinc-500">Loading settings...</span>
        </div>
      </div>
    );
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm(
      'Are you absolutely sure? This will permanently delete your account and all associated data. This action cannot be undone.'
    )) {
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const res = await fetch('/api/account/delete', {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete account');
      }

      signOut({ redirectTo: '/' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete account');
      setDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Settings</h1>
        <p className="text-zinc-500">Manage your account settings and preferences</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Profile Section */}
      <div className="bg-white rounded-lg border border-zinc-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-zinc-900 mb-6">Profile</h2>

        <div className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-orange-100"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 flex items-center justify-center text-white font-bold text-xl">
                  {session?.user?.name
                    ? session.user.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                    : 'U'}
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-zinc-600">Profile Picture</p>
              <p className="text-sm text-zinc-500">
                {session?.user?.image
                  ? 'From your OAuth provider'
                  : 'Not set'}
              </p>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Name
            </label>
            <input
              type="text"
              value={session?.user?.name || ''}
              readOnly
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-zinc-600"
            />
            <p className="text-xs text-zinc-500 mt-1">From your OAuth provider</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={session?.user?.email || ''}
              readOnly
              className="w-full px-4 py-2 border border-zinc-200 rounded-lg bg-zinc-50 text-zinc-600"
            />
            <p className="text-xs text-zinc-500 mt-1">From your OAuth provider</p>
          </div>

          {/* Provider */}
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-2">
              Authentication Provider
            </label>
            <div className="flex items-center gap-3 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
              <User size={20} className="text-orange-500" />
              <div>
                <p className="font-medium text-zinc-900">OAuth</p>
                <p className="text-sm text-zinc-600">Secure sign-in via GitHub or Google</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-6 h-6 text-red-600" />
          <h2 className="text-lg font-semibold text-red-900">Danger Zone</h2>
        </div>

        <p className="text-red-800 text-sm mb-6">
          These actions are permanent and cannot be undone. Please proceed with caution.
        </p>

        <div className="border-t border-red-200 pt-6">
          <h3 className="text-sm font-semibold text-red-900 mb-3">Delete Account</h3>
          <p className="text-sm text-red-800 mb-4">
            Permanently delete your account and all associated data, including:
          </p>
          <ul className="list-disc list-inside text-sm text-red-800 mb-6 space-y-1">
            <li>All evaluations and results</li>
            <li>All custom providers</li>
            <li>All API keys</li>
            <li>All user data</li>
          </ul>

          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-zinc-400 text-white rounded-lg px-6 py-3 font-semibold transition-colors disabled:cursor-not-allowed"
          >
            {deleting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Deleting Account...
              </>
            ) : (
              <>
                <Trash2 size={20} />
                Delete My Account
              </>
            )}
          </button>
        </div>
      </div>

      {/* Information */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-900">
          <strong>Note:</strong> To change your name, email, or profile picture, please update
          them in your OAuth provider settings (GitHub or Google).
        </p>
      </div>
    </div>
  );
}
