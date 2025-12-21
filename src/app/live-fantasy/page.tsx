'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LiveFantasyRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/fantasy/cricket');
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Loader2 className="w-8 h-8 animate-spin mb-4" />
      <p className="text-muted-foreground">Redirecting to the new Fantasy Cricket hub...</p>
    </div>
  );
}
