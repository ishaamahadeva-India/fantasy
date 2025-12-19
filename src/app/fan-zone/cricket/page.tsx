
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Lock, Search, SlidersHorizontal, Flame, BarChartHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  placeholderCricketers,
  placeholderIpTeams,
  placeholderNationalTeams,
  type Cricketer,
} from '@/lib/cricket-data';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AnimatePresence, motion } from 'framer-motion';

function CricketersTab({
  searchTerm,
  filters,
}: {
  searchTerm: string;
  filters: { roles: string[]; countries: string[] };
}) {
  const filteredCricketers = placeholderCricketers
    .filter((cricketer) =>
      cricketer.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((cricketer) => {
      if (filters.roles.length > 0) {
        if (!filters.roles.some((role) => cricketer.roles.includes(role))) {
          return false;
        }
      }
      if (filters.countries.length > 0) {
        if (!filters.countries.includes(cricketer.country)) {
          return false;
        }
      }
      return true;
    });

  if (filteredCricketers.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No cricketers found matching your criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {filteredCricketers.map((cricketer) => (
        <Link
          href={`/fan-zone/cricket/cricketer/${cricketer.id}`}
          key={cricketer.id}
          className="group"
        >
          <Card className="text-center h-full">
            <CardContent className="p-4 flex flex-col items-center gap-3 justify-between h-full">
              <Avatar className="w-24 h-24">
                <AvatarImage
                  src={cricketer.avatar}
                  alt={cricketer.name}
                />
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

function NationalTeamsTab({ searchTerm }: { searchTerm: string }) {
  const filteredTeams = placeholderNationalTeams.filter((team) =>
    team.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (filteredTeams.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No national teams found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {filteredTeams.map((team) => (
        <Link
          href={`/fan-zone/cricket/national-team/${team.id}`}
          key={team.id}
          className="group"
        >
          <Card className="text-center h-full">
            <CardContent className="p-4 flex flex-col items-center gap-3 justify-between h-full">
              <Avatar className="w-24 h-24">
                <AvatarImage src={team.crest} alt={team.name} />
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
        <Link
          href={`/fan-zone/cricket/ip-team/${team.id}`}
          key={team.id}
          className="group"
        >
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

function TrendingTab() {
  const trendingCricketers = [...placeholderCricketers]
    .filter(c => c.trendingRank)
    .sort((a, b) => (a.trendingRank || 99) - (b.trendingRank || 99));

  if (trendingCricketers.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        Trending content coming soon.
      </div>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Flame className="text-primary" /> Trending Cricketers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {trendingCricketers.map((cricketer, index) => (
            <li key={cricketer.id}>
              <Link href={`/fan-zone/cricket/cricketer/${cricketer.id}`} className="group">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold font-code text-muted-foreground w-8 text-center">
                    {index + 1}
                  </span>
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={cricketer.avatar} alt={cricketer.name} />
                    <AvatarFallback>{cricketer.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold font-headline text-lg leading-tight group-hover:text-primary">
                      {cricketer.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {cricketer.country}
                    </p>
                  </div>
                </div>
              </Link>
              {index < trendingCricketers.length - 1 && (
                <Separator className="mt-4" />
              )}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function StatBar({ label, value1, value2, higherIsBetter = true }: { label: string, value1: number, value2: number, higherIsBetter?: boolean }) {
  const p1_is_winner = higherIsBetter ? value1 > value2 : value1 < value2;
  const p2_is_winner = higherIsBetter ? value2 > value1 : value2 < value1;
  const is_tie = value1 === value2;
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1 text-sm font-medium">
        <span className={`${p1_is_winner && 'text-primary'}`}>{value1}</span>
        <span className="text-muted-foreground">{label}</span>
        <span className={`${p2_is_winner && 'text-primary'}`}>{value2}</span>
      </div>
      <div className="flex items-center gap-1">
        <div className={`h-2 w-1/2 rounded-l-full ${p1_is_winner || is_tie ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`h-2 w-1/2 rounded-r-full ${p2_is_winner || is_tie ? 'bg-primary' : 'bg-muted'}`} />
      </div>
    </div>
  );
}

function AnalystViewTab() {
  const [player1, setPlayer1] = useState<string | undefined>(undefined);
  const [player2, setPlayer2] = useState<string | undefined>(undefined);

  const getPlayerById = (id: string | undefined): Cricketer | undefined => {
      if (!id) return undefined;
      return placeholderCricketers.find(p => p.id === id);
  }

  const p1Data = getPlayerById(player1);
  const p2Data = getPlayerById(player2);


  return (
      <Card>
        <CardHeader>
            <CardTitle className="font-headline">Analyst View</CardTitle>
            <CardDescription>Compare player stats head-to-head.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
              <div className="flex flex-col items-center gap-2">
                 <h3 className="font-semibold text-lg">Player 1</h3>
                  <Select onValueChange={setPlayer1} value={player1}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select a player" />
                    </SelectTrigger>
                    <SelectContent>
                      {placeholderCricketers.map(p => (
                        <SelectItem key={p.id} value={p.id} disabled={p.id === player2}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
              <div className="text-center font-bold text-2xl font-headline text-muted-foreground">VS</div>
              <div className="flex flex-col items-center gap-2">
                   <h3 className="font-semibold text-lg">Player 2</h3>
                    <Select onValueChange={setPlayer2} value={player2}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select a player" />
                    </SelectTrigger>
                    <SelectContent>
                      {placeholderCricketers.map(p => (
                        <SelectItem key={p.id} value={p.id} disabled={p.id === player1}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>
          </div>
          <AnimatePresence>
          {p1Data && p2Data && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="pt-6 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4 border-t pt-6">
                   <div className="flex flex-col items-center text-center gap-2">
                     <Avatar className="w-20 h-20">
                        <AvatarImage src={p1Data.avatar} alt={p1Data.name} />
                        <AvatarFallback>{p1Data.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold font-headline">{p1Data.name}</h3>
                    <p className="text-sm text-muted-foreground">{p1Data.country}</p>
                   </div>
                   <div className="space-y-4">
                    <StatBar label="Consistency" value1={p1Data.consistencyIndex} value2={p2Data.consistencyIndex} />
                    <StatBar label="Impact Score" value1={p1Data.impactScore} value2={p2Data.impactScore} />
                   </div>
                   <div className="flex flex-col items-center text-center gap-2">
                     <Avatar className="w-20 h-20">
                        <AvatarImage src={p2Data.avatar} alt={p2Data.name} />
                        <AvatarFallback>{p2Data.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="font-bold font-headline">{p2Data.name}</h3>
                    <p className="text-sm text-muted-foreground">{p2Data.country}</p>
                   </div>
                </div>
              </motion.div>
          )}
          </AnimatePresence>
        </CardContent>
      </Card>
  )
}

export default function CricketFanZonePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{ roles: string[], countries: string[] }>({ roles: [], countries: [] });

  const allRoles = [
    ...new Set(placeholderCricketers.flatMap((c) => c.roles)),
  ];
  const allCountries = [...new Set(placeholderCricketers.map((c) => c.country))];

  const handleFilterChange = (type: 'roles' | 'countries', value: string, checked: boolean) => {
    setFilters(prev => {
        const currentValues = prev[type];
        if(checked) {
            return { ...prev, [type]: [...currentValues, value] };
        } else {
            return { ...prev, [type]: currentValues.filter(v => v !== value) };
        }
    });
  };

  const clearFilters = () => {
    setFilters({ roles: [], countries: []});
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Fan Zone – Cricket
        </h1>
        <p className="mt-2 text-muted-foreground">Teams · Players · Leagues</p>
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
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filter
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Cricketers</SheetTitle>
            </SheetHeader>
            <div className="py-4 space-y-6">
              <div>
                <h3 className="font-semibold mb-3">Role</h3>
                <div className="space-y-2">
                  {allRoles.map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={`role-${role}`}
                        checked={filters.roles.includes(role)}
                        onCheckedChange={(checked) => handleFilterChange('roles', role, !!checked)}
                      />
                      <Label htmlFor={`role-${role}`} className="font-normal">
                        {role}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <Separator />
               <div>
                <h3 className="font-semibold mb-3">Country</h3>
                <div className="space-y-2">
                  {allCountries.map((country) => (
                    <div key={country} className="flex items-center space-x-2">
                      <Checkbox
                        id={`country-${country}`}
                         checked={filters.countries.includes(country)}
                        onCheckedChange={(checked) => handleFilterChange('countries', country, !!checked)}
                      />
                      <Label htmlFor={`country-${country}`} className="font-normal">
                        {country}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <SheetFooter>
                <Button variant="ghost" onClick={clearFilters}>Clear All</Button>
              <SheetClose asChild>
                <Button>Apply Filters</Button>
              </SheetClose>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      <Tabs defaultValue="cricketers" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6 sm:grid-cols-5">
          <TabsTrigger value="cricketers">Cricketers</TabsTrigger>
          <TabsTrigger value="national-teams">National Teams</TabsTrigger>
          <TabsTrigger value="ip-teams">IP Teams</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="analyst-view">
            Analyst View
          </TabsTrigger>
        </TabsList>
        <TabsContent value="cricketers">
          <CricketersTab searchTerm={searchTerm} filters={filters} />
        </TabsContent>
        <TabsContent value="national-teams">
          <NationalTeamsTab searchTerm={searchTerm} />
        </TabsContent>
        <TabsContent value="ip-teams">
          <IpTeamsTab searchTerm={searchTerm} />
        </TabsContent>
        <TabsContent value="trending">
          <TrendingTab />
        </TabsContent>
        <TabsContent value="analyst-view">
          <AnalystViewTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
