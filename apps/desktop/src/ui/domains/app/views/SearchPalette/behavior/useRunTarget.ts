/* @layer renderer-components @kind hook */
import { useCallback } from 'react';
import { useSearchStore } from '@app/stores/search-store';
import type { RunTargetDeps, SearchEntry } from '../SearchPalette.type';

const useRunTarget = (deps: RunTargetDeps) => {
  const closePalette = useSearchStore((s) => s.closePalette);
  const setPendingAnchor = useSearchStore((s) => s.setPendingAnchor);

  const runEntry = useCallback((entry: SearchEntry) => {
    if (entry.disabled) return;

    if (entry.run) {
      entry.run();
      closePalette();
      return;
    }

    if (entry.target) {
      deps.setActivePage(entry.target.page);
      if (entry.target.tab) deps.setProfileHubTab(entry.target.tab);
      setPendingAnchor(entry.target.anchor ?? null);
      closePalette();
    }
  }, [deps.setActivePage, deps.setProfileHubTab, closePalette, setPendingAnchor]);

  return { runEntry };
};

export { useRunTarget };
