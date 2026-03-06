import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getYear, getMonth, format } from 'date-fns'
import { supabase } from '@/data/supabase'
import { transactionsRepo } from '@/data/repositories/transactionsRepo'
import { queryClient } from '@/app/queryClient'
import { queryKeys } from '@/data/queryKeys'
import { useAccounts } from '@/shared/hooks/useAccounts'
import type { Transaction } from '@/domain/types'

// ─── Queries ────────────────────────────────────────────────────────────────

export function useTransactionsByMonth(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.transactions.byMonth(year, month),
    queryFn:  () => transactionsRepo.getByMonth(year, month),
  })
}

/** Fetches net cash-flow for the 6 months ending at (year, month). Used for the line chart. */
export function useMonthlyNetFlow(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.transactions.netFlow(year, month),
    queryFn:  async () => {
      const result: { month: string; net: number }[] = []
      for (let i = 5; i >= 0; i--) {
        const d    = new Date(year, month - 1 - i, 1)
        const txs  = await transactionsRepo.getByMonth(getYear(d), getMonth(d) + 1)
        result.push({ month: format(d, 'MMM yy'), net: txs.filter(isCashFlow).reduce((s, t) => s + t.amount, 0) })
      }
      return result
    },
  })
}

// ─── Derived / computed hooks ────────────────────────────────────────────────

/** Returns true for transactions that represent real cash flow (not internal moves or capital gains). */
export function isCashFlow(t: Transaction): boolean {
  if (t.type === 'revaluation') return false
  if (t.type === 'transfer' && t.toAccountId != null) return false
  if (t.type === 'transfer' && t.category === 'capital') return false
  return true
}

/** Computes monthly income/expense summary, dividing shared-account values by participants. */
export function useMonthSummary(year: number, month: number) {
  const { data: txs      = [] } = useTransactionsByMonth(year, month)
  const { data: accounts = [] } = useAccounts()

  const real     = txs.filter(isCashFlow)
  const income   = real.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const expenses = real.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0)

  const personalExpenses = real
    .filter(t => t.amount < 0)
    .reduce((s, t) => {
      const participants = accounts.find(a => a.id === t.accountId)?.participants ?? 1
      return s + t.amount / participants
    }, 0)

  const personalIncome = real
    .filter(t => t.amount > 0)
    .reduce((s, t) => {
      const participants = accounts.find(a => a.id === t.accountId)?.participants ?? 1
      return s + t.amount / participants
    }, 0)

  const marketGain = txs
    .filter(t => t.type === 'revaluation')
    .reduce((s, t) => s + t.amount, 0)

  return {
    income, expenses, balance: income + expenses,
    personalIncome, personalExpenses, personalBalance: personalIncome + personalExpenses,
    marketGain,
  }
}

/** Returns monthly cashback + roundup totals (as positive amounts) for the last 6 months ending at (year, month). */
export function useMonthlyBenefits(year: number, month: number) {
  return useQuery({
    queryKey: ['benefits', 'monthly', year, month],
    queryFn: async () => {
      const result: { month: string; cashback: number; roundup: number }[] = []
      for (let i = 5; i >= 0; i--) {
        const d      = new Date(year, month - 1 - i, 1)
        const y      = getYear(d)
        const m      = getMonth(d) + 1
        const from   = `${y}-${String(m).padStart(2, '0')}-01`
        const nm     = m === 12 ? 1 : m + 1
        const ny     = m === 12 ? y + 1 : y
        const to     = `${ny}-${String(nm).padStart(2, '0')}-01`
        const { data } = await supabase
          .from('transactions')
          .select('amount, category')
          .in('category', ['cashback', 'roundup'])
          .gte('date', from)
          .lt('date', to)
        const rows = (data ?? []) as { amount: number; category: string }[]
        result.push({
          month:    format(d, 'MMM yy'),
          cashback: rows.filter(r => r.category === 'cashback').reduce((s, r) => s + Math.abs(r.amount), 0),
          roundup:  rows.filter(r => r.category === 'roundup').reduce((s, r) => s + Math.abs(r.amount), 0),
        })
      }
      return result
    },
  })
}

/** Returns YTD cashback + roundup totals (as positive amounts) for the given year. */
export function useYearBenefits(year: number) {
  return useQuery({
    queryKey: ['benefits', 'year', year],
    queryFn: async () => {
      const { data } = await supabase
        .from('transactions')
        .select('amount, category')
        .in('category', ['cashback', 'roundup'])
        .gte('date', `${year}-01-01`)
        .lt('date', `${year + 1}-01-01`)
      const rows = (data ?? []) as { amount: number; category: string }[]
      return {
        cashback: rows.filter(r => r.category === 'cashback').reduce((s, r) => s + Math.abs(r.amount), 0),
        roundup:  rows.filter(r => r.category === 'roundup').reduce((s, r) => s + Math.abs(r.amount), 0),
      }
    },
  })
}

// ─── Running balance ─────────────────────────────────────────────────────────

/** Fetches the total amount of transactions AFTER the given month for each account. */
function useLaterSums(year: number, month: number) {
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear  = month === 12 ? year + 1 : year
  const afterDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`
  return useQuery({
    queryKey: ['laterSums', year, month],
    queryFn: async () => {
      const { data } = await supabase
        .from('transactions')
        .select('account_id, amount')
        .gte('date', afterDate)
      const map: Record<number, number> = {}
      for (const row of (data ?? []) as { account_id: number; amount: number }[]) {
        map[row.account_id] = (map[row.account_id] ?? 0) + row.amount
      }
      return map
    },
  })
}

/**
 * Computes the account running balance (balance AFTER each transaction) for every
 * transaction in the given month. Returns a map of { [transactionId]: balance }.
 *
 * Algorithm: start from each account's current balance, subtract transactions that
 * happened after this month to get the end-of-month balance, then walk the month's
 * transactions newest-first to derive each transaction's post-balance.
 */
export function useRunningBalances(year: number, month: number): Record<number, number> {
  const { data: accounts = [] } = useAccounts()
  const { data: txs      = [] } = useTransactionsByMonth(year, month)
  const { data: laterSums = {} } = useLaterSums(year, month)

  return useMemo(() => {
    if (txs.length === 0) return {}

    // Balance of each account at the end of the displayed month
    const endBalance: Record<number, number> = {}
    for (const acc of accounts) {
      endBalance[acc.id!] = acc.balance - (laterSums[acc.id!] ?? 0)
    }

    // Walk transactions from newest → oldest (txs are already sorted date+created_at desc)
    const result: Record<number, number> = {}
    const running = { ...endBalance }
    for (const tx of txs) {
      if (tx.id == null) continue
      result[tx.id] = running[tx.accountId] ?? 0      // balance AFTER this tx
      running[tx.accountId] = (running[tx.accountId] ?? 0) - tx.amount  // step back in time
    }
    return result
  }, [accounts, txs, laterSums])
}

// ─── Mutations ───────────────────────────────────────────────────────────────
// Transactions affect account balances, so both caches are invalidated.
// Prefix-based invalidation on ['transactions'] covers byMonth + netFlow.

export async function addTransaction(data: Omit<Transaction, 'id' | 'createdAt'>) {
  await transactionsRepo.add(data)
  queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all() })
  queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() })
}

export async function updateTransaction(id: number, data: Partial<Transaction>) {
  await transactionsRepo.update(id, data)
  queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all() })
  queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() })
}

export async function removeTransaction(id: number) {
  await transactionsRepo.remove(id)
  queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all() })
  queryClient.invalidateQueries({ queryKey: queryKeys.transactions.all() })
}
