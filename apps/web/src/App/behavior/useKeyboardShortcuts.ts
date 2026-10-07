/* @layer renderer-appshell @kind hook */
import { useEffect } from 'react';
import { usePlatform } from '@app/platform';
import { useSearchStore } from '@app/stores/search-store';
import type { PageId, ConfirmDialog } from '../types';

const useKeyboardShortcuts = (
  nav: { activePage: PageId; setActivePage: (page: PageId) => void },
  dialog: ConfirmDialog | null,
  dismissDialog: () => void,
  activeProfile: Profile | null,
  developerToolsEnabled = false,
) => {
  const { window: win } = usePlatform();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'Enter') {
        e.preventDefault();
        win.toggleFullscreen();
        return;
      }
      // Dev-only Sprite Debug toggle (Ctrl+Shift+D) opens it as a full-window page,
      // so it switches with / is dismissed by the same logic as every other page.
      if (developerToolsEnabled && e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        nav.setActivePage(nav.activePage === 'sprite-debug' ? 'none' : 'sprite-debug');
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const search = useSearchStore.getState();
        if (search.open) search.closePalette(); else search.openPalette();
        return;
      }
      if (e.key !== 'Escape') return;

      // The search palette owns Escape first when open, because it's the top-most surface.
      if (useSearchStore.getState().open) { e.preventDefault(); useSearchStore.getState().closePalette(); return; }
      e.preventDefault();

      // Dismiss confirm dialog
      if (dialog) { dismissDialog(); return; }
      // Close any open page
      if (nav.activePage !== 'none') { nav.setActivePage('none'); return; }
      // Open home (profile hub) from game view
      if (activeProfile) { nav.setActivePage('profile'); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [win, nav, activeProfile, dialog, dismissDialog, developerToolsEnabled]);
};

export { useKeyboardShortcuts };
