'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Trophy, Users } from 'lucide-react';
import Image from 'next/image';

const SPLASH_STORAGE_KEY = 'quizzbuzz-splash-seen';

export function SplashScreen() {
  const [showSplash, setShowSplash] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleGetStarted = () => {
    // Mark splash as seen
    localStorage.setItem(SPLASH_STORAGE_KEY, 'true');
    setShowSplash(false);
    // Show the app content and restore body/html scroll
    const appContent = document.getElementById('app-content');
    const body = document.body;
    const html = document.documentElement;
    if (appContent) {
      appContent.style.display = 'block';
      appContent.style.visibility = 'visible';
      appContent.style.opacity = '1';
    }
    if (body) {
      body.style.overflow = '';
      body.style.height = '';
    }
    if (html) {
      html.style.overflow = '';
      html.style.height = '';
    }
  };

  useEffect(() => {
    // Check if user has seen splash screen before
    const hasSeenSplash = localStorage.getItem(SPLASH_STORAGE_KEY);
    
    // Hide app content initially if splash should show
    const appContent = document.getElementById('app-content');
    const body = document.body;
    const html = document.documentElement;
    
    if (!hasSeenSplash) {
      // Hide app content and prevent body/html scroll while splash is showing
      if (appContent) {
        appContent.style.display = 'none';
        appContent.style.visibility = 'hidden';
        appContent.style.opacity = '0';
      }
      if (body) {
        body.style.overflow = 'hidden';
        body.style.height = '100vh';
      }
      if (html) {
        html.style.overflow = 'hidden';
        html.style.height = '100vh';
      }
      setShowSplash(true);
      // Hide loading after a brief delay for smooth transition
      setTimeout(() => setIsLoading(false), 100);
      
      // Auto-dismiss after 4 seconds (between 3-5 seconds)
      const autoDismissTimer = setTimeout(() => {
        handleGetStarted();
      }, 4000);

      // Cleanup timer on unmount
      return () => {
        clearTimeout(autoDismissTimer);
      };
    } else {
      // User has seen splash, show app content immediately
      if (appContent) {
        appContent.style.display = 'block';
        appContent.style.visibility = 'visible';
        appContent.style.opacity = '1';
      }
      if (body) {
        body.style.overflow = '';
        body.style.height = '';
      }
      if (html) {
        html.style.overflow = '';
        html.style.height = '';
      }
      setIsLoading(false);
    }
  }, []);

  // Don't render anything while loading
  if (isLoading) {
    return null;
  }

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[99999] bg-gradient-to-br from-background via-primary/5 to-background flex flex-col items-center justify-center"
          style={{ 
            width: '100vw', 
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: 0,
            padding: 0,
            overflow: 'hidden'
          }}
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [90, 0, 90],
                opacity: [0.1, 0.2, 0.1],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute bottom-20 right-10 md:bottom-40 md:right-40 w-40 h-40 md:w-80 md:h-80 bg-primary/20 rounded-full blur-3xl"
            />
          </div>

          {/* Main Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center justify-center text-center space-y-8 max-w-sm md:max-w-lg w-full px-6 md:px-12"
          >
            {/* Logo/Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 15 }}
              className="relative"
            >
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-primary via-primary/80 to-primary/60 p-4 shadow-2xl shadow-primary/50 flex items-center justify-center">
                <Image
                  src="/icons/icon-512x512.png"
                  alt="quizzbuzz"
                  width={120}
                  height={120}
                  className="rounded-2xl md:w-[140px] md:h-[140px]"
                  priority
                />
              </div>
              {/* Glow effect */}
              <motion.div
                animate={{
                  boxShadow: [
                    "0 0 20px rgba(230, 200, 122, 0.5)",
                    "0 0 40px rgba(230, 200, 122, 0.8)",
                    "0 0 20px rgba(230, 200, 122, 0.5)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-3xl"
              />
            </motion.div>

            {/* App Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="space-y-2"
            >
              <h1 className="text-5xl md:text-6xl font-bold font-headline bg-gradient-to-r from-primary via-primary/90 to-primary/70 bg-clip-text text-transparent">
                quizzbuzz
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground font-medium max-w-md">
                The premier subscription platform for discerning learners
              </p>
            </motion.div>

            {/* Feature Icons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex items-center justify-center gap-6 pt-4"
            >
              {[
                { icon: Zap, label: 'Fast' },
                { icon: Trophy, label: 'Win' },
                { icon: Users, label: 'Compete' },
              ].map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.8 + index * 0.1,
                    type: "spring",
                    stiffness: 200,
                    damping: 15,
                  }}
                  className="flex flex-col items-center gap-2"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                </motion.div>
              ))}
            </motion.div>

            {/* Get Started Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="w-full max-w-sm pt-4"
            >
              <Button
                onClick={handleGetStarted}
                size="lg"
                className="w-full h-14 md:h-16 text-lg md:text-xl font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/30 transition-all duration-300"
              >
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 mr-2" />
                Get Started
              </Button>
            </motion.div>

            {/* Decorative Elements */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="absolute -bottom-8 left-1/2 transform -translate-x-1/2"
            >
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.2, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: "easeInOut",
                    }}
                    className="w-2 h-2 rounded-full bg-primary/40"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

