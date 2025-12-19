'use client';
import { useState } from 'react';
import Link from 'next/link';
import { Lock, Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  placeholderCricketers,
  placeholderIpTeams,
  placeholderNationalTeams,
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
          <div className="py-12 text-center text-muted-foreground">
            Trending content coming soon.
          </div>
        </TabsContent>
        <TabsContent value="analyst-view">
          <Card>
            <CardHeader>
                <CardTitle className="font-headline">Analyst View (Game Pass)</CardTitle>
                <CardDescription>Unlock deep-dive analytics and player comparisons.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative text-center p-8 rounded-lg bg-white/5">
                <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                  <Lock className="w-12 h-12 text-primary mb-4" />
                  <h3 className="font-headline text-xl mb-2">
                    Unlock Full Era Analysis
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Upgrade to Game Pass for detailed analytics.
                  </p>
                  <Button>Unlock Game Pass</Button>
                </div>
                <div className='opacity-30 blur-sm select-none'>
                    <h4 className='font-semibold'>Head-to-Head Player Comparison</h4>
                    <div className='flex justify-center items-center gap-4 mt-4'>
                        <div className='w-40 p-2 border rounded-md border-dashed'>
                            <Avatar className="w-12 h-12 mx-auto">
                                <AvatarFallback>P1</AvatarFallback>
                            </Avatar>
                            <p className='text-sm mt-2'>Player One</p>
                        </div>
                        <span className='font-bold'>vs</span>
                         <div className='w-40 p-2 border rounded-md border-dashed'>
                            <Avatar className="w-12 h-12 mx-auto">
                                <AvatarFallback>P2</AvatarFallback>
                            </Avatar>
                            <p className='text-sm mt-2'>Player Two</p>
                        </div>
                    </div>
                    <p className="text-muted-foreground opacity-50 mt-4">Compare player stats across formats...</p>
                    <p className="text-muted-foreground opacity-50 mt-2">Deep dive into performance vs opposition...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
