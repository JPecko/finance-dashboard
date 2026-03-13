import { cn } from '@/lib/utils'
import type { TransactionType } from '@/domain/types'

type TabValue = TransactionType | 'splitwise'

const TABS: { value: TabValue; label: string; activeClass: string }[] = [
  { value: 'expense',   label: 'Expense',    activeClass: 'bg-rose-600 text-white' },
  { value: 'income',    label: 'Income',     activeClass: 'bg-emerald-600 text-white' },
  { value: 'transfer',  label: 'Transfer',   activeClass: 'bg-blue-600 text-white' },
  { value: 'splitwise', label: 'Splitwise',  activeClass: 'bg-violet-600 text-white' },
]

interface Props {
  value:    TabValue
  onChange: (type: TabValue) => void
}

export default function TransactionTypeTabs({ value, onChange }: Props) {
  return (
    <div className="flex rounded-lg border overflow-hidden">
      {TABS.map(tab => (
        <button
          key={tab.value}
          type="button"
          className={cn(
            'flex-1 py-2 text-sm font-medium transition-colors',
            value === tab.value
              ? tab.activeClass
              : 'bg-transparent text-muted-foreground hover:bg-muted',
          )}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
