import React, { useState } from 'react';
import { StockItem, MarketSession } from '../types/market';
import { formatCurrencyValue } from '../utils/currency';

interface ExplorerViewProps {
  stocks: StockItem[];
  sessions: MarketSession[];
  onSelectStock: (stockId: string) => void;
}

interface CountryHub {
  country: string;
  region: string;
  flag: string;
  exchanges: string[];
  primaryCurrency: string;
  regulator: string;
  indices: string[];
  activeListedCount: number;
  tradingHours: string;
}

const COUNTRY_HUBS: CountryHub[] = [
  {
    country: 'United States',
    region: 'North America',
    flag: '🇺🇸',
    exchanges: ['NYSE', 'NASDAQ', 'NYSE American', 'Cboe'],
    primaryCurrency: 'USD ($)',
    regulator: 'US Securities and Exchange Commission (SEC)',
    indices: ['S&P 500', 'NASDAQ Composite', 'Dow Jones 30', 'Russell 2000'],
    activeListedCount: 6800,
    tradingHours: '09:30 - 16:00 EDT (Pre: 04:00, Post: 20:00)',
  },
  {
    country: 'India',
    region: 'Asia-Pacific',
    flag: '🇮🇳',
    exchanges: ['National Stock Exchange (NSE)', 'BSE (Bombay Stock Exchange)'],
    primaryCurrency: 'INR (₹)',
    regulator: 'Securities and Exchange Board of India (SEBI)',
    indices: ['NIFTY 50', 'S&P BSE SENSEX', 'Bank NIFTY', 'NIFTY IT'],
    activeListedCount: 5400,
    tradingHours: '09:15 - 15:30 IST (Pre: 09:00 - 09:08)',
  },
  {
    country: 'United Kingdom',
    region: 'Europe',
    flag: '🇬🇧',
    exchanges: ['London Stock Exchange (LSE)'],
    primaryCurrency: 'GBP (£)',
    regulator: 'Financial Conduct Authority (FCA) / Bank of England',
    indices: ['FTSE 100', 'FTSE 250', 'FTSE All-Share'],
    activeListedCount: 1950,
    tradingHours: '08:00 - 16:30 BST',
  },
  {
    country: 'Germany',
    region: 'Europe',
    flag: '🇩🇪',
    exchanges: ['Frankfurt Stock Exchange (Deutsche Börse / XETRA)'],
    primaryCurrency: 'EUR (€)',
    regulator: 'BaFin (Federal Financial Supervisory Authority)',
    indices: ['DAX 40', 'MDAX', 'TecDAX'],
    activeListedCount: 1100,
    tradingHours: '09:00 - 17:30 CEST',
  },
  {
    country: 'Japan',
    region: 'Asia-Pacific',
    flag: '🇯🇵',
    exchanges: ['Tokyo Stock Exchange (TSE / JPX)'],
    primaryCurrency: 'JPY (¥)',
    regulator: 'Financial Services Agency (FSA) / SESC',
    indices: ['Nikkei 225', 'TOPIX', 'TSE Prime'],
    activeListedCount: 3800,
    tradingHours: '09:00 - 15:30 JST (Lunch 11:30 - 12:30)',
  },
  {
    country: 'Hong Kong & China',
    region: 'Asia-Pacific',
    flag: '🇭🇰',
    exchanges: ['Hong Kong Exchanges (HKEX)', 'Shanghai (SSE)', 'Shenzhen (SZSE)'],
    primaryCurrency: 'HKD ($) / CNY (¥)',
    regulator: 'Securities and Futures Commission (SFC) / CSRC',
    indices: ['Hang Seng Index', 'SSE Composite', 'CSI 300'],
    activeListedCount: 4600,
    tradingHours: '09:30 - 16:00 HKT (Stock Connect supported)',
  },
  {
    country: 'Taiwan',
    region: 'Asia-Pacific',
    flag: '🇹🇼',
    exchanges: ['Taiwan Stock Exchange (TWSE)', 'Taipei Exchange (TPEx)'],
    primaryCurrency: 'TWD (NT$)',
    regulator: 'Financial Supervisory Commission (FSC)',
    indices: ['TAIEX (Taiwan Weighted)'],
    activeListedCount: 1800,
    tradingHours: '09:00 - 13:30 CST',
  },
  {
    country: 'Canada',
    region: 'North America',
    flag: '🇨🇦',
    exchanges: ['Toronto Stock Exchange (TSX)', 'TSX Venture Exchange'],
    primaryCurrency: 'CAD ($)',
    regulator: 'Canadian Securities Administrators (CSA) / OSC',
    indices: ['S&P/TSX Composite', 'S&P/TSX 60'],
    activeListedCount: 3100,
    tradingHours: '09:30 - 16:00 EDT',
  },
  {
    country: 'Australia',
    region: 'Asia-Pacific',
    flag: '🇦🇺',
    exchanges: ['Australian Securities Exchange (ASX)'],
    primaryCurrency: 'AUD (A$)',
    regulator: 'Australian Securities and Investments Commission (ASIC)',
    indices: ['S&P/ASX 200', 'All Ordinaries'],
    activeListedCount: 2200,
    tradingHours: '10:00 - 16:00 AEST',
  },
  {
    country: 'Brazil',
    region: 'Latin America',
    flag: '🇧🇷',
    exchanges: ['B3 Brasil Bolsa Balcão'],
    primaryCurrency: 'BRL (R$)',
    regulator: 'Comissão de Valores Mobiliários (CVM)',
    indices: ['Ibovespa (IBOV)'],
    activeListedCount: 450,
    tradingHours: '10:00 - 17:00 BRT',
  },
  {
    country: 'South Korea',
    region: 'Asia-Pacific',
    flag: '🇰🇷',
    exchanges: ['Korea Exchange (KRX)'],
    primaryCurrency: 'KRW (₩)',
    regulator: 'Financial Services Commission (FSC) / FSS',
    indices: ['KOSPI Composite', 'KOSDAQ'],
    activeListedCount: 2400,
    tradingHours: '09:00 - 15:30 KST',
  },
  {
    country: 'Singapore',
    region: 'Asia-Pacific',
    flag: '🇸🇬',
    exchanges: ['Singapore Exchange (SGX)'],
    primaryCurrency: 'SGD ($)',
    regulator: 'Monetary Authority of Singapore (MAS)',
    indices: ['Straits Times Index (STI)'],
    activeListedCount: 650,
    tradingHours: '09:00 - 17:00 SGT',
  },
];

export const ExplorerView: React.FC<ExplorerViewProps> = ({
  stocks,
  sessions,
  onSelectStock,
}) => {
  const [selectedHub, setSelectedHub] = useState<CountryHub>(COUNTRY_HUBS[0]);

  // Stocks belonging to selected country
  const hubStocks = stocks.filter(
    (s) =>
      s.country.toLowerCase().includes(selectedHub.country.toLowerCase()) ||
      (selectedHub.country.includes('Hong Kong') && (s.country.includes('Hong Kong') || s.country.includes('China')))
  );

  return (
    <div className="space-y-6">
      <div className="bg-[#0e1420] border border-slate-800 p-5 rounded-lg space-y-2">
        <h1 className="text-xl font-bold text-white tracking-tight">Country and Exchange Explorer</h1>
        <p className="text-xs text-slate-400">
          Explore international market structures, national regulatory oversight, trading schedules, and sovereign listing hubs across all 6 continents.
        </p>
      </div>

      {/* Country Cards Horizontal Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {COUNTRY_HUBS.map((hub) => {
          const isSelected = hub.country === selectedHub.country;
          return (
            <button
              key={hub.country}
              onClick={() => setSelectedHub(hub)}
              className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-emerald-500 shadow-sm'
                  : 'bg-[#0b0f17] border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="text-xl mb-1">{hub.flag}</div>
                <div className="font-bold text-xs text-white truncate">{hub.country}</div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">{hub.primaryCurrency}</div>
              </div>
              <div className="text-[10px] font-mono text-emerald-400 mt-2">
                {hub.exchanges[0].split(' ')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Country Hub Dossier */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-5 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{selectedHub.flag}</span>
            <div>
              <h2 className="text-lg font-bold text-white">{selectedHub.country} Capital Markets</h2>
              <div className="text-xs text-slate-400 font-mono">
                Region: {selectedHub.region} · Primary Currency: {selectedHub.primaryCurrency}
              </div>
            </div>
          </div>

          <div className="text-right text-xs font-mono">
            <span className="text-slate-400">Trading Hours: </span>
            <span className="text-emerald-400 font-semibold">{selectedHub.tradingHours}</span>
          </div>
        </div>

        {/* Regulatory & Institutional Framework */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
              Securities Regulatory Authority
            </span>
            <div className="text-slate-200 font-sans font-semibold">{selectedHub.regulator}</div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
              Connected National Exchanges
            </span>
            <div className="text-slate-200 font-sans font-semibold">
              {selectedHub.exchanges.join(' · ')}
            </div>
          </div>

          <div className="bg-slate-900/60 p-3 rounded border border-slate-800">
            <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
              Benchmark Sovereign Indices
            </span>
            <div className="text-slate-200 font-sans font-semibold">
              {selectedHub.indices.join(', ')}
            </div>
          </div>
        </div>

        {/* Listed Stocks in this Hub */}
        <div className="space-y-3 pt-2">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Connected Equities in Platform Feed ({hubStocks.length})
          </div>

          {hubStocks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {hubStocks.map((s) => (
                <div
                  key={s.id}
                  onClick={() => onSelectStock(s.id)}
                  className="bg-slate-900/50 p-3.5 rounded border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer flex justify-between items-center text-xs"
                >
                  <div>
                    <div className="font-bold text-white font-mono text-sm">{s.qualifiedSymbol}</div>
                    <div className="text-slate-400 text-[11px] truncate max-w-xs">{s.name}</div>
                    <div className="text-slate-400 text-[10px] mt-0.5">{s.sector}</div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="text-white font-bold">{formatCurrencyValue(s.price, s.currency)}</div>
                    <div className={s.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs bg-slate-900/30 rounded border border-slate-800">
              Provider connection for {selectedHub.country} is configured for index data and awaiting direct broker order routing token.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
