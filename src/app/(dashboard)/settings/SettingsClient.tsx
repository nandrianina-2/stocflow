'use client';

import { useState } from 'react';
import { useFetch } from '@/hooks/useFetch';
import { useSelection } from '@/hooks/useSelection';
import { PageHeader } from '@/components/ui/PageHeader';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Plus, Users, Tag, Truck, Trash2 } from 'lucide-react';

interface User     { _id: string; name: string; email: string; isActive: boolean; role: { name: string } | null; }
interface Supplier { _id: string; name: string; email: string; phone: string; address: string; }
interface Category { _id: string; name: string; slug: string; }

type Tab = 'users' | 'suppliers' | 'categories';

export function SettingsClient() {
  const [tab, setTab] = useState<Tab>('users');

  return (
    <div>
      <PageHeader title="Paramètres" description="Gestion des utilisateurs, fournisseurs et catégories" />

      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 mb-6 w-fit">
        {([
          { key: 'users',      label: 'Utilisateurs', icon: Users },
          { key: 'suppliers',  label: 'Fournisseurs', icon: Truck },
          { key: 'categories', label: 'Catégories',   icon: Tag   },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === key ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'users'      && <UsersTab />}
      {tab === 'suppliers'  && <SuppliersTab />}
      {tab === 'categories' && <CategoriesTab />}
    </div>
  );
}

function UsersTab() {
  const [showForm, setShowForm] = useState(false);
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [roleId,   setRoleId]   = useState('');
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [confirm,  setConfirm]  = useState<{ open: boolean; ids: string[]; single: boolean }>({
    open: false, ids: [], single: false,
  });
  const [deleting, setDeleting] = useState(false);

  const { data: users,  refetch } = useFetch<User[]>('/api/users');
  const { data: roles }           = useFetch<{ _id: string; name: string }[]>('/api/roles');
  const selection                 = useSelection(users);

  async function createUser() {
    if (!name || !email || !password || !roleId) { setError('Tous les champs sont requis'); return; }
    setSaving(true);
    setError(null);

    const res = await fetch('/api/users', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, password, role: roleId }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Erreur lors de la création');
      setSaving(false);
      return;
    }

    setName(''); setEmail(''); setPassword(''); setRoleId('');
    setShowForm(false);
    setSaving(false);
    refetch();
  }

  async function handleDelete() {
    setDeleting(true);

    const url    = confirm.single
      ? `/api/users/${confirm.ids[0]}`
      : '/api/users/bulk-delete';
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
    setConfirm({ open: false, ids: [], single: false });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-400">{users?.length ?? 0} utilisateur(s)</p>
          {selection.count > 0 && (
            <button
              onClick={() => setConfirm({ open: true, ids: selection.ids, single: false })}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 size={12} />
              Supprimer ({selection.count})
            </button>
          )}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={14} />
          Nouvel utilisateur
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Nom *</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Prénom Nom" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Email *</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@exemple.com" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Mot de passe *</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Minimum 8 caractères" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Rôle *</label>
              <select value={roleId} onChange={(e) => setRoleId(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Sélectionner</option>
                {roles?.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
          <div className="flex gap-3">
            <button onClick={createUser} disabled={saving}
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
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {!users || users.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Aucun utilisateur</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className={`hover:bg-gray-800/50 transition-colors ${selection.isSelected(u._id) ? 'bg-gray-800/30' : ''}`}>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selection.isSelected(u._id)}
                      onChange={() => selection.toggle(u._id)}
                      className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900"
                    />
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-gray-400">{u.email}</td>
                  <td className="px-4 py-3"><Badge label={u.role?.name ?? '—'} variant="info" /></td>
                  <td className="px-4 py-3">
                    <Badge label={u.isActive ? 'Actif' : 'Inactif'} variant={u.isActive ? 'success' : 'danger'} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setConfirm({ open: true, ids: [u._id], single: true })}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirm.open}
        title={confirm.single ? 'Désactiver l\'utilisateur' : `Désactiver ${confirm.ids.length} utilisateur(s)`}
        message={confirm.single
          ? 'Cet utilisateur sera désactivé et ne pourra plus se connecter.'
          : `Ces ${confirm.ids.length} utilisateurs seront désactivés.`
        }
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, ids: [], single: false })}
        loading={deleting}
        danger
      />
    </div>
  );
}

function SuppliersTab() {
  const [showForm, setShowForm] = useState(false);
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [address,  setAddress]  = useState('');
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [confirm,  setConfirm]  = useState<{ open: boolean; ids: string[]; single: boolean }>({
    open: false, ids: [], single: false,
  });
  const [deleting, setDeleting] = useState(false);

  const { data: suppliers, refetch } = useFetch<Supplier[]>('/api/suppliers');
  const selection                    = useSelection(suppliers);

  async function createSupplier() {
    if (!name) { setError('Nom obligatoire'); return; }
    setSaving(true);
    setError(null);

    const res = await fetch('/api/suppliers', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, email, phone, address }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Erreur');
      setSaving(false);
      return;
    }

    setName(''); setEmail(''); setPhone(''); setAddress('');
    setShowForm(false);
    setSaving(false);
    refetch();
  }

  async function handleDelete() {
    setDeleting(true);

    const url    = confirm.single ? `/api/suppliers/${confirm.ids[0]}` : '/api/suppliers/bulk-delete';
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
    setConfirm({ open: false, ids: [], single: false });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-400">{suppliers?.length ?? 0} fournisseur(s)</p>
          {selection.count > 0 && (
            <button
              onClick={() => setConfirm({ open: true, ids: selection.ids, single: false })}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 size={12} />
              Supprimer ({selection.count})
            </button>
          )}
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={14} />
          Nouveau fournisseur
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Nom *</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Téléphone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Adresse</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
          <div className="flex gap-3">
            <button onClick={createSupplier} disabled={saving}
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

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={selection.isAllSelected} onChange={selection.toggleAll}
                  className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" />
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {!suppliers || suppliers.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-500">Aucun fournisseur</td></tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s._id} className={`hover:bg-gray-800/50 transition-colors ${selection.isSelected(s._id) ? 'bg-gray-800/30' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selection.isSelected(s._id)} onChange={() => selection.toggle(s._id)}
                      className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" />
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{s.name}</td>
                  <td className="px-4 py-3 text-gray-400">{s.email || '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{s.phone || '—'}</td>
                  <td className="px-4 py-3 text-gray-400">{s.address || '—'}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setConfirm({ open: true, ids: [s._id], single: true })}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirm.open}
        title={confirm.single ? 'Supprimer le fournisseur' : `Supprimer ${confirm.ids.length} fournisseur(s)`}
        message={confirm.single
          ? 'Ce fournisseur sera définitivement supprimé.'
          : `Ces ${confirm.ids.length} fournisseurs seront définitivement supprimés.`
        }
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, ids: [], single: false })}
        loading={deleting}
        danger
      />
    </div>
  );
}

function CategoriesTab() {
  const [showForm, setShowForm] = useState(false);
  const [name,     setName]     = useState('');
  const [slug,     setSlug]     = useState('');
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [confirm,  setConfirm]  = useState<{ open: boolean; ids: string[]; single: boolean; label: string }>({
    open: false, ids: [], single: false, label: '',
  });
  const [deleting, setDeleting] = useState(false);

  const { data: categories, refetch } = useFetch<Category[]>('/api/categories');
  const selection                     = useSelection(categories);

  function generateSlug(value: string) {
    return value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  async function createCategory() {
    if (!name || !slug) { setError('Nom et slug obligatoires'); return; }
    setSaving(true);
    setError(null);

    const res = await fetch('/api/categories', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ name, slug }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? 'Erreur');
      setSaving(false);
      return;
    }

    setName(''); setSlug('');
    setShowForm(false);
    setSaving(false);
    refetch();
  }

  async function handleDelete() {
    setDeleting(true);

    const url    = confirm.single ? `/api/categories/${confirm.ids[0]}` : '/api/categories/bulk-delete';
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-400">{categories?.length ?? 0} catégorie(s)</p>
          {selection.count > 0 && (
            <button
              onClick={() => setConfirm({ open: true, ids: selection.ids, single: false, label: '' })}
              className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors"
            >
              <Trash2 size={12} />
              Supprimer ({selection.count})
            </button>
          )}
        </div>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={14} />
          Nouvelle catégorie
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Nom *</label>
              <input
                value={name}
                onChange={(e) => { setName(e.target.value); setSlug(generateSlug(e.target.value)); }}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Électronique"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Slug *</label>
              <input
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2.5 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="electronique"
              />
            </div>
          </div>
          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
          <div className="flex gap-3">
            <button onClick={createCategory} disabled={saving}
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

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-4 py-3 w-10">
                <input type="checkbox" checked={selection.isAllSelected} onChange={selection.toggleAll}
                  className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" />
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Slug</th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {!categories || categories.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-500">Aucune catégorie</td></tr>
            ) : (
              categories.map((c) => (
                <tr key={c._id} className={`hover:bg-gray-800/50 transition-colors ${selection.isSelected(c._id) ? 'bg-gray-800/30' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selection.isSelected(c._id)} onChange={() => selection.toggle(c._id)}
                      className="rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" />
                  </td>
                  <td className="px-4 py-3 text-white font-medium">{c.name}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs">{c.slug}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setConfirm({ open: true, ids: [c._id], single: true, label: c.name })}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirm.open}
        title={confirm.single ? 'Supprimer la catégorie' : `Supprimer ${confirm.ids.length} catégorie(s)`}
        message={confirm.single
          ? `La catégorie "${confirm.label}" sera définitivement supprimée.`
          : `Ces ${confirm.ids.length} catégories seront définitivement supprimées.`
        }
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, ids: [], single: false, label: '' })}
        loading={deleting}
        danger
      />
    </div>
  );
}