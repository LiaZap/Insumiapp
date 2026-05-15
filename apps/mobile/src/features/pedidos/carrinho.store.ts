import { create } from 'zustand';
import type { Medicamento } from '@insumia/shared';

export type CarrinhoItem = {
  medicamento: Medicamento;
  quantidade: number;
};

type CarrinhoState = {
  itens: Record<string, CarrinhoItem>;
  add: (med: Medicamento, qty?: number) => void;
  setQty: (medicamentoId: string, quantidade: number) => void;
  remove: (medicamentoId: string) => void;
  clear: () => void;
};

export const useCarrinhoStore = create<CarrinhoState>((set) => ({
  itens: {},
  add: (med, qty = 1) =>
    set((s) => {
      const existing = s.itens[med.id];
      const quantidade = (existing?.quantidade ?? 0) + qty;
      return { itens: { ...s.itens, [med.id]: { medicamento: med, quantidade } } };
    }),
  setQty: (id, quantidade) =>
    set((s) => {
      if (quantidade <= 0) {
        const { [id]: _omit, ...rest } = s.itens;
        return { itens: rest };
      }
      const existing = s.itens[id];
      if (!existing) return s;
      return { itens: { ...s.itens, [id]: { ...existing, quantidade } } };
    }),
  remove: (id) =>
    set((s) => {
      const { [id]: _omit, ...rest } = s.itens;
      return { itens: rest };
    }),
  clear: () => set({ itens: {} }),
}));

export const selectTotalItens = (s: CarrinhoState) =>
  Object.values(s.itens).reduce((sum, i) => sum + i.quantidade, 0);

export const selectTotalValor = (s: CarrinhoState) =>
  Object.values(s.itens).reduce(
    (sum, i) => sum + Number(i.medicamento.precoUnitario) * i.quantidade,
    0,
  );

export const selectItensArray = (s: CarrinhoState) => Object.values(s.itens);
