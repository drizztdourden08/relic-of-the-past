import { useState, useEffect } from 'react';
import type { PageId, ConfirmDialog } from '../types';

const useKeyboardShortcuts = (
  nav: { activePage: PageId; setActivePage: (page: PageId) => void },
  dialog: ConfirmDialog | null,
  dismissDialog: () => void,
  activeProfile: Profile | null,
) => {
  const [showSpriteDebug, setShowSpriteDebug] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'Enter') {
        e.preventDefault();
        window.api.toggleFullscreen();
        return;
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'D' && window.api.isDev) {
        e.preventDefault();
        setShowSpriteDebug(v => !v);
        return;
      }
      if (e.key !== 'Escape') return;
      if (dialog) { e.preventDefault(); dismissDialog(); return; }
      if (nav.activePage === 'picker' && activeProfile) { e.preventDefault(); nav.setActivePage('none'); return; }
      if (nav.activePage === 'data') { e.preventDefault(); nav.setActivePage(activeProfile ? 'none' : 'picker'); return; }
      if (nav.activePage === 'profile') { e.preventDefault(); nav.setActivePage('none'); return; }
      if (nav.activePage === 'none' && activeProfile) { e.preventDefault(); nav.setActivePage('profile'); return; }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [nav.activePage, activeProfile, dialog, dismissDialog, nav]);

  return { showSpriteDebug, toggleSpriteDebug: () => setShowSpriteDebug(v => !v) };
};

export { useKeyboardShortcuts };
