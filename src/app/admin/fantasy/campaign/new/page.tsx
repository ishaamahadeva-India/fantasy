'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Film, FilmIcon, ArrowRight } from 'lucide-react';

export default function NewFantasyCampaignPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline mb-2">
          Create New Fantasy Campaign
        </h1>
        <p className="text-muted-foreground">
          Choose the type of campaign you want to create
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:border-primary transition-colors cursor-pointer group">
          <Link href="/admin/fantasy/campaign/single/new">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Film className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Single Movie Campaign</CardTitle>
              </div>
              <CardDescription>
                Create a fantasy campaign for a single movie. Perfect for focused movie predictions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  One movie focus
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Simpler setup
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Quick to create
                </li>
              </ul>
              <Button className="w-full group-hover:bg-primary/90">
                Create Single Movie Campaign
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:border-primary transition-colors cursor-pointer group">
          <Link href="/admin/fantasy/campaign/multiple/new">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <FilmIcon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Multiple Movies Campaign</CardTitle>
              </div>
              <CardDescription>
                Create a fantasy campaign with multiple movies. Compare predictions across different releases.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Multiple movies
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Cross-movie comparisons
                </li>
                <li className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4" />
                  More complex setup
                </li>
              </ul>
              <Button className="w-full group-hover:bg-primary/90">
                Create Multiple Movies Campaign
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Link>
        </Card>
      </div>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">Need Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            <strong>Single Movie Campaign:</strong> Best for campaigns focused on one specific movie release. 
            Users make predictions about teasers, trailers, box office, and more for that single movie.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            <strong>Multiple Movies Campaign:</strong> Best for comparing multiple movie releases. 
            Users can make predictions across different movies and compete on overall performance.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
