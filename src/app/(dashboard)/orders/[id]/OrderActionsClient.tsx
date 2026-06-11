'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFetch } from '@/hooks/useFetch';
import { PackageCheck } from 'lucide-react';

interface OrderItem {
  _id:              string;
  quantityOrdered:  number;
  quantityReceived: number;
  variant: { sku: string; product: { name: string } | null } | null;
}

interface Location { _id: string; code: string; name: string; }

interface OrderActionsClientProps {
  orderId:     string;
  warehouseId: string;
  items:       OrderItem[];
}

export function OrderActionsClient({ orderId, warehouseId, items }: OrderActionsClientProps) {
  const router   = useRouter();
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>(
    Object.fromEntries(items.map((i) => [i._id, i.quantityOrdered - i.quantityReceived]))
  );

  const { data: locations } = useFetch<Location[]>(
    warehouseId ? `/api/warehouses/${warehouseId}/locations` : '',
    [warehouseId]
  );

  async function handleReceive() {
    if (!location) { setError('Sélectionnez un emplacement de réception'); return; }

    setLoading(true);
    setError(null);

    const payload = {
      locationId: location,
      items: items
        .filter((i) => quantities[i._id] > 0)
        .map((i) => ({ itemId: i._id, quantityReceived: quantities[i._id] })),
    };

    const res = await fetch(`/api/orders/${orderId}/receive`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Erreur lors de la réception');
      setLoading(false);
      return;
    }

    router.refresh();
    setOpen(false);
    setLoading(false);
  }

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
      >
        <PackageCheck size={15} />
        Réceptionner la commande
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <div className="relative bg-gray-900 border border-gray-800 rounded-xl w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h3 className="text-base font-semibold text-white">Réceptionner la commande</h3>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Emplacement de dépôt <span className="text-red-400">*</span>
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner un emplacement</option>
                  {locations?.map((l) => (
                    <option key={l._id} value={l._id}>{l.code} {l.name ? `— ${l.name}` : ''}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-300">Quantités reçues</p>
                {items.map((item) => {
                  const remaining = item.quantityOrdered - item.quantityReceived;
                  if (remaining <= 0) return null;
                  return (
                    <div key={item._id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-white">{item.variant?.product?.name ?? '—'}</p>
                        <p className="text-xs text-gray-500 font-mono">{item.variant?.sku ?? '—'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">max {remaining}</span>
                        <input
                          type="number"
                          min="0"
                          max={remaining}
                          value={quantities[item._id] ?? 0}
                          onChange={(e) =>
                            setQuantities((prev) => ({
                              ...prev,
                              [item._id]: Math.min(remaining, Math.max(0, parseInt(e.target.value) || 0)),
                            }))
                          }
                          className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-white text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-800">
              <button
                onClick={() => setOpen(false)}
                disabled={loading}
                className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleReceive}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded-lg transition-colors"
              >
                {loading ? 'Enregistrement...' : 'Confirmer la réception'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}