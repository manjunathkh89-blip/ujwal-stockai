import React, { useState, useMemo } from 'react';
import { StockItem } from '../types/market';
import { convertCurrency, formatCurrencyValue } from '../utils/currency';

interface SearchViewProps {
  stocks: StockItem[];
  baseCurrency: string;
  onSelectStock: (stockId: string) => void;
}

export const SearchView: React.FC<SearchViewProps> = ({
  stocks,
  baseCurrency,
  onSelectStock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('ALL');
  const [selectedExchange, setSelectedExchange] = useState('ALL');
  const [selectedSector, setSelectedSector] = useState('ALL');

  // Extract unique countries, exchanges, sectors
  const countries = useMemo(() => {
    return Array.from(new Set(stocks.map((s) => s.country))).sort();
  }, [stocks]);

  const exchanges = useMemo(() => {
    return Array.from(new Set(stocks.map((s) => s.exchange))).sort();
  }, [stocks]);

  const sectors = useMemo(() => {
    return Array.from(new Set(stocks.map((s) => s.sector))).sort();
  }, [stocks]);

  // Filtered stocks
  const filteredStocks = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    return stocks.filter((s) => {
      const matchesSearch =
        !q ||
        s.symbol.toLowerCase().includes(q) ||
        s.qualifiedSymbol.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.industry.toLowerCase().includes(q) ||
        s.sector.toLowerCase().includes(q);

      const matchesCountry = selectedCountry === 'ALL' || s.country === selectedCountry;
      const matchesExchange = selectedExchange === 'ALL' || s.exchange === selectedExchange;
      const matchesSector = selectedSector === 'ALL' || s.sector === selectedSector;

      return matchesSearch && matchesCountry && matchesExchange && matchesSector;
    });
  }, [stocks, searchTerm, selectedCountry, selectedExchange, selectedSector]);

  return (
    <div className="space-y-6">
      {/* Header and Search Form */}
      <div className="bg-[#0e1420] border border-slate-800 p-5 rounded-lg space-y-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Universal Global Stock Search</h1>
          <p className="text-xs text-slate-400 mt-1">
            Search multi-exchange listed equities using exchange-qualified tickers, company names, country of origin, or industry classification.
          </p>
        </div>

        {/* Primary Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Ticker (e.g., RELIANCE.NSE, AAPL, 7203.TSE, 2330.TWSE), Company Name, or Keyword..."
            className="w-full bg-[#070a0f] border border-slate-700/80 focus:border-emerald-500 rounded-lg px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none font-mono"
            autoFocus
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-3 text-xs text-slate-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Dropdowns Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Country */}
          <div className="flex items-center gap-2 bg-[#070a0f] border border-slate-800 rounded px-3 py-2">
            <span className="text-slate-500 text-[11px] font-medium">Country:</span>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c} className="bg-slate-900">{c}</option>
              ))}
            </select>
          </div>

          {/* Exchange */}
          <div className="flex items-center gap-2 bg-[#070a0f] border border-slate-800 rounded px-3 py-2">
            <span className="text-slate-500 text-[11px] font-medium">Exchange:</span>
            <select
              value={selectedExchange}
              onChange={(e) => setSelectedExchange(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Exchanges</option>
              {exchanges.map((ex) => (
                <option key={ex} value={ex} className="bg-slate-900">{ex}</option>
              ))}
            </select>
          </div>

          {/* Sector */}
          <div className="flex items-center gap-2 bg-[#070a0f] border border-slate-800 rounded px-3 py-2">
            <span className="text-slate-500 text-[11px] font-medium">Sector:</span>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900">All Sectors</option>
              {sectors.map((sec) => (
                <option key={sec} value={sec} className="bg-slate-900">{sec}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Results Table Header & Count */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing <span className="font-bold text-white">{filteredStocks.length}</span> listed instruments across global feeds
        </div>
        <div className="text-[11px] text-slate-400">
          Preferred Display Currency: <span className="font-mono text-emerald-400 font-bold">{baseCurrency}</span>
        </div>
      </div>

      {/* Results Grid / Table */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#0e1420] text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Instrument / Qualified Ticker</th>
                <th className="py-3 px-4">Country & Exchange</th>
                <th className="py-3 px-4">Sector & Industry</th>
                <th className="py-3 px-4 text-right">Latest Price</th>
                <th className="py-3 px-4 text-right">Converted ({baseCurrency})</th>
                <th className="py-3 px-4 text-right">24h Change</th>
                <th className="py-3 px-4 text-right">Market Cap</th>
                <th className="py-3 px-4 text-center">Feed Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredStocks.map((s) => {
                const isUp = s.changePercent >= 0;
                const conv = convertCurrency(s.price, s.currency, baseCurrency);

                return (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-900/60 transition-colors cursor-pointer group"
                    onClick={() => onSelectStock(s.id)}
                  >
                    {/* Ticker & Name */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-white group-hover:text-emerald-400 transition-colors font-mono">
                        {s.qualifiedSymbol}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{s.name}</div>
                    </td>

                    {/* Country & Exchange */}
                    <td className="py-3 px-4">
                      <div className="text-slate-200">{s.country}</div>
                      <div className="text-[10px] font-mono text-slate-400">{s.exchange}</div>
                    </td>

                    {/* Sector */}
                    <td className="py-3 px-4">
                      <div className="text-slate-300">{s.sector}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{s.industry}</div>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-4 text-right font-mono font-semibold text-white">
                      {formatCurrencyValue(s.price, s.currency)}
                    </td>

                    {/* Converted */}
                    <td className="py-3 px-4 text-right font-mono text-slate-400">
                      {formatCurrencyValue(conv.converted, baseCurrency)}
                    </td>

                    {/* Change */}
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] ${
                          isUp ? 'text-emerald-400 bg-emerald-950/50' : 'text-rose-400 bg-rose-950/50'
                        }`}
                      >
                        {isUp ? '+' : ''}
                        {s.changePercent.toFixed(2)}%
                      </span>
                    </td>

                    {/* Market Cap */}
                    <td className="py-3 px-4 text-right font-mono text-slate-300">
                      {formatCurrencyValue(s.marketCap, s.currency)}
                    </td>

                    {/* Freshness */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
                        {s.dataFreshness}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectStock(s.id);
                        }}
                        className="px-2.5 py-1 text-[11px] font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-950/40 hover:bg-emerald-950/70 border border-emerald-800/60 rounded transition-colors"
                      >
                        Analyze →
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredStocks.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 text-xs">
                    No international instruments match "{searchTerm}" with the active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
