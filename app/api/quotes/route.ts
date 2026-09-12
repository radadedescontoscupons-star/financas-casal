import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

// Mapeamento de tickers para Yahoo Finance
const TICKER_MAP: Record<string, string> = {
  'IBOV': '^BVSP',
  'S&P 500': '^GSPC',
  'NASDAQ': '^IXIC',
  'USD/BRL': 'USDBRL=X',
  'EUR/BRL': 'EURBRL=X',
  'BTC/BRL': 'BTC-BRL',
  'IFIX': '^IFIX',
  'MGLU3': 'MGLU3.SA',
  'PETR4': 'PETR4.SA',
  'VALE3': 'VALE3.SA',
  'ITUB4': 'ITUB4.SA',
};

export async function GET() {
  try {
    const symbols = Object.values(TICKER_MAP);
    const quotes = await yahooFinance.quote(symbols);
    
       const formattedData = Object.entries(TICKER_MAP).map(([displayName, symbol]) => {
      const quoteArray = Array.isArray(quotes) ? quotes : [quotes];
      const quote: any = quoteArray.find((q: any) => q.symbol === symbol);
      
      if (!quote) return null;
      
      return {
        ticker: displayName,
        price: quote.regularMarketPrice ?? 0,
        change: quote.regularMarketChange ?? 0,
        changePercent: quote.regularMarketChangePercent ?? 0,
        currency: quote.currency ?? 'BRL',
      };
    }).filter(Boolean);

    // Cache por 5 minutos
    return NextResponse.json(formattedData, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar cotações:', error);
    
    // Fallback com dados mockados
    const mockData = [
      { ticker: 'IBOV', price: 128450.32, change: 1250.45, changePercent: 0.98 },
      { ticker: 'S&P 500', price: 5234.18, change: -12.34, changePercent: -0.24 },
      { ticker: 'NASDAQ', price: 16742.39, change: 45.67, changePercent: 0.27 },
      { ticker: 'USD/BRL', price: 4.9823, change: 0.0123, changePercent: 0.25 },
      { ticker: 'EUR/BRL', price: 5.4234, change: -0.0234, changePercent: -0.43 },
      { ticker: 'BTC/BRL', price: 342567.89, change: 8234.56, changePercent: 2.46 },
      { ticker: 'IFIX', price: 3245.67, change: 12.34, changePercent: 0.38 },
      { ticker: 'MGLU3', price: 2.34, change: -0.12, changePercent: -4.88 },
      { ticker: 'PETR4', price: 38.45, change: 0.87, changePercent: 2.32 },
      { ticker: 'VALE3', price: 67.23, change: -1.23, changePercent: -1.80 },
      { ticker: 'ITUB4', price: 32.12, change: 0.45, changePercent: 1.42 },
    ];
    
    return NextResponse.json(mockData);
  }
}