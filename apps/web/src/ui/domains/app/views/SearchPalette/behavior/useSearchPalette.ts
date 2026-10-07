/* @layer renderer-components @kind hook */
/**
 * Drives the SearchPalette shell. The palette is always mounted (a zero-size seed at
 * top-center, like Jex's CommandSurface pill) and just toggles an `is-open` class. The
 * CSS transition runs on the persisting DOM node with no mount/unmount timing to manage.
 * Also owns keyboard navigation and running/toggling the active result.
 */
import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from 'react';
import { useSearchStore } from '@app/stores/search-store';
import type { GameSettings } from '@shared/types/settings';
import type { TitleBarProps } from '../../TitleBar/TitleBar.type';
import type { SearchEntry } from '../SearchPalette.type';
import { useSearchResults } from './useSearchResults';
import { useRunTarget, type RunTargetDeps } from './run-target';

const useSearchPalette = (navProps: TitleBarProps, navDeps: RunTargetDeps) => {
  const open = useSearchStore((s) => s.open);
  const query = useSearchStore((s) => s.query);
  const setQuery = useSearchStore((s) => s.setQuery);
  const closePalette = useSearchStore((s) => s.closePalette);
  const settings = useSearchStore((s) => s.settings);
  const applyPatch = useSearchStore((s) => s.applyPatch);

  const { catalog, results } = useSearchResults(navProps);
  const { runEntry } = useRunTarget(navDeps);

  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => { setActiveIndex(0); }, [results]);

  const toggleEntry = useCallback((entry: SearchEntry) => {
    if (!entry.settingKey || !applyPatch || !settings) return;
    const current = (settings as unknown as Record<string, unknown>)[entry.settingKey];
    if (typeof current !== 'boolean') return;
    applyPatch({ [entry.settingKey]: !current } as Partial<GameSettings>);
  }, [applyPatch, settings]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { e.preventDefault(); closePalette(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); return; }
    if (e.key !== 'Enter') return;
    const entry = results[activeIndex];
    if (!entry) return;
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) toggleEntry(entry);
    else runEntry(entry);
  }, [results, activeIndex, runEntry, toggleEntry, closePalette]);

  return {
    open,
    query, setQuery,
    catalog, results, activeIndex, setActiveIndex,
    inputRef, handleKeyDown,
    runEntry, toggleEntry, closePalette,
  };
};

export { useSearchPalette };
