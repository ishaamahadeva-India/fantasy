'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

// Mock data for ad placements
const adPlacements = [
  { id: 'ad-home-sidebar', name: 'Home Page Sidebar', page: 'Home', active: true },
  { id: 'ad-feed-inline', name: 'Intel Hub In-Feed', page: 'Home', active: true },
  { id: 'ad-fantasy-campaign', name: 'Fantasy Campaign Banner', page: 'Fantasy Campaign', active: true },
  { id: 'ad-cricket-fanzone', name: 'Cricket Fan Zone Banner', page: 'Cricket Fan Zone', active: false },
  { id: 'ad-live-match', name: 'Live Match Banner', page: 'Live Match', active: true },
];

export default function AdminAdsPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl font-headline">
            Advertisement Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Control ad placements and sponsors.
          </p>
        </div>
        <Button>
          <PlusCircle className="w-4 h-4 mr-2" />
          Add New Placement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ad Placements</CardTitle>
          <CardDescription>
            Enable or disable advertisement slots across the application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {adPlacements.map((placement) => (
            <div
              key={placement.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-semibold">{placement.name}</p>
                <p className="text-sm text-muted-foreground">{placement.page}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id={`switch-${placement.id}`}
                  defaultChecked={placement.active}
                />
                <Label htmlFor={`switch-${placement.id}`}>
                  {placement.active ? 'Active' : 'Inactive'}
                </Label>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
