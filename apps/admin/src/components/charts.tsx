import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { money } from '../lib/format';

const BRAND = '#1B498C';

/** Área de faturamento com gradiente. */
export function RevenueAreaChart({
  data,
}: {
  data: Array<{ label: string; valor: number; pedidos: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={BRAND} stopOpacity={0.35} />
            <stop offset="95%" stopColor={BRAND} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#9AA3B2' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
          minTickGap={32}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9AA3B2' }}
          axisLine={false}
          tickLine={false}
          width={56}
          tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v))}
        />
        <Tooltip
          formatter={((v: unknown) => [money(Number(v)), 'Faturamento']) as never}
          labelStyle={{ color: '#093A67', fontWeight: 600 }}
          contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12 }}
        />
        <Area
          type="monotone"
          dataKey="valor"
          stroke={BRAND}
          strokeWidth={2.5}
          fill="url(#revGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

/** Donut de pedidos por status. */
export function StatusDonut({
  data,
}: {
  data: Array<{ label: string; value: number; color: string }>;
}) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div className="flex items-center gap-4">
      <div className="relative" style={{ width: 150, height: 150 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              innerRadius={48}
              outerRadius={70}
              paddingAngle={2}
              stroke="none"
            >
              {data.map((d) => (
                <Cell key={d.label} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={((v: unknown, n: unknown) => [`${Number(v)} pedidos`, n]) as never}
              contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-brand-700">{total}</span>
          <span className="text-[10px] text-ink-400">pedidos</span>
        </div>
      </div>
      <div className="flex-1 space-y-1.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2 text-sm">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
            <span className="flex-1 text-ink-700">{d.label}</span>
            <span className="font-semibold text-ink-900">{d.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Barras horizontais de ranking (top clientes/produtos). */
export function RankingBars({
  data,
}: {
  data: Array<{ label: string; value: number }>;
}) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 42)}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fontSize: 11, fill: '#5B6573' }}
          axisLine={false}
          tickLine={false}
          width={150}
        />
        <Tooltip
          formatter={((v: unknown) => [money(Number(v)), 'Faturamento']) as never}
          contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 12 }}
          cursor={{ fill: 'rgba(27,73,140,0.05)' }}
        />
        <Bar dataKey="value" fill={BRAND} radius={[0, 6, 6, 0]} barSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Sparkline minúsculo para os KPI cards. */
export function Sparkline({ data, color = BRAND }: { data: number[]; color?: string }) {
  const chart = data.map((v, i) => ({ i, v }));
  return (
    <ResponsiveContainer width="100%" height={36}>
      <AreaChart data={chart} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`spark-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#spark-${color})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
