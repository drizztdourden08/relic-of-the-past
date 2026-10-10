/* @layer renderer-hud @kind hook */
import { useCallback, useEffect, useState } from 'react';
import type { NameTable, PauseLabelKey } from '@rotp/languages';
import { defaultPauseNames } from '@rotp/languages';
import { getActiveProfileId } from '@app/game';
import { loadNameTable } from './load-name-table';
import type { LocalizedNames } from '../PauseMenuView.type';

const pick = (value: string | undefined, fallback: string): string =>
  (value?.trim() ? value : fallback);

const useLocalizedNames = (): LocalizedNames => {
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
