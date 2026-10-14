/* @layer renderer-components @kind hook */
import { useCallback, useEffect, useRef, useState } from 'react';
import { useEscapeStack } from '@drizztdourden08/tessera/primitives';

const useToolbarMenu = () => {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openKey) return;
    const dismiss = (event: Event): void => {
      const target = event.target as HTMLElement | null;
      if (target?.closest('.dropdown-menu, .hud-picker-grid') || (bar.current && target && bar.current.contains(target))) return;
      setOpenKey(null);
    };
    document.addEventListener('pointerdown', dismiss, true);
    return () => document.removeEventListener('pointerdown', dismiss, true);
  }, [openKey]);

  const close = useCallback(() => setOpenKey(null), []);

  useEscapeStack({ active: openKey !== null, level: 'menu', onEscape: close });
  const toggle = useCallback((key: string) => setOpenKey((current) => (current === key ? null : key)), []);

  return { bar, openKey, close, toggle };
};

export { useToolbarMenu };
