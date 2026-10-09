/* @layer shared-game @kind logic */
import type { EntityKind } from './ids.type';
import { ID_PAD_WIDTH, KIND_ID_PREFIXES } from './ids.constants';

const makeId = (kind: EntityKind, n: number): string => `${KIND_ID_PREFIXES[kind]}-${String(n).padStart(ID_PAD_WIDTH, '0')}`;

export { makeId };
