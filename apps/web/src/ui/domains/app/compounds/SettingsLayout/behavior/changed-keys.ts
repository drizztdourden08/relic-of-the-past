/* @layer renderer-components @kind logic */
import type { GameSettings } from '@shared/types/settings';
import type { ItemGroup, SettingsRecord } from '../SettingsLayout.type';
import { readPath } from './read-path';

const isSame = (a: unknown, b: unknown): boolean =>
  a === b || JSON.stringify(a) === JSON.stringify(b);

const changedKeys = (
  groups: ItemGroup[],
  settings: GameSettings,
  defaults: GameSettings,
  isLocked: (key: string) => boolean,
): string[] => {
  const current = settings as unknown as SettingsRecord;
  const original = defaults as unknown as SettingsRecord;
  const keys = groups.flatMap((group) => group.items.map((item) => item.key));

  return [...new Set(keys)].filter((key) => {
    if (isLocked(key)) return false;
    const path = key.split('.');
    const fallback = readPath(original, path);
    return fallback.known && !isSame(readPath(current, path).value, fallback.value);
  });
};

export { changedKeys };
