import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function Home() {
  const session = await auth();
  
  if (session?.user) {
    redirect('/dashboard');
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="mx-auto max-w-md text-center space-y-8 p-8">
        <div className="flex justify-center">
          <img
            src="/assets/HeavyInspect.png"
            alt="HeavyInspect Logo"
            className="h-auto w-48 object-contain bg-white p-2 rounded-2xl shadow-lg shadow-blue-600/30 ring-2 ring-white/20"
          />
        </div>

        <div className="space-y-3">
          <h1 className="text-4xl font-bold text-white tracking-tight">
            HeavyInspect
          </h1>
          <p className="text-lg text-gray-400">
            P2H Digital Inspection System
          </p>
          <p className="text-sm text-gray-500">
            TRPAB Heavy Equipment Division
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-4">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Sign In
          </Link>
        </div>

        <div className="pt-8 border-t border-gray-800">
          <p className="text-xs text-gray-600">
            Digital inspection platform for heavy equipment maintenance
          </p>
        </div>
      </div>
    </main>
  );
}
