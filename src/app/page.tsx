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

      <div className="space-y-12">
        <div>
          <h2 className="mb-4 text-2xl font-bold font-headline">For You</h2>
          <ForYouSection />
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold font-headline">
            Daily Brief
          </h2>
          <DailyBrief />
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold font-headline">
            Trending Now
          </h2>
          <TrendingTopics />
        </div>
      </div>
    </div>
  );
}
