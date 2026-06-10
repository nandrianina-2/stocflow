'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { movementSchema, MovementInput } from '@/schemas/movement';
import { useFetch } from '@/hooks/useFetch';
import { PageHeader } from '@/components/ui/PageHeader';
import { Plus, Trash2 } from 'lucide-react';

interface Variant {
  _id: string;
  sku: string;
  product: { name: string } | null;
}

interface Location {
  _id:  string;
  code: string;
  name: string;
}

interface Warehouse { _id: string; name: string; }

export function NewMovementClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');

  const { data: warehouses } = useFetch<Warehouse[]>('/api/warehouses');
  const { data: locations }  = useFetch<Location[]>(
    selectedWarehouse ? `/api/warehouses/${selectedWarehouse}/locations` : '',
    [selectedWarehouse]
  );

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<MovementInput>({
    resolver: zodResolver(movementSchema),
    defaultValues: { type: 'entry', items: [{ variant: '', quantity: 1 }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const movementType = watch('type');

  const { data: allVariants } = useFetch<Variant[]>('/api/products?limit=200');

  async function onSubmit(values: MovementInput) {
    setLoading(true);
    setError(null);

    const res = await fetch('/api/movements', {
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

    const movement = await res.json();

    const confirmRes = await fetch(`/api/movements/${movement._id}/confirm`, { method: 'POST' });

    if (!confirmRes.ok) {
      setError('Mouvement créé mais non confirmé — vérifiez les niveaux de stock.');
      setLoading(false);
      return;
    }

    router.push('/movements');
    router.refresh();
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Nouveau mouvement"
        description="Créer et confirmer un mouvement de stock"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="text-sm font-medium text-gray-300 uppercase tracking-wider">Informations</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Type *</label>
              <select
                {...register('type')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="entry">Entrée</option>
                <option value="exit">Sortie</option>
                <option value="transfer">Transfert</option>
                <option value="adjustment">Ajustement</option>
                <option value="return">Retour</option>
                <option value="loss">Perte</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Référence</label>
              <input
                {...register('reference')}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: BON-2024-001"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Entrepôt</label>
              <select
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner un entrepôt</option>
                {warehouses?.map((w) => (
                  <option key={w._id} value={w._id}>{w.name}</option>
                ))}
              </select>
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
              onClick={() => append({ variant: '', quantity: 1 })}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Plus size={13} />
              Ajouter un article
            </button>
          </div>

          <div className="divide-y divide-gray-800">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 grid grid-cols-12 gap-3 items-end">
                <div className="col-span-4">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Variante *</label>
                  <select
                    {...register(`items.${index}.variant`)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Sélectionner</option>
                    {(allVariants as any)?.products?.map((p: any) => (
                      <option key={p._id} value={p._id}>{p.name} — {p.sku}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-400 mb-1">Quantité *</label>
                  <input
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    type="number"
                    min="1"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {(movementType === 'exit' || movementType === 'transfer') && (
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Depuis</label>
                    <select
                      {...register(`items.${index}.fromLocation`)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Emplacement</option>
                      {locations?.map((l) => (
                        <option key={l._id} value={l._id}>{l.code}</option>
                      ))}
                    </select>
                  </div>
                )}

                {(movementType === 'entry' || movementType === 'transfer') && (
                  <div className="col-span-3">
                    <label className="block text-xs font-medium text-gray-400 mb-1">Vers</label>
                    <select
                      {...register(`items.${index}.toLocation`)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Emplacement</option>
                      {locations?.map((l) => (
                        <option key={l._id} value={l._id}>{l.code}</option>
                      ))}
                    </select>
                  </div>
                )}

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
            {loading ? 'Enregistrement...' : 'Créer et confirmer'}
          </button>
        </div>
      </form>
    </div>
  );
}