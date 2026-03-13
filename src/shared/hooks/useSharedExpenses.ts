import { useQuery } from '@tanstack/react-query'
import { sharedExpensesRepo } from '@/data/repositories/sharedExpensesRepo'
import { queryClient } from '@/app/queryClient'
import { queryKeys } from '@/data/queryKeys'
import type { SharedExpense } from '@/domain/types'

export function useSharedExpensesByMonth(year: number, month: number) {
  return useQuery({
    queryKey: queryKeys.sharedExpenses.byMonth(year, month),
    queryFn:  () => sharedExpensesRepo.getByMonth(year, month),
  })
}

export function useOpenSharedExpenses() {
  return useQuery({
    queryKey: queryKeys.sharedExpenses.open(),
    queryFn:  () => sharedExpensesRepo.getOpen(),
  })
}

export async function addSharedExpense(data: Omit<SharedExpense, 'id' | 'createdAt'>) {
  await sharedExpensesRepo.add(data)
  queryClient.invalidateQueries({ queryKey: queryKeys.sharedExpenses.all() })
}

export async function updateSharedExpense(id: number, data: Partial<SharedExpense>) {
  await sharedExpensesRepo.update(id, data)
  queryClient.invalidateQueries({ queryKey: queryKeys.sharedExpenses.all() })
}

export async function removeSharedExpense(id: number) {
  await sharedExpensesRepo.remove(id)
  queryClient.invalidateQueries({ queryKey: queryKeys.sharedExpenses.all() })
}

export async function settleAllOpenSharedExpenses() {
  const open = await sharedExpensesRepo.getOpen()
  await Promise.all(open.map(se => se.id != null && sharedExpensesRepo.update(se.id, { status: 'settled' })))
  queryClient.invalidateQueries({ queryKey: queryKeys.sharedExpenses.all() })
}
