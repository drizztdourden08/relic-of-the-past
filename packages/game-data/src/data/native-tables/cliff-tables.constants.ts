/* @layer shared-game @kind constants */
import { NO_ATTRS } from './native-table-fallbacks.constants';
import { pickNativeTable } from './pick-native-table';

const byteSet = (name: string): ReadonlySet<number> => new Set(pickNativeTable<readonly number[]>(name, NO_ATTRS));

const DRAW_DOTS_LEDGE_ATTRS = byteSet('DRAW_DOTS_LEDGE_BYTES');

export {
  DRAW_DOTS_LEDGE_ATTRS,
};
