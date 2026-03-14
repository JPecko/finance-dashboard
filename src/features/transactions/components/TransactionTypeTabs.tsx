import { cn } from '@/lib/utils'
import type { TransactionType } from '@/domain/types'

type TabValue = TransactionType | 'groups'

const TABS: { value: TabValue; label: string; activeClass: string }[] = [
  { value: 'expense',   label: 'Expense',    activeClass: 'bg-rose-600 text-white' },
  { value: 'income',    label: 'Income',     activeClass: 'bg-emerald-600 text-white' },
  { value: 'transfer',  label: 'Transfer',   activeClass: 'bg-blue-600 text-white' },
  { value: 'groups',    label: 'Groups',     activeClass: 'bg-violet-600 text-white' },
]

interface Props {
  value:       TabValue
  onChange:    (type: TabValue) => void
  activeTabs?: TabValue[]
}

export default function TransactionTypeTabs({ value, onChange, activeTabs = [] }: Props) {
  return (
    <div className="flex rounded-lg border overflow-hidden">
      {TABS.map(tab => (
        <button
          key={tab.value}
          type="button"
          className={cn(
            'relative flex-1 py-2 text-sm font-medium transition-colors',
            value === tab.value
              ? tab.activeClass
              : 'bg-transparent text-muted-foreground hover:bg-muted',
          )}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
          {activeTabs.includes(tab.value) && value !== tab.value && (
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-violet-500" />
          )}
        </button>
      ))}
    </div>
  )
}
