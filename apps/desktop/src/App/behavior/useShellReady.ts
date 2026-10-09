/* @layer renderer-appshell @kind hook */
import { useEffect, useRef } from 'react';

const useShellReady = (settled: boolean): void => {
  const signalled = useRef(false);

  useEffect(() => {
    if (signalled.current || !settled) return;
    signalled.current = true;
    requestAnimationFrame(() => {
      document.documentElement.classList.remove('booting');
      requestAnimationFrame(() => window.api?.shellReady?.());
    });
  }, [settled]);
};

export { useShellReady };
