
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUser } from '@/firebase';
import {
  Check,
  User,
  Vault,
  ShieldCheck,
  Film,
  Brain,
  Award,
  History,
  LogIn,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const tiers = [
  {
    name: 'Premium Pass',
    price: 'Monthly',
    features: [
      'Full access to all game modes',
      'Detailed explanations & insights',
      'Audio and Video challenges',
    ],
    cta: 'Manage Subscription',
    current: false,
  },
  {
    name: 'Pro Pass',
    price: 'Annual',
    features: [
      'All Premium features',
      'Ad-free forever',
      'Priority access to new modes',
      'Exclusive monthly challenges',
    ],
    cta: 'Upgrade to Pro',
    current: true,
  },
];

const badges = [
    { name: 'Cricket Novice', icon: ShieldCheck, earned: true },
    { name: 'Movie Buff', icon: Film, earned: true },
    { name: 'Trivia Titan', icon: Brain, earned: true },
    { name: 'Quiz Master', icon: Award, earned: false },
    { name: 'Fact Checker', icon: Check, earned: false },
    { name: 'Daily Streaker', icon: History, earned: false },
];

const historyItems = [
    { type: 'Quiz', title: 'Daily News Quiz - June 12', score: '85%' },
    { type: 'Game', title: 'Soundstrike Challenge', score: '3/3 Correct' },
    { type: 'Quiz', title: 'Movie Quiz: RRR', score: '4/5 Correct' },
    { type: 'Game', title: 'Fact or Fiction: IPL Dynasties', score: '5/5 Correct' },
];

function ProfileHeader({ user, isLoading }: { user: any, isLoading: boolean}) {
    const router = useRouter();

    if (isLoading) {
        return (
             <div className="flex items-center gap-6">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className='space-y-2'>
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
        )
    }
    
    if (!user) {
        return (
             <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                    <AvatarFallback>
                        <User className="w-12 h-12" />
                    </AvatarFallback>
                </Avatar>
                <div>
                    <h1 className="text-3xl font-bold md:text-4xl font-headline">
                        Welcome, Guest
                    </h1>
                    <p className="mt-1 text-muted-foreground">Log in to view your profile and save your progress.</p>
                     <Button className="mt-4" asChild>
                        <Link href="/login">
                           <LogIn className='mr-2'/>
                           Login or Sign Up
                        </Link>
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              {user.photoURL && <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />}
              <AvatarFallback>
                <User className="w-12 h-12" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold md:text-4xl font-headline">
                {user?.displayName || 'User'}
              </h1>
              <p className="mt-1 text-muted-foreground">{user?.email || 'user@example.com'}</p>
              <div className="mt-2">
                <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary">
                  Pro Pass
                </span>
              </div>
            </div>
        </div>
    )
}

export default function ProfilePage() {
    const { user, isLoading } = useUser();

  return (
    <div className="space-y-8">
      <ProfileHeader user={user} isLoading={isLoading} />

      <Tabs defaultValue="badges">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="badges" disabled={!user || isLoading}>Insight Badges</TabsTrigger>
          <TabsTrigger value="history" disabled={!user || isLoading}>History</TabsTrigger>
          <TabsTrigger value="vault" disabled={!user || isLoading}>Knowledge Vault</TabsTrigger>
        </TabsList>
        <TabsContent value="badges" className="mt-6">
           <Card>
            <CardHeader>
              <CardTitle>Your Insight Badges</CardTitle>
              <CardDescription>
                Milestones from your journey of knowledge.
              </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {badges.map(badge => (
                        <Card key={badge.name} className={`p-4 text-center space-y-2 ${badge.earned ? 'opacity-100 border-primary/50' : 'opacity-40'}`}>
                           <badge.icon className={`w-12 h-12 mx-auto ${badge.earned ? 'text-primary' : 'text-muted-foreground'}`} />
                           <p className="font-semibold text-sm">{badge.name}</p>
                        </Card>
                    ))}
                </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="mt-6">
           <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                A log of your recently completed challenges.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className='space-y-4'>
                {historyItems.map((item, index) => (
                    <li key={index} className='flex justify-between items-center p-3 rounded-lg bg-white/5'>
                        <div>
                            <span className='text-xs text-primary'>{item.type}</span>
                            <p className='font-semibold'>{item.title}</p>
                        </div>
                        <p className='font-bold font-code text-muted-foreground'>{item.score}</p>
                    </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="vault" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Knowledge Vault</CardTitle>
              <CardDescription>
                Your saved facts and highlights from challenges.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-lg border-muted">
                <Vault className="w-12 h-12 mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Vault is Empty</h3>
                <p className="text-sm text-muted-foreground">
                  Save facts and highlights to review them here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div>
        <h2 className="mb-4 text-2xl font-bold font-headline">
          Subscription
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`flex flex-col ${
                tier.current && user
                  ? 'border-primary ring-2 ring-primary shadow-primary/20'
                  : ''
              }`}
            >
              <CardHeader>
                <CardTitle className="font-headline">{tier.name}</CardTitle>
                <CardDescription>{tier.price}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-2">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <Check className="w-4 h-4 mr-2 text-green-400 shrink-0 mt-1" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={tier.current && user ? 'outline' : 'default'}
                  disabled={!user}
                >
                  {tier.cta}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
