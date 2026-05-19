import { useEffect } from 'react';
import type { PageId, ConfirmDialog } from '../types';

const useKeyboardShortcuts = (
  nav: { activePage: PageId; setActivePage: (page: PageId) => void },
  dialog: ConfirmDialog | null,
  dismissDialog: () => void,
  activeProfile: Profile | null,
) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'Enter') {
        e.preventDefault();
        window.api.toggleFullscreen();
        return;
      }
      if (e.key !== 'Escape') return;
      e.preventDefault();

      // Dismiss confirm dialog (only exception — ESC closes dialogs)
      if (dialog) { dismissDialog(); return; }
      // Open home (profile hub) from game view — ESC never closes pages
      if (nav.activePage === 'none' && activeProfile) { nav.setActivePage('profile'); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [nav, activeProfile, dialog, dismissDialog]);
};

export { useKeyboardShortcuts };
