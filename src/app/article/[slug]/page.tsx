import { placeholderArticles } from '@/lib/placeholder-data';
import { notFound } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import Image from 'next/image';
import { AudioPlayer } from '@/components/article/audio-player';

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = placeholderArticles.find((a) => a.slug === params.slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto py-8 md:py-12">
      <article className="prose prose-invert prose-lg max-w-none">
        <div className="space-y-4 not-prose">
            <Badge variant="secondary">{article.category}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-balance">
                {article.title}
            </h1>
            <div className="flex items-center gap-4 text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{article.length} Read</span>
                </div>
            </div>
        </div>
        
        <div className="relative my-8 aspect-video not-prose">
            <Image 
                src={article.image.imageUrl} 
                alt={article.image.description} 
                fill 
                className="object-cover rounded-2xl"
                data-ai-hint={article.image.imageHint}
            />
        </div>

        {article.hasNarration && (
            <div className='not-prose my-8'>
                <AudioPlayer />
            </div>
        )}

        <p className="font-body text-xl text-foreground/80">{article.excerpt}</p>
        <div className="font-body" dangerouslySetInnerHTML={{ __html: article.content }} />
      </article>
    </div>
  );
}
