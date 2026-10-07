/* @layer shared-game @kind logic */
/**
 * Snapshot values → one pond's validated PondSetting, and back. Validation
 * follows the capacity reader's habits: an unknown mode falls back to the
 * legacy pond, an off-ladder price snaps to the nearest legal rung, a final
 * price below the start clamps to the start, the counts clamp into their
 * ranges, and a free sequence that does not sum to the span degrades to the
 * equal curve. Every fallback is reported, under the pond's own name, so the
 * panel can say which pond it applies to.
 *
 * A snapshot with NO row for this pond (every profile written before the
 * option existed) reads as the legacy pond, so a stored placement keeps
 * meaning exactly what it meant when it was generated.
 *
 * Every active reading is then held to the wallet the same snapshot
 * describes, so a price the wallet can never hold is never handed to the
 * generator (pond-wallet-top.ts).
 */
import { parseCapacityProfile } from '../capacity/capacity-profile-from-snapshot';
import { CURVE_IDS } from '../capacity/curves/curves.data';
import { isValidFreeSequence, parseFreeJumps } from '../capacity/curves/free-sequence';
import { holdPondToWallet, pondWalletTopOf } from './pond-wallet-top';
import { CAPACITY_POND } from './pond-instances.data';
import { POND_MAX_ITEMS, POND_MAX_THROWS, POND_PRICE_LADDER } from './pond-ladder.data';
import { DEFAULT_POND_CUSTOM, DEFAULT_POND_ITEMS, LEGACY_POND_SETTING } from './pond-profile-defaults';
import { POND_MODES } from './pond-mode-switch';
import { pondKeyOf } from './pond-option-keys';
import { pondAskMaxKeyOf, pondAskMinKeyOf } from './pond-ask-keys';
import { parsePondAsk, pondAskValuesOf } from './pond-ask-from-snapshot';
import { withMigratedPondKeys } from './pond-key-migration.data';
import { rungOf } from './pond-plan';
import type { CurveId, CurveShape } from '../capacity/capacity-profile.type';
import type { ApOptionValue, RandomizerOptionsSnapshot } from '../options.type';
import type { PondAskSetting } from './pond-ask.type';
import type { PondInstance } from './pond-instance.type';
import type { PondMode, PondSetting } from './pond-profile.type';

type Values = Readonly<Record<string, ApOptionValue | undefined>>;

interface ParsedPondSetting {
  setting: PondSetting;
  /** One line per fallback applied. */
  notes: readonly string[];
}

const numberOf = (value: ApOptionValue | undefined): number =>
  typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : Number.NaN;

const clamped = (value: number, low: number, high: number, fallback: number): number =>
  (Number.isFinite(value) ? Math.min(high, Math.max(low, Math.floor(value))) : fallback);

const priceOf = (raw: ApOptionValue | undefined, fallback: number, pond: PondInstance, notes: string[]): number => {
  const value = numberOf(raw);
  if (POND_PRICE_LADDER.includes(value)) return value;
  if (Number.isFinite(value)) {
    const snapped = POND_PRICE_LADDER[rungOf(value)];
    notes.push(`${pond.label}: ${value} is not a pond price, using ${snapped}`);
    return snapped;
  }
  return fallback;
};

const shapeOf = (values: Values, pond: PondInstance, span: number, notes: string[]): CurveShape => {
  const curve = values[pondKeyOf(pond, 'curve')];
  if (curve === 'free') {
    const jumps = parseFreeJumps(String(values[pondKeyOf(pond, 'jumps')] ?? ''));
    if (jumps !== undefined && isValidFreeSequence(jumps, span)) return { curve: 'free', jumps };
    notes.push(`${pond.label}: the free sequence does not sum to the span ${span}, using equal`);
    return { curve: 'equal' };
  }
  if ((CURVE_IDS as readonly string[]).includes(String(curve))) return { curve: curve as CurveId };
  if (curve !== undefined) notes.push(`${pond.label}: unknown curve ${String(curve)}, using equal`);
  return { curve: 'equal' };
};

const itemsOf = (values: Values, pond: PondInstance): number =>
  clamped(numberOf(values[pondKeyOf(pond, 'items')]), 0, POND_MAX_ITEMS, DEFAULT_POND_ITEMS);

const customOf = (values: Values, pond: PondInstance, notes: string[]): PondSetting => {
  const start = priceOf(values[pondAskMinKeyOf(pond, 'rupees')], DEFAULT_POND_CUSTOM.start, pond, notes);
  let max = priceOf(values[pondAskMaxKeyOf(pond, 'rupees')], DEFAULT_POND_CUSTOM.max, pond, notes);
  if (max < start) {
    notes.push(`${pond.label}: the final price ${max} is below the first ${start}, clamping to ${start}`);
    max = start;
  }
  const span = rungOf(max) - rungOf(start);
  const throws = clamped(
    numberOf(values[pondKeyOf(pond, 'throws')]), 1, POND_MAX_THROWS, DEFAULT_POND_CUSTOM.throws);
  const shape = shapeOf(values, pond, Math.max(0, span), notes);
  const ask = parsePondAsk(values, pond, { min: start, max });
  return {
    mode: 'custom',
    start,
    max,
    throws: shape.curve === 'free' ? shape.jumps.length + 1 : throws,
    items: itemsOf(values, pond),
    shape,
    ...(ask === undefined ? {} : { ask }),
  };
};

/** The ask rows of a mode whose prices are a fixed schedule; its rupee ends are that schedule's. */
const fixedAskOf = (values: Values, pond: PondInstance): PondAskSetting | undefined => parsePondAsk(
  values, pond,
  {
    min: numberOf(values[pondAskMinKeyOf(pond, 'rupees')]) || 0,
    max: numberOf(values[pondAskMaxKeyOf(pond, 'rupees')]) || 0,
  },
);

const askedPondSetting = (values: Values, pond: PondInstance): ParsedPondSetting => {
  const raw = values[pondKeyOf(pond, 'mode')];
  if (raw === undefined) return { setting: LEGACY_POND_SETTING, notes: [] };
  const notes: string[] = [];
  const mode = POND_MODES.includes(raw as PondMode) ? raw as PondMode : 'capacity';
  if (mode !== raw) notes.push(`${pond.label}: unknown mode ${String(raw)}, using the vanilla pond`);
  if (mode === 'capacity') return { setting: LEGACY_POND_SETTING, notes };
  if (mode === 'custom') return { setting: customOf(values, pond, notes), notes };
  const ask = fixedAskOf(values, pond);
  return { setting: { mode, items: itemsOf(values, pond), ...(ask === undefined ? {} : { ask }) }, notes };
};

/**
 * The setting as asked for, then held to the wallet the same snapshot
 * describes (pond-wallet-top.ts): a range a stored wallet can no longer reach
 * reads as the reach itself, so an old snapshot still rolls.
 */
const parsePondSetting = (raw: Values, pond: PondInstance = CAPACITY_POND): ParsedPondSetting => {
  // Every reading starts from the current spelling, so one snapshot cannot be
  // read one way here and another way through the three-pond reader.
  const values = withMigratedPondKeys(raw);
  const asked = askedPondSetting(values, pond);
  if (asked.setting.mode === 'capacity') return asked;
  const held = holdPondToWallet(asked.setting, pondWalletTopOf(parseCapacityProfile(values).profile), pond);
  return { setting: held.setting, notes: [...asked.notes, ...held.notes] };
};

const pondSettingFromSnapshot = (
  snapshot: RandomizerOptionsSnapshot, pond: PondInstance = CAPACITY_POND,
): PondSetting => parsePondSetting(snapshot.values, pond).setting;

/** The rows one pond's setting writes: the inverse of parsePondSetting (unused fields keep their default). */
const pondValuesOf = (
  setting: PondSetting, pond: PondInstance = CAPACITY_POND,
): Record<string, ApOptionValue> => {
  const custom = setting.mode === 'custom' ? setting : undefined;
  const items = setting.mode === 'capacity' ? DEFAULT_POND_ITEMS : setting.items;
  return {
    ...pondAskValuesOf(setting, pond),
    [pondKeyOf(pond, 'mode')]: setting.mode,
    [pondAskMinKeyOf(pond, 'rupees')]: String(custom?.start ?? DEFAULT_POND_CUSTOM.start),
    [pondAskMaxKeyOf(pond, 'rupees')]: String(custom?.max ?? DEFAULT_POND_CUSTOM.max),
    [pondKeyOf(pond, 'throws')]: custom?.throws ?? DEFAULT_POND_CUSTOM.throws,
    [pondKeyOf(pond, 'items')]: items,
    [pondKeyOf(pond, 'curve')]: custom?.shape.curve ?? 'equal',
    [pondKeyOf(pond, 'jumps')]: custom?.shape.curve === 'free' ? custom.shape.jumps.join(',') : '',
  };
};

export { parsePondSetting, pondSettingFromSnapshot, pondValuesOf };
export type { ParsedPondSetting, Values };
