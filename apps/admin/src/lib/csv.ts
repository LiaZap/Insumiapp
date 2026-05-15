/** Exporta um array de objetos como CSV e dispara o download. */
export function exportToCsv<T extends Record<string, unknown>>(
  filename: string,
  rows: T[],
  columns: Array<{ header: string; value: (row: T) => string | number }>,
) {
  const escape = (v: string | number) => {
    const s = String(v ?? '');
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const head = columns.map((c) => escape(c.header)).join(';');
  const body = rows.map((r) => columns.map((c) => escape(c.value(r))).join(';')).join('\n');
  const csv = `﻿${head}\n${body}`; // BOM p/ Excel reconhecer UTF-8

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
