
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const teamSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['ip', 'national'], {
    required_error: 'You need to select a team type.',
  }),
  logoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type TeamFormValues = z.infer<typeof teamSchema>;

type TeamFormProps = {
  onSubmit: (data: TeamFormValues) => void;
  defaultValues?: Partial<TeamFormValues>;
};

export function TeamForm({ onSubmit, defaultValues }: TeamFormProps) {
  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: defaultValues || {},
  });
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Team Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Mumbai Indians" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ip">IP (League Team)</SelectItem>
                      <SelectItem value="national">National Team</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL (Optional)</FormLabel>
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
          {defaultValues?.name ? 'Update Team' : 'Create Team'}
        </Button>
      </form>
    </Form>
  );
}
