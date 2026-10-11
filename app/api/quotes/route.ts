import { NextResponse } from 'next/server';

let cachedData: any = null;
let cacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000;

export async function GET() {
  const now = Date.now();
  
  if (cachedData && (now - cacheTime) < CACHE_DURATION) {
    return NextResponse.json(cachedData);
  }

  try {
    // ===== MOEDAS (AwesomeAPI) =====
    console.log('🔄 Buscando moedas na AwesomeAPI...');
    const awesomeRes = await fetch(
      'https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL,ETH-BRL',
      { next: { revalidate: 300 } }
    );
    
    console.log('📡 Status AwesomeAPI:', awesomeRes.status);
    const awesomeData = await awesomeRes.json();
    console.log('📦 Dados AwesomeAPI:', JSON.stringify(awesomeData).slice(0, 200));

    const moedas = [
      {
        symbol: 'USD',
        name: 'Dólar',
        price: parseFloat(awesomeData.USDBRL?.bid || '0'),
        change: parseFloat(awesomeData.USDBRL?.pctChange || '0'),
      },
      {
        symbol: 'EUR',
        name: 'Euro',
        price: parseFloat(awesomeData.EURBRL?.bid || '0'),
        change: parseFloat(awesomeData.EURBRL?.pctChange || '0'),
      },
      {
        symbol: 'BTC',
        name: 'Bitcoin',
        price: parseFloat(awesomeData.BTCBRL?.bid || '0'),
        change: parseFloat(awesomeData.BTCBRL?.pctChange || '0'),
      },
      {
        symbol: 'ETH',
        name: 'Ethereum',
        price: parseFloat(awesomeData.ETHBRL?.bid || '0'),
        change: parseFloat(awesomeData.ETHBRL?.pctChange || '0'),
      },
    ];

    console.log('💱 Moedas processadas:', moedas);

    // ===== AÇÕES (Stooq) =====
    const acoesTickers = [
      { symbol: 'VALE3', stooq: 'VALE3.SA' },
      { symbol: 'ITUB4', stooq: 'ITUB4.SA' },
      { symbol: 'BBDC4', stooq: 'BBDC4.SA' },
      { symbol: 'PETR4', stooq: 'PETR4.SA' },
      { symbol: 'ABEV3', stooq: 'ABEV3.SA' },
      { symbol: 'WEGE3', stooq: 'WEGE3.SA' },
      { symbol: 'RENT3', stooq: 'RENT3.SA' },
      { symbol: 'B3SA3', stooq: 'B3SA3.SA' },
      { symbol: 'SUZB3', stooq: 'SUZB3.SA' },
      { symbol: 'JBSS3', stooq: 'JBSS3.SA' },
      { symbol: 'MGLU3', stooq: 'MGLU3.SA' },
    ];

    const acoes = [];
    for (const ticker of acoesTickers) {
      try {
        const stooqRes = await fetch(
          `https://stooq.com/q/l/?s=${ticker.stooq.toLowerCase()}&f=sd2t2ohlcv&h&e=csv`,
          { next: { revalidate: 300 } }
        );
        const csvText = await stooqRes.text();
        const lines = csvText.trim().split('\n');
        if (lines.length >= 2) {
          const values = lines[1].split(',');
          const price = parseFloat(values[6]);
          const open = parseFloat(values[3]);
          const change = open > 0 ? ((price - open) / open) * 100 : 0;
          
          if (!isNaN(price) && price > 0) {
            acoes.push({
              symbol: ticker.symbol,
              name: ticker.symbol,
              price: price,
              change: parseFloat(change.toFixed(2)),
            });
          }
        }
      } catch (err) {
        console.error(` Erro ${ticker.symbol}:`, err);
      }
    }

    // ===== ÍNDICES =====
    const indicesTickers = [
      { symbol: 'IFIX', stooq: 'ifix11.sa' },
    ];

    const indices = [];
    for (const ticker of indicesTickers) {
      try {
        const stooqRes = await fetch(
          `https://stooq.com/q/l/?s=${ticker.stooq.toLowerCase()}&f=sd2t2ohlcv&h&e=csv`,
          { next: { revalidate: 300 } }
        );
        const csvText = await stooqRes.text();
        const lines = csvText.trim().split('\n');
        if (lines.length >= 2) {
          const values = lines[1].split(',');
          const price = parseFloat(values[6]);
          const open = parseFloat(values[3]);
          const change = open > 0 ? ((price - open) / open) * 100 : 0;
          
          if (!isNaN(price) && price > 0) {
            indices.push({
              symbol: ticker.symbol,
              name: ticker.symbol,
              price: price,
              change: parseFloat(change.toFixed(2)),
            });
          }
        }
      } catch (err) {
        console.error(`❌ Erro ${ticker.symbol}:`, err);
      }
    }

    const result = {
      moedas,
      acoes,
      indices,
      timestamp: new Date().toISOString(),
    };

    cachedData = result;
    cacheTime = now;

    return NextResponse.json(result);
  } catch (error) {
    console.error('💥 Erro geral ao buscar cotações:', error);
    
    if (cachedData) {
      return NextResponse.json({ ...cachedData, fallback: true });
    }
    
    // Fallback com dados hardcoded para não quebrar a UI
    return NextResponse.json({
      moedas: [
        { symbol: 'USD', name: 'Dólar', price: 5.15, change: 0.5 },
        { symbol: 'EUR', name: 'Euro', price: 5.60, change: -0.3 },
        { symbol: 'BTC', name: 'Bitcoin', price: 350000, change: 2.1 },
        { symbol: 'ETH', name: 'Ethereum', price: 18000, change: 1.5 },
      ],
      acoes: [],
      indices: [],
      error: 'Usando dados de fallback',
    });
  }
}