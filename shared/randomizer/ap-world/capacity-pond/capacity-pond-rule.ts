/* @layer shared-game @kind logic */
/**
 * The one rule binding the capacity families to the wishing pond, and the
 * only place it is written down.
 *
 * The pond is the game's ONLY native source of explosives and projectiles
 * upgrades. So the two features cannot be chosen apart: the moment the pond
 * stops selling capacity levels and starts handing out pool items, a family
 * left on Vanilla has no source left anywhere in the seed, which is the silent hole
 * this module exists to make unreachable.
 *
 *   Vanilla         ⇔ pond `capacity`, the only place its upgrades are sold
 *   Vanilla in pool ⇔ pond `vanilla-cost` / `custom` / `gamble`, so the same
 *                     upgrade is never both sold and shuffled
 *   Custom          ⇔ either pond: its own ladder is already in the seed, so
 *                     it asks the pond for nothing and the pond asks it for
 *                     nothing back
 *
 * So the rule binds a family to the pond only while that family HAS no
 * source of its own. When the two sides disagree the control the player just
 * moved wins (`authority`) and the other side is re-pointed, with a note
 * saying so; a Custom family is never re-pointed and never drags the pond
 * with it. When the master switch is off the whole pair collapses to the
 * shape the game shipped with. The reconciliation is idempotent, so the
 * snapshot writer can run it again as a final guarantee and change nothing.
 *
 * Retro bow takes the projectiles family out of the pair: with every shot
 * paid for there is nothing to upgrade, so the family reads as Vanilla
 * (capacity/retro-projectiles.ts) and the biconditional above is judged on
 * the explosives family alone. The pond never pushes a pinned family back
 * into the pool, and the stored setting waits underneath for retro to go off.
 */
import { VANILLA_CAPACITY_PROFILE } from '../capacity/capacity-profile-defaults';
import { isPinnedUnderRetro, withRetroBow } from '../capacity/retro-projectiles';
import { POND_MODES, pondSettingForMode } from '../pond/pond-mode-switch';
import { CAPACITY_POND_NOTES } from './capacity-pond-notes.data';
import type { CapacityFamilyId, CapacityProfile, FamilySetting } from '../capacity/capacity-profile.type';
import type { PondMode, PondSetting } from '../pond/pond-profile.type';
import type {
  CapacityPondAuthority, CapacityPondSelection, ReconciledCapacityPond,
} from './capacity-pond-rule.type';

/** The two families the pond is the native source of; the meter and the wallet have no pond slot. */
const POND_FED_FAMILIES = ['explosives', 'projectiles'] as const;

type PondFedFamily = (typeof POND_FED_FAMILIES)[number];

/** What a family needs of the pond, or nothing at all when it carries its own upgrades. */
type PondDemand = 'legacy' | 'active' | undefined;

/** Where a pond forced off the legacy mode lands: the native economy, unchanged prices. */
const FORCED_POND_MODE: PondMode = 'vanilla-cost';

const IN_POOL: FamilySetting = { mode: 'vanilla-in-pool' };
const VANILLA: FamilySetting = { mode: 'vanilla' };

const NO_FORCED: ReadonlyMap<CapacityFamilyId, string> = new Map();

const isInPool = (setting: FamilySetting): boolean => setting.mode === 'vanilla-in-pool';

/** True while the pond hands out pool items instead of selling capacity levels. */
const isPondActive = (pond: PondSetting): boolean => pond.mode !== 'capacity';

/**
 * What a family needs of the pond. Vanilla has no upgrades of its own, so it
 * needs the native sales; Vanilla in pool has taken them out of the pond, so
 * the pond must not sell them too. Custom carries its whole ladder in the
 * seed and so needs nothing either way, which is why it is the one setting
 * the rule leaves alone on both sides.
 */
const demandOf = (setting: FamilySetting): PondDemand => {
  if (setting.mode === 'vanilla') return 'legacy';
  if (isInPool(setting)) return 'active';
  return undefined;
};

/**
 * What a whole profile asks of the pond. Legacy wins a disagreement, because
 * a family left with no source is the hole this module exists to close, and
 * alignFamilies then brings the other family in behind it.
 */
const profileDemand = (capacity: CapacityProfile, fed: readonly PondFedFamily[]): PondDemand => {
  const demands = fed.map((family) => demandOf(capacity[family]));
  if (demands.includes('legacy')) return 'legacy';
  if (demands.includes('active')) return 'active';
  return undefined;
};

/** The pond-fed families still the pond's to stock: retro takes the projectiles out. */
const fedFamiliesOf = (retroBow: boolean): readonly PondFedFamily[] =>
  POND_FED_FAMILIES.filter((family) => !isPinnedUnderRetro(family, retroBow));

/**
 * The pond-fed families brought in line with the pond: a Vanilla family moves
 * into the pool once the pond stops selling levels, and a pooled family goes
 * back to Vanilla once the pond starts again. A Custom family is skipped on
 * both sides, since its ladder is already in the seed. `keep` is the row the
 * player just moved, which is exempt because it is the one deciding.
 */
const alignFamilies = (
  capacity: CapacityProfile, fed: readonly PondFedFamily[], pooled: boolean, keep?: PondFedFamily,
): CapacityProfile => {
  const next = { ...capacity };
  for (const family of fed) {
    if (family === keep) continue;
    const demand = demandOf(next[family]);
    if (demand === undefined) continue;
    if (pooled && demand === 'legacy') next[family] = IN_POOL;
    if (!pooled && demand === 'active') next[family] = VANILLA;
  }
  return next;
};

/**
 * The pond re-pointed at what the families demand of it: off the legacy mode
 * while one is in the pool, back onto it while one is Vanilla, and left
 * exactly as the player set it when neither asks for anything.
 */
const pondFor = (pond: PondSetting, demand: PondDemand): PondSetting => {
  if (demand === undefined) return pond;
  if (demand === 'active') return isPondActive(pond) ? pond : pondSettingForMode(FORCED_POND_MODE, pond);
  return pondSettingForMode('capacity', pond);
};

/** The pond-fed family the player just moved, when the authority names one still in play. */
const movedFamily = (authority: CapacityPondAuthority, fed: readonly PondFedFamily[]): PondFedFamily | undefined =>
  (fed as readonly string[]).includes(authority) ? authority as PondFedFamily : undefined;

/** The pair as the rule allows it, with the moved control keeping its value. */
const settle = (selection: CapacityPondSelection, authority: CapacityPondAuthority): CapacityPondSelection => {
  const { capacity, pond, retroBow } = selection;
  const fed = fedFamiliesOf(retroBow);
  if (authority === 'pond') return { ...selection, capacity: alignFamilies(capacity, fed, isPondActive(pond)) };
  // The moved row speaks for itself; a wholesale profile change (a reset, or a
  // row that is not pond-fed) is read as a whole. Either way a row asking for
  // nothing leaves the pond where the player put it.
  const moved = movedFamily(authority, fed);
  const demand = moved === undefined ? profileDemand(capacity, fed) : demandOf(capacity[moved]);
  const settled = pondFor(pond, demand);
  return { ...selection, capacity: alignFamilies(capacity, fed, isPondActive(settled), moved), pond: settled };
};

/** True while a pond-fed family has its native upgrade sitting in the pool. */
const anyInPool = (selection: CapacityPondSelection): boolean =>
  fedFamiliesOf(selection.retroBow).some((family) => isInPool(selection.capacity[family]));

/**
 * The sentences binding on this pair: standing explanations, not one-shot
 * toasts. An active pond rules Vanilla out for the families it feeds; a
 * family actually sitting in the pool is what rules the legacy mode out.
 * They are separate now that Custom satisfies neither.
 */
const notesOf = (selection: CapacityPondSelection): readonly string[] => {
  if (!selection.enabled) return [CAPACITY_POND_NOTES.off];
  const { retroBow } = selection;
  const notes: string[] = [];
  if (isPondActive(selection.pond))
    notes.push(retroBow ? CAPACITY_POND_NOTES.forcedInPoolRetro : CAPACITY_POND_NOTES.forcedInPool);
  if (anyInPool(selection))
    notes.push(retroBow ? CAPACITY_POND_NOTES.modeUnavailableRetro : CAPACITY_POND_NOTES.modeUnavailable);
  return notes;
};

/** The modes the pond dropdown may offer: the legacy one is gone while a family sits in the pool. */
const pondModesOf = (selection: CapacityPondSelection): readonly PondMode[] => {
  if (!selection.enabled) return POND_MODES.filter((mode) => mode === 'capacity');
  return anyInPool(selection) ? POND_MODES.filter((mode) => mode !== 'capacity') : POND_MODES;
};

/** The families a sibling setting pinned, each with its card's red sentence. */
const forcedFamiliesOf = (selection: CapacityPondSelection): ReadonlyMap<CapacityFamilyId, string> => {
  if (!selection.enabled || !selection.retroBow) return NO_FORCED;
  return new Map(POND_FED_FAMILIES
    .filter((family) => isPinnedUnderRetro(family, selection.retroBow))
    .map((family) => [family, CAPACITY_POND_NOTES.retroProjectiles]));
};

/**
 * The pair the seed is built from, plus everything a panel needs to render
 * it honestly. Idempotent: reconciling a reconciled pair returns it unchanged
 * under either authority.
 */
const reconcileCapacityPond = (
  selection: CapacityPondSelection, authority: CapacityPondAuthority = 'pond',
): ReconciledCapacityPond => {
  const { retroBow } = selection;
  const settled = selection.enabled
    ? settle({ ...selection, capacity: withRetroBow(selection.capacity, retroBow) }, authority)
    : { enabled: false, capacity: VANILLA_CAPACITY_PROFILE, pond: pondSettingForMode('capacity', selection.pond), retroBow };
  return {
    ...settled,
    notes: notesOf(settled),
    capacityEditable: settled.enabled,
    pondEditable: settled.enabled,
    pondModes: pondModesOf(settled),
    forcedFamilies: forcedFamiliesOf(settled),
  };
};

export { POND_FED_FAMILIES, fedFamiliesOf, reconcileCapacityPond };
export type { PondFedFamily };
