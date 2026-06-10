'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { PageHeader } from '@/components/ui/PageHeader';
import { StockBadge } from '@/components/ui/StockBadge';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface StockLevel {
  _id:          string;
  quantity:     number;
  reserved:     number;
  minThreshold: number;
  variant: {
    _id:      string;
    sku:      string;
    unit:     string;
    product:  { name: string; sku: string } | null;
  } | null;
  location: {
    code:      string;
    name:      string;
    warehouse: { name: string; code: string } | null;
  } | null;
}

interface Warehouse { _id: string; name: string; code: string; }

export function StockClient() {
  const [warehouseFilter, setWarehouseFilter] = useState('');

  const params = new URLSearchParams();
  if (warehouseFilter) params.set('warehouse', warehouseFilter);

  const { data: levels,     loading }    = useFetch<StockLevel[]>(`/api/stock?${params}`, [warehouseFilter]);
  const { data: warehouses }             = useFetch<Warehouse[]>('/api/warehouses');

  function exportExcel() {
    if (!levels) return;
    const rows = levels.map((l) => ({
      Produit:    l.variant?.product?.name ?? '—',
      SKU:        l.variant?.sku ?? '—',
      Entrepôt:   l.location?.warehouse?.name ?? '—',
      Emplacement: l.location?.code ?? '—',
      Quantité:   l.quantity,
      Réservé:    l.reserved,
      Disponible: l.quantity - l.reserved,
      Seuil:      l.minThreshold,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Stock');
    XLSX.writeFile(wb, 'stock.xlsx');
  }

  return (
    <div>
      <PageHeader
        title="Niveaux de stock"
        description={`${levels?.length ?? 0} entrées`}
        action={
          <button
            onClick={exportExcel}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Download size={14} />
            Exporter Excel
          </button>
        }
      />

      <div className="mb-4">
        <select
          value={warehouseFilter}
          onChange={(e) => setWarehouseFilter(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Tous les entrepôts</option>
          {warehouses?.map((w) => (
            <option key={w._id} value={w._id}>{w.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Entrepôt</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Emplacement</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Disponible</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
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
            ) : !levels || levels.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                  Aucun stock enregistré
                </td>
              </tr>
            ) : (
              levels.map((level) => (
                <tr key={level._id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 text-white">{level.variant?.product?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{level.variant?.sku ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{level.location?.warehouse?.name ?? '—'}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{level.location?.code ?? '—'}</td>
                  <td className="px-4 py-3 text-white font-medium">{level.quantity}</td>
                  <td className="px-4 py-3 text-gray-400">{level.quantity - level.reserved}</td>
                  <td className="px-4 py-3">
                    <StockBadge quantity={level.quantity} minThreshold={level.minThreshold} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}