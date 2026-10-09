/* @layer renderer-appshell @kind hook */
import { useEffect } from 'react';
import { usePlatform } from '@app/platform';
import { useSearchStore } from '@app/stores/search-store';
import { isPrimaryModifier } from '@shared/platform';
import { dismissStackDepth } from '@drizztdourden08/tessera/primitives';
import type { PageId, ConfirmDialog } from '../App.type';

const useKeyboardShortcuts = (
  nav: { activePage: PageId; setActivePage: (page: PageId) => void },
  dialog: ConfirmDialog | null,
  dismissDialog: () => void,
  activeProfile: Profile | null,
  developerToolsEnabled = false,
) => {
  const { window: win, info } = usePlatform();
  const os = info.os;
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 'Enter') {
        e.preventDefault();
        win.toggleFullscreen();
        return;
      }
      if (developerToolsEnabled && e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        nav.setActivePage(nav.activePage === 'sprite-debug' ? 'none' : 'sprite-debug');
        return;
      }
      if (isPrimaryModifier(e, os) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const search = useSearchStore.getState();
        if (search.open) search.closePalette(); else search.openPalette();
        return;
      }
      if (e.key !== 'Escape') return;

      if (dismissStackDepth() > 0) return;
      e.preventDefault();

      if (dialog) { dismissDialog(); return; }
      if (nav.activePage !== 'none') { nav.setActivePage('none'); return; }
      if (activeProfile) { nav.setActivePage('profile'); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [win, os, nav, activeProfile, dialog, dismissDialog, developerToolsEnabled]);
};

export { useKeyboardShortcuts };
