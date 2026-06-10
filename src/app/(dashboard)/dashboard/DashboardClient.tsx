'use client';

import { useFetch } from '@/hooks/useFetch';
import { StatsCard } from '@/components/ui/StatsCard';
import { Package, BarChart3, ArrowLeftRight, Bell, AlertTriangle } from 'lucide-react';

interface DashboardStats {
  totalProducts:    number;
  totalStockValue:  number;
  movementsToday:   number;
  unresolvedAlerts: number;
  lowStockCount:    number;
}

export function DashboardClient({ userName }: { userName: string }) {
  const { data, loading } = useFetch<DashboardStats>('/api/dashboard/stats');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-white">
          Bonjour, {userName}
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Vue d&apos;ensemble de votre inventaire
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Produits actifs"
            value={data?.totalProducts ?? 0}
            icon={Package}
            color="blue"
          />
          <StatsCard
            label="Valeur du stock"
            value={`${(data?.totalStockValue ?? 0).toLocaleString('fr-FR')} Ar`}
            icon={BarChart3}
            color="green"
          />
          <StatsCard
            label="Mouvements aujourd'hui"
            value={data?.movementsToday ?? 0}
            icon={ArrowLeftRight}
            color="yellow"
          />
          <StatsCard
            label="Alertes non résolues"
            value={data?.unresolvedAlerts ?? 0}
            icon={Bell}
            color="red"
          />
          <StatsCard
            label="Produits en stock bas"
            value={data?.lowStockCount ?? 0}
            icon={AlertTriangle}
            color="red"
          />
        </div>
      )}
    </div>
  );
}