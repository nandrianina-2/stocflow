'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFetch } from '@/hooks/useFetch';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Plus } from 'lucide-react';

interface PurchaseOrder {
  _id:        string;
  reference:  string;
  status:     string;
  expectedAt: string;
  createdAt:  string;
  supplier:   { name: string } | null;
  warehouse:  { name: string; code: string } | null;
  createdBy:  { name: string } | null;
}

interface OrdersResponse {
  orders: PurchaseOrder[];
  total:  number;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'info' | 'warning' | 'success' | 'danger' }> = {
  draft:     { label: 'Brouillon',    variant: 'default'  },
  sent:      { label: 'Envoyé',       variant: 'info'     },
  partial:   { label: 'Partiel',      variant: 'warning'  },
  received:  { label: 'Réceptionné',  variant: 'success'  },
  cancelled: { label: 'Annulé',       variant: 'danger'   },
};

export function OrdersClient() {
  const [page,         setPage]         = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const params = new URLSearchParams({ page: String(page), limit: '20' });
  if (statusFilter) params.set('status', statusFilter);

  const { data, loading } = useFetch<OrdersResponse>(`/api/orders?${params}`, [page, statusFilter]);

  return (
    <div>
      <PageHeader
        title="Bons de commande"
        description={`${data?.total ?? 0} commandes au total`}
        action={
          <Link
            href="/orders/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} />
            Nouveau bon de commande
          </Link>
        }
      />

      <div className="mb-4">
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(statusConfig).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Entrepôt</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Livraison prévue</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Créé par</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 8 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-800 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : !data?.orders.length ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                  Aucun bon de commande
                </td>
              </tr>
            ) : (
              data.orders.map((order) => {
                const statusInfo = statusConfig[order.status];
                return (
                  <tr key={order._id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-300">
                      {order.reference ?? order._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3 text-white">{order.supplier?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{order.warehouse?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <Badge
                        label={statusInfo?.label ?? order.status}
                        variant={statusInfo?.variant ?? 'default'}
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {order.expectedAt
                        ? new Date(order.expectedAt).toLocaleDateString('fr-FR')
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400">{order.createdBy?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/orders/${order._id}`}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {data && data.total > 20 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <p className="text-xs text-gray-500">Page {page}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-40 transition-colors"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={data.orders.length < 20}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-40 transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}