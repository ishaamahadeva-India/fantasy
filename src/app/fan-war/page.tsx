
'use client';
import { useState } from 'react';
import { fanWarData, popularEntities } from '@/lib/placeholder-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { Flame, ShieldCheck, Plus, Search } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export default function FanWarPage() {
  const [battles, setBattles] = useState(fanWarData);
  const [searchTerm, setSearchTerm] = useState('');

  const handleVote = (battleId: string, entity: 'entityOne' | 'entityTwo') => {
    setBattles(currentBattles => 
      currentBattles.map(battle => {
        if (battle.id === battleId) {
          // In a real app, you'd prevent multiple votes from the same user.
          // For this demo, we'll just increment the votes.
          const newVotes = { ...battle };
          if (entity === 'entityOne') {
            newVotes.entityOne.votes += 1;
          } else {
            newVotes.entityTwo.votes += 1;
          }
          return newVotes;
        }
        return battle;
      })
    );
  };

  const getFilteredEntities = (category: string) => {
    return popularEntities.filter(e => 
      e.category === category && e.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const movieStars = getFilteredEntities('Movie Stars');
  const cricketers = getFilteredEntities('Cricketers');
  const iplTeams = getFilteredEntities('IPL Teams');
  const politicians = getFilteredEntities('Politicians');
  

  const renderEntityList = (entities: typeof popularEntities) => {
     if (entities.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          No results found.
        </div>
      );
    }
    return (
    <Carousel
        opts={{
          align: 'start',
          slidesToScroll: 'auto',
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4">
          {entities.map(entity => (
            <CarouselItem key={entity.id} className="pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4">
                <Card className="text-center h-full">
                <CardContent className="p-4 flex flex-col items-center gap-3 justify-between h-full">
                    <Avatar className="w-20 h-20">
                    <AvatarImage src={entity.avatar} alt={entity.name} />
                    <AvatarFallback>{entity.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold font-headline">{entity.name}</h3>
                    <Button variant="outline" size="sm" className="w-full">
                    <Plus className="w-4 h-4 mr-2"/>
                    Follow
                    </Button>
                </CardContent>
                </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-0 -translate-x-1/2 top-1/2" />
        <CarouselNext className="absolute right-0 translate-x-1/2 top-1/2" />
      </Carousel>
  )};


  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline flex items-center gap-2">
            <Flame className="w-8 h-8 text-primary"/>
            Fan War
        </h1>
        <p className="mt-2 text-muted-foreground">
          Analyze the stats, vote for your favorite, and settle the debate.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {battles.map(battle => {
          const totalVotes = battle.entityOne.votes + battle.entityTwo.votes;
          const entityOnePercentage = totalVotes > 0 ? (battle.entityOne.votes / totalVotes) * 100 : 50;

          return (
            <Card key={battle.id} className="overflow-hidden">
              <CardHeader className="text-center">
                <CardTitle className="font-headline text-2xl">{battle.title}</CardTitle>
                <CardDescription>{battle.category}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 items-center relative mb-6">
                  {/* Divider */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                     <div className="w-px h-16 bg-border"/>
                     <div className="bg-background border rounded-full p-2 text-primary font-code text-lg font-bold">
                        VS
                     </div>
                     <div className="w-px h-16 bg-border"/>
                  </div>
                  
                  {/* Entity One */}
                  <div className="flex flex-col items-center text-center gap-4">
                    <Avatar className="w-24 h-24 border-4 border-white/10">
                      <AvatarImage src={battle.entityOne.avatar} alt={battle.entityOne.name} />
                      <AvatarFallback>{battle.entityOne.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold font-headline">{battle.entityOne.name}</h3>
                  </div>

                  {/* Entity Two */}
                  <div className="flex flex-col items-center text-center gap-4">
                    <Avatar className="w-24 h-24 border-4 border-white/10">
                      <AvatarImage src={battle.entityTwo.avatar} alt={battle.entityTwo.name} />
                      <AvatarFallback>{battle.entityTwo.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold font-headline">{battle.entityTwo.name}</h3>
                  </div>
                </div>

                {/* Stats Comparison */}
                <Card className='mb-6'>
                    <CardHeader className='p-4'>
                        <CardTitle className='text-lg font-headline flex items-center gap-2'>
                            <ShieldCheck className='w-5 h-5 text-primary' />
                            Head-to-Head Stats
                        </CardTitle>
                    </CardHeader>
                    <CardContent className='p-4 pt-0 text-sm'>
                        <div className='space-y-3'>
                            {battle.entityOne.stats.map((stat, index) => (
                                <div key={stat.label}>
                                    <div className='flex justify-between items-center mb-1 text-muted-foreground'>
                                        <span className='font-bold text-foreground'>{battle.entityOne.stats[index].value}</span>
                                        <span className='text-xs uppercase'>{stat.label}</span>
                                        <span className='font-bold text-foreground'>{battle.entityTwo.stats[index].value}</span>
                                    </div>
                                    <Separator />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Voting Buttons */}
                <div className='grid grid-cols-2 gap-4 mb-6'>
                    <Button onClick={() => handleVote(battle.id, 'entityOne')}>Vote for {battle.entityOne.name}</Button>
                    <Button onClick={() => handleVote(battle.id, 'entityTwo')}>Vote for {battle.entityTwo.name}</Button>
                </div>


                {/* Progress Bar & Vote Count */}
                <div className="mt-6 space-y-2">
                    <Progress value={entityOnePercentage} className="h-4"/>
                    <div className="flex justify-between text-sm font-bold font-code">
                        <div className="text-left">
                            <p className="text-primary">{entityOnePercentage.toFixed(0)}%</p>
                            <p className="text-xs font-normal text-muted-foreground">{battle.entityOne.votes.toLocaleString()} votes</p>
                        </div>
                        <div className="text-right">
                            <p className="text-primary">{(100 - entityOnePercentage).toFixed(0)}%</p>
                            <p className="text-xs font-normal text-muted-foreground">{battle.entityTwo.votes.toLocaleString()} votes</p>
                        </div>
                    </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Separator />

      {/* Hall of Fame Section */}
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold font-headline">Hall of Fame</h2>
                <p className="text-muted-foreground">Follow your favorite stars and teams.</p>
            </div>
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input 
                    placeholder="Search entities..." 
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
        
        <Tabs defaultValue="movie-stars" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-6">
            <TabsTrigger value="movie-stars">Movie Stars</TabsTrigger>
            <TabsTrigger value="cricketers">Cricketers</TabsTrigger>
            <TabsTrigger value="ipl-teams">IPL Teams</TabsTrigger>
            <TabsTrigger value="politicians">Politicians</TabsTrigger>
          </TabsList>
          <TabsContent value="movie-stars">
            {renderEntityList(movieStars)}
          </TabsContent>
          <TabsContent value="cricketers">
            {renderEntityList(cricketers)}
          </TabsContent>
          <TabsContent value="ipl-teams">
            {renderEntityList(iplTeams)}
          </TabsContent>
          <TabsContent value="politicians">
            {renderEntityList(politicians)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

    
    