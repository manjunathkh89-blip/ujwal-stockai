import React, { useState } from 'react';
import { EconomicEvent } from '../types/market';

interface NewsCalendarViewProps {
  events: EconomicEvent[];
}

interface NewsItem {
  id: string;
  headline: string;
  source: string;
  time: string;
  category: string;
  affectedSymbols: string[];
  snippet: string;
  url: string;
}

const GLOBAL_NEWS: NewsItem[] = [
  {
    id: 'n-1',
    headline: 'TSMC Q3 Net Profit Surges 54% as AI Hyperscaler Demand Outpaces Semiconductor Supply',
    source: 'Bloomberg / Reuters Taipei',
    time: '2 hours ago',
    category: 'Earnings & AI Hardware',
    affectedSymbols: ['2330.TWSE', 'NVDA.NASDAQ', 'ASML.EURONEXT'],
    snippet: 'Taiwan Semiconductor Manufacturing Co lifted full-year revenue outlook, confirming multi-year capital expenditure plans for 2nm and 3nm wafer nodes.',
    url: 'https://www.reuters.com',
  },
  {
    id: 'n-2',
    headline: 'US Federal Reserve Signals Measured Pace on Rate Easing Following Strong Payrolls and Resilient CPI',
    source: 'Financial Times / Federal Reserve Wire',
    time: '4 hours ago',
    category: 'Central Banking & Macro',
    affectedSymbols: ['S&P 500', 'NASDAQ', 'USD/EUR', 'Gold'],
    snippet: 'Fed officials indicated a gradual reduction path for the federal funds rate as labor market conditions remain solid while core inflation descends toward target.',
    url: 'https://www.ft.com',
  },
  {
    id: 'n-3',
    headline: 'Reserve Bank of India Shifts Monetary Stance to Neutral; Focuses on Inflation Target Alignment',
    source: 'Economic Times / RBI MPC',
    time: '6 hours ago',
    category: 'Emerging Markets Macro',
    affectedSymbols: ['NIFTY 50', 'SENSEX', 'RELIANCE.NSE', 'HDFCBANK.NSE'],
    snippet: 'Governor Shaktikanta Das announced policy rate maintained at 6.50% while shifting to a neutral stance, providing policy flexibility for future economic cycles.',
    url: 'https://www.rbi.org.in',
  },
  {
    id: 'n-4',
    headline: 'European Central Bank Executes 25bps Deposit Facility Rate Cut Citing Disinflation Progress',
    source: 'Euronews / ECB Frankfurt',
    time: '8 hours ago',
    category: 'Eurozone Macro',
    affectedSymbols: ['DAX 40', 'CAC 40', 'EUR/USD', 'SAP.XETRA'],
    snippet: 'ECB President Christine Lagarde noted economic sluggishness across core manufacturing hubs while wage growth indicators normalized.',
    url: 'https://www.ecb.europa.eu',
  },
  {
    id: 'n-5',
    headline: 'Gold Breaches $2,730/oz Record High as Global Sovereign Debt Concerns and Geopolitical Hedging Intensify',
    source: 'Wall Street Journal Commodities',
    time: '10 hours ago',
    category: 'Commodities & Metals',
    affectedSymbols: ['XAU/USD', 'BHP.ASX', 'Treasuries'],
    snippet: 'Central bank physical reserve accumulation and institutional demand propelled bullion to unprecedented nominal heights across international trading desks.',
    url: 'https://www.wsj.com',
  },
];

export const NewsCalendarView: React.FC<NewsCalendarViewProps> = ({ events }) => {
  const [activeTab, setActiveTab] = useState<'CALENDAR' | 'NEWS'>('CALENDAR');
  const [filterImpact, setFilterImpact] = useState<string>('ALL');

  const filteredEvents = events.filter((e) => {
    return filterImpact === 'ALL' || e.impact === filterImpact;
  });

  return (
    <div className="space-y-6">
      <div className="bg-[#0e1420] border border-slate-800 p-5 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Macroeconomic Calendar & Global News</h1>
          <p className="text-xs text-slate-400 mt-1">
            Verified economic event schedule, central bank rate decisions, and market-moving international corporate disclosures.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('CALENDAR')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'CALENDAR'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Economic Calendar ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('NEWS')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'NEWS'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Financial News Wire ({GLOBAL_NEWS.length})
          </button>
        </div>
      </div>

      {activeTab === 'CALENDAR' && (
        <div className="space-y-4">
          {/* Impact Filter */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Filter Impact:</span>
              <div className="flex items-center gap-1">
                {(['ALL', 'High', 'Medium', 'Low'] as const).map((imp) => (
                  <button
                    key={imp}
                    onClick={() => setFilterImpact(imp)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono ${
                      filterImpact === imp
                        ? 'bg-slate-800 text-emerald-400 font-bold border border-slate-700'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {imp}
                  </button>
                ))}
              </div>
            </div>

            <span className="text-slate-400 text-[11px] font-mono">
              Source: Official Central Banks & Statistical Bureaus
            </span>
          </div>

          {/* Economic Calendar List */}
          <div className="bg-[#0b0f17] border border-slate-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse font-mono">
                <thead>
                  <tr className="bg-[#0e1420] text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4 font-sans">Event / Release</th>
                    <th className="py-3 px-4 text-center">Country</th>
                    <th className="py-3 px-4 text-center">Scheduled Time</th>
                    <th className="py-3 px-4 text-center">Impact</th>
                    <th className="py-3 px-4 text-right">Actual</th>
                    <th className="py-3 px-4 text-right">Forecast</th>
                    <th className="py-3 px-4 text-right">Previous</th>
                    <th className="py-3 px-4 font-sans">Affected Markets</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredEvents.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-900/60 transition-colors">
                      <td className="py-3 px-4 font-sans">
                        <div className="font-bold text-white">{e.title}</div>
                        <div className="text-[10px] text-slate-400">{e.source} · {e.category}</div>
                      </td>

                      <td className="py-3 px-4 text-center text-slate-300 font-sans">
                        {e.country}
                      </td>

                      <td className="py-3 px-4 text-center text-slate-400">
                        {e.scheduledTime}
                      </td>

                      <td className="py-3 px-4 text-center font-sans">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            e.impact === 'High'
                              ? 'bg-rose-950 text-rose-400 border border-rose-800'
                              : e.impact === 'Medium'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {e.impact}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right text-emerald-400 font-bold">
                        {e.actual || '—'}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-300">
                        {e.forecast || '—'}
                      </td>

                      <td className="py-3 px-4 text-right text-slate-500">
                        {e.previous || '—'}
                      </td>

                      <td className="py-3 px-4 text-slate-300 font-sans text-[11px]">
                        {e.affectedMarkets.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'NEWS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {GLOBAL_NEWS.map((n) => (
              <div
                key={n.id}
                className="bg-[#0b0f17] border border-slate-800 rounded-lg p-5 space-y-3 hover:border-slate-700 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                  <span className="font-mono text-emerald-400 font-semibold">{n.category}</span>
                  <div className="flex items-center gap-3 font-mono">
                    <span>{n.source}</span>
                    <span>·</span>
                    <span>{n.time}</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer">
                  {n.headline}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {n.snippet}
                </p>

                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400">
                    <span>Impacted:</span>
                    {n.affectedSymbols.map((sym) => (
                      <span key={sym} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                        {sym}
                      </span>
                    ))}
                  </div>

                  <a
                    href={n.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-mono"
                  >
                    Original Disclosure Feed ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
