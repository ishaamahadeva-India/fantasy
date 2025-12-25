'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, Trash2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { EVENT_TEMPLATES } from '@/firebase/firestore/fantasy-campaigns';
import { useCollection, useFirestore } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Movie } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  eventType: z.enum([
    'choice_selection', 'numeric_prediction', 'draft_selection',
    'opening_day_collection', 'weekend_collection', 'lifetime_gross',
    'imdb_rating', 'occupancy_percentage', 'day1_talk',
    'awards_rank', 'ott_debut_rank'
  ]),
  movieId: z.string().optional(),
  status: z.enum(['upcoming', 'live', 'completed', 'locked']),
  startDate: z.date(),
  endDate: z.date(),
  lockTime: z.date().optional(),
  points: z.number().min(1, 'Points must be at least 1'),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  options: z.array(z.string()).optional(),
  rules: z.array(z.string()).optional(),
});

const movieSchema = z.object({
  movieId: z.string().min(1, 'Movie is required'),
  movieTitle: z.string().optional(),
  language: z.string().min(1, 'Language is required'),
  industry: z.enum(['Hollywood', 'Bollywood', 'Tollywood', 'Tamil', 'Kannada', 'Malayalam', 'Punjabi', 'Bhojpuri', 'Other', 'OTT']),
  releaseDate: z.date(),
  releaseType: z.enum(['theatrical', 'ott']),
  posterUrl: z.string().optional(),
  status: z.enum(['upcoming', 'released', 'completed']),
  order: z.number().default(0),
});

const campaignSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  campaignType: z.enum(['single_movie', 'multiple_movies']),
  // Single movie (backward compatibility)
  movieId: z.string().optional(),
  movieTitle: z.string().optional(),
  movieLanguage: z.string().optional(),
  // Multiple movies
  movies: z.array(movieSchema).optional(),
  // Campaign settings
  description: z.string().optional(),
  prizePool: z.string().optional(),
  sponsorName: z.string().optional(),
  sponsorLogo: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  status: z.enum(['upcoming', 'active', 'completed']),
  visibility: z.enum(['public', 'private', 'invite_only']).default('public'),
  maxParticipants: z.number().optional(),
  // Entry fee
  entryFee: z.object({
    type: z.enum(['free', 'paid']),
    amount: z.number().optional(),
    tiers: z.array(z.object({ amount: z.number(), label: z.string() })).optional(),
  }).default({ type: 'free' }),
  // Events
  events: z.array(eventSchema).optional(),
}).refine((data) => {
  // Require movieId for single_movie campaigns
  if (data.campaignType === 'single_movie') {
    return !!data.movieId && typeof data.movieId === 'string' && data.movieId.trim().length > 0;
  }
  return true;
}, {
  message: 'Please select a movie for single movie campaign.',
  path: ['movieId'],
}).refine((data) => {
  // Require movies array for multiple_movies campaigns
  if (data.campaignType === 'multiple_movies') {
    return data.movies && Array.isArray(data.movies) && data.movies.length > 0;
  }
  return true;
}, {
  message: 'Please add at least one movie for multiple movies campaign.',
  path: ['movies'],
});

type CampaignFormValues = z.infer<typeof campaignSchema>;

type FantasyCampaignFormProps = {
  onSubmit: (data: CampaignFormValues) => void;
  defaultValues?: Partial<CampaignFormValues>;
};

export function FantasyCampaignForm({ onSubmit, defaultValues }: FantasyCampaignFormProps) {
  const firestore = useFirestore();
  const moviesQuery = firestore ? collection(firestore, 'movies') : null;
  const { data: moviesData, isLoading: moviesLoading } = useCollection(moviesQuery);
  const movies = moviesData as (Movie & { id: string })[] | undefined;

  const form = useForm<CampaignFormValues>({
    resolver: zodResolver(campaignSchema),
    defaultValues: {
      status: 'upcoming',
      campaignType: 'single_movie',
      entryFee: {
        type: 'free',
      },
      events: [],
      ...defaultValues,
    },
  });

  const { fields: eventFields, append: appendEvent, remove: removeEvent } = useFieldArray({
    control: form.control,
    name: 'events',
  });

  const { fields: movieFields, append: appendMovie, remove: removeMovie } = useFieldArray({
    control: form.control,
    name: 'movies',
  });

  const campaignType = form.watch('campaignType') || 'single_movie';
  const entryFeeType = form.watch('entryFee.type') || 'free';

  const addEventFromTemplate = (template: typeof EVENT_TEMPLATES[0]) => {
    appendEvent({
      title: template.title,
      description: template.description,
      eventType: template.eventType,
      status: 'upcoming',
      startDate: new Date(),
      endDate: new Date(),
      points: template.defaultPoints,
      difficultyLevel: template.difficultyLevel,
      options: template.defaultOptions || [],
      rules: template.defaultRules || [],
    });
  };

  const addMovie = () => {
    appendMovie({
      movieId: '',
      language: '',
      industry: 'Bollywood',
      releaseDate: new Date(),
      releaseType: 'theatrical',
      status: 'upcoming',
      order: movieFields.length,
    });
  };

  const selectedMovieId = form.watch('movieId');
  const selectedMovie = movies?.find((m) => m.id === selectedMovieId);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Campaign Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Campaign Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Weekend Movie Fantasy – Pan India" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!defaultValues?.campaignType ? (
              <FormField
                control={form.control}
                name="campaignType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Campaign Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'single_movie'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select campaign type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="single_movie">Single Movie</SelectItem>
                        <SelectItem value="multiple_movies">Multiple Movies</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  Campaign Type: <span className="text-primary capitalize">{defaultValues.campaignType.replace('_', ' ')}</span>
                </p>
              </div>
            )}

            {campaignType === 'single_movie' ? (
              <>
                <FormField
                  control={form.control}
                  name="movieId"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between mb-2">
                        <FormLabel>Movie <span className="text-destructive">*</span></FormLabel>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href="/admin/fanzone/movies/new" target="_blank" rel="noopener noreferrer">
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Movie
                          </Link>
                        </Button>
                      </div>
                      <Select 
                        onValueChange={(value) => {
                          field.onChange(value);
                        }} 
                        value={field.value || undefined}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a movie" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {moviesLoading && (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              Loading movies...
                            </div>
                          )}
                          {!moviesLoading && (!movies || movies.length === 0) && (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              No movies available. Click "Create New Movie" to add one.
                            </div>
                          )}
                          {movies?.map((movie) => (
                            <SelectItem key={movie.id} value={movie.id}>
                              {movie.title} {movie.releaseYear ? `(${movie.releaseYear})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {selectedMovie ? `Selected: ${selectedMovie.title}` : 'Choose a movie from the list or create a new one'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="movieLanguage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Movie Language</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Tollywood">Tollywood (Telugu)</SelectItem>
                          <SelectItem value="Bollywood">Bollywood (Hindi)</SelectItem>
                          <SelectItem value="Tamil">Tamil</SelectItem>
                          <SelectItem value="Kannada">Kannada</SelectItem>
                          <SelectItem value="Malayalam">Malayalam</SelectItem>
                          <SelectItem value="Punjabi">Punjabi</SelectItem>
                          <SelectItem value="Bhojpuri">Bhojpuri</SelectItem>
                          <SelectItem value="Hollywood">Hollywood</SelectItem>
                          <SelectItem value="OTT">OTT</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <FormLabel>Movies in Campaign</FormLabel>
                  <Button type="button" variant="outline" size="sm" onClick={addMovie}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Movie
                  </Button>
                </div>
                {movieFields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="font-semibold">Movie {index + 1}</h4>
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeMovie(index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`movies.${index}.movieId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Movie</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select movie" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {moviesLoading && (
                                  <SelectItem value="loading" disabled>
                                    Loading movies...
                                  </SelectItem>
                                )}
                                {!moviesLoading && (!movies || movies.length === 0) && (
                                  <SelectItem value="no-movies" disabled>
                                    No movies available
                                  </SelectItem>
                                )}
                                {movies?.map((movie) => (
                                  <SelectItem key={movie.id} value={movie.id}>
                                    {movie.title} {movie.releaseYear ? `(${movie.releaseYear})` : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`movies.${index}.industry`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Industry</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Bollywood">Bollywood</SelectItem>
                                <SelectItem value="Tollywood">Tollywood</SelectItem>
                                <SelectItem value="Tamil">Tamil</SelectItem>
                                <SelectItem value="Kannada">Kannada</SelectItem>
                                <SelectItem value="Malayalam">Malayalam</SelectItem>
                                <SelectItem value="Punjabi">Punjabi</SelectItem>
                                <SelectItem value="Bhojpuri">Bhojpuri</SelectItem>
                                <SelectItem value="Hollywood">Hollywood</SelectItem>
                                <SelectItem value="OTT">OTT</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`movies.${index}.releaseType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Release Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="theatrical">Theatrical</SelectItem>
                                <SelectItem value="ott">OTT</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`movies.${index}.releaseDate`}
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Release Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button variant="outline" className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                    {field.value ? format(field.value, 'PPP') : <span>Pick date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </Card>
                ))}
                {movieFields.length === 0 && (
                  <div className="text-center py-4 text-muted-foreground">
                    No movies added. Click "Add Movie" to add movies to this campaign.
                  </div>
                )}
              </div>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Campaign description"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date (Optional)</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="upcoming">Upcoming</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visibility"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Visibility</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || 'public'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="invite_only">Invite Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxParticipants"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Participants (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g., 1000"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="prizePool"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prize Pool (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Vouchers & 1,00,000 quizzbuzz Points" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sponsorName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sponsor Name (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Kingfisher" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sponsorLogo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sponsor Logo URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com/logo.png" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Entry Fee & Rewards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="entryFee.type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Entry Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || 'free'}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select entry type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="free">Free Entry</SelectItem>
                      <SelectItem value="paid">Paid Entry</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {entryFeeType === 'paid' && (
              <>
                <FormField
                  control={form.control}
                  name="entryFee.amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entry Fee Amount (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 99"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>Single entry fee amount</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">Or use multiple tiers (₹49, ₹99, ₹199):</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const currentTiers = form.getValues('entryFee.tiers') || [];
                      form.setValue('entryFee.tiers', [
                        ...currentTiers,
                        { amount: 49, label: '₹49' },
                      ]);
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Tier
                  </Button>
                  {form.watch('entryFee.tiers')?.map((tier, index) => (
                    <div key={index} className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        placeholder="Amount"
                        value={tier.amount}
                        onChange={(e) => {
                          const tiers = form.getValues('entryFee.tiers') || [];
                          tiers[index].amount = Number(e.target.value);
                          form.setValue('entryFee.tiers', tiers);
                        }}
                      />
                      <Input
                        placeholder="Label"
                        value={tier.label}
                        onChange={(e) => {
                          const tiers = form.getValues('entryFee.tiers') || [];
                          tiers[index].label = e.target.value;
                          form.setValue('entryFee.tiers', tiers);
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const tiers = form.getValues('entryFee.tiers') || [];
                          form.setValue('entryFee.tiers', tiers.filter((_, i) => i !== index));
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Campaign Events</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Event from Template</DialogTitle>
                    <DialogDescription>
                      Select a predefined event template to add to this campaign.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    {EVENT_TEMPLATES.map((template, index) => (
                      <Button
                        key={index}
                        type="button"
                        variant="outline"
                        className="h-auto p-4 justify-start text-left"
                        onClick={() => {
                          addEventFromTemplate(template);
                        }}
                      >
                        <div className="flex-1">
                          <div className="font-semibold">{template.title}</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">{template.eventType}</Badge>
                            <Badge variant="outline">{template.defaultPoints} points</Badge>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {eventFields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No events added yet. Click "Add Event" to add events from templates.
              </div>
            )}

            {eventFields.map((field, index) => (
              <Card key={field.id} className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="font-semibold">
                      {form.watch(`events.${index}.title`) || `Event ${index + 1}`}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {form.watch(`events.${index}.eventType`)} • {form.watch(`events.${index}.points`)} points
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEvent(index)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

                {campaignType === 'multiple_movies' && (
                  <FormField
                    control={form.control}
                    name={`events.${index}.movieId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Movie (Optional - leave blank for campaign-wide event)</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select movie or leave blank" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">All Movies (Campaign-wide)</SelectItem>
                            {form.watch('movies')?.map((movie) => (
                              <SelectItem key={movie.movieId} value={movie.movieId}>
                                {movie.movieTitle || `Movie ${movie.movieId}`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`events.${index}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Title</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`events.${index}.points`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Points</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`events.${index}.difficultyLevel`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Difficulty Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="easy">Easy (10-25 points)</SelectItem>
                          <SelectItem value="medium">Medium (25-75 points)</SelectItem>
                          <SelectItem value="hard">Hard (75-300 points)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name={`events.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name={`events.${index}.eventType`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Event Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="choice_selection">Choice Selection</SelectItem>
                            <SelectItem value="numeric_prediction">Numeric Prediction</SelectItem>
                            <SelectItem value="draft_selection">Draft Selection</SelectItem>
                            <SelectItem value="opening_day_collection">Opening Day Collection</SelectItem>
                            <SelectItem value="weekend_collection">Weekend Collection</SelectItem>
                            <SelectItem value="lifetime_gross">Lifetime Gross</SelectItem>
                            <SelectItem value="imdb_rating">IMDb Rating</SelectItem>
                            <SelectItem value="occupancy_percentage">Occupancy %</SelectItem>
                            <SelectItem value="day1_talk">Day-1 Talk</SelectItem>
                            <SelectItem value="awards_rank">Awards/Trending Rank</SelectItem>
                            <SelectItem value="ott_debut_rank">OTT Debut Rank</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`events.${index}.status`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="upcoming">Upcoming</SelectItem>
                            <SelectItem value="live">Live</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="locked">Locked</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`events.${index}.startDate`}
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                className={cn(
                                  'w-full pl-3 text-left font-normal text-sm',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`events.${index}.endDate`}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>End Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full pl-3 text-left font-normal text-sm',
                                !field.value && 'text-muted-foreground'
                              )}
                            >
                              {field.value ? (
                                format(field.value, 'PPP')
                              ) : (
                                <span>Pick date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch(`events.${index}.eventType`) === 'choice_selection' && (
                  <FormField
                    control={form.control}
                    name={`events.${index}.options`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Options (one per line)</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                            value={field.value?.join('\n') || ''}
                            onChange={(e) => {
                              const options = e.target.value.split('\n').filter((o) => o.trim());
                              field.onChange(options);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Enter each option on a new line
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name={`events.${index}.rules`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rules (one per line)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Rule 1&#10;Rule 2"
                          value={field.value?.join('\n') || ''}
                          onChange={(e) => {
                            const rules = e.target.value.split('\n').filter((r) => r.trim());
                            field.onChange(rules);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter each rule on a new line
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>
            ))}
          </CardContent>
        </Card>

        <Button type="submit">
          {defaultValues ? 'Update Campaign' : 'Create Campaign'}
        </Button>
      </form>
    </Form>
  );
}

