import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { useTheme } from '../context/ThemeContext'
import type { CategorySlice } from '../lib/dashboardStats'

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

const CATEGORY_COLORS = ['#2A7F7B', '#E8A24C', '#3F9C97', '#9CA8A4', '#C4604A', '#1E5F5C', '#5C6B67']

export function CategoryDonut({ data }: { data: CategorySlice[] }) {
  const { theme } = useTheme()
  const gridColor = theme === 'dark' ? '#33413D' : '#E8E2D6'
  const tooltipBg = theme === 'dark' ? '#242B29' : '#FFFFFF'

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <div className="h-56 w-56 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="amount"
              nameKey="category"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={2}
            >
              {data.map((entry, i) => (
                <Cell key={entry.category} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} stroke="none" />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: tooltipBg,
                border: `1px solid ${gridColor}`,
                borderRadius: 12,
                fontFamily: 'IBM Plex Mono',
                fontSize: 12,
              }}
              formatter={(value) => currency(Number(value))}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex w-full flex-col gap-2">
        {data.map((c, i) => (
          <div key={c.category} className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-ink">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
              />
              {c.category}
            </span>
            <span className="font-mono text-ink-muted">{currency(c.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
