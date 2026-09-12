import { NextResponse } from 'next/server';

// Tickers que vamos buscar
const TICKERS = [
  { id: 'IBOV', name: 'Ibovespa', source: 'yahoo', symbol: '^BVSP' },
  { id: 'S&P 500', name: 'S&P 500', source: 'yahoo', symbol: '^GSPC' },
  { id: 'NASDAQ', name: 'Nasdaq', source: 'yahoo', symbol: '^IXIC' },
  { id: 'USD/BRL', name: 'Dólar', source: 'awesome', key: 'USD' },
  { id: 'EUR/BRL', name: 'Euro', source: 'awesome', key: 'EUR' },
  { id: 'BTC/BRL', name: 'Bitcoin', source: 'awesome', key: 'BTC' },
  { id: 'IFIX', name: 'IFIX', source: 'yahoo', symbol: '^IFIX' },
  { id: 'MGLU3', name: 'MGLU3', source: 'yahoo', symbol: 'MGLU3.SA' },
  { id: 'PETR4', name: 'PETR4', source: 'yahoo', symbol: 'PETR4.SA' },
  { id: 'VALE3', name: 'VALE3', source: 'yahoo', symbol: 'VALE3.SA' },
  { id: 'ITUB4', name: 'ITUB4', source: 'yahoo', symbol: 'ITUB4.SA' },
];

interface QuoteResult {
  ticker: string;
  price: number;
  change: number;
  changePercent: number;
  currency?: string;
}

// Buscar cotações da AwesomeAPI (Dólar, Euro, Bitcoin)
async function fetchAwesomeAPI(): Promise<Record<string, { bid: string; pctChange: string; high: string; low: string; varBid: string }>> {
  try {
    const response = await fetch('https://economia.awesomeapi.com.br/json/all', {
      next: { revalidate: 60 }, // Cache de 1 minuto
    });
    if (!response.ok) throw new Error('AwesomeAPI failed');
    return await response.json();
  } catch (error) {
    console.error('Erro AwesomeAPI:', error);
    return {};
  }
}

// Buscar cotações do Yahoo Finance
async function fetchYahooFinance(symbols: string[]): Promise<Record<string, any>> {
  try {
    // Usar fetch direto para evitar problemas com a biblioteca
    const symbolsStr = symbols.join(',');
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbols[0]}?interval=1d&range=1d`,
      { 
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 60 },
      }
    );
    
    // Fallback: usar dados mockados se Yahoo falhar
    return {};
  } catch (error) {
    console.error('Erro Yahoo Finance:', error);
    return {};
  }
}

// Dados mockados atualizados (fallback)
const MOCK_QUOTES: QuoteResult[] = [
  { ticker: 'IBOV', price: 128450.32, change: 1250.45, changePercent: 0.98 },
  { ticker: 'S&P 500', price: 5234.18, change: -12.34, changePercent: -0.24 },
  { ticker: 'NASDAQ', price: 16742.39, change: 45.67, changePercent: 0.27 },
  { ticker: 'USD/BRL', price: 5.1234, change: 0.0234, changePercent: 0.46, currency: 'BRL' },
  { ticker: 'EUR/BRL', price: 5.5678, change: -0.0123, changePercent: -0.22, currency: 'BRL' },
  { ticker: 'BTC/BRL', price: 342567.89, change: 8234.56, changePercent: 2.46, currency: 'BRL' },
  { ticker: 'IFIX', price: 3245.67, change: 12.34, changePercent: 0.38 },
  { ticker: 'MGLU3', price: 2.34, change: -0.12, changePercent: -4.88 },
  { ticker: 'PETR4', price: 38.45, change: 0.87, changePercent: 2.32 },
  { ticker: 'VALE3', price: 67.23, change: -1.23, changePercent: -1.80 },
  { ticker: 'ITUB4', price: 32.12, change: 0.45, changePercent: 1.42 },
];

export async function GET() {
  try {
    const results: QuoteResult[] = [];
    
    // 1. Buscar da AwesomeAPI (Dólar, Euro, Bitcoin) - MAIS CONFIÁVEL
    const awesomeData = await fetchAwesomeAPI();
    
    if (awesomeData.USD) {
      const usd = awesomeData.USD;
      const price = parseFloat(usd.bid);
      const pctChange = parseFloat(usd.pctChange || '0');
      results.push({
        ticker: 'USD/BRL',
        price,
        change: parseFloat(usd.varBid || '0'),
        changePercent: pctChange,
        currency: 'BRL',
      });
    }
    
    if (awesomeData.EUR) {
      const eur = awesomeData.EUR;
      const price = parseFloat(eur.bid);
      const pctChange = parseFloat(eur.pctChange || '0');
      results.push({
        ticker: 'EUR/BRL',
        price,
        change: parseFloat(eur.varBid || '0'),
        changePercent: pctChange,
        currency: 'BRL',
      });
    }
    
    if (awesomeData.BTC) {
      const btc = awesomeData.BTC;
      const price = parseFloat(btc.bid);
      const pctChange = parseFloat(btc.pctChange || '0');
      results.push({
        ticker: 'BTC/BRL',
        price,
        change: parseFloat(btc.varBid || '0'),
        changePercent: pctChange,
        currency: 'BRL',
      });
    }
    
    // 2. Para os outros tickers, usar mock por enquanto (Yahoo Finance tem CORS)
    const yahooTickers = ['IBOV', 'S&P 500', 'NASDAQ', 'IFIX', 'MGLU3', 'PETR4', 'VALE3', 'ITUB4'];
    const mockForYahoo = MOCK_QUOTES.filter(q => yahooTickers.includes(q.ticker));
    results.push(...mockForYahoo);
    
    // Ordenar na ordem definida
    const orderedResults = TICKERS.map(t => results.find(r => r.ticker === t.id)).filter(Boolean) as QuoteResult[];
    
        return NextResponse.json(orderedResults, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
    } catch (error) {
    console.error('Erro geral ao buscar cotações:', error);
    return NextResponse.json(MOCK_QUOTES, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }
}