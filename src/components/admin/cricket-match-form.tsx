'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CRICKET_EVENT_TEMPLATES } from '@/firebase/firestore/cricket-matches';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

const cricketEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  eventType: z.enum([
    'powerplay_runs', 'powerplay_wickets', 'powerplay_boundaries', 'powerplay_sixes',
    'first_ball_runs', 'first_boundary', 'first_six', 'first_wicket',
    'first_50_partnership', 'first_100_partnership', 'highest_individual_score',
    'most_boundaries', 'most_sixes', 'strike_rate_range',
    'first_wicket_bowler', 'most_wickets', 'best_economy', 'maiden_overs',
    'hat_trick', 'first_5_wicket_haul',
    'toss_winner', 'toss_decision', 'match_winner', 'win_margin',
    'win_by_wickets_or_runs', 'total_runs', 'total_wickets', 'total_fours',
    'total_sixes', 'total_extras',
    'first_innings_score', 'second_innings_score', 'first_innings_wickets',
    'second_innings_wickets',
    'first_innings_lead', 'follow_on', 'declaration', 'century_count', 'fifty_count',
    '300_plus_score', '400_plus_score', 'chase_successful',
    '200_plus_score', 'fastest_50', 'fastest_100', 'super_over', 'drs_reviews', 'timeout_taken',
  ]),
  innings: z.number().optional(),
  status: z.enum(['upcoming', 'live', 'completed', 'locked']),
  startTime: z.date().optional(),
  endTime: z.date().optional(),
  lockTime: z.date().optional(),
  points: z.number().min(1, 'Points must be at least 1'),
  difficultyLevel: z.enum(['easy', 'medium', 'hard']).optional(),
  options: z.array(z.string()).optional(),
  rules: z.array(z.string()).optional(),
});

const matchSchema = z.object({
  matchName: z.string().min(1, 'Match name is required'),
  format: z.enum(['T20', 'ODI', 'Test', 'IPL']),
  team1: z.string().min(1, 'Team 1 is required'),
  team2: z.string().min(1, 'Team 2 is required'),
  venue: z.string().optional(),
  startTime: z.date(),
  status: z.enum(['upcoming', 'live', 'completed']),
  description: z.string().optional(),
  entryFee: z.object({
    type: z.enum(['free', 'paid']),
    amount: z.number().optional(),
  }).optional(),
  maxParticipants: z.number().optional(),
  events: z.array(cricketEventSchema).optional(),
});

type MatchFormValues = z.infer<typeof matchSchema>;

type CricketMatchFormProps = {
  onSubmit: (data: MatchFormValues) => void;
  defaultValues?: Partial<MatchFormValues>;
};

export function CricketMatchForm({ onSubmit, defaultValues }: CricketMatchFormProps) {
  const form = useForm<MatchFormValues>({
    resolver: zodResolver(matchSchema),
    defaultValues: {
      status: 'upcoming',
      format: 'T20',
      events: [],
      entryFee: { type: 'free' },
      ...defaultValues,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'events',
  });

  const selectedFormat = form.watch('format');

  // Filter events by format
  const availableTemplates = CRICKET_EVENT_TEMPLATES.filter((template) => {
    if (!template.applicableFormats || template.applicableFormats.length === 0) {
      return true; // Event applies to all formats
    }
    return template.applicableFormats.includes(selectedFormat as 'T20' | 'ODI' | 'Test');
  });

  const addEventFromTemplate = (template: typeof CRICKET_EVENT_TEMPLATES[0]) => {
    append({
      title: template.title,
      description: template.description,
      eventType: template.eventType,
      status: 'upcoming',
      points: template.defaultPoints,
      difficultyLevel: template.difficultyLevel,
      options: template.defaultOptions || [],
      rules: template.defaultRules || [],
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Match Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="matchName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Match Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., CSK vs MI - IPL 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Match Format</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="T20">T20</SelectItem>
                        <SelectItem value="IPL">IPL</SelectItem>
                        <SelectItem value="ODI">ODI</SelectItem>
                        <SelectItem value="Test">Test</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Wankhede Stadium, Mumbai" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="team1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team 1</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Chennai Super Kings" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="team2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team 2</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Mumbai Indians" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Match Start Time</FormLabel>
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
                              format(field.value, 'PPP p')
                            ) : (
                              <span>Pick date and time</span>
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
                        <SelectItem value="live">Live</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Match description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="entryFee.type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entry Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || 'free'}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
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

              {form.watch('entryFee.type') === 'paid' && (
                <FormField
                  control={form.control}
                  name="entryFee.amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entry Fee (₹)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 99"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

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
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Match Events ({fields.length} added)</CardTitle>
              <Dialog>
                <DialogTrigger asChild>
                  <Button type="button" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Event from Template</DialogTitle>
                    <DialogDescription>
                      Select from {availableTemplates.length} predefined events for {selectedFormat} format.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    {availableTemplates.map((template, index) => (
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
                            {template.difficultyLevel && (
                              <Badge variant="outline">{template.difficultyLevel}</Badge>
                            )}
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
            {fields.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No events added yet. Click "Add Event" to add events from templates.
              </div>
            )}

            {fields.map((field, index) => (
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
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>

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
                    name={`events.${index}.difficultyLevel`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Difficulty</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select difficulty" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="hard">Hard</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`events.${index}.innings`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Innings (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="1 or 2"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {form.watch(`events.${index}.options`) && form.watch(`events.${index}.options`)!.length > 0 && (
                  <FormField
                    control={form.control}
                    name={`events.${index}.options`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Options (one per line)</FormLabel>
                        <FormControl>
                          <Textarea
                            value={field.value?.join('\n') || ''}
                            onChange={(e) => {
                              const options = e.target.value.split('\n').filter((o) => o.trim());
                              field.onChange(options);
                            }}
                          />
                        </FormControl>
                        <FormDescription>Enter each option on a new line</FormDescription>
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
                          value={field.value?.join('\n') || ''}
                          onChange={(e) => {
                            const rules = e.target.value.split('\n').filter((r) => r.trim());
                            field.onChange(rules);
                          }}
                        />
                      </FormControl>
                      <FormDescription>Enter each rule on a new line</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>
            ))}
          </CardContent>
        </Card>

        <Button type="submit">
          {defaultValues ? 'Update Match' : 'Create Match'}
        </Button>
      </form>
    </Form>
  );
}

