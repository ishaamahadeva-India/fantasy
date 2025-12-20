
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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const starSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  genre: z.string().min(1, 'At least one genre is required'),
  avatar: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type StarFormValues = z.infer<typeof starSchema>;

type StarFormProps = {
  onSubmit: (data: any) => void;
  defaultValues?: Partial<StarFormValues>;
};

export function StarForm({ onSubmit, defaultValues }: StarFormProps) {
  const form = useForm<StarFormValues>({
    resolver: zodResolver(starSchema),
    defaultValues: defaultValues || {},
  });

  const handleSubmit = (data: StarFormValues) => {
    const processedData = {
      ...data,
      genre: data.genre.split(',').map(g => g.trim()),
    };
    onSubmit(processedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Star Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Prabhas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="genre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Genre(s)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Action, Drama" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter genres separated by a comma.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="avatar"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL (Optional)</FormLabel>
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
          {defaultValues?.name ? 'Update Star' : 'Create Star'}
        </Button>
      </form>
    </Form>
  );
}
