/* @layer scripts @kind tooling */
import type { NativeRecord } from './native-record.type';

const secretBytes = (records: readonly NativeRecord[]): Buffer => Buffer.concat([
  ...records.map(record => Buffer.from(record.nativeBytes)),
  Buffer.from([0xff, 0xff]),
]);

export { secretBytes };
