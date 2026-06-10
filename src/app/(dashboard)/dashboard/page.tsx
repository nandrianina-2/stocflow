import { auth } from '@/lib/auth';
import { DashboardClient } from './DashboardClient';

export const metadata = { title: 'Dashboard — StockFlow' };

export default async function DashboardPage() {
  const session = await auth();
  return <DashboardClient userName={session?.user.name ?? 'Utilisateur'} />;
}