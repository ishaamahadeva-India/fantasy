import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { placeholderArticles } from '@/lib/placeholder-data';
import { Button } from '../ui/button';
import Link from 'next/link';

export function FeaturedCarousel() {
  const featuredImages = PlaceHolderImages.filter((img) =>
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
        {featuredImages.map((image, index) => (
          <CarouselItem key={index}>
            <Card className="overflow-hidden border-0 rounded-xl">
              <CardContent className="relative flex items-center justify-center p-0 aspect-video">
                <Image
                  src={image.imageUrl}
                  alt={image.description}
                  fill
                  className="object-cover"
                  data-ai-hint={image.imageHint}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="relative z-10 max-w-2xl p-8 text-center text-white">
                  <h2 className="text-3xl font-bold md:text-5xl font-headline text-shadow">
                    {placeholderArticles[index % placeholderArticles.length].title}
                  </h2>
                  <p className="mt-4 text-lg text-neutral-200 text-shadow-sm">
                    {placeholderArticles[index % placeholderArticles.length].excerpt}
                  </p>
                  <Button asChild className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90">
                    <Link href="#">Read More</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden ml-16 md:flex" />
      <CarouselNext className="hidden mr-16 md:flex" />
    </Carousel>
  );
}
