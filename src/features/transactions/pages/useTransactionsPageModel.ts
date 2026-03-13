import { useMemo, useState } from 'react'
import { getYear, getMonth } from 'date-fns'
import { useTransactionsByMonth, useRunningBalances, removeTransaction } from '@/shared/hooks/useTransactions'
import { useSharedExpensesByMonth, removeSharedExpense, updateSharedExpense } from '@/shared/hooks/useSharedExpenses'
import { useSortedAccounts } from '@/shared/hooks/useAccounts'
import { useTransactionsFilterStore } from '@/shared/store/transactionsFilterStore'
import type { Transaction, Account, SharedExpense } from '@/domain/types'

export type ListItem =
  | { kind: 'tx'; data: Transaction }
  | { kind: 'se'; data: SharedExpense }

export function useTransactionsPageModel() {
  const [year, setYear] = useState(() => getYear(new Date()))
  const [month, setMonth] = useState(() => getMonth(new Date()) + 1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingTx, setEditingTx] = useState<Transaction | undefined>()
  const [editingSE, setEditingSE] = useState<SharedExpense | undefined>()

  const { filterAccountId, filterCategory, filterSource, setFilterAccountId, setFilterCategory, setFilterSource } =
    useTransactionsFilterStore()

  const { data: transactions   = [], isLoading }  = useTransactionsByMonth(year, month)
  const { data: sharedExpenses = [] }              = useSharedExpensesByMonth(year, month)
  const { data: accounts       = [] }              = useSortedAccounts()
  const runningBalances                            = useRunningBalances(year, month)

  const accountsById = useMemo(
    () => Object.fromEntries(accounts.map(a => [a.id!, a])) as Record<number, Account>,
    [accounts],
  )

  // Map transactionId → SharedExpense for payer='me' (shown as badge on TransactionRow)
  const txSeMap = useMemo<Record<number, SharedExpense>>(() => {
    const map: Record<number, SharedExpense> = {}
    for (const se of sharedExpenses) {
      if (se.payer === 'me' && se.transactionId != null) {
        map[se.transactionId] = se
      }
    }
    return map
  }, [sharedExpenses])

  const currentDate = useMemo(() => new Date(year, month - 1, 1), [year, month])

  // Categories present in the current month (from both transactions and shared expenses)
  const categoriesInMonth = useMemo(
    () => [...new Set([
      ...transactions.map(tx => tx.category),
      ...sharedExpenses.map(se => se.category),
    ])],
    [transactions, sharedExpenses],
  )

  // Merged + sorted list with discriminated union
  const listItems = useMemo<ListItem[]>(() => {
    const txItems: ListItem[] = transactions
      .filter(tx => {
        if (filterSource === 'shared' && (tx.id == null || txSeMap[tx.id] == null)) return false
        if (filterAccountId !== null && tx.accountId !== filterAccountId && tx.toAccountId !== filterAccountId) return false
        if (filterCategory !== null && tx.category !== filterCategory) return false
        return true
      })
      .map(tx => ({ kind: 'tx', data: tx }))

    const seItems: ListItem[] = sharedExpenses
      .filter(se => {
        if (se.payer === 'me') return false          // shown as badge on TransactionRow
        if (filterSource === 'bank') return false
        if (filterCategory !== null && se.category !== filterCategory) return false
        return true
      })
      .map(se => ({ kind: 'se', data: se }))

    return [...txItems, ...seItems].sort((a, b) => {
      const dateA = a.kind === 'tx' ? a.data.date : a.data.date
      const dateB = b.kind === 'tx' ? b.data.date : b.data.date
      return dateB.localeCompare(dateA)
    })
  }, [transactions, sharedExpenses, filterAccountId, filterCategory, filterSource])

  const prevMonth = () => {
    if (month === 1) { setMonth(12); setYear(y => y - 1); return }
    setMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (month === 12) { setMonth(1); setYear(y => y + 1); return }
    setMonth(m => m + 1)
  }

  const openCreateModal = () => {
    setEditingTx(undefined)
    setEditingSE(undefined)
    setModalOpen(true)
  }

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx)
    setEditingSE(undefined)
    setModalOpen(true)
  }

  const handleEditSE = (se: SharedExpense) => {
    setEditingSE(se)
    setEditingTx(undefined)
    setModalOpen(true)
  }

  const handleClose = () => {
    setModalOpen(false)
    setEditingTx(undefined)
    setEditingSE(undefined)
  }

  const handleDelete = async (id: number) => {
    if (confirm('Delete this transaction?')) {
      await removeTransaction(id)
    }
  }

  const handleDeleteSE = async (id: number) => {
    if (confirm('Delete this shared expense?')) {
      await removeSharedExpense(id)
    }
  }

  const handleReopen = async (id: number) => {
    await updateSharedExpense(id, { status: 'open' })
  }

  return {
    year,
    month,
    currentDate,
    modalOpen,
    editingTx,
    editingSE,
    listItems,
    txSeMap,
    isLoading,
    accounts,
    accountsById,
    runningBalances,
    categoriesInMonth,
    filterAccountId,
    filterCategory,
    filterSource,
    setFilterAccountId,
    setFilterCategory,
    setFilterSource,
    prevMonth,
    nextMonth,
    openCreateModal,
    handleEdit,
    handleEditSE,
    handleClose,
    handleDelete,
    handleDeleteSE,
    handleReopen,
  }
}
