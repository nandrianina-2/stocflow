'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
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
  physical:     { label: 'Physique',       variant: 'info'    },
  raw_material: { label: 'Matière première', variant: 'warning' },
  equipment:    { label: 'Équipement',     variant: 'success' },
};

export function ProductsClient() {
  const [search,  setSearch]  = useState('');
  const [page,    setPage]    = useState(1);
  const [confirm, setConfirm] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [deleting, setDeleting] = useState(false);

  const params   = new URLSearchParams({ page: String(page), limit: '20', ...(search && { search }) });
  const { data, loading, refetch } = useFetch<ProductsResponse>(`/api/products?${params}`, [page, search]);

  async function handleDelete() {
    setDeleting(true);
    await fetch(`/api/products/${confirm.id}`, { method: 'DELETE' });
    setDeleting(false);
    setConfirm({ open: false, id: '' });
    refetch();
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

      <div className="mb-4 relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Rechercher par nom ou SKU..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full max-w-sm bg-gray-900 border border-gray-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
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
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 bg-gray-800 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-gray-500">
                  Aucun produit trouvé
                </td>
              </tr>
            ) : (
              data?.products.map((product) => {
                const typeInfo = typeLabels[product.type];
                return (
                  <tr key={product._id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/products/${product._id}`} className="text-white hover:text-blue-400 font-medium transition-colors">
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
                          onClick={() => setConfirm({ open: true, id: product._id })}
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
            <p className="text-xs text-gray-500">
              Page {data.page} sur {data.pages}
            </p>
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
        title="Désactiver le produit"
        message="Ce produit sera désactivé et n'apparaîtra plus dans le catalogue."
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: '' })}
        loading={deleting}
        danger
      />
    </div>
  );
}