import { NextResponse } from 'next/server';

interface QuoteResult {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  category: 'br' | 'us' | 'index' | 'currency';
}

// ===== CONFIGURAÇÃO DOS TICKERS =====
const TICKERS_CONFIG = [
  //  ÍNDICES / BOLSAS
  { api: 'INDEX:^BVSP', display: 'IBOV', name: 'Ibovespa', category: 'index' as const },
  { api: 'INDEX:^GSPC', display: 'S&P 500', name: 'S&P 500', category: 'index' as const },
  { api: 'INDEX:^IXIC', display: 'NASDAQ', name: 'Nasdaq', category: 'index' as const },
  { api: 'INDEX:^DJI', display: 'DOW', name: 'Dow Jones', category: 'index' as const },
  { api: 'INDEX:^IFIX', display: 'IFIX', name: 'Índice FIIs', category: 'index' as const },

  // 💰 MOEDAS / CRIPTO
  { api: 'CURRENCY:USD-BRL', display: 'USD/BRL', name: 'Dólar', category: 'currency' as const },
  { api: 'CURRENCY:EUR-BRL', display: 'EUR/BRL', name: 'Euro', category: 'currency' as const },
  { api: 'CURRENCY:BTC-BRL', display: 'BTC/BRL', name: 'Bitcoin', category: 'currency' as const },

  // 🇧🇷 AÇÕES BRASIL - TOP 15
  { api: 'B3:PETR4', display: 'PETR4', name: 'Petrobras', category: 'br' as const },
  { api: 'B3:VALE3', display: 'VALE3', name: 'Vale', category: 'br' as const },
  { api: 'B3:ITUB4', display: 'ITUB4', name: 'Itaú', category: 'br' as const },
  { api: 'B3:BBDC4', display: 'BBDC4', name: 'Bradesco', category: 'br' as const },
  { api: 'B3:ABEV3', display: 'ABEV3', name: 'Ambev', category: 'br' as const },
  { api: 'B3:WEGE3', display: 'WEGE3', name: 'WEG', category: 'br' as const },
  { api: 'B3:RENT3', display: 'RENT3', name: 'Localiza', category: 'br' as const },
  { api: 'B3:B3SA3', display: 'B3SA3', name: 'B3', category: 'br' as const },
  { api: 'B3:SUZB3', display: 'SUZB3', name: 'Suzano', category: 'br' as const },
  { api: 'B3:JBSS3', display: 'JBSS3', name: 'JBS', category: 'br' as const },
  { api: 'B3:MGLU3', display: 'MGLU3', name: 'Magalu', category: 'br' as const },
  { api: 'B3:EMBR3', display: 'EMBR3', name: 'Embraer', category: 'br' as const },
  { api: 'B3:PRIO3', display: 'PRIO3', name: 'Prio', category: 'br' as const },
  { api: 'B3:SBSP3', display: 'SBSP3', name: 'Sabesp', category: 'br' as const },
  { api: 'B3:ELET3', display: 'ELET3', name: 'Eletrobras', category: 'br' as const },

  // 🇺🇸 AÇÕES EUA (via BDRs na B3)
  { api: 'B3:AAPL34', display: 'AAPL34', name: 'Apple BDR', category: 'us' as const },
  { api: 'B3:MSFT34', display: 'MSFT34', name: 'Microsoft BDR', category: 'us' as const },
  { api: 'B3:GOGL34', display: 'GOGL34', name: 'Google BDR', category: 'us' as const },
  { api: 'B3:AMZN34', display: 'AMZN34', name: 'Amazon BDR', category: 'us' as const },
  { api: 'B3:TSLA34', display: 'TSLA34', name: 'Tesla BDR', category: 'us' as const },
  { api: 'B3:NVDA34', display: 'NVDA34', name: 'NVIDIA BDR', category: 'us' as const },
  { api: 'B3:META34', display: 'META34', name: 'Meta BDR', category: 'us' as const },
];

// ===== FALLBACK MOCKADO =====
const MOCK_QUOTES: QuoteResult[] = [
  { ticker: 'IBOV', name: 'Ibovespa', price: 133850.00, change: 850.32, changePercent: 0.64, category: 'index' },
  { ticker: 'S&P 500', name: 'S&P 500', price: 5626.02, change: -8.19, changePercent: -0.15, category: 'index' },
  { ticker: 'NASDAQ', name: 'Nasdaq', price: 17689.36, change: 32.45, changePercent: 0.18, category: 'index' },
  { ticker: 'DOW', name: 'Dow Jones', price: 42114.40, change: 125.60, changePercent: 0.30, category: 'index' },
  { ticker: 'IFIX', name: 'Índice FIIs', price: 3289.45, change: 5.67, changePercent: 0.17, category: 'index' },
  { ticker: 'USD/BRL', name: 'Dólar', price: 5.1234, change: 0.0234, changePercent: 0.46, category: 'currency' },
  { ticker: 'EUR/BRL', name: 'Euro', price: 5.6789, change: -0.0123, changePercent: -0.22, category: 'currency' },
  { ticker: 'BTC/BRL', name: 'Bitcoin', price: 342567.89, change: 8234.56, changePercent: 2.46, category: 'currency' },
  { ticker: 'PETR4', name: 'Petrobras', price: 38.45, change: 0.87, changePercent: 2.32, category: 'br' },
  { ticker: 'VALE3', name: 'Vale', price: 56.78, change: -0.45, changePercent: -0.79, category: 'br' },
  { ticker: 'ITUB4', name: 'Itaú', price: 32.12, change: 0.45, changePercent: 1.42, category: 'br' },
  { ticker: 'BBDC4', name: 'Bradesco', price: 14.56, change: 0.12, changePercent: 0.83, category: 'br' },
  { ticker: 'ABEV3', name: 'Ambev', price: 12.34, change: -0.08, changePercent: -0.64, category: 'br' },
  { ticker: 'WEGE3', name: 'WEG', price: 38.90, change: 0.56, changePercent: 1.46, category: 'br' },
  { ticker: 'RENT3', name: 'Localiza', price: 48.23, change: -0.34, changePercent: -0.70, category: 'br' },
  { ticker: 'B3SA3', name: 'B3', price: 11.45, change: 0.23, changePercent: 2.05, category: 'br' },
  { ticker: 'SUZB3', name: 'Suzano', price: 52.10, change: -0.67, changePercent: -1.27, category: 'br' },
  { ticker: 'JBSS3', name: 'JBS', price: 22.34, change: 0.34, changePercent: 1.55, category: 'br' },
  { ticker: 'MGLU3', name: 'Magalu', price: 2.15, change: -0.05, changePercent: -2.27, category: 'br' },
  { ticker: 'EMBR3', name: 'Embraer', price: 52.80, change: 1.20, changePercent: 2.33, category: 'br' },
  { ticker: 'PRIO3', name: 'Prio', price: 45.67, change: 0.89, changePercent: 1.99, category: 'br' },
  { ticker: 'SBSP3', name: 'Sabesp', price: 78.90, change: -0.45, changePercent: -0.57, category: 'br' },
  { ticker: 'ELET3', name: 'Eletrobras', price: 38.12, change: 0.34, changePercent: 0.90, category: 'br' },
  { ticker: 'AAPL34', name: 'Apple BDR', price: 12.45, change: 0.15, changePercent: 1.22, category: 'us' },
  { ticker: 'MSFT34', name: 'Microsoft BDR', price: 23.67, change: -0.23, changePercent: -0.96, category: 'us' },
  { ticker: 'GOGL34', name: 'Google BDR', price: 8.90, change: 0.12, changePercent: 1.37, category: 'us' },
  { ticker: 'AMZN34', name: 'Amazon BDR', price: 10.23, change: 0.08, changePercent: 0.79, category: 'us' },
  { ticker: 'TSLA34', name: 'Tesla BDR', price: 15.67, change: -0.45, changePercent: -2.79, category: 'us' },
  { ticker: 'NVDA34', name: 'NVIDIA BDR', price: 78.34, change: 2.34, changePercent: 3.08, category: 'us' },
  { ticker: 'META34', name: 'Meta BDR', price: 28.90, change: 0.56, changePercent: 1.98, category: 'us' },
];

// ===== BUSCAR DADOS DA HG BRASIL =====
async function fetchHgBrasil(): Promise<QuoteResult[]> {
  const apiKey = process.env.HG_BRASIL_API_KEY;
  
  if (!apiKey) {
    console.warn('HG_BRASIL_API_KEY não configurada, usando mock');
    return MOCK_QUOTES;
  }

  const tickersParam = TICKERS_CONFIG.map(t => t.api).join(',');
  
  try {
    const response = await fetch(
      `https://api.hgbrasil.com/v2/finance/quotes?tickers=${encodeURIComponent(tickersParam)}&key=${apiKey}`,
      {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        next: { revalidate: 30 },
      }
    );

    if (!response.ok) throw new Error(`HG Brasil retornou ${response.status}`);

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      throw new Error('HG Brasil retornou dados vazios');
    }

    const results: QuoteResult[] = [];

    for (const config of TICKERS_CONFIG) {
      const item = data.results.find((r: any) => {
        if (config.api.startsWith('INDEX:')) {
          return r.ticker === config.api || r.symbol === config.api.replace('INDEX:', '');
        }
        if (config.api.startsWith('CURRENCY:')) {
          return r.ticker === config.api || r.symbol === config.api.replace('CURRENCY:', '');
        }
        return r.ticker === config.api || r.symbol === config.api.replace('B3:', '');
      });

      if (item?.quote) {
        results.push({
          ticker: config.display,
          name: config.name,
          price: item.quote.value ?? 0,
          change: item.quote.change_value ?? 0,
          changePercent: item.quote.change_percent ?? 0,
          category: config.category,
        });
      }
    }

    // Se conseguiu pelo menos alguns dados, usar + mock para os que faltaram
    if (results.length > 0) {
      const missingTickers = TICKERS_CONFIG.filter(
        c => !results.find(r => r.ticker === c.display)
      );
      
      for (const missing of missingTickers) {
        const mockItem = MOCK_QUOTES.find(m => m.ticker === missing.display);
        if (mockItem) results.push(mockItem);
      }
      
      return results;
    }

    throw new Error('Nenhum dado válido retornado');
  } catch (error) {
    console.error('Erro HG Brasil:', error);
    
    // Fallback: tentar AwesomeAPI para moedas
    try {
      const awesomeRes = await fetch('https://economia.awesomeapi.com.br/json/all');
      const awesomeData = await awesomeRes.json();
      
      const currencyResults: QuoteResult[] = [];
      
      if (awesomeData.USD) {
        currencyResults.push({
          ticker: 'USD/BRL', name: 'Dólar',
          price: parseFloat(awesomeData.USD.bid),
          change: parseFloat(awesomeData.USD.varBid || '0'),
          changePercent: parseFloat(awesomeData.USD.pctChange || '0'),
          category: 'currency',
        });
      }
      if (awesomeData.EUR) {
        currencyResults.push({
          ticker: 'EUR/BRL', name: 'Euro',
          price: parseFloat(awesomeData.EUR.bid),
          change: parseFloat(awesomeData.EUR.varBid || '0'),
          changePercent: parseFloat(awesomeData.EUR.pctChange || '0'),
          category: 'currency',
        });
      }
      if (awesomeData.BTC) {
        currencyResults.push({
          ticker: 'BTC/BRL', name: 'Bitcoin',
          price: parseFloat(awesomeData.BTC.bid),
          change: parseFloat(awesomeData.BTC.varBid || '0'),
          changePercent: parseFloat(awesomeData.BTC.pctChange || '0'),
          category: 'currency',
        });
      }
      
      // Juntar moedas reais + mock para o resto
      const mockWithoutCurrency = MOCK_QUOTES.filter(m => m.category !== 'currency');
      return [...currencyResults, ...mockWithoutCurrency];
    } catch {
      return MOCK_QUOTES;
    }
  }
}

export async function GET() {
  try {
    const results = await fetchHgBrasil();
    
    return NextResponse.json(results, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Erro geral:', error);
    return NextResponse.json(MOCK_QUOTES, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }
}