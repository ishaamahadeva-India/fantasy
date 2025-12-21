
'use client';

import { useForm } from 'react-hook-form';
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

const movieSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  releaseYear: z.coerce.number().min(1888, 'Please enter a valid year'),
  genre: z.string().min(1, 'Genre is required'),
  industry: z.enum(['Hollywood', 'Bollywood', 'Tollywood', 'Tamil', 'Kannada', 'Malayalam', 'Punjabi', 'Bhojpuri', 'Other'], {
    required_error: 'You need to select an industry.',
  }),
  description: z.string().min(1, 'Description is required'),
  posterUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type MovieFormValues = z.infer<typeof movieSchema>;

type MovieFormProps = {
  onSubmit: (data: MovieFormValues) => void;
  defaultValues?: Partial<MovieFormValues>;
};

export function MovieForm({ onSubmit, defaultValues }: MovieFormProps) {
  const form = useForm<MovieFormValues>({
    resolver: zodResolver(movieSchema),
    defaultValues: defaultValues || {},
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Movie Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Kalki 2898 AD" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="releaseYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Release Year</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="e.g., 2024" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Hollywood">Hollywood</SelectItem>
                      <SelectItem value="Bollywood">Bollywood</SelectItem>
                      <SelectItem value="Tollywood">Tollywood</SelectItem>
                      <SelectItem value="Tamil">Tamil</SelectItem>
                      <SelectItem value="Kannada">Kannada</SelectItem>
                      <SelectItem value="Malayalam">Malayalam</SelectItem>
                      <SelectItem value="Punjabi">Punjabi</SelectItem>
                      <SelectItem value="Bhojpuri">Bhojpuri</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Sci-Fi, Action" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A short synopsis of the movie."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="posterUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Poster URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        <Button type="submit">
          {defaultValues?.title ? 'Update Movie' : 'Create Movie'}
        </Button>
      </form>
    </Form>
  );
}
