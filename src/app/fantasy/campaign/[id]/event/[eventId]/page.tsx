'use client';

import { useParams, notFound, useRouter } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { useDoc, useFirestore, useUser, useCollection } from '@/firebase';
import { doc, collection, query, where, Timestamp } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { ArrowLeft, Trophy, Calendar, Lock, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { serverTimestamp } from 'firebase/firestore';
import { addDoc } from 'firebase/firestore';
import type { FantasyCampaign, FantasyEvent, Movie } from '@/lib/types';

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
  const router = useRouter();
  const campaignId = params.id as string;
  const eventId = params.eventId as string;
  const firestore = useFirestore();
  const { user } = useUser();

  // Fetch campaign
  const campaignDocRef = firestore ? doc(firestore, 'fantasy-campaigns', campaignId) : null;
  const { data: campaignData, isLoading: campaignLoading } = useDoc(campaignDocRef);
  const campaign = campaignData as (FantasyCampaign & { id: string }) | undefined;

  // Fetch event
  const eventDocRef = firestore 
    ? doc(firestore, 'fantasy-campaigns', campaignId, 'events', eventId)
    : null;
  const { data: eventData, isLoading: eventLoading } = useDoc(eventDocRef);
  const event = eventData as (FantasyEvent & { id: string }) | undefined;

  // Fetch all movies to resolve movie titles from IDs
  const moviesQuery = firestore ? collection(firestore, 'movies') : null;
  const { data: moviesData } = useCollection(moviesQuery);
  const allMovies = moviesData as (Movie & { id: string })[] | undefined;

  // Helper function to resolve movie titles from options
  const resolveMovieTitles = (options: string[] | undefined): string[] => {
    if (!options || !allMovies || !campaign) return options || [];
    
    // Check if options look like movie IDs (long alphanumeric strings)
    const isMovieId = (str: string) => /^[a-zA-Z0-9]{20,}$/.test(str);
    
    return options.map(option => {
      // If it looks like a movie ID, try to resolve it
      if (isMovieId(option)) {
        // First check campaign movies
        if (campaign.movies) {
          const campaignMovie = campaign.movies.find(m => m.movieId === option);
          if (campaignMovie?.movieTitle) {
            return campaignMovie.movieTitle;
          }
        }
        // Then check all movies collection
        const movie = allMovies.find(m => m.id === option);
        if (movie?.title) {
          return movie.title;
        }
      }
      // Return as-is if not a movie ID or not found
      return option;
    });
  };

  // Fetch existing predictions
  const predictionsQuery = useMemo(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'fantasy-campaigns', campaignId, 'events', eventId, 'predictions'),
      where('userId', '==', user.uid)
    );
  }, [firestore, campaignId, eventId, user]);
  const { data: existingPredictions } = useCollection(predictionsQuery);

  const eventWithId = event ? { ...event, id: eventId } : undefined;

  const [selectedOption, setSelectedOption] = useState<string>('');
  const [rankingOrder, setRankingOrder] = useState<string[]>([]); // For ranking_selection events
  const [numericValue, setNumericValue] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load existing prediction if available
  useEffect(() => {
    if (existingPredictions && existingPredictions.length > 0) {
      const prediction = existingPredictions[0] as any;
      if (prediction.selectedOption) setSelectedOption(prediction.selectedOption);
      if (prediction.rankingOrder && Array.isArray(prediction.rankingOrder)) {
        setRankingOrder(prediction.rankingOrder);
      }
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
  const isRankingEvent = eventWithId?.eventType === 'ranking_selection';
  const canSubmit = !isLocked && user && (
    selectedOption || 
    numericValue || 
    (isRankingEvent && rankingOrder.length > 0)
  );

  const handleSubmit = async () => {
    if (!firestore || !user || !canSubmit || !eventWithId) return;
    
    setIsSubmitting(true);
    try {
      const predictionsCollection = collection(
        firestore,
        'fantasy-campaigns',
        campaignId,
        'events',
        eventId,
        'predictions'
      );

      const predictionData: any = {
        eventId: eventWithId.id,
        campaignId: campaignId,
        userId: user.uid,
        timestamp: serverTimestamp(),
      };

      if (selectedOption) {
        predictionData.selectedOption = selectedOption;
      }
      if (isRankingEvent && rankingOrder.length > 0) {
        predictionData.rankingOrder = rankingOrder;
      }
      if (numericValue) {
        predictionData.numericValue = parseFloat(numericValue);
      }
      if (notes) {
        predictionData.notes = notes;
      }

      await addDoc(predictionsCollection, predictionData);
      
      toast({
        title: 'Prediction Submitted',
        description: 'Your prediction has been recorded successfully!',
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

  if (!campaign || !event || !eventWithId) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => router.push(`/fantasy/campaign/${campaignId}`)}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Campaign
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-headline">{eventWithId.title}</CardTitle>
            <Badge variant="secondary" className="text-lg px-3 py-1">
              {eventWithId.points} Points
            </Badge>
          </div>
          <CardDescription>{eventWithId.description}</CardDescription>
          {/* Sponsor/Brand Display */}
          {campaign?.sponsorName && (
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              {campaign.sponsorLogo && (
                <img 
                  src={campaign.sponsorLogo} 
                  alt={campaign.sponsorName}
                  className="w-5 h-5 object-contain"
                />
              )}
              <span className="font-medium text-primary">Sponsored by {campaign.sponsorName}</span>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Event Status Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {eventStatus === 'live' && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Live
              </Badge>
            )}
            {eventStatus === 'upcoming' && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Upcoming
              </Badge>
            )}
            {eventStatus === 'locked' && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Locked
              </Badge>
            )}
            {eventStatus === 'completed' && (
              <Badge variant="default" className="flex items-center gap-1 bg-green-600">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </Badge>
            )}
          </div>

          {/* Event Dates */}
          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Start:</strong>{' '}
              {toDate(eventWithId.startDate)?.toLocaleString() || 'Not set'}
            </p>
            {eventWithId.endDate && (
              <p>
                <strong>End:</strong>{' '}
                {toDate(eventWithId.endDate)?.toLocaleString() || 'Not set'}
              </p>
            )}
          </div>

          {/* Event Rules */}
          {eventWithId.rules && eventWithId.rules.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Rules:</h4>
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
                  <p className="text-sm text-green-400">
                    <CheckCircle2 className="inline-block w-4 h-4 mr-1" />
                    You have already submitted a prediction for this event. You can update it below.
                  </p>
                </div>
              )}

              {eventWithId.eventType === 'choice_selection' && eventWithId.options && (
                <div>
                  <Label className="text-base mb-3 block">Select your prediction:</Label>
                  <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
                    <div className="space-y-2">
                      {resolveMovieTitles(eventWithId.options).map((option, idx) => {
                        const originalOption = eventWithId.options![idx];
                        const isSelected = selectedOption === originalOption;
                        const wasPreviouslySelected = hasExistingPrediction && 
                          (existingPredictions?.[0] as any)?.selectedOption === originalOption;
                        return (
                          <div 
                            key={idx} 
                            className={`flex items-center space-x-2 p-3 rounded-lg border hover:bg-accent transition-colors ${
                              isSelected || wasPreviouslySelected 
                                ? 'bg-green-500/10 border-green-500 border-2' 
                                : ''
                            }`}
                          >
                            <RadioGroupItem value={originalOption} id={`option-${idx}`} />
                            <Label htmlFor={`option-${idx}`} className="flex-1 cursor-pointer flex items-center gap-2">
                              <span className={isSelected || wasPreviouslySelected ? 'font-semibold text-green-700 dark:text-green-400' : ''}>
                                {option}
                              </span>
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

              {eventWithId.eventType === 'ranking_selection' && eventWithId.options && (
                <div>
                  <Label className="text-base mb-3 block">Rank the movies (click to add to ranking):</Label>
                  <div className="space-y-2">
                    {resolveMovieTitles(eventWithId.options).map((option, idx) => {
                      const originalOption = eventWithId.options![idx];
                      const currentRank = rankingOrder.indexOf(originalOption) + 1;
                      const isRanked = rankingOrder.includes(originalOption);
                      return (
                        <div
                          key={idx}
                          className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isRanked 
                              ? 'bg-green-500/10 border-green-500 border-2' 
                              : 'hover:bg-accent'
                          }`}
                          onClick={() => {
                            if (!isRanked) {
                              setRankingOrder([...rankingOrder, originalOption]);
                            } else {
                              setRankingOrder(rankingOrder.filter(o => o !== originalOption));
                            }
                          }}
                        >
                          <div className="flex items-center gap-3 flex-1">
                            {isRanked && (
                              <Badge variant="default" className="bg-green-600">
                                #{currentRank}
                              </Badge>
                            )}
                            <span className={`flex-1 ${isRanked ? 'font-semibold text-green-700 dark:text-green-400' : ''}`}>
                              {option}
                            </span>
                            {isRanked && (
                              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {rankingOrder.length > 0 && (
                    <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Your Ranking:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        {rankingOrder.map((movieId, idx) => {
                          const movieTitle = resolveMovieTitles([movieId])[0];
                          return <li key={idx} className="text-sm">{movieTitle}</li>;
                        })}
                      </ol>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    Click on movies to add them to your ranking. Click again to remove.
                  </p>
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
                    className={`max-w-xs ${
                      hasExistingPrediction ? 'border-green-500 text-green-400' : ''
                    }`}
                  />
                  {hasExistingPrediction && (
                    <p className="text-sm text-green-400 mt-1">
                      Your current prediction: {(existingPredictions?.[0] as any)?.numericValue}
                    </p>
                  )}
                </div>
              )}

              {/* Notes Field */}
              <div>
                <Label htmlFor="notes" className="text-base mb-2 block">
                  Additional Notes (Optional):
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes or reasoning..."
                  rows={3}
                />
              </div>

              {/* Submit Button */}
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
                  {hasExistingPrediction && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold mb-1">Your Prediction:</p>
                      {(existingPredictions?.[0] as any)?.rankingOrder ? (
                        <ol className="list-decimal list-inside text-sm text-green-400">
                          {(existingPredictions?.[0] as any).rankingOrder.map((movie: string, idx: number) => (
                            <li key={idx}>{movie}</li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-sm text-green-400">
                          {(existingPredictions?.[0] as any)?.selectedOption || 
                           (existingPredictions?.[0] as any)?.numericValue}
                        </p>
                      )}
                    </div>
                  )}
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
                          <p className="font-semibold text-green-400">
                            {(existingPredictions?.[0] as any)?.selectedOption || 
                             (existingPredictions?.[0] as any)?.numericValue}
                            {(existingPredictions?.[0] as any)?.selectedOption === eventWithId.result.outcome && (
                              <CheckCircle2 className="inline-block w-4 h-4 ml-2 text-green-400" />
                            )}
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
