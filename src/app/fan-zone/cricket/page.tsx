
'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { placeholderCricketers, placeholderIpTeams } from '@/lib/cricket-data';

function CricketersTab({ searchTerm }: { searchTerm: string }) {
    const filteredCricketers = placeholderCricketers.filter((cricketer) =>
        cricketer.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filteredCricketers.length === 0) {
        return (
        <div className="py-12 text-center text-muted-foreground">
            No cricketers found.
        </div>
        );
    }
    
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredCricketers.map((cricketer) => (
                <Link href={`/fan-zone/cricket/cricketer/${cricketer.id}`} key={cricketer.id} className="group">
                    <Card className="text-center h-full">
                        <CardContent className="p-4 flex flex-col items-center gap-3 justify-between h-full">
                        <Avatar className="w-24 h-24">
                            <AvatarImage src={cricketer.avatar} alt={cricketer.name} />
                            <AvatarFallback>{cricketer.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <h3 className="font-bold font-headline text-sm group-hover:text-primary">
                            {cricketer.name}
                        </h3>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}

function IpTeamsTab({ searchTerm }: { searchTerm: string }) {
  const filteredTeams = placeholderIpTeams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredTeams.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No IP teams found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {filteredTeams.map((team) => (
        <Link href={`/fan-zone/cricket/ip-team/${team.id}`} key={team.id} className="group">
          <Card className="text-center h-full">
            <CardContent className="p-4 flex flex-col items-center gap-3 justify-between h-full">
              <Avatar className="w-24 h-24">
                <AvatarImage src={team.logo} alt={team.name} />
                <AvatarFallback>{team.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="font-bold font-headline text-sm group-hover:text-primary">
                {team.name}
              </h3>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}


export default function CricketFanZonePage() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Fan Zone – Cricket
        </h1>
        <p className="mt-2 text-muted-foreground">
          Teams · Players · Leagues
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search teams, players..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="cricketers" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 sm:grid-cols-5">
          <TabsTrigger value="cricketers">Cricketers</TabsTrigger>
          <TabsTrigger value="national-teams">National Teams</TabsTrigger>
          <TabsTrigger value="ip-teams">IP Teams</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="analyst-view" disabled>Analyst View</TabsTrigger>
        </TabsList>
        <TabsContent value="cricketers">
          <CricketersTab searchTerm={searchTerm} />
        </TabsContent>
        <TabsContent value="national-teams">
          <div className="py-12 text-center text-muted-foreground">
            National Team content coming soon.
          </div>
        </TabsContent>
        <TabsContent value="ip-teams">
           <IpTeamsTab searchTerm={searchTerm} />
        </TabsContent>
         <TabsContent value="trending">
          <div className="py-12 text-center text-muted-foreground">
            Trending content coming soon.
          </div>
        </TabsContent>
         <TabsContent value="analyst-view">
          <div className="py-12 text-center text-muted-foreground">
            Analyst View content coming soon.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
