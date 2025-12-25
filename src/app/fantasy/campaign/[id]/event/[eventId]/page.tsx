'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { useDoc, useFirestore, useUser, useCollection } from '@/firebase';
import { doc, collection, query, where, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Trophy, Calendar, Lock, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import type { FantasyCampaign, FantasyEvent } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

// Helper to convert various date types to Date objects
const toDate = (value: any): Date | null => {
  if (value instanceof Date) return value;
  if (value instanceof Timestamp) return value.toDate();
  if (typeof value === 'object' && value !== null && typeof value.toDate === 'function') return value.toDate();
  if (typeof value === 'number') return new Date(value);
  if (typeof value === 'string') return new Date(value);
  return null;
};

export default function CampaignEventPage() {
  const params = useParams();
  const campaignId = params.id as string;
  const eventId = params.eventId as string;
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useUser();
  
  const campaignRef = firestore ? doc(firestore, 'fantasy-campaigns', campaignId) : null;
  const { data: campaign, isLoading: campaignLoading } = useDoc(campaignRef);
  
  const eventRef = firestore 
    ? doc(firestore, 'fantasy-campaigns', campaignId, 'events', eventId) 
    : null;
  const { data: event, isLoading: eventLoading } = useDoc(eventRef);

  // Check if user has already made a prediction
  const predictionsRef = firestore
    ? collection(firestore, 'campaign-predictions')
    : null;
  const predictionsQuery = firestore && user
    ? query(
        predictionsRef!,
        where('userId', '==', user.uid),
        where('campaignId', '==', campaignId),
        where('eventId', '==', eventId)
      )
    : null;
  const { data: existingPredictions } = useCollection(predictionsQuery);

  const [selectedOption, setSelectedOption] = useState<string>('');
  const [numericValue, setNumericValue] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing prediction if available
  useEffect(() => {
    if (existingPredictions && existingPredictions.length > 0) {
      const prediction = existingPredictions[0] as any;
      if (prediction.selectedOption) setSelectedOption(prediction.selectedOption);
      if (prediction.numericValue) setNumericValue(prediction.numericValue.toString());
      if (prediction.notes) setNotes(prediction.notes);
    }
  }, [existingPredictions]);

  // Determine event status
  const eventStatus = useMemo(() => {
    if (!event) return null;
    const now = new Date();
    const startDate = toDate(event.startDate);
    const endDate = toDate(event.endDate);
    const lockTime = event.lockTime ? toDate(event.lockTime) : null;
    
    if (event.status === 'completed') return 'completed';
    if (event.status === 'locked') return 'locked';
    if (lockTime && now >= lockTime) return 'locked';
    if (endDate && now > endDate) return 'completed';
    if (startDate && now >= startDate && (!endDate || now <= endDate)) return 'live';
    if (startDate && now < startDate) return 'upcoming';
    return event.status || 'upcoming';
  }, [event]);

  const hasExistingPrediction = existingPredictions && existingPredictions.length > 0;
  const isLocked = eventStatus === 'locked' || eventStatus === 'completed';
  const canSubmit = !isLocked && user && (selectedOption || numericValue);

  const handleSubmit = async () => {
    if (!firestore || !user || !canSubmit) return;
    
    setIsSubmitting(true);
    try {
      // TODO: Implement addCampaignPrediction function
      // For now, just show a toast
      toast({
        title: 'Prediction Submitted',
        description: 'Your prediction has been recorded. (Note: Prediction saving functionality needs to be implemented)',
      });
      router.push(`/fantasy/campaign/${campaignId}`);
    } catch (error: any) {
      console.error('Error submitting prediction:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Could not submit prediction. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (campaignLoading || eventLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Skeleton className="h-10 w-64 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!campaign || !event) {
    notFound();
  }

  const eventWithId = event as FantasyEvent & { id: string };
  const campaignWithId = campaign as FantasyCampaign & { id: string };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Button variant="ghost" asChild>
        <Link href={`/fantasy/campaign/${campaignId}`}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaign
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl font-headline mb-2">{eventWithId.title}</CardTitle>
              <CardDescription className="text-base">{eventWithId.description}</CardDescription>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                <Trophy className="w-4 h-4 mr-1" />
                {eventWithId.points} Points
              </Badge>
              {eventStatus === 'live' && (
                <Badge variant="default" className="bg-red-500">
                  <Clock className="w-3 h-3 mr-1" />
                  Live
                </Badge>
              )}
              {eventStatus === 'upcoming' && (
                <Badge variant="outline">
                  <Lock className="w-3 h-3 mr-1" />
                  Upcoming
                </Badge>
              )}
              {eventStatus === 'completed' && (
                <Badge variant="secondary" className="bg-green-500">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Completed
                </Badge>
              )}
              {eventStatus === 'locked' && (
                <Badge variant="destructive">
                  <Lock className="w-3 h-3 mr-1" />
                  Locked
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                Starts: {toDate(eventWithId.startDate)?.toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                Ends: {toDate(eventWithId.endDate)?.toLocaleDateString()}
              </span>
            </div>
          </div>

          {eventWithId.rules && eventWithId.rules.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Rules
              </h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {eventWithId.rules.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Prediction Form */}
          {!isLocked && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-xl font-semibold">Make Your Prediction</h3>
              
              {hasExistingPrediction && (
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <p className="font-semibold">You have already submitted a prediction for this event.</p>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                    Your selected option is highlighted in green below. You can update it if needed.
                  </p>
                </div>
              )}

              {eventWithId.eventType === 'choice_selection' && eventWithId.options && (
                <div>
                  <Label className="text-base mb-3 block">Select your prediction:</Label>
                  <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                    <div className="space-y-2">
                      {eventWithId.options.map((option, idx) => {
                        const isSelected = selectedOption === option;
                        const wasPreviouslySelected = hasExistingPrediction && 
                          (existingPredictions?.[0] as any)?.selectedOption === option;
                        return (
                          <div 
                            key={idx} 
                            className={`flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent transition-colors ${
                              isSelected || wasPreviouslySelected 
                                ? 'bg-green-500/10 border-green-500 border-2' 
                                : ''
                            }`}
                          >
                            <RadioGroupItem value={option} id={`option-${idx}`} />
                            <Label htmlFor={`option-${idx}`} className={`flex-1 cursor-pointer flex items-center gap-2 ${
                              isSelected || wasPreviouslySelected ? 'text-green-700 dark:text-green-400 font-semibold' : ''
                            }`}>
                              {option}
                              {(isSelected || wasPreviouslySelected) && (
                                <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                              )}
                            </Label>
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>
                </div>
              )}

              {eventWithId.eventType === 'numeric_prediction' && (
                <div>
                  <Label htmlFor="numeric-value" className="text-base mb-2 block">
                    Enter your prediction:
                  </Label>
                  <Input
                    id="numeric-value"
                    type="number"
                    value={numericValue}
                    onChange={(e) => setNumericValue(e.target.value)}
                    placeholder="Enter a number"
                    className="max-w-xs"
                  />
                </div>
              )}

              {eventWithId.eventType === 'draft_selection' && (
                <div>
                  <Label className="text-base mb-2 block">
                    Draft Selection (Coming Soon)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Draft selection functionality will be available soon.
                  </p>
                </div>
              )}

              <div>
                <Label htmlFor="notes" className="text-base mb-2 block">
                  Additional Notes (Optional)
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional context or reasoning for your prediction..."
                  rows={4}
                />
              </div>

              <Button 
                onClick={handleSubmit} 
                disabled={!canSubmit || isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? 'Submitting...' : hasExistingPrediction ? 'Update Prediction' : 'Submit Prediction'}
              </Button>
            </div>
          )}

          {/* Locked/Completed State */}
          {isLocked && (
            <div className="pt-4 border-t">
              {eventStatus === 'locked' && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-center">
                  <Lock className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
                  <p className="font-semibold mb-1">Predictions are now locked</p>
                  <p className="text-sm text-muted-foreground">
                    The prediction window for this event has closed.
                  </p>
                </div>
              )}
              {eventStatus === 'completed' && eventWithId.result && (
                <div className="space-y-4">
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 text-center">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <p className="font-semibold mb-1">Event Completed</p>
                    <p className="text-sm text-muted-foreground">
                      The result has been announced.
                    </p>
                  </div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Result</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-lg font-semibold">
                        {eventWithId.result.outcome}
                      </p>
                      {hasExistingPrediction && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-sm text-muted-foreground">Your Prediction:</p>
                          <p className="font-semibold">
                            {(existingPredictions?.[0] as any)?.selectedOption || 
                             (existingPredictions?.[0] as any)?.numericValue}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

