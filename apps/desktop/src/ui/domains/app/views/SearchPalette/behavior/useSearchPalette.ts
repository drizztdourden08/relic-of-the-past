/* @layer renderer-components @kind hook */
import { useCallback, useMemo } from 'react';
import { useSearchStore } from '@app/stores/search-store';
import type { TitleBarProps } from '../../TitleBar/TitleBar.type';
import type { RunTargetDeps, SearchEntry, SearchPaletteItem } from '../SearchPalette.type';
import { paletteGroups } from './palette-groups';
import { useSearchResults } from './useSearchResults';
import { useRunTarget } from './useRunTarget';

const useSearchPalette = (navProps: TitleBarProps, navDeps: RunTargetDeps) => {
  const open = useSearchStore((s) => s.open);
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  const closePalette = useSearchStore((s) => s.closePalette);
  const settings = useSearchStore((s) => s.settings);
  const applyPatch = useSearchStore((s) => s.applyPatch);

  const { catalog, results } = useSearchResults(navProps);
  const { runEntry } = useRunTarget(navDeps);

  const toggleEntry = useCallback((entry: SearchEntry) => {
    if (!entry.settingKey || !applyPatch || !settings) return;
    const current: unknown = settings[entry.settingKey];
    if (typeof current !== 'boolean') return;
    applyPatch({ [entry.settingKey]: !current });
  }, [applyPatch, settings]);

  const groups = useMemo(() => paletteGroups(catalog, results, query, toggleEntry), [catalog, results, query, toggleEntry]);
  const runItem = useCallback((item: SearchPaletteItem) => runEntry(item.entry), [runEntry]);

  return { open, query, setQuery, groups, runItem, closePalette };
};

export { useSearchPalette };
