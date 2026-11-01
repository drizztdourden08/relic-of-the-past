/* @layer website-site @kind hook */
import { useEffect } from 'react';

const useScrollLock = (locked: boolean): void => {
  useEffect(() => {
    if (!locked) return undefined;
    const root = document.documentElement;
    const before = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = before;
    };
  }, [locked]);
};

export { useScrollLock };
