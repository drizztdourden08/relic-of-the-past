/* @layer shared-game @kind logic */
import { NATIVE_TABLE_EXPORTS } from './native-table-exports.constants';

const pickNativeTable = <T>(name: string, fallback: T): T =>
  (NATIVE_TABLE_EXPORTS[name] === undefined ? fallback : NATIVE_TABLE_EXPORTS[name]) as T;

export { pickNativeTable };
