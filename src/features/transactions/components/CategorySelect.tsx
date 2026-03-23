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
  }))

  return (
    <div className="space-y-1">
      <Label>{t('transactions.category')}</Label>
      <PlainSelect value={value} onChange={onChange} options={options} />
    </div>
  )
}
