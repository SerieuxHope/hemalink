import React from 'react';

interface DataPoint {
  label: string;
  value: number;
  benchmark?: number;
}

interface TrendChartProps {
  data: DataPoint[];
  height?: number;
  color?: string;
  title?: string;
  unit?: string;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  data,
  height = 140,
  color = '#0F766E', // Teal
  title,
  unit = 'units',
}) => {
  if (!data || data.length === 0) return null;

  const width = 500;
  const padding = 24;
  const graphWidth = width - padding * 2;
  const graphHeight = height - padding * 2;

  const maxValue = Math.max(...data.map((d) => Math.max(d.value, d.benchmark || 0)), 15);
  const minValue = 0;
  const valueRange = maxValue - minValue || 1;

  // Calculate coordinates
  const points = data.map((d, index) => {
    const x = padding + (index / (data.length - 1 || 1)) * graphWidth;
    const y = height - padding - ((d.value - minValue) / valueRange) * graphHeight;
    return { x, y, ...d };
  });

  const pathString = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaString = `${pathString} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

  return (
    <div style={{ width: '100%' }}>
      {title && (
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px' }}>
          {title}
        </div>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height: 'auto', overflow: 'visible' }}
        role="img"
        aria-label={title || 'Inventory Trend'}
      >
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((pct, i) => {
          const y = height - padding - pct * graphHeight;
          const val = Math.round(minValue + pct * valueRange);
          return (
            <g key={i}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#E8EEF2"
                strokeDasharray="3 3"
                strokeWidth="1"
              />
              <text
                x={padding - 6}
                y={y + 3}
                fontSize="10"
                fill="#8493A0"
                textAnchor="end"
                fontFamily="var(--font-mono)"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Shaded Area */}
        <path d={areaString} fill="url(#trendGradient)" />

        {/* Trend Line */}
        <path d={pathString} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3.5" fill="#ffffff" stroke={color} strokeWidth="2" />
            <text
              x={p.x}
              y={height - 8}
              fontSize="10"
              fill="#8493A0"
              textAnchor="middle"
              fontFamily="var(--font-mono)"
            >
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
