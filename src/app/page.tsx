
'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCollection, useFirestore, useUser, useDoc } from '@/firebase';
import { collection, query, where, type Query, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';
import type { Article, UserProfile, Movie, Gossip } from '@/lib/types';
import { MessageSquareText } from 'lucide-react';
import { SocialShare } from '@/components/social-share';


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

function GossipList() {
    const firestore = useFirestore();
    const gossipsQuery = firestore ? query(collection(firestore, 'gossips')) : null;
    const { data: gossips, isLoading } = useCollection(gossipsQuery);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Gossip Mill</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                   {[...Array(3)].map((_, i) => (
                     <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-24" />
                     </div>
                   ))}
                </CardContent>
            </Card>
        );
    }
    
    if (!gossips || gossips.length === 0) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Gossip Mill</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                        <MessageSquareText className="w-12 h-12 mx-auto mb-2" />
                        <p>No gossip yet. Check back later!</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Gossip Mill</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-4">
                    {gossips.map((gossip, index) => {
                        const gossipUrl = typeof window !== 'undefined' ? `${window.location.origin}/gossip/${gossip.id}` : '';
                        return (
                            <li key={gossip.id} className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <p className="font-medium">{gossip.title}</p>
                                    <p className="text-xs text-muted-foreground">Source: {gossip.source}</p>
                                </div>
                                <SocialShare
                                    url={gossipUrl}
                                    title={gossip.title}
                                    description={`From ${gossip.source}`}
                                    imageUrl={gossip.imageUrl}
                                    variant="ghost"
                                    size="sm"
                                />
                                {index < gossips.length - 1 && <Separator className="mt-4" />}
                            </li>
                        );
                    })}
                </ul>
            </CardContent>
        </Card>
    )
}

function WatchlistSidebar() {
    const { user } = useUser();
    const firestore = useFirestore();
    const userProfileRef = user ? doc(firestore!, 'users', user.uid) : null;
    const { data: userProfile, isLoading: profileLoading } = useDoc(userProfileRef);

    const watchlistIds = useMemo(() => userProfile?.watchlist || [], [userProfile]);

    const moviesQuery = useMemo(() => {
        if (!firestore || watchlistIds.length === 0) return null;
        return query(collection(firestore, 'movies'), where('__name__', 'in', watchlistIds));
    }, [firestore, watchlistIds]);

    const { data: movies, isLoading: moviesLoading } = useCollection(moviesQuery);
    
    if (!user && !profileLoading) return <GossipList />;

    if (profileLoading || !user) {
        return <Card><CardHeader><Skeleton className="h-8 w-32" /></CardHeader><CardContent><Skeleton className="h-40 w-full" /></CardContent></Card>
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">My Watchlist</CardTitle>
            </CardHeader>
            <CardContent>
                {moviesLoading && <Skeleton className="h-24 w-full" />}
                {!moviesLoading && (!movies || movies.length === 0) && (
                    <p className="text-muted-foreground text-sm">You haven't added any movies to your watchlist yet.</p>
                )}
                <ul className="space-y-4">
                    {movies?.map((movie) => (
                        <li key={movie.id}>
                            <Link href={`/fan-zone/movie/${movie.id}`} className="flex items-center gap-4 group">
                                <div className="relative w-12 h-16 shrink-0">
                                    <Image src={movie.posterUrl || `https://picsum.photos/seed/${movie.id}/200/300`} alt={movie.title} fill className="object-cover rounded-sm" />
                                </div>
                                <div>
                                    <p className="font-semibold group-hover:text-primary">{movie.title}</p>
                                    <p className="text-xs text-muted-foreground">{movie.releaseYear}</p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>
    )
}

type ArticleWithId = Article & { id: string; };

function ArticleList({ category }: { category: string }) {
    const firestore = useFirestore();

    const articlesQuery = useMemo(() => {
        if (!firestore) return null;
        const articlesCollection = collection(firestore, 'articles');
        if (category.toLowerCase() === 'latest') {
            return query(articlesCollection);
        }
        // Use case-insensitive matching by querying and filtering
        // Note: Firestore queries are case-sensitive, so we need to handle this
        return query(articlesCollection, where('category', '==', category));
    }, [firestore, category]);

    const { data: articles, isLoading } = useCollection(articlesQuery);

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6">
                {[...Array(3)].map((_, index) => (
                    <div key={index}>
                        <div className="flex items-start gap-4">
                            <Skeleton className="w-24 h-24 shrink-0" />
                            <div className="flex-grow space-y-2">
                                <Skeleton className="h-6 w-3/4" />
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-8 w-full" />
                            </div>
                        </div>
                        <Separator className="mt-6" />
                    </div>
                ))}
            </div>
        )
    }

    if (articles === null || articles.length === 0) {
      return (
        <div className="py-12 text-center text-muted-foreground">
          No articles found in this category yet.
        </div>
      );
    }
    
    return (
      <div className="flex flex-col">
        {articles.map((article, index) => {
          const showAd = (index + 1) % 2 === 0;
          return (
            <div key={article.id}>
              <div className="group block py-6">
                <Link href={`/article/${article.slug}`} className="block">
                  <div className="flex items-start gap-4">
                    <div className="relative w-24 h-24 shrink-0">
                      <Image
                        src={`https://picsum.photos/seed/${article.id}/150/150`}
                        alt={article.title}
                        fill
                        className="object-cover rounded-md"
                        data-ai-hint="news article"
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
                <div className="mt-2 flex justify-end">
                  <SocialShare
                    url={`${typeof window !== 'undefined' ? window.location.origin : ''}/article/${article.slug}`}
                    title={article.title}
                    description={article.excerpt}
                    imageUrl={article.imageUrl || `https://picsum.photos/seed/${article.id}/1200/600`}
                    variant="ghost"
                    size="sm"
                  />
                </div>
              </div>
              {showAd && <AdBanner />}
              {!showAd && index < articles.length - 1 && <Separator />}
            </div>
          );
        })}
      </div>
    );
  };

export default function HomePage() {
  const categories = ['Cricket', 'Movies', 'Reviews', 'Gallery', 'Opinion'];
  
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
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="latest">
            <ArticleList category="latest" />
          </TabsContent>

          {categories.map((category) => (
            <TabsContent key={category} value={category}>
              <ArticleList category={category} />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <aside className="lg:col-span-1 space-y-8">
        <WatchlistSidebar />
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
