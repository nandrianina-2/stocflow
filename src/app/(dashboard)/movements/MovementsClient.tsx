'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useFetch } from '@/hooks/useFetch';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { Plus } from 'lucide-react';

interface Movement {
  _id:         string;
  type:        string;
  status:      string;
  reference:   string;
  date:        string;
  createdAt:   string;
  createdBy:   { name: string } | null;
  confirmedBy: { name: string } | null;
}

interface MovementsResponse {
  movements: Movement[];
  total:     number;
}

const typeLabels: Record<string, { label: string; variant: 'info' | 'success' | 'warning' | 'danger' | 'default' }> = {
  entry:      { label: 'Entrée',      variant: 'success' },
  exit:       { label: 'Sortie',      variant: 'danger'  },
  transfer:   { label: 'Transfert',   variant: 'info'    },
  adjustment: { label: 'Ajustement',  variant: 'warning' },
  return:     { label: 'Retour',      variant: 'info'    },
  loss:       { label: 'Perte',       variant: 'danger'  },
};

const statusLabels: Record<string, { label: string; variant: 'default' | 'success' | 'danger' | 'warning' }> = {
  draft:     { label: 'Brouillon',  variant: 'default'  },
  confirmed: { label: 'Confirmé',   variant: 'success'  },
  cancelled: { label: 'Annulé',     variant: 'danger'   },
};

export function MovementsClient() {
  const [page,         setPage]         = useState(1);
  const [typeFilter,   setTypeFilter]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const params = new URLSearchParams({ page: String(page), limit: '20' });
  if (typeFilter)   params.set('type',   typeFilter);
  if (statusFilter) params.set('status', statusFilter);

  const { data, loading } = useFetch<MovementsResponse>(`/api/movements?${params}`, [page, typeFilter, statusFilter]);

  return (
    <div>
      <PageHeader
        title="Mouvements de stock"
        description={`${data?.total ?? 0} mouvements`}
        action={
          <Link
            href="/movements/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} />
            Nouveau mouvement
          </Link>
        }
      />

      <div className="flex gap-3 mb-4">
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
          className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les types</option>
          {Object.entries(typeLabels).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(statusLabels).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Créé par</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-800 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : !data?.movements.length ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  Aucun mouvement enregistré
                </td>
              </tr>
            ) : (
              data.movements.map((m) => {
                const typeInfo   = typeLabels[m.type];
                const statusInfo = statusLabels[m.status];
                return (
                  <tr key={m._id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 text-gray-300 font-mono text-xs">
                      {m.reference ?? m._id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={typeInfo?.label ?? m.type} variant={typeInfo?.variant ?? 'default'} />
                    </td>
                    <td className="px-4 py-3">
                      <Badge label={statusInfo?.label ?? m.status} variant={statusInfo?.variant ?? 'default'} />
                    </td>
                    <td className="px-4 py-3 text-gray-400">{m.createdBy?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400">
                      {new Date(m.createdAt).toLocaleDateString('fr-FR')}
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
                disabled={data.movements.length < 20}
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