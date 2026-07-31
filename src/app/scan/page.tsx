import { ScannerView } from '@/components/scan/ScannerView';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function ScanPage() {
  const session = await auth();
  if (session?.user?.role !== 'operator') {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center relative">
      <ScannerView />
    </main>
  );
}
