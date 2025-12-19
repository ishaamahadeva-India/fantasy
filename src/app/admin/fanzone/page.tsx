'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  placeholderCricketers,
  placeholderIpTeams,
  placeholderNationalTeams,
} from '@/lib/cricket-data';
import { popularMovies, popularStars } from '@/lib/placeholder-data';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AdminFanZonePage() {
    const handleAction = (action: string, title: string) => {
        toast({
            title: `Action: ${action}`,
            description: `Entity "${title}" would be ${action.toLowerCase()}ed. This is a placeholder.`
        })
    }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl font-headline">
            Fan Zone Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage all entities within the Cricket and Movie Fan Zones.
          </p>
        </div>
      </div>

      <Tabs defaultValue="cricketers" className="w-full">
        <TabsList>
          <TabsTrigger value="cricketers">Cricketers</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="movies">Movies</TabsTrigger>
          <TabsTrigger value="stars">Stars</TabsTrigger>
        </TabsList>
        <TabsContent value="cricketers" className="mt-4">
          <Card>
            <CardHeader>
                <CardTitle>Cricketers</CardTitle>
                <Button variant="outline" size="sm" className="ml-auto" onClick={() => handleAction('Create', 'New Cricketer')}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Add Cricketer
                </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {placeholderCricketers.map((cricketer) => (
                    <TableRow key={cricketer.id}>
                      <TableCell>{cricketer.name}</TableCell>
                      <TableCell>{cricketer.country}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                           <Button variant="ghost" size="icon" onClick={() => handleAction('Edit', cricketer.name)}><Edit className="w-4 h-4" /></Button>
                           <Button variant="ghost" size="icon" onClick={() => handleAction('Delete', cricketer.name)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="teams" className="mt-4">
             <Card>
                <CardHeader>
                    <CardTitle>Teams (IP & National)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {[...placeholderIpTeams, ...placeholderNationalTeams].map((team) => (
                                <TableRow key={team.id}>
                                    <TableCell>{team.name}</TableCell>
                                    <TableCell>{'league' in team ? 'IP' : 'National'}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleAction('Edit', team.name)}><Edit className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleAction('Delete', team.name)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="movies" className="mt-4">
             <Card>
                <CardHeader><CardTitle>Movies</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Year</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {popularMovies.map((movie) => (
                                <TableRow key={movie.id}>
                                    <TableCell>{movie.title}</TableCell>
                                    <TableCell>{movie.releaseYear}</TableCell>
                                    <TableCell>
                                         <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleAction('Edit', movie.title)}><Edit className="w-4 h-4" /></Button>
                                        <Button variant="ghost" size="icon" onClick={() => handleAction('Delete', movie.title)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
         <TabsContent value="stars" className="mt-4">
             <Card>
                <CardHeader><CardTitle>Stars</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {popularStars.map((star) => (
                                <TableRow key={star.id}>
                                    <TableCell>{star.name}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleAction('Edit', star.name)}><Edit className="w-4 h-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleAction('Delete', star.name)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
