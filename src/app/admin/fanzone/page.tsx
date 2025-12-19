
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
import { popularMovies, popularStars } from '@/lib/placeholder-data';
import { toast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useFirestore, useCollection } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { deleteCricketer } from '@/firebase/firestore/cricketers';
import { deleteTeam } from '@/firebase/firestore/teams';

type CricketerProfile = {
    id: string;
    name: string;
    country: string;
    roles: string[];
}

type TeamProfile = {
    id: string;
    name: string;
    type: 'ip' | 'national';
}

export default function AdminFanZonePage() {
    const firestore = useFirestore();
    const cricketersQuery = firestore ? collection(firestore, 'cricketers') : null;
    const { data: cricketers, isLoading: cricketersLoading } = useCollection<CricketerProfile>(cricketersQuery);

    const teamsQuery = firestore ? collection(firestore, 'teams') : null;
    const { data: teams, isLoading: teamsLoading } = useCollection<TeamProfile>(teamsQuery);


    const handleAction = (action: string, title: string) => {
        toast({
            title: `Action: ${action}`,
            description: `Entity "${title}" would be ${action.toLowerCase()}ed. This is a placeholder.`
        })
    }
    
     const handleDeleteCricketer = async (cricketerId: string) => {
        if (!firestore) return;
        try {
        await deleteCricketer(firestore, cricketerId);
        toast({
            title: 'Cricketer Deleted',
            description: 'The cricketer profile has been successfully deleted.',
        });
        } catch (error) {
        console.error('Error deleting cricketer: ', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not delete the cricketer. Please try again.',
        });
        }
    };
    
    const handleDeleteTeam = async (teamId: string) => {
        if (!firestore) return;
        try {
            await deleteTeam(firestore, teamId);
            toast({
                title: 'Team Deleted',
                description: 'The team profile has been successfully deleted.',
            });
        } catch (error) {
            console.error('Error deleting team: ', error);
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Could not delete the team. Please try again.',
            });
        }
    };


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
                <div className='flex justify-between items-center'>
                    <CardTitle>Cricketers</CardTitle>
                    <Button variant="outline" size="sm" asChild>
                       <Link href="/admin/fanzone/cricketers/new">
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Add Cricketer
                       </Link>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Roles</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cricketersLoading && (
                    <>
                        <TableRow>
                            <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                            <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                             <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                            <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                        </TableRow>
                    </>
                  )}
                  {cricketers && cricketers.map((cricketer) => (
                    <TableRow key={cricketer.id}>
                      <TableCell>{cricketer.name}</TableCell>
                      <TableCell>{cricketer.country}</TableCell>
                      <TableCell>{cricketer.roles?.join(', ')}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                           <Button variant="ghost" size="icon" asChild>
                             <Link href={`/admin/fanzone/cricketers/edit/${cricketer.id}`}>
                               <Edit className="w-4 h-4" />
                             </Link>
                           </Button>
                           <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="icon">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete the profile for "{cricketer.name}".
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteCricketer(cricketer.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {!cricketersLoading && cricketers?.length === 0 && (
                    <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                            No cricketers found. Add one to get started.
                        </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="teams" className="mt-4">
             <Card>
                <CardHeader>
                    <div className='flex justify-between items-center'>
                        <CardTitle>Teams (IP & National)</CardTitle>
                        <Button variant="outline" size="sm" asChild>
                            <Link href="/admin/fanzone/teams/new">
                                <PlusCircle className="w-4 h-4 mr-2" />
                                Add Team
                            </Link>
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Type</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                        <TableBody>
                             {teamsLoading && (
                                <>
                                    <TableRow>
                                        <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                                        <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                                    </TableRow>
                                </>
                            )}
                            {teams && teams.map((team) => (
                                <TableRow key={team.id}>
                                    <TableCell>{team.name}</TableCell>
                                    <TableCell className="capitalize">{team.type}</TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link href={`/admin/fanzone/teams/edit/${team.id}`}>
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="icon">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete the profile for "{team.name}".
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => handleDeleteTeam(team.id)}>
                                                        Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {!teamsLoading && teams?.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center">
                                        No teams found. Add one to get started.
                                    </TableCell>
                                </TableRow>
                            )}
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
