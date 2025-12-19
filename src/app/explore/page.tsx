'use client';
import Link from 'next/link';
import {
  placeholderArticles
} from '@/lib/placeholder-data';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ExplorePage() {
  const categories = ['Politics', 'Movies', 'Reviews', 'Gallery', 'Opinion'];
  const articlesByCategory = (category: string) => {
    if (category.toLowerCase() === 'latest') return placeholderArticles;
    // For now, this will filter based on the main categories.
    // "Reviews", "Gallery", and "Opinion" will be empty until we add that content.
    return placeholderArticles.filter(
      (article) => article.category.toLowerCase() === category.toLowerCase()
    );
  };
  
  const renderArticleList = (articles: typeof placeholderArticles) => {
    if (articles.length === 0) {
        return (
            <div className="text-center text-muted-foreground py-12">
                No articles found in this category yet.
            </div>
        );
    }
    return (
        <div className="flex flex-col gap-6">
            {articles.map((article, index) => (
                <div key={article.id}>
                    <Link href={`/article/${article.slug}`} className="group">
                        <div className="grid gap-2">
                            <h3 className="text-xl font-bold leading-snug transition-colors duration-300 font-headline group-hover:text-primary">
                                {article.title}
                            </h3>
                            <p className="text-muted-foreground line-clamp-2">{article.excerpt}</p>
                            <div className="text-xs text-muted-foreground">
                                <span>Published on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}</span>
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
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 mb-6">
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
