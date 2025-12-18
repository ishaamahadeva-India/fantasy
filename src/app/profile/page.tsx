import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { Check, User, Vault } from 'lucide-react';

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

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <Avatar className="w-24 h-24">
          <AvatarFallback>
            <User className="w-12 h-12" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-3xl font-bold md:text-4xl font-headline">
            User Name
          </h1>
          <p className="mt-1 text-muted-foreground">user@example.com</p>
          <div className="mt-2">
            <span className="px-3 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary">
              Pro Pass
            </span>
          </div>
        </div>
      </div>

      <Tabs defaultValue="vault">
        <TabsList>
          <TabsTrigger value="vault">Knowledge Vault</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="badges">Insight Badges</TabsTrigger>
        </TabsList>
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
        <TabsContent value="history">
          <p>History content goes here.</p>
        </TabsContent>
        <TabsContent value="badges">
          <p>Insight Badges go here.</p>
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
                tier.current
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
                  variant={tier.current ? 'outline' : 'default'}
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
