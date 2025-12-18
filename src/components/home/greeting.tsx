'use client';

import { useState, useEffect } from 'react';

export function Greeting() {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good morning');
    } else if (hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  return (
    <div>
        <h1 className="text-3xl font-bold md:text-4xl font-headline">
            {greeting}, Kaarthu
        </h1>
        <p className="mt-1 text-lg text-muted-foreground">Let’s sharpen your mind in 5 minutes</p>
    </div>
  );
}
