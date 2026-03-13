import { create } from 'zustand'

interface TransactionsFilterStore {
  filterAccountId: number | null
  filterCategory:  string | null
  filterSource:    'all' | 'bank' | 'shared'
  setFilterAccountId: (id: number | null) => void
  setFilterCategory:  (cat: string | null) => void
  setFilterSource:    (s: 'all' | 'bank' | 'shared') => void
}

export const useTransactionsFilterStore = create<TransactionsFilterStore>((set) => ({
  filterAccountId: null,
  filterCategory:  null,
  filterSource:    'all',
  setFilterAccountId: (id)  => set({ filterAccountId: id }),
  setFilterCategory:  (cat) => set({ filterCategory: cat }),
  setFilterSource:    (s)   => set({ filterSource: s }),
}))
