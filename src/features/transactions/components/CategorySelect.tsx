import { Label } from '@/shared/components/ui/label'
import { tCategory, type Category } from '@/domain/categories'
import { useT } from '@/shared/i18n'
import PlainSelect from '@/shared/components/PlainSelect'

interface Props {
  categories: Category[]
  value:      string
  onChange:   (id: string) => void
}

export default function CategorySelect({ categories, value, onChange }: Props) {
  const t = useT()
  const options = categories.map(category => ({
    value: category.id,
    label: tCategory(category.id, t),
    content: <CategoryOption category={category} label={tCategory(category.id, t)} />,
    selectedContent: <CategoryOption category={category} label={tCategory(category.id, t)} compact />,
  }))

  return (
    <div className="space-y-1">
      <Label>{t('transactions.category')}</Label>
      <PlainSelect value={value} onChange={onChange} options={options} />
    </div>
  )
}

function CategoryOption({ category, label, compact }: { category: Category; label: string; compact?: boolean }) {
  const Icon = category.icon
  const size = compact ? 'h-6 w-6' : 'h-8 w-8'
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div
        className={`${size} rounded-lg flex items-center justify-center shrink-0`}
        style={{ backgroundColor: `${category.color}20` }}
      >
        <Icon className="h-4 w-4" style={{ color: category.color }} />
      </div>
      <span className="truncate">{label}</span>
    </div>
  )
}

