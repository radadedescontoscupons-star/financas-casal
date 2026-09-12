'use client';

import { useEffect, useState } from 'react';
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
    const interval = setInterval(fetchQuotes, 5 * 60 * 1000); // Atualiza a cada 5 min
    return () => clearInterval(interval);
  }, []);

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
      <div className="bg-[#0e0e0e] border-b border-white/10 py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-6 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-2 animate-pulse">
              <div className="h-4 w-16 bg-white/20 rounded" />
              <div className="h-4 w-20 bg-white/20 rounded" />
              <div className="h-4 w-16 bg-white/20 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && quotes.length === 0) {
    return (
      <div className="bg-[#0e0e0e] border-b border-white/10 py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-white/60 text-sm">Indisponível</span>
          <button onClick={fetchQuotes} className="text-white/60 hover:text-white transition-colors">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0e0e0e] border-b border-white/10 py-2 px-4 sticky top-[72px] z-30">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide whitespace-nowrap">
          {quotes.map((quote) => {
            const isPositive = quote.changePercent >= 0;
            return (
              <div key={quote.ticker} className="flex items-center gap-2 text-sm flex-shrink-0">
                <span className="font-semibold text-white">{quote.ticker}</span>
                <span className="text-white/90 font-mono">{formatPrice(quote.price, quote.currency)}</span>
                <span className={`flex items-center gap-0.5 font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%
                </span>
              </div>
            );
          })}
          
          <button 
            onClick={fetchQuotes}
            className="ml-auto text-white/40 hover:text-white/80 transition-colors flex-shrink-0"
            title="Atualizar cotações"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
}