/* @layer shared-game @kind logic */
/**
 * The seven snapshot keys of the pond: the mode the panel renders, and the
 * six value rows that sit behind it (the price range, the throw count, the
 * pool-item count and the curve, with its free sequence). Only `pond_mode`
 * is bubbled up with the player's other choices; the value rows are rendered
 * by the pond block itself, exactly as the capacity family rows are.
 */

type PondField = 'mode' | 'start' | 'max' | 'throws' | 'items' | 'curve' | 'jumps';

const POND_FIELDS: readonly PondField[] = ['mode', 'start', 'max', 'throws', 'items', 'curve', 'jumps'];

const pondKeyOf = (field: PondField): string => `pond_${field}`;

/** The mode row: the one pond row shown among the player's choices. */
const POND_MODE_KEY = pondKeyOf('mode');

const POND_OPTION_KEYS: readonly string[] = POND_FIELDS.map(pondKeyOf);

const POND_VALUE_KEYS: ReadonlySet<string> = new Set(POND_OPTION_KEYS.filter((key) => key !== POND_MODE_KEY));

/** True for a pond row the pond block owns (everything but the mode). */
const isPondValueKey = (key: string): boolean => POND_VALUE_KEYS.has(key);

export { POND_FIELDS, POND_MODE_KEY, POND_OPTION_KEYS, isPondValueKey, pondKeyOf };
export type { PondField };
