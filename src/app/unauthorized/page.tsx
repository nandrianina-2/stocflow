import Link from 'next/link';

export const metadata = { title: 'Accès refusé — StockFlow' };

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-5xl font-bold text-white">403</p>
        <p className="text-gray-400 mt-3">Vous n&apos;avez pas les permissions nécessaires.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block text-sm text-blue-400 hover:text-blue-300 transition"
        >
          Retour au dashboard
        </Link>
      </div>
    </div>
  );
}