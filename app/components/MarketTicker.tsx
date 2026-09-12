'use client';

import { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface Quote {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  currency?: string;
}

export default function MarketTicker() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/quotes');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setQuotes(data);
      setError(false);
    } catch (err) {
      console.error('Erro ao buscar cotações:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
    const interval = setInterval(fetchQuotes, 60 * 1000); // Atualiza a cada 1 min
    return () => clearInterval(interval);
  }, []);

  // Animação de scroll contínuo
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || quotes.length === 0) return;

    let animationId: number;
    let scrollPos = 0;
    const speed = 0.5; // pixels por frame

    const animate = () => {
      scrollPos += speed;
      const halfWidth = el.scrollWidth / 2;
      
      if (scrollPos >= halfWidth) {
        scrollPos = 0;
      }
      
      el.style.transform = `translateX(-${scrollPos}px)`;
      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [quotes]);

  const formatPrice = (price: number, currency?: string) => {
    if (currency === 'USD' || currency === 'EUR') {
      return price.toFixed(4);
    }
    if (price > 1000) {
      return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    return price.toFixed(2);
  };

  if (loading && quotes.length === 0) {
    return (
      <div className="bg-[#0e0e0e] border-b border-white/10 py-2.5 px-4 overflow-hidden">
        <div className="flex items-center gap-8 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-4 w-14 bg-white/20 rounded" />
              <div className="h-4 w-18 bg-white/20 rounded" />
              <div className="h-4 w-14 bg-white/20 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Duplicar os dados para criar loop infinito
  const doubledQuotes = [...quotes, ...quotes];

  return (
    <div className="bg-[#0e0e0e] border-b border-white/10 py-2.5 overflow-hidden relative">
      {/* Gradiente nas bordas */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[#0e0e0e] to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#0e0e0e] to-transparent z-10 pointer-events-none" />
      
      <div 
        ref={scrollRef}
        className="flex items-center gap-8 whitespace-nowrap will-change-transform"
        style={{ width: 'max-content' }}
      >
        {doubledQuotes.map((quote, index) => {
          const isPositive = quote.changePercent >= 0;
          return (
            <div key={`${quote.ticker}-${index}`} className="flex items-center gap-2 text-sm flex-shrink-0">
              <span className="font-bold text-white tracking-wide">{quote.ticker}</span>
              <span className="text-white/90 font-mono text-xs">{formatPrice(quote.price, quote.currency)}</span>
              <span className={`flex items-center gap-0.5 font-semibold text-xs ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
              </span>
              <span className="text-white/20 mx-2">|</span>
            </div>
          );
        })}
      </div>

      {/* Botão de atualizar fixo no canto */}
      <button 
        onClick={fetchQuotes}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 bg-[#0e0e0e]/80 hover:bg-white/10 rounded-full transition-colors"
        title="Atualizar cotações"
      >
        <RefreshCw className={`w-3.5 h-3.5 text-white/60 ${loading ? 'animate-spin' : ''}`} />
      </button>
    </div>
  );
}