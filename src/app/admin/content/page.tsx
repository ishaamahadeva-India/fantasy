
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
import { Button } from '@/components/ui/button';
import { Edit, PlusCircle, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useCollection, useFirestore } from '@/firebase';
import { collection, deleteDoc, doc } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// Define a type for the article that includes its Firestore ID
type ArticleWithId = {
  id: string;
  title: string;
  category: string;
  slug: string;
};

export default function AdminContentPage() {
  const firestore = useFirestore();
  const articlesQuery = firestore ? collection(firestore, 'articles') : null;
  // We need to adjust the useCollection hook to include the document ID.
  // For now, let's assume `useCollection` can be adapted or we can handle it.
  const { data: articles, isLoading } = useCollection<ArticleWithId>(articlesQuery);


  const handleDelete = async (articleId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore, 'articles', articleId));
      toast({
        title: 'Article Deleted',
        description: 'The article has been successfully deleted.',
      });
    } catch (error) {
      console.error('Error deleting article: ', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not delete the article. Please try again.',
      });
    }
  };

  const handleAction = (action: string, title: string) => {
    toast({
      title: `Action: ${action}`,
      description: `"${title}" would be ${action.toLowerCase()}ed. This is a placeholder.`,
    });
  };

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
          <CardDescription>A list of all published articles.</CardDescription>
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
              {isLoading && (
                <>
                  <TableRow>
                    <TableCell><Skeleton className="h-5 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                  </TableRow>
                   <TableRow>
                    <TableCell><Skeleton className="h-5 w-64" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                  </TableRow>
                </>
              )}
              {articles && articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>{article.category}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleAction('Edit', article.title)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="icon">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the article
                              "{article.title}".
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(article.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && articles?.length === 0 && (
                 <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                        No articles found. You can create one to get started.
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

    