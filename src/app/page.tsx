import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { ForYouSection } from '@/components/home/for-you-section';
import { FeaturedCarousel } from '@/components/home/featured-carousel';
import { Greeting } from '@/components/home/greeting';
import { DailyBrief } from '@/components/home/daily-brief';
import { TrendingTopics } from '@/components/home/trending-topics';


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
            <TrendingTopics />
          </div>
        </div>
      </div>
    </div>
  );
}
