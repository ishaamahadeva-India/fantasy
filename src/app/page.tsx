'use client';
import { FeaturedCarousel } from '@/components/home/featured-carousel';
import { ForYouSection } from '@/components/home/for-you-section';
import { Greeting } from '@/components/home/greeting';
import { TrendingTopics } from '@/components/home/trending-topics';
import { DailyBrief } from '@/components/home/daily-brief';

export default function Home() {
  return (
    <div className="flex flex-col gap-8 md:gap-12">
      <Greeting />
      <FeaturedCarousel />

      <div className="space-y-12">
        <div>
          <h2 className="mb-4 text-2xl font-bold font-headline">
            Today in 60 seconds
          </h2>
          <DailyBrief />
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold font-headline">
            For You
          </h2>
          <ForYouSection />
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold font-headline">
            Trending Topics
          </h2>
          <TrendingTopics />
        </div>
      </div>
    </div>
  );
}
