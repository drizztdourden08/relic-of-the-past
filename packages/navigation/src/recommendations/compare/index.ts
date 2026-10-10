/* @layer shared-game @kind barrel */
export { classify } from './classify';
export { compareField } from './compare-field';
export { compareSet } from './compare-set';
export { compareSets } from './compare-sets';
export { eraseStrategy } from './erase-strategy';
export { eraseSetProbe } from './erase-set-probe';
export { deepEqual } from './deep-equal';
export { detectorFromStrategy } from './detector-from-strategy';
export { diffsByRecordFrom } from './diffs-by-record';
export type { UnresolvableMapper } from './detector-from-strategy.type';
export { isAbsent, known, unread } from './probe-reading';
export { defaultFormat, hex2, hex4 } from './value-format';
export { runComparison } from './run-comparison';
export { getPath, setPath } from './record-path';
export {
  allStrategies, clearStrategies, registerStrategy, strategyFor,
} from './strategy-registry';
export type { ComparisonStrategy, ErasedSetProbe, ErasedStrategy, FieldProbe, Probe, SetProbe } from './probe.type';
export type {
  Difference, DifferenceStatus, SetDifference, SetDifferenceStatus, SubjectComparison,
} from './difference.type';
