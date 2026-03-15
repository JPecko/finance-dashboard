import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip as ReTooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card'
import BankLogo from '@/shared/components/BankLogo'
import { BANK_OPTIONS } from '@/shared/config/banks'
import { useInvestmentAccountHistory } from '@/shared/hooks/useTransactions'
import { formatMoney, fromCents } from '@/domain/money'
import { useT } from '@/shared/i18n'
import type { Account, Asset, Holding } from '@/domain/types'

const axisFmt = (v: number) => {
  if (Math.abs(v) >= 1000) return `${(v / 1000).toFixed(0)}k`
  return String(v)
}

interface Props {
  account:  Account
  holdings: Holding[]
  assets:   Asset[]
}

export default function InvestmentAccountCard({ account, holdings, assets }: Props) {
  const t        = useT()
  const bank     = account.bankCode ? BANK_OPTIONS.find(b => b.code === account.bankCode) : undefined
  const assetMap = Object.fromEntries(assets.map(a => [a.id!, a]))
  const { data = [] } = useInvestmentAccountHistory(account)

  // Cost basis and market value derived exclusively from holdings
  const costBasisCents   = holdings.reduce((s, h) => s + h.quantity * h.avgCost, 0)
  const marketValueCents = holdings.reduce((s, h) => s + h.quantity * (assetMap[h.assetId]?.currentPrice ?? 0), 0)
  const hasHoldings     = holdings.length > 0

  // P&L on holdings
  const pnl        = marketValueCents - costBasisCents
  const pnlPct     = costBasisCents > 0 ? (pnl / costBasisCents) * 100 : 0
  const isPositive = pnl >= 0

  // Chart: account balance over time (monthly)
  // Cost basis is a horizontal reference line (current snapshot)
  const chartData = data.map(d => ({
    month:   d.month,
    balance: Math.round(fromCents(d.balance) * 100) / 100,
  }))
  const costBasisRef = Math.round(fromCents(costBasisCents) * 100) / 100

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          {/* Left: logo + name */}
          <div className="flex items-center gap-2.5 min-w-0">
            {bank && (
              <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <BankLogo
                  domain={bank.logoDomain}
                  name={bank.name}
                  accountType={account.type}
                  imgClassName="h-5 w-5 object-contain"
                  iconClassName="h-4 w-4 text-muted-foreground"
                />
              </div>
            )}
            <CardTitle className="text-sm font-medium truncate">{account.name}</CardTitle>
          </div>

          {/* Right: account balance */}
          <div className="text-right shrink-0">
            <p className="text-lg font-bold tabular-nums">{formatMoney(account.balance)}</p>
            <p className="text-[10px] text-muted-foreground">{t('accounts.title')}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">

        {/* Stats: 3 concepts side by side */}
        {hasHoldings ? (
          <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/30 px-3 py-2.5">
            {/* Capital Investido — deposits */}
            {account.investedBase != null && (
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-tight">
                  {t('investments.investedBase')}
                </p>
                <p className="text-sm font-semibold tabular-nums">{formatMoney(account.investedBase)}</p>
                <p className="text-[10px] text-muted-foreground">depósitos</p>
              </div>
            )}
            {/* Custo Base — what you paid for the assets */}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-tight">
                {t('investments.costBasis')}
              </p>
              <p className="text-sm font-semibold tabular-nums">{formatMoney(costBasisCents)}</p>
              <p className="text-[10px] text-muted-foreground">preço pago</p>
            </div>
            {/* Valor de Mercado */}
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-tight">
                {t('investments.marketValue')}
              </p>
              <p className="text-sm font-semibold tabular-nums">{formatMoney(marketValueCents)}</p>
              <p className={`text-[10px] font-medium ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                {isPositive ? '+' : ''}{formatMoney(pnl)} ({isPositive ? '+' : ''}{pnlPct.toFixed(1)}%)
              </p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground px-1">
            {t('investments.noHoldings')} — {t('investments.addHolding').toLowerCase()} na página de investimentos.
          </p>
        )}

        {/* Chart: account balance over time + cost basis reference */}
        <ResponsiveContainer width="100%" height={150}>
          <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              width={42}
              tick={{ fontSize: 10 }}
              tickFormatter={axisFmt}
              tickLine={false}
              axisLine={false}
            />
            <ReTooltip
              formatter={(value, name) => [
                typeof value === 'number' ? formatMoney(Math.round(value * 100)) : String(value ?? ''),
                String(name ?? ''),
              ]}
              contentStyle={{ fontSize: 12 }}
            />
            {/* Horizontal reference line: current cost basis */}
            {hasHoldings && costBasisRef > 0 && (
              <ReferenceLine
                y={costBasisRef}
                stroke={account.color}
                strokeDasharray="5 4"
                strokeWidth={1.5}
                label={{ value: t('investments.costBasis'), position: 'insideTopRight', fontSize: 9, fill: 'var(--muted-foreground)' }}
              />
            )}
            {/* Line: account balance over time */}
            <Line
              type="monotone"
              dataKey="balance"
              name={t('dashboard.portfolioValue')}
              stroke={account.color}
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-5">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="block h-0.5 w-4 rounded shrink-0" style={{ backgroundColor: account.color }} />
            {t('dashboard.portfolioValue')}
          </div>
          {hasHoldings && costBasisRef > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <svg width="16" height="8">
                <line x1="0" y1="4" x2="16" y2="4" stroke={account.color} strokeWidth="1.5" strokeDasharray="5 4" />
              </svg>
              {t('investments.costBasis')}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
