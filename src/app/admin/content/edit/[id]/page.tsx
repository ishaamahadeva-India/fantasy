
'use client';
import { useFirestore, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { ArticleForm } from '@/components/admin/article-form';
import { updateArticle } from '@/firebase/firestore/articles';
import { toast } from '@/hooks/use-toast';
import { useRouter, useParams } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function EditArticlePage() {
  const firestore = useFirestore();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const articleRef = firestore ? doc(firestore, 'articles', id) : null;
  const { data: article, isLoading } = useDoc(articleRef);

  const handleUpdateArticle = async (data: any) => {
    if (!firestore) return;
    try {
      await updateArticle(firestore, id, data);
      toast({
        title: 'Article Updated',
        description: 'The article has been successfully updated.',
      });
      router.push('/admin/content');
    } catch (error) {
      console.error('Error updating article:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not update the article. Please try again.',
      });
    }
  };

  if (isLoading) {
    return (
      <div>
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!article) {
    return <div>Article not found.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold md:text-4xl font-headline mb-8">
        Edit Article
      </h1>
      <ArticleForm onSubmit={handleUpdateArticle} defaultValues={article} />
    </div>
  );
}
