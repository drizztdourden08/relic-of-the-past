/* @layer renderer-appshell @kind hook */
import { useEffect } from 'react';
import { usePlatform } from '@app/platform';
import { useSearchStore } from '@app/stores/search-store';
import { isPrimaryModifier } from '@shared/platform';
import { dismissStackDepth } from '@ds/primitives/Portal';
import type { PageId, ConfirmDialog } from '../types';

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
      // Dev-only Sprite Debug toggle (Ctrl+Shift+D) opens it as a full-window page,
      // so it switches with / is dismissed by the same logic as every other page.
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

      // Every layered surface answers first. A popover, menu, dialog, full-screen page or
      // the search palette that is open has registered with the design system's dismiss
      // stack, and the stack's own listener has already closed exactly one of them. This
      // shortcut is the floor beneath all of it and only acts on an Escape that had nothing
      // above it. Two document listeners cannot order themselves, so neither one tries.
      if (dismissStackDepth() > 0) return;
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
  }, [win, os, nav, activeProfile, dialog, dismissDialog, developerToolsEnabled]);
};

export { useKeyboardShortcuts };
