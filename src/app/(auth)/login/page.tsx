import LoginForm from './login-form';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="relative mx-auto flex w-full max-w-[420px] flex-col space-y-4 p-4">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center gap-3 mb-2">
          <img
            src="/assets/HeavyInspect.png"
            alt="HeavyInspect Logo"
            className="h-auto w-40 object-contain bg-white p-2 rounded-2xl shadow-lg shadow-blue-600/30 ring-2 ring-white/20"
          />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              HeavyInspect
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Sistem Inspeksi P2H Digital
            </p>
          </div>
        </div>

        {/* Login Form */}
        <Suspense
          fallback={
            <div className="h-80 rounded-xl bg-white/5 animate-pulse backdrop-blur-sm" />
          }
        >
          <LoginForm />
        </Suspense>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-2">
          TRPAB Heavy Equipment Division
        </p>
      </div>
    </main>
  );
}
