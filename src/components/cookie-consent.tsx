'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Cookie, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Mark as mounted to prevent hydration mismatch
    setMounted(true);
    
    // Check if user has already consented
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem('cookie-consent');
      if (!consent) {
        // Show banner after a short delay
        const timer = setTimeout(() => {
          setShowBanner(true);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setShowBanner(false);
  };

  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) return null;

  return (
    <AnimatePresence>
      {showBanner && (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 100, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 md:px-6 md:pb-6"
    >
      <div className="max-w-4xl mx-auto bg-background/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-3 md:p-4">
        <div className="flex items-center gap-3">
          <Cookie className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs md:text-sm text-muted-foreground">
              We use cookies to enhance your experience.{' '}
              <Link href="/privacy" className="text-primary hover:underline font-medium">
                Learn more
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 md:px-3 text-xs"
              onClick={handleReject}
            >
              <X className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
            <Button 
              onClick={handleAccept} 
              size="sm"
              className="h-8 px-3 md:px-4 text-xs md:text-sm"
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}

