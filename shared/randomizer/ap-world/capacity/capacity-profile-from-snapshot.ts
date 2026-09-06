/* @layer shared-game @kind logic */
/**
 * Snapshot values → a validated CapacityProfile, and back. Validation: an
 * unknown mode is vanilla (the wallet can never be in pool); off-ladder
 * values fall back to the family default (vanilla rung → top of the ladder); max
 * below start clamps to start (no span, no items); the count is clamped at
 * derivation; a free sequence that does not sum to the span, or carries a
 * jump above the family's largest item, degrades to equal; the meter's curve is always equal. Every fallback is reported so
 * the panel can say so. A snapshot without the v2 rows (a v1 profile that
 * skipped normalization) resolves through the legacy toggle. A projectiles
 * max below the final fight's floor is raised onto it, as is a wallet max
 * below what these settings let the seed charge at once (max-floor.ts and
 * wallet-floor.ts). A
 * snapshot with retro bow on reads its projectiles family as Vanilla
 * (retro-projectiles.ts), so the generator and the pool accounting see the
 * family the seed is really built with.
 */
import { RETRO_BOW_KEY } from '../retro/retro-bow.data';
import { CURVE_IDS } from './curves/curves.data';
import { parseFreeJumps, isValidFreeSequence } from './curves/free-sequence';
import { FAMILIES, familyById, maxSpanOf } from './capacity-family';
import {
  CAPACITY_ENABLED_KEY, CAPACITY_PROGRESSIVE_KEY, LEGACY_CAPACITY_KEY, capacityFieldsOf, capacityKeyOf,
} from './capacity-option-keys';
import { legacyCapacityProfile } from './capacity-profile-defaults';
import { maxFloorReasonOf, maxRungFloorOf } from './max-floor';
import { walletFloorOf } from './wallet-floor';
import { withRetroBow } from './retro-projectiles';
import type { CapacityFamily } from './capacity-family';
import type { WalletFloor } from './wallet-floor';
import type {
  CapacityFamilyId, CapacityProfile, CurveId, CurveShape, FamilySetting, WalletSetting,
} from './capacity-profile.type';
import type { ApOptionValue, RandomizerOptionsSnapshot } from '../options.type';

type Values = Readonly<Record<string, ApOptionValue | undefined>>;

interface ParsedCapacityProfile {
  profile: CapacityProfile;
  /** One line per fallback applied, keyed by the family it concerns. */
  notes: readonly string[];
}

const numberOf = (value: ApOptionValue | undefined): number =>
  typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : Number.NaN;

const ladderValue = (capacityFamily: CapacityFamily, raw: ApOptionValue | undefined, fallback: number, notes: string[]): number => {
  const value = numberOf(raw);
  if (capacityFamily.ladder.includes(value)) return value;
  notes.push(`${capacityFamily.id}: ${String(raw)} is not on the ladder, using ${fallback}`);
  return fallback;
};

const shapeOf = (capacityFamily: CapacityFamily, values: Values, span: number, notes: string[]): CurveShape => {
  if (!capacityFieldsOf(capacityFamily.id).includes('curve')) return { curve: 'equal' };
  const curve = values[capacityKeyOf(capacityFamily.id, 'curve')];
  if (curve === 'free') {
    const jumps = parseFreeJumps(String(values[capacityKeyOf(capacityFamily.id, 'jumps')] ?? ''));
    if (jumps !== undefined && isValidFreeSequence(jumps, span, capacityFamily.maxJump)) return { curve: 'free', jumps };
    const reason = jumps?.some((jump) => jump > capacityFamily.maxJump)
      ? `carries a jump above ${capacityFamily.maxJump}`
      : `does not sum to the span ${span}`;
    notes.push(`${capacityFamily.id}: the free sequence ${reason}, using equal`);
    return { curve: 'equal' };
  }
  if ((CURVE_IDS as readonly string[]).includes(String(curve))) return { curve: curve as CurveId };
  if (curve !== undefined) notes.push(`${capacityFamily.id}: unknown curve ${String(curve)}, using equal`);
  return { curve: 'equal' };
};

const settingOf = (
  capacityFamily: CapacityFamily, values: Values, notes: string[], walletFloor: WalletFloor,
): FamilySetting => {
  const { id, ladder, defaultCount } = capacityFamily;
  const mode = values[capacityKeyOf(id, 'mode')];
  if (mode === 'vanilla-in-pool') {
    if (id !== 'wallet') return { mode: 'vanilla-in-pool' };
    notes.push('wallet: has no vanilla upgrades to pool, using vanilla');
    return { mode: 'vanilla' };
  }
  if (mode !== 'custom') {
    if (mode !== undefined && mode !== 'vanilla') notes.push(`${id}: unknown mode ${String(mode)}, using vanilla`);
    return { mode: 'vanilla' };
  }
  const start = ladderValue(capacityFamily, values[capacityKeyOf(id, 'start')], ladder[capacityFamily.vanillaRung], notes);
  let max = ladderValue(capacityFamily, values[capacityKeyOf(id, 'max')], ladder[ladder.length - 1], notes);
  if (max < start) {
    notes.push(`${id}: max ${max} is below start ${start}, clamping to ${start}`);
    max = start;
  }
  const floor = ladder[maxRungFloorOf(capacityFamily, walletFloor)];
  if (max < floor) {
    const why = maxFloorReasonOf(capacityFamily, walletFloor) ?? 'the seed asks for more';
    notes.push(`${id}: max ${max} is below the floor (${why}), using ${floor}`);
    max = floor;
  }
  const span = capacityFamily.indexOf(max) - capacityFamily.indexOf(start);
  const rawCount = numberOf(values[capacityKeyOf(id, 'count')]);
  const count = Number.isFinite(rawCount) ? Math.floor(rawCount) : Math.min(defaultCount, maxSpanOf(capacityFamily));
  const shape = shapeOf(capacityFamily, values, span, notes);
  return { mode: 'custom', start, max, count: shape.curve === 'free' ? shape.jumps.length : count, shape };
};

const hasCapacityRows = (values: Values): boolean =>
  FAMILIES.some((capacityFamily) => values[capacityKeyOf(capacityFamily.id, 'mode')] !== undefined);

/** The retro switch of a snapshot: only an explicit true pins the projectiles family. */
const retroBowOf = (values: Values): boolean => values[RETRO_BOW_KEY] === true;

const parseCapacityProfile = (values: Values): ParsedCapacityProfile => {
  const retroBow = retroBowOf(values);
  if (!hasCapacityRows(values)) {
    return { profile: withRetroBow(legacyCapacityProfile(values[LEGACY_CAPACITY_KEY] === true), retroBow), notes: [] };
  }
  const notes: string[] = [];
  // What the settings let the seed charge at once, read before any family: it
  // is the wallet's own floor and it depends on no family's setting.
  const walletFloor = walletFloorOf(values);
  const profile: CapacityProfile = {
    explosives: settingOf(familyById('explosives'), values, notes, walletFloor),
    projectiles: settingOf(familyById('projectiles'), values, notes, walletFloor),
    meter: settingOf(familyById('meter'), values, notes, walletFloor),
    wallet: settingOf(familyById('wallet'), values, notes, walletFloor) as WalletSetting,
  };
  return { profile: withRetroBow(profile, retroBow), notes };
};

const capacityProfileFromSnapshot = (snapshot: RandomizerOptionsSnapshot): CapacityProfile =>
  parseCapacityProfile(snapshot.values).profile;

/**
 * The master switch of a snapshot: only an explicit false turns the feature
 * off. An absent key is a snapshot written before the switch existed, and
 * those played with the families they recorded, so they read as on.
 */
const capacityEnabledOf = (values: Values): boolean => values[CAPACITY_ENABLED_KEY] !== false;

const capacityEnabledFromSnapshot = (snapshot: RandomizerOptionsSnapshot): boolean =>
  capacityEnabledOf(snapshot.values);

/** The progressive switch of a snapshot: only an explicit true turns it on (an absent key is the fixed-jump pool). */
const capacityProgressiveOf = (values: Values): boolean => values[CAPACITY_PROGRESSIVE_KEY] === true;

const capacityProgressiveFromSnapshot = (snapshot: RandomizerOptionsSnapshot): boolean =>
  capacityProgressiveOf(snapshot.values);

/** The rows a profile writes — the inverse of parseCapacityProfile (unknown fields keep the family default). */
const capacityValuesOf = (profile: CapacityProfile): Record<string, ApOptionValue> => {
  const values: Record<string, ApOptionValue> = {};
  for (const capacityFamily of FAMILIES) {
    const { id, ladder, vanillaRung, defaultCount } = capacityFamily;
    const setting = profile[id];
    const custom = setting.mode === 'custom' ? setting : undefined;
    const fields: Record<string, ApOptionValue> = {
      mode: setting.mode,
      start: String(custom?.start ?? ladder[vanillaRung]),
      max: String(custom?.max ?? ladder[ladder.length - 1]),
      count: custom?.count ?? Math.min(defaultCount, maxSpanOf(capacityFamily)),
      curve: custom?.shape.curve ?? 'equal',
      jumps: custom?.shape.curve === 'free' ? custom.shape.jumps.join(',') : '',
    };
    for (const field of capacityFieldsOf(id as CapacityFamilyId)) values[capacityKeyOf(id, field)] = fields[field];
  }
  return values;
};

export {
  capacityEnabledFromSnapshot, capacityEnabledOf, capacityProfileFromSnapshot, capacityProgressiveFromSnapshot,
  capacityProgressiveOf, capacityValuesOf, parseCapacityProfile,
};
export type { ParsedCapacityProfile };
