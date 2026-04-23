import { useQuery } from '@tanstack/react-query'
import { queryClient } from '@/app/queryClient'
import { userSettingsRepo, type UserSettings } from '@/data/repositories/userSettingsRepo'
import { queryKeys } from '@/data/queryKeys'

export function useUserSettings() {
  return useQuery({
    queryKey: queryKeys.userSettings.all(),
    queryFn: userSettingsRepo.get,
  })
}

export async function saveUserSettings(settings: UserSettings): Promise<void> {
  await userSettingsRepo.upsert(settings)
  await queryClient.invalidateQueries({ queryKey: queryKeys.userSettings.all() })
}
