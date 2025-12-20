
'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";


export default function EditFantasyMatchPage({ params }: { params: { id: string } }) {
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
                             <p className="text-muted-foreground text-center py-4">No roles defined for this match yet.</p>
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
                             <p className="text-muted-foreground text-center py-4">No live prediction questions added for this match yet.</p>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
        </div>
    )
}
