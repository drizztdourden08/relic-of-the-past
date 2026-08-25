/* @layer renderer-hud @kind hook */
/**
 * Display names for the pause menu, resolved against the running profile's
 * language set.
 *
 * English is the floor: every lookup falls back, per key, to the built-in
 * defaults whenever the set is absent, still loading, missing that key, or
 * holding an empty string for it — a half-translated set shows its translated
 * entries and English for the rest, never a blank panel.
 */
import { useCallback, useEffect, useState } from 'react';
import type { NameTable, PauseLabelKey } from '@shared/game/language';
import { defaultPauseNames } from '@shared/game/data/pause-names';
import { getActiveProfileId } from '@app/lib/game';
import { loadNameTable } from './load-name-table';

type LocalizedNames = {
  itemName: (recordId: string, tier: number) => string;
  bottleName: (content: number) => string;
  label: (key: PauseLabelKey) => string;
};

/** A set entry only wins when it actually carries text. */
const pick = (value: string | undefined, fallback: string): string =>
  (value && value.trim() ? value : fallback);

const useLocalizedNames = (): LocalizedNames => {
  // Read at render rather than subscribed to: the id is set when a game starts,
  // and the menu only exists while one is running, so it cannot change under a
  // mounted menu without the game (and this view) being torn down first.
  const profileId = getActiveProfileId();
  const [table, setTable] = useState<NameTable | null>(null);

  useEffect(() => {
    let live = true;
    void loadNameTable(profileId).then((next) => { if (live) setTable(next); });
    return () => { live = false; };
  }, [profileId]);

  const itemName = useCallback((recordId: string, tier: number): string => {
    const { items } = defaultPauseNames;
    const key = `${recordId}-${tier}`;
    const baseKey = `${recordId}-1`;
    // Tier fallback stays inside the chosen language first: an untranslated
    // upgrade name reads better as the translated base name than as English.
    const translated = pick(table?.items[key], pick(table?.items[baseKey], ''));
    return pick(translated, pick(items[key], items[baseKey] ?? ''));
  }, [table]);

  const bottleName = useCallback((content: number): string =>
    pick(table?.bottles[content], defaultPauseNames.bottles[content] ?? ''), [table]);

  const label = useCallback((key: PauseLabelKey): string =>
    pick(table?.labels[key], defaultPauseNames.labels[key]), [table]);

  return { itemName, bottleName, label };
};

export { useLocalizedNames };
export type { LocalizedNames };
