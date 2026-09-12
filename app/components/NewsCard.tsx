'use client';

import { ExternalLink, Clock } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: 'InfoMoney' | 'Investing.com' | 'Investopedia';
  image?: string;
}

const SOURCE_COLORS: Record<string, string> = {
  'InfoMoney': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Investing.com': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Investopedia': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
};

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'agora';
  if (diffMins < 60) return `há ${diffMins} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays < 7) return `há ${diffDays}d`;
  return date.toLocaleDateString('pt-BR');
}

export default function NewsCard({ news }: { news: NewsItem }) {
  return (
    <a
      href={news.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white rounded-xl border border-[#0B1F33]/10 overflow-hidden hover:shadow-lg hover:border-[#A9823A]/30 transition-all duration-300"
    >
      {/* Imagem */}
      <div className="aspect-video bg-gradient-to-br from-[#0B1F33]/5 to-[#A9823A]/5 relative overflow-hidden">
        {news.image ? (
          <img
            src={news.image}
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl opacity-20">📰</div>
          </div>
        )}
        
        {/* Badge da Fonte */}
        <div className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${SOURCE_COLORS[news.source]}`}>
          {news.source}
        </div>
      </div>

      {/* Conteúdo */}
      <div className="p-4">
        <h3 className="font-display font-bold text-[#0B1F33] text-base leading-snug mb-2 line-clamp-2 group-hover:text-[#A9823A] transition-colors">
          {news.title}
        </h3>
        
        <p className="text-sm text-[#707780] line-clamp-2 mb-3 leading-relaxed">
          {news.description}
        </p>

        <div className="flex items-center justify-between text-xs text-[#707780]">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{getRelativeTime(news.pubDate)}</span>
          </div>
          <div className="flex items-center gap-1 text-[#A9823A] opacity-0 group-hover:opacity-100 transition-opacity">
            <span>Ler mais</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </a>
  );
}

// Skeleton para loading
export function NewsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-[#0B1F33]/10 overflow-hidden animate-pulse">
      <div className="aspect-video bg-[#F7F5F0]" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-[#F7F5F0] rounded w-3/4" />
        <div className="h-4 bg-[#F7F5F0] rounded w-full" />
        <div className="h-4 bg-[#F7F5F0] rounded w-2/3" />
        <div className="flex justify-between pt-2">
          <div className="h-3 bg-[#F7F5F0] rounded w-16" />
          <div className="h-3 bg-[#F7F5F0] rounded w-20" />
        </div>
      </div>
    </div>
  );
}