export async function getRemoteAppVersion(): Promise<string | null> {
  try {
    const res = await fetch('/version.json', { cache: 'no-store' })
    if (!res.ok) return null
    const data = await res.json() as { version?: string }
    return data.version ?? null
  } catch {
    return null
  }
}
