'use client';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
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
  placeholderArticles
} from '@/lib/placeholder-data';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
            <SelectItem value="cricket">Cricket</SelectItem>
            <SelectItem value="football">Football</SelectItem>
            <SelectItem value="movies">Movies</SelectItem>
            <SelectItem value="politics">Politics</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <h2 className="mb-4 text-2xl font-bold font-headline">
          Latest News
        </h2>
        <div className="flex flex-col gap-6">
          {placeholderArticles.map((article, index) => (
            <div key={article.id}>
              <Link href={`/article/${article.slug}`} className="group">
                <div className="grid gap-2">
                    <h3 className="text-xl font-bold leading-snug transition-colors duration-300 font-headline group-hover:text-primary">
                        {article.title}
                    </h3>
                    <p className="text-muted-foreground line-clamp-2">{article.excerpt}</p>
                    <div className="text-xs text-muted-foreground">
                        <span>Published on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'})}</span>
                    </div>
                </div>
              </Link>
              {index < placeholderArticles.length - 1 && <Separator className="mt-6" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
