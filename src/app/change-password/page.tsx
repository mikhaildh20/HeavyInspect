import { changePassword } from '@/app/actions/auth';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function ChangePasswordPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  async function handleSubmit(formData: FormData) {
    'use server';
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      throw new Error('Password tidak cocok');
    }
    if (newPassword.length < 8) {
      throw new Error('Password minimal 8 karakter');
    }

    await changePassword(session!.user!.id!, newPassword);
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h1 className="text-xl font-bold text-white mb-2">Ubah Password</h1>
        <p className="text-sm text-gray-400 mb-6">Anda harus mengubah password sebelum melanjutkan.</p>
        <form action={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password Baru</label>
            <input
              type="password"
              name="newPassword"
              required
              minLength={8}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Konfirmasi Password</label>
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={8}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-primary text-black rounded-lg font-bold hover:bg-primary/90 transition-colors"
          >
            Simpan & Lanjutkan
          </button>
        </form>
      </div>
    </main>
  );
}
