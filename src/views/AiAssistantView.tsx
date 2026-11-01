import React, { useState } from 'react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

const PRESET_QUERIES = [
  'Find strong breakout stocks with volume confirmation',
  'Why is Apple or Tesla falling today?',
  'Which global stocks are testing major verified support floors?',
  'Check my portfolio holdings for high-risk flags',
  'Find stocks with favorable risk/reward ratios (> 1:2.5)',
  'Explain current market regime: Bull, Bear, or Transition?',
  'Compare valuation multiples & ROE of TSMC (Taiwan) vs NVIDIA (US)',
  'Explain auditor resignation red flags in Super Micro Computer & Wirecard',
];

export const AiAssistantView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello. I am the Quantitative Research Analyst of the Global AI Stock Market Intelligence Platform.\n\nI provide objective, explainable cross-market synthesis covering international equities (US, India, UK, Europe, Japan, China, Taiwan, Brazil), macroeconomic policy, technical breakouts, accounting governance red flags, and multi-currency risks.\n\nSelect a preset prompt below or type any market research inquiry.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (queryToSend?: string) => {
    const q = queryToSend || inputQuery;
    if (!q.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const data = await response.json();

      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: data.reply || data.error || 'No analytical response received.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        text: `Analytical Engine Fallback: Unable to reach Gemini server endpoint. Ensure GEMINI_API_KEY environment variable is configured in AI Studio Secrets.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#0e1420] border border-slate-800 p-5 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>🤖</span>
            <span>AI Command Center · "Ask Market AI"</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Institutional natural language engine querying multi-exchange market feeds, balance sheets, news velocity, and macroeconomic regimes.
          </p>
        </div>

        <div className="text-[11px] font-mono text-emerald-400 px-3 py-1 rounded bg-emerald-950/60 border border-emerald-800/60 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Engine: gemini-3.8-flash (Search Grounded)</span>
        </div>
      </div>

      {/* Preset Queries Strip */}
      <div className="space-y-1.5">
        <span className="text-[11px] uppercase font-bold text-slate-400 font-mono tracking-wider">
          Suggested Research Questions:
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_QUERIES.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(preset)}
              className="text-xs px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-slate-700 transition-colors text-left"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-[#0b0f17] border border-slate-800 rounded-lg p-5 min-h-[420px] max-h-[560px] overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'user';
          return (
            <div
              key={m.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-2 mb-1 text-[11px] font-mono text-slate-400">
                <span className="font-semibold text-slate-300">
                  {isUser ? 'Terminal User' : 'AI Quantitative Strategist'}
                </span>
                <span>·</span>
                <span>{m.timestamp}</span>
              </div>

              <div
                className={`max-w-2xl p-4 rounded-lg text-xs leading-relaxed whitespace-pre-wrap ${
                  isUser
                    ? 'bg-emerald-950/60 text-slate-100 border border-emerald-800/60'
                    : 'bg-[#0e1420] text-slate-200 border border-slate-800'
                }`}
              >
                {m.text}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Synthesizing global cross-market intelligence...
          </div>
        )}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-3 bg-[#0e1420] border border-slate-800 p-2 rounded-lg"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask about cross-border stock analysis, breakout validity, inflation impact, or corporate risks..."
          className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none font-mono"
        />

        <button
          type="submit"
          disabled={isLoading || !inputQuery.trim()}
          className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
        >
          {isLoading ? 'Reasoning...' : 'Ask AI Strategist'}
        </button>
      </form>
    </div>
  );
};
