import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Endereco = {
  id: string;
  apelido: string;
  logradouro: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  principal: boolean;
};

type EnderecosState = {
  enderecos: Endereco[];
  add: (e: Omit<Endereco, 'id' | 'principal'>) => void;
  remove: (id: string) => void;
  setPrincipal: (id: string) => void;
};

// Endereço de exemplo inicial — clínica pode editar/remover.
const ENDERECO_PADRAO: Endereco = {
  id: 'endereco-inicial',
  apelido: 'Matriz',
  logradouro: 'Av. Brigadeiro Faria Lima, 1500 — sala 1201',
  bairro: 'Pinheiros',
  cidade: 'São Paulo',
  uf: 'SP',
  cep: '01451-000',
  principal: true,
};

export const useEnderecosStore = create<EnderecosState>()(
  persist(
    (set, get) => ({
      enderecos: [ENDERECO_PADRAO],
      add: (input) => {
        const id = `e-${Date.now()}`;
        const isFirst = get().enderecos.length === 0;
        set({
          enderecos: [
            ...get().enderecos,
            { ...input, id, principal: isFirst },
          ],
        });
      },
      remove: (id) => {
        const remaining = get().enderecos.filter((e) => e.id !== id);
        // Se removeu o principal, promove o primeiro restante.
        if (remaining.length > 0 && !remaining.some((e) => e.principal)) {
          remaining[0]!.principal = true;
        }
        set({ enderecos: remaining });
      },
      setPrincipal: (id) =>
        set({
          enderecos: get().enderecos.map((e) => ({ ...e, principal: e.id === id })),
        }),
    }),
    {
      name: 'insumia.enderecos',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
