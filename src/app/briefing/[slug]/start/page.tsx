
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, BrainCircuit, Clock, FileText } from 'lucide-react';
import Link from 'next/link';
import { placeholderArticles } from '@/lib/placeholder-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';

export default function PreBriefingPage({ params: { slug } }: { params: { slug: string } }) {
  const article = placeholderArticles.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto text-center">
      <div className="flex flex-col items-center gap-8">
        <div className="space-y-4">
            <h1 className="text-4xl font-bold md:text-5xl font-headline text-balance">
                Intel Briefing: {article.title}
            </h1>
            <div className="flex justify-center gap-4">
                <Badge variant="outline" className="text-sm">
                    <FileText className="w-4 h-4 mr-2" />
                    Comprehension
                </Badge>
                <Badge variant="outline" className="text-sm">
                    <BrainCircuit className="w-4 h-4 mr-2" />
                    Analysis
                </Badge>
            </div>
            <div className="flex justify-center gap-6 text-muted-foreground">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>~3-5 Minutes</span>
                </div>
            </div>
        </div>

        <div className="relative w-full p-6 overflow-hidden rounded-2xl bg-white/5 border border-white/10 aspect-video">
             <Image 
                src={article.image.imageUrl}
                alt={article.image.description}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={article.image.imageHint}
             />
             <div className="absolute inset-0 bg-black/50" />
             <div className="relative z-10 flex flex-col items-center justify-center h-full">
                <h3 className="font-semibold text-xl">What you'll experience</h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-md">You will be shown an AI-generated summary of an article. Your task is to read the original article and provide your own summary to test your comprehension.</p>
             </div>
        </div>
        
        <p className="text-xs text-muted-foreground/50">
            This is a skill-based knowledge challenge. No betting. No real money involved.
        </p>

        <div className="flex flex-col items-center w-full gap-2">
             <Button asChild size="lg" className="w-full">
                <Link href={`/briefing/${article.slug}`}>
                    Start Briefing <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
            </Button>
            <p className="text-xs text-muted-foreground">No interruptions • ~3-5 minutes</p>
        </div>
      </div>
    </div>
  );
}
