import { useState, useCallback } from 'react';

export function useSelection<T extends { _id: string }>(items: T[] | null) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (!items) return;
    setSelected((prev) =>
      prev.size === items.length
        ? new Set()
        : new Set(items.map((i) => i._id))
    );
  }, [items]);

  const clear = useCallback(() => setSelected(new Set()), []);

  const isSelected    = useCallback((id: string) => selected.has(id), [selected]);
  const isAllSelected = items ? selected.size === items.length && items.length > 0 : false;
  const count         = selected.size;
  const ids           = Array.from(selected);

  return { selected, toggle, toggleAll, clear, isSelected, isAllSelected, count, ids };
}