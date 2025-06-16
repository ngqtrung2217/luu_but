'use client';

import { useState, useEffect } from 'react';

interface ScrollOptions {
  threshold?: number;
  rootMargin?: string;
}

export function useIntersectionObserver(
  options: ScrollOptions = {
    threshold: 0.1,
    rootMargin: '0px',
  }
) {
  const [elements, setElements] = useState<Map<Element, boolean>>(new Map());
  const [entries, setEntries] = useState<IntersectionObserverEntry[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver((observedEntries) => {
      setEntries(observedEntries);

      observedEntries.forEach((entry) => {
        setElements((prev) => new Map(prev.set(entry.target, entry.isIntersecting)));
      });    }, options);

    return () => observer.disconnect();
  }, [options.threshold, options.rootMargin]); // eslint-disable-line react-hooks/exhaustive-deps

  const observe = (element: Element | null) => {
    if (!element) return;
    
    setElements((prev) => new Map(prev.set(element, false)));
    const observer = new IntersectionObserver((observedEntries) => {
      setEntries(observedEntries);

      observedEntries.forEach((entry) => {
        setElements((prev) => new Map(prev.set(entry.target, entry.isIntersecting)));
      });
    }, options);
    
    observer.observe(element);
    return () => observer.unobserve(element);
  };

  return {
    observe,
    entries,
    isIntersecting: (element: Element | null) => element && elements.get(element),
  };
}
