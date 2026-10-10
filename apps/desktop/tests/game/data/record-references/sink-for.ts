/* @layer tests @kind helper */
import type { RecordReference, Sink } from './record-references.type';

const sinkFor = (from: string, into: RecordReference[]): Sink =>
  (kind, field, id) => { if (id) into.push({ from, field, kind, id }); };

export { sinkFor };
