import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser({
  customFields: {
    item: ['description', 'content:encoded', 'media:content'],
  },
});

const RSS_FEEDS = {
  infomoney: 'https://www.infomoney.com.br/feed/',
  investing: 'https://br.investing.com/rss/news.rss',
  investopedia: 'https://www.investopedia.com/rss.xml',
};

interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: 'InfoMoney' | 'Investing.com' | 'Investopedia';
  image?: string;
}

async function fetchFeed(url: string, source: NewsItem['source']): Promise<NewsItem[]> {
  try {
    const feed = await parser.parseURL(url);
    
    return feed.items.slice(0, 10).map((item, index) => ({
      id: `${source}-${index}-${Date.now()}`,
      title: item.title || 'Sem título',
      description: item.contentSnippet || item.description?.slice(0, 200) || '',
      link: item.link || '#',
      pubDate: item.pubDate || new Date().toISOString(),
      source,
      image: item.enclosure?.url || extractImageFromContent(item['content:encoded']),
    }));
  } catch (error) {
    console.error(`Erro ao buscar feed ${source}:`, error);
    return [];
  }
}

function extractImageFromContent(content?: string): string | undefined {
  if (!content) return undefined;
  const match = content.match(/<img[^>]+src="([^">]+)"/);
  return match?.[1];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get('source') || 'all';
  
  try {
    let news: NewsItem[] = [];
    
    if (source === 'all' || source === 'infomoney') {
      const infomoneyNews = await fetchFeed(RSS_FEEDS.infomoney, 'InfoMoney');
      news = [...news, ...infomoneyNews];
    }
    
    if (source === 'all' || source === 'investing') {
      const investingNews = await fetchFeed(RSS_FEEDS.investing, 'Investing.com');
      news = [...news, ...investingNews];
    }
    
    if (source === 'all' || source === 'investopedia') {
      const investopediaNews = await fetchFeed(RSS_FEEDS.investopedia, 'Investopedia');
      news = [...news, ...investopediaNews];
    }
    
    // Ordenar por data (mais recente primeiro)
    news.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    
    // Limitar a 30 notícias
    news = news.slice(0, 30);
    
    return NextResponse.json(news, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (error) {
    console.error('Erro ao buscar notícias:', error);
    
    // Fallback com dados mockados
    const mockNews: NewsItem[] = [
      {
        id: 'mock-1',
        title: 'Ibovespa fecha em alta com otimismo sobre juros',
        description: 'O principal índice da bolsa brasileira encerrou o pregão com ganhos, impulsionado por ações de commodities e bancos...',
        link: 'https://infomoney.com.br',
        pubDate: new Date(Date.now() - 3600000).toISOString(),
        source: 'InfoMoney',
      },
      {
        id: 'mock-2',
        title: 'Dólar recua ante real com fluxo estrangeiro positivo',
        description: 'A moeda americana registrou queda frente ao real nesta sessão, acompanhando o movimento de entrada de capital estrangeiro...',
        link: 'https://br.investing.com',
        pubDate: new Date(Date.now() - 7200000).toISOString(),
        source: 'Investing.com',
      },
      {
        id: 'mock-3',
        title: 'Fed mantém taxa de juros e sinaliza cortes para 2024',
        description: 'O Federal Reserve decidiu manter a taxa básica de juros inalterada, mas indicou que cortes podem ocorrer no próximo ano...',
        link: 'https://investopedia.com',
        pubDate: new Date(Date.now() - 10800000).toISOString(),
        source: 'Investopedia',
      },
    ];
    
    return NextResponse.json(mockNews);
  }
}