/* @layer shared-game @kind logic */
import { itemAt } from '../../../checked-access';
import { POND_ASK_ROW_BY_KIND } from '../pond-ask';
import { pondAskMaxKeyOf, pondAskMinKeyOf } from '../pond-ask-keys';
import type { PartialOptionValues } from '../../options.type';
import type { PondAskAmountKind } from '../pond-ask.type';
import type { PondInstance } from '../pond-instance.type';
import type { AskRange } from '../pond.type';

const numberAt = (values: PartialOptionValues, key: string, fallback: number): number => {
  const value = values[key];
  const asked = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(asked) ? Math.floor(asked) : fallback;
};

const askRangeOf = (values: PartialOptionValues, pond: PondInstance, kind: PondAskAmountKind): AskRange => {
  const { stops, defaultMin, defaultMax } = POND_ASK_ROW_BY_KIND[kind];
  const floor = itemAt(stops, 0);
  const ceiling = itemAt(stops, stops.length - 1);
  const low = numberAt(values, pondAskMinKeyOf(pond, kind), defaultMin);
  const high = numberAt(values, pondAskMaxKeyOf(pond, kind), defaultMax);
  const held = (amount: number): number => Math.min(ceiling, Math.max(floor, amount));
  return { min: held(Math.min(low, high)), max: held(Math.max(low, high)) };
};

export { askRangeOf };
