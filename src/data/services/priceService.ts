type PricesResponse = {
  prices?: Record<string, number>
  error?: string
}

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-prices`
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

/**
 * Fetches current prices via the Supabase Edge Function (Stooq backend).
 * Returns a map of UPPERCASE ticker → price in cents.
 * Ticker format: SXR8.DE (Xetra), VUAA.DE, AAPL (US stocks).
 */
export async function fetchPricesCents(
  tickers: string[],
): Promise<Record<string, number>> {
  if (tickers.length === 0) return {}

  const symbols = tickers.map(t => t.toUpperCase()).join(',')
  const res = await fetch(`${EDGE_URL}?symbols=${encodeURIComponent(symbols)}`, {
    headers: { Authorization: `Bearer ${ANON_KEY}`, apikey: ANON_KEY },
  })

  const data = await res.json() as PricesResponse
  if (data.error) throw new Error(data.error)
  if (!res.ok) throw new Error(`Price fetch failed: HTTP ${res.status}`)

  const result: Record<string, number> = {}
  for (const [ticker, price] of Object.entries(data.prices ?? {})) {
    result[ticker] = Math.round(price * 100)
  }
  return result
}
