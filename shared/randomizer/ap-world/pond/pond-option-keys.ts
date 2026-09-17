/* @layer shared-game @kind logic */
/**
 * The snapshot keys of ONE pond: the mode the panel renders, the value rows
 * that sit behind it (the throw count, the pool-item count and the curve, with
 * its free sequence), and the ask block's own rows (pond-ask-keys.ts), which
 * carry the price range the mode row used to spell. Every key carries the pond
 * it belongs to (`pond_wishing_items`), so the three ponds are set apart in the
 * same snapshot. Only a mode row is bubbled up with the player's other
 * choices; the rest are rendered by the pond block itself, exactly as the
 * capacity family rows are.
 *
 * The shipped spelling (`pond_mode`, `pond_items`, ...) was the capacity
 * pond's alone and is read through pond-key-migration.data.ts, which also
 * carries the price range onto the ask block's rupee row.
 */
import { POND_INSTANCES } from './pond-instances.data';
import { pondAskKeysOf } from './pond-ask-keys';
import { POND_SHARE_KEY } from './pond-share';
import type { PondId, PondInstance } from './pond-instance.type';

type PondField = 'mode' | 'throws' | 'items' | 'curve' | 'jumps';

const POND_FIELDS: readonly PondField[] = ['mode', 'throws', 'items', 'curve', 'jumps'];

const pondKeyOf = (pond: PondInstance, field: PondField): string => `pond_${pond.id}_${field}`;

/** The mode row of one pond: the row shown among the player's choices. */
const pondModeKeyOf = (pond: PondInstance): string => pondKeyOf(pond, 'mode');

const POND_MODE_KEYS: Readonly<Record<PondId, string>> = Object.fromEntries(
  POND_INSTANCES.map((pond) => [pond.id, pondModeKeyOf(pond)]),
) as Readonly<Record<PondId, string>>;

const POND_ID_BY_MODE_KEY: ReadonlyMap<string, PondId> = new Map(
  POND_INSTANCES.map((pond) => [pondModeKeyOf(pond), pond.id]),
);

/** The pond a mode row belongs to; nothing at all for any other key. */
const pondIdOfModeKey = (key: string): PondId | undefined => POND_ID_BY_MODE_KEY.get(key);

const MODE_KEY_SET: ReadonlySet<string> = new Set(POND_ID_BY_MODE_KEY.keys());

/**
 * Every pond row, in pond order then field order, ask block included, under
 * the one switch that belongs to no single pond (pond-share.ts).
 */
const POND_OPTION_KEYS: readonly string[] = [
  POND_SHARE_KEY,
  ...POND_INSTANCES.flatMap((pond) => [
    ...POND_FIELDS.map((field) => pondKeyOf(pond, field)),
    ...pondAskKeysOf(pond),
  ]),
];

const POND_VALUE_KEYS: ReadonlySet<string> = new Set(POND_OPTION_KEYS.filter((key) => !MODE_KEY_SET.has(key)));

/** True for a value row any pond block owns (everything but the mode rows). */
const isPondValueKey = (key: string): boolean => POND_VALUE_KEYS.has(key);

export {
  POND_FIELDS, POND_MODE_KEYS, POND_OPTION_KEYS, isPondValueKey, pondIdOfModeKey, pondKeyOf, pondModeKeyOf,
};
export type { PondField };
