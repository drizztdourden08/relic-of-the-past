/* @layer bridge-wasm @kind types */
type SessionGate =
  | 'itemOverrides' | 'npcOverrides' | 'dropOverrides' | 'standingOverrides' | 'scriptedGrants'
  | 'shopOverrides' | 'capacityProfile' | 'prizeShuffle' | 'pondPlan' | 'receiptGrants'
  | 'gearArt' | 'dungeonItemGrants' | 'retroBow';

export type { SessionGate };
