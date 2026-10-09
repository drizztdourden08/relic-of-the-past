/* @layer renderer-components @kind logic */
import type { SettingsRecord } from '../SettingsLayout.type';
import { asRecord } from './as-record';

const readPath = (source: SettingsRecord, path: string[]): { known: boolean; value: unknown } => {
  const [head, ...rest] = path;
  if (!(head in source)) return { known: false, value: undefined };
  if (rest.length === 0) return { known: true, value: source[head] };
  const nested = asRecord(source[head]);
  return nested ? readPath(nested, rest) : { known: false, value: undefined };
};

export { readPath };
