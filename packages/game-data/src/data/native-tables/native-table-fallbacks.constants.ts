/* @layer shared-game @kind constants */
import type { DoorKind } from '../types/native-tables';

const NO_BYTES = {} as const;
const NO_ATTRS: readonly number[] = [];

const NO_BARRIERS: Record<DoorKind, string | null> = {
  normal: null, 'small-key': null, 'big-key': null, bombable: null,
  shutter: null, switch: null, trap: null,
};

export { NO_ATTRS, NO_BARRIERS, NO_BYTES };
