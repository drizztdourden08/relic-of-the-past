/* @layer renderer-components @kind hook */
/** Facade: turns a SearchEntry (either an imperative `run` or a declarative `target`) into
 *  the app's existing navigation calls, so the palette never re-implements nav plumbing. */
import { useCallback } from 'react';
import { useSearchStore } from '@app/stores/search-store';
import type { PageId } from '@app/App/types';
import type { ProfileHubTab } from '../../ProfileHub/ProfileHub.type';
import type { SearchEntry } from '../SearchPalette.type';

interface RunTargetDeps {
  setActivePage: (page: PageId) => void;
  setProfileHubTab: (tab: ProfileHubTab) => void;
}

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
export type { RunTargetDeps };
