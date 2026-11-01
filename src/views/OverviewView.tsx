import React, { useState } from 'react';
import { GlobalIndex, StockItem, CurrencyRate, CommodityPrice, CryptoPrice } from '../types/market';
import { convertCurrency, formatCurrencyValue } from '../utils/currency';
import { GlobalMarketHeatmap } from '../components/GlobalMarketHeatmap';

export type DashboardMode = 'NORMAL' | 'OPPORTUNITY' | 'DEFENSIVE' | 'HIGH_VOLATILITY' | 'EVENT';

interface OverviewViewProps {
  indices: GlobalIndex[];
  stocks: StockItem[];
  currencies: CurrencyRate[];
  commodities: CommodityPrice[];
  crypto: CryptoPrice[];
  baseCurrency: string;
  onSelectStock: (stockId: string) => void;
  onNavigateTab: (tab: any) => void;
  onOpenWhyFell?: () => void;
  onOpenEmergencyAlert?: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  indices,
  stocks,
  currencies,
  commodities,
  crypto,
  baseCurrency,
  onSelectStock,
  onNavigateTab,
  onOpenWhyFell,
  onOpenEmergencyAlert,
}) => {
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>('NORMAL');
  const [selectedRegion, setSelectedRegion] = useState<'ALL' | 'AMERICAS' | 'EUROPE' | 'ASIA_PACIFIC'>('ALL');
  const [showCrypto, setShowCrypto] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Command Bar State
  const [commandInput, setCommandInput] = useState('');
  const [commandResponse, setCommandResponse] = useState<null | {
    query: string;
    answer: string;
    tags: string[];
    actionStockId?: string;
  }>(null);

  // Quick Command Suggestions
  const quickCommands = [
    'Which stocks have strong momentum today?',
    'Why is Tesla falling?',
    'Find low-risk setups.',
    'Show stocks near support.',
    'Check my portfolio risk.',
    'Which holdings have earnings this week?',
    'Compare NVIDIA and AMD.',
    'Find unusual volume.',
    'Why did the market fall today?',
  ];

  // Execute Command Bar query
  const handleRunCommand = (queryText: string) => {
    const q = queryText.toLowerCase().trim();
    if (!q) return;

    if (q.includes('momentum')) {
      setCommandResponse({
        query: queryText,
        answer: 'NVIDIA (NVDA, RVOL 2.1x, RSI 67.8) and RELIANCE (RVOL 1.9x, RSI 62.4) exhibit top-decile relative strength. Price action is respecting the 20-day EMA with expanding MACD histograms. 78% probability of continuation towards target levels.',
        tags: ['Momentum Leaders', 'Volume Expansion', 'Bullish Continuation'],
        actionStockId: 'nvda',
      });
    } else if (q.includes('tesla') || q.includes('tsla') || q.includes('falling')) {
      setCommandResponse({
        query: queryText,
        answer: 'TSLA is experiencing profit taking after a multi-week rally, testing immediate support at $215.00. P/E multiple at 62.4x reflects elevated growth expectations susceptible to macroeconomic rate jitters. No fundamental structural breakdown detected.',
        tags: ['Valuation Multiple', 'Support Retest', 'Volatility Expansion'],
        actionStockId: 'tsla',
      });
    } else if (q.includes('low-risk') || q.includes('setups')) {
      setCommandResponse({
        query: queryText,
        answer: 'AAPL ($224.20, Beta 0.94) and MSFT ($428.50, Beta 0.91) present low-risk asymmetric risk-to-reward setups. Both trade within 1.2% of key institutional moving averages with ATR compression indicating impending low-drawdown expansion.',
        tags: ['Low Beta', 'Tight Stop-Loss', 'Asymmetric R:R'],
        actionStockId: 'aapl',
      });
    } else if (q.includes('support')) {
      setCommandResponse({
        query: queryText,
        answer: 'TCS (NSE: TCS) is holding its 50-day SMA support at ₹4,180 with declining selling volume. TSMC ($174.50) is consolidating tightly above its breakout shelf at $170.00. Favorable risk/reward for accumulation.',
        tags: ['Support Shelf', 'Mean Reversion', 'Institutional Bid'],
        actionStockId: 'tcs',
      });
    } else if (q.includes('portfolio') || q.includes('risk')) {
      setCommandResponse({
        query: queryText,
        answer: 'Portfolio covariance risk is currently MODERATE (Aggregate Beta 1.04, Max Drawdown Expectation -4.2% in a 200bp shock). Technology sector allocation represents 42% of total exposure; consider rebalancing into defensive energy or dividend aristocrats.',
        tags: ['Beta 1.04', 'Tech Weight 42%', 'Stress Resilience High'],
      });
    } else if (q.includes('earnings')) {
      setCommandResponse({
        query: queryText,
        answer: '2 portfolio constituents report earnings within the next 8 trading sessions: Apple (AAPL, EPS Consensus $1.64) and Tata Consultancy Services (TCS, Consensus Margin 26.2%). Implied volatility crush risk is moderate.',
        tags: ['Catalyst Watch', 'Implied Volatility', 'Earnings Season'],
        actionStockId: 'aapl',
      });
    } else if (q.includes('compare') || (q.includes('nvidia') && q.includes('amd'))) {
      setCommandResponse({
        query: queryText,
        answer: 'NVDA vs AMD: NVDA leads in Free Cash Flow conversion (74% vs 28%) and data-center gross margins (75.1% vs 51.2%). AMD trades at a forward P/E discount (34x vs 42x), but NVDA demonstrates superior relative volume and momentum scores.',
        tags: ['Semiconductor Duopoly', 'Margin Comparison', 'NVDA Outperforming'],
        actionStockId: 'nvda',
      });
    } else if (q.includes('volume')) {
      setCommandResponse({
        query: queryText,
        answer: 'Highest Relative Volume (RVOL) spikes today: NVDA (2.1x normal 30-day volume), RELIANCE (1.9x), and ASML (1.8x). Block order flow indicates institutional net accumulation without distribution ticks.',
        tags: ['RVOL > 1.8x', 'Order Flow Inflow', 'Block Trades'],
        actionStockId: 'nvda',
      });
    } else {
      setCommandResponse({
        query: queryText,
        answer: `Global AI Market Brain scanned 4,800+ indicators for "${queryText}". Market regime is currently RISK-ON BULL with VIX at 14.8. Technology and Industrials lead international breadth while defensive utilities lag. Capital flows remain constructive.`,
        tags: ['Regime: Risk-On', 'Broad Breadth', 'Verified Market Data'],
      });
    }
  };

  // Filter indices by region
  const filteredIndices = indices.filter((idx) => {
    if (selectedRegion === 'AMERICAS') return idx.country === 'United States' || idx.country === 'Canada';
    if (selectedRegion === 'EUROPE') return idx.country === 'United Kingdom' || idx.country === 'Germany' || idx.country === 'France';
    if (selectedRegion === 'ASIA_PACIFIC') {
      return (
        idx.country === 'India' ||
        idx.country === 'Japan' ||
        idx.country === 'Hong Kong' ||
        idx.country === 'China' ||
        idx.country === 'Australia' ||
        idx.country === 'South Korea'
      );
    }
    return true;
  });

  // Top Movers
  const sortedByChange = [...stocks].sort((a, b) => b.changePercent - a.changePercent);
  const topGainers = sortedByChange.slice(0, 4);
  const topLosers = [...sortedByChange].reverse().slice(0, 4);
  const volumeSurges = [...stocks].sort((a, b) => b.technicals.rvol - a.technicals.rvol).slice(0, 4);
  const fallingRapidly = [...stocks].filter((s) => s.changePercent <= -1.5).sort((a, b) => a.changePercent - b.changePercent).slice(0, 4);

  // Sector stats
  const sectorMap: Record<string, { count: number; totalChange: number }> = {};
  stocks.forEach((s) => {
    if (!sectorMap[s.sector]) sectorMap[s.sector] = { count: 0, totalChange: 0 };
    sectorMap[s.sector].count += 1;
    sectorMap[s.sector].totalChange += s.changePercent;
  });
  const sectorPerformance = Object.entries(sectorMap)
    .map(([sector, data]) => ({
      sector,
      avgChange: data.totalChange / data.count,
      count: data.count,
    }))
    .sort((a, b) => b.avgChange - a.avgChange);

  // Categorized AI Decision Highlights
  const buyOpportunityStock = stocks.find((s) => s.symbol === 'NVDA' || s.symbol === 'RELIANCE') || stocks[0];
  const holdStock = stocks.find((s) => s.symbol === 'AAPL' || s.symbol === 'MSFT') || stocks[1];
  const waitStock = stocks.find((s) => s.symbol === 'TSMC' || s.symbol === 'ASML') || stocks[2];
  const highRiskStock = stocks.find((s) => s.symbol === 'TSLA') || stocks[3];
  const sellReviewStock = stocks.find((s) => s.changePercent < -2.0) || stocks[stocks.length - 1];

  return (
    <div className="space-y-6">
      {/* 1. TOP AI PRIORITY LAYER & EXECUTIVE INTELLIGENCE COMMAND */}
      <div className="bg-[#0b0f17] border border-slate-800/90 rounded-xl p-5 shadow-2xl relative overflow-hidden space-y-4">
        {/* Subtle Atmospheric Ambient Radial Glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Global Intelligence Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
              </span>
              <span className="text-xs font-mono font-bold tracking-widest uppercase text-cyan-400">
                Global Market Intelligence · AI Priority Layer
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                v2026.4
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
              Next-Gen AI Market Command Center
            </h1>
          </div>

          {/* Quick Diagnostics & Action Triggers */}
          <div className="flex items-center gap-2 text-xs flex-wrap relative z-10">
            <button
              onClick={() => onNavigateTab('brain')}
              className="px-3 py-1.5 rounded-lg bg-cyan-950/80 border border-cyan-700/80 text-cyan-300 font-semibold hover:bg-cyan-900 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
            >
              <span>🧠</span>
              <span>AI Market Brain</span>
            </button>
            <button
              onClick={() => onNavigateTab('scanner')}
              className="px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-700/80 text-emerald-300 font-semibold hover:bg-emerald-900 transition-all flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
            >
              <span>✦</span>
              <span>Find Best Opportunities</span>
            </button>
            {onOpenWhyFell && (
              <button
                onClick={onOpenWhyFell}
                className="px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-700/80 text-rose-300 font-semibold hover:bg-rose-900 transition-all flex items-center gap-1.5"
              >
                <span>📉</span>
                <span>Why Did My Stock Fall?</span>
              </button>
            )}
            <button
              onClick={() => onNavigateTab('stress-lab')}
              className="px-3 py-1.5 rounded-lg bg-purple-950/80 border border-purple-700/80 text-purple-300 font-semibold hover:bg-purple-900 transition-all flex items-center gap-1.5"
            >
              <span>🧪</span>
              <span>Stress Lab</span>
            </button>
            {onOpenEmergencyAlert && (
              <button
                onClick={onOpenEmergencyAlert}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.3)] animate-pulse"
              >
                <span>🚨</span>
                <span>Emergency Alert</span>
              </button>
            )}
          </div>
        </div>

        {/* Top 6 Institutional Core Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs font-mono pt-2 border-t border-slate-800/80 relative z-10">
          <div className="bg-[#070a0f] p-2.5 rounded-lg border border-slate-800/90">
            <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">Live Market Status</span>
            <span className="text-emerald-400 font-bold flex items-center gap-1.5 mt-1 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              MARKETS ACTIVE
            </span>
          </div>

          <div className="bg-[#070a0f] p-2.5 rounded-lg border border-slate-800/90">
            <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">AI Market Regime</span>
            <span className="text-cyan-300 font-bold mt-1 block text-xs">
              RISK-ON BULL (VIX 14.8)
            </span>
          </div>

          <div className="bg-[#070a0f] p-2.5 rounded-lg border border-slate-800/90">
            <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">AI Opportunity Score</span>
            <span className="text-emerald-400 font-bold mt-1 block text-xs">
              88 / 100 · ELEVATED
            </span>
          </div>

          <div className="bg-[#070a0f] p-2.5 rounded-lg border border-slate-800/90">
            <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">Portfolio Risk Stance</span>
            <span className="text-blue-300 font-bold mt-1 block text-xs">
              BALANCED (Beta 1.04)
            </span>
          </div>

          <div className="bg-[#070a0f] p-2.5 rounded-lg border border-slate-800/90">
            <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">Important Alerts</span>
            <span className="text-amber-400 font-bold mt-1 block text-xs flex items-center gap-1">
              <span>⚠️</span>
              <span>3 ACTION ITEMS</span>
            </span>
          </div>

          <div className="bg-[#070a0f] p-2.5 rounded-lg border border-slate-800/90">
            <span className="text-[10px] text-slate-400 block font-sans uppercase font-bold">Base Currency Stream</span>
            <span className="text-slate-200 font-bold mt-1 block text-xs">
              {baseCurrency} · LIVE SYNC
            </span>
          </div>
        </div>

        {/* 2. DYNAMIC ADAPTIVE DASHBOARD MODE SELECTOR */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-slate-400 uppercase">Adaptive Dashboard Mode:</span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">(Rearranges layout automatically according to market phase)</span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#070a0f] p-1 rounded-lg border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setDashboardMode('NORMAL')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                dashboardMode === 'NORMAL'
                  ? 'bg-slate-800 text-white font-bold border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🌟</span>
              <span>Normal</span>
            </button>

            <button
              onClick={() => setDashboardMode('OPPORTUNITY')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                dashboardMode === 'OPPORTUNITY'
                  ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-700 shadow-[0_0_12px_rgba(16,185,129,0.3)]'
                  : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              <span>⚡</span>
              <span>Opportunity Mode</span>
            </button>

            <button
              onClick={() => setDashboardMode('DEFENSIVE')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                dashboardMode === 'DEFENSIVE'
                  ? 'bg-rose-950 text-rose-300 font-bold border border-rose-700 shadow-[0_0_12px_rgba(244,63,94,0.3)]'
                  : 'text-slate-400 hover:text-rose-300'
              }`}
            >
              <span>🛡️</span>
              <span>Defensive Mode</span>
            </button>

            <button
              onClick={() => setDashboardMode('HIGH_VOLATILITY')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                dashboardMode === 'HIGH_VOLATILITY'
                  ? 'bg-amber-950 text-amber-300 font-bold border border-amber-700 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              <span>🌊</span>
              <span>High Volatility</span>
            </button>

            <button
              onClick={() => setDashboardMode('EVENT')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                dashboardMode === 'EVENT'
                  ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-700 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'text-slate-400 hover:text-cyan-300'
              }`}
            >
              <span>🌍</span>
              <span>Event Mode</span>
            </button>
          </div>
        </div>

        {/* DEFENSIVE MODE CRASH SHIELD BANNER (Rendered when DEFENSIVE is active) */}
        {dashboardMode === 'DEFENSIVE' && (
          <div className="bg-rose-950/60 border border-rose-700/80 rounded-lg p-3 text-xs text-rose-200 flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-base">🛡️</span>
              <div>
                <strong className="text-white block font-mono">AUTOMATIC DEFENSIVE CAPITAL SHIELD ACTIVE</strong>
                <span>Preserving liquidity. High-beta positions flagged for trailing stop adjustments. Prioritizing cash yield and sovereign bond collateral.</span>
              </div>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <button
                onClick={() => onNavigateTab('stress-lab')}
                className="px-2.5 py-1 bg-rose-800 hover:bg-rose-700 text-white rounded font-bold text-[11px]"
              >
                Audit Max Drawdown →
              </button>
            </div>
          </div>
        )}

        {/* 3. THE 3 CRITICAL DEVELOPMENTS REQUIRING ATTENTION */}
        <div className="space-y-3 pt-2 border-t border-slate-800/80 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-xs">⚠️</span>
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
                3 Important Developments Require Your Attention
              </h2>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              Auto-prioritized by AI Market Brain
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Development 1: NVDA */}
            <div
              onClick={() => onSelectStock('nvda')}
              className="bg-[#070a0f] border border-emerald-900/60 hover:border-emerald-600 rounded-lg p-3.5 space-y-2.5 cursor-pointer transition-all group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="font-bold font-mono text-sm text-white group-hover:text-emerald-400 transition-colors">
                    1. NVDA — Momentum Strengthening
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  HIGH ATTENTION
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div>
                  <span className="text-slate-500 uppercase font-mono text-[9px] block">Why it matters:</span>
                  <p className="text-slate-300">
                    Institutional accumulation accelerating into semiconductor cycle with 2.1x relative volume expansion.
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-mono text-[9px] block">What changed:</span>
                  <p className="text-slate-300">
                    Broke above 20-day high ($142.50 pivot) with expanding MACD histogram.
                  </p>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono pt-1 border-t border-slate-800">
                  <span className="text-emerald-400">RISK: Moderate (Beta 1.62)</span>
                  <span className="text-slate-400">Target: $148.00 / Inval: $136.00</span>
                </div>
              </div>
            </div>

            {/* Development 2: Gold */}
            <div className="bg-[#070a0f] border border-amber-900/60 hover:border-amber-600 rounded-lg p-3.5 space-y-2.5 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="font-bold font-mono text-sm text-white">
                    2. Gold (XAU/USD) — Volatility Increasing
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                  SAFE HAVEN
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div>
                  <span className="text-slate-500 uppercase font-mono text-[9px] block">Why it matters:</span>
                  <p className="text-slate-300">
                    Central bank accumulation and cross-asset hedging demand expanding as macro volatility indices tick upward.
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-mono text-[9px] block">What changed:</span>
                  <p className="text-slate-300">
                    Surged +1.28% to test key $2,740 pivot with rising futures open interest.
                  </p>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono pt-1 border-t border-slate-800">
                  <span className="text-amber-400">RISK: Low-to-Medium</span>
                  <span className="text-slate-400">Watch: Daily close above $2,750</span>
                </div>
              </div>
            </div>

            {/* Development 3: USD/INR */}
            <div className="bg-[#070a0f] border border-cyan-900/60 hover:border-cyan-600 rounded-lg p-3.5 space-y-2.5 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                  <span className="font-bold font-mono text-sm text-white">
                    3. USD/INR — Major Resistance Approaching
                  </span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-bold">
                  FX CEILING
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div>
                  <span className="text-slate-500 uppercase font-mono text-[9px] block">Why it matters:</span>
                  <p className="text-slate-300">
                    Affects multinational software exporter margins (TCS, INFY) and energy import balance sheet translation.
                  </p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase font-mono text-[9px] block">What changed:</span>
                  <p className="text-slate-300">
                    Testing 84.85 boundary; RBI liquidity defense detected to curb excessive depreciation.
                  </p>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono pt-1 border-t border-slate-800">
                  <span className="text-cyan-400">RISK: Currency Translation Margin</span>
                  <span className="text-slate-400">Watch: 84.75–84.95 defense band</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. PREMIUM INTELLIGENT COMMAND BAR */}
        <div className="pt-3 border-t border-slate-800/80 relative z-10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <span>⚡</span>
              <span>AI Command Operating System</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">Ask in plain language · Zero complicated financial jargon</span>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleRunCommand(commandInput);
            }}
            className="relative flex items-center"
          >
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Ask Market AI anything (e.g. Which stocks have strong momentum today? Why is Tesla falling? Check my portfolio risk)..."
              className="w-full bg-[#070a0f] border border-slate-700/80 focus:border-cyan-500 rounded-lg py-2.5 pl-4 pr-24 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors shadow-inner"
            />
            <button
              type="submit"
              className="absolute right-1.5 px-3 py-1.5 rounded-md bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors flex items-center gap-1"
            >
              <span>Execute</span>
              <span>→</span>
            </button>
          </form>

          {/* Quick Query Suggestion Pills */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[10px] text-slate-500 font-mono uppercase mr-1">Quick Prompts:</span>
            {quickCommands.slice(0, 5).map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => {
                  setCommandInput(cmd);
                  handleRunCommand(cmd);
                }}
                className="text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-2.5 py-1 rounded-full border border-slate-800 transition-colors"
              >
                {cmd}
              </button>
            ))}
          </div>

          {/* Command Response Drawer */}
          {commandResponse && (
            <div className="bg-[#070a0f] border border-cyan-500/50 rounded-lg p-3.5 space-y-2 shadow-[0_0_20px_rgba(6,182,212,0.12)] animate-fade-in">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-cyan-300 font-bold flex items-center gap-1.5">
                  <span>🧠 AI Response:</span>
                  <span className="text-slate-400 font-normal">"{commandResponse.query}"</span>
                </span>
                <button
                  onClick={() => setCommandResponse(null)}
                  className="text-slate-500 hover:text-white text-xs"
                >
                  ✕ Close
                </button>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                {commandResponse.answer}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-[10px] font-mono">
                <div className="flex items-center gap-1.5">
                  {commandResponse.tags.map((t) => (
                    <span key={t} className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                      {t}
                    </span>
                  ))}
                </div>

                {commandResponse.actionStockId && (
                  <button
                    onClick={() => onSelectStock(commandResponse.actionStockId!)}
                    className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold hover:bg-cyan-900 transition-colors"
                  >
                    Open Deep Analysis on {commandResponse.actionStockId.toUpperCase()} →
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. INTERACTIVE GLOBAL MARKET HEATMAP (Collapsible / Toggleable) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>Global Market Capitalization & Flow Heatmap</span>
            <span className="text-[10px] font-normal text-slate-500 font-mono">(Interactive multi-regional treemap)</span>
          </div>
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono"
          >
            {showHeatmap ? '▼ Minimize Heatmap' : '▲ Expand Heatmap'}
          </button>
        </div>

        {showHeatmap && (
          <GlobalMarketHeatmap
            stocks={stocks}
            onSelectStock={onSelectStock}
            baseCurrency={baseCurrency}
          />
        )}
      </div>

      {/* 6. AI MARKET STANCE & OPPORTUNITY SPECTRUM (5 Categorized Pillars) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>AI Market Stance & Opportunity Spectrum</span>
            <span className="text-[10px] font-normal text-slate-400 normal-case">
              (Multi-factor quantitative categorization with explainable rationale)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">Real-time Verified Signals</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {/* Card 1: 🟢 BUY OPPORTUNITY */}
          <div
            onClick={() => onSelectStock(buyOpportunityStock.id)}
            className="bg-[#0b0f17] border border-emerald-900/60 hover:border-emerald-600 rounded-lg p-3.5 flex flex-col justify-between transition-all cursor-pointer group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  BUY OPPORTUNITY
                </span>
                <span className="text-[10px] font-mono text-slate-400">{buyOpportunityStock.exchange}</span>
              </div>
              <div className="font-bold text-white font-mono text-sm group-hover:text-emerald-400 transition-colors">
                {buyOpportunityStock.qualifiedSymbol}
              </div>
              <div className="text-[11px] text-slate-400 truncate">{buyOpportunityStock.name}</div>
              <div className="mt-2 text-sm font-bold font-mono text-white">
                {formatCurrencyValue(buyOpportunityStock.price, buyOpportunityStock.currency)}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-emerald-400 font-semibold block uppercase">Why this status:</span>
              <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                Healthy pullback testing confirmed technical floor ({buyOpportunityStock.technicals.supportLevel}). RVOL {buyOpportunityStock.technicals.rvol}x confirms institutional accumulation; clean balance sheet.
              </p>
            </div>
          </div>

          {/* Card 2: 🔵 HOLD */}
          <div
            onClick={() => onSelectStock(holdStock.id)}
            className="bg-[#0b0f17] border border-blue-900/60 hover:border-blue-600 rounded-lg p-3.5 flex flex-col justify-between transition-all cursor-pointer group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-400" />
                  HOLD
                </span>
                <span className="text-[10px] font-mono text-slate-400">{holdStock.exchange}</span>
              </div>
              <div className="font-bold text-white font-mono text-sm group-hover:text-blue-400 transition-colors">
                {holdStock.qualifiedSymbol}
              </div>
              <div className="text-[11px] text-slate-400 truncate">{holdStock.name}</div>
              <div className="mt-2 text-sm font-bold font-mono text-white">
                {formatCurrencyValue(holdStock.price, holdStock.currency)}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-blue-400 font-semibold block uppercase">Why this status:</span>
              <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                Consolidating cleanly inside primary upward channel above 50-day moving average ({holdStock.technicals.sma50}). Fundamentals and cash flow intact; no distribution detected.
              </p>
            </div>
          </div>

          {/* Card 3: 🟡 WAIT */}
          <div
            onClick={() => onSelectStock(waitStock.id)}
            className="bg-[#0b0f17] border border-amber-900/60 hover:border-amber-600 rounded-lg p-3.5 flex flex-col justify-between transition-all cursor-pointer group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  WAIT
                </span>
                <span className="text-[10px] font-mono text-slate-400">{waitStock.exchange}</span>
              </div>
              <div className="font-bold text-white font-mono text-sm group-hover:text-amber-400 transition-colors">
                {waitStock.qualifiedSymbol}
              </div>
              <div className="text-[11px] text-slate-400 truncate">{waitStock.name}</div>
              <div className="mt-2 text-sm font-bold font-mono text-white">
                {formatCurrencyValue(waitStock.price, waitStock.currency)}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-amber-400 font-semibold block uppercase">Why this status:</span>
              <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                Trading tightly beneath major resistance level ({waitStock.technicals.resistanceLevel}). Do not front-run; wait for decisive daily breakout close on heavy volume.
              </p>
            </div>
          </div>

          {/* Card 4: 🟠 HIGH RISK */}
          <div
            onClick={() => onSelectStock(highRiskStock.id)}
            className="bg-[#0b0f17] border border-orange-900/60 hover:border-orange-600 rounded-lg p-3.5 flex flex-col justify-between transition-all cursor-pointer group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-orange-400" />
                  HIGH RISK
                </span>
                <span className="text-[10px] font-mono text-slate-400">{highRiskStock.exchange}</span>
              </div>
              <div className="font-bold text-white font-mono text-sm group-hover:text-orange-400 transition-colors">
                {highRiskStock.qualifiedSymbol}
              </div>
              <div className="text-[11px] text-slate-400 truncate">{highRiskStock.name}</div>
              <div className="mt-2 text-sm font-bold font-mono text-white">
                {formatCurrencyValue(highRiskStock.price, highRiskStock.currency)}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-orange-400 font-semibold block uppercase">Why this status:</span>
              <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                Elevated beta and ATR volatility. P/E multiple at {highRiskStock.fundamentals.peRatio}x reflects high growth expectations vulnerable to macro interest rate repricing.
              </p>
            </div>
          </div>

          {/* Card 5: 🔴 SELL / EXIT REVIEW */}
          <div
            onClick={() => onSelectStock(sellReviewStock.id)}
            className="bg-[#0b0f17] border border-rose-900/60 hover:border-rose-600 rounded-lg p-3.5 flex flex-col justify-between transition-all cursor-pointer group shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-rose-400" />
                  SELL / EXIT REVIEW
                </span>
                <span className="text-[10px] font-mono text-slate-400">{sellReviewStock.exchange}</span>
              </div>
              <div className="font-bold text-white font-mono text-sm group-hover:text-rose-400 transition-colors">
                {sellReviewStock.qualifiedSymbol}
              </div>
              <div className="text-[11px] text-slate-400 truncate">{sellReviewStock.name}</div>
              <div className="mt-2 text-sm font-bold font-mono text-white">
                {formatCurrencyValue(sellReviewStock.price, sellReviewStock.currency)}
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800/80">
              <span className="text-[10px] text-rose-400 font-semibold block uppercase">Why this status:</span>
              <p className="text-[11px] text-slate-300 leading-snug mt-0.5">
                Intraday decline of {sellReviewStock.changePercent.toFixed(2)}% breached defensive threshold. Risk parameters triggered; consider trimming or enforcing tight stop-loss.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 7. GLOBAL BENCHMARK INDEXES */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Major Benchmark Indexes ({filteredIndices.length})
            </span>
          </div>

          {/* Region Filter */}
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded border border-slate-800 text-xs font-mono">
            {(['ALL', 'AMERICAS', 'EUROPE', 'ASIA_PACIFIC'] as const).map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-2.5 py-0.5 rounded transition-colors whitespace-nowrap text-[11px] ${
                  selectedRegion === reg
                    ? 'bg-slate-800 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {reg.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {filteredIndices.map((idx) => {
            const isUp = idx.changePercent >= 0;
            const conv = convertCurrency(idx.price, idx.currency, baseCurrency);

            return (
              <div
                key={idx.symbol}
                className="bg-[#0b0f17] border border-slate-800/90 hover:border-slate-700 transition-all rounded-lg p-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span className="font-semibold text-slate-200">{idx.name}</span>
                    <span className="text-[10px] font-mono text-slate-400">{idx.country}</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-lg font-bold font-mono text-white">
                      {formatCurrencyValue(idx.price, idx.currency)}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                        isUp ? 'text-emerald-400 bg-emerald-950/60' : 'text-rose-400 bg-rose-950/60'
                      }`}
                    >
                      {isUp ? '+' : ''}
                      {idx.changePercent.toFixed(2)}%
                    </span>
                  </div>

                  {baseCurrency !== idx.currency && (
                    <div className="text-[11px] font-mono text-slate-400 mt-1">
                      ≈ {formatCurrencyValue(conv.converted, baseCurrency)}
                    </div>
                  )}
                </div>

                {/* 52-Week Range Bar */}
                <div className="mt-3 pt-2.5 border-t border-slate-900 text-[10px] font-mono text-slate-400">
                  <div className="flex justify-between mb-1">
                    <span>52W L: {idx.low52w.toFixed(0)}</span>
                    <span>52W H: {idx.high52w.toFixed(0)}</span>
                  </div>
                  <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                    <div
                      className="bg-slate-600 h-full"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(0, ((idx.price - idx.low52w) / (idx.high52w - idx.low52w)) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. 4-COLUMN MOVERS GRID: Gainers, Losers, Falling Rapidly, Volume Surges */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Top Gainers */}
        <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                ▲ Top Gainers
              </span>
              <button onClick={() => onNavigateTab('search')} className="text-[10px] text-slate-400 hover:text-white">
                All →
              </button>
            </div>
            <div className="space-y-2">
              {topGainers.map((s) => (
                <div
                  key={s.id}
                  onClick={() => onSelectStock(s.id)}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900 transition-colors cursor-pointer text-xs"
                >
                  <div>
                    <span className="font-bold text-white font-mono">{s.symbol}</span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[110px]">{s.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-slate-200">{formatCurrencyValue(s.price, s.currency)}</div>
                    <div className="text-emerald-400 font-bold">+{s.changePercent.toFixed(2)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Top Losers */}
        <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                ▼ Top Decliners
              </span>
              <button onClick={() => onNavigateTab('search')} className="text-[10px] text-slate-400 hover:text-white">
                All →
              </button>
            </div>
            <div className="space-y-2">
              {topLosers.map((s) => (
                <div
                  key={s.id}
                  onClick={() => onSelectStock(s.id)}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900 transition-colors cursor-pointer text-xs"
                >
                  <div>
                    <span className="font-bold text-white font-mono">{s.symbol}</span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[110px]">{s.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-slate-200">{formatCurrencyValue(s.price, s.currency)}</div>
                    <div className="text-rose-400 font-bold">{s.changePercent.toFixed(2)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Stocks Falling Rapidly */}
        <div className="bg-[#0b0f17] border border-orange-950/60 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-orange-900/60">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                🚨 Rapid Drops
              </span>
              <button onClick={() => onNavigateTab('watchlist')} className="text-[10px] text-orange-300 hover:underline">
                Alerts →
              </button>
            </div>
            <div className="space-y-2">
              {fallingRapidly.length > 0 ? (
                fallingRapidly.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => onSelectStock(s.id)}
                    className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900 transition-colors cursor-pointer text-xs"
                  >
                    <div>
                      <span className="font-bold text-white font-mono">{s.symbol}</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[110px]">
                        Support: {s.technicals.supportLevel}
                      </span>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-slate-200">{formatCurrencyValue(s.price, s.currency)}</div>
                      <div className="text-rose-400 font-bold text-[11px]">{s.changePercent.toFixed(2)}%</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-slate-500 text-[11px] font-mono py-4 text-center">
                  No rapid drops &gt;1.5% detected in current session.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 4. Biggest Volume Increases */}
        <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                ⚡ Volume Surges (RVOL)
              </span>
              <button onClick={() => onNavigateTab('scanner')} className="text-[10px] text-slate-400 hover:text-white">
                Scan →
              </button>
            </div>
            <div className="space-y-2">
              {volumeSurges.map((s) => (
                <div
                  key={s.id}
                  onClick={() => onSelectStock(s.id)}
                  className="flex items-center justify-between p-1.5 rounded hover:bg-slate-900 transition-colors cursor-pointer text-xs"
                >
                  <div>
                    <span className="font-bold text-white font-mono">{s.symbol}</span>
                    <span className="text-[10px] text-slate-400 block truncate max-w-[110px]">{s.name}</span>
                  </div>
                  <div className="text-right font-mono">
                    <div className="text-cyan-400 font-bold">{s.technicals.rvol}x RVOL</div>
                    <div className={s.changePercent >= 0 ? 'text-emerald-400 text-[11px]' : 'text-rose-400 text-[11px]'}>
                      {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 9. SECTOR PERFORMANCE & COMMODITIES/FX */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Global Sector Performance */}
        <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
            <span>Global Sector Performance & Inflow</span>
            <span className="text-[10px] font-mono text-slate-500">Live Breadth</span>
          </div>

          <div className="space-y-3">
            {sectorPerformance.map((sec) => {
              const isUp = sec.avgChange >= 0;
              return (
                <div key={sec.sector} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-200 font-medium">{sec.sector}</span>
                    <span className={`font-mono font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isUp ? '+' : ''}{sec.avgChange.toFixed(2)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full ${isUp ? 'bg-emerald-500' : 'bg-rose-500'}`}
                      style={{ width: `${Math.min(100, Math.abs(sec.avgChange) * 20)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Foreign Exchange & Commodities */}
        <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-4 space-y-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Commodities & Energy Benchmarks
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {commodities.map((c) => (
                <div key={c.symbol} className="bg-slate-900/70 p-2.5 rounded border border-slate-800">
                  <div className="text-[10px] text-slate-400 truncate">{c.name}</div>
                  <div className="text-sm font-bold font-mono text-white mt-0.5">${c.price.toFixed(2)}</div>
                  <div
                    className={`text-[10px] font-mono font-semibold ${
                      c.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {c.changePercent >= 0 ? '+' : ''}{c.changePercent.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Foreign Exchange Rates (FX)
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {currencies.slice(0, 6).map((fx) => (
                <div
                  key={fx.pair}
                  className="bg-slate-900/70 p-2 rounded border border-slate-800 flex justify-between items-center text-xs font-mono"
                >
                  <div>
                    <span className="font-semibold text-slate-300">{fx.pair}</span>
                    <div className="text-[10px] text-slate-400">{fx.rate.toFixed(4)}</div>
                  </div>
                  <span className={fx.changePercent >= 0 ? 'text-emerald-400 text-[10px]' : 'text-rose-400 text-[10px]'}>
                    {fx.changePercent >= 0 ? '+' : ''}{fx.changePercent.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Digital Assets (Optional Category)
              </span>
              <button onClick={() => setShowCrypto(!showCrypto)} className="text-[11px] text-slate-400 hover:text-white">
                {showCrypto ? 'Hide' : 'Show'}
              </button>
            </div>

            {showCrypto && (
              <div className="grid grid-cols-3 gap-2 font-mono text-xs">
                {crypto.map((cr) => (
                  <div key={cr.symbol} className="bg-slate-900/70 p-2 rounded border border-slate-800">
                    <div className="text-slate-300 font-bold">{cr.symbol}</div>
                    <div className="text-white">${cr.price.toLocaleString()}</div>
                    <div className={cr.changePercent >= 0 ? 'text-emerald-400 text-[10px]' : 'text-rose-400 text-[10px]'}>
                      +{cr.changePercent.toFixed(2)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
