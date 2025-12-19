
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { placeholderArticles } from '@/lib/placeholder-data';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function AdBanner() {
    return (
        <Card className="bg-gradient-to-r from-primary/10 via-background to-background border-primary/20 my-6">
            <CardContent className="p-4">
                 <div className="flex items-center justify-center gap-x-4 gap-y-2 text-center">
                    <p className="font-semibold text-sm text-foreground">
                        Sponsored Content by <span className="text-primary font-bold">Our Partners</span>
                    </p>
                    <Button asChild size="sm" variant='outline' className="ml-auto shrink-0">
                        <Link href="#" target="_blank">Learn More</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default function ExplorePage() {
  const categories = ['Politics', 'Movies', 'Reviews', 'Gallery', 'Opinion'];
  const articlesByCategory = (category: string) => {
    if (category.toLowerCase() === 'latest') return placeholderArticles;
    return placeholderArticles.filter(
      (article) => article.category.toLowerCase() === category.toLowerCase()
    );
  };
  
  const gossipArticles = [
    { title: "Special Reason Behind Pawan's Gift to Sujeeth", href: '#' },
    { title: 'Why Prabhas Travels Only in Private Jets?', href: '#' },
    { title: "Why Magic Is Missing In Thaman's Music?", href: '#' },
    { title: 'Pawan Signs Two Films for People Media Factory?', href: '#' },
    { title: 'Akhanda 2... Lokesh\'s Timely Intervention!', href: '#' },
  ];

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
        {articles.map((article, index) => {
          const showAd = (index + 1) % 2 === 0 && index < articles.length - 1;
          return (
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
              {showAd && <AdBanner />}
              {!showAd && index < articles.length - 1 && <Separator className="mt-6" />}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
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

      <aside className="lg:col-span-1 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Gossip</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {gossipArticles.map((item, index) => (
                <li key={index}>
                   <Link href={item.href} className="hover:text-primary transition-colors duration-200">
                      {item.title}
                   </Link>
                   {index < gossipArticles.length - 1 && <Separator className="mt-4" />}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent/10">
            <CardHeader>
                <CardTitle className="font-headline">Sponsored</CardTitle>
                <CardDescription>Exclusive offer from our partner.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <p className="font-bold text-lg">Play Fantasy Cricket on My11Circle!</p>
                <p className="text-sm text-muted-foreground mt-1">Join now and get a special bonus.</p>
            </CardContent>
            <CardFooter>
                 <Button asChild className="w-full">
                    <Link href="#" target="_blank">Play Now</Link>
                </Button>
            </CardFooter>
        </Card>
      </aside>
    </div>
  );
}
