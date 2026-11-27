import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatAriary, formatCompactAriary } from '../lib/format'

export interface ChartDatum {
  label: string
  value: number
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value?: unknown }>; label?: unknown }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-lg dark:border-slate-700 dark:bg-slate-900">
      <p className="font-medium">{String(label)}</p>
      <p className="tabular-nums text-slate-600 dark:text-slate-300">{formatAriary(Number(payload[0]?.value ?? 0))}</p>
    </div>
  )
}

export function RevenueBarChart({
  data,
  layout = 'vertical',
  color = 'var(--chart-1)',
}: {
  data: ChartDatum[]
  layout?: 'vertical' | 'horizontal'
  color?: string
}) {
  const axis = { stroke: 'var(--chart-axis)', fontSize: 12, tickLine: false, axisLine: false }

  if (layout === 'horizontal') {
    return (
      <ResponsiveContainer width="100%" height={Math.max(180, data.length * 48)}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 8 }}>
          <CartesianGrid horizontal={false} stroke="var(--chart-grid)" />
          <XAxis type="number" tickFormatter={formatCompactAriary} {...axis} />
          <YAxis type="category" dataKey="label" width={110} {...axis} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--chart-grid)', opacity: 0.4 }} />
          <Bar dataKey="value" fill={color} radius={[0, 6, 6, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
        <XAxis dataKey="label" {...axis} />
        <YAxis tickFormatter={formatCompactAriary} width={84} {...axis} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--chart-grid)', opacity: 0.4 }} />
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ResponsiveContainer>
  )
}
