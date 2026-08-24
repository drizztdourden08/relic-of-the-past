/* @layer shared-game @kind logic */
/**
 * Slots for every named thing in the record dataset — places, rooms, pickups,
 * chests and the structures that hold them.
 *
 * Read through the dataset facade the caller hands in, which is the only door
 * into the records, so this list follows whatever the registry holds. That
 * dataset is
 * synced in from a private companion repo and is simply ABSENT in a plain
 * clone: the registry then holds nothing, every lookup returns an empty list,
 * and this builder yields `[]` rather than failing. That is a supported state,
 * not an error case.
 *
 * These names are drawn with the set's own glyph sheet and are laid out by the
 * dialogue system rather than a fixed-cell surface, so they carry no length cap
 * of their own.
 */
import type { TextSlot } from '../types';

/** The record kinds that carry a display name a translator would want to reach. */
type NamedKind = 'screen' | 'check' | 'item' | 'location' | 'area' | 'dungeon';

const NAMED_KINDS: NamedKind[] = ['screen', 'check', 'item', 'location', 'area', 'dungeon'];

/** One named record, in the only shape this builder reads. */
type NamedRecord = { id: string; randomizerName: string; vanillaName?: string };

/**
 * How the caller reaches the records. Handed in rather than imported: this
 * module is re-exported from the language barrel, which the storage layer
 * imports, so a direct dataset import would pull the record loaders into every
 * bundle that touches storage — the desktop main process included.
 */
type RecordSource = (kind: NamedKind) => readonly NamedRecord[];

/** Stated when a record has no original name and falls back to its working one. */
const NO_ORIGINAL = 'No original name is recorded for this record, so the working name is shown instead.';

const slotsForKind = (kind: NamedKind, all: RecordSource): TextSlot[] =>
  all(kind).map((record) => ({
    key: `${kind}:${record.id}`,
    label: `${record.id} (${kind})`,
    fallback: record.vanillaName ?? record.randomizerName,
    limit: { kind: 'none' } as const,
    alphabet: 'pack' as const,
    ...(record.vanillaName ? {} : { note: NO_ORIGINAL }),
  }));

/** Every named record, in kind order. Empty when the dataset is not present. */
const worldNameSlots = (all: RecordSource): TextSlot[] =>
  NAMED_KINDS.flatMap((kind) => slotsForKind(kind, all));

export { worldNameSlots };
export type { NamedKind, NamedRecord, RecordSource };
