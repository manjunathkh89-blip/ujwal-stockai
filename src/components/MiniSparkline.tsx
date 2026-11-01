import React, { useMemo } from 'react';

interface MiniSparklineProps {
  points: number[];
  isPositive: boolean;
  width?: number;
  height?: number;
}

export const MiniSparkline: React.FC<MiniSparklineProps> = ({
  points,
  isPositive,
  width = 96,
  height = 28,
}) => {
  const { pathData, areaData, minVal, maxVal, lastX, lastY } = useMemo(() => {
    if (!points || points.length < 2) {
      return { pathData: '', areaData: '', minVal: 0, maxVal: 0, lastX: 0, lastY: 0 };
    }

    let min = Infinity;
    let max = -Infinity;
    points.forEach((p) => {
      if (p < min) min = p;
      if (p > max) max = p;
    });

    const padding = (max - min) * 0.1 || 1;
    const yMin = min - padding;
    const yMax = max + padding;
    const range = yMax - yMin;

    const count = points.length;
    const stepX = width / (count - 1);

    const coords = points.map((p, i) => {
      const x = i * stepX;
      const y = height - ((p - yMin) / range) * height;
      return { x, y };
    });

    const path = coords.reduce((acc, c, i) => {
      return i === 0 ? `M ${c.x.toFixed(1)} ${c.y.toFixed(1)}` : `${acc} L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
    }, '');

    const area = `${path} L ${width} ${height} L 0 ${height} Z`;

    const last = coords[coords.length - 1];

    return {
      pathData: path,
      areaData: area,
      minVal: min,
      maxVal: max,
      lastX: last.x,
      lastY: last.y,
    };
  }, [points, width, height]);

  if (!pathData) {
    return <div className="w-24 h-7 bg-slate-900/50 rounded animate-pulse" />;
  }

  const strokeColor = isPositive ? '#10b981' : '#ef4444';
  const gradientId = `spark-grad-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      className="inline-flex items-center justify-center select-none"
      title={`24h High: ${maxVal.toFixed(2)} · Low: ${minVal.toFixed(2)}`}
    >
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.28} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Gradient fill underneath curve */}
        <path d={areaData} fill={`url(#${gradientId})`} />

        {/* Sparkline stroke path */}
        <path
          d={pathData}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pulsing Dot at Latest Price Point */}
        <circle cx={lastX} cy={lastY} r="2.2" fill={strokeColor} />
        <circle
          cx={lastX}
          cy={lastY}
          r="4.2"
          fill={strokeColor}
          className="animate-ping opacity-75"
        />
      </svg>
    </div>
  );
};

// Generates 24 realistic hourly price points connecting open, intraday high/low, and latest price
export function generate24hPricePoints(
  currentPrice: number,
  changePercent: number,
  dayHigh?: number,
  dayLow?: number,
  seedStr = 'aapl'
): number[] {
  const points: number[] = [];
  const open24h = currentPrice / (1 + changePercent / 100);
  const high = dayHigh || Math.max(open24h, currentPrice) * 1.012;
  const low = dayLow || Math.min(open24h, currentPrice) * 0.988;

  // Pseudo-random deterministic seed
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed += seedStr.charCodeAt(i);
  }

  for (let h = 0; h < 24; h++) {
    const progress = h / 23;
    // Base interpolation from 24h open to current price
    const baseInterp = open24h + (currentPrice - open24h) * progress;

    // Harmonic wave with deterministic pseudo-jitter
    const wave = Math.sin((h + (seed % 7)) * 0.55) * ((high - low) * 0.22);
    const jitter = Math.sin((h * 13 + seed) * 1.7) * ((high - low) * 0.08);

    let val = baseInterp + wave + jitter;

    // First point must be open, last point must be currentPrice
    if (h === 0) val = open24h;
    if (h === 23) val = currentPrice;

    // Clamp between dayLow and dayHigh
    val = Math.max(low, Math.min(high, val));
    points.push(Number(val.toFixed(2)));
  }

  return points;
}
