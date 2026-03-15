import { useQuery } from '@tanstack/react-query'
import { assetsRepo } from '@/data/repositories/assetsRepo'
import { queryClient } from '@/app/queryClient'
import { queryKeys } from '@/data/queryKeys'
import type { Asset } from '@/domain/types'

export function useAssets() {
  return useQuery({
    queryKey: queryKeys.assets.all(),
    queryFn:  assetsRepo.getAll,
  })
}

export async function addAsset(data: Omit<Asset, 'id' | 'createdAt'>) {
  const created = await assetsRepo.add(data)
  queryClient.invalidateQueries({ queryKey: queryKeys.assets.all() })
  return created
}

export async function updateAsset(id: number, data: Partial<Asset>) {
  await assetsRepo.update(id, data)
  queryClient.invalidateQueries({ queryKey: queryKeys.assets.all() })
}

export async function removeAsset(id: number) {
  await assetsRepo.remove(id)
  queryClient.invalidateQueries({ queryKey: queryKeys.assets.all() })
}
