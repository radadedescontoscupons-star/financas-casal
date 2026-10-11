'use client';
import { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface Quote { ticker: string; name: string; price: number; change: number; changePercent: number; category: string; }

export default function MarketTicker() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/quotes');
      if (!res.ok) throw new Error('fail');
      const data = await res.json();
      const all: Quote[] = [
        ...(data.moedas || []).map((m: any) => ({ ticker: m.symbol, name: m.name, price: m.price, change: m.change, changePercent: m.change, category: 'currency' })),
        ...(data.acoes || []).map((a: any) => ({ ticker: a.symbol, name: a.name, price: a.price, change: a.change, changePercent: a.change, category: 'br' })),
        ...(data.indices || []).map((i: any) => ({ ticker: i.symbol, name: i.name, price: i.price, change: i.change, changePercent: i.change, category: 'index' })),
      ];
      setQuotes(all);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { fetchQuotes(); const id = setInterval(fetchQuotes, 60000); return () => clearInterval(id); }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el || quotes.length === 0) return;
    let aid: number; let pos = 0;
    const animate = () => { pos += 0.5; if (pos >= el.scrollWidth / 2) pos = 0; el.style.transform = `translateX(-${pos}px)`; aid = requestAnimationFrame(animate); };
    aid = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(aid);
  }, [quotes]);

  const fmt = (p: number, c: string) => c === 'currency' ? (p > 1000 ? p.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : p.toFixed(4)) : (p > 1000 ? p.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : p.toFixed(2));

  if (loading && quotes.length === 0) return <div className="bg-[#0e0e0e] border-b border-white/10 py-2.5 px-4 overflow-hidden"><div className="flex items-center gap-8 animate-pulse">{[...Array(10)].map((_, i) => <div key={i} className="flex items-center gap-2"><div className="h-4 w-14 bg-white/20 rounded" /><div className="h-4 w-18 bg-white/20 rounded" /></div>)}</div></div>;

  const doubled = [...quotes, ...quotes];
  let lastCat = '';

  return (
    <div className="bg-[#0e0e0e] border-b border-white/10 py-2.5 overflow-hidden relative">
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-[#0e0e0e] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-[#0e0e0e] to-transparent z-10 pointer-events-none" />
      <div ref={scrollRef} className="flex items-center gap-6 whitespace-nowrap will-change-transform" style={{ width: 'max-content' }}>
        {doubled.map((q, i) => { const pos = q.changePercent >= 0; const sep = q.category !== lastCat; lastCat = q.category; return <div key={`${q.ticker}-${i}`} className="flex items-center gap-2 text-sm flex-shrink-0">{sep && i > 0 && <span className="text-white/15 mx-1 text-xs">{q.category === 'index' ? '📊' : q.category === 'currency' ? '💰' : '🇧🇷'}</span>}<span className="font-bold text-white tracking-wide text-xs">{q.ticker}</span><span className="text-white/80 font-mono text-xs">{fmt(q.price, q.category)}</span><span className={`flex items-center gap-0.5 font-semibold text-xs ${pos ? 'text-emerald-400' : 'text-red-400'}`}>{pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{pos ? '+' : ''}{q.changePercent.toFixed(2)}%</span><span className="text-white/10 mx-1">│</span></div>; })}
      </div>
      <button onClick={fetchQuotes} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 bg-[#0e0e0e]/80 hover:bg-white/10 rounded-full"><RefreshCw className={`w-3.5 h-3.5 text-white/60 ${loading ? 'animate-spin' : ''}`} /></button>
    </div>
  );
}