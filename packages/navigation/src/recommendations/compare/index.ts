/* @layer shared-game @kind barrel */
export { eraseSetProbe } from './erase-set-probe';
export { detectorFromStrategy } from './detector-from-strategy';
export { diffsByRecordFrom } from './diffs-by-record';
export type { UnresolvableMapper } from './detector-from-strategy.type';
export { known, unread } from './probe-reading';
export {
  allStrategies,
  registerStrategy,
} from './strategy-registry';
export type { ComparisonStrategy, ErasedSetProbe, FieldProbe, Probe, SetProbe } from './probe.type';
export type {
  Difference,
} from './difference.type';
