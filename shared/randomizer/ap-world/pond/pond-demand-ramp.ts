/* @layer shared-game @kind logic */
/**
 * ONE RAMP, read by every currency.
 *
 * The curve cuts the pond's throw sequence once, and a throw's POSITION is how
 * far down that cut it stands: 0 at the first throw, 1 at the last. Every
 * demand carrying a number reads that same position and lands it in its own
 * two ends, so a rung halfway down the sequence asks for about half of
 * whatever currency it drew, and two rungs standing at one position ask for
 * the same share of two different ranges.
 *
 * THE POSITIONS COME FROM THE PLAN'S OWN WALK down the price ladder, which is
 * the sequence the curve already cut (pond-plan.ts). A rupee demand therefore
 * reads back onto the plan's own prices exactly, rung for rung, so the amount
 * she asks for and the amount the throw costs can never be two numbers.
 *
 * A FLAT SCHEDULE HAS NO WALK. Vanilla cost charges the same hundred every
 * throw, and a Custom ladder whose two ends are one price does the same, so
 * there is nothing to read a position off. The curve's own weights say where
 * each throw stands instead, which is the same shape at full resolution.
 */
import { CURVES } from '../capacity/curves/curves.data';
import { rungOf } from './pond-plan';
import type { CurveShape } from '../capacity/capacity-profile.type';
import type { PondPlan } from './pond-profile.type';

/** The stops one demand is drawn from, and the two ends it is drawn between. */
interface PondAskRange {
  stops: readonly number[];
  min: number;
  max: number;
  /** The most a file can ever hold of this; both ends come down to it first. */
  ceiling: number;
}

/** The nearest stop at or above an amount; the top stop when it runs past the ladder. */
const stopIndexOf = (stops: readonly number[], amount: number): number => {
  const above = stops.findIndex((stop) => stop >= amount);
  return above === -1 ? stops.length - 1 : above;
};

/** One position per entry, whatever the sequence handed in is long. */
const spread = (positions: readonly number[], count: number): number[] =>
  Array.from({ length: count }, (_, index) => positions[Math.min(index, positions.length - 1)]);

/** The curve's own weights, as the share of the whole climb standing before each throw. */
const weightPositions = (shape: CurveShape, count: number): number[] => {
  const weights = shape.curve === 'free' ? shape.jumps : CURVES[shape.curve](count - 1);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  let walked = 0;
  const climbed = weights.map((weight) => {
    walked += weight;
    return walked / total;
  });
  return spread([0, ...climbed], count);
};

/**
 * Where each throw stands on the curve alone, with no price walk to read: a
 * pond that asks for no rupees paces its throws by its curve, never by a
 * rupee range it does not use.
 */
const curveWeightPositionsOf = (shape: CurveShape, count: number): readonly number[] =>
  (count <= 1 ? Array<number>(count).fill(0) : weightPositions(shape, count));

/** Where each throw of one plan stands on the curve, 0 at the first and 1 at the last. */
const curvePositionsOf = (plan: PondPlan, shape: CurveShape): readonly number[] => {
  const count = plan.throws.length;
  if (count <= 1) return Array<number>(count).fill(0);
  const walk = plan.throws.map((entry) => rungOf(entry.price));
  const span = walk[count - 1] - walk[0];
  if (span <= 0) return weightPositions(shape, count);
  return walk.map((rung) => (rung - walk[0]) / span);
};

/**
 * The amount one position stands for inside a range. Both ends come down to
 * the ceiling first, so a range whose floor stands above what the profile can
 * hold asks for the ceiling itself instead of dropping the row the player
 * ticked.
 */
/** Every stop between a range's two ends, both held to the ceiling: the brackets one row offers. */
const stopsInRange = (range: PondAskRange): readonly number[] => {
  const { stops, min, max, ceiling } = range;
  const low = stopIndexOf(stops, Math.min(min, ceiling));
  const high = stopIndexOf(stops, Math.min(max, ceiling));
  return stops.slice(low, Math.max(low, high) + 1);
};

const amountAt = (range: PondAskRange, position: number): number => {
  const { stops, min, max, ceiling } = range;
  const low = stopIndexOf(stops, Math.min(min, ceiling));
  const high = stopIndexOf(stops, Math.min(max, ceiling));
  const span = Math.max(0, high - low);
  return stops[low + Math.round(position * span)];
};

export { amountAt, curvePositionsOf, curveWeightPositionsOf, stopIndexOf, stopsInRange };
export type { PondAskRange };
