/* @layer shared-game @kind barrel */
export { compareSet, compareSets } from './compare-sets';
export { deepEqual } from './deep-equal';
export { detectorFromStrategy } from './detector-from-strategy';
export { diffsByRecordFrom } from './diffs-by-record';
export type { UnresolvableMapper } from './detector-from-strategy';
export { defaultFormat, hex2, hex4, isAbsent, known, unread } from './probe-helpers';
export { classify, compareField, runComparison } from './run-comparison';
export { getPath, setPath } from './set-path';
export {
  allStrategies, clearStrategies, registerStrategy, strategyFor,
} from './strategy-registry';
export type { ComparisonStrategy, FieldProbe, Probe, SetProbe } from './probe.types';
export type {
  Difference, DifferenceStatus, SetDifference, SetDifferenceStatus, SubjectComparison,
} from './difference.types';
