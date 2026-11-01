import React, { useState, useMemo } from 'react';
import { StockItem } from '../types/market';
import { formatCurrencyValue } from '../utils/currency';

interface GlobalMarketHeatmapProps {
  stocks: StockItem[];
  onSelectStock: (stockId: string) => void;
  baseCurrency: string;
}

export const GlobalMarketHeatmap: React.FC<GlobalMarketHeatmapProps> = ({
  stocks,
  onSelectStock,
  baseCurrency,
}) => {
  const [regionFilter, setRegionFilter] = useState<'ALL' | 'US' | 'INDIA' | 'EUROPE' | 'ASIA'>('ALL');
  const [groupBy, setGroupBy] = useState<'SECTOR' | 'COUNTRY'>('SECTOR');
  const [hoveredStock, setHoveredStock] = useState<StockItem | null>(null);

  const filteredStocks = useMemo(() => {
    return stocks.filter((s) => {
      if (regionFilter === 'US') return s.country === 'United States';
      if (regionFilter === 'INDIA') return s.country === 'India';
      if (regionFilter === 'EUROPE') return s.country === 'United Kingdom' || s.country === 'Germany' || s.country === 'France' || s.country === 'Netherlands';
      if (regionFilter === 'ASIA') return s.country === 'Japan' || s.country === 'Hong Kong' || s.country === 'Taiwan' || s.country === 'South Korea' || s.country === 'Australia';
      return true;
    });
  }, [stocks, regionFilter]);

  // Group stocks
  const groupedData = useMemo(() => {
    const groups: Record<string, StockItem[]> = {};
    filteredStocks.forEach((s) => {
      const key = groupBy === 'SECTOR' ? s.sector : s.country;
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    });

    // Sort groups by total stock count
    return Object.entries(groups).sort((a, b) => b[1].length - a[1].length);
  }, [filteredStocks, groupBy]);

  // Color mapper based on change percentage (-5% to +5%)
  const getTileColor = (pct: number) => {
    if (pct >= 3.0) return 'bg-emerald-600/90 text-white border-emerald-400/80 shadow-[0_0_12px_rgba(16,185,129,0.35)]';
    if (pct >= 1.5) return 'bg-emerald-700/80 text-emerald-100 border-emerald-500/60';
    if (pct > 0.3) return 'bg-emerald-900/60 text-emerald-200 border-emerald-700/50';
    if (pct >= -0.3) return 'bg-slate-900 text-slate-300 border-slate-800';
    if (pct > -1.5) return 'bg-rose-950/70 text-rose-200 border-rose-800/50';
    if (pct > -3.0) return 'bg-rose-900/80 text-rose-100 border-rose-600/60';
    return 'bg-rose-700/90 text-white border-rose-400/80 shadow-[0_0_12px_rgba(244,63,94,0.35)]';
  };

  // Determine relative sizing
  const getTileSizeClass = (stock: StockItem) => {
    // Large-cap weights (NVDA, AAPL, MSFT, RELIANCE, TSMC get extra prominent real estate)
    const megaCaps = ['NVDA', 'AAPL', 'MSFT', 'RELIANCE', 'TSMC', 'GOOGL', 'AMZN', 'TCS'];
    if (megaCaps.includes(stock.symbol)) {
      return 'col-span-2 row-span-2 min-h-[95px] p-3';
    }
    return 'col-span-1 min-h-[72px] p-2';
  };

  return (
    <div className="bg-[#0b0f17] border border-slate-800/90 rounded-xl p-4 space-y-4 shadow-xl">
      {/* Heatmap Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-cyan-400 text-sm">🌐</span>
            <h3 className="text-sm font-bold text-white tracking-tight">Interactive Global Market Capitalization Heatmap</h3>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950 text-cyan-300 border border-cyan-800">
              Live Flow Map
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Tile geometry weighted by market capitalization; luminous hue corresponds to 24-hour return velocity.
          </p>
        </div>

        {/* Region & Group Selectors */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-[#070a0f] p-1 rounded-lg border border-slate-800 text-xs font-mono">
            {(['ALL', 'US', 'INDIA', 'EUROPE', 'ASIA'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRegionFilter(r)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  regionFilter === r
                    ? 'bg-slate-800 text-cyan-300 font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-[#070a0f] p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setGroupBy('SECTOR')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                groupBy === 'SECTOR'
                  ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              By Sector
            </button>
            <button
              onClick={() => setGroupBy('COUNTRY')}
              className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                groupBy === 'COUNTRY'
                  ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              By Country
            </button>
          </div>
        </div>
      </div>

      {/* Color Legend */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
        <div className="flex items-center gap-1.5">
          <span>Capitulation</span>
          <div className="flex items-center gap-1">
            <span className="w-4 h-2.5 rounded-sm bg-rose-700 inline-block" title="≤ -3.0%" />
            <span className="w-4 h-2.5 rounded-sm bg-rose-900 inline-block" title="-1.5%" />
            <span className="w-4 h-2.5 rounded-sm bg-slate-800 inline-block" title="0.0%" />
            <span className="w-4 h-2.5 rounded-sm bg-emerald-900 inline-block" title="+1.5%" />
            <span className="w-4 h-2.5 rounded-sm bg-emerald-600 inline-block" title="≥ +3.0%" />
          </div>
          <span>Expansion</span>
        </div>
        <div>
          Showing <span className="text-white font-bold">{filteredStocks.length}</span> equities across <span className="text-white font-bold">{groupedData.length}</span> {groupBy.toLowerCase()} clusters
        </div>
      </div>

      {/* Treemap Cluster Grid */}
      <div className="space-y-4">
        {groupedData.map(([groupName, groupStocks]) => {
          const groupAvgChange = groupStocks.reduce((acc, s) => acc + s.changePercent, 0) / groupStocks.length;
          const isUp = groupAvgChange >= 0;

          return (
            <div key={groupName} className="bg-[#070a0f] p-3 rounded-lg border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white tracking-wide">{groupName}</span>
                  <span className="text-[10px] font-mono text-slate-400">({groupStocks.length} stocks)</span>
                </div>
                <div className={`font-mono text-[11px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUp ? '+' : ''}{groupAvgChange.toFixed(2)}% Avg
                </div>
              </div>

              {/* Grid of Stock Tiles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2">
                {groupStocks.map((stock) => {
                  const colorClass = getTileColor(stock.changePercent);
                  const sizeClass = getTileSizeClass(stock);
                  const isPositive = stock.changePercent >= 0;

                  return (
                    <div
                      key={stock.id}
                      onClick={() => onSelectStock(stock.id)}
                      onMouseEnter={() => setHoveredStock(stock)}
                      onMouseLeave={() => setHoveredStock(null)}
                      className={`${colorClass} ${sizeClass} rounded border cursor-pointer transition-all hover:scale-[1.02] hover:z-20 flex flex-col justify-between group`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-bold font-mono text-xs sm:text-sm tracking-tight group-hover:underline">
                          {stock.symbol}
                        </span>
                        <span className="text-[9px] font-mono opacity-80 uppercase">
                          {stock.country.slice(0, 3)}
                        </span>
                      </div>

                      <div>
                        <div className="text-[11px] sm:text-xs font-mono font-bold">
                          {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </div>
                        <div className="text-[10px] font-mono opacity-75 truncate">
                          {formatCurrencyValue(stock.price, stock.currency)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Hover Card Detail Preview */}
      {hoveredStock && (
        <div className="bg-[#0e1420] border border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] p-3 rounded-lg flex items-center justify-between text-xs font-mono animate-fade-in">
          <div className="flex items-center gap-3">
            <span className="font-bold text-white text-sm">{hoveredStock.qualifiedSymbol}</span>
            <span className="text-slate-300">{hoveredStock.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
              {hoveredStock.sector} · {hoveredStock.exchange}
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-400 text-[10px] block font-sans">Price:</span>
              <span className="text-white font-bold">{formatCurrencyValue(hoveredStock.price, hoveredStock.currency)}</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-sans">RSI(14):</span>
              <span className={`font-bold ${hoveredStock.technicals.rsi14 <= 30 ? 'text-emerald-400' : hoveredStock.technicals.rsi14 >= 70 ? 'text-rose-400' : 'text-slate-300'}`}>
                {hoveredStock.technicals.rsi14.toFixed(1)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block font-sans">RVOL:</span>
              <span className="text-cyan-400 font-bold">{hoveredStock.technicals.rvol}x</span>
            </div>
            <button
              onClick={() => onSelectStock(hoveredStock.id)}
              className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] transition-colors"
            >
              Analyze Deeply →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
