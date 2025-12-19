
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

const cricketerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  country: z.string().min(1, 'Country is required'),
  roles: z.string().min(1, 'At least one role is required'),
  avatarUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type CricketerFormValues = z.infer<typeof cricketerSchema>;

type CricketerFormProps = {
  onSubmit: (data: any) => void;
  defaultValues?: Partial<CricketerFormValues>;
};

export function CricketerForm({ onSubmit, defaultValues }: CricketerFormProps) {
  const form = useForm<CricketerFormValues>({
    resolver: zodResolver(cricketerSchema),
    defaultValues: defaultValues || {},
  });
  
  const handleSubmit = (data: CricketerFormValues) => {
    const processedData = {
        ...data,
        roles: data.roles.split(',').map(role => role.trim()),
    };
    onSubmit(processedData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Cricketer Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Virat Kohli" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., IND" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="roles"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Roles</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Batsman, Top Order" {...field} />
                  </FormControl>
                   <FormDescription>
                    Enter roles separated by a comma.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="avatarUrl"
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
          {defaultValues ? 'Update Cricketer' : 'Create Cricketer'}
        </Button>
      </form>
    </Form>
  );
}
