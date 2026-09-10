import { useT } from '@/shared/i18n'

/** Frequency select options, shared by the standard and group recurring tabs. */
export function freqOptions(t: ReturnType<typeof useT>) {
  return [
    { value: 'once',    label: t('recurring.frequencies.once') },
    { value: 'weekly',  label: t('recurring.frequencies.weekly') },
    { value: 'monthly', label: t('recurring.frequencies.monthly') },
    { value: 'yearly',  label: t('recurring.frequencies.yearly') },
  ]
}
