import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { placeholderImages } from '@/lib/placeholder-images';
import { placeholderArticles } from '@/lib/placeholder-data';
import { Button } from '../ui/button';
import Link from 'next/link';

export function FeaturedCarousel() {
  const featuredImages = placeholderImages.filter((img) =>
    img.id.startsWith('hero-')
  );

  return (
    <Carousel
      className="w-full"
      opts={{
        loop: true,
      }}
    >
      <CarouselContent>
        {placeholderArticles.slice(0, featuredImages.length).map((article, index) => (
          <CarouselItem key={index}>
            <Link href={`/article/${article.slug}`}>
              <Card className="overflow-hidden border-0 rounded-3xl">
                <CardContent className="relative flex items-center justify-center p-0 aspect-video">
                  <Image
                    src={featuredImages[index].imageUrl}
                    alt={featuredImages[index].description}
                    fill
                    className="object-cover"
                    data-ai-hint={featuredImages[index].imageHint}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="relative z-10 max-w-3xl p-8 text-center text-white">
                    <h2 className="text-4xl font-bold md:text-6xl font-headline text-shadow">
                      {article.title}
                    </h2>
                    <p className="mt-4 text-lg text-neutral-200 text-shadow-sm">
                      {article.excerpt}
                    </p>
                    <Button asChild className="mt-8 text-lg" size="lg">
                      <div role="button">Read More</div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden ml-20 md:flex" />
      <CarouselNext className="hidden mr-20 md:flex" />
    </Carousel>
  );
}
