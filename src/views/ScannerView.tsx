import React, { useState, useEffect, useMemo } from 'react';
import { StockItem, BreakoutClassification, BuyScanRankedCandidate } from '../types/market';
import { formatCurrencyValue } from '../utils/currency';

interface ScannerViewProps {
  stocks: StockItem[];
  onSelectStock: (stockId: string) => void;
}

type ScannerTab = 'buy-opportunities' | 'breakout-patterns';
type RsiFilterOperator = 'ALL' | '<=' | '>=';

export const ScannerView: React.FC<ScannerViewProps> = ({ stocks, onSelectStock }) => {
  const [activeTab, setActiveTab] = useState<ScannerTab>('buy-opportunities');

  // AI Buy Opportunities State
  const [candidates, setCandidates] = useState<BuyScanRankedCandidate[]>([]);
  const [isLoadingScan, setIsLoadingScan] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Breakout Pattern Scanner State
  const [selectedClassification, setSelectedClassification] = useState<string>('ALL');
  const [selectedHorizon, setSelectedHorizon] = useState<string>('ALL');
  const [minRvol, setMinRvol] = useState<number>(1.0);

  // RSI Filter State (0 - 100 Slider with Oversold < 30 & Overbought > 70 Discovery)
  const [rsiOperator, setRsiOperator] = useState<RsiFilterOperator>('ALL');
  const [rsiThreshold, setRsiThreshold] = useState<number>(30);

  // Results View Format: Institutional Results Table vs Deep Cards
  const [viewFormat, setViewFormat] = useState<'table' | 'cards'>('table');

  // Fetch ranked opportunities from server
  const fetchRankedOpportunities = async () => {
    setIsLoadingScan(true);
    try {
      const res = await fetch('/api/advisor/buy-scan', { method: 'POST' });
      const data = await res.json();
      if (data.candidates) {
        setCandidates(data.candidates);
      }
    } catch (err) {
      console.error('Failed to fetch buy opportunities:', err);
    } finally {
      setIsLoadingScan(false);
    }
  };

  useEffect(() => {
    fetchRankedOpportunities();
  }, []);

  // Filter Buy Candidates with RSI
  const filteredCandidates = useMemo(() => {
    return candidates.filter((c) => {
      const matchCountry = selectedCountry === 'ALL' || c.country === selectedCountry;
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;

      // Extract RSI for this candidate
      const matchedStock = stocks.find((s) => s.symbol.toUpperCase() === c.symbol.toUpperCase());
      const candidateRsi = c.rsi ?? matchedStock?.technicals?.rsi14 ?? 50;

      let matchRsi = true;
      if (rsiOperator === '<=') {
        matchRsi = candidateRsi <= rsiThreshold;
      } else if (rsiOperator === '>=') {
        matchRsi = candidateRsi >= rsiThreshold;
      }

      return matchCountry && matchStatus && matchRsi;
    });
  }, [candidates, selectedCountry, statusFilter, rsiOperator, rsiThreshold, stocks]);

  // Breakout pattern signals from stocks
  const signals = useMemo(() => {
    return stocks
      .filter((s) => s.breakoutSignal)
      .map((s) => ({
        stock: s,
        signal: s.breakoutSignal!,
      }));
  }, [stocks]);

  const filteredSignals = useMemo(() => {
    return signals.filter(({ stock, signal }) => {
      const matchClass = selectedClassification === 'ALL' || signal.classification === selectedClassification;
      const matchHorizon = selectedHorizon === 'ALL' || signal.horizon.toLowerCase().includes(selectedHorizon.toLowerCase());
      const matchRvol = signal.rvol >= minRvol;
      const matchCountry = selectedCountry === 'ALL' || stock.country === selectedCountry;

      const stockRsi = stock.technicals.rsi14;
      let matchRsi = true;
      if (rsiOperator === '<=') {
        matchRsi = stockRsi <= rsiThreshold;
      } else if (rsiOperator === '>=') {
        matchRsi = stockRsi >= rsiThreshold;
      }

      return matchClass && matchHorizon && matchRvol && matchCountry && matchRsi;
    });
  }, [signals, selectedClassification, selectedHorizon, minRvol, selectedCountry, rsiOperator, rsiThreshold]);

  const classifications: BreakoutClassification[] = [
    'Potential Breakout',
    'Strong Momentum',
    'Reversal Candidate',
    'Unusual Volume',
    'Overextended',
    'Weakening Trend',
    'High Risk',
  ];

  const countries = ['ALL', 'United States', 'India', 'Japan', 'United Kingdom', 'Germany', 'Taiwan', 'Netherlands', 'Brazil'];

  // Quick RSI Presets
  const applyRsiPreset = (preset: 'ALL' | 'OVERSOLD' | 'PULLBACK' | 'OVERBOUGHT' | 'MOMENTUM') => {
    if (preset === 'ALL') {
      setRsiOperator('ALL');
    } else if (preset === 'OVERSOLD') {
      setRsiOperator('<=');
      setRsiThreshold(30);
    } else if (preset === 'PULLBACK') {
      setRsiOperator('<=');
      setRsiThreshold(45);
    } else if (preset === 'OVERBOUGHT') {
      setRsiOperator('>=');
      setRsiThreshold(70);
    } else if (preset === 'MOMENTUM') {
      setRsiOperator('>=');
      setRsiThreshold(60);
    }
  };

  // Helper: Secondary Visual Indicator with Color-Coded State Badge & Mini RSI Sparkline
  const renderRsiIndicator = (rsi: number, symbol = 'STOCK', compact = false) => {
    const isOversold = rsi <= 30;
    const isOverbought = rsi >= 70;
    const isPullback = rsi > 30 && rsi <= 45;
    const isRunaway = rsi >= 60 && rsi < 70;

    // Evaluate whether stock strictly satisfies the actively selected RSI filter slider
    const isFilterMatch =
      (rsiOperator === '<=' && rsi <= rsiThreshold) ||
      (rsiOperator === '>=' && rsi >= rsiThreshold);

    // Badge styling and status label
    let badgeStyle = 'text-slate-300 bg-slate-900 border-slate-700/80';
    let badgeText = 'NEUTRAL';
    let beaconColor = 'bg-slate-400';
    let strokeColor = '#94a3b8'; // slate

    if (isOversold) {
      badgeStyle = isFilterMatch
        ? 'text-emerald-300 bg-emerald-950/95 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.45)] ring-1 ring-emerald-400'
        : 'text-emerald-300 bg-emerald-950/90 border-emerald-500/70 shadow-[0_0_12px_rgba(16,185,129,0.3)]';
      badgeText = isFilterMatch ? '★ OVERSOLD' : 'OVERSOLD';
      beaconColor = 'bg-emerald-400';
      strokeColor = '#10b981';
    } else if (isOverbought) {
      badgeStyle = isFilterMatch
        ? 'text-rose-300 bg-rose-950/95 border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.45)] ring-1 ring-rose-400'
        : 'text-rose-300 bg-rose-950/90 border-rose-500/70 shadow-[0_0_12px_rgba(244,63,94,0.3)]';
      badgeText = isFilterMatch ? '★ OVERBOUGHT' : 'OVERBOUGHT';
      beaconColor = 'bg-rose-400';
      strokeColor = '#f43f5e';
    } else if (isPullback) {
      badgeStyle = 'text-amber-300 bg-amber-950/80 border-amber-600/60';
      badgeText = isFilterMatch ? '★ PULLBACK' : 'PULLBACK';
      beaconColor = 'bg-amber-400';
      strokeColor = '#f59e0b';
    } else if (isRunaway) {
      badgeStyle = 'text-cyan-300 bg-cyan-950/80 border-cyan-600/60';
      badgeText = isFilterMatch ? '★ MOMENTUM' : 'MOMENTUM';
      beaconColor = 'bg-cyan-400';
      strokeColor = '#06b6d4';
    }

    // Deterministic 8-point mini sparkline trajectory leading up to current RSI
    let seed = 0;
    for (let i = 0; i < symbol.length; i++) seed += symbol.charCodeAt(i);
    const sparkPoints: number[] = [];
    const count = 8;
    for (let i = 0; i < count; i++) {
      if (i === count - 1) {
        sparkPoints.push(rsi);
      } else {
        const offset = (count - 1 - i) * (isOversold ? 3.2 : isOverbought ? -3.5 : 1.2);
        const jitter = Math.sin((i + seed) * 1.8) * 4;
        const val = Math.max(10, Math.min(90, rsi + offset + jitter));
        sparkPoints.push(Number(val.toFixed(1)));
      }
    }

    // Sparkline SVG geometry
    const spW = compact ? 52 : 60;
    const spH = compact ? 18 : 22;
    const stepX = spW / (count - 1);
    const coords = sparkPoints.map((p, idx) => {
      const x = idx * stepX;
      // y mapped from RSI 0-100 to height
      const y = spH - (p / 100) * spH;
      return { x, y };
    });
    const pathD = coords.reduce((acc, c, idx) => (idx === 0 ? `M ${c.x.toFixed(1)} ${c.y.toFixed(1)}` : `${acc} L ${c.x.toFixed(1)} ${c.y.toFixed(1)}`), '');
    const lastCoord = coords[coords.length - 1];

    return (
      <div className={`flex items-center gap-2 ${compact ? 'min-w-[195px]' : 'min-w-[220px]'} bg-[#070a0f] p-1.5 px-2 rounded-lg border border-slate-800/80`}>
        {/* Color-Coded State Badge */}
        <div className="flex flex-col items-start gap-0.5">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-tight border ${badgeStyle}`}
              title={`RSI(14): ${rsi.toFixed(1)} - ${badgeText}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${beaconColor} ${isOversold || isOverbought ? 'animate-ping' : ''}`} />
              <span>{badgeText}</span>
              <span className="font-bold opacity-90">{rsi.toFixed(1)}</span>
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">
            {isOversold ? 'Mean-Rev Floor (<30)' : isOverbought ? 'Top Exhaustion (>70)' : isPullback ? 'Dip Zone (≤45)' : 'RSI(14) Spectrum'}
          </span>
        </div>

        {/* Mini Sparkline with 30/70 Guideline Ticks */}
        <div className="relative flex items-center justify-center select-none" title={`RSI Momentum Trajectory (30 Oversold / 70 Overbought)`}>
          <svg width={spW} height={spH} className="overflow-visible">
            {/* 30 Oversold horizontal guideline (lower green dotted) */}
            <line
              x1="0"
              y1={spH - (30 / 100) * spH}
              x2={spW}
              y2={spH - (30 / 100) * spH}
              stroke="#10b981"
              strokeDasharray="1.5 1.5"
              strokeOpacity="0.5"
              strokeWidth="0.9"
            />
            {/* 70 Overbought horizontal guideline (upper red dotted) */}
            <line
              x1="0"
              y1={spH - (70 / 100) * spH}
              x2={spW}
              y2={spH - (70 / 100) * spH}
              stroke="#f43f5e"
              strokeDasharray="1.5 1.5"
              strokeOpacity="0.5"
              strokeWidth="0.9"
            />
            {/* Sparkline curve */}
            <path
              d={pathD}
              fill="none"
              stroke={strokeColor}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Current point beacon */}
            <circle cx={lastCoord.x} cy={lastCoord.y} r="2.2" fill={strokeColor} />
            {(isOversold || isOverbought) && (
              <circle cx={lastCoord.x} cy={lastCoord.y} r="4" fill={strokeColor} className="animate-ping opacity-60" />
            )}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Scanner Mode Switcher */}
      <div className="bg-[#0e1420] border border-slate-800 p-5 rounded-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Global AI Buy Opportunity Finder & Market Scanner</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Multi-factor quantitative engine continuously evaluating international equities for momentum, volume confirmation, valuation quality, and risk-to-reward ratios.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setActiveTab('buy-opportunities')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                activeTab === 'buy-opportunities'
                  ? 'bg-emerald-950 text-emerald-400 font-semibold border border-emerald-800'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>✦</span>
              <span>Find Best Opportunities ({filteredCandidates.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('breakout-patterns')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                activeTab === 'breakout-patterns'
                  ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>⚡</span>
              <span>Breakout Patterns ({filteredSignals.length})</span>
            </button>
          </div>
        </div>

        {/* Primary Filters Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2 border-t border-slate-800/80">
          {/* Country filter */}
          <div className="bg-[#070a0f] border border-slate-800 rounded p-2.5">
            <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Market Origin</span>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer text-xs"
            >
              {countries.map((c) => (
                <option key={c} value={c} className="bg-slate-900">
                  {c === 'ALL' ? 'All Global Markets' : c}
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'buy-opportunities' ? (
            <>
              {/* Status filter */}
              <div className="bg-[#070a0f] border border-slate-800 rounded p-2.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Action Stance</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer text-xs"
                >
                  <option value="ALL" className="bg-slate-900">All Stances</option>
                  <option value="READY TO BUY" className="bg-slate-900">🟢 Ready to Buy</option>
                  <option value="WAIT FOR CONFIRMATION" className="bg-slate-900">🟡 Wait for Confirmation</option>
                  <option value="APPROACHING ENTRY" className="bg-slate-900">🔵 Approaching Entry</option>
                </select>
              </div>

              {/* Refresh Button */}
              <div className="flex items-center sm:col-span-2 justify-end">
                <button
                  onClick={fetchRankedOpportunities}
                  disabled={isLoadingScan}
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors flex items-center gap-2"
                >
                  <span>{isLoadingScan ? 'Scanning Global Feeds...' : '↻ Rescan Supported Markets'}</span>
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Classification */}
              <div className="bg-[#070a0f] border border-slate-800 rounded p-2.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Setup Type</span>
                <select
                  value={selectedClassification}
                  onChange={(e) => setSelectedClassification(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer text-xs"
                >
                  <option value="ALL" className="bg-slate-900">All Classifications</option>
                  {classifications.map((c) => (
                    <option key={c} value={c} className="bg-slate-900">{c}</option>
                  ))}
                </select>
              </div>

              {/* RVOL Slider */}
              <div className="bg-[#070a0f] border border-slate-800 rounded p-2.5">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold text-slate-400 mb-1">
                  <span>Min RVOL Ratio</span>
                  <span className="font-mono text-emerald-400">{minRvol.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={0.5}
                  max={3.0}
                  step={0.1}
                  value={minRvol}
                  onChange={(e) => setMinRvol(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Horizon */}
              <div className="bg-[#070a0f] border border-slate-800 rounded p-2.5">
                <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Time Horizon</span>
                <select
                  value={selectedHorizon}
                  onChange={(e) => setSelectedHorizon(e.target.value)}
                  className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer text-xs"
                >
                  <option value="ALL" className="bg-slate-900">All Horizons</option>
                  <option value="Swing" className="bg-slate-900">Swing (1-3 Weeks)</option>
                  <option value="Position" className="bg-slate-900">Position (1-3 Months)</option>
                  <option value="Intraday" className="bg-slate-900">Intraday (1-2 Days)</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* RSI FILTER SLIDER & SMART OPPORTUNITY DISCOVERY BAR */}
        <div className="bg-[#070a0f] border border-slate-800 rounded-lg p-3.5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 text-sm">📈</span>
              <span className="text-xs font-bold text-white tracking-wide">
                RSI Filter (14-Period Relative Strength Index)
              </span>
              <span className="text-[10px] font-mono text-slate-500">· 0 to 100 Momentum Oscillator</span>
            </div>

            {/* Smart Presets (Anti-slop clean buttons) */}
            <div className="flex items-center gap-1.5 text-[11px] font-medium flex-wrap">
              <span className="text-slate-400 text-[10px] uppercase font-bold mr-1">Presets:</span>
              <button
                type="button"
                onClick={() => applyRsiPreset('ALL')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  rsiOperator === 'ALL'
                    ? 'bg-slate-700 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All (0–100)
              </button>
              <button
                type="button"
                onClick={() => applyRsiPreset('OVERSOLD')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  rsiOperator === '<=' && rsiThreshold <= 30
                    ? 'bg-emerald-950 text-emerald-400 font-bold border border-emerald-700 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-emerald-400 border border-slate-800'
                }`}
              >
                <span>🟢</span>
                <span>Oversold (&lt; 30)</span>
              </button>
              <button
                type="button"
                onClick={() => applyRsiPreset('PULLBACK')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  rsiOperator === '<=' && rsiThreshold === 45
                    ? 'bg-amber-950 text-amber-300 font-bold border border-amber-700'
                    : 'bg-slate-900 text-slate-400 hover:text-amber-300 border border-slate-800'
                }`}
              >
                Pullback (≤ 45)
              </button>
              <button
                type="button"
                onClick={() => applyRsiPreset('MOMENTUM')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  rsiOperator === '>=' && rsiThreshold === 60
                    ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700'
                    : 'bg-slate-900 text-slate-400 hover:text-cyan-300 border border-slate-800'
                }`}
              >
                Bullish Run (≥ 60)
              </button>
              <button
                type="button"
                onClick={() => applyRsiPreset('OVERBOUGHT')}
                className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  rsiOperator === '>=' && rsiThreshold >= 70
                    ? 'bg-rose-950 text-rose-400 font-bold border border-rose-700 shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800'
                }`}
              >
                <span>🔴</span>
                <span>Overbought (&gt; 70)</span>
              </button>
            </div>
          </div>

          {/* Slider Controls Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-1">
            {/* Condition Mode Selector */}
            <div className="md:col-span-4 flex items-center gap-1.5 bg-slate-900/90 p-1 rounded border border-slate-800 text-[11px]">
              <button
                type="button"
                onClick={() => setRsiOperator('ALL')}
                className={`flex-1 py-1 rounded text-center transition-colors ${
                  rsiOperator === 'ALL'
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Show All
              </button>
              <button
                type="button"
                onClick={() => {
                  setRsiOperator('<=');
                  if (rsiThreshold > 50) setRsiThreshold(30);
                }}
                className={`flex-1 py-1 rounded text-center transition-colors ${
                  rsiOperator === '<='
                    ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
                title="Find oversold and dip opportunities below maximum threshold"
              >
                ≤ Dip / Oversold
              </button>
              <button
                type="button"
                onClick={() => {
                  setRsiOperator('>=');
                  if (rsiThreshold < 50) setRsiThreshold(70);
                }}
                className={`flex-1 py-1 rounded text-center transition-colors ${
                  rsiOperator === '>='
                    ? 'bg-rose-950 text-rose-300 font-bold border border-rose-800'
                    : 'text-slate-400 hover:text-rose-300'
                }`}
                title="Find overbought momentum or exhaustion setups above minimum threshold"
              >
                ≥ Run / Overbought
              </button>
            </div>

            {/* Range Slider and Live Threshold Display */}
            <div className="md:col-span-8 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">Threshold:</span>
                  <span
                    className={`font-mono font-bold px-2 py-0.5 rounded text-xs border ${
                      rsiOperator === 'ALL'
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : rsiOperator === '<='
                        ? rsiThreshold <= 30
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-700'
                          : 'bg-amber-950 text-amber-400 border-amber-700'
                        : rsiThreshold >= 70
                        ? 'bg-rose-950 text-rose-400 border-rose-700'
                        : 'bg-cyan-950 text-cyan-400 border-cyan-700'
                    }`}
                  >
                    {rsiOperator === 'ALL' ? 'Filter Off (0 - 100)' : `RSI ${rsiOperator} ${rsiThreshold}`}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400">
                  Matches: <span className="text-white font-bold">{activeTab === 'buy-opportunities' ? filteredCandidates.length : filteredSignals.length}</span> assets
                </div>
              </div>

              {/* The Interactive Slider (0-100) */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={rsiThreshold}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setRsiThreshold(val);
                    if (rsiOperator === 'ALL') {
                      setRsiOperator(val <= 50 ? '<=' : '>=');
                    }
                  }}
                  className={`w-full cursor-pointer h-2 rounded-lg bg-slate-800 appearance-none ${
                    rsiOperator === '<=' ? 'accent-emerald-400' : rsiOperator === '>=' ? 'accent-rose-400' : 'accent-slate-500'
                  }`}
                />

                {/* Benchmark Tick Labels */}
                <div className="flex justify-between text-[10px] font-mono text-slate-500 px-0.5">
                  <span className="text-emerald-500 font-semibold cursor-pointer" onClick={() => { setRsiOperator('<='); setRsiThreshold(20); }}>0 (Deep Dip)</span>
                  <span className="text-emerald-400 font-semibold cursor-pointer" onClick={() => { setRsiOperator('<='); setRsiThreshold(30); }}>30 (Oversold)</span>
                  <span className="text-slate-400 cursor-pointer" onClick={() => { setRsiThreshold(50); }}>50 (Equilibrium)</span>
                  <span className="text-rose-400 font-semibold cursor-pointer" onClick={() => { setRsiOperator('>='); setRsiThreshold(70); }}>70 (Overbought)</span>
                  <span className="text-rose-500 font-semibold cursor-pointer" onClick={() => { setRsiOperator('>='); setRsiThreshold(85); }}>100 (Extreme)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contextual Opportunity Explanation Bar */}
          <div className="text-[11px] pt-1 border-t border-slate-800/80 flex items-center justify-between text-slate-400">
            <div>
              {rsiOperator === 'ALL' && (
                <span>Showing full market spectrum without RSI constraints. Use presets above to discover oversold mean-reversion bounces or overbought breakout continuation.</span>
              )}
              {rsiOperator === '<=' && rsiThreshold <= 30 && (
                <span className="text-emerald-300">
                  <strong className="text-emerald-400">Oversold Discovery (&lt; 30):</strong> Filtering for capitulated equities trading at statistical discount extremes. High risk-to-reward setups when supported by clean balance sheets and institutional support levels.
                </span>
              )}
              {rsiOperator === '<=' && rsiThreshold > 30 && (
                <span className="text-amber-300">
                  <strong className="text-amber-400">Defensive Pullback (≤ {rsiThreshold}):</strong> Filtering for assets experiencing orderly pullbacks towards moving average support without structural breakdown.
                </span>
              )}
              {rsiOperator === '>=' && rsiThreshold >= 70 && (
                <span className="text-rose-300">
                  <strong className="text-rose-400">Overbought Momentum (&gt; 70):</strong> Filtering for high-velocity power breakouts and runaway momentum. Monitor for continuation or blow-off exhaustion reversal signals.
                </span>
              )}
              {rsiOperator === '>=' && rsiThreshold < 70 && (
                <span className="text-cyan-300">
                  <strong className="text-cyan-400">Bullish Flow (≥ {rsiThreshold}):</strong> Filtering for stocks demonstrating robust buying pressure and ascending relative strength against broad benchmarks.
                </span>
              )}
            </div>

            {rsiOperator !== 'ALL' && (
              <button
                type="button"
                onClick={() => setRsiOperator('ALL')}
                className="text-[10px] text-slate-500 hover:text-slate-300 underline ml-2 whitespace-nowrap"
              >
                Clear RSI Filter
              </button>
            )}
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: RANKED AI BUY OPPORTUNITY FINDER */}
      {activeTab === 'buy-opportunities' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-200">Ranked Opportunities ({filteredCandidates.length} matches):</span>
              <span className="text-[11px] font-mono text-slate-500 ml-2">Sorted from strongest quantitative score to weakest</span>
            </div>

            {/* View Format Switcher */}
            <div className="flex items-center gap-1.5 bg-[#070a0f] p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setViewFormat('table')}
                className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                  viewFormat === 'table'
                    ? 'bg-slate-800 text-cyan-300 font-bold border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>☰</span>
                <span>Results Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewFormat('cards')}
                className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                  viewFormat === 'cards'
                    ? 'bg-slate-800 text-cyan-300 font-bold border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>⊞</span>
                <span>Deep Cards</span>
              </button>
            </div>
          </div>

          {filteredCandidates.length === 0 ? (
            <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-10 text-center space-y-3">
              <div className="text-3xl text-slate-600">🔍</div>
              <h3 className="text-sm font-bold text-white">No Stocks Match Current RSI & Scan Criteria</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No stocks currently have an RSI {rsiOperator} {rsiThreshold} in the selected market origin ({selectedCountry}).
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => applyRsiPreset('ALL')}
                  className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded font-medium border border-slate-700"
                >
                  Reset RSI Filter to All (0-100)
                </button>
                <button
                  onClick={() => setSelectedCountry('ALL')}
                  className="px-3 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 rounded font-medium border border-slate-800"
                >
                  Clear Market Origin Filter
                </button>
              </div>
            </div>
          ) : viewFormat === 'table' ? (
            /* INSTITUTIONAL RESULTS TABLE WITH SECONDARY RSI INDICATOR */
            <div className="overflow-x-auto rounded-lg border border-slate-800 bg-[#0b0f17] shadow-xl">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-[#070a0f] border-b border-slate-800 text-[10px] uppercase text-slate-400">
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3">Asset</th>
                    <th className="p-3">Exchange</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3 text-center min-w-[210px]">RSI State & Trend (Secondary Indicator)</th>
                    <th className="p-3 text-center">Score</th>
                    <th className="p-3">Action Stance</th>
                    <th className="p-3">Entry Area</th>
                    <th className="p-3">Stop-Loss</th>
                    <th className="p-3">Target 1</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredCandidates.map((cand, idx) => {
                    const matchedStock = stocks.find((s) => s.symbol.toUpperCase() === cand.symbol.toUpperCase());
                    const stockId = matchedStock ? matchedStock.id : cand.symbol.toLowerCase();
                    const stockRsi = cand.rsi ?? matchedStock?.technicals?.rsi14 ?? 50;

                    const isOversold = stockRsi <= 30;
                    const isOverbought = stockRsi >= 70;
                    const isFilterMatch =
                      (rsiOperator === '<=' && stockRsi <= rsiThreshold) ||
                      (rsiOperator === '>=' && stockRsi >= rsiThreshold);

                    const rowHighlight = isOversold
                      ? 'bg-emerald-950/25 hover:bg-emerald-950/40 border-l-4 border-l-emerald-400'
                      : isOverbought
                      ? 'bg-rose-950/25 hover:bg-rose-950/40 border-l-4 border-l-rose-400'
                      : isFilterMatch
                      ? 'bg-cyan-950/20 hover:bg-cyan-950/35 border-l-4 border-l-cyan-400'
                      : 'hover:bg-slate-900/60 border-l-4 border-l-transparent';

                    return (
                      <tr
                        key={cand.symbol}
                        onClick={() => onSelectStock(stockId)}
                        className={`${rowHighlight} cursor-pointer transition-colors`}
                      >
                        <td className="p-3 text-center font-bold text-slate-400">#{idx + 1}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{cand.symbol}</span>
                            <span className="text-[11px] text-slate-400 hidden sm:inline truncate max-w-[120px]">
                              {cand.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                            {cand.exchange} · {cand.country}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-white">
                          {formatCurrencyValue(cand.price, cand.currency)}
                        </td>

                        {/* Secondary Visual Indicator: Color-Coded State Badge + Small Sparkline */}
                        <td className="p-3">
                          <div className="flex justify-center">
                            {renderRsiIndicator(stockRsi, cand.symbol, true)}
                          </div>
                        </td>

                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold ${
                              cand.overallScore >= 80
                                ? 'text-emerald-400 bg-emerald-950/70 border border-emerald-800'
                                : cand.overallScore >= 65
                                ? 'text-amber-400 bg-amber-950/70 border border-amber-800'
                                : 'text-slate-300 bg-slate-800'
                            }`}
                          >
                            {cand.overallScore}/100
                          </span>
                        </td>

                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                              cand.status === 'READY TO BUY'
                                ? 'text-emerald-400 bg-emerald-950 border-emerald-700'
                                : cand.status === 'WAIT FOR CONFIRMATION'
                                ? 'text-amber-400 bg-amber-950 border-amber-700'
                                : 'text-cyan-400 bg-cyan-950 border-cyan-700'
                            }`}
                          >
                            {cand.status}
                          </span>
                        </td>

                        <td className="p-3 text-slate-300 text-[11px]">
                          {formatCurrencyValue(cand.entryZone.min, cand.currency)} – {formatCurrencyValue(cand.entryZone.max, cand.currency)}
                        </td>

                        <td className="p-3 font-semibold text-rose-400 text-[11px]">
                          {formatCurrencyValue(cand.stopLoss, cand.currency)}
                        </td>

                        <td className="p-3 font-semibold text-emerald-400 text-[11px]">
                          {formatCurrencyValue(cand.target1, cand.currency)}
                        </td>

                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectStock(stockId);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[11px] transition-colors"
                          >
                            Inspect →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* DEEP CARDS VIEW */
            <div className="space-y-3">
              {filteredCandidates.map((cand, idx) => {
                const matchedStock = stocks.find((s) => s.symbol.toUpperCase() === cand.symbol.toUpperCase());
                const stockId = matchedStock ? matchedStock.id : cand.symbol.toLowerCase();
                const stockRsi = cand.rsi ?? matchedStock?.technicals?.rsi14 ?? 50;

                const isOversold = stockRsi <= 30;
                const isOverbought = stockRsi >= 70;
                const highlightClass = isOversold
                  ? 'border-emerald-500/70 bg-gradient-to-r from-emerald-950/30 via-[#0b0f17] to-[#0b0f17] shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
                  : isOverbought
                  ? 'border-rose-500/70 bg-gradient-to-r from-rose-950/30 via-[#0b0f17] to-[#0b0f17] shadow-[0_0_20px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/30'
                  : 'border-slate-800 bg-[#0b0f17] hover:border-slate-700';

                return (
                  <div
                    key={cand.symbol}
                    onClick={() => onSelectStock(stockId)}
                    className={`${highlightClass} transition-all rounded-lg p-4 cursor-pointer space-y-3 relative overflow-hidden`}
                  >
                    {/* Top Row: Rank, Symbol, Exchange, Price, Secondary RSI Badge + Sparkline, Score & Status */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-slate-800 text-slate-300">
                          #{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold font-mono text-white">{cand.symbol}</span>
                            <span className="text-xs text-slate-400">{cand.name}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                              {cand.exchange} · {cand.country}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        {/* Secondary Visual Indicator: Color-Coded State Badge + Mini RSI Sparkline */}
                        <div className="hidden sm:block">
                          {renderRsiIndicator(stockRsi, cand.symbol)}
                        </div>

                        <div className="text-right">
                          <span className="text-xs text-slate-400 block font-sans">Verified Price:</span>
                          <span className="text-sm font-bold text-white">
                            {formatCurrencyValue(cand.price, cand.currency)}
                          </span>
                        </div>

                        {/* Overall Score Badge */}
                        <div className="text-right">
                          <span className="text-xs text-slate-400 block font-sans">Opportunity Score:</span>
                          <span
                            className={`text-sm font-bold px-2 py-0.5 rounded ${
                              cand.overallScore >= 80
                                ? 'text-emerald-400 bg-emerald-950/70 border border-emerald-800'
                                : cand.overallScore >= 65
                                ? 'text-amber-400 bg-amber-950/70 border border-amber-800'
                                : 'text-slate-300 bg-slate-800'
                            }`}
                          >
                            {cand.overallScore} / 100
                          </span>
                        </div>

                        {/* Status Tag */}
                        <div>
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded border uppercase ${
                              cand.status === 'READY TO BUY'
                                ? 'text-emerald-400 bg-emerald-950 border-emerald-700'
                                : cand.status === 'WAIT FOR CONFIRMATION'
                                ? 'text-amber-400 bg-amber-950 border-amber-700'
                                : 'text-cyan-400 bg-cyan-950 border-cyan-700'
                            }`}
                          >
                            {cand.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Secondary RSI Indicator (shown only on small screens) */}
                    <div className="sm:hidden pt-1 pb-1">
                      {renderRsiIndicator(stockRsi, cand.symbol)}
                    </div>

                    {/* 5-Pillar Score Bar Breakdown */}
                    <div className="grid grid-cols-5 gap-2 text-[10px] font-mono pt-1 pb-1">
                      <div className="bg-[#070a0f] p-1.5 rounded border border-slate-800">
                        <span className="text-slate-500 block">Trend ({cand.breakdown.trendStrength}/20)</span>
                        <div className="w-full bg-slate-800 h-1 rounded mt-1 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full"
                            style={{ width: `${(cand.breakdown.trendStrength / 20) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-[#070a0f] p-1.5 rounded border border-slate-800">
                        <span className="text-slate-500 block">Volume ({cand.breakdown.volumeConfirmation}/20)</span>
                        <div className="w-full bg-slate-800 h-1 rounded mt-1 overflow-hidden">
                          <div
                            className="bg-cyan-500 h-full"
                            style={{ width: `${(cand.breakdown.volumeConfirmation / 20) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-[#070a0f] p-1.5 rounded border border-slate-800">
                        <span className="text-slate-500 block">Valuation ({cand.breakdown.valuationQuality}/20)</span>
                        <div className="w-full bg-slate-800 h-1 rounded mt-1 overflow-hidden">
                          <div
                            className="bg-amber-500 h-full"
                            style={{ width: `${(cand.breakdown.valuationQuality / 20) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-[#070a0f] p-1.5 rounded border border-slate-800">
                        <span className="text-slate-500 block">Balance Sheet ({cand.breakdown.balanceSheetSafety}/20)</span>
                        <div className="w-full bg-slate-800 h-1 rounded mt-1 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full"
                            style={{ width: `${(cand.breakdown.balanceSheetSafety / 20) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-[#070a0f] p-1.5 rounded border border-slate-800">
                        <span className="text-slate-500 block">Risk:Reward ({cand.breakdown.riskRewardScore}/20)</span>
                        <div className="w-full bg-slate-800 h-1 rounded mt-1 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full"
                            style={{ width: `${(cand.breakdown.riskRewardScore / 20) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Operational Parameters: Entry, Stop Loss, Targets, R:R */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-[#070a0f] p-2.5 rounded border border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Entry Area:</span>
                        <span className="text-white font-semibold">
                          {formatCurrencyValue(cand.entryZone.min, cand.currency)} – {formatCurrencyValue(cand.entryZone.max, cand.currency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-rose-400 uppercase block">Stop-Loss (Invalidation):</span>
                        <span className="text-rose-400 font-semibold">
                          {formatCurrencyValue(cand.stopLoss, cand.currency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-400 uppercase block">Potential Target (T1 / T2):</span>
                        <span className="text-emerald-400 font-semibold">
                          {formatCurrencyValue(cand.target1, cand.currency)} / {formatCurrencyValue(cand.target2, cand.currency)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-cyan-400 uppercase block">Horizon & Risk:</span>
                        <span className="text-slate-300 font-semibold">
                          {cand.horizon} · {cand.riskRating} RISK
                        </span>
                      </div>
                    </div>

                    {/* Concrete Evidence Strip */}
                    <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                      {cand.evidence.map((ev, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <span className="text-emerald-400">✓</span> {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: BREAKOUT PATTERN SCANNER */}
      {activeTab === 'breakout-patterns' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              <span className="font-semibold text-slate-200">Active Breakout Signals ({filteredSignals.length} patterns):</span>
              <span className="text-[11px] font-mono text-slate-500 ml-2">Surveillance for volume surges, channel breaks, and RSI momentum</span>
            </div>

            {/* View Format Switcher */}
            <div className="flex items-center gap-1.5 bg-[#070a0f] p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                type="button"
                onClick={() => setViewFormat('table')}
                className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                  viewFormat === 'table'
                    ? 'bg-slate-800 text-cyan-300 font-bold border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>☰</span>
                <span>Results Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewFormat('cards')}
                className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                  viewFormat === 'cards'
                    ? 'bg-slate-800 text-cyan-300 font-bold border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>⊞</span>
                <span>Grid Cards</span>
              </button>
            </div>
          </div>

          {filteredSignals.length === 0 ? (
            <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-10 text-center space-y-3">
              <div className="text-3xl text-slate-600">⚡</div>
              <h3 className="text-sm font-bold text-white">No Breakout Signals Match Current Filters</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                No patterns meet the criteria for RVOL &ge; {minRvol.toFixed(1)}x with RSI {rsiOperator} {rsiThreshold}.
              </p>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={() => applyRsiPreset('ALL')}
                  className="px-3 py-1.5 text-xs bg-slate-800 hover:bg-slate-700 text-white rounded font-medium border border-slate-700"
                >
                  Reset RSI Filter
                </button>
                <button
                  onClick={() => setMinRvol(0.5)}
                  className="px-3 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 rounded font-medium border border-slate-800"
                >
                  Lower Min RVOL to 0.5x
                </button>
              </div>
            </div>
          ) : viewFormat === 'table' ? (
            /* BREAKOUT PATTERNS RESULTS TABLE */
            <div className="overflow-x-auto rounded-lg border border-slate-800 bg-[#0b0f17] shadow-xl">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="bg-[#070a0f] border-b border-slate-800 text-[10px] uppercase text-slate-400">
                    <th className="p-3">Asset</th>
                    <th className="p-3">Origin</th>
                    <th className="p-3 text-right">Price</th>
                    <th className="p-3">Classification</th>
                    <th className="p-3">Pattern</th>
                    <th className="p-3 text-center">RVOL</th>
                    <th className="p-3 text-center min-w-[210px]">RSI State & Trend (Secondary Indicator)</th>
                    <th className="p-3">Target 1</th>
                    <th className="p-3">Invalidation</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredSignals.map(({ stock, signal }) => {
                    const stockRsi = stock.technicals.rsi14;
                    const isOversold = stockRsi <= 30;
                    const isOverbought = stockRsi >= 70;
                    const isFilterMatch =
                      (rsiOperator === '<=' && stockRsi <= rsiThreshold) ||
                      (rsiOperator === '>=' && stockRsi >= rsiThreshold);

                    const rowHighlight = isOversold
                      ? 'bg-emerald-950/25 hover:bg-emerald-950/40 border-l-4 border-l-emerald-400'
                      : isOverbought
                      ? 'bg-rose-950/25 hover:bg-rose-950/40 border-l-4 border-l-rose-400'
                      : isFilterMatch
                      ? 'bg-cyan-950/20 hover:bg-cyan-950/35 border-l-4 border-l-cyan-400'
                      : 'hover:bg-slate-900/60 border-l-4 border-l-transparent';

                    return (
                      <tr
                        key={stock.id}
                        onClick={() => onSelectStock(stock.id)}
                        className={`${rowHighlight} cursor-pointer transition-colors`}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{stock.qualifiedSymbol}</span>
                            <span className="text-[11px] text-slate-400 hidden sm:inline truncate max-w-[120px]">
                              {stock.name}
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                            {stock.country}
                          </span>
                        </td>
                        <td className="p-3 text-right font-bold text-white">
                          {formatCurrencyValue(stock.price, stock.currency)}
                        </td>
                        <td className="p-3">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
                            {signal.classification}
                          </span>
                        </td>
                        <td className="p-3 text-slate-200 font-sans font-medium">
                          {signal.pattern}
                        </td>
                        <td className="p-3 text-center">
                          <span className="text-cyan-400 font-bold px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-800/60">
                            {signal.rvol}x
                          </span>
                        </td>

                        {/* Secondary Visual Indicator: Color-Coded State Badge + Small Sparkline */}
                        <td className="p-3">
                          <div className="flex justify-center">
                            {renderRsiIndicator(stockRsi, stock.symbol, true)}
                          </div>
                        </td>

                        <td className="p-3 font-semibold text-emerald-400">
                          {formatCurrencyValue(signal.target1, stock.currency)}
                        </td>
                        <td className="p-3 font-semibold text-rose-400">
                          {formatCurrencyValue(signal.invalidationLevel, stock.currency)}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectStock(stock.id);
                            }}
                            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-[11px] transition-colors"
                          >
                            Inspect →
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* GRID CARDS VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSignals.map(({ stock, signal }) => {
                const stockRsi = stock.technicals.rsi14;
                const isOversold = stockRsi <= 30;
                const isOverbought = stockRsi >= 70;
                const cardHighlight = isOversold
                  ? 'border-emerald-500/70 bg-gradient-to-b from-emerald-950/25 to-[#0b0f17] shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30'
                  : isOverbought
                  ? 'border-rose-500/70 bg-gradient-to-b from-rose-950/25 to-[#0b0f17] shadow-[0_0_15px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/30'
                  : 'border-slate-800 bg-[#0b0f17] hover:border-slate-700';

                return (
                  <div
                    key={stock.id}
                    onClick={() => onSelectStock(stock.id)}
                    className={`${cardHighlight} transition-all rounded-lg p-4 cursor-pointer flex flex-col justify-between space-y-3 relative overflow-hidden`}
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-white font-mono">{stock.qualifiedSymbol}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-semibold">
                          {signal.classification}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400">{stock.name} · {stock.country}</div>
                      <div className="mt-2 text-sm font-bold font-mono text-white">
                        {formatCurrencyValue(stock.price, stock.currency)}
                      </div>
                    </div>

                    {/* Secondary RSI Visual Indicator: Badge + Mini Sparkline */}
                    <div>
                      {renderRsiIndicator(stockRsi, stock.symbol)}
                    </div>

                    <div className="space-y-2 text-xs font-mono pt-2 border-t border-slate-800/80">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Pattern:</span>
                        <span className="text-slate-200 font-sans font-medium">{signal.pattern}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Relative Vol (RVOL):</span>
                        <span className="text-cyan-400 font-bold">{signal.rvol}x</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Target 1:</span>
                        <span className="text-emerald-400 font-bold">{formatCurrencyValue(signal.target1, stock.currency)}</span>
                      </div>
                      <div className="flex justify-between text-[11px]">
                        <span className="text-slate-500">Invalidation Floor:</span>
                        <span className="text-rose-400 font-bold">{formatCurrencyValue(signal.invalidationLevel, stock.currency)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
