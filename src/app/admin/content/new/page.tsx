
'use client';

import { ArticleForm } from '@/components/admin/article-form';
import { addArticle } from '@/firebase/firestore/articles';
import { useFirestore } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function NewArticlePage() {
  const firestore = useFirestore();
  const router = useRouter();

  const handleCreateArticle = async (data: any) => {
    if (!firestore) return;
    try {
      await addArticle(firestore, data);
      toast({
        title: 'Article Created',
        description: 'The new article has been successfully saved.',
      });
      router.push('/admin/content');
    } catch (error) {
      console.error('Error creating article:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not create the article. Please try again.',
      });
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold md:text-4xl font-headline mb-8">
        Create New Article
      </h1>
      <ArticleForm onSubmit={handleCreateArticle} />
    </div>
  );
}
