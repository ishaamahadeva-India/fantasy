'use client';
import Link from 'next/link';
import Image from 'next/image';
import { placeholderArticles } from '@/lib/placeholder-data';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ExplorePage() {
  const categories = ['Politics', 'Movies', 'Reviews', 'Gallery', 'Opinion'];
  const articlesByCategory = (category: string) => {
    if (category.toLowerCase() === 'latest') return placeholderArticles;
    return placeholderArticles.filter(
      (article) => article.category.toLowerCase() === category.toLowerCase()
    );
  };

  const renderArticleList = (articles: typeof placeholderArticles) => {
    if (articles.length === 0) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          No articles found in this category yet.
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-6">
        {articles.map((article, index) => (
          <div key={article.id}>
            <Link href={`/article/${article.slug}`} className="group">
              <div className="flex items-start gap-4">
                <div className="relative w-24 h-24 shrink-0">
                    <Image
                    src={`https://picsum.photos/seed/${article.id}/150/150`}
                    alt={article.title}
                    fill
                    className="object-cover rounded-md"
                    data-ai-hint={article.image.imageHint}
                    />
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-bold leading-snug transition-colors duration-300 font-headline group-hover:text-primary">
                    {article.title}
                  </h3>
                  <div className="mt-1 text-xs text-muted-foreground">
                    <span>
                      Published on{' '}
                      {new Date().toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                   <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                    {article.excerpt}
                  </p>
                </div>
              </div>
            </Link>
            {index < articles.length - 1 && <Separator className="mt-6" />}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Intel Hub
        </h1>
        <p className="mt-2 text-muted-foreground">
          Your source for the latest news and analysis.
        </p>
      </div>

      <Tabs defaultValue="latest" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 sm:grid-cols-6">
          <TabsTrigger value="latest">Latest</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category.toLowerCase()}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="latest">
          {renderArticleList(articlesByCategory('latest'))}
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category} value={category.toLowerCase()}>
            {renderArticleList(articlesByCategory(category))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
