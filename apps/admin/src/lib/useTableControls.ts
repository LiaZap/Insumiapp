import { useMemo, useState } from 'react';

type SortDir = 'asc' | 'desc';

type Options<T> = {
  /** Texto buscável de cada linha. */
  searchText: (row: T) => string;
  /** Funções de ordenação por chave de coluna. */
  sortAccessors: Record<string, (row: T) => string | number>;
  pageSize?: number;
  initialSort?: { key: string; dir: SortDir };
};

export function useTableControls<T>(rows: T[], opts: Options<T>) {
  const { searchText, sortAccessors, pageSize = 12, initialSort } = opts;
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(initialSort?.key ?? null);
  const [sortDir, setSortDir] = useState<SortDir>(initialSort?.dir ?? 'asc');
  const [page, setPage] = useState(1);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => searchText(r).toLowerCase().includes(q));
  }, [rows, query, searchText]);

  const sorted = useMemo(() => {
    if (!sortKey || !sortAccessors[sortKey]) return filtered;
    const acc = sortAccessors[sortKey];
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const va = acc(a);
      const vb = acc(b);
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb), 'pt-BR') * dir;
    });
  }, [filtered, sortKey, sortDir, sortAccessors]);

  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  return {
    query,
    setQuery: (v: string) => {
      setQuery(v);
      setPage(1);
    },
    sortKey,
    sortDir,
    toggleSort,
    page: safePage,
    setPage,
    totalPages,
    total,
    pageRows,
    sorted,
  };
}
