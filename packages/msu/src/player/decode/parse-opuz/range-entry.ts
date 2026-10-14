/* @layer renderer-lib @kind logic */
import type { RangeEntry } from './parse-opuz.type';

const rangeEntry = (view: DataView, at: number): RangeEntry => ({
  offset: view.getUint32(at, true),
  samples: view.getUint32(at + 4, true),
  flags: view.getUint16(at + 8, true),
});

export { rangeEntry };
