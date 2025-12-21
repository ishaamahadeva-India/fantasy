
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
import { ImageUpload } from '@/components/admin/image-upload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const cricketerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  country: z.string().min(1, 'Country is required'),
  roles: z.string().min(1, 'At least one role is required'),
  avatarUrl: z.string().optional(),
  bio: z.string().optional(),
  dateOfBirth: z.string().optional(),
  battingStyle: z.string().optional(),
  bowlingStyle: z.string().optional(),
  consistencyIndex: z.number().min(0).max(100).optional(),
  impactScore: z.number().min(0).max(100).optional(),
  trendingRank: z.number().optional(),
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
                  <FormLabel>Avatar Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      folder="cricketers"
                      label="Cricketer Avatar"
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
                    <Input placeholder="Short biography..." {...field} />
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
                name="battingStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Batting Style (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Right-handed" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="bowlingStyle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bowling Style (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Right-arm fast" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="consistencyIndex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consistency Index (0-100)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0-100"
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
                name="impactScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Impact Score (0-100)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="0-100"
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
                name="trendingRank"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trending Rank (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Rank"
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
        <Button type="submit">
          {defaultValues ? 'Update Cricketer' : 'Create Cricketer'}
        </Button>
      </form>
    </Form>
  );
}
