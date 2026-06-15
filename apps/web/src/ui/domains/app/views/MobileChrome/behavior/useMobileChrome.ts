/* @layer renderer-components @kind hook */
/** Options-drawer state, FPS polling (while open), and edge-aware Android Back routing. */
import { useState, useEffect, useRef } from 'react';
import { getFps } from '@app/lib/game';
import { getPlatform } from '@app/platform/get-platform';
import type { PageId } from '@app/App/types';

interface BackDeps {
  gameRunning: boolean;
  activePage: PageId;
  onClosePage: () => void;
  onHome: () => void;
}

const useMobileChrome = ({ gameRunning, activePage, onClosePage, onHome }: BackDeps) => {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [fps, setFps] = useState(0);

  // Poll FPS only while the drawer is open and a game is running.
  useEffect(() => {
    if (!optionsOpen || !gameRunning) return undefined;
    const id = setInterval(() => setFps(getFps()), 500);
    return () => clearInterval(id);
  }, [optionsOpen, gameRunning]);

  // Back routing (registered once; reads latest state via a ref):
  //  - drawer open      → close it (either edge)
  //  - LEFT  edge (Esc) → close the current page, else open Home
  //  - RIGHT edge       → open the Options menu
  const stateRef = useRef({ optionsOpen, activePage, onClosePage, onHome });
  stateRef.current = { optionsOpen, activePage, onClosePage, onHome };
  useEffect(() => getPlatform().device.onBackButton((edge) => {
    const s = stateRef.current;
    if (s.optionsOpen) { setOptionsOpen(false); return; }
    if (edge === 'left') {
      if (s.activePage !== 'none') s.onClosePage();
      else s.onHome();
      return;
    }
    setOptionsOpen(true);
  }), []);

  return {
    optionsOpen,
    openOptions: () => setOptionsOpen(true),
    closeOptions: () => setOptionsOpen(false),
    fps,
  };
};

export { useMobileChrome };
