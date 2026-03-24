import { useQuery } from '@tanstack/react-query'
import { getRemoteAppVersion } from '@/data/repositories/appConfigRepo'

function parseVersion(v: string): [number, number, number] {
  const parts = v.replace(/^v/, '').split('.').map(Number)
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0]
}

function isOutdated(current: string, minimum: string): boolean {
  const [cMaj, cMin, cPatch] = parseVersion(current)
  const [rMaj, rMin, rPatch] = parseVersion(minimum)
  if (rMaj !== cMaj) return rMaj > cMaj
  if (rMin !== cMin) return rMin > cMin
  return rPatch > cPatch
}

export function useVersionCheck() {
  const { data: remoteVersion } = useQuery({
    queryKey: ['app_config', 'version'],
    queryFn: getRemoteAppVersion,
    staleTime: 10 * 60 * 1000,   // re-use cached result for 10 min
    refetchInterval: 10 * 60 * 1000, // poll every 10 min in background
    refetchOnWindowFocus: true,
    retry: false,
  })

  const currentVersion = __APP_VERSION__
  const updateAvailable = remoteVersion ? isOutdated(currentVersion, remoteVersion) : false

  return { currentVersion, remoteVersion: remoteVersion ?? null, updateAvailable }
}
