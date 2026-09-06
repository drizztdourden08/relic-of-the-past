/* @layer shared-game @kind types */
/**
 * The four counter families with a ceiling the randomizer can reshape:
 * explosives and projectiles (an eight-tier native grid each), the meter
 * (three levels) and the wallet (a hook-owned 100-rupee ladder). Every
 * capacity-upgrade surface — names, virtual receive ids, pool items, the
 * option rows — is keyed by this id and never by a game name.
 */

type CapacityFamilyId = 'explosives' | 'projectiles' | 'meter' | 'wallet';

/** The three families whose virtual ids carry the jump size directly. */
type StepFamilyId = Exclude<CapacityFamilyId, 'wallet'>;

export type { CapacityFamilyId, StepFamilyId };
