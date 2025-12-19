'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { placeholderArticles } from '@/lib/placeholder-data';
import { Button } from '@/components/ui/button';
import { Edit, PlusCircle, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function AdminContentPage() {

    const handleAction = (action: string, title: string) => {
        toast({
            title: `Action: ${action}`,
            description: `"${title}" would be ${action.toLowerCase()}ed. This is a placeholder.`
        })
    }

  return (
    <div className="space-y-8">
       <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold md:text-4xl font-headline">
            Content Management
            </h1>
            <p className="mt-2 text-muted-foreground">
                Create, edit, and manage articles and blog posts.
            </p>
        </div>
        <Button onClick={() => handleAction('Create', 'New Article')}>
          <PlusCircle className="w-4 h-4 mr-2" />
          Create New Article
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>All Articles</CardTitle>
          <CardDescription>
            A list of all published articles.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placeholderArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>{article.category}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleAction('Edit', article.title)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="icon" onClick={() => handleAction('Delete', article.title)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
