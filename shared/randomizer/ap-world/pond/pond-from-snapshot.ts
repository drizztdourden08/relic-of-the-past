/* @layer shared-game @kind logic */
/**
 * Snapshot values → a validated PondSetting, and back. Validation follows the
 * capacity reader's habits: an unknown mode falls back to the legacy pond, an
 * off-ladder price snaps to the nearest legal rung, a final price below the
 * start clamps to the start, the counts clamp into their ranges, and a free
 * sequence that does not sum to the span degrades to the equal curve. Every
 * fallback is reported so the panel can say so.
 *
 * A snapshot with NO pond row at all (every profile written before the
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
import { POND_MAX_ITEMS, POND_MAX_THROWS, POND_PRICE_LADDER } from './pond-ladder.data';
import { DEFAULT_POND_CUSTOM, DEFAULT_POND_ITEMS, LEGACY_POND_SETTING } from './pond-profile-defaults';
import { POND_MODES } from './pond-mode-switch';
import { pondKeyOf } from './pond-option-keys';
import { rungOf } from './pond-plan';
import type { CurveId, CurveShape } from '../capacity/capacity-profile.type';
import type { ApOptionValue, RandomizerOptionsSnapshot } from '../options.type';
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

const priceOf = (raw: ApOptionValue | undefined, fallback: number, notes: string[]): number => {
  const value = numberOf(raw);
  if (POND_PRICE_LADDER.includes(value)) return value;
  if (Number.isFinite(value)) {
    const snapped = POND_PRICE_LADDER[rungOf(value)];
    notes.push(`pond: ${value} is not a pond price, using ${snapped}`);
    return snapped;
  }
  return fallback;
};

const shapeOf = (values: Values, span: number, notes: string[]): CurveShape => {
  const curve = values[pondKeyOf('curve')];
  if (curve === 'free') {
    const jumps = parseFreeJumps(String(values[pondKeyOf('jumps')] ?? ''));
    if (jumps !== undefined && isValidFreeSequence(jumps, span)) return { curve: 'free', jumps };
    notes.push(`pond: the free sequence does not sum to the span ${span}, using equal`);
    return { curve: 'equal' };
  }
  if ((CURVE_IDS as readonly string[]).includes(String(curve))) return { curve: curve as CurveId };
  if (curve !== undefined) notes.push(`pond: unknown curve ${String(curve)}, using equal`);
  return { curve: 'equal' };
};

const itemsOf = (values: Values): number =>
  clamped(numberOf(values[pondKeyOf('items')]), 0, POND_MAX_ITEMS, DEFAULT_POND_ITEMS);

const customOf = (values: Values, notes: string[]): PondSetting => {
  const start = priceOf(values[pondKeyOf('start')], DEFAULT_POND_CUSTOM.start, notes);
  let max = priceOf(values[pondKeyOf('max')], DEFAULT_POND_CUSTOM.max, notes);
  if (max < start) {
    notes.push(`pond: the final price ${max} is below the first ${start}, clamping to ${start}`);
    max = start;
  }
  const span = rungOf(max) - rungOf(start);
  const throws = clamped(numberOf(values[pondKeyOf('throws')]), 1, POND_MAX_THROWS, DEFAULT_POND_CUSTOM.throws);
  const shape = shapeOf(values, Math.max(0, span), notes);
  return {
    mode: 'custom',
    start,
    max,
    throws: shape.curve === 'free' ? shape.jumps.length + 1 : throws,
    items: itemsOf(values),
    shape,
  };
};

const askedPondSetting = (values: Values): ParsedPondSetting => {
  const raw = values[pondKeyOf('mode')];
  if (raw === undefined) return { setting: LEGACY_POND_SETTING, notes: [] };
  const notes: string[] = [];
  const mode = POND_MODES.includes(raw as PondMode) ? raw as PondMode : 'capacity';
  if (mode !== raw) notes.push(`pond: unknown mode ${String(raw)}, using the vanilla pond`);
  if (mode === 'capacity') return { setting: LEGACY_POND_SETTING, notes };
  if (mode === 'custom') return { setting: customOf(values, notes), notes };
  return { setting: { mode, items: itemsOf(values) }, notes };
};

/**
 * The setting as asked for, then held to the wallet the same snapshot
 * describes (pond-wallet-top.ts): a range a stored wallet can no longer reach
 * reads as the reach itself, so an old snapshot still rolls.
 */
const parsePondSetting = (values: Values): ParsedPondSetting => {
  const asked = askedPondSetting(values);
  if (asked.setting.mode === 'capacity') return asked;
  const held = holdPondToWallet(asked.setting, pondWalletTopOf(parseCapacityProfile(values).profile));
  return { setting: held.setting, notes: [...asked.notes, ...held.notes] };
};

const pondSettingFromSnapshot = (snapshot: RandomizerOptionsSnapshot): PondSetting =>
  parsePondSetting(snapshot.values).setting;

/** The rows a setting writes: the inverse of parsePondSetting (unused fields keep their default). */
const pondValuesOf = (setting: PondSetting): Record<string, ApOptionValue> => {
  const custom = setting.mode === 'custom' ? setting : undefined;
  const items = setting.mode === 'capacity' ? DEFAULT_POND_ITEMS : setting.items;
  return {
    [pondKeyOf('mode')]: setting.mode,
    [pondKeyOf('start')]: String(custom?.start ?? DEFAULT_POND_CUSTOM.start),
    [pondKeyOf('max')]: String(custom?.max ?? DEFAULT_POND_CUSTOM.max),
    [pondKeyOf('throws')]: custom?.throws ?? DEFAULT_POND_CUSTOM.throws,
    [pondKeyOf('items')]: items,
    [pondKeyOf('curve')]: custom?.shape.curve ?? 'equal',
    [pondKeyOf('jumps')]: custom?.shape.curve === 'free' ? custom.shape.jumps.join(',') : '',
  };
};

export { parsePondSetting, pondSettingFromSnapshot, pondValuesOf };
export type { ParsedPondSetting };
