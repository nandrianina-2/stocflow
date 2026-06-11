'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Plus, ChevronDown, ChevronRight, MapPin } from 'lucide-react';

interface Location {
  _id:  string;
  code: string;
  name: string;
  type: string;
}

interface Warehouse {
  _id:     string;
  name:    string;
  code:    string;
  address: string;
}

function WarehouseRow({ warehouse }: { warehouse: Warehouse }) {
  const [expanded,     setExpanded]     = useState(false);
  const [showLocForm,  setShowLocForm]  = useState(false);
  const [locCode,      setLocCode]      = useState('');
  const [locName,      setLocName]      = useState('');
  const [locType,      setLocType]      = useState('bin');
  const [savingLoc,    setSavingLoc]    = useState(false);

  const { data: locations, refetch } = useFetch<Location[]>(
    expanded ? `/api/warehouses/${warehouse._id}/locations` : '',
    [expanded]
  );

  async function addLocation() {
    if (!locCode) return;
    setSavingLoc(true);
    await fetch(`/api/warehouses/${warehouse._id}/locations`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ code: locCode, name: locName, type: locType }),
    });
    setLocCode('');
    setLocName('');
    setShowLocForm(false);
    setSavingLoc(false);
    refetch();
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-800/50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          {expanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
          <div>
            <p className="text-white font-medium text-sm">{warehouse.name}</p>
            <p className="text-xs text-gray-500 font-mono">{warehouse.code}</p>
          </div>
        </div>
        {warehouse.address && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <MapPin size={12} />
            {warehouse.address}
          </div>
        )}
      </div>

      {expanded && (
        <div className="border-t border-gray-800">
          <div className="flex items-center justify-between px-5 py-3 bg-gray-800/30">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Emplacements</p>
            <button
              onClick={(e) => { e.stopPropagation(); setShowLocForm((v) => !v); }}
              className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              <Plus size={12} />
              Ajouter
            </button>
          </div>

          {showLocForm && (
            <div className="px-5 py-4 border-b border-gray-800 bg-gray-800/20">
              <div className="grid grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Code *</label>
                  <input
                    value={locCode}
                    onChange={(e) => setLocCode(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="A-01-01"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Nom</label>
                  <input
                    value={locName}
                    onChange={(e) => setLocName(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Allée A, Bac 1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Type</label>
                  <select
                    value={locType}
                    onChange={(e) => setLocType(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="zone">Zone</option>
                    <option value="aisle">Allée</option>
                    <option value="shelf">Étagère</option>
                    <option value="bin">Bac</option>
                  </select>
                </div>
                <button
                  onClick={addLocation}
                  disabled={savingLoc || !locCode}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors"
                >
                  {savingLoc ? 'Ajout...' : 'Ajouter'}
                </button>
              </div>
            </div>
          )}

          {!locations || locations.length === 0 ? (
            <p className="px-5 py-6 text-sm text-gray-500 text-center">
              Aucun emplacement — ajoutez-en un pour gérer le stock
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                  <th className="px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-5 py-2.5 text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {locations.map((loc) => (
                  <tr key={loc._id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-white">{loc.code}</td>
                    <td className="px-5 py-3 text-gray-400">{loc.name || '—'}</td>
                    <td className="px-5 py-3 text-gray-400 capitalize">{loc.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

export function WarehousesClient() {
  const [showForm,  setShowForm]  = useState(false);
  const [name,      setName]      = useState('');
  const [code,      setCode]      = useState('');
  const [address,   setAddress]   = useState('');
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const { data: warehouses, refetch } = useFetch<Warehouse[]>('/api/warehouses');

  async function handleCreate() {
    if (!name || !code) { setError('Nom et code obligatoires'); return; }
    setSaving(true);
    setError(null);

    const res = await fetch('/api/warehouses', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, code: code.toUpperCase(), address }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Erreur lors de la création');
      setSaving(false);
      return;
    }

    setName('');
    setCode('');
    setAddress('');
    setShowForm(false);
    setSaving(false);
    refetch();
  }

  return (
    <div>
      <PageHeader
        title="Entrepôts"
        description={`${warehouses?.length ?? 0} entrepôts`}
        action={
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={15} />
            Nouvel entrepôt
          </button>
        }
      />

      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Créer un entrepôt</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Nom *</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entrepôt Central"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Code *</label>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="WH-CENTRAL"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Adresse</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Antananarivo"
              />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors"
            >
              {saving ? 'Création...' : 'Créer'}
            </button>
            <button
              onClick={() => { setShowForm(false); setError(null); }}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {!warehouses || warehouses.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-12 text-center">
            <p className="text-gray-500 text-sm">Aucun entrepôt — créez-en un pour commencer</p>
          </div>
        ) : (
          warehouses.map((w) => <WarehouseRow key={w._id} warehouse={w} />)
        )}
      </div>
    </div>
  );
}