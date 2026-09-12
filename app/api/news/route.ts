import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['description', 'content:encoded', 'media:content', 'enclosure'],
  },
  timeout: 10000,
});

const RSS_FEEDS: Record<string, { url: string; source: string }> = {
  infomoney: { url: 'https://www.infomoney.com.br/feed/', source: 'InfoMoney' },
  investing: { url: 'https://br.investing.com/rss/news.rss', source: 'Investing.com' },
  investopedia: { url: 'https://www.investopedia.com/rss.xml', source: 'Investopedia' },
  valor: { url: 'https://valor.globo.com/rss/valor/', source: 'Valor Econômico' },
  moneytimes: { url: 'https://moneytimes.com.br/feed/', source: 'Money Times' },
};

interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  image?: string;
}

async function fetchFeed(key: string): Promise<NewsItem[]> {
  const feedConfig = RSS_FEEDS[key];
  if (!feedConfig) return [];
  
  try {
    const feed = await parser.parseURL(feedConfig.url);
    
    return feed.items.slice(0, 8).map((item: any, index: number) => ({
      id: `${key}-${index}-${Date.now()}`,
      title: item.title || 'Sem título',
      description: (item.contentSnippet || item.description || '').slice(0, 250),
      link: item.link || '#',
      pubDate: item.pubDate || new Date().toISOString(),
      source: feedConfig.source,
      image: item.enclosure?.url || extractImage(item['content:encoded'] || item.description),
    }));
  } catch (error) {
    console.error(`Erro ao buscar feed ${key}:`, error);
    return [];
  }
}

function extractImage(content?: string): string | undefined {
  if (!content) return undefined;
  const match = content.match(/<img[^>]+src=["']([^"']+)["']/);
  return match?.[1];
}

// Dados mockados para fallback
const MOCK_NEWS: NewsItem[] = [
  {
    id: 'mock-1',
    title: 'Ibovespa opera em alta com otimismo sobre cenário fiscal',
    description: 'O principal índice da bolsa brasileira registra ganhos nesta sessão, impulsionado por ações de commodities e do setor financeiro. Investidores acompanham desenvolvimentos sobre o arcabouço fiscal...',
    link: 'https://infomoney.com.br',
    pubDate: new Date(Date.now() - 1800000).toISOString(),
    source: 'InfoMoney',
  },
  {
    id: 'mock-2',
    title: 'Dólar recua ante real com fluxo estrangeiro positivo na B3',
    description: 'A moeda americana registra queda frente ao real nesta sessão, acompanhando o movimento de entrada de capital estrangeiro na bolsa brasileira. O fluxo positivo ajuda a aliviar pressões...',
    link: 'https://br.investing.com',
    pubDate: new Date(Date.now() - 3600000).toISOString(),
    source: 'Investing.com',
  },
  {
    id: 'mock-3',
    title: 'Federal Reserve mantém taxa de juros e sinaliza cautela',
    description: 'O banco central americano decidiu manter a taxa básica de juros inalterada na reunião desta semana. O comunicado destacou a necessidade de mais dados antes de considerar cortes...',
    link: 'https://investopedia.com',
    pubDate: new Date(Date.now() - 5400000).toISOString(),
    source: 'Investopedia',
  },
  {
    id: 'mock-4',
    title: 'Petrobras anuncia novo plano de investimentos para 2024-2028',
    description: 'A estatal apresentou seu plano estratégico quinquenal com foco em exploração e produção no pré-sal. Os investimentos previstos somam US$ 102 bilhões no período...',
    link: 'https://valor.globo.com',
    pubDate: new Date(Date.now() - 7200000).toISOString(),
    source: 'Valor Econômico',
  },
  {
    id: 'mock-5',
    title: 'Bitcoin supera marca de R$ 340 mil com otimismo global',
    description: 'A criptomoeda líder de mercado atingiu nova máxima histórica em reais, impulsionada por fluxos institucionais e expectativas de aprovação de ETFs nos Estados Unidos...',
    link: 'https://moneytimes.com.br',
    pubDate: new Date(Date.now() - 9000000).toISOString(),
    source: 'Money Times',
  },
  {
    id: 'mock-6',
    title: 'Banco Central mantém Selic em 10,50% ao ano',
    description: 'O Copom decidiu por unanimidade manter a taxa básica de juros inalterada. O comunicado reforçou o compromisso com a convergência da inflação à meta estabelecida...',
    link: 'https://infomoney.com.br',
    pubDate: new Date(Date.now() - 10800000).toISOString(),
    source: 'InfoMoney',
  },
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source') || 'all';
  
  try {
    let news: NewsItem[] = [];
    const feedsToFetch = source === 'all' ? Object.keys(RSS_FEEDS) : [source];
    
    const results = await Promise.allSettled(
      feedsToFetch.map(key => fetchFeed(key))
    );
    
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        news = [...news, ...result.value];
      }
    });
    
    // Se não conseguiu buscar nada, usar mock
    if (news.length === 0) {
      const filteredMock = source === 'all' 
        ? MOCK_NEWS 
        : MOCK_NEWS.filter(n => n.source.toLowerCase().includes(source));
      news = filteredMock.length > 0 ? filteredMock : MOCK_NEWS;
    }
    
    // Ordenar por data
    news.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    
    // Limitar
    news = news.slice(0, 30);
    
    return NextResponse.json(news, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Erro geral ao buscar notícias:', error);
    return NextResponse.json(MOCK_NEWS);
  }
}