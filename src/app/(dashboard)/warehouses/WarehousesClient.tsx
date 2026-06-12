'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Plus, ChevronDown, ChevronRight, MapPin, Trash2 } from 'lucide-react';
import { useSelection } from '@/hooks/useSelection';
import {  } from 'lucide-react';

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

function WarehouseRow({ warehouse, onDelete }: { warehouse: Warehouse; onDelete: () => void }) {
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
        <div className="flex items-center gap-3">
          {warehouse.address && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin size={12} />
              {warehouse.address}
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
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
  const [confirm,   setConfirm]   = useState<{ open: boolean; ids: string[]; single: boolean; label: string }>({
    open: false, ids: [], single: false, label: '',
  });
  const [deleting,  setDeleting]  = useState(false);

  const { data: warehouses, refetch } = useFetch<Warehouse[]>('/api/warehouses');
  const selection                     = useSelection(warehouses);

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

    setName(''); setCode(''); setAddress('');
    setShowForm(false);
    setSaving(false);
    refetch();
  }

  async function handleDelete() {
    setDeleting(true);

    const url    = confirm.single ? `/api/warehouses/${confirm.ids[0]}` : '/api/warehouses/bulk-delete';
    const method = confirm.single ? 'DELETE' : 'POST';
    const body   = confirm.single ? undefined : JSON.stringify({ ids: confirm.ids });

    const res = await fetch(url, {
      method,
      headers: confirm.single ? undefined : { 'Content-Type': 'application/json' },
      body,
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Erreur lors de la suppression');
    } else {
      selection.clear();
      refetch();
    }

    setDeleting(false);
    setConfirm({ open: false, ids: [], single: false, label: '' });
  }

  return (
    <div>
      <PageHeader
        title="Entrepôts"
        description={`${warehouses?.length ?? 0} entrepôts`}
        action={
          <div className="flex items-center gap-3">
            {selection.count > 0 && (
              <button
                onClick={() => setConfirm({ open: true, ids: selection.ids, single: false, label: '' })}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 size={12} />
                Supprimer ({selection.count})
              </button>
            )}
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={15} />
              Nouvel entrepôt
            </button>
          </div>
        }
      />

      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-5">
          <h3 className="text-sm font-medium text-gray-300 mb-4">Créer un entrepôt</h3>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Nom *</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Entrepôt Central" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Code *</label>
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="WH-CENTRAL" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Adresse</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Antananarivo" />
            </div>
          </div>
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <div className="flex gap-3">
            <button onClick={handleCreate} disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-lg transition-colors">
              {saving ? 'Création...' : 'Créer'}
            </button>
            <button onClick={() => { setShowForm(false); setError(null); }}
              className="px-4 py-2 text-sm text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              Annuler
            </button>
          </div>
        </div>
      )}

      {error && !showForm && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-3">
        {!warehouses || warehouses.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-12 text-center">
            <p className="text-gray-500 text-sm">Aucun entrepôt — créez-en un pour commencer</p>
          </div>
        ) : (
          warehouses.map((w) => (
            <div key={w._id} className="flex items-start gap-3">
              <div className="pt-4 pl-1">
                <input
                  type="checkbox"
                  checked={selection.isSelected(w._id)}
                  onChange={() => selection.toggle(w._id)}
                  className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                />
              </div>
              <div className="flex-1">
                <WarehouseRow
                  warehouse={w}
                  onDelete={() => setConfirm({ open: true, ids: [w._id], single: true, label: w.name })}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={confirm.open}
        title={confirm.single ? 'Supprimer l\'entrepôt' : `Supprimer ${confirm.ids.length} entrepôt(s)`}
        message={confirm.single
          ? `L'entrepôt "${confirm.label}" et tous ses emplacements seront supprimés.`
          : `Ces ${confirm.ids.length} entrepôts et leurs emplacements seront supprimés.`
        }
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, ids: [], single: false, label: '' })}
        loading={deleting}
        danger
      />
    </div>
  );
}