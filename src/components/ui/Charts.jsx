import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  BarChart,
  Bar,
} from 'recharts';

function useChartColors() {
  if (typeof window === 'undefined') {
    return { accent: '#1f6b5c', gold: '#b8956a', grid: '#e4dccb', text: '#5e594f' };
  }
  const styles = getComputedStyle(document.documentElement);
  return {
    accent: styles.getPropertyValue('--accent').trim() || '#1f6b5c',
    gold: styles.getPropertyValue('--gold').trim() || '#b8956a',
    grid: styles.getPropertyValue('--border').trim() || '#e4dccb',
    text: styles.getPropertyValue('--text-secondary').trim() || '#5e594f',
  };
}

export function AreaTrendChart({ data, xKey = 'label', yKey = 'value', height = 240, fillId = 'areaFill' }) {
  const colors = useChartColors();

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.accent} stopOpacity={0.28} />
              <stop offset="100%" stopColor={colors.accent} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis dataKey={xKey} tick={{ fill: colors.text, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: colors.text, fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 12,
            }}
          />
          <Area type="monotone" dataKey={yKey} stroke={colors.accent} fill={`url(#${fillId})`} strokeWidth={2.2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryBarChart({ data, xKey = 'label', yKey = 'value', height = 240 }) {
  const colors = useChartColors();

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis dataKey={xKey} tick={{ fill: colors.text, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: colors.text, fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 12,
            }}
          />
          <Bar dataKey={yKey} fill={colors.gold} radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function DualTrendChart({
  data,
  xKey = 'label',
  aKey = 'income',
  bKey = 'expense',
  height = 240,
  fillId = 'dualFill',
}) {
  const colors = useChartColors();

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`${fillId}A`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.accent} stopOpacity={0.26} />
              <stop offset="100%" stopColor={colors.accent} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id={`${fillId}B`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.gold} stopOpacity={0.24} />
              <stop offset="100%" stopColor={colors.gold} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={colors.grid} vertical={false} />
          <XAxis dataKey={xKey} tick={{ fill: colors.text, fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: colors.text, fontSize: 12 }} axisLine={false} tickLine={false} width={36} />
          <Tooltip
            contentStyle={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 12,
            }}
          />
          <Area type="monotone" dataKey={aKey} stroke={colors.accent} fill={`url(#${fillId}A)`} strokeWidth={2.2} />
          <Area type="monotone" dataKey={bKey} stroke={colors.gold} fill={`url(#${fillId}B)`} strokeWidth={2.2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function Sparkline({ data, yKey = 'value', tone = 'accent', height = 52 }) {
  const colors = useChartColors();
  const stroke = tone === 'gold' ? colors.gold : colors.accent;
  const fillId = `spark-${tone}-${yKey}`;

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.32} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey={yKey} stroke={stroke} fill={`url(#${fillId})`} strokeWidth={1.8} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
