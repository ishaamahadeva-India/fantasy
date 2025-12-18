import Link from 'next/link';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { placeholderArticles } from '@/lib/placeholder-data';
import { BookOpen, Mic } from 'lucide-react';

export function ForYouSection() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      {placeholderArticles.map((article) => (
        <Link href="#" key={article.id} className="group">
          <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20">
            <CardHeader className="p-0">
              <div className="relative aspect-video">
                <Image
                  src={article.image.imageUrl}
                  alt={article.image.description}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint={article.image.imageHint}
                />
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <Badge variant="secondary" className="mb-2">
                {article.category}
              </Badge>
              <CardTitle className="text-lg leading-snug font-headline">
                {article.title}
              </CardTitle>
            </CardContent>
            <CardFooter className="flex justify-between p-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                <span>{article.length} Read</span>
              </div>
              {article.hasNarration && (
                <div className="flex items-center gap-1">
                  <Mic className="w-3 h-3" />
                  <span>Narration</span>
                </div>
              )}
            </CardFooter>
          </Card>
        </Link>
      ))}
    </div>
  );
}
