/* @layer scripts @kind tooling */
import type { NativeRecord } from './native-record.type';

const entityBytes = (sortMode: number, records: readonly NativeRecord[]): Buffer => Buffer.concat([
  Buffer.from([sortMode]),
  ...records.map(record => Buffer.from(record.nativeBytes)),
  Buffer.from([0xff]),
]);

export { entityBytes };
