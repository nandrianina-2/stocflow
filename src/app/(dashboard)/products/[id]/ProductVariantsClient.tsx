'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productVariantSchema, ProductVariantInput } from '@/schemas/product';

interface Variant {
  _id:        string;
  sku:        string;
  unit:       string;
  costPrice:  number;
  sellPrice:  number;
  barcode:    string;
  isActive:   boolean;
  attributes: Record<string, string>;
}

export function ProductVariantsClient({ productId }: { productId: string }) {
  const [showForm, setShowForm] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);

  const { data: variants, refetch } = useFetch<Variant[]>(`/api/products/${productId}/variants`);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ProductVariantInput>({
    resolver: zodResolver(productVariantSchema),
    defaultValues: { costPrice: 0, sellPrice: 0, unit: 'pièce', isActive: true },
  });

  async function onSubmit(values: ProductVariantInput) {
    setLoading(true);
    setError(null);

    const res = await fetch(`/api/products/${productId}/variants`, {
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

    reset();
    setShowForm(false);
    refetch();
    setLoading(false);
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
        <h2 className="text-sm font-medium text-white">Variantes</h2>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
        >
          {showForm ? <X size={13} /> : <Plus size={13} />}
          {showForm ? 'Annuler' : 'Ajouter une variante'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 border-b border-gray-800 bg-gray-800/40">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">SKU *</label>
              <input
                {...register('sku')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SKU-001-BLU"
              />
              {errors.sku && <p className="text-red-400 text-xs mt-1">{errors.sku.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Prix de revient</label>
              <input
                {...register('costPrice', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Prix de vente</label>
              <input
                {...register('sellPrice', { valueAsNumber: true })}
                type="number"
                step="0.01"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Unité</label>
              <input
                {...register('unit')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="pièce"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Code-barres</label>
              <input
                {...register('barcode')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors"
          >
            {loading ? 'Enregistrement...' : 'Ajouter la variante'}
          </button>
        </form>
      )}

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b border-gray-800">
            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Unité</th>
            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Prix revient</th>
            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Prix vente</th>
            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Code-barres</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {!variants || variants.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500 text-sm">
                Aucune variante — ajoutez-en une pour gérer le stock
              </td>
            </tr>
          ) : (
            variants.map((v) => (
              <tr key={v._id} className="hover:bg-gray-800/40 transition-colors">
                <td className="px-4 py-3 text-white font-mono text-xs">{v.sku}</td>
                <td className="px-4 py-3 text-gray-400">{v.unit}</td>
                <td className="px-4 py-3 text-gray-400">{v.costPrice.toLocaleString('fr-FR')} Ar</td>
                <td className="px-4 py-3 text-gray-400">{v.sellPrice.toLocaleString('fr-FR')} Ar</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{v.barcode ?? '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}