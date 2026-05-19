import { useState, useEffect } from 'react';
import type { PageId, ConfirmDialog } from '../types';

const useKeyboardShortcuts = (
  nav: { activePage: PageId; setActivePage: (page: PageId) => void },
  dialog: ConfirmDialog | null,
  dismissDialog: () => void,
  activeProfile: Profile | null,
  showSpriteDebug: boolean,
  setShowSpriteDebug: (v: boolean) => void,
) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'Enter') {
        e.preventDefault();
        window.api.toggleFullscreen();
        return;
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'D' && window.api.isDev) {
        e.preventDefault();
        setShowSpriteDebug(!showSpriteDebug);
        return;
      }
      if (e.key !== 'Escape') return;
      e.preventDefault();

      // Priority 1: dismiss confirm dialog
      if (dialog) { dismissDialog(); return; }
      // Priority 2: close sprite debug overlay
      if (showSpriteDebug) { setShowSpriteDebug(false); return; }
      // Priority 3: close any open page → back to game
      if (nav.activePage !== 'none') { nav.setActivePage('none'); return; }
      // Priority 4: open home (profile hub) from game view
      if (activeProfile) { nav.setActivePage('profile'); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [nav, activeProfile, dialog, dismissDialog, showSpriteDebug, setShowSpriteDebug]);
};

export { useKeyboardShortcuts };
