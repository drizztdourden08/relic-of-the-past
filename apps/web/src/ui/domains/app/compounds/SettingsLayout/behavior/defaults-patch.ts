/* @layer renderer-components @kind logic */
import type { GameSettings } from '@shared/types/settings';
import type { SettingsRecord } from '../SettingsLayout.type';
import { asRecord } from './as-record';
import { readPath } from './read-path';

const withPath = (base: SettingsRecord, path: string[], value: unknown): SettingsRecord => {
  const [head, ...rest] = path;
  if (rest.length === 0) return { ...base, [head]: value };
  return { ...base, [head]: withPath(asRecord(base[head]) ?? {}, rest, value) };
};

const defaultsPatch = (keys: string[], settings: GameSettings, defaults: GameSettings): Partial<GameSettings> => {
  const current = settings as unknown as SettingsRecord;
  const original = defaults as unknown as SettingsRecord;

  return keys.reduce<SettingsRecord>((patch, key) => {
    const path = key.split('.');
    const [root] = path;
    const base = path.length === 1 || root in patch ? patch : { ...patch, [root]: current[root] };
    return withPath(base, path, readPath(original, path).value);
  }, {}) as Partial<GameSettings>;
};

export { defaultsPatch };
