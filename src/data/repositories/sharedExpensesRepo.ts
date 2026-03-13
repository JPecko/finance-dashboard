import { supabase } from '@/data/supabase'
import type { SharedExpense } from '@/domain/types'

type SharedExpenseRow = {
  id:             number
  user_id:        string
  description:    string
  date:           string
  category:       string
  total_amount:   number
  my_share:       number
  payer:          string
  payer_label:    string | null
  status:         string
  notes:          string | null
  source:         string
  external_id:    string | null
  transaction_id: number | null
  created_at:     string
}

function toSharedExpense(row: SharedExpenseRow): SharedExpense {
  return {
    id:            row.id,
    description:   row.description,
    date:          row.date,
    category:      row.category,
    totalAmount:   row.total_amount,
    myShare:       row.my_share,
    payer:         row.payer as SharedExpense['payer'],
    payerLabel:    row.payer_label ?? undefined,
    status:        row.status as SharedExpense['status'],
    notes:         row.notes ?? undefined,
    source:        row.source as SharedExpense['source'],
    externalId:    row.external_id ?? undefined,
    transactionId: row.transaction_id ?? undefined,
    createdAt:     row.created_at,
  }
}

function toRow(se: Omit<SharedExpense, 'id' | 'createdAt'>): Record<string, unknown> {
  return {
    description:    se.description,
    date:           se.date,
    category:       se.category,
    total_amount:   se.totalAmount,
    my_share:       se.myShare,
    payer:          se.payer,
    payer_label:    se.payerLabel ?? null,
    status:         se.status,
    notes:          se.notes ?? null,
    source:         se.source,
    external_id:    se.externalId ?? null,
    transaction_id: se.transactionId ?? null,
  }
}

export const sharedExpensesRepo = {
  getByMonth: async (year: number, month: number): Promise<SharedExpense[]> => {
    const from      = `${year}-${String(month).padStart(2, '0')}-01`
    const nextMonth = month === 12 ? 1 : month + 1
    const nextYear  = month === 12 ? year + 1 : year
    const to        = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`
    const { data, error } = await supabase
      .from('shared_expenses')
      .select('*')
      .gte('date', from)
      .lt('date', to)
      .order('date', { ascending: false })
    if (error) throw error
    return (data as SharedExpenseRow[]).map(toSharedExpense)
  },

  getOpen: async (): Promise<SharedExpense[]> => {
    const { data, error } = await supabase
      .from('shared_expenses')
      .select('*')
      .eq('status', 'open')
      .order('date', { ascending: false })
    if (error) throw error
    return (data as SharedExpenseRow[]).map(toSharedExpense)
  },

  add: async (se: Omit<SharedExpense, 'id' | 'createdAt'>): Promise<number> => {
    const { data, error } = await supabase
      .from('shared_expenses')
      .insert(toRow(se))
      .select('id')
      .single()
    if (error) throw error
    return (data as { id: number }).id
  },

  update: async (id: number, changes: Partial<SharedExpense>): Promise<void> => {
    const { data: existing, error: fetchError } = await supabase
      .from('shared_expenses')
      .select('*')
      .eq('id', id)
      .single()
    if (fetchError) throw fetchError
    const current = toSharedExpense(existing as SharedExpenseRow)
    const updated = { ...current, ...changes }
    const { error } = await supabase
      .from('shared_expenses')
      .update(toRow(updated))
      .eq('id', id)
    if (error) throw error
  },

  remove: async (id: number): Promise<void> => {
    const { error } = await supabase
      .from('shared_expenses')
      .delete()
      .eq('id', id)
    if (error) throw error
  },
}
