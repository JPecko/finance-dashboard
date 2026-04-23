const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fetches close price from Stooq. Ticker format: sxr8.de, vuaa.de, aapl.us
async function fetchStooqPrice(ticker: string): Promise<number | null> {
  const url = `https://stooq.com/q/l/?s=${encodeURIComponent(ticker.toLowerCase())}&f=sd2t2ohlcv&h&e=csv`
  const res = await fetch(url)
  if (!res.ok) return null
  const text = await res.text()
  const lines = text.trim().split('\n')
  if (lines.length < 2) return null
  // CSV columns: Symbol, Date, Time, Open, High, Low, Close, Volume
  const cols = lines[1].split(',')
  const close = parseFloat(cols[6])
  return isNaN(close) ? null : close
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const symbolsParam = url.searchParams.get('symbols')
    if (!symbolsParam) {
      return new Response(JSON.stringify({ error: 'symbols param required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const tickers = symbolsParam.split(',').map(s => s.trim())
    const entries = await Promise.all(
      tickers.map(async (t) => [t.toUpperCase(), await fetchStooqPrice(t)] as const)
    )
    const prices = Object.fromEntries(entries.filter(([, p]) => p !== null))

    return new Response(JSON.stringify({ prices }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
