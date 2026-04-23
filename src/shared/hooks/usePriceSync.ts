import { useEffect, useRef } from 'react'
import { useAssets } from '@/shared/hooks/useAssets'
import { syncAssets, PRICE_SYNC_KEY, PRICE_SYNC_COOLDOWN_MS } from '@/data/services/syncService'

export function usePriceSync() {
  const { data: assets = [], isLoading } = useAssets()
  const didSync = useRef(false)

  useEffect(() => {
    if (isLoading || didSync.current) return
    const syncable = assets.filter(a => a.ticker)
    if (syncable.length === 0) return

    const last = localStorage.getItem(PRICE_SYNC_KEY)
    if (last && Date.now() - parseInt(last) < PRICE_SYNC_COOLDOWN_MS) return

    didSync.current = true

    syncAssets(assets).catch(() => {
      didSync.current = false
    })
  }, [isLoading, assets])
}
