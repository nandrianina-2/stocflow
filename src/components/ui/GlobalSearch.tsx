'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, Tag, Truck } from 'lucide-react';

interface SearchResult {
  products:  { _id: string; name: string; sku: string; type: string }[];
  variants:  { _id: string; sku: string; barcode: string; product: { name: string } | null }[];
  suppliers: { _id: string; name: string; email: string }[];
}

export function GlobalSearch() {
  const router  = useRouter();
  const ref     = useRef<HTMLDivElement>(null);
  const [query,   setQuery]   = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [open,    setOpen]    = useState(false);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (q.length < 2) { setResults(null); return; }
    setLoading(true);
    const res  = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    setResults(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 300);
    return () => clearTimeout(timer);
  }, [query, search]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasResults = results && (
    results.products.length > 0 ||
    results.variants.length  > 0 ||
    results.suppliers.length > 0
  );

  return (
    <div ref={ref} className="relative w-72">
      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher..."
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {open && query.length >= 2 && (
        <div className="absolute top-full mt-1.5 w-full bg-gray-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
          {loading ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">Recherche...</div>
          ) : !hasResults ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">Aucun résultat</div>
          ) : (
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-800">
              {results.products.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-800/50">
                    Produits
                  </p>
                  {results.products.map((p) => (
                    <button
                      key={p._id}
                      onClick={() => { router.push(`/products/${p._id}`); setOpen(false); setQuery(''); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors text-left"
                    >
                      <Package size={13} className="text-blue-400 shrink-0" />
                      <div>
                        <p className="text-sm text-white">{p.name}</p>
                        <p className="text-xs text-gray-500 font-mono">{p.sku}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.variants.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-800/50">
                    Variantes
                  </p>
                  {results.variants.map((v) => (
                    <button
                      key={v._id}
                      onClick={() => { setOpen(false); setQuery(''); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors text-left"
                    >
                      <Tag size={13} className="text-yellow-400 shrink-0" />
                      <div>
                        <p className="text-sm text-white font-mono">{v.sku}</p>
                        <p className="text-xs text-gray-500">{v.product?.name ?? '—'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {results.suppliers.length > 0 && (
                <div>
                  <p className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-800/50">
                    Fournisseurs
                  </p>
                  {results.suppliers.map((s) => (
                    <button
                      key={s._id}
                      onClick={() => { router.push('/settings'); setOpen(false); setQuery(''); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-800 transition-colors text-left"
                    >
                      <Truck size={13} className="text-green-400 shrink-0" />
                      <div>
                        <p className="text-sm text-white">{s.name}</p>
                        <p className="text-xs text-gray-500">{s.email || '—'}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}