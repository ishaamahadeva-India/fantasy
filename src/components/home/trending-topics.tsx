import { placeholderArticles } from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export function TrendingTopics() {
    const trendingTopics = Array.from(new Set(placeholderArticles.map(a => a.category))).slice(0, 5);

    return (
        <div className="flex flex-wrap gap-2">
            {trendingTopics.map(topic => (
                <Link href="#" key={topic}>
                    <Badge 
                        variant="secondary" 
                        className="px-4 py-2 text-sm transition-colors duration-300 ease-in-out rounded-full cursor-pointer hover:bg-primary/20 hover:text-primary"
                    >
                        {topic}
                    </Badge>
                </Link>
            ))}
        </div>
    );
}
