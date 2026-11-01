import React, { useState, useMemo } from 'react';
import { CorporateScandal, ScandalSeverity, FactStatus } from '../types/market';

interface ScandalMonitorViewProps {
  scandals: CorporateScandal[];
  onSelectStockBySymbol?: (symbol: string) => void;
}

export const ScandalMonitorView: React.FC<ScandalMonitorViewProps> = ({
  scandals,
  onSelectStockBySymbol,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedFactStatus, setSelectedFactStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const categories = useMemo(() => {
    return Array.from(new Set(scandals.map((s) => s.category))).sort();
  }, [scandals]);

  const filteredScandals = useMemo(() => {
    return scandals.filter((s) => {
      const matchSeverity = selectedSeverity === 'ALL' || s.severity === selectedSeverity;
      const matchCategory = selectedCategory === 'ALL' || s.category === selectedCategory;
      const matchFactStatus = selectedFactStatus === 'ALL' || s.factStatus === selectedFactStatus;
      const matchSearch =
        !searchTerm ||
        s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.regulatorOrSource.toLowerCase().includes(searchTerm.toLowerCase());

      return matchSeverity && matchCategory && matchFactStatus && matchSearch;
    });
  }, [scandals, selectedSeverity, selectedCategory, selectedFactStatus, searchTerm]);

  const getSeverityBadge = (sev: ScandalSeverity) => {
    switch (sev) {
      case 'Critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/80';
      case 'High':
        return 'bg-orange-950/80 text-orange-300 border-orange-700/80';
      case 'Medium':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/80';
      case 'Low':
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getFactStatusBadge = (st: FactStatus) => {
    switch (st) {
      case 'Verified Fact':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
      case 'Official Allegation':
        return 'text-purple-400 bg-purple-950/60 border-purple-800';
      case 'Regulatory Sanction':
        return 'text-rose-400 bg-rose-950/60 border-rose-800';
      case 'Company Response':
        return 'text-blue-400 bg-blue-950/60 border-blue-800';
      case 'Disputed Claim':
        return 'text-amber-400 bg-amber-950/60 border-amber-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Regulatory Governance Protocol */}
      <div className="bg-[#0e1420] border border-slate-800 p-5 rounded-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <span>Global Corporate Risk, Fraud & Scandal Intelligence</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Monitors official regulatory enforcement releases, auditor resignations, restatements, insider trading probes, and activist short-seller reports across US SEC, SEBI India, UK FCA, BaFin, and JPX.
            </p>
          </div>

          <div className="text-[11px] font-mono text-rose-400 px-3 py-1 rounded bg-rose-950/50 border border-rose-800/60">
            Active Filings Tracked: {scandals.length}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-2">
          {/* Search */}
          <div className="bg-[#070a0f] border border-slate-800 rounded p-2">
            <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Company / Entity</span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ticker, company or regulator..."
              className="w-full bg-transparent text-slate-200 placeholder:text-slate-600 focus:outline-none text-xs font-mono"
            />
          </div>

          {/* Severity */}
          <div className="bg-[#070a0f] border border-slate-800 rounded p-2">
            <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Severity Level</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-slate-900">All Severities</option>
              <option value="Critical" className="bg-slate-900">Critical (Delisting/Insolvency)</option>
              <option value="High" className="bg-slate-900">High (Auditor Resignation/Probe)</option>
              <option value="Medium" className="bg-slate-900">Medium (Restatement/Audit Notice)</option>
            </select>
          </div>

          {/* Category */}
          <div className="bg-[#070a0f] border border-slate-800 rounded p-2">
            <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Violation Category</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-slate-900">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
              ))}
            </select>
          </div>

          {/* Evidentiary Status */}
          <div className="bg-[#070a0f] border border-slate-800 rounded p-2">
            <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Evidentiary Status</span>
            <select
              value={selectedFactStatus}
              onChange={(e) => setSelectedFactStatus(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none w-full cursor-pointer text-xs"
            >
              <option value="ALL" className="bg-slate-900">All Statuses</option>
              <option value="Verified Fact" className="bg-slate-900">Verified Fact (Regulatory 8-K)</option>
              <option value="Official Allegation" className="bg-slate-900">Official Allegation (DOJ/SEC)</option>
              <option value="Regulatory Sanction" className="bg-slate-900">Regulatory Sanction</option>
              <option value="Disputed Claim" className="bg-slate-900">Disputed Claim</option>
            </select>
          </div>
        </div>
      </div>

      {/* Evidentiary Rule Card */}
      <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs text-slate-400 flex items-start gap-2.5">
        <span className="text-slate-400 font-bold">ℹ</span>
        <div>
          <span className="font-semibold text-slate-200">Strict Evidentiary Standards:</span> The platform distinguishes verified filings, official court indictments, company replies, and disputed claims. An entity is never characterized as fraudulent without authenticated regulatory or judicial documentation.
        </div>
      </div>

      {/* Corporate Risk Incidents List */}
      <div className="space-y-4">
        {filteredScandals.map((s) => (
          <div
            key={s.id}
            className="bg-[#0b0f17] border border-slate-800 rounded-lg p-5 space-y-3.5 hover:border-slate-700 transition-all"
          >
            {/* Row 1: Company, Symbol, Badges, Date */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-2.5 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <span className="text-base font-bold font-mono text-white">
                  {s.symbol}
                </span>
                <span className="text-xs text-slate-300 font-medium">{s.companyName}</span>
                <span className="text-[10px] font-mono text-slate-400">({s.exchange} · {s.country})</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getSeverityBadge(
                    s.severity
                  )}`}
                >
                  {s.severity} Severity
                </span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getFactStatusBadge(
                    s.factStatus
                  )}`}
                >
                  {s.factStatus}
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {s.publicationDate}
                </span>
              </div>
            </div>

            {/* Headline */}
            <h3 className="text-sm font-bold text-slate-100 leading-snug">
              {s.headline}
            </h3>

            {/* Regulatory Summary */}
            <p className="text-xs text-slate-300 leading-relaxed">
              {s.summary}
            </p>

            {/* Regulatory Source & Investor Implications */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="bg-[#070a0f] p-3 rounded border border-slate-800/80">
                <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block mb-1">
                  Regulatory Provenance & Primary Source
                </span>
                <div className="text-slate-300 font-medium">{s.regulatorOrSource}</div>
                <a
                  href={s.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 underline font-mono mt-1 inline-block"
                >
                  Official Filing Dossier ↗
                </a>
              </div>

              <div className="bg-[#070a0f] p-3 rounded border border-rose-950/40">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-mono uppercase text-rose-400 font-bold">
                    Investor Implications & Capital Risk
                  </span>
                  <span className="text-[10px] font-mono text-rose-400 font-bold">
                    Drawdown: {s.marketImpactPercent}%
                  </span>
                </div>
                <div className="text-slate-300 leading-relaxed text-[11px]">
                  {s.investorImplications}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredScandals.length === 0 && (
          <div className="py-16 text-center text-slate-400 text-xs bg-[#0b0f17] border border-slate-800 rounded-lg">
            No corporate scandals matched the selected criteria.
          </div>
        )}
      </div>
    </div>
  );
};
