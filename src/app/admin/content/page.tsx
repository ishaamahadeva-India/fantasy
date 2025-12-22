
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
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { deleteGossip, addGossip } from '@/firebase/firestore/gossips';
import { addArticle } from '@/firebase/firestore/articles';
import type { Gossip } from '@/lib/types';
import { CSVUpload } from '@/components/admin/csv-upload';
import { downloadArticlesTemplate, downloadGossipsTemplate } from '@/lib/csv-templates';


type ArticleWithId = {
  id: string;
  title: string;
  category: string;
  slug: string;
};

export default function AdminContentPage() {
  const firestore = useFirestore();
  const articlesQuery = firestore ? collection(firestore, 'articles') : null;
  const { data: articles, isLoading: articlesLoading } = useCollection(articlesQuery);

  const gossipsQuery = firestore ? collection(firestore, 'gossips') : null;
  const { data: gossips, isLoading: gossipsLoading } = useCollection(gossipsQuery);


  const handleDeleteArticle = async (articleId: string) => {
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

  const handleDeleteGossip = async (gossipId: string) => {
    if (!firestore) return;
    try {
        await deleteGossip(firestore, gossipId);
        toast({
            title: 'Gossip Deleted',
            description: 'The gossip item has been successfully deleted.',
        });
    } catch (error) {
        console.error('Error deleting gossip: ', error);
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Could not delete the gossip item. Please try again.',
        });
    }
  };

  const handleArticlesCSVUpload = async (rows: any[], currentIndex?: number, total?: number) => {
    if (!firestore) {
      throw new Error('Firestore not initialized');
    }
    
    // Process single row (rows array should have only one item when called sequentially)
    const row = rows[0];
    
    if (!row) {
      throw new Error('No row data provided');
    }

    // Validate required fields
    if (!row.title || row.title.trim() === '') {
      throw new Error(`Row ${currentIndex || '?'} missing title`);
    }

    // Generate slug from title if not provided
    const slug = row.slug || row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    try {
      // Add article to Firestore
      await addArticle(firestore, {
        title: row.title.trim(),
        slug: slug,
        category: row.category?.trim() || 'general',
        excerpt: row.excerpt?.trim() || row.content?.substring(0, 200) || '',
        content: row.content?.trim() || '',
        imageUrl: row.imageUrl?.trim() || undefined,
      });
      
      // Log success
      if (currentIndex && total) {
        console.log(`✅ Uploaded article ${currentIndex}/${total}: "${row.title}"`);
      } else {
        console.log(`✅ Uploaded article: "${row.title}"`);
      }
    } catch (error: any) {
      console.error(`❌ Failed to upload article "${row.title}":`, error);
      throw error;
    }
  };

  const handleGossipsCSVUpload = async (rows: any[], currentIndex?: number, total?: number) => {
    if (!firestore) return;
    
    const row = rows[0];
    
    if (!row) {
      throw new Error('No row data provided');
    }

    if (!row.title || row.title.trim() === '') {
      throw new Error(`Row ${currentIndex || '?'} missing title`);
    }

    await addGossip(firestore, {
      title: row.title.trim(),
      source: row.source?.trim() || '',
      imageUrl: row.imageUrl?.trim() || undefined,
    });
    
    if (currentIndex && total) {
      console.log(`✓ Uploaded gossip ${currentIndex}/${total}: "${row.title}"`);
    } else {
      console.log(`✓ Uploaded gossip: "${row.title}"`);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold md:text-4xl font-headline">
            Content Management
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage articles and gossip for the Intel Hub.
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="articles">
        <TabsList>
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="gossip">Gossip</TabsTrigger>
        </TabsList>
        <TabsContent value="articles" className="mt-4">
            <Card>
                <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>All Articles</CardTitle>
                        <CardDescription>A list of all published articles.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <CSVUpload
                        onUpload={handleArticlesCSVUpload}
                        title="Upload Articles CSV"
                        description="Upload multiple articles at once. CSV should have columns: title, slug, category, excerpt, content, imageUrl"
                        exampleHeaders={['title', 'slug', 'category', 'excerpt', 'content', 'imageUrl']}
                        buttonText="Upload Articles CSV"
                        onDownloadTemplate={downloadArticlesTemplate}
                      />
                      <Button asChild>
                        <Link href="/admin/content/new">
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Create New Article
                        </Link>
                      </Button>
                    </div>
                </div>
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
                    {articlesLoading && (
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
                                asChild
                            >
                                <Link href={`/admin/content/edit/${article.id}`}>
                                <Edit className="w-4 h-4" />
                                </Link>
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
                                    <AlertDialogAction onClick={() => handleDeleteArticle(article.id)}>
                                    Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            </div>
                        </TableCell>
                        </TableRow>
                    ))}
                    {!articlesLoading && articles?.length === 0 && (
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
        </TabsContent>
        <TabsContent value="gossip" className="mt-4">
             <Card>
                <CardHeader>
                 <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Gossip Mill</CardTitle>
                        <CardDescription>A list of all gossip items.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <CSVUpload
                        onUpload={handleGossipsCSVUpload}
                        title="Upload Gossips CSV"
                        description="Upload multiple gossip items at once. CSV should have columns: title, source, imageUrl"
                        exampleHeaders={['title', 'source', 'imageUrl']}
                        buttonText="Upload Gossips CSV"
                        onDownloadTemplate={downloadGossipsTemplate}
                      />
                      <Button asChild>
                        <Link href="/admin/content/gossip/new">
                          <PlusCircle className="w-4 h-4 mr-2" />
                          Create New Gossip
                        </Link>
                      </Button>
                    </div>
                </div>
                </CardHeader>
                <CardContent>
                <Table>
                    <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                    </TableHeader>
                    <TableBody>
                    {gossipsLoading && (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                <Skeleton className="h-8 w-full" />
                            </TableCell>
                        </TableRow>
                    )}
                    {gossips && gossips.map((gossip) => (
                        <TableRow key={gossip.id}>
                        <TableCell className="font-medium">{gossip.title}</TableCell>
                        <TableCell>{gossip.source}</TableCell>
                        <TableCell>
                            <div className="flex gap-2">
                            <Button asChild variant="outline" size="icon">
                                <Link href={`/admin/content/gossip/edit/${gossip.id}`}>
                                <Edit className="w-4 h-4" />
                                </Link>
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
                                    This action cannot be undone. This will permanently delete the gossip item.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteGossip(gossip.id)}>
                                    Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                            </div>
                        </TableCell>
                        </TableRow>
                    ))}
                    {!gossipsLoading && gossips?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={3} className="h-24 text-center">
                                No gossip found. You can create one to get started.
                            </TableCell>
                        </TableRow>
                    )}
                    </TableBody>
                </Table>
                </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
