/* @layer bridge-wasm @kind logic */
import type { GearTiers, SlotRecord } from './gear-ownership.type';

const gearOwnershipState = {
  loadedFor: null as string | null,
  record: {} as SlotRecord,
  loaded: false,
  pending: null as GearTiers | null,
  writeQueue: Promise.resolve(),
};

export { gearOwnershipState };
