/* @layer bridge-wasm @kind logic */
import type { SessionGate } from './session-gate-flags.type';

const armedGates: Record<SessionGate, boolean> = {
  itemOverrides: false,
  npcOverrides: false,
  dropOverrides: false,
  standingOverrides: false,
  scriptedGrants: false,
  shopOverrides: false,
  capacityProfile: false,
  prizeShuffle: false,
  pondPlan: false,
  receiptGrants: false,
  gearArt: false,
  dungeonItemGrants: false,
  retroBow: false,
};

export { armedGates };
