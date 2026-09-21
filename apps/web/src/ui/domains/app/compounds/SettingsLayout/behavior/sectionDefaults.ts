/* @layer renderer-components @kind logic */
/**
 * Works out what "reset this section" would actually change. A key counts only when the
 * defaults know it, the control is not locked, and the stored value differs, so a section
 * already at its defaults offers nothing to press and a locked row is never written over.
 *
 * A few items address a field inside a settings object (`haptics.intensity`), so keys are
 * read and written as dotted paths and the rest of the parent object is carried through.
 */
import type { GameSettings } from '@shared/types/settings';
import type { ItemGroup } from './resolveSections';

type SettingsRecord = Record<string, unknown>;

const asRecord = (value: unknown): SettingsRecord | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value) ? value as SettingsRecord : null;

/** Values here are primitives, arrays and small objects, so a serialized compare is enough. */
const isSame = (a: unknown, b: unknown): boolean =>
  a === b || JSON.stringify(a) === JSON.stringify(b);

const readPath = (source: SettingsRecord, path: string[]): { known: boolean; value: unknown } => {
  const [head, ...rest] = path;
  if (!(head in source)) return { known: false, value: undefined };
  if (rest.length === 0) return { known: true, value: source[head] };
  const nested = asRecord(source[head]);
  return nested ? readPath(nested, rest) : { known: false, value: undefined };
};

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

const withPath = (base: SettingsRecord, path: string[], value: unknown): SettingsRecord => {
  const [head, ...rest] = path;
  if (rest.length === 0) return { ...base, [head]: value };
  return { ...base, [head]: withPath(asRecord(base[head]) ?? {}, rest, value) };
};

/** A nested field starts from the live parent object, so siblings the section never listed survive. */
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

export { changedKeys, defaultsPatch };
