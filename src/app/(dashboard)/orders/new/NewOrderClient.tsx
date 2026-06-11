'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { purchaseOrderSchema, PurchaseOrderInput } from '@/schemas/order';
import { useFetch } from '@/hooks/useFetch';
import { PageHeader } from '@/components/ui/PageHeader';
import { Plus, Trash2 } from 'lucide-react';

interface Supplier  { _id: string; name: string; }
interface Warehouse { _id: string; name: string; }
interface Variant   { _id: string; sku: string; product: { name: string } | null; }

export function NewOrderClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  const { data: suppliers  } = useFetch<Supplier[]>('/api/suppliers');
  const { data: warehouses } = useFetch<Warehouse[]>('/api/warehouses');
  const { data: variantsRes } = useFetch<{ products: Variant[] }>('/api/products?limit=200');

  const variants = variantsRes?.products ?? [];

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PurchaseOrderInput>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      items: [{ variant: '', quantityOrdered: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  async function onSubmit(values: PurchaseOrderInput) {
    setLoading(true);
    setError(null);

    const res = await fetch('/api/orders', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(values),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Erreur lors de la création');
      setLoading(false);
      return;
    }

    router.push('/orders');
    router.refresh();
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Nouveau bon de commande"
        description="Créer une commande fournisseur"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wider">
            Informations générales
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Fournisseur <span className="text-red-400">*</span>
              </label>
              <select
                {...register('supplier')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner</option>
                {suppliers?.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
              {errors.supplier && (
                <p className="text-red-400 text-xs mt-1">{errors.supplier.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Entrepôt de réception <span className="text-red-400">*</span>
              </label>
              <select
                {...register('warehouse')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner</option>
                {warehouses?.map((w) => (
                  <option key={w._id} value={w._id}>{w.name}</option>
                ))}
              </select>
              {errors.warehouse && (
                <p className="text-red-400 text-xs mt-1">{errors.warehouse.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Référence interne
              </label>
              <input
                {...register('reference')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="BC-2024-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Réf. fournisseur
              </label>
              <input
                {...register('supplierRef')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Livraison prévue
              </label>
              <input
                {...register('expectedAt')}
                type="date"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Notes</label>
              <textarea
                {...register('notes')}
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
            <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Articles</h2>
            <button
              type="button"
              onClick={() => append({ variant: '', quantityOrdered: 1, unitPrice: 0 })}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Plus size={13} />
              Ajouter un article
            </button>
          </div>

          <div className="divide-y divide-gray-800">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 grid grid-cols-12 gap-3 items-end">
                <div className="col-span-5">
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Variante <span className="text-red-400">*</span>
                  </label>
                  <select
                    {...register(`items.${index}.variant`)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner</option>
                    {variants.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.product?.name ?? '—'} — {v.sku}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Quantité <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register(`items.${index}.quantityOrdered`, { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-3">
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Prix unitaire <span className="text-red-400">*</span>
                  </label>
                  <input
                    {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.01"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-1 flex justify-end">
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2.5 text-sm text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {loading ? 'Enregistrement...' : 'Créer le bon de commande'}
          </button>
        </div>
      </form>
    </div>
  );
}