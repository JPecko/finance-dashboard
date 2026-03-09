export async function hardRefreshApp() {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations()
      await Promise.all(regs.map(reg => reg.unregister()))
    }

    if ('caches' in window) {
      const keys = await caches.keys()
      await Promise.all(keys.map(key => caches.delete(key)))
    }
  } finally {
    // Force a fresh navigation instead of SPA routing.
    const url = new URL(window.location.href)
    url.searchParams.set('refresh', String(Date.now()))
    window.location.href = url.toString()
  }
}
