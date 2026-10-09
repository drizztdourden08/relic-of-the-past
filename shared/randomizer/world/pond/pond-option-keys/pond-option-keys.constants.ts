/* @layer shared-game @kind constants */
import { POND_INSTANCES } from '../pond-instances';
import { pondAskKeysOf } from '../pond-ask-keys';
import { POND_SHARE_KEY } from '../pond-share';
import { pondKeyOf } from './pond-key-of';
import { pondModeKeyOf } from './pond-mode-key-of';
import type { PondId } from '../pond-instance.type';
import type { PondField } from '../pond.type';

const POND_FIELDS: readonly PondField[] = ['mode', 'throws', 'items', 'curve', 'jumps'];

const POND_MODE_KEYS: Readonly<Record<PondId, string>> = Object.fromEntries(
  POND_INSTANCES.map((pond) => [pond.id, pondModeKeyOf(pond)]),
) as Readonly<Record<PondId, string>>;

const POND_ID_BY_MODE_KEY: ReadonlyMap<string, PondId> = new Map(
  POND_INSTANCES.map((pond) => [pondModeKeyOf(pond), pond.id]),
);

const MODE_KEY_SET: ReadonlySet<string> = new Set(POND_ID_BY_MODE_KEY.keys());

const POND_OPTION_KEYS: readonly string[] = [
  POND_SHARE_KEY,
  ...POND_INSTANCES.flatMap((pond) => [
    ...POND_FIELDS.map((field) => pondKeyOf(pond, field)),
    ...pondAskKeysOf(pond),
  ]),
];

const POND_VALUE_KEYS: ReadonlySet<string> = new Set(POND_OPTION_KEYS.filter((key) => !MODE_KEY_SET.has(key)));

export { POND_FIELDS, POND_ID_BY_MODE_KEY, POND_MODE_KEYS, POND_OPTION_KEYS, POND_VALUE_KEYS };
