/* @layer renderer-components @kind hook */
import { useState, useEffect, type RefObject } from 'react';
import type { GameSettings } from '@shared/types/settings';
import type { WindowControlsPort } from '@shared/platform';
import { TITLEBAR_PEEK_ZONE_PX } from '../TitleBar.constants';

const useTitleBarPeek = (
  win: WindowControlsPort,
  windowMode: GameSettings['windowMode'],
  titlebarRef: RefObject<HTMLDivElement | null>,
) => {
  const [hovered, setHovered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    win.isFullscreen().then(setIsFullscreen);
    return win.onFullscreenChange(setIsFullscreen);
  }, [win]);

  const hidden = windowMode === 'borderless' || isFullscreen;

  useEffect(() => {
    if (!hidden) return;

    const onMove = (e: MouseEvent) => {
      if (titlebarRef.current?.contains(e.target as Node)) return;
      setHovered(e.clientY <= TITLEBAR_PEEK_ZONE_PX);
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [hidden, titlebarRef]);

  const handleMouseLeave = () => {
    if (hidden) setHovered(false);
  };

  return { hidden, hovered, handleMouseLeave };
};

export { useTitleBarPeek };
