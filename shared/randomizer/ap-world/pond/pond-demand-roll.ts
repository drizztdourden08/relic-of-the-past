/* @layer shared-game @kind logic */
/**
 * One demand per rung, rolled once from the seed's own rng and recorded on the
 * placement, exactly as a shelf price is (shops/shop-price-plan.ts): the
 * access rules read the demand back, so a rung the file could never pay for is
 * out of logic and the fill has to know before it places anything.
 *
 * THE SEQUENCE COMES FIRST, THEN THE CURRENCY, THEN THE AMOUNT. The curve cuts
 * the throw sequence (pond-demand-ramp.ts), the rng says which ticked kind
 * lands on each rung, and the kind that landed there reads the rung's own
 * position into its own two ends. No ask repeats while an unused one remains
 * in any ticked row (pond-demand-brackets.ts), and a pond asking for no
 * rupees is paced by its curve alone. One ramp, four currencies: a rung halfway
 * down the sequence asks for about half of whichever one it drew. The rupee
 * range is the sequence's own two ends, so a rupee demand IS the throw's price
 * and the two can never disagree. The bomb and arrow ends come down first to
 * what the seed's capacity profile can ever hold, because an amount above that
 * could never be handed over at all.
 *
 * AN ITEM ROW NEEDS A CANDIDATE. The item kind joins the draw only while the
 * pool carries at least one name the player can hold and the core can test
 * (pond-demand-eligibility.ts). A pond with none asks in its other ticked
 * kinds, and a pond with no other kind ticked asks for nothing: its rungs are
 * free. It never names an ineligible item to fill the gap.
 *
 * AN ITEM CARRIES NO NUMBER, so it reads no curve. It walks the rungs
 * themselves instead, early names first and late names last
 * (pond-demand-item.ts), which is the ordering it has always had.
 *
 * A SINGLE CHOICE COSTS NO DRAW. With one row ticked the pick is settled
 * before the rng is asked, so a pond asking only for rupees leaves the seed's
 * stream exactly where it found it and rolls the placement every earlier
 * version of this generator rolled.
 */
import { EXPLOSIVES, PROJECTILES } from '../capacity/capacity-family';
import { reachableTopOf } from '../capacity/reachable-top';
import { POND_ASK_ROW_BY_KIND } from './pond-ask.data';
import { POND_LOCATION_SET } from './pond-locations.data';
import { amountAt, curvePositionsOf, curveWeightPositionsOf, stopsInRange } from './pond-demand-ramp';
import { distinctBrackets, shareOutKinds } from './pond-demand-brackets';
import { demandCandidatesOf, pickDemandItem } from './pond-demand-item';
import type { CapacityProfile } from '../capacity/capacity-profile.type';
import type { CurveShape } from '../capacity/capacity-profile.type';
import type { PondAskAmountKind, PondAskSetting, PondDemandView } from './pond-ask.type';
import type { PondAskRange } from './pond-demand-ramp';
import type { PondPlan } from './pond-profile.type';
import type { Rng } from '../../rng';
import type { ShopBottleContent, ShopPrice } from '../shops/shop-price.type';

/** What one ticked row can turn into: the kinds a rung may be asked in. */
type DemandKind = PondAskAmountKind | 'item';

const ceilingOf = (kind: PondAskAmountKind, capacity: CapacityProfile): number => {
  if (kind === 'bombs') return reachableTopOf(EXPLOSIVES, capacity);
  if (kind === 'arrows') return reachableTopOf(PROJECTILES, capacity);
  return Number.POSITIVE_INFINITY;
};

/**
 * The two ends one kind is asked between. Rupees take the sequence's own ends,
 * never the stored row: the plan has already held that row to the wallet and
 * to the throw count, so a demand reading the row itself could name a price no
 * throw charges.
 */
const rangeOf = (
  kind: PondAskAmountKind, ask: PondAskSetting, plan: PondPlan, capacity: CapacityProfile,
): PondAskRange => {
  const { stops } = POND_ASK_ROW_BY_KIND[kind];
  const ceiling = ceilingOf(kind, capacity);
  if (kind !== 'rupees') return { stops, min: ask[kind].min, max: ask[kind].max, ceiling };
  const prices = plan.throws.map((entry) => entry.price);
  return { stops, min: prices[0] ?? 0, max: prices[prices.length - 1] ?? 0, ceiling };
};

/** The kinds this ask can draw from, in a fixed order so a seed never depends on row order. */
const kindsOf = (ask: PondAskSetting, candidates: readonly string[]): readonly DemandKind[] => [
  ...(['rupees', 'bombs', 'arrows'] as const).filter((currency) => ask[currency].enabled),
  ...(ask.bottle.enabled && ask.bottle.contents.length > 0 ? ['bottle' as const] : []),
  ...(ask.item.enabled && candidates.length > 0 ? ['item' as const] : []),
];

/** The throw each prize is handed over on, which is the position that prize reads. */
const throwOfPrize = (plan: PondPlan): ReadonlyMap<number, number> =>
  new Map(plan.throws.map((entry, index) => [entry.prize, index]));

/**
 * The content of each bottle ask: a content no other ask of the same count
 * already names, drawn at random, so the brackets the share-out counted are
 * the asks that come out. Only once a count has used every content does it
 * name one again, and that is the filler.
 */
const bottleContentPicker = (contents: readonly ShopBottleContent[], rng: Rng) => {
  const usedByAmount = new Map<number, Set<ShopBottleContent>>();
  return (amount: number): ShopBottleContent => {
    const used = usedByAmount.get(amount) ?? new Set<ShopBottleContent>();
    usedByAmount.set(amount, used);
    const open = contents.filter((content) => !used.has(content));
    const from = open.length > 0 ? open : contents;
    const content = from.length === 1 ? from[0] : from[rng.int(from.length)];
    used.add(content);
    return content;
  };
};

/** How many distinct asks one kind brings: its prices, its stops in range, or its names. */
const bracketCountOf = (
  kind: DemandKind, ask: PondAskSetting, plan: PondPlan, capacity: CapacityProfile, candidates: readonly string[],
): number => {
  if (kind === 'item') return candidates.length;
  if (kind === 'rupees') return new Set(plan.throws.map((entry) => entry.price)).size;
  // A bottle ask is a count AND a content, so two bottles of a bee and two of a fairy are two asks.
  const contents = kind === 'bottle' ? ask.bottle.contents.length : 1;
  return stopsInRange(rangeOf(kind, ask, plan, capacity)).length * contents;
};

const rollPondDemands = (
  plan: PondPlan, ask: PondAskSetting, shape: CurveShape, rng: Rng,
  capacity: CapacityProfile, itemPool: readonly string[],
): PondDemandView => {
  // A pond whose prizes are its own two vanilla grants has no ladder and no
  // throw, so it asks for nothing; only the numbered rungs carry a demand.
  const rungs = plan.locations
    .map((name, prize) => ({ name, prize }))
    .filter((rung) => POND_LOCATION_SET.has(rung.name));
  const candidates = ask.item.enabled ? demandCandidatesOf(itemPool) : [];
  const kinds = kindsOf(ask, candidates);
  const view: Record<string, ShopPrice> = {};
  if (rungs.length === 0 || kinds.length === 0) return view;
  // Rupees are the throws' own prices, so only a pond asking for them reads the price walk.
  const positions = ask.rupees.enabled
    ? curvePositionsOf(plan, shape)
    : curveWeightPositionsOf(shape, plan.throws.length);
  const throwAt = throwOfPrize(plan);
  const positionOf = (prize: number): number => positions[throwAt.get(prize) ?? 0] ?? 0;
  const assigned = shareOutKinds(
    kinds, (kind) => bracketCountOf(kind, ask, plan, capacity, candidates), rungs.length, rng,
  );
  const amounts = new Map<number, number>();
  (['bombs', 'arrows', 'bottle'] as const).forEach((kind) => {
    const mine = rungs.map((rung, index) => ({ ...rung, index })).filter(({ index }) => assigned[index] === kind);
    if (mine.length === 0) return;
    const stops = stopsInRange(rangeOf(kind, ask, plan, capacity));
    const width = kind === 'bottle' ? ask.bottle.contents.length : 1;
    const picks = distinctBrackets(mine.map(({ prize }) => positionOf(prize)), stops.length * width);
    mine.forEach(({ index }, at) => amounts.set(index, stops[Math.floor(picks[at] / width)]));
  });
  const bottleContentOf = bottleContentPicker(ask.bottle.contents, rng);
  const usedItems = new Set<string>();
  rungs.forEach(({ name, prize }, index) => {
    const kind = assigned[index];
    if (kind === 'item') {
      const rank = rungs.length === 1 ? 0 : index / (rungs.length - 1);
      const itemName = pickDemandItem(candidates, rank, rng, usedItems);
      usedItems.add(itemName);
      view[name] = { currency: 'item', itemName };
      return;
    }
    if (kind === 'rupees') {
      view[name] = { currency: 'rupees', amount: amountAt(rangeOf(kind, ask, plan, capacity), positionOf(prize)) };
      return;
    }
    const amount = amounts.get(index) ?? 0;
    view[name] = kind === 'bottle'
      ? { currency: 'bottle', amount, content: bottleContentOf(amount) }
      : { currency: kind, amount };
  });
  return view;
};

export { rollPondDemands };
