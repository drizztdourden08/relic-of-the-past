/* @layer shared-game @kind logic */
import { maxSpanOf } from '../capacity-family';
import { capacityKeyOf } from '../capacity-option-keys';
import { maxFloorReasonOf } from '../max-floor-reason-of';
import { maxRungFloorOf } from '../max-rung-floor-of';
import { optionNumberOf } from '../option-number-of';
import { curveShapeOf } from './curve-shape-of';
import type { CapacityFamily } from '../capacity-family';
import type { FamilySetting } from '../capacity-profile.type';
import type { WalletFloor } from '../wallet-floor/wallet-floor.type';
import type { OptionValue, PartialOptionValues } from '../../options.type';

const ladderValue = (capacityFamily: CapacityFamily, raw: OptionValue | undefined, fallback: number, notes: string[]): number => {
  const value = optionNumberOf(raw);
  if (capacityFamily.ladder.includes(value)) return value;
  notes.push(`${capacityFamily.id}: ${String(raw)} is not on the ladder, using ${fallback}`);
  return fallback;
};

const nonCustomSetting = (id: CapacityFamily['id'], mode: OptionValue | undefined, notes: string[]): FamilySetting => {
  if (mode === 'vanilla-in-pool') {
    if (id !== 'wallet') return { mode: 'vanilla-in-pool' };
    notes.push('wallet: has no vanilla upgrades to pool, using vanilla');
    return { mode: 'vanilla' };
  }
  if (mode !== undefined && mode !== 'vanilla') notes.push(`${id}: unknown mode ${String(mode)}, using vanilla`);
  return { mode: 'vanilla' };
};

const familySettingOf = (
  capacityFamily: CapacityFamily, values: PartialOptionValues, notes: string[], walletFloor: WalletFloor,
): FamilySetting => {
  const { id, ladder, defaultCount } = capacityFamily;
  const mode = values[capacityKeyOf(id, 'mode')];
  if (mode !== 'custom') return nonCustomSetting(id, mode, notes);
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
  const rawCount = optionNumberOf(values[capacityKeyOf(id, 'count')]);
  const count = Number.isFinite(rawCount) ? Math.floor(rawCount) : Math.min(defaultCount, maxSpanOf(capacityFamily));
  const shape = curveShapeOf(capacityFamily, values, span, notes);
  return { mode: 'custom', start, max, count: shape.curve === 'free' ? shape.jumps.length : count, shape };
};

export { familySettingOf };
