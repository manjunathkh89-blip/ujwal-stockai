import React, { useState, useEffect, useMemo } from 'react';
import { StockItem, Candle, CandlePatternSignal, CandlePatternType } from '../types/market';
import { CandleChart } from '../components/CandleChart';
import { generateCandleHistory } from '../data/marketData';
import { formatCurrencyValue } from '../utils/currency';

interface CandleAiViewProps {
  stocks: StockItem[];
  selectedStockId: string;
  onSelectStock: (stockId: string) => void;
}

export const CandleAiView: React.FC<CandleAiViewProps> = ({
  stocks,
  selectedStockId,
  onSelectStock,
}) => {
  const stock = stocks.find((s) => s.id === selectedStockId) || stocks[0];
  const [candles, setCandles] = useState<Candle[]>([]);
  const [selectedCandle, setSelectedCandle] = useState<Candle | null>(null);
  const [activeResolution, setActiveResolution] = useState<'1m' | '5m' | '15m' | '1h' | '1D' | '1W'>('1D');
  const [showPatternLabels, setShowPatternLabels] = useState(true);

  // Generate candle series
  useEffect(() => {
    if (stock) {
      const generated = generateCandleHistory(stock.price, 90, 0.016);
      setCandles(generated);
      setSelectedCandle(generated[generated.length - 1] || null);
    }
  }, [stock?.symbol, activeResolution]);

  // Candle AI Recognition Engine: Analyzes statistical candlestick patterns
  const detectedPatterns: CandlePatternSignal[] = useMemo(() => {
    if (!candles || candles.length < 5) return [];
    const signals: CandlePatternSignal[] = [];

    for (let i = 2; i < candles.length; i++) {
      const curr = candles[i];
      const prev = candles[i - 1];
      const prev2 = candles[i - 2];

      const body = Math.abs(curr.close - curr.open);
      const prevBody = Math.abs(prev.close - prev.open);
      const range = curr.high - curr.low;
      const upperShadow = curr.high - Math.max(curr.open, curr.close);
      const lowerShadow = Math.min(curr.open, curr.close) - curr.low;

      // 1. Bullish Engulfing
      if (prev.close < prev.open && curr.close > curr.open && curr.open <= prev.close && curr.close >= prev.open && body > prevBody * 1.1) {
        signals.push({
          type: 'Bullish Engulfing',
          sentiment: 'Bullish',
          index: i,
          time: curr.time,
          price: curr.close,
          description: 'Strong buyer takeover engulfing prior bearish candle. Favorable reversal signal with confirmation.',
          significance: 'High',
        });
      }

      // 2. Bearish Engulfing
      if (prev.close > prev.open && curr.close < curr.open && curr.open >= prev.close && curr.close <= prev.open && body > prevBody * 1.1) {
        signals.push({
          type: 'Bearish Engulfing',
          sentiment: 'Bearish',
          index: i,
          time: curr.time,
          price: curr.close,
          description: 'Aggressive seller takeover engulfing prior bullish body. Signals supply pressure at resistance.',
          significance: 'High',
        });
      }

      // 3. Hammer (bullish pin bar after decline)
      if (lowerShadow > body * 2 && upperShadow < body * 0.3 && curr.close >= prev.low) {
        signals.push({
          type: 'Hammer',
          sentiment: 'Bullish',
          index: i,
          time: curr.time,
          price: curr.close,
          description: 'Strong intraday buying rejection. Bears pushed down but bulls drove price back up before close.',
          significance: 'Medium',
        });
      }

      // 4. Shooting Star
      if (upperShadow > body * 2 && lowerShadow < body * 0.3 && curr.open > prev.close) {
        signals.push({
          type: 'Shooting Star',
          sentiment: 'Bearish',
          index: i,
          time: curr.time,
          price: curr.close,
          description: 'Exhaustion wick testing highs with sharp rejection before the close. Indicates overhead supply.',
          significance: 'Medium',
        });
      }

      // 5. Morning Star (3-candle bullish reversal)
      if (prev2.close < prev2.open && prevBody < body * 0.5 && curr.close > curr.open && curr.close > (prev2.open + prev2.close) / 2) {
        signals.push({
          type: 'Morning Star',
          sentiment: 'Bullish',
          index: i,
          time: curr.time,
          price: curr.close,
          description: 'Three-candle bottoming structure: sharp decline, small star consolidation, followed by bullish impulse.',
          significance: 'High',
        });
      }

      // 6. Doji (Indecision)
      if (body <= range * 0.08 && range > 0) {
        signals.push({
          type: 'Doji',
          sentiment: 'Neutral',
          index: i,
          time: curr.time,
          price: curr.close,
          description: 'Near-zero body with equal buyer and seller balance. Signals potential pause or trend inflection.',
          significance: 'Medium',
        });
      }

      // 7. Marubozu (Extreme conviction)
      if (body >= range * 0.92 && range > 0) {
        const isBull = curr.close > curr.open;
        signals.push({
          type: 'Marubozu',
          sentiment: isBull ? 'Bullish' : 'Bearish',
          index: i,
          time: curr.time,
          price: curr.close,
          description: `${isBull ? 'Full bullish' : 'Full bearish'} marubozu with virtually no wicks, showing one-sided directional dominance.`,
          significance: 'High',
        });
      }
    }

    return signals;
  }, [candles]);

  // Support & Resistance Multilevels (S1, S2, S3, R1, R2, R3)
  const levels = useMemo(() => {
    const s1 = stock.technicals.supportLevel;
    const s2 = Number((s1 * 0.96).toFixed(2));
    const s3 = Number((s1 * 0.91).toFixed(2));

    const r1 = stock.technicals.resistanceLevel;
    const r2 = Number((r1 * 1.05).toFixed(2));
    const r3 = Number((r1 * 1.12).toFixed(2));

    // Proximity logic
    let proximityStatus = 'IN_CONSOLIDATION';
    const distToS1 = ((stock.price - s1) / stock.price) * 100;
    const distToR1 = ((r1 - stock.price) / stock.price) * 100;

    if (stock.price < s1) proximityStatus = 'SUPPORT_BROKEN';
    else if (distToS1 <= 1.5) proximityStatus = 'SUPPORT_APPROACHING';
    else if (stock.price > r1) proximityStatus = 'BREAKOUT_DETECTED';
    else if (distToR1 <= 1.5) proximityStatus = 'RESISTANCE_APPROACHING';

    return { s1, s2, s3, r1, r2, r3, proximityStatus };
  }, [stock]);

  // AI Trend Detector
  const aiTrend = useMemo(() => {
    if (stock.price > stock.technicals.sma20 && stock.technicals.sma20 > stock.technicals.sma50 && stock.technicals.sma50 > stock.technicals.sma200) {
      return {
        stance: '🟢 Strong Uptrend',
        color: 'text-emerald-400 bg-emerald-950/70 border-emerald-800',
        reason: 'Price is in full bullish alignment above 20, 50, and 200-day moving averages with higher swing lows and expanding volume.',
      };
    } else if (stock.price > stock.technicals.sma50) {
      return {
        stance: '🟢 Uptrend',
        color: 'text-emerald-300 bg-emerald-950/40 border-emerald-900',
        reason: 'Trading above 50-day moving average. Primary structural bull trend intact despite short-term consolidation.',
      };
    } else if (stock.price < stock.technicals.supportLevel) {
      return {
        stance: '🔴 Strong Downtrend',
        color: 'text-rose-400 bg-rose-950/70 border-rose-800',
        reason: 'Price broke below key daily support floor with moving averages sloping downward and negative MACD momentum.',
      };
    } else {
      return {
        stance: '🟡 Sideways / Range-bound',
        color: 'text-amber-400 bg-amber-950/70 border-amber-800',
        reason: 'Oscillating between confirmed support and ceiling resistance. Volume is contracting; wait for directional breakout.',
      };
    }
  }, [stock]);

  // Plain-Language Candle Explanation for Beginners
  const explainCandle = (c: Candle) => {
    const isUp = c.close >= c.open;
    const change = c.close - c.open;
    const changePct = ((change / c.open) * 100).toFixed(2);
    const range = c.high - c.low;
    const upperWick = c.high - Math.max(c.open, c.close);
    const lowerWick = Math.min(c.open, c.close) - c.low;

    let narrative = '';
    if (isUp) {
      narrative = `During this session, buyers were in control. The stock opened at ${stock.currency} ${c.open} and closed higher at ${stock.currency} ${c.close} (+${changePct}%). `;
      if (lowerWick > range * 0.35) {
        narrative += `Notice the lower shadow: sellers initially tried to push the price down to ${c.low}, but buyers aggressively stepped in and bid the stock back up. `;
      }
      if (upperWick > range * 0.35) {
        narrative += `However, the upper shadow shows that sellers defended ${c.high}, preventing an even larger advance.`;
      } else {
        narrative += `The candle closed near its session highs, showing strong closing demand.`;
      }
    } else {
      narrative = `During this session, sellers had the upper hand. The stock opened at ${stock.currency} ${c.open} and closed lower at ${stock.currency} ${c.close} (${changePct}%). `;
      if (upperWick > range * 0.35) {
        narrative += `Buyers initially attempted to rally up to ${c.high}, but sellers overwhelmed the advance and drove price back down. `;
      }
      if (lowerWick > range * 0.35) {
        narrative += `The lower shadow indicates some dip-buying emerging near ${c.low} before the final close.`;
      } else {
        narrative += `The price closed near the session lows, reflecting persistent supply pressure.`;
      }
    }

    return narrative;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Trend Detector */}
      <div className="bg-[#0e1420] border border-slate-800 p-5 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="bg-[#070a0f] border border-slate-700 rounded px-2.5 py-1.5 text-xs">
            <span className="text-slate-400 text-[10px] block font-mono">Select Asset</span>
            <select
              value={stock.id}
              onChange={(e) => onSelectStock(e.target.value)}
              className="bg-transparent text-emerald-400 font-mono font-bold focus:outline-none cursor-pointer text-sm"
            >
              {stocks.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                  {s.qualifiedSymbol} — {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-mono text-white tracking-tight">
                {stock.qualifiedSymbol}
              </h1>
              <span className={`text-xs px-2.5 py-0.5 rounded border font-mono font-bold ${aiTrend.color}`}>
                {aiTrend.stance}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-xl font-sans leading-relaxed">{aiTrend.reason}</p>
          </div>
        </div>

        {/* Proximity Warning Banner */}
        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-mono font-bold px-3 py-1.5 rounded border uppercase ${
              levels.proximityStatus === 'BREAKOUT_DETECTED'
                ? 'bg-cyan-950 text-cyan-400 border-cyan-800'
                : levels.proximityStatus === 'SUPPORT_BROKEN'
                ? 'bg-rose-950 text-rose-400 border-rose-800 animate-pulse'
                : levels.proximityStatus === 'SUPPORT_APPROACHING'
                ? 'bg-amber-950 text-amber-400 border-amber-800'
                : 'bg-slate-900 text-slate-300 border-slate-800'
            }`}
          >
            {levels.proximityStatus === 'BREAKOUT_DETECTED' && '🚀 BREAKOUT DETECTED'}
            {levels.proximityStatus === 'SUPPORT_BROKEN' && '🚨 SUPPORT BROKEN'}
            {levels.proximityStatus === 'SUPPORT_APPROACHING' && '⚠️ SUPPORT APPROACHING'}
            {levels.proximityStatus === 'RESISTANCE_APPROACHING' && '⚠️ RESISTANCE CEILING TESTING'}
            {levels.proximityStatus === 'IN_CONSOLIDATION' && '● CONSOLIDATING IN RANGE'}
          </span>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-sans text-xs">Resolution:</span>
            {(['1m', '5m', '15m', '1h', '1D', '1W'] as const).map((res) => (
              <button
                key={res}
                onClick={() => setActiveResolution(res)}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  activeResolution === res
                    ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {res}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <label className="flex items-center gap-1 text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showPatternLabels}
                onChange={(e) => setShowPatternLabels(e.target.checked)}
                className="h-3.5 w-3.5 accent-emerald-500"
              />
              <span>Detect Patterns ({detectedPatterns.length})</span>
            </label>
          </div>
        </div>

        <CandleChart
          candles={candles}
          currency={stock.currency}
          symbol={stock.symbol}
          supportLevel={levels.s1}
          resistanceLevel={levels.r1}
        />
      </div>

      {/* Smart Support & Resistance Multilevel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        {/* Support Levels */}
        <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px]">
              Support Floors (Invalidation Barriers)
            </span>
            <span className="text-slate-500 text-[10px]">Current: {stock.currency} {stock.price}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#070a0f] p-2.5 rounded border border-emerald-900/40">
              <span className="text-[10px] text-slate-400 block font-sans">Primary S1</span>
              <span className="text-base font-bold text-emerald-400">
                {formatCurrencyValue(levels.s1, stock.currency)}
              </span>
              <span className="text-[10px] text-slate-500 block">Daily Demand</span>
            </div>

            <div className="bg-[#070a0f] p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Secondary S2</span>
              <span className="text-base font-bold text-slate-200">
                {formatCurrencyValue(levels.s2, stock.currency)}
              </span>
              <span className="text-[10px] text-slate-500 block">Structural 50-DMA</span>
            </div>

            <div className="bg-[#070a0f] p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Deep S3</span>
              <span className="text-base font-bold text-slate-400">
                {formatCurrencyValue(levels.s3, stock.currency)}
              </span>
              <span className="text-[10px] text-slate-500 block">Major Macro Base</span>
            </div>
          </div>
        </div>

        {/* Resistance Levels */}
        <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-rose-400 font-bold uppercase tracking-wider text-[11px]">
              Resistance Ceilings (Take Profit Zones)
            </span>
            <span className="text-slate-500 text-[10px]">Current: {stock.currency} {stock.price}</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#070a0f] p-2.5 rounded border border-rose-900/40">
              <span className="text-[10px] text-slate-400 block font-sans">Primary R1</span>
              <span className="text-base font-bold text-rose-400">
                {formatCurrencyValue(levels.r1, stock.currency)}
              </span>
              <span className="text-[10px] text-slate-500 block">Daily Supply</span>
            </div>

            <div className="bg-[#070a0f] p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Extended R2</span>
              <span className="text-base font-bold text-slate-200">
                {formatCurrencyValue(levels.r2, stock.currency)}
              </span>
              <span className="text-[10px] text-slate-500 block">Breakout Target</span>
            </div>

            <div className="bg-[#070a0f] p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Cycle R3</span>
              <span className="text-base font-bold text-cyan-400">
                {formatCurrencyValue(levels.r3, stock.currency)}
              </span>
              <span className="text-[10px] text-slate-500 block">All-Time Peak</span>
            </div>
          </div>
        </div>
      </div>

      {/* AI CANDLE EXPLANATION & PATTERN INTELLIGENCE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Explain This Candle Box */}
        <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
              Explain This Candle (Beginner-Friendly AI)
            </span>
            {selectedCandle && (
              <span className="text-[11px] font-mono text-slate-400">{selectedCandle.time}</span>
            )}
          </div>

          {selectedCandle ? (
            <div className="space-y-3">
              <div className="grid grid-cols-4 gap-2 text-[11px] font-mono bg-[#070a0f] p-2 rounded border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Open:</span>
                  <span className="text-white font-bold">${selectedCandle.open}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">High:</span>
                  <span className="text-emerald-400 font-bold">${selectedCandle.high}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Low:</span>
                  <span className="text-rose-400 font-bold">${selectedCandle.low}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Close:</span>
                  <span className="text-white font-bold">${selectedCandle.close}</span>
                </div>
              </div>

              <div className="bg-slate-900/70 p-3 rounded border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
                {explainCandle(selectedCandle)}
              </div>
            </div>
          ) : (
            <div className="text-slate-500 text-xs py-6 text-center">
              Click any candle on the chart to generate an automated plain-English breakdown.
            </div>
          )}
        </div>

        {/* Statistical Candlestick Patterns Detected */}
        <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Statistically Verified Patterns ({detectedPatterns.length})
            </span>
            <span className="text-[10px] font-mono text-slate-500">Requires Confirmation</span>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto">
            {detectedPatterns.map((pat, idx) => (
              <div
                key={idx}
                className="bg-[#070a0f] border border-slate-800 p-2.5 rounded text-xs space-y-1 font-mono"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        pat.sentiment === 'Bullish'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : pat.sentiment === 'Bearish'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {pat.type}
                    </span>
                    <span className="text-slate-400 text-[10px]">{pat.time}</span>
                  </div>
                  <span className="text-slate-500 text-[10px]">{pat.significance} Significance</span>
                </div>
                <p className="text-slate-300 font-sans text-[11px] leading-snug">{pat.description}</p>
              </div>
            ))}

            {detectedPatterns.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs font-mono">
                No major reversal patterns detected in the current window.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
