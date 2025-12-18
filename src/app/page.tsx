import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ForYouSection } from '@/components/home/for-you-section';
import { FeaturedCarousel } from '@/components/home/featured-carousel';
import { Greeting } from '@/components/home/greeting';
import { DailyBrief } from '@/components/home/daily-brief';
import Image from 'next/image';
import { placeholderArticles } from '@/lib/placeholder-data';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col gap-8 md:gap-12">
      <Greeting />
      <FeaturedCarousel />
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12">
        <div className="md:col-span-2">
          <h2 className="mb-4 text-2xl font-bold font-headline">For You</h2>
          <ForYouSection />
        </div>
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="mb-4 text-2xl font-bold font-headline">
              Daily Brief
            </h2>
            <DailyBrief />
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-bold font-headline">Trending</h2>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  {placeholderArticles.slice(0, 3).map((article, index) => (
                    <Link
                      href="#"
                      key={article.id}
                      className="flex items-center gap-4 group"
                    >
                      <div className="text-3xl font-bold font-code text-primary/50">
                        0{index + 1}
                      </div>
                      <div>
                        <p className="font-bold group-hover:text-primary">
                          {article.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {article.category}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
