'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { useSelection } from '@/hooks/useSelection';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Plus, Search, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Product {
  _id:      string;
  name:     string;
  sku:      string;
  type:     string;
  isActive: boolean;
  category: { name: string } | null;
  supplier: { name: string } | null;
}

interface ProductsResponse {
  products: Product[];
  total:    number;
  pages:    number;
  page:     number;
}

const typeLabels: Record<string, { label: string; variant: 'info' | 'success' | 'warning' }> = {
  physical:     { label: 'Physique',         variant: 'info'    },
  raw_material: { label: 'Matière première', variant: 'warning' },
  equipment:    { label: 'Équipement',       variant: 'success' },
};

export function ProductsClient() {
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);
  const [confirm,  setConfirm]  = useState<{ open: boolean; ids: string[]; single: boolean }>({
    open: false, ids: [], single: false,
  });
  const [deleting, setDeleting] = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const params = new URLSearchParams({ page: String(page), limit: '20', ...(search && { search }) });
  const { data, loading, refetch } = useFetch<ProductsResponse>(`/api/products?${params}`, [page, search]);

  const selection = useSelection(data?.products ?? null);

  async function handleDelete() {
    setDeleting(true);

    const url    = confirm.single ? `/api/products/${confirm.ids[0]}` : '/api/products/bulk-delete';
    const method = confirm.single ? 'DELETE' : 'POST';
    const body   = confirm.single ? undefined : JSON.stringify({ ids: confirm.ids });

    const res = await fetch(url, {
      method,
      headers: confirm.single ? undefined : { 'Content-Type': 'application/json' },
      body,
    });

    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? 'Erreur lors de la suppression');
    } else {
      selection.clear();
      refetch();
    }

    setDeleting(false);
    setConfirm({ open: false, ids: [], single: false });
  }

  return (
    <div>
      <PageHeader
        title="Produits"
        description={`${data?.total ?? 0} produits au total`}
        action={
          <Link
            href="/products/new"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} />
            Nouveau produit
          </Link>
        }
      />

      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Rechercher par nom ou SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-72 bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {selection.count > 0 && (
          <button
            onClick={() => setConfirm({ open: true, ids: selection.ids, single: false })}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Trash2 size={12} />
            Désactiver ({selection.count})
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={selection.isAllSelected}
                  onChange={selection.toggleAll}
                  className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                />
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-800 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.products.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                  Aucun produit trouvé
                </td>
              </tr>
            ) : (
              data?.products.map((product) => {
                const typeInfo = typeLabels[product.type];
                return (
                  <tr
                    key={product._id}
                    className={`hover:bg-gray-800/50 transition-colors ${selection.isSelected(product._id) ? 'bg-gray-800/30' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selection.isSelected(product._id)}
                        onChange={() => selection.toggle(product._id)}
                        className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/products/${product._id}`}
                        className="text-white hover:text-blue-400 font-medium transition-colors"
                      >
                        {product.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-400 font-mono text-xs">{product.sku}</td>
                    <td className="px-4 py-3">
                      <Badge label={typeInfo?.label ?? product.type} variant={typeInfo?.variant ?? 'default'} />
                    </td>
                    <td className="px-4 py-3 text-gray-400">{product.category?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-400">{product.supplier?.name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/products/${product._id}/edit`}
                          className="p-1.5 text-gray-500 hover:text-white hover:bg-gray-700 rounded transition-colors"
                        >
                          <Pencil size={13} />
                        </Link>
                        <button
                          onClick={() => setConfirm({ open: true, ids: [product._id], single: true })}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {data && data.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-800">
            <p className="text-xs text-gray-500">Page {data.page} sur {data.pages}</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-40 transition-colors"
              >
                Précédent
              </button>
              <button
                onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                disabled={page === data.pages}
                className="px-3 py-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded disabled:opacity-40 transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirm.open}
        title={confirm.single ? 'Désactiver le produit' : `Désactiver ${confirm.ids.length} produit(s)`}
        message={confirm.single
          ? 'Ce produit sera désactivé et n\'apparaîtra plus dans le catalogue.'
          : `Ces ${confirm.ids.length} produits seront désactivés.`
        }
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, ids: [], single: false })}
        loading={deleting}
        danger
      />
    </div>
  );
}