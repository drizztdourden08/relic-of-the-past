/* @layer shared-game @kind types */
type CapacityFamilyId = 'explosives' | 'projectiles' | 'meter' | 'wallet';

type StepFamilyId = Exclude<CapacityFamilyId, 'wallet'>;

export type { CapacityFamilyId, StepFamilyId };
