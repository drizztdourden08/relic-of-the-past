/* @layer shared-game @kind logic */
import type { NamedKind, RecordSource, TextSlot } from '../types';
import { NAMED_KINDS } from './world-names.constants';

const slotsForKind = (kind: NamedKind, all: RecordSource): TextSlot[] =>
  all(kind).map((record) => ({
    key: `${kind}:${record.id}`,
    label: `${record.id} (${kind})`,
    fallback: record.name,
    limit: { kind: 'none' } as const,
    alphabet: 'pack' as const,
  }));

const worldNameSlots = (all: RecordSource): TextSlot[] =>
  NAMED_KINDS.flatMap((kind) => slotsForKind(kind, all));

export { worldNameSlots };
