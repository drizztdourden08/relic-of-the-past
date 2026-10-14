/* @layer shared-game @kind logic */
import { itemAt } from '../../checked-access';
import { itemKeyName } from '../display-names/item-key-name';
import { POND_LOCATION_SET } from './pond-rungs';
import { amountAt, curvePositionsOf, curveWeightPositionsOf, stopsInRange } from './pond-demand-ramp';
import { shareOutKinds } from './share-out-kinds';
import { distinctBrackets } from './distinct-brackets';
import { demandCandidatesOf, pickDemandItem } from './pond-demand-item';
import { demandRangeOf } from './demand-range-of';
import { demandKindsOf } from './demand-kinds-of';
import { bottleContentPicker } from './bottle-content-picker';
import { bracketCountOf } from './bracket-count-of';
import type { ItemKey } from '../item-ids';
import type { CapacityProfile, CurveShape } from '../capacity/capacity-profile.type';
import type { PondAskSetting, PondDemandView } from './pond-ask.type';
import type { PondPlan } from './pond-profile.type';
import type { Rng } from '../../rng';
import type { ShopPrice } from '../shops/shop-price.type';

const stopForPick = (stops: readonly number[], pick: number | undefined, width: number): number =>
  (pick === undefined ? 0 : stops[Math.floor(pick / width)] ?? 0);

const rollPondDemands = (
  plan: PondPlan, ask: PondAskSetting, shape: CurveShape, rng: Rng,
  capacity: CapacityProfile, itemPool: readonly ItemKey[],
): PondDemandView => {
  const rungs = plan.locations
    .map((key, prize) => ({ key, prize }))
    .filter((rung) => POND_LOCATION_SET.has(rung.key));
  const candidates = ask.item.enabled ? demandCandidatesOf(itemPool) : [];
  const kinds = demandKindsOf(ask, candidates);
  const view: Record<string, ShopPrice> = {};
  if (rungs.length === 0 || kinds.length === 0) return view;
  const positions = ask.rupees.enabled
    ? curvePositionsOf(plan, shape)
    : curveWeightPositionsOf(shape, plan.throws.length);
  const throwAt = new Map(plan.throws.map((entry, index) => [entry.prize, index]));
  const positionOf = (prize: number): number => positions[throwAt.get(prize) ?? 0] ?? 0;
  const assigned = shareOutKinds(
    kinds, (kind) => bracketCountOf(kind, { ask, plan, capacity }, candidates), rungs.length, rng,
  );
  const amounts = new Map<number, number>();
  (['bombs', 'arrows', 'bottle'] as const).forEach((kind) => {
    const mine = rungs.map((rung, index) => ({ ...rung, index })).filter(({ index }) => assigned[index] === kind);
    if (mine.length === 0) return;
    const stops = stopsInRange(demandRangeOf(kind, ask, plan, capacity));
    const width = kind === 'bottle' ? ask.bottle.contents.length : 1;
    const picks = distinctBrackets(mine.map(({ prize }) => positionOf(prize)), stops.length * width);
    mine.forEach(({ index }, at) => amounts.set(index, stopForPick(stops, picks[at], width)));
  });
  const bottleContentOf = bottleContentPicker(ask.bottle.contents, rng);
  const usedItems = new Set<ItemKey>();
  rungs.forEach(({ key, prize }, index) => {
    const kind = itemAt(assigned, index);
    if (kind === 'item') {
      const rank = rungs.length === 1 ? 0 : index / (rungs.length - 1);
      const demanded = pickDemandItem(candidates, rank, rng, usedItems);
      usedItems.add(demanded);
      view[key] = { currency: 'item', itemName: itemKeyName(demanded) };
      return;
    }
    if (kind === 'rupees') {
      view[key] = { currency: 'rupees', amount: amountAt(demandRangeOf(kind, ask, plan, capacity), positionOf(prize)) };
      return;
    }
    const amount = amounts.get(index) ?? 0;
    view[key] = kind === 'bottle'
      ? { currency: 'bottle', amount, content: bottleContentOf(amount) }
      : { currency: kind, amount };
  });
  return view;
};

export { rollPondDemands };
