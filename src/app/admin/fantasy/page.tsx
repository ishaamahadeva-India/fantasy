'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Mock data
const campaigns = [
  { id: 'campaign-devara', title: 'Devara: Part 1 - The Full Campaign', status: 'Ongoing', events: 8 },
  { id: 'campaign-pushpa2', title: 'Pushpa 2: The Rule - The Full Campaign', status: 'Upcoming', events: 10 },
];

const matches = [
    { id: 'match-1', title: 'IND vs AUS - T20 World Cup Final', status: 'Live' },
    { id: 'match-2', title: 'CSK vs MI - IPL 2025 Opener', status: 'Upcoming' },
]

export default function AdminFantasyPage() {
  const handleAction = (action: string, title: string) => {
    toast({
      title: `Action: ${action}`,
      description: `"${title}" would be ${action.toLowerCase()}ed. This is a placeholder.`,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
          Fantasy Game Management
        </h1>
        <p className="mt-2 text-muted-foreground">
          Manage Movie Fantasy Leagues and Live Cricket Matches.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Movie Fantasy Campaigns</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleAction('Create', 'New Movie Campaign')}>
              <PlusCircle className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
          <CardDescription>
            Create and manage long-running movie prediction campaigns.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                    <p className="font-semibold">{campaign.title}</p>
                    <p className="text-sm text-muted-foreground">{campaign.events} events</p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant={campaign.status === 'Ongoing' ? 'default' : 'secondary'}>{campaign.status}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleAction('Edit', campaign.title)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleAction('Delete', campaign.title)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
            </div>
          ))}
        </CardContent>
      </Card>
      
       <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Live Cricket Matches</CardTitle>
            <Button variant="outline" size="sm" onClick={() => handleAction('Create', 'New Cricket Match')}>
              <PlusCircle className="w-4 h-4 mr-2" />
              New Match
            </Button>
          </div>
          <CardDescription>
            Manage live, role-based fantasy cricket matches.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {matches.map((match) => (
            <div key={match.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                    <p className="font-semibold">{match.title}</p>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant={match.status === 'Live' ? 'destructive' : 'secondary'}>{match.status}</Badge>
                    <Button variant="ghost" size="icon" onClick={() => handleAction('Edit', match.title)}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleAction('Delete', match.title)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
