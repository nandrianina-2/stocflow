'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, AlertTriangle, Plus, X } from 'lucide-react';

interface AlertLog {
  _id:         string;
  message:     string;
  triggeredAt: string;
  resolved:    boolean;
  rule: {
    metric:   string;
    threshold: number;
    product:   { name: string; sku: string } | null;
    warehouse: { name: string } | null;
  } | null;
}

interface AlertRule {
  _id:      string;
  metric:   string;
  threshold: number;
  isActive:  boolean;
  product:   { name: string; sku: string } | null;
  warehouse: { name: string } | null;
}

interface Product   { _id: string; name: string; sku: string; }
interface Warehouse { _id: string; name: string; }

const metricLabels: Record<string, string> = {
  low_stock:  'Stock bas',
  overstock:  'Surstock',
  expiry:     'Expiration',
};

export function AlertsClient() {
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [product,      setProduct]      = useState('');
  const [warehouse,    setWarehouse]    = useState('');
  const [metric,       setMetric]       = useState('low_stock');
  const [threshold,    setThreshold]    = useState('0');
  const [saving,       setSaving]       = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  const { data: logs,     refetch: refetchLogs  } = useFetch<AlertLog[]>('/api/alerts/logs');
  const { data: rules,    refetch: refetchRules } = useFetch<AlertRule[]>('/api/alerts/rules');
  const { data: products }                         = useFetch<{ products: Product[] }>('/api/products?limit=200');
  const { data: warehouses }                       = useFetch<Warehouse[]>('/api/warehouses');

  async function resolveLog(id: string) {
    await fetch('/api/alerts/logs', {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ id }),
    });
    refetchLogs();
  }

  async function createRule() {
    if (!product) { setError('Produit obligatoire'); return; }
    setSaving(true);
    setError(null);

    const res = await fetch('/api/alerts/rules', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({
        product,
        warehouse: warehouse || null,
        metric,
        threshold: parseFloat(threshold),
      }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Erreur lors de la création');
      setSaving(false);
      return;
    }

    setProduct('');
    setWarehouse('');
    setMetric('low_stock');
    setThreshold('0');
    setShowRuleForm(false);
    setSaving(false);
    refetchRules();
  }

  return (
    <div className="space-y-8">
      <div>
        <PageHeader
          title="Alertes"
          description="Surveillance des niveaux de stock et règles d'alerte"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Alertes actives</h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {logs?.length ?? 0} alerte{(logs?.length ?? 0) > 1 ? 's' : ''} non résolue{(logs?.length ?? 0) > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {!logs || logs.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <CheckCircle size={32} className="text-green-400 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Aucune alerte active</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Entrepôt</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Déclenchée</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white text-sm">{log.rule?.product?.name ?? '—'}</p>
                      <p className="text-gray-500 text-xs font-mono">{log.rule?.product?.sku ?? ''}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{log.rule?.warehouse?.name ?? 'Tous'}</td>
                    <td className="px-4 py-3">
                      <Badge
                        label={metricLabels[log.rule?.metric ?? ''] ?? log.rule?.metric ?? '—'}
                        variant="warning"
                      />
                    </td>
                    <td className="px-4 py-3 text-gray-400 max-w-xs truncate">{log.message}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {new Date(log.triggeredAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => resolveLog(log._id)}
                        className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 transition-colors"
                      >
                        <CheckCircle size={13} />
                        Résoudre
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-white">Règles d&apos;alerte</h2>
            <p className="text-sm text-gray-400 mt-0.5">{rules?.length ?? 0} règle{(rules?.length ?? 0) > 1 ? 's' : ''} configurée{(rules?.length ?? 0) > 1 ? 's' : ''}</p>
          </div>
          <button
            onClick={() => setShowRuleForm((v) => !v)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            {showRuleForm ? <X size={14} /> : <Plus size={14} />}
            {showRuleForm ? 'Annuler' : 'Nouvelle règle'}
          </button>
        </div>

        {showRuleForm && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Produit *</label>
                <select
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner</option>
                  {products?.products.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Entrepôt</label>
                <select
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Tous les entrepôts</option>
                  {warehouses?.map((w) => (
                    <option key={w._id} value={w._id}>{w.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Métrique</label>
                <select
                  value={metric}
                  onChange={(e) => setMetric(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low_stock">Stock bas</option>
                  <option value="overstock">Surstock</option>
                  <option value="expiry">Expiration</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1">Seuil</label>
                <input
                  type="number"
                  min="0"
                  value={threshold}
                  onChange={(e) => setThreshold(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
            <button
              onClick={createRule}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors"
            >
              {saving ? 'Enregistrement...' : 'Créer la règle'}
            </button>
          </div>
        )}

        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          {!rules || rules.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <AlertTriangle size={32} className="text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500">Aucune règle configurée</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Produit</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Entrepôt</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Métrique</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Seuil</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {rules.map((rule) => (
                  <tr key={rule._id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-white">{rule.product?.name ?? '—'}</p>
                      <p className="text-gray-500 text-xs font-mono">{rule.product?.sku ?? ''}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{rule.warehouse?.name ?? 'Tous'}</td>
                    <td className="px-4 py-3">
                      <Badge label={metricLabels[rule.metric] ?? rule.metric} variant="info" />
                    </td>
                    <td className="px-4 py-3 text-white font-medium">{rule.threshold}</td>
                    <td className="px-4 py-3">
                      <Badge
                        label={rule.isActive ? 'Active' : 'Inactive'}
                        variant={rule.isActive ? 'success' : 'default'}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}