import { APP_VERSION } from '@/version'

function normalizeVersion(version: string) {
  return version.trim().toLowerCase()
}

export async function hasAppUpdate() {
  try {
    const res = await fetch('/version.json', { cache: 'no-store' })
    if (!res.ok) return false
    const payload = (await res.json()) as { version?: string }
    if (!payload.version) return false
    return normalizeVersion(payload.version) !== normalizeVersion(APP_VERSION)
  } catch {
    return false
  }
}

