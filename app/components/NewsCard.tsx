'use client';

export function NewsCardSkeleton() {
  return <div className="bg-white rounded-xl p-5 border border-[#0B1F33]/10 animate-pulse"><div className="h-4 bg-[#0B1F33]/10 rounded w-3/4 mb-3" /><div className="h-3 bg-[#0B1F33]/10 rounded w-full mb-2" /><div className="h-3 bg-[#0B1F33]/10 rounded w-2/3" /></div>;
}

export default function NewsCard({ news }: { news: any }) {
  return (
    <a href={news.url || '#'} target="_blank" rel="noopener noreferrer" className="block bg-white rounded-xl p-5 border border-[#0B1F33]/10 hover:shadow-lg transition-all hover:-translate-y-0.5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold text-[#A9823A] bg-[#A9823A]/10 px-2 py-0.5 rounded">{news.source || 'Notícia'}</span>
        <span className="text-xs text-[#707780]">{news.publishedAt ? new Date(news.publishedAt).toLocaleDateString('pt-BR') : ''}</span>
      </div>
      <h3 className="font-display font-bold text-[#0B1F33] text-sm mb-2 line-clamp-2">{news.title || 'Sem título'}</h3>
      <p className="text-xs text-[#707780] line-clamp-3">{news.description || ''}</p>
    </a>
  );
}