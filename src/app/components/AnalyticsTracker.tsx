"use client";

import { useEffect } from 'react';

declare global {
  interface Window {
    trackScrollDepth: (percentage: number) => void;
    trackTimeOnPage: (seconds: number) => void;
    trackGalleryInteraction: (action: string, category: string) => void;
    trackCarouselInteraction: (action: string, service: string) => void;
  }
}

export default function AnalyticsTracker() {
  useEffect(() => {
    const trackedScrollDepths = new Set<number>();
    const trackedTimeIntervals = new Set<number>();
    let startTime = Date.now();
    
    // Scroll depth tracking
    const handleScroll = () => {
      if (typeof window === 'undefined' || !window.trackScrollDepth) return;
      
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.round((scrollTop / documentHeight) * 100);
      
      // Track milestones: 25%, 50%, 75%, 100%
      const milestones = [25, 50, 75, 100];
      milestones.forEach(milestone => {
        if (scrollPercentage >= milestone && !trackedScrollDepths.has(milestone)) {
          trackedScrollDepths.add(milestone);
          window.trackScrollDepth(milestone);
        }
      });
    };
    
    // Time on page tracking
    const trackTimeIntervals = () => {
      if (typeof window === 'undefined' || !window.trackTimeOnPage) return;
      
      const currentTime = Date.now();
      const secondsOnPage = Math.round((currentTime - startTime) / 1000);
      
      // Track milestones: 15s, 30s, 60s, 120s
      const intervals = [15, 30, 60, 120];
      intervals.forEach(interval => {
        if (secondsOnPage >= interval && !trackedTimeIntervals.has(interval)) {
          trackedTimeIntervals.add(interval);
          window.trackTimeOnPage(interval);
        }
      });
    };
    
    // Set up event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Track time intervals every 5 seconds
    const timeTrackingInterval = setInterval(trackTimeIntervals, 5000);
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(timeTrackingInterval);
    };
  }, []);
  
  // This component doesn't render anything
  return null;
}