import { useState, useRef } from 'react'
import { format } from 'date-fns'
import { toCents, fromCents } from '@/domain/money'
import { updateAsset } from '@/shared/hooks/useAssets'
import { upsertAssetPrice } from '@/shared/hooks/useAssetPrices'
import type { Asset } from '@/domain/types'

interface EditingPrice {
  assetId: number
  value: string
  date: string
}

export function useAssetPriceEditor() {
  const [editingPrice, setEditingPrice] = useState<EditingPrice | null>(null)
  const priceInputRef = useRef<HTMLInputElement>(null)

  const startEditPrice = (a: Asset) => {
    setEditingPrice({
      assetId: a.id!,
      value: String(fromCents(a.currentPrice)),
      date: format(new Date(), 'yyyy-MM-dd'),
    })
    setTimeout(() => priceInputRef.current?.select(), 0)
  }

  const commitEditPrice = async (a: Asset) => {
    if (!editingPrice || editingPrice.assetId !== a.id) return
    const parsed = parseFloat(editingPrice.value.replace(',', '.'))
    if (!isNaN(parsed) && parsed >= 0) {
      const priceCents = toCents(parsed)
      await updateAsset(a.id!, { currentPrice: priceCents })
      if (editingPrice.date) await upsertAssetPrice(a.id!, priceCents, editingPrice.date)
    }
    setEditingPrice(null)
  }

  const cancelEditPrice = () => setEditingPrice(null)

  const onPriceChange = (v: string) =>
    setEditingPrice(prev => prev ? { ...prev, value: v } : null)

  const onDateChange = (d: string) =>
    setEditingPrice(prev => prev ? { ...prev, date: d } : null)

  return { editingPrice, priceInputRef, startEditPrice, commitEditPrice, cancelEditPrice, onPriceChange, onDateChange }
}
