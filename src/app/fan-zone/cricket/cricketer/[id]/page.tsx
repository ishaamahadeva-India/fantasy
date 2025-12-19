
'use client';
import { placeholderCricketers } from '@/lib/cricket-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';
import { use } from 'react';
import { AttributeRating } from '@/components/fan-zone/attribute-rating';

function RecentFormVisualizer({ form }: { form: number[] }) {
    // Simple visualizer: height represents score, color changes based on value
    const getBarColor = (score: number) => {
        if (score > 75) return 'bg-green-500';
        if (score > 40) return 'bg-yellow-500';
        return 'bg-red-500';
    }
    return (
        <div className="flex items-end gap-2 h-10">
            {form.map((score, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                        className={`w-full rounded-t-sm ${getBarColor(score)}`}
                        style={{ height: `${Math.max(score / 2, 15)}%`}}
                        title={`Score: ${score}`}
                    />
                    <span className="text-xs font-code mt-1">{score}</span>
                </div>
            ))}
        </div>
    )
}

export default function CricketerProfilePage({ params }: { params: { id: string } }) {
  const { id } = use(params);
  const cricketer = placeholderCricketers.find((c) => c.id === id);
  const cricketerAttributes = ["Batting", "Bowling", "Fielding", "Power Hitting"];
  
  if (!cricketer) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/fan-zone/cricket">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Cricket Fan Zone
          </Link>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
        <div className="md:col-span-1">
          <Card className="overflow-hidden">
            <div className="relative aspect-square w-full">
              <Image
                src={cricketer.avatar}
                alt={cricketer.name}
                fill
                className="object-cover"
              />
            </div>
          </Card>
        </div>
        <div className="md:col-span-2 space-y-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-balance">
              {cricketer.name}
            </h1>
            <div className="mt-2 flex items-center gap-2">
              {cricketer.roles.map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
              <Badge variant="outline">{cricketer.country}</Badge>
            </div>
          </div>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Performance Intelligence Panel</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Consistency Index</p>
                        <p className="text-4xl font-bold font-code text-primary">{cricketer.consistencyIndex.toFixed(1)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Impact Score</p>
                        <p className="text-4xl font-bold font-code text-primary">{cricketer.impactScore.toFixed(1)}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Career Phase</p>
                        <p className="text-3xl font-bold">{cricketer.careerPhase}</p>
                    </div>
                    <div className='text-center'>
                         <p className="text-sm text-muted-foreground mb-2">Recent Form</p>
                         <RecentFormVisualizer form={cricketer.recentForm} />
                    </div>
                </CardContent>
            </Card>

          <Separator />

          <div className="space-y-4">
            <h3 className="font-headline text-xl">Fan Actions</h3>
            <div className="flex gap-4">
               <AttributeRating
                triggerButtonText="Rate Performance"
                attributes={cricketerAttributes}
                icon={Star}
                entityId={cricketer.id}
                entityType="cricketer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
