/* @layer shared-game @kind logic */
import { itemAt } from '../../../checked-access';
import { isValidFreeSequence } from '../../capacity/curves/free-sequence';
import { POND_PRICE_LADDER } from '../pond-ladder.constants';
import { pondCeilingRungOf } from './pond-ceiling-rung-of';
import type { PondInstance } from '../pond-instance.type';
import type { PondCustomSetting } from '../pond-profile.type';
import type { HeldPondSetting } from '../pond.type';

const priceLabel = (price: number): string => (price === 0 ? 'free' : String(price));

const holdCustom = (setting: PondCustomSetting, walletTop: number, pond: PondInstance): HeldPondSetting => {
  const ceiling = itemAt(POND_PRICE_LADDER, pondCeilingRungOf(walletTop));
  if (setting.max <= ceiling) return { setting, notes: [] };
  const notes = [
    `${pond.label}: the wallet tops out at ${walletTop}, so the price range is held at ${priceLabel(ceiling)}`,
  ];
  const start = Math.min(setting.start, ceiling);
  const span = POND_PRICE_LADDER.indexOf(ceiling) - POND_PRICE_LADDER.indexOf(start);
  const keepsFree = setting.shape.curve === 'free' && isValidFreeSequence(setting.shape.jumps, span);
  if (setting.shape.curve === 'free' && !keepsFree) {
    notes.push(`${pond.label}: the free sequence no longer sums to the span ${span}, using equal`);
  }
  const shape = keepsFree ? setting.shape : { curve: 'equal' as const };
  return { setting: { ...setting, start, max: ceiling, shape }, notes };
};

export { holdCustom };
