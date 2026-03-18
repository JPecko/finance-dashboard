import { useEffect, useState } from 'react'
import { groupsRepo } from '@/data/repositories/groupsRepo'
import type { GroupEntry } from '@/domain/types'

interface UseLinkedGroupEntryProps {
  open: boolean
  transactionId?: number
  sharedExpenseId?: number
}

export function useLinkedGroupEntry({ open, transactionId, sharedExpenseId }: UseLinkedGroupEntryProps) {
  const [entry, setEntry] = useState<GroupEntry | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) {
      setEntry(null)
      setLoading(false)
      return
    }

    if (!transactionId && !sharedExpenseId) {
      setEntry(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    const lookup = transactionId
      ? groupsRepo.getEntryByTransactionId(transactionId)
      : groupsRepo.getEntryBySharedExpenseId(sharedExpenseId!)

    lookup
      .then(result => {
        if (cancelled) return
        setEntry(result?.entry ?? null)
      })
      .catch(() => {
        if (cancelled) return
        setEntry(null)
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [open, transactionId, sharedExpenseId])

  return { entry, loading }
}
