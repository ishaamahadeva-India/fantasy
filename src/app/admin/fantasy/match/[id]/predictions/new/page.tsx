'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewFantasyPredictionPage({ params }: { params: { id: string } }) {
    return (
        <div>
            <h1 className="text-3xl font-bold md:text-4xl font-headline mb-8">
                Add New Live Prediction
            </h1>
            <Card>
                <CardHeader>
                    <CardTitle>Under Construction</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">The form to add a new live prediction question to a fantasy match is not yet implemented.</p>
                </CardContent>
            </Card>
        </div>
    )
}
