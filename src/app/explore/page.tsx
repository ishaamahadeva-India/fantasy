'use client';
import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  placeholderArticles,
  placeholderCollections,
} from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Mic, Search } from 'lucide-react';

export default function ExplorePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Intel Hub
        </h1>
        <p className="mt-2 text-muted-foreground">
          Cricket · Cinema · Public Affairs
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-grow">
          <Search className="absolute w-4 h-4 left-3 top-3 text-muted-foreground" />
          <Input placeholder="Search for topics..." className="pl-10" />
        </div>
        <Select>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="geopolitics">Geopolitics</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="arts">Arts &amp; Culture</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold font-headline">Collections</h2>
        <div className="grid gap-6">
          {placeholderCollections.map((collection) => (
            <Link href="#" key={collection.id} className="group">
              <Card className="overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-primary/10 hover:border-primary/20">
                <div className="flex flex-col md:flex-row">
                  <div className="relative w-full md:w-1/3 aspect-video md:aspect-auto">
                    <Image
                      src={collection.image.imageUrl}
                      alt={collection.image.description}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint={collection.image.imageHint}
                    />
                  </div>
                  <div className="flex flex-col justify-center flex-1 p-6">
                    <CardTitle className="text-xl font-headline">
                      {collection.title}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {collection.description}
                    </CardDescription>
                    <div className="mt-4 text-sm text-muted-foreground">
                      {collection.itemCount} items
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold font-headline">
          All Publications
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {placeholderArticles.map((article) => (
            <Link href={`/article/${article.slug}`} key={article.id} className="group">
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
      </div>
    </div>
  );
}
