import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Candle } from '../types/market';

interface CandleChartProps {
  candles: Candle[];
  currency: string;
  symbol: string;
  supportLevel?: number;
  resistanceLevel?: number;
}

export const CandleChart: React.FC<CandleChartProps> = ({
  candles,
  currency,
  symbol,
  supportLevel,
  resistanceLevel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverData, setHoverData] = useState<{ candle: Candle; x: number; y: number } | null>(null);

  // Timeframe filter state
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | 'ALL'>('3M');
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showBollinger, setShowBollinger] = useState(false);
  const [showVWAP, setShowVWAP] = useState(true);
  const [showSubChart, setShowSubChart] = useState<'VOLUME' | 'RSI'>('VOLUME');

  // Filter candles based on timeframe
  const filteredCandles = useMemo(() => {
    if (!candles || candles.length === 0) return [];
    if (timeframe === '1M') return candles.slice(-22);
    if (timeframe === '3M') return candles.slice(-66);
    if (timeframe === '6M') return candles.slice(-132);
    return candles;
  }, [candles, timeframe]);

  // Calculate moving averages and technical series
  const technicals = useMemo(() => {
    const data = filteredCandles;
    const len = data.length;
    const sma20: (number | null)[] = [];
    const sma50: (number | null)[] = [];
    const vwap: number[] = [];
    const rsi: (number | null)[] = [];
    const bbUpper: (number | null)[] = [];
    const bbLower: (number | null)[] = [];

    let cumulativeTypicalVol = 0;
    let cumulativeVol = 0;

    for (let i = 0; i < len; i++) {
      const c = data[i];
      const typical = (c.high + c.low + c.close) / 3;
      cumulativeTypicalVol += typical * c.volume;
      cumulativeVol += c.volume;
      vwap.push(cumulativeVol > 0 ? cumulativeTypicalVol / cumulativeVol : c.close);

      // SMA 20 & Bollinger
      if (i >= 19) {
        let sum = 0;
        for (let j = i - 19; j <= i; j++) sum += data[j].close;
        const mean = sum / 20;
        sma20.push(mean);

        let variance = 0;
        for (let j = i - 19; j <= i; j++) variance += Math.pow(data[j].close - mean, 2);
        const stdDev = Math.sqrt(variance / 20);
        bbUpper.push(mean + stdDev * 2);
        bbLower.push(mean - stdDev * 2);
      } else {
        sma20.push(null);
        bbUpper.push(null);
        bbLower.push(null);
      }

      // SMA 50
      if (i >= 49) {
        let sum = 0;
        for (let j = i - 49; j <= i; j++) sum += data[j].close;
        sma50.push(sum / 50);
      } else {
        sma50.push(null);
      }

      // 14-period RSI
      if (i >= 14) {
        let gainSum = 0;
        let lossSum = 0;
        for (let j = i - 13; j <= i; j++) {
          const diff = data[j].close - data[j - 1].close;
          if (diff >= 0) gainSum += diff;
          else lossSum += Math.abs(diff);
        }
        const avgGain = gainSum / 14;
        const avgLoss = lossSum / 14;
        if (avgLoss === 0) rsi.push(100);
        else {
          const rs = avgGain / avgLoss;
          rsi.push(100 - 100 / (1 + rs));
        }
      } else {
        rsi.push(null);
      }
    }

    return { sma20, sma50, vwap, bbUpper, bbLower, rsi };
  }, [filteredCandles]);

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || filteredCandles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.parentElement?.clientWidth || 800;
    const height = 440;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Margins
    const margin = { top: 20, right: 65, bottom: showSubChart ? 90 : 25, left: 10 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    const subChartTop = height - 75;
    const subChartHeight = 55;

    // Price Bounds
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let maxVol = 0;

    filteredCandles.forEach((c) => {
      if (c.low < minPrice) minPrice = c.low;
      if (c.high > maxPrice) maxPrice = c.high;
      if (c.volume > maxVol) maxVol = c.volume;
    });

    if (supportLevel) minPrice = Math.min(minPrice, supportLevel * 0.98);
    if (resistanceLevel) maxPrice = Math.max(maxPrice, resistanceLevel * 1.02);

    // Add 4% padding on vertical price axis
    const pricePadding = (maxPrice - minPrice) * 0.05;
    minPrice = Math.max(0.1, minPrice - pricePadding);
    maxPrice = maxPrice + pricePadding;
    const priceRange = maxPrice - minPrice;

    const getY = (val: number) => margin.top + (1 - (val - minPrice) / priceRange) * chartHeight;
    const candleCount = filteredCandles.length;
    const candleWidth = Math.max(2, (chartWidth / candleCount) * 0.68);
    const getX = (idx: number) => margin.left + (idx + 0.5) * (chartWidth / candleCount);

    // 1. Grid Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;

    // Horizontal Price Grids (5 ticks)
    ctx.fillStyle = '#64748b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';

    for (let i = 0; i <= 5; i++) {
      const p = minPrice + (priceRange * i) / 5;
      const y = getY(p);
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();

      ctx.fillText(p.toFixed(2), margin.left + chartWidth + 8, y + 3);
    }

    // 2. Support & Resistance Dashed Lines
    if (supportLevel && supportLevel >= minPrice && supportLevel <= maxPrice) {
      const y = getY(supportLevel);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#10b981';
      ctx.fillText(`Sup ${supportLevel.toFixed(1)}`, margin.left + chartWidth + 8, y + 3);
    }

    if (resistanceLevel && resistanceLevel >= minPrice && resistanceLevel <= maxPrice) {
      const y = getY(resistanceLevel);
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.6)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(margin.left, y);
      ctx.lineTo(margin.left + chartWidth, y);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#ef4444';
      ctx.fillText(`Res ${resistanceLevel.toFixed(1)}`, margin.left + chartWidth + 8, y + 3);
    }

    // 3. Technical Overlays
    // Bollinger Bands
    if (showBollinger) {
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      let startedUpper = false;
      for (let i = 0; i < candleCount; i++) {
        const u = technicals.bbUpper[i];
        if (u !== null) {
          const x = getX(i);
          const y = getY(u);
          if (!startedUpper) {
            ctx.moveTo(x, y);
            startedUpper = true;
          } else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      ctx.beginPath();
      let startedLower = false;
      for (let i = 0; i < candleCount; i++) {
        const l = technicals.bbLower[i];
        if (l !== null) {
          const x = getX(i);
          const y = getY(l);
          if (!startedLower) {
            ctx.moveTo(x, y);
            startedLower = true;
          } else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // SMA 20
    if (showSMA20) {
      ctx.strokeStyle = '#eab308'; // Amber/Yellow
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < candleCount; i++) {
        const val = technicals.sma20[i];
        if (val !== null) {
          const x = getX(i);
          const y = getY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // SMA 50
    if (showSMA50) {
      ctx.strokeStyle = '#3b82f6'; // Blue
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < candleCount; i++) {
        const val = technicals.sma50[i];
        if (val !== null) {
          const x = getX(i);
          const y = getY(val);
          if (!started) {
            ctx.moveTo(x, y);
            started = true;
          } else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // VWAP
    if (showVWAP) {
      ctx.strokeStyle = '#f97316'; // Orange
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let i = 0; i < candleCount; i++) {
        const val = technicals.vwap[i];
        const x = getX(i);
        const y = getY(val);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // 4. Render Candlesticks
    filteredCandles.forEach((c, idx) => {
      const x = getX(idx);
      const isUp = c.close >= c.open;
      const color = isUp ? '#10b981' : '#ef4444';

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, getY(c.high));
      ctx.lineTo(x, getY(c.low));
      ctx.stroke();

      // Body
      const topY = getY(Math.max(c.open, c.close));
      const bottomY = getY(Math.min(c.open, c.close));
      const bodyHeight = Math.max(1.5, bottomY - topY);

      ctx.fillStyle = color;
      ctx.fillRect(x - candleWidth / 2, topY, candleWidth, bodyHeight);
    });

    // 5. Sub-Chart: Volume or RSI
    if (showSubChart === 'VOLUME') {
      // Volume separator line
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.moveTo(margin.left, subChartTop);
      ctx.lineTo(margin.left + chartWidth, subChartTop);
      ctx.stroke();

      // Volume bars
      filteredCandles.forEach((c, idx) => {
        const x = getX(idx);
        const isUp = c.close >= c.open;
        const color = isUp ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)';
        const barHeight = (c.volume / (maxVol || 1)) * subChartHeight;
        ctx.fillStyle = color;
        ctx.fillRect(x - candleWidth / 2, subChartTop + subChartHeight - barHeight, candleWidth, barHeight);
      });

      ctx.fillStyle = '#64748b';
      ctx.fillText('VOL', margin.left + 5, subChartTop + 12);
    } else if (showSubChart === 'RSI') {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      ctx.moveTo(margin.left, subChartTop);
      ctx.lineTo(margin.left + chartWidth, subChartTop);
      ctx.stroke();

      // 70 and 30 guide lines
      const y70 = subChartTop + (1 - 0.7) * subChartHeight;
      const y30 = subChartTop + (1 - 0.3) * subChartHeight;

      ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)';
      ctx.beginPath();
      ctx.moveTo(margin.left, y70);
      ctx.lineTo(margin.left + chartWidth, y70);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(16, 185, 129, 0.3)';
      ctx.beginPath();
      ctx.moveTo(margin.left, y30);
      ctx.lineTo(margin.left + chartWidth, y30);
      ctx.stroke();

      // RSI Line
      ctx.strokeStyle = '#a855f7'; // Purple
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      let rsiStarted = false;
      for (let i = 0; i < candleCount; i++) {
        const val = technicals.rsi[i];
        if (val !== null) {
          const x = getX(i);
          const y = subChartTop + (1 - val / 100) * subChartHeight;
          if (!rsiStarted) {
            ctx.moveTo(x, y);
            rsiStarted = true;
          } else ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      ctx.fillStyle = '#a855f7';
      ctx.fillText('RSI (14)', margin.left + 5, subChartTop + 12);
      ctx.fillStyle = '#64748b';
      ctx.fillText('70', margin.left + chartWidth + 5, y70 + 3);
      ctx.fillText('30', margin.left + chartWidth + 5, y30 + 3);
    }
  }, [filteredCandles, technicals, showSMA20, showSMA50, showBollinger, showVWAP, showSubChart, supportLevel, resistanceLevel]);

  // Mouse hover event listener
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || filteredCandles.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const margin = { left: 10, right: 65 };
    const chartWidth = rect.width - margin.left - margin.right;
    const candleCount = filteredCandles.length;

    if (mouseX >= margin.left && mouseX <= margin.left + chartWidth) {
      const idx = Math.floor(((mouseX - margin.left) / chartWidth) * candleCount);
      if (idx >= 0 && idx < candleCount) {
        setHoverData({
          candle: filteredCandles[idx],
          x: mouseX,
          y: mouseY,
        });
        return;
      }
    }

    setHoverData(null);
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  const activeCandle = hoverData?.candle || filteredCandles[filteredCandles.length - 1];

  return (
    <div className="flex flex-col bg-[#0b0f17] border border-slate-800 rounded-lg p-3">
      {/* Chart Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs">
        {/* Left: Active Candle HUD metrics */}
        {activeCandle && (
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400 overflow-x-auto">
            <span className="text-slate-200 font-semibold">{activeCandle.time}</span>
            <span>
              O: <span className="text-slate-200">{activeCandle.open.toFixed(2)}</span>
            </span>
            <span>
              H: <span className="text-emerald-400">{activeCandle.high.toFixed(2)}</span>
            </span>
            <span>
              L: <span className="text-rose-400">{activeCandle.low.toFixed(2)}</span>
            </span>
            <span>
              C:{' '}
              <span className={activeCandle.close >= activeCandle.open ? 'text-emerald-400' : 'text-rose-400'}>
                {activeCandle.close.toFixed(2)}
              </span>
            </span>
            <span>
              Vol: <span className="text-slate-300">{(activeCandle.volume / 1000000).toFixed(2)}M</span>
            </span>
          </div>
        )}

        {/* Right: Technical Overlays & Timeframe selectors */}
        <div className="flex items-center gap-2">
          {/* Overlays */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded border border-slate-800 text-[11px]">
            <button
              onClick={() => setShowSMA20(!showSMA20)}
              className={`px-2 py-0.5 rounded ${showSMA20 ? 'bg-yellow-500/20 text-yellow-400 font-medium' : 'text-slate-500 hover:text-slate-300'}`}
            >
              SMA20
            </button>
            <button
              onClick={() => setShowSMA50(!showSMA50)}
              className={`px-2 py-0.5 rounded ${showSMA50 ? 'bg-blue-500/20 text-blue-400 font-medium' : 'text-slate-500 hover:text-slate-300'}`}
            >
              SMA50
            </button>
            <button
              onClick={() => setShowVWAP(!showVWAP)}
              className={`px-2 py-0.5 rounded ${showVWAP ? 'bg-orange-500/20 text-orange-400 font-medium' : 'text-slate-500 hover:text-slate-300'}`}
            >
              VWAP
            </button>
            <button
              onClick={() => setShowBollinger(!showBollinger)}
              className={`px-2 py-0.5 rounded ${showBollinger ? 'bg-cyan-500/20 text-cyan-400 font-medium' : 'text-slate-500 hover:text-slate-300'}`}
            >
              BB
            </button>
            <button
              onClick={() => setShowSubChart(showSubChart === 'VOLUME' ? 'RSI' : 'VOLUME')}
              className={`px-2 py-0.5 rounded ${showSubChart === 'RSI' ? 'bg-purple-500/20 text-purple-400 font-medium' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {showSubChart}
            </button>
          </div>

          {/* Timeframes */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded border border-slate-800 text-[11px]">
            {(['1M', '3M', '6M', 'ALL'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-0.5 rounded ${timeframe === tf ? 'bg-slate-700 text-white font-medium' : 'text-slate-400 hover:text-slate-200'}`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas Chart Area */}
      <div ref={containerRef} className="relative w-full h-[440px] mt-2 cursor-crosshair">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="w-full h-full block"
        />

        {/* Legend Notes */}
        <div className="absolute top-2 left-2 flex items-center gap-3 text-[10px] font-mono pointer-events-none opacity-80">
          <span className="text-yellow-400">● SMA 20</span>
          <span className="text-blue-400">● SMA 50</span>
          <span className="text-orange-400">● VWAP</span>
          {showBollinger && <span className="text-cyan-400">● Bollinger Bands</span>}
        </div>
      </div>
    </div>
  );
};
