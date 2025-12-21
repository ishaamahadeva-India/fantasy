
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
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageUpload } from '@/components/admin/image-upload';

const starSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  genre: z.string().min(1, 'At least one genre is required'),
  avatar: z.string().optional(),
  bio: z.string().optional(),
  dateOfBirth: z.string().optional(),
  debutYear: z.number().optional(),
  industry: z.string().optional(),
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
                  <FormLabel>Avatar Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      folder="stars"
                      label="Star Avatar"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biography (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Short biography..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date of Birth (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="debutYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Debut Year (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="e.g., 2002"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Primary Industry (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tollywood" {...field} />
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
