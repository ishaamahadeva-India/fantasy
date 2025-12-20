
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCollection, useFirestore } from "@/firebase";
import { collection, query, where, deleteDoc, doc } from "firebase/firestore";
import type { LivePrediction, FantasyRoleSelection } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { toast } from "@/hooks/use-toast";


export default function EditFantasyMatchPage({ params }: { params: { id: string } }) {
    const firestore = useFirestore();

    const rolesQuery = firestore ? query(collection(firestore, 'fantasy_roles'), where('matchId', '==', params.id)) : null;
    const { data: roles, isLoading: rolesLoading } = useCollection<FantasyRoleSelection & {id: string}>(rolesQuery);

    const predictionsQuery = firestore ? query(collection(firestore, 'fantasy_predictions'), where('matchId', '==', params.id)) : null;
    const { data: predictions, isLoading: predictionsLoading } = useCollection<LivePrediction & {id: string}>(predictionsQuery);

    const handleDeleteRole = async (roleId: string) => {
        if (!firestore) return;
        try {
            await deleteDoc(doc(firestore, 'fantasy_roles', roleId));
            toast({ title: "Role deleted successfully." });
        } catch (error) {
            toast({ variant: 'destructive', title: "Error deleting role." });
        }
    };

    const handleDeletePrediction = async (predictionId: string) => {
        if (!firestore) return;
        try {
            await deleteDoc(doc(firestore, 'fantasy_predictions', predictionId));
            toast({ title: "Prediction deleted successfully." });
        } catch (error) {
            toast({ variant: 'destructive', title: "Error deleting prediction." });
        }
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold md:text-4xl font-headline mb-8">
                Edit Fantasy Match
            </h1>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Match Content</CardTitle>
                    <CardDescription>Add and manage roles and live prediction questions for this match.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle>Innings Roles</CardTitle>
                            <Button variant="outline" asChild>
                                <Link href={`/admin/fantasy/match/${params.id}/roles/new`}>
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Add Role
                                </Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                             {rolesLoading && <Skeleton className="h-24 w-full" />}
                             {!rolesLoading && roles && roles.length > 0 ? (
                                 <Table>
                                    <TableHeader><TableRow><TableHead>Role Title</TableHead><TableHead>Innings</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                                     <TableBody>
                                         {roles.map(role => (
                                             <TableRow key={role.id}>
                                                <TableCell>{Object.keys(role.selectedRoles)[0]}</TableCell>
                                                <TableCell>{role.innings}</TableCell>
                                                <TableCell>
                                                     <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader><AlertDialogTitle>Delete Role?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteRole(role.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                             </TableRow>
                                         ))}
                                     </TableBody>
                                 </Table>
                             ) : (
                                <p className="text-muted-foreground text-center py-4">No roles defined for this match yet.</p>
                             )}
                        </CardContent>
                    </Card>

                     <Card>
                        <CardHeader className="flex-row items-center justify-between">
                            <CardTitle>Live Predictions</CardTitle>
                             <Button variant="outline" asChild>
                                <Link href={`/admin/fantasy/match/${params.id}/predictions/new`}>
                                    <PlusCircle className="w-4 h-4 mr-2" />
                                    Add Prediction
                                </Link>
                            </Button>
                        </CardHeader>
                         <CardContent>
                             {predictionsLoading && <Skeleton className="h-24 w-full" />}
                              {!predictionsLoading && predictions && predictions.length > 0 ? (
                                 <Table>
                                    <TableHeader><TableRow><TableHead>Question</TableHead><TableHead>Phase</TableHead><TableHead>Type</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                                     <TableBody>
                                         {predictions.map(pred => (
                                             <TableRow key={pred.id}>
                                                <TableCell>{pred.question}</TableCell>
                                                <TableCell>{pred.phase}</TableCell>
                                                <TableCell>{pred.type}</TableCell>
                                                <TableCell>
                                                     <AlertDialog>
                                                        <AlertDialogTrigger asChild><Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button></AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader><AlertDialogTitle>Delete Prediction?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeletePrediction(pred.id)}>Delete</AlertDialogAction></AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                             </TableRow>
                                         ))}
                                     </TableBody>
                                 </Table>
                             ) : (
                                <p className="text-muted-foreground text-center py-4">No live prediction questions added for this match yet.</p>
                             )}
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </div>
    )
}
