'use client';

import { useActionState } from 'react';
import { authenticate } from './actions';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginForm() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined,
  );
  
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('from') || '/dashboard';

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="space-y-3">
        <div className="rounded-xl bg-white px-6 pb-6 pt-8 shadow-lg dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
          <div className="mb-6 text-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Welcome Back
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Sign in to your account
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                htmlFor="username"
              >
                Username
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400"
                id="username"
                type="text"
                name="username"
                placeholder="Enter your username"
                required
                autoComplete="username"
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900 placeholder-gray-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:placeholder-gray-500 dark:focus:border-blue-400"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
                autoComplete="current-password"
              />
            </div>
          </div>

          <input type="hidden" name="redirectTo" value={callbackUrl} />

          <button
            className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed dark:focus:ring-offset-gray-800"
            aria-disabled={isPending}
            disabled={isPending}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          {errorMessage && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {errorMessage}
              </p>
            </div>
          )}
        </div>
      </form>

    </div>
  );
}
