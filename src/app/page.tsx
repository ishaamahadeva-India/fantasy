import { ForYouSection } from '@/components/home/for-you-section';
import { DailyBrief } from '@/components/home/daily-brief';
import { TrendingTopics } from '@/components/home/trending-topics';
import { Hero } from '@/components/home/hero';

export default function Home() {
  return (
    <div className="flex flex-col gap-8 md:gap-12">
      <Hero />

      <div className="space-y-12">
        <div>
          <h2 className="mb-4 text-2xl font-bold font-headline">
            Today in 60 seconds
          </h2>
          {/* Placeholder for horizontal swipe cards */}
          <div className="flex h-40 items-center justify-center rounded-2xl bg-white/5 p-4 text-center text-muted-foreground">
            <p>Horizontal swipe cards for daily challenges coming soon.</p>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold font-headline">
            Featured Categories
          </h2>
          {/* Placeholder for visual category tiles */}
           <div className="flex h-40 items-center justify-center rounded-2xl bg-white/5 p-4 text-center text-muted-foreground">
            <p>Large visual category tiles coming soon.</p>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold font-headline">
            Trending Now
          </h2>
          <TrendingTopics />
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold font-headline">
            Personalized For You
          </h2>
          <ForYouSection />
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-bold font-headline">
            Daily Brief
          </h2>
          <DailyBrief />
        </div>
      </div>
    </div>
  );
}
